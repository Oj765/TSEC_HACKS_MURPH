const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // List Collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        // Check 'videourls', 'video-url', 'VideoUrl', etc.
        const candidates = collections.map(c => c.name).filter(n => n.toLowerCase().includes('video'));

        for (const name of candidates) {
            console.log(`\n--- Inspecting Collection: ${name} ---`);
            const sample = await mongoose.connection.db.collection(name).findOne({});
            console.log(JSON.stringify(sample, null, 2));
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
