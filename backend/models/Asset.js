const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['Vehicle', 'Weapon', 'Ammunition'], required: true },
    base: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['Available', 'In Use', 'Maintenance', 'Deployed'], default: 'Available' },
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
