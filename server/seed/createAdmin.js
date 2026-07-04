import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('✗ MONGO_URI not found. Check that server/.env exists and has MONGO_URI set.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    const email    = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name     = process.env.ADMIN_NAME || 'PawHome Admin';

    if (!email || !password) {
      console.error(
        '\n✗ ADMIN_EMAIL and ADMIN_PASSWORD must be set in server/.env\n\n' +
        'Add these lines then run the script again:\n\n' +
        '  ADMIN_EMAIL=admin@pawhome.com\n' +
        '  ADMIN_PASSWORD=YourStrongPassword123\n'
      );
      process.exit(1);
    }

    const existing = await User.findOne({ email });

    if (existing) {
      if (existing.role === 'admin') {
        console.log(`\n✓ Admin account already exists: ${email}`);
        console.log('  No changes made.\n');
      } else {
        existing.role = 'admin';
        await existing.save();
        console.log(`\n✓ Promoted existing user to admin: ${email}\n`);
      }
      process.exit(0);
    }

    const admin = await User.create({ name, email, password, role: 'admin' });

    console.log('\n✓ Admin account created successfully!');
    console.log(`  Name:  ${admin.name}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role:  ${admin.role}`);
    console.log('\n  You can now log in at /login with these credentials.\n');

    process.exit(0);
  } catch (err) {
    console.error('\n✗ Failed:', err.message, '\n');
    process.exit(1);
  }
};

run();