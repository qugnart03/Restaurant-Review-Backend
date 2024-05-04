const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const voucherSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
    },
    content: {
      type: String,
      default: "",
    },
    restaurant: {
      type: ObjectId,
      ref: "Restaurant",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    users: [{ type: ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Voucher = mongoose.model("Voucher", voucherSchema);

module.exports = Voucher;
