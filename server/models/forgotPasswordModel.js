const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const forgotPasswordSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  key: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 },
});

module.exports = mongoose.model("forgotPassword", forgotPasswordSchema);
