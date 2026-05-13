const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const Asset = require('../models/Asset');

// Get all assets (Filtered by base if Commander)
router.get('/', auth, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Commander') {
            query.base = req.user.base;
        }
        const assets = await Asset.find(query);
        res.json(assets);
    } catch (e) {
        res.status(500).send('Server error');
    }
});

// Add new asset (Logistics or Admin)
router.post('/', [auth, checkRole(['Admin', 'Logistics'])], async (req, res) => {
    try {
        const newAsset = new Asset(req.body);
        const asset = await newAsset.save();
        res.json(asset);
    } catch (e) {
        res.status(500).send('Server error');
    }
});

// Update asset
router.put('/:id', auth, async (req, res) => {
    try {
        const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(asset);
    } catch (e) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
