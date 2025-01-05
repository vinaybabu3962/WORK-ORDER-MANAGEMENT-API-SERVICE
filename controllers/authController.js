const Users = require('../models/usersModel');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
;
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }
    try {

        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email.' });
        }

        const newUser = new Users({ name, email, password });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully!', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user.', error: error.message });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    try {

        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password.' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } 
        );
        res.status(200).json({ message: 'Login successful!', user: { id: user._id, name: user.name, email: user.email , token: token} });
    } catch (error) {
        res.status(500).json({ message: 'Error during login.', error: error.message });
    }
}

module.exports = {
    signup,
    login
}