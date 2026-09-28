import readline from 'readline';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdminInteractive() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/noble_housing';
    console.log('\n======================================================');
    console.log('   NOBLE HOUSEKEEPING & CONTRACTING - CREATE ADMIN    ');
    console.log('======================================================\n');
    console.log(`Connecting to MongoDB: ${mongoUri}...`);

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully.\n');

    const name = (await askQuestion('Enter Admin Name (default: Super Admin): ')) || 'Super Admin';
    let email = '';
    while (!email || !email.includes('@')) {
      email = await askQuestion('Enter Admin Email Address: ');
      if (!email || !email.includes('@')) {
        console.log('⚠️ Please enter a valid email address.');
      }
    }

    let password = '';
    while (!password || password.length < 6) {
      password = await askQuestion('Enter Admin Password (min 6 chars): ');
      if (!password || password.length < 6) {
        console.log('⚠️ Password must be at least 6 characters.');
      }
    }

    // Check if admin already exists
    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      const updateChoice = await askQuestion(`\n⚠️ Admin with email "${email}" already exists. Overwrite password? (y/N): `);
      if (updateChoice.toLowerCase() === 'y') {
        const salt = await bcrypt.genSalt(10);
        existing.password = await bcrypt.hash(password, salt);
        existing.name = name;
        await existing.save();
        console.log('\n🎉 Admin password updated successfully!');
      } else {
        console.log('\nOperation cancelled. No changes made.');
      }
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newAdmin = await Admin.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'admin'
      });

      console.log('\n======================================================');
      console.log('🎉 SUCCESS! Admin Created Successfully:');
      console.log(`👤 Name:     ${newAdmin.name}`);
      console.log(`📧 Email:    ${newAdmin.email}`);
      console.log(`🔑 Password: (as entered)`);
      console.log('======================================================\n');
    }

  } catch (err) {
    console.error('\n❌ Error creating admin:', err.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdminInteractive();
