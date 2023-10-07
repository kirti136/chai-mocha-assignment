require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(process.env.MongoURL);
  console.log(`Connected to Database`);
};

module.exports = {
  connectDB,
};
