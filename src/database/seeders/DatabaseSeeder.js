const mongoose = require("mongoose");
const connectDB = require("../config/db");
const bcrypt = require("bcrypt");

const Role = require("../models/roleSchema");
const User = require("../models/userSchema");

connectDB();

const importData = async () => {
  try {
    await Role.deleteMany();
    await User.deleteMany();

    await Role.insertMany([{ name: "admin" }, { name: "user" }]);

    const roleid = await Role.findOne({ name: "admin" });

    await User.create({ name: "admin", email: "niyam@mail.com", password: await bcrypt.hash("admin", 10), forget_password: "admin", status: "active", role: roleid._id });

    console.log(`Data imported`);
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Role.deleteMany();
    await User.deleteMany();

    console.log("Data destroyed");
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}