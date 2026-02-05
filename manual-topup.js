const mongoose = require('mongoose');
const Student = require('./models/Student');
const Transaction = require('./models/Transaction');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://murphadmin:SLqfwOqtaS2ce5Mc@cluster0.mblps5f.mongodb.net/murph?appName=Cluster0';

async function verifyAndFixWallet() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find the most recent student or specific email
        const student = await Student.findOne().sort({ createdAt: -1 });

        if (!student) {
            console.log('No student found.');
            return;
        }

        console.log(`Found Student: ${student.name} (${student.email})`);
        console.log(`Current Balance: $${student.walletBalance}`);

        const ADD_AMOUNT = 100;
        student.walletBalance += ADD_AMOUNT;
        await student.save();

        console.log(`New Balance: $${student.walletBalance}`);

        // Create a manual transaction record so it shows in history
        await Transaction.create({
            userId: student._id, // String ID
            userModel: 'Student',
            amount: ADD_AMOUNT,
            type: 'credit',
            status: 'completed',
            description: 'Manual Top-up (Admin via Script)',
            gateway: 'MANUAL',
            referenceId: 'manual_' + Date.now()
        });

        console.log('Transaction record created.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

verifyAndFixWallet();
