// scripts/seed.js
// Run with: node scripts/seed.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/complaint-system";

const UserSchema = new mongoose.Schema({ name: String, email: String, password: String, role: String, department: String, rollNo: String, isActive: { type: Boolean, default: true } }, { timestamps: true });
const CategorySchema = new mongoose.Schema({ name: String, description: String, isActive: { type: Boolean, default: true } }, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // Clear existing
  await User.deleteMany({});
  await Category.deleteMany({});

  const hash = (p) => bcrypt.hashSync(p, 12);

  // Create users
  await User.create([
    { name: "Admin User", email: "admin@juit.ac.in", password: hash("admin123"), role: "admin", department: "Administration" },
    { name: "Dr. Rajesh Kumar", email: "staff@juit.ac.in", password: hash("staff123"), role: "staff", department: "CSE" },
    { name: "Mr. Suresh Sharma", email: "staff2@juit.ac.in", password: hash("staff123"), role: "staff", department: "Infrastructure" },
    { name: "Rahul Verma", email: "student@juit.ac.in", password: hash("student123"), role: "student", department: "CSE", rollNo: "241030001" },
    { name: "Priya Singh", email: "student2@juit.ac.in", password: hash("student123"), role: "student", department: "IT", rollNo: "241030002" },
  ]);
  console.log("✅ Users created");

  // Create categories
  await Category.create([
    { name: "Infrastructure", description: "Issues related to buildings, classrooms, labs" },
    { name: "Academic", description: "Curriculum, faculty, teaching quality issues" },
    { name: "Hostel", description: "Hostel facilities, food, maintenance" },
    { name: "Library", description: "Library resources, books, access" },
    { name: "IT & Network", description: "Internet, computers, software issues" },
    { name: "Transportation", description: "Bus services and campus transport" },
    { name: "Administration", description: "Administrative processes and documentation" },
    { name: "Other", description: "Any other issues not covered above" },
  ]);
  console.log("✅ Categories created");

  console.log("\n🎉 Seed complete! Login credentials:");
  console.log("Admin:   admin@juit.ac.in / admin123");
  console.log("Staff:   staff@juit.ac.in / staff123");
  console.log("Student: student@juit.ac.in / student123");

  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
