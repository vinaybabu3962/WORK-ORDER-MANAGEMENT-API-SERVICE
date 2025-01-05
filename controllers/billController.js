const WorkOrder = require('./../models/workOrderModel');
const Contractor = require('../models/contractorsModel');  
const Location = require('../models/locationModel'); 
const Bill = require('../models/billModel');
const PDFDocument = require('pdfkit');  
const fs = require('fs');  

const getCompletedWorkOrders = async (contractorId) => {
    try {
        
        const workOrders = await WorkOrder.find({ contractorId });

        
        const locationIds = workOrders.flatMap(order => order.locations.map(location => location.locationId));

        
        const locations = await Location.find({ '_id': { $in: locationIds } });

        
        const locationMap = locations.reduce((map, location) => {
            map[location._id.toString()] = location; 
            return map;
        }, {});

        
        const flattenedWorkOrders = workOrders.map(order => {
            return order.locations.map(location => {
                const fullLocation = locationMap[location.locationId.toString()];
                return {
                    ...location._doc, 
                    workOrderId: order._id,
                    contractorId: order.contractorId,
                    locationName: fullLocation ? fullLocation.name : 'Unknown', 
                    status: fullLocation ? fullLocation.status : 'Unknown', 
                };
            });
        }).flat(); 


        return flattenedWorkOrders;
    } catch (error) {
        console.error('Error fetching work orders:', error);
        throw new Error('Failed to fetch work orders');
    }
};




const getCompletedLocations = (workOrders) => {
    const completedLocations = [];

    
    workOrders.forEach(order => {

        if(order.status === 'Completed'){
            completedLocations.push(order);
        }
    });

    return completedLocations; 
};


const calculateLocationAmounts = async (locations) => {
    const locationDetails = [];
    let totalAmount = 0;

    for (const worklocation of locations) {
        const location = await Location.findById(worklocation.locationId);
        const locationAmount = worklocation.rate * worklocation.quantity; 
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
    const lastBill = await Bill.findOne().sort({ createdAt: -1 }); 
    const lastBillNumber = lastBill ? parseInt(lastBill.billNumber.split('-')[1]) : 0;
    const newBillNumber = `BILL-${(lastBillNumber + 1).toString().padStart(2, '0')}`;
    return newBillNumber;
};


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

        return newBill;
    } catch (error) {
        console.error('Error saving bill:', error);
        throw new Error('Failed to save bill');
    }
};


const checkDuplicateBill = async (contractorId, locations) => {
    const existingBill = await Bill.findOne({
        contractor: contractorId,
        'locations.location': { $in: locations.map((loc) => loc.locationId) },
    });
    
    return existingBill; 
};

const generateBillsForAllContractors = async (req, res) => {
    try {
        
        const contractors = await Contractor.find(); 
        
        if (contractors.length === 0) {
            throw new Error('No contractors found');
        }

        
        for (let contractor of contractors) {
            console.log(`Generating bill for contractor: ${contractor.name}`);

            
            const workOrders = await getCompletedWorkOrders(contractor._id);

            if (workOrders.length === 0) {
                console.log(`No completed work orders found for contractor: ${contractor.name}`);
                continue; 
            }

            
            const completedLocations = getCompletedLocations(workOrders);

            
            const existingBill = await checkDuplicateBill(contractor._id, completedLocations);

            if (existingBill) {
                console.log(`Bill already generated for contractor: ${contractor.name}`);
                continue; 
            }

            
            const { locationDetails, totalAmount } = await calculateLocationAmounts(completedLocations);

            
            const billNumber = await generateBillNumber();

            
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
        
        const bills = await Bill.find().populate('contractor'); 

        
        if (!bills || bills.length === 0) {
            return res.status(404).json({ message: 'No bills found' });
        }

 

        
        res.status(200).json({ bills });
    } catch (error) {
        console.error('Error fetching bills:', error);
        res.status(500).json({ message: 'Failed to fetch bills' });
    }
}


const generateBillPdf = (billData, res) => {
    const doc = new PDFDocument(); 
  
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=bill.pdf');
  
    
    doc.pipe(res);  
  
    
    doc.fontSize(20).text('Contractor Bill', { align: 'center' });
    doc.moveDown();
  
    
    doc.fontSize(12).text(`Contractor: ${billData.contractor.name}`);
    doc.text(`Bill ID: ${billData.billNumber}`);
    doc.moveDown();
  
    const tableTop = doc.y;
    const columnWidths = [200, 100, 100, 100]; 

    
    doc.fontSize(12).text('Location Name', 50, tableTop);
    doc.text('Rate', 250, tableTop, { width: columnWidths[1], align: 'center' });
    doc.text('Quantity', 350, tableTop, { width: columnWidths[2], align: 'center' });
    doc.text('Total Amount', 450, tableTop, { width: columnWidths[3], align: 'center' });
    doc.text('-------------------------------------------------------------------------------------------------------------------', 50, tableTop + 15);

    
    let rowStart = tableTop + 30;
    billData.locations.forEach((location) => {
      const totalAmount = location.rate * location.quantity;
      
      
      doc.text(location.name, 50, rowStart);
      doc.text(location.rate, 250, rowStart, { width: columnWidths[1], align: 'center' });
      doc.text(location.quantity, 350, rowStart, { width: columnWidths[2], align: 'center' });
      doc.text(totalAmount.toFixed(2), 450, rowStart, { width: columnWidths[3], align: 'center' });
      
      
      rowStart += 15;
    });

    const totalAmount = billData.locations.reduce((total, location) => total + location.rate * location.quantity, 0);
    doc.moveDown();
    doc.text(`Total Amount: ${totalAmount}`);
  
    
    doc.end();
  };

  
const getBillPdf = async (req, res) => {
    try {
        console.log("Imhere::");
      const billId = req.params.id;  
      console.log(billId);
      
      const billData = await Bill.findById(billId)
        .populate('locations')   
        .populate('contractor', 'name'); 
      
      console.log(billData);
      if (!billData) {
        return res.status(404).json({ message: 'Bill not found' });
      }
  
      
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