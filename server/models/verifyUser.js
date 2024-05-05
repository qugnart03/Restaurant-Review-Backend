const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const verifyUserSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "user",
    unique: true,
  },
  key: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 },
});

module.exports = mongoose.model("verifyUsers", verifyUserSchema);
