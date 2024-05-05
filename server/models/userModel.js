const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "First name is required"],
      maxlength: 32,
    },

    email: {
      type: String,
      trim: true,
      required: [true, "E-mail is required"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is required"],
      minlength: [6, "Password must have at least (6) characters"],
    },

    image: {
      url: { type: String, default: null },
      public_id: { type: String, default: null },
    },

    phone: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      default: "user",
    },

    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }],

    verified: {
      type: Boolean,
      default: false,
    },

    vouchers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Voucher" }],
  },
  { timestamps: true }
);

// ENCRYPTING PASSWORD BEFORE SAVING
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// COMPARE USER PASSWORD
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// RETURN A JWT TOKEN
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: 3600,
  });
};

module.exports = mongoose.model("User", userSchema);
