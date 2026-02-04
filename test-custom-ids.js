// test-custom-ids.js
// Test that new teachers and students get custom IDs

const testTeacherSignup = async () => {
    console.log('\n🧪 Testing Teacher Signup with Custom ID...\n');

    const newTeacher = {
        name: 'Test Teacher Custom ID',
        email: `teacher${Date.now()}@example.com`,
        password: 'password123',
        role: 'teacher',
        subjects: ['Math', 'Physics'],
        pricePerMinute: 2.5
    };

    console.log('Creating teacher with:');
    console.log(`  Name: ${newTeacher.name}`);
    console.log(`  Email: ${newTeacher.email}`);
    console.log(`  Role: ${newTeacher.role}\n`);

    try {
        const response = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTeacher)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ SUCCESS! Teacher created:');
            console.log(`   User ID: ${data.userId}`);
            console.log(`   Role: ${data.role}`);
            console.log(`   Profile ID: ${data.profileId}`);
            console.log(`   Profile Model: ${data.profileModel}`);

            // Check if profile ID has custom format
            if (data.profileId && data.profileId.startsWith('tea_')) {
                console.log('\n✅ PERFECT! Profile ID has custom format: tea_xxxxx');
                console.log(`   ID Length: ${data.profileId.length} characters`);
            } else {
                console.log('\n❌ WARNING! Profile ID does not have tea_ format');
                console.log(`   Got: ${data.profileId}`);
            }

            return data;
        } else {
            console.log('❌ SIGNUP FAILED:');
            console.log(`   Status: ${response.status}`);
            console.log(`   Message: ${data.message}`);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

const testStudentSignup = async () => {
    console.log('\n🧪 Testing Student Signup with Custom ID...\n');

    const newStudent = {
        name: 'Test Student Custom ID',
        email: `student${Date.now()}@example.com`,
        password: 'password123',
        role: 'student'
    };

    console.log('Creating student with:');
    console.log(`  Name: ${newStudent.name}`);
    console.log(`  Email: ${newStudent.email}`);
    console.log(`  Role: ${newStudent.role}\n`);

    try {
        const response = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newStudent)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ SUCCESS! Student created:');
            console.log(`   User ID: ${data.userId}`);
            console.log(`   Role: ${data.role}`);
            console.log(`   Profile ID: ${data.profileId}`);
            console.log(`   Profile Model: ${data.profileModel}`);

            // Check if profile ID has custom format
            if (data.profileId && data.profileId.startsWith('stu_')) {
                console.log('\n✅ PERFECT! Profile ID has custom format: stu_xxxxx');
                console.log(`   ID Length: ${data.profileId.length} characters`);
            } else {
                console.log('\n❌ WARNING! Profile ID does not have stu_ format');
                console.log(`   Got: ${data.profileId}`);
            }

            return data;
        } else {
            console.log('❌ SIGNUP FAILED:');
            console.log(`   Status: ${response.status}`);
            console.log(`   Message: ${data.message}`);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

// Run tests
(async () => {
    console.log('🚀 Testing Custom ID Generation...\n');
    console.log('='.repeat(60));

    await testTeacherSignup();

    console.log('\n' + '='.repeat(60));

    await testStudentSignup();

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Tests completed!');
})();
