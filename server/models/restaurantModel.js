const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const validTypes = [
  "Nhà Hàng Pháp",
  "Nhà Hàng Ý",
  "Nhà Hàng Trung Hoa",
  "Nhà Hàng Á",
  "Nhà Hàng Âu",
];

const restaurantSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please fill name of restaurant"],
    },
    type: {
      type: String,
      required: true,
      //enum: validTypes,
    },
    country: {
      type: String,
      required: true,
    },
    timeWork: {
      start: {
        type: String,
        required: true,
      },
      end: {
        type: String,
        required: true,
      },
    },
    phone: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    image: {
      url: { type: String, default: null },
      public_id: { type: String, default: null },
    },
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
    bookmarks: [{ type: ObjectId, ref: "User" }],
    comments: [
      {
        text: String,
        created: { type: Date, default: Date.now },
        postedBy: {
          type: ObjectId,
          ref: "User",
        },
      },
    ],
  },
  { timestamps: true }
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;
