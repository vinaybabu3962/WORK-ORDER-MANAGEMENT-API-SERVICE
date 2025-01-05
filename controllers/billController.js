const WorkOrder = require('./../models/workOrderModel');
const Contractor = require('../models/contractorsModel');  // Import the Contractor model
const Location = require('../models/locationModel'); 
const Bill = require('../models/billModel');
const PDFDocument = require('pdfkit');  // Import PDFKit
const fs = require('fs');  // 

const getCompletedWorkOrders = async (contractorId) => {
    try {
        // Fetch work orders for the contractor
        const workOrders = await WorkOrder.find({ contractorId });

        // Fetch all locationIds from work orders
        const locationIds = workOrders.flatMap(order => order.locations.map(location => location.locationId));

        // Fetch locations using the locationIds
        const locations = await Location.find({ '_id': { $in: locationIds } });

        // Create a map of locationId to location document
        const locationMap = locations.reduce((map, location) => {
            map[location._id.toString()] = location; // Store location by its ID
            return map;
        }, {});

        // Flatten work orders and include location details
        const flattenedWorkOrders = workOrders.map(order => {
            return order.locations.map(location => {
                const fullLocation = locationMap[location.locationId.toString()];
                return {
                    ...location._doc, // Spread location fields
                    workOrderId: order._id,
                    contractorId: order.contractorId,
                    locationName: fullLocation ? fullLocation.name : 'Unknown', // Get location name from the map
                    status: fullLocation ? fullLocation.status : 'Unknown', // Add the status of location
                };
            });
        }).flat(); // Flatten the array

        console.log(flattenedWorkOrders);
        return flattenedWorkOrders;
    } catch (error) {
        console.error('Error fetching work orders:', error);
        throw new Error('Failed to fetch work orders');
    }
};




const getCompletedLocations = (workOrders) => {
    const completedLocations = [];
    console.log("Got locations::");
    // Loop through all the work orders and their locations
    workOrders.forEach(order => {
        console.log(order);
        if(order.status === 'Completed'){
            completedLocations.push(order);
        }
    });

    return completedLocations; // Return the filtered list of completed locations
};


const calculateLocationAmounts = async (locations) => {
    const locationDetails = [];
    let totalAmount = 0;

    for (const worklocation of locations) {
        const location = await Location.findById(worklocation.locationId);
        const locationAmount = worklocation.rate * worklocation.quantity; // Rate * Quantity
        totalAmount += locationAmount;

        locationDetails.push({
            location: location._id,
            name: worklocation.locationName,
            rate: worklocation.rate,
            quantity: worklocation.quantity,
            totalAmount: locationAmount,
        });
    }

    return { locationDetails, totalAmount };
};

const generateBillNumber = async () => {
    const lastBill = await Bill.findOne().sort({ createdAt: -1 }); // Get last generated bill
    const lastBillNumber = lastBill ? parseInt(lastBill.billNumber.split('-')[1]) : 0;
    const newBillNumber = `BILL-${(lastBillNumber + 1).toString().padStart(2, '0')}`;
    return newBillNumber;
};

// Create and save a new bill document
const saveBill = async (contractorId, billNumber, totalAmount, locationDetails) => {
    try {
        const newBill = new Bill({
            contractor: contractorId,
            billNumber: billNumber,
            totalAmount: totalAmount,
            locations: locationDetails,
            dateGenerated: new Date(),
        });

        await newBill.save();
        console.log('Bill saved successfully');
        return newBill;
    } catch (error) {
        console.error('Error saving bill:', error);
        throw new Error('Failed to save bill');
    }
};

// Check if bill for contractor already exists for completed locations
const checkDuplicateBill = async (contractorId, locations) => {
    const existingBill = await Bill.findOne({
        contractor: contractorId,
        'locations.location': { $in: locations.map((loc) => loc.locationId) },
    });
    
    return existingBill; // If an existing bill is found, return it
};

