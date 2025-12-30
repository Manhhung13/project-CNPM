// const fetch = require('node:fetch'); // Fetch is global in Node 18+

const BASE_URL = 'http://localhost:5001/api';
let TOKEN = '';
let APARTMENT_ID = null;
let HOUSEHOLD_ID = null;

async function runTest() {
    console.log('--- Starting Apartment Management Verification ---');

    // 1. Login (assuming admin exists or register one)
    console.log('\n[1] Authenticating...');
    try {
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'password123' })
        });

        if (loginRes.status === 400) {
            // Maybe user doesn't exist, try register
            console.log('User not found, registering admin...');
            await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'admin', password: 'password123', fullName: 'Admin User' })
            });
            // Try login again
            const loginRes2 = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'admin', password: 'password123' })
            });
            const data = await loginRes2.json();
            TOKEN = data.token;
        } else {
            const data = await loginRes.json();
            TOKEN = data.token;
        }
        console.log('Authenticated! Token obtained.');
    } catch (e) {
        console.error('Authentication failed:', e.message);
        return;
    }

    // 2. Create Apartment
    console.log('\n[2] Creating Apartment "T999"...');
    try {
        const res = await fetch(`${BASE_URL}/management/apartments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({ name: 'T999', area: 50.5, status: 'Available' })
        });
        const data = await res.json();
        if (res.status === 201) {
            APARTMENT_ID = data.id;
            console.log(`Apartment Created: ${data.name} (ID: ${data.id}) - Status: ${data.status}`);
        } else if (data.message === 'Apartment name already exists') {
            // Fetch to get ID
            console.log('Apartment exists, fetching ID...');
            const listRes = await fetch(`${BASE_URL}/management/apartments`, {
                headers: { 'Authorization': `Bearer ${TOKEN}` }
            });
            const list = await listRes.json();
            const apt = list.find(a => a.name === 'T999');
            APARTMENT_ID = apt.id;
            console.log(`Apartment Found: ${apt.name} (ID: ${apt.id})`);
        } else {
            console.error('Failed to create apartment:', data);
        }
    } catch (e) {
        console.error('Error creating apartment:', e.message);
    }

    // 3. Move In (Create Household)
    console.log('\n[3] Moving In (Creating Household)...');
    try {
        const res = await fetch(`${BASE_URL}/management/households`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
                name: 'T999 Owner',
                apartmentNumber: 'T999', // Legacy field
                apartmentId: APARTMENT_ID,
                area: 50.5,
                contactNumber: '0909090909'
            })
        });
        const data = await res.json();
        if (res.status === 201) {
            HOUSEHOLD_ID = data.id;
            console.log(`Household Created: ${data.name} (ID: ${data.id})`);
        } else {
            console.error('Failed to move in:', data);
        }
    } catch (e) {
        console.error('Error moving in:', e.message);
    }

    // 4. Verify Status Occupied
    console.log('\n[4] Verifying Apartment Status is Occupied...');
    try {
        const listRes = await fetch(`${BASE_URL}/management/apartments`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        const list = await listRes.json();
        const apt = list.find(a => a.id === APARTMENT_ID);
        console.log(`Apartment ${apt.name} Status: ${apt.status} (Expected: Occupied)`);
    } catch (e) {
        console.error('Error verifying status:', e.message);
    }

    // 5. Move Out
    console.log('\n[5] Moving Out...');
    if (HOUSEHOLD_ID) {
        try {
            const res = await fetch(`${BASE_URL}/management/households/${HOUSEHOLD_ID}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${TOKEN}`
                }
            });
            const data = await res.json();
            console.log('Move Out Result:', data.message);
        } catch (e) {
            console.error('Error moving out:', e.message);
        }
    }

    // 6. Verify Status Available
    console.log('\n[6] Verifying Apartment Status is Available...');
    try {
        const listRes = await fetch(`${BASE_URL}/management/apartments`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        const list = await listRes.json();
        const apt = list.find(a => a.id === APARTMENT_ID);
        console.log(`Apartment ${apt.name} Status: ${apt.status} (Expected: Available)`);
    } catch (e) {
        console.error('Error verifying status:', e.message);
    }
}

runTest();
