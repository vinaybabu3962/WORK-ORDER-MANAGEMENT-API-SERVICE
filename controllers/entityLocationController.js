const Entity = require('./../models/entityModel');
const Location = require('./../models/locationModel');


const addEntity = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({ error: 'Entity name is required.' });
        }


        const entity = new Entity({ name });
        await entity.save();

        res.status(201).json({ message: 'Entity added successfully', entity });
    } catch (error) {
        console.error('Error adding entity:', error);
        res.status(500).json({ error: 'Failed to add entity' });
    }
};


const getAllEntities = async (req, res) => {
    try {
        const entities = await Entity.find(); 
        res.status(200).json(entities);
    } catch (error) {
        console.error('Error fetching entities:', error);
        res.status(500).json({ error: 'Failed to fetch entities' });
    }
};

const getLocations = async (req, res) => {
    try {
        
        const locations = await Location.find().populate('entity', 'name');
        
        res.status(200).json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ error: 'Failed to fetch locations' });
    }
};

const addLocation = async (req, res) => {
    try {
        const { _id, name, entity, status } = req.body;

        
        if (!name || !entity || !entity._id) {
            return res.status(400).json({ error: 'Location name and entity (with _id) are required.' });
        }

        
        const location = new Location({ 
            name,
            entity: entity._id, 
            state: status || 'Ready', 
        });

        
        const savedLocation = await location.save();
        res.status(201).json({ message: 'Location added successfully', location: savedLocation });
    } catch (error) {
        console.error('Error adding location:', error);
        res.status(500).json({ error: 'Failed to add location' });
    }
};

const updateLocation = async (req, res) => {
    try {
        
        const { _id, status, workOrders, name, entity } = req.body;

        
        const location = await Location.findById(_id);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }

        
        if (name) location.name = name;
        if (status) location.status = status;
        if (workOrders) location.workOrders = workOrders; 
        if (entity) location.entity = entity; 

        
        await location.save();

        
        res.status(200).json({ message: 'Location updated successfully', location });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update location' });
    }
};




module.exports = {
    addEntity,
    getAllEntities,
    addLocation,
    getLocations,
    updateLocation
};
