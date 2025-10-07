const mongoose = require("mongoose");
const Employee = require("./models/Employee");
const bcrypt = require("bcryptjs");
require('dotenv').config({ path: './config.env' });
const Department = require("./models/Department"); 
  mongoose.connect(process.env.MONGODB_URI);
async function createAdmin() {
  try {
    const exists = await Employee.findOne({ role: "admin" });
    if (exists) {
      console.log("✅ Admin already exists");
      return process.exit();
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 12);

    const admin = new Employee({
      name: "Admin User",
      email: "admin@example.com",
      password: "Admin@123",
      extension: "1000",
      department: "68cc4fe7b76cb6df68137e30", // must exist
      phone: "+201000000000",
      position: "System Administrator",
      role: "admin",
      permissions: [
        "view_employees",
        "create_employees",
        "edit_employees",
        "delete_employees",
        "view_departments",
        "create_departments",
        "edit_departments",
        "delete_departments",
        "view_analytics",
        "export_data",
        "manage_users",
        "view_audit_logs",
        "system_settings"
      ]
    });

    await admin.save();
    console.log("✅ Admin created successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding admin:", err);
    process.exit(1);
  }
}

createAdmin();
