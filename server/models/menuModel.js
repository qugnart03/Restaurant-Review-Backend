const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const menuItemSchema = new Schema({
  typeDish: {
    type: String,
    required: true,
  },
  nameDish: {
    type: String,
    required: true,
  },
  priceDish: {
    type: Number,
    required: true,
  },
  image: {
    url: String,
    public_id: String,
  },
});

const menuSchema = new Schema({
  restaurant: {
    type: ObjectId,
    ref: "Restaurant",
    required: true,
  },
  items: [menuItemSchema],
});

const Menu = mongoose.model("Menu", menuSchema);

module.exports = Menu;
