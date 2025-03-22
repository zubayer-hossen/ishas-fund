const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');  // Import nodemailer
require('dotenv').config();
const app = express();
app.use(express.json());
// Fully configured CORS
const corsOptions = {
  origin: "https://ishasfund.netlify.app/",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

mongoose.connect(process.env.MONGO_URI
).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

const FundSchema = new mongoose.Schema({
    transactionId: { type: String, unique: true },
    name: String,
    amount: Number,
    donationType: String,
    date: { type: Date, default: Date.now },
    mobileNumber: String,  // Ensure that mobile number is saved in the fund model
});

const ExpenseSchema = new mongoose.Schema({
    transactionId: { type: String, unique: true },
    description: String,
    amount: Number,
    date: { type: Date, default: Date.now },
});

const Fund = mongoose.model('Fund', FundSchema);
const Expense = mongoose.model('Expense', ExpenseSchema);

// Set up Nodemailer transporter (example using Gmail SMTP)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL, // Your Gmail address
        pass: process.env.EMAIL_PASS  // Your Gmail password or App Password (recommended)
    }
});

// API to add fund
app.post('/add-fund', async (req, res) => {
    try {
        const fund = new Fund({ ...req.body, transactionId: uuidv4() });
        await fund.save();

        // Send email after adding the fund
        const mailOptions = {
            from: process.env.EMAIL,
            to: process.env.ADMIN_EMAIL,  // Change to your desired recipient email
            subject: 'Donation Received',
            text: `A new donation has been received! Here are the details:\n\n
            Name: ${fund.name}\n
            Amount: $${fund.amount}\n
            Donation Type: ${fund.donationType}\n
            Mobile Number: ${fund.mobileNumber}\n
            Transaction ID: ${fund.transactionId}\n
            Date: ${fund.date}`
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.json({ success: true, message: 'Fund added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding fund', error });
    }
});

// API to add expense
app.post('/add-expense', async (req, res) => {
    try {
        const expense = new Expense({ ...req.body, transactionId: uuidv4() });
        await expense.save();
        res.json({ success: true, message: 'Expense added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding expense', error });
    }
});

// API to fetch funds
app.get('/funds', async (req, res) => {
    try {
        const funds = await Fund.find();
        res.json(funds);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching funds', error });
    }
});

// API to fetch expenses
app.get('/expenses', async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching expenses', error });
    }
});

const PORT = process.env.PORT

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
