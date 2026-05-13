const mongoose = require('mongoose');
const User = require('./models/User');
const Asset = require('./models/Asset');

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Asset.deleteMany({});

        // Create users
        await User.create([
            { username: 'admin', password: 'admin123', role: 'Admin', base: 'All' },
            { username: 'commander_alpha', password: 'cmd123', role: 'Commander', base: 'Base Alpha' },
            { username: 'commander_bravo', password: 'cmd123', role: 'Commander', base: 'Base Bravo' },
            { username: 'logistics', password: 'log123', role: 'Logistics', base: 'All' }
        ]);

        // Create assets
        await Asset.create([
            { name: 'M1 Abrams Tank', category: 'Vehicle', base: 'Base Alpha', quantity: 12, status: 'Available', description: 'Main battle tank' },
            { name: 'Humvee', category: 'Vehicle', base: 'Base Alpha', quantity: 30, status: 'Available', description: 'Multi-purpose vehicle' },
            { name: 'Black Hawk Helicopter', category: 'Vehicle', base: 'Base Bravo', quantity: 8, status: 'Available', description: 'Utility helicopter' },
            { name: 'Bradley IFV', category: 'Vehicle', base: 'Base Bravo', quantity: 15, status: 'Available', description: 'Infantry fighting vehicle' },
            { name: 'M4 Carbine', category: 'Weapon', base: 'Base Alpha', quantity: 500, status: 'Available', description: 'Standard issue rifle' },
            { name: 'M249 SAW', category: 'Weapon', base: 'Base Alpha', quantity: 80, status: 'Available', description: 'Squad automatic weapon' },
            { name: 'M240B', category: 'Weapon', base: 'Base Bravo', quantity: 45, status: 'Available', description: 'Medium machine gun' },
            { name: 'Javelin Missile', category: 'Weapon', base: 'Base Bravo', quantity: 25, status: 'Available', description: 'Anti-tank missile system' },
            { name: '5.56mm NATO', category: 'Ammunition', base: 'Base Alpha', quantity: 50000, status: 'Available', description: 'Standard rifle ammunition' },
            { name: '7.62mm NATO', category: 'Ammunition', base: 'Base Alpha', quantity: 30000, status: 'Available', description: 'Machine gun ammunition' },
            { name: '40mm Grenade', category: 'Ammunition', base: 'Base Bravo', quantity: 2000, status: 'Available', description: 'Grenade launcher rounds' },
            { name: '.50 BMG', category: 'Ammunition', base: 'Base Bravo', quantity: 15000, status: 'Available', description: 'Heavy machine gun rounds' },
            { name: 'MRAP', category: 'Vehicle', base: 'Base Alpha', quantity: 10, status: 'Available', description: 'Mine-resistant vehicle' },
            { name: 'M110 SASS', category: 'Weapon', base: 'Base Alpha', quantity: 20, status: 'Available', description: 'Semi-auto sniper system' },
        ]);

        console.log('Database seeded successfully');
        console.log('--- Login Credentials ---');
        console.log('Admin:      admin / admin123');
        console.log('Commander:  commander_alpha / cmd123  (Base Alpha)');
        console.log('Commander:  commander_bravo / cmd123  (Base Bravo)');
        console.log('Logistics:  logistics / log123');
    } catch (err) {
        console.error('Seeding error:', err);
    }
};

module.exports = seedData;
