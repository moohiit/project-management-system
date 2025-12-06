import bcrypt from "bcrypt";
import "dotenv/config.js";
import { User } from "../models/user.model.js";
import { connectDB } from "../config/db.js";

const createAdminUser = async () => {
  try {
    // Connect to DB
    await connectDB();

    const username = "admin";
    const password = "Pass@1234#"; // your given password

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists. Skipping creation.");
      process.exit(0);
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin
    await User.create({
      username,
      passwordHash,
      role: "Admin",
    });

    console.log("✅ Admin user created successfully!");
    console.log("👤 Username:", username);
    console.log("🔑 Password:", password);
    console.log("🎭 Role: Admin");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
};

createAdminUser();
