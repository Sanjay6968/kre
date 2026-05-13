const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    assetName: { type: String, required: true },
    assignedTo: { type: String, required: true }, // Unit or Personnel name
    quantity: { type: Number, required: true, min: 1 },
    base: { type: String, required: true },
    type: { type: String, enum: ['Assignment', 'Expenditure'], default: 'Assignment' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
