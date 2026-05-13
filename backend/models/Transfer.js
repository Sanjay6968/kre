const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    assetName: { type: String, required: true },
    fromBase: { type: String, required: true },
    toBase: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Completed' },
    initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    transferDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Transfer', transferSchema);
