import express from 'express';
import Redis from 'ioredis';

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function otpKey(phone) {
    return `otp:${phone}`;
}

app.post('/send-otp', async (req, res) => {
    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    const otp = generateOTP();
    await redis.set(otpKey(phone), otp, 'EX', 60);
    console.log(`OTP for ${phone}: ${otp}`);
    res.json({ message: 'OTP sent successfully' });
});

app.post('/verify-otp', async (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP are required' });
    }
    const storedOtp = await redis.get(otpKey(phone));
    if (storedOtp === otp) {
        await redis.del(otpKey(phone));
        res.json({ message: 'OTP verified successfully' });
    }
    else {
        res.status(400).json({ error: 'Invalid OTP' });
    }
});

app.get('/otp/:phone/ttl', (req, res) => {
    const phone = req.params.phone;
    redis.ttl(otpKey(phone)).then(ttl => {
        if (ttl === -2) {
            res.json({ message: 'No OTP found for this phone number' });
        } else if (ttl === -1) {
            res.json({ message: 'OTP exists but has no expiration' });
        } else {
            res.json({ ttl });
        }
    }
    ).catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    });
});



app.listen(3000, () => console.log(`listening on http://localhost:3000`));
