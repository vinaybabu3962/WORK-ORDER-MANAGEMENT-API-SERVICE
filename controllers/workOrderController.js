const WorkOrder = require('./../models/workOrderModel');
const Contractor = require('../models/contractorsModel');  
const Location = require('../models/locationModel'); 


const addWorkOrder = async (req, res) => {
    try {
        const { contractorId, paymentTerms, dueDate, locations } = req.body;

        const workOrder = new WorkOrder({
            contractorId,
            paymentTerms,
            dueDate,
            locations
        });

        await workOrder.save();

        for (const loc of locations) {
            await Location.findByIdAndUpdate(
                loc.locationId,
                { $push: { workOrders: workOrder._id } },
                { new: true }
            );
        }


        res.status(201).json({ message: 'Work order created successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllWorkOrders = async (req, res) => {
    try {

        
        const workOrders = await WorkOrder.find()
            .populate('contractorId', 'name')  
            .populate('locations.locationId', 'name state')  
            .exec();

        
        if (!workOrders || workOrders.length === 0) {
            return res.status(404).json({ message: 'No work orders found' });
        }

        
        return res.status(200).json(workOrders);
    } catch (error) {
        console.error('Error fetching work orders:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
}
module.exports = {
    addWorkOrder,
    getAllWorkOrders
}