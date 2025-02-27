const express = require('express');
const { Pool } = require('pg'); // Use pg for PostgreSQL
const redis = require('redis');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
    origin: '*', // Update to your frontend domain in production (e.g., frontend.local)
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
}));

// Handle preflight requests
app.options('/api/message', cors());

// PostgreSQL connection using environment variables
const dbConfig = {
    host: process.env.DB_HOST || 'db-service', // Matches db-service in Kubernetes
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.POSTGRES_DB || 'mydb',
    port: 5432,
};

const db = new Pool(dbConfig);

db.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('PostgreSQL Connection Failed:', err));

// Redis connection
const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || 'redis-service'}:${process.env.REDIS_PORT || 6379}`,
});

redisClient.on('connect', () => console.log('Connected to Redis'));
redisClient.on('end', () => console.log('Redis connection closed'));
redisClient.on('error', (err) => console.error('Redis error:', err));

(async () => {
    await redisClient.connect().catch((err) => console.error('Failed to connect to Redis:', err));
})();


// API Endpoints
app.get('/api/message', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
});


// app.get('/api/cache', async (req, res) => {
//     const cacheKey = 'cached_message';
//     try {
//         const cachedData = await redisClient.get(cacheKey);
//         if (cachedData) {
//             return res.json({ message: JSON.parse(cachedData) });
//         }

//         const db = await mysql.createConnection(dbConfig);
//         const [results] = await db.query('SELECT text FROM messages ORDER BY created_at DESC LIMIT 1');
//         await db.end();

//         if (results.length > 0) {
//             const message = results[0].text;
//             await redisClient.setEx(cacheKey, 30, JSON.stringify(message));
//             return res.json({ message });
//         }
//         return res.json({ message: 'No messages found in the database' });
//     } catch (err) {
//         console.error('Error:', err);
//         return res.status(500).json({ error: 'Failed to fetch from cache or database' });
//     }
// });

// app.get('/api/cache/reset', async (req, res) => {
//     try {
//         await redisClient.del('cached_message');
//         res.json({ message: 'Cache cleared successfully' });
//     } catch (err) {
//         console.error('Failed to clear cache:', err);
//         res.status(500).json({ error: 'Failed to clear cache' });
//     }
// });

// app.get('/api/messages', async (req, res) => {
//     try {
//         const db = await mysql.createConnection(dbConfig);
//         const [results] = await db.query('SELECT * FROM messages ORDER BY created_at DESC');
//         await db.end();
//         res.json(results);
//     } catch (err) {
//         console.error('Database error:', err);
//         res.status(500).json({ error: 'Failed to fetch messages' });
//     }
// });

// app.post('/api/messages', async (req, res) => {
//     const { text } = req.body;
//     if (!text) {
//         return res.status(400).json({ error: 'Message text is required' });
//     }

//     try {
//         const db = await mysql.createConnection(dbConfig);
//         const [result] = await db.query('INSERT INTO messages (text) VALUES (?)', [text]);
//         await db.end();
//         res.json({ message: 'Message added!', id: result.insertId });
//     } catch (err) {
//         console.error('Database error:', err);
//         res.status(500).json({ error: 'Failed to add message' });
//     }
// });

