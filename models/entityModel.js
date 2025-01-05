const mongoose = require('mongoose');

const entitySchema = new mongoose.Schema({
    name: { type: String, required: true },
});

const Entity = mongoose.model('Entity', entitySchema);

module.exports = Entity;
