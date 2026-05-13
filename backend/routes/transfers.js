const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const Transfer = require('../models/Transfer');
const Asset = require('../models/Asset');

// Get all transfers
router.get('/', auth, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Commander') {
            query = { $or: [{ fromBase: req.user.base }, { toBase: req.user.base }] };
        }
        const transfers = await Transfer.find(query).sort({ createdAt: -1 });
        res.json(transfers);
    } catch (e) {
        res.status(500).send('Server error');
    }
});

// Create transfer
router.post('/', [auth, checkRole(['Admin', 'Logistics'])], async (req, res) => {
    const { assetId, fromBase, toBase, quantity } = req.body;
    try {
        // 1. Check source asset
        const sourceAsset = await Asset.findById(assetId);
        if (!sourceAsset || sourceAsset.quantity < quantity) {
            return res.status(400).json({ msg: 'Insufficient quantity or asset not found' });
        }

        // 2. Deduct from source
        sourceAsset.quantity -= quantity;
        await sourceAsset.save();

        // 3. Add to destination (or create new asset record at destination)
        let destAsset = await Asset.findOne({ name: sourceAsset.name, base: toBase, category: sourceAsset.category });
        if (destAsset) {
            destAsset.quantity += quantity;
            await destAsset.save();
        } else {
            destAsset = new Asset({
                name: sourceAsset.name,
                category: sourceAsset.category,
                base: toBase,
                quantity: quantity,
                status: 'Available'
            });
            await destAsset.save();
        }

        // 4. Record transfer
        const transfer = new Transfer({
            assetId,
            assetName: sourceAsset.name,
            fromBase,
            toBase,
            quantity,
            initiatedBy: req.user.id
        });
        await transfer.save();

        res.json(transfer);
    } catch (e) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
