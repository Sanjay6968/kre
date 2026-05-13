const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register (Initial setup or Admin only)
router.post('/register', async (req, res) => {
    const { username, password, role, base } = req.body;
    try {
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ username, password, role, base });
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role, base: user.base }, process.env.JWT_SECRET || 'secret');
        res.json({ token, user: { id: user._id, username: user.username, role: user.role, base: user.base } });
    } catch (e) {
        res.status(500).send('Server error');
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role, base: user.base }, process.env.JWT_SECRET || 'secret');
        res.json({ token, user: { id: user._id, username: user.username, role: user.role, base: user.base } });
    } catch (e) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
