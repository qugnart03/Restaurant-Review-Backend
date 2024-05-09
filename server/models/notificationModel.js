const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["restaurant", "menu", "voucher"],
    required: true,
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: "Restaurant",
  },
  menu: {
    type: Schema.Types.ObjectId,
    ref: "Menu",
  },
  voucher: {
    type: Schema.Types.ObjectId,
    ref: "Voucher",
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
