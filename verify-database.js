// verify-database.js
// Verify that we're connected to the correct database

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db');

(async () => {
    try {
        await connectDB();

        console.log('\n📊 Database Connection Info:');
        console.log(`   Database Name: ${mongoose.connection.name}`);
        console.log(`   Host: ${mongoose.connection.host}`);
        console.log(`   Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);

        if (mongoose.connection.name === 'murph') {
            console.log('\n✅ SUCCESS! Connected to the "murph" database');
            console.log('   All new users will be created in the murph database');
        } else {
            console.log(`\n❌ WARNING! Connected to "${mongoose.connection.name}" database instead of "murph"`);
            console.log('   Please check your MONGO_URI in .env file');
        }

        // List all collections in the current database
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`\n📁 Collections in "${mongoose.connection.name}" database:`);
        if (collections.length === 0) {
            console.log('   (No collections yet - they will be created when you add data)');
        } else {
            collections.forEach(col => {
                console.log(`   - ${col.name}`);
            });
        }

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
})();
