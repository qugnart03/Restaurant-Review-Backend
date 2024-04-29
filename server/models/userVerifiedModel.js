const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const userVerificationSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  uniqueString: {
    type: String,
    required: true,
  },
  createAt: {
    type: Number,
    required: true,
  },
  image: {
    url: String,
    public_id: String,
  },
});

const UserVerification = mongoose.model(
  "UserVerification",
  userVerificationSchema
);

module.exports = UserVerification;