const generateBillsForAllContractors = async (req, res) => {
    try {
        // Step 1: Fetch all contractors
        const contractors = await Contractor.find(); // Assuming Contractor is your model
        
        if (contractors.length === 0) {
            throw new Error('No contractors found');
        }

        // Step 2: Loop over all contractors
        for (let contractor of contractors) {
            console.log(`Generating bill for contractor: ${contractor.name}`);

            // Step 3: Fetch completed work orders for this contractor
            const workOrders = await getCompletedWorkOrders(contractor._id);

            if (workOrders.length === 0) {
                console.log(`No completed work orders found for contractor: ${contractor.name}`);
                continue; // Skip this contractor if no completed work orders
            }

            // Step 4: Get unique completed locations from work orders
            const completedLocations = getCompletedLocations(workOrders);

            // Step 5: Check if a bill already exists for this contractor and locations
            const existingBill = await checkDuplicateBill(contractor._id, completedLocations);

            if (existingBill) {
                console.log(`Bill already generated for contractor: ${contractor.name}`);
                continue; // Skip generating the bill if it already exists
            }

            // Step 6: Calculate total amount and location details
            const { locationDetails, totalAmount } = await calculateLocationAmounts(completedLocations);

            // Step 7: Generate bill number
            const billNumber = await generateBillNumber();

            // Step 8: Save the bill for this contractor
            const bill = await saveBill(contractor._id, billNumber, totalAmount, locationDetails);

            console.log(`Bill ${bill.billNumber} generated successfully for contractor: ${contractor.name}`);
            
        }
        res.status(200).json({ message:"alldone" });
    } catch (error) {
        console.error('Error generating bills for all contractors:', error);
        throw new Error('Failed to generate bills for all contractors');
    }
};


const getBills = async (req, res) => {
    try {
        // Use populate to fetch the contractor details (populate from the 'contractor' field)
        const bills = await Bill.find().populate('contractor'); // 'contractor' is the field you want to populate

        // Check if bills exist
        if (!bills || bills.length === 0) {
            return res.status(404).json({ message: 'No bills found' });
        }

 

        // Send the response with the populated bills
        res.status(200).json({ bills });
    } catch (error) {
        console.error('Error fetching bills:', error);
        res.status(500).json({ message: 'Failed to fetch bills' });
    }
}


const generateBillPdf = (billData, res) => {
    const doc = new PDFDocument(); // Create a new PDF document
  
    // Set up the response as a PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=bill.pdf');
  
    // Pipe the PDF to the response
    doc.pipe(res);  // This sends the PDF directly to the client.
  
    // Add content to the PDF
    doc.fontSize(20).text('Contractor Bill', { align: 'center' });
    doc.moveDown();
  
    // Add contractor and location details
    doc.fontSize(12).text(`Contractor: ${billData.contractor.name}`);
    doc.text(`Bill ID: ${billData.billNumber}`);
    doc.moveDown();
  
    const tableTop = doc.y;
    const columnWidths = [200, 100, 100, 100]; // Adjust based on content length

    // Location Name | Rate | Quantity | Total Amount
    doc.fontSize(12).text('Location Name', 50, tableTop);
    doc.text('Rate', 250, tableTop, { width: columnWidths[1], align: 'center' });
    doc.text('Quantity', 350, tableTop, { width: columnWidths[2], align: 'center' });
    doc.text('Total Amount', 450, tableTop, { width: columnWidths[3], align: 'center' });
    doc.text('-------------------------------------------------------------------------------------------------------------------', 50, tableTop + 15);

    // Add rows for each location
    let rowStart = tableTop + 30;
    billData.locations.forEach((location) => {
      const totalAmount = location.rate * location.quantity;
      
      // Write the data
      doc.text(location.name, 50, rowStart);
      doc.text(location.rate, 250, rowStart, { width: columnWidths[1], align: 'center' });
      doc.text(location.quantity, 350, rowStart, { width: columnWidths[2], align: 'center' });
      doc.text(totalAmount.toFixed(2), 450, rowStart, { width: columnWidths[3], align: 'center' });
      
      // Move down for next row
      rowStart += 15;
    });

    const totalAmount = billData.locations.reduce((total, location) => total + location.rate * location.quantity, 0);
    doc.moveDown();
    doc.text(`Total Amount: ${totalAmount}`);
  
    // Finalize the PDF and end the document
    doc.end();
  };

  
const getBillPdf = async (req, res) => {
    try {
      const billId = req.params.id;  // Assuming bill ID is passed in the URL
      
      // Fetch the bill from your database (e.g., using the Bill model)
      const billData = await Bill.findById(billId)
        .populate('locations')   // Populate locations
        .populate('contractor', 'name'); // Populate contractor's name only
    
      if (!billData) {
        return res.status(404).json({ message: 'Bill not found' });
      }
  
      // Generate and send the PDF
      generateBillPdf(billData, res);
    } catch (error) {
      console.error('Error generating PDF:', error);
      return res.status(500).json({ message: 'Error generating PDF' });
    }
  };

  

module.exports = {
    generateBillsForAllContractors,
    getBills,
    getBillPdf
}