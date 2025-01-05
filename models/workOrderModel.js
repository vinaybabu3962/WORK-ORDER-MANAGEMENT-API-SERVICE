const mongoose = require('mongoose');

const workOrderSchema = new mongoose.Schema({
  contractorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Contractor', 
    required: true  
  },
  paymentTerms: { type: Number, required: true },  
  dueDate: { type: Date, required: true },  
  locations: [  
    {
      locationId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Location', 
        required: true  
      },
      rate: { type: Number, required: true },  
      quantity: { type: Number, required: true }  
    }
  ],
  createdAt: { type: Date, default: Date.now }  
});

module.exports = mongoose.model('WorkOrder', workOrderSchema);
