import express from 'express';
import Redis from 'ioredis';
import mongoose from 'mongoose';


const app = express();


// Connect to Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');


app.get('/redis', async (req, res) => {
    const reply =  await redis.ping();
    res.send(`Redis says: ${reply}`);
});


app.get ('/mongo', async (req, res) => {
    const url = process.env.MONGO_URL || 'mongodb://localhost:27017/learn_redis';

    if (mongoose.connection.readyState === 0) {
            await mongoose.connect(url);
        }
        res.json({ message: 'Connected to MongoDB successfully!', database: mongoose.connection.db.databaseName });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});