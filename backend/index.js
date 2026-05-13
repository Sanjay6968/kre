const express = require('express');
if (typeof globalThis.crypto === 'undefined') {
    globalThis.crypto = require('crypto');
}
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Connect to MongoDB
const connectDB = async () => {
    let mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        mongoUri = mongoServer.getUri();
        console.log('Using In-Memory MongoDB:', mongoUri);
    }

    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');
        
        // Auto-seed if in-memory
        if (!process.env.MONGO_URI) {
            const seed = require('./seed_logic');
            await seed();
        }
    } catch (err) {
        console.error('Could not connect to MongoDB', err);
    }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/assets', require('./routes/assets'));
app.use('/api/transfers', require('./routes/transfers'));
app.use('/api/assignments', require('./routes/assignments'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
