const mongoose = require('mongoose');

const workOrderSchema = new mongoose.Schema({
  contractorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Contractor', 
    required: true  // Reference to the Contractor who is associated with the work order
  },
  paymentTerms: { type: Number, required: true },  // Payment terms for the work order
  dueDate: { type: Date, required: true },  // Due date for the work order
  locations: [  // Array of locations associated with this work order
    {
      locationId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Location', 
        required: true  // Reference to the Location
      },
      rate: { type: Number, required: true },  // Rate for the specific location in the work order
      quantity: { type: Number, required: true }  // Quantity for the specific location in the work order
    }
  ],
  createdAt: { type: Date, default: Date.now }  // Timestamp for when the work order is created
});

module.exports = mongoose.model('WorkOrder', workOrderSchema);
