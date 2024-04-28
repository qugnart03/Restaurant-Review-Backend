const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const dataTypeRestaurant = [
  "frenchrestaurant",
  "italianrestaurant",
  "germanrestaurant",
  "chineserestaurant",
];

const restaurantSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please fill name of restaurant"],
    },
    type: {
      type: String,
      required: [true, ""],
      enum: dataTypeRestaurant,
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
      name: { type: String, default: "" },
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

    coordinates: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
    },

    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;
