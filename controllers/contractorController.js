const Contractor = require('./../models/contractorsModel');

const getAllContractors = async (req, res) => {
    try {
        const contractors = await Contractor.find(); // Fetch all contractors from the database
        res.status(200).json(contractors); // Return the contractors as JSON
    } catch (error) {
        console.error("Error fetching contractors:", error);
        res.status(500).json({ message: "Failed to retrieve contractors." });
    }
}

const addContractor = async (req, res) => {
    try {
        const { name, phone } = req.body; 

        if (!name || !phone) {
            return res.status(400).json({ message: "Name and phone number are required." });
        }

        // Create a new contractor instance
        const newContractor = new Contractor({
            name,
            phone
        });

        const savedContractor = await newContractor.save();
        res.status(201).json(savedContractor); // Return the saved contractor as JSON
    } catch (error) {
        console.error("Error adding contractor:", error);
        res.status(500).json({ message: "Failed to add contractor." });
    }
}

const deleteContractor = async (req, res) => {
    try {
        console.log(req.params);
        const { id } = req.params; // Get the id from query parameter
        if (!id) {
          return res.status(400).json({ message: 'Contractor ID is required' });
        }
    
        const contractor = await Contractor.findByIdAndDelete(id);
    
        if (!contractor) {
          return res.status(404).json({ message: 'Contractor not found' });
        }
    
        res.status(200).json({ message: 'Contractor deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
      }
}

module.exports = {
    getAllContractors,
    addContractor,
    deleteContractor
}