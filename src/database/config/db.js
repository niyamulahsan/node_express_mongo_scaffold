const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`Database connected: mongodb://${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;