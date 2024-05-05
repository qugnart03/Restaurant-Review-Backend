const userModel = require("../models/userModel");
const User = require("../models/userModel");
const ErrorResponse = require("../utils/errorResponse");
const cloudinary = require("../utils/cloudinary");
const sendEmail = require("../utils/sendEmail");

//SIGN UP
exports.signup = async (req, res, next) => {
  const { email } = req.body;

  try {
    const userExist = await User.exists({ email });

    if (userExist) {
      return next(new ErrorResponse("E-mail already registered", 400));
    }

    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

//SIGN IN
exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorResponse("Please provide email and password", 403));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return next(new ErrorResponse("Invalid credentials", 400));
    }

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

//SEND TOKEN
const sendTokenResponse = async (user, codeStatus, res) => {
  try {
    const token = await user.getJwtToken();

    const options = { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true }; // 7 days
    if (process.env.NODE_ENV === "production") {
      options.secure = true;
    }

    res.status(codeStatus).cookie("token", token, options).json({
      success: true,
      id: user._id,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

//LOG OUT
exports.logout = (req, res, next) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "logged out",
  });
};

//USER PROFILE
exports.userProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

//UPDATE USER
exports.updateUser = async (req, res, next) => {
  try {
    const { email, name, phone } = req.body;

    const user = await userModel.findOne(
      { email },
      { email: 1, name: 1, address: 1, phone: 1 }
    );

    if (user.name === name && user.phone === phone && !req.file) {
      return res
        .status(200)
        .json({ success: true, message: "User information unchanged", user });
    }

    const data = {
      name: name || user.name,
      phone: phone || user.phone,
    };

    if (req.file) {
      if (user.image && user.image.public_id) {
        await cloudinary.uploader.destroy(user.image.public_id);
      }

      const newImage = await cloudinary.uploader.upload(req.file.path, {
        folder: "avatars",
        width: 200,
        crop: "scale",
      });

      data.image = {
        public_id: newImage.public_id,
        url: newImage.secure_url,
      };
    }

    const userUpdate = await userModel.findByIdAndUpdate(user._id, data, {
      new: true,
    });

    res.status(200).json({
      success: true,
      userUpdate,
    });
  } catch (error) {
    next(error);
  }
};

//LOGIN WITH TOKEN
exports.loginWithToken = async (req, res, next) => {
  try {
    const { id } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    // Gửi token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

const VerifyUser = require("../models/verifyUser");

exports.sendVerificationEmail = async (req, res) => {
  try {
    const user = req.user;

    const verificationKey = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await VerifyUser.create({ userId: user._id, key: verificationKey });

    const emailSubject = "Email Verification";
    const emailContent = `Your verification code is: ${verificationKey}`;
    await sendEmail(user.email, emailSubject, emailContent);

    res.status(200).send({ message: "Verification email sent successfully" });
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).send({ message: "Failed to send verification email" });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { key } = req.body;

    const verifyUser = await VerifyUser.findOne({ userId: req.user._id, key });

    if (!verifyUser) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid verification key" });
    }

    await User.updateOne({ _id: req.user._id }, { verified: true });

    await VerifyUser.deleteOne({ _id: verifyUser._id });

    res
      .status(200)
      .send({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

exports.searchUserByName = async (req, res, next) => {
  try {
    const searchTerm = req.params.name.toLowerCase();

    if (!searchTerm.trim()) {
      const allUsers = await User.find();
      return res.status(200).json({
        success: true,
        users: allUsers,
      });
    }

    const foundUsers = await User.find({
      name: { $regex: new RegExp(searchTerm, "i") },
    });

    if (foundUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found with the provided search term",
      });
    }

    res.status(200).json({
      success: true,
      users: foundUsers,
    });
  } catch (error) {
    next(error);
  }
};
