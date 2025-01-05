const mongoose = require('mongoose');


const billSchema = new mongoose.Schema({
    contractor: { type: mongoose.Schema.Types.ObjectId, ref: 'Contractor', required: true },
    billNumber: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    locations: [{
        location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
        name: {type: String},
        rate: { type: Number },
        quantity: { type: Number },
        totalAmount: { type: Number },  // Calculated as rate * quantity
    }],
    dateGenerated: { type: Date, default: Date.now },
});

const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;