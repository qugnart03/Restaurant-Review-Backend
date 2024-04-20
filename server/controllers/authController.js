const userModel = require("../models/userModel");
const User = require("../models/userModel");
const ErrorResponse = require("../utils/errorResponse");
const cloudinary = require("../utils/cloudinary");

//SIGN UP
exports.signup = async (req, res, next) => {
  const { email } = req.body;
  const userExist = await User.findOne({ email });
  if (userExist) {
    return next(new ErrorResponse("E-mail already registred", 400));
  }
  try {
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
    //VALIDATION
    if (!email) {
      return next(new ErrorResponse("Please add an email", 403));
    }
    if (!password) {
      return next(new ErrorResponse("Please add a password", 403));
    }

    //CHECK USER EMAIL
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 400));
    }
    //CHECK PASSWORD
    const isMatched = await user.comparePassword(password);
    if (!isMatched) {
      return next(new ErrorResponse("Invalid credentials", 400));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

const sendTokenResponse = async (user, codeStatus, res) => {
  const token = await user.getJwtToken();
  const options = { maxAge: 60 * 60 * 1000, httpOnly: true };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res.status(codeStatus).cookie("token", token, options).json({
    success: true,
    id: user._id,
    role: user.role,
  });
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
  const user = await User.findById(req.user.id).select("-password");
  res.status(200).json({
    success: true,
    user,
  });
};

//UPDATE USER
/*

*/

exports.updateUser = async (req, res, next) => {
  try {
    const { email, name, address, phone, image } = req.body;
    const user = await userModel.findOne({ email });

    //BUILD THE OBJECT DATA
    const data = {
      name: name || user.name,
      address: address || user.address,
      phone: phone || user.phone,
      image: image || user.image,
    };

    //MODIFY POST IMAGE CONDITIONALLY
    if (req.body.image !== "") {
      const ImgId = user.image.public_id;
      if (ImgId) {
        await cloudinary.uploader.destroy(ImgId);
      }

      const newImage = await cloudinary.uploader.upload(req.body.image, {
        folder: "avatars",
        width: 1200,
        crop: "scale",
      });

      data.image = {
        public_id: newImage.public_id,
        url: newImage.secure_url,
      };
    }

    const userUpdate = await userModel.findByIdAndUpdate(user, data, {
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
