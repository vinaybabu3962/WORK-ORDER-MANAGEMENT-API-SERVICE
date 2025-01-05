const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
const contractorsRoutes = require('./routes/contractorRoutes');
const entityRoutes = require('./routes/entityLocationRoutes');
const workOrderRoutes = require('./routes/workOrderRoutes');
const billRoutes = require('./routes/billRoutes');

const mongoose = require('mongoose');
require('dotenv').config();

const cors = require('cors');
const cookieParser = require('cookie-parser');
app.use(cookieParser());


app.use(cors({
    origin: 'http://localhost:4200', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true, 
}));


app.use(express.json());

mongoose.connect('mongodb://localhost:27017/mydb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});


app.use('/api/auth', authRoutes);
app.use('/api/contractors', contractorsRoutes);
app.use('/api/entities', entityRoutes);
app.use('/api/workorders', workOrderRoutes)
app.use('/api/bills', billRoutes)

// Define a simple route
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server running at http://127.0.0.1:3000/');
});
