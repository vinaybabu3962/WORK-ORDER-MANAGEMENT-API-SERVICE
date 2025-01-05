const Entity = require('./../models/entityModel');
const Location = require('./../models/locationModel');

// Add a new Entity
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
        // Fetch all locations and populate the entity reference
        const locations = await Location.find().populate('entity', 'name');
        //console.log(locations);
        res.status(200).json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ error: 'Failed to fetch locations' });
    }
};

const addLocation = async (req, res) => {
    try {
        const { _id, name, entity, status } = req.body;

        // Validate required fields
        if (!name || !entity || !entity._id) {
            return res.status(400).json({ error: 'Location name and entity (with _id) are required.' });
        }

        // Create a new location object
        const location = new Location({ 
            name,
            entity: entity._id, 
            state: status || 'Ready', 
        });

        // Save location to the database
        const savedLocation = await location.save();
        res.status(201).json({ message: 'Location added successfully', location: savedLocation });
    } catch (error) {
        console.error('Error adding location:', error);
        res.status(500).json({ error: 'Failed to add location' });
    }
};

const updateLocation = async (req, res) => {
    try {
        // Extract data from the request body
        const { _id, status, workOrders, name, entity } = req.body;

        // Find the location by its ID
        const location = await Location.findById(_id);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }

        // Update the location fields with the new values
        if (name) location.name = name;
        if (status) location.status = status;
        if (workOrders) location.workOrders = workOrders; // Assuming workOrders is an array
        if (entity) location.entity = entity; // Assuming entity is an object with _id and name

        // Save the updated location
        await location.save();

        // Return the updated location as the response
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
