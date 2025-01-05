const Contractor = require('./../models/contractorsModel');
const WorkOrder = require('./../models/workOrderModel');

const getAllContractors = async (req, res) => {
    try {
        const contractors = await Contractor.find(); 
        res.status(200).json(contractors); 
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

        
        const newContractor = new Contractor({
            name,
            phone
        });

        const savedContractor = await newContractor.save();
        res.status(201).json(savedContractor); 
    } catch (error) {
        console.error("Error adding contractor:", error);
        res.status(500).json({ message: "Failed to add contractor." });
    }
}

const deleteContractor = async (req, res) => {
    try {

        const { id } = req.params; 
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

const getContractorsByLocation = async (req, res) => {
    try {

        const locationId = req.params.id;

        
        const workOrders = await WorkOrder.find({ "locations.locationId": locationId });

        
        const contractorIds = [...new Set(workOrders.map(order => order.contractorId))];

        
        const contractors = await Contractor.find({ _id: { $in: contractorIds } });

        
        res.status(200).json(contractors);
    } catch (err) {
        console.error('Error fetching contractors:', err);
        res.status(500).json({ message: 'Internal server error', error: err });
    }
};


module.exports = {
    getAllContractors,
    addContractor,
    deleteContractor,
    getContractorsByLocation
}