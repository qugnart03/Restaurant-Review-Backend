const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(
      `CONNECTED TO DATABASE ${mongoose.connection.host}`.bgCyan.white
    );
  } catch (E) {
    console.log(`ERROR IN CONNECTING DATABASE - ${E}`.bgRed.white);
  }
};

module.exports = connectDB;
