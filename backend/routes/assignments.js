const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const Assignment = require('../models/Assignment');
const Asset = require('../models/Asset');

// Get all assignments/expenditures
router.get('/', auth, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Commander') {
            query.base = req.user.base;
        }
        if (req.query.type) {
            query.type = req.query.type;
        }
        if (req.query.base) {
            query.base = req.query.base;
        }
        const assignments = await Assignment.find(query).sort({ createdAt: -1 });
        res.json(assignments);
    } catch (e) {
        res.status(500).send('Server error');
    }
});

// Create assignment or expenditure
router.post('/', [auth, checkRole(['Admin', 'Logistics', 'Commander'])], async (req, res) => {
    const { assetId, assignedTo, quantity, base, type } = req.body;
    try {
        // Check asset availability
        const asset = await Asset.findById(assetId);
        if (!asset) return res.status(404).json({ msg: 'Asset not found' });
        if (asset.quantity < quantity) {
            return res.status(400).json({ msg: 'Insufficient asset quantity' });
        }

        // Deduct quantity
        asset.quantity -= quantity;
        if (type === 'Assignment') {
            asset.status = asset.quantity === 0 ? 'In Use' : 'Available';
        }
        await asset.save();

        const assignment = new Assignment({
            assetId,
            assetName: asset.name,
            assignedTo,
            quantity,
            base: base || asset.base,
            type: type || 'Assignment'
        });
        await assignment.save();

        res.json(assignment);
    } catch (e) {
        res.status(500).send('Server error');
    }
});

// Delete assignment (return assets)
router.delete('/:id', [auth, checkRole(['Admin', 'Logistics'])], async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ msg: 'Assignment not found' });

        // Return quantity to asset if it's an assignment (not expenditure)
        if (assignment.type === 'Assignment') {
            const asset = await Asset.findById(assignment.assetId);
            if (asset) {
                asset.quantity += assignment.quantity;
                asset.status = 'Available';
                await asset.save();
            }
        }

        await Assignment.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Assignment removed' });
    } catch (e) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
