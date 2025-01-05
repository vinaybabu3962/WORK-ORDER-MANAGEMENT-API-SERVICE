const mongoose = require('mongoose');

const contractorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: false },  
    address: { type: String, required: false }
});

const Contractor = mongoose.model('Contractor', contractorSchema);

module.exports = Contractor;
