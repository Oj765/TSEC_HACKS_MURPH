// test-new-user.js
// Test creating a new user to verify it goes into murph database

const testNewUser = async () => {
    console.log('\n🧪 Testing User Creation in murph database...\n');

    const newUser = {
        name: 'New Test User',
        email: `testuser${Date.now()}@example.com`, // Unique email
        password: 'password123',
        role: 'student'
    };

    console.log('Creating user with:');
    console.log(`  Name: ${newUser.name}`);
    console.log(`  Email: ${newUser.email}`);
    console.log(`  Role: ${newUser.role}`);
    console.log(`  Password: ${newUser.password}\n`);

    try {
        const response = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ SUCCESS! User created:');
            console.log(`   User ID: ${data.userId}`);
            console.log(`   Role: ${data.role}`);
            console.log(`   Profile ID: ${data.profileId}`);
            console.log(`   Profile Model: ${data.profileModel}`);
            console.log('\n📊 Check MongoDB Compass:');
            console.log('   Database: murph');
            console.log('   Collections: authusers, students');
            console.log('   The new user should appear there!');

            // Now test login with the same credentials
            console.log('\n🧪 Testing Login with the new user...\n');

            const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: newUser.email,
                    password: newUser.password,
                    role: newUser.role
                })
            });

            const loginData = await loginResponse.json();

            if (loginResponse.ok) {
                console.log('✅ LOGIN SUCCESS!');
                console.log(`   User ID: ${loginData.userId}`);
                console.log(`   Role: ${loginData.role}`);
                console.log('\n✅ Everything is working correctly!');
            } else {
                console.log('❌ LOGIN FAILED:');
                console.log(`   Status: ${loginResponse.status}`);
                console.log(`   Message: ${loginData.message}`);
            }

        } else {
            console.log('❌ SIGNUP FAILED:');
            console.log(`   Status: ${response.status}`);
            console.log(`   Message: ${data.message}`);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

// Run test
testNewUser();
