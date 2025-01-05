const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    entity: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', required: true }, // Reference to Entity
    status: { type: String, enum: ['Ready', 'Completed'], default: 'Ready' },
    workOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder' }], // Store references to work orders
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
