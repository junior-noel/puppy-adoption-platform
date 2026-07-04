import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("✗ MONGO_URI not found in server/.env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas");

    // Find the admin account
    const admin = await User.findOne({ role: "admin" });

    if (!admin) {
      console.error(
        "\n✗ No admin account found. Run node seed/createAdmin.js first.\n",
      );
      process.exit(1);
    }

    const newEmail = process.env.ADMIN_EMAIL;
    const newPassword = process.env.ADMIN_PASSWORD;
    const newName = process.env.ADMIN_NAME;

    let changed = false;

    if (newEmail && newEmail !== admin.email) {
      // Check the new email isn't already taken by someone else
      const taken = await User.findOne({
        email: newEmail,
        _id: { $ne: admin._id },
      });
      if (taken) {
        console.error(
          `\n✗ Email ${newEmail} is already in use by another account.\n`,
        );
        process.exit(1);
      }
      admin.email = newEmail;
      changed = true;
      console.log(`  Email    → ${newEmail}`);
    }

    if (newPassword) {
      // Assigning triggers the pre-save hash in the User model
      admin.password = newPassword;
      changed = true;
      console.log(`  Password → updated`);
    }

    if (newName && newName !== admin.name) {
      admin.name = newName;
      changed = true;
      console.log(`  Name     → ${newName}`);
    }

    if (!changed) {
      console.log(
        "\n  Nothing to update — values in .env match the current admin account.\n",
      );
      process.exit(0);
    }

    await admin.save();
    console.log("\n✓ Admin account updated successfully!\n");

    process.exit(0);
  } catch (err) {
    console.error("\n✗ Failed:", err.message, "\n");
    process.exit(1);
  }
};

run();
