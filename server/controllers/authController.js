const userModel = require("../models/userModel");
const User = require("../models/userModel");
const ErrorResponse = require("../utils/errorResponse");
const cloudinary = require("../utils/cloudinary");

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
  if (req.cookies.token) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }

  return res.status(400).json({
    success: false,
    message: "You are not logged in",
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
    const { email, name, address, phone } = req.body;

    const user = await userModel.findOne(
      { email },
      { email: 1, name: 1, address: 1, phone: 1 }
    );

    if (
      user.name === name &&
      user.address === address &&
      user.phone === phone &&
      !req.file
    ) {
      return res
        .status(200)
        .json({ success: true, message: "User information unchanged", user });
    }

    const data = {
      name: name || user.name,
      address: address || user.address,
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

exports.updateRestaurantById = async (req, res, next) => {
  try {
    console.log("Updating restaurant...");

    const {
      name,
      type,
      country,
      timeWork,
      phone,
      description,
      address,
      image,
    } = req.body;

    console.log("Request body:", req.body);

    // Kiểm tra xem idRestaurant có được truyền từ request không
    const idRestaurant = req.params.idRestaurant;
    if (!idRestaurant) {
      return res
        .status(400)
        .json({ success: false, message: "idRestaurant is required." });
    }

    // Tìm nhà hàng dựa trên idRestaurant và xác thực xem người dùng có quyền chỉnh sửa hay không
    const currentRestaurant = await Restaurant.findOne({
      _id: idRestaurant,
    });

    // Nếu không tìm thấy nhà hàng hoặc người dùng không có quyền chỉnh sửa, trả về lỗi 404
    if (!currentRestaurant) {
      return res.status(404).json({
        success: false,
        message:
          "Restaurant not found or you do not have permission to update.",
      });
    }

    console.log("Current restaurant:", currentRestaurant);

    const startTime = timeWork ? timeWork.start : undefined;
    const endTime = timeWork ? timeWork.end : undefined;

    console.log("Start time:", startTime);
    console.log("End time:", endTime);

    const data = {
      name: name || currentRestaurant.name,
      type: type || currentRestaurant.type,
      country: country || currentRestaurant.country,
      timeWork: {
        start: startTime || currentRestaurant.timeWork.start,
        end: endTime || currentRestaurant.timeWork.end,
      },
      phone: phone || currentRestaurant.phone,
      description: description || currentRestaurant.description,
      address: address || currentRestaurant.address,
    };

    console.log("Update data:", data);

    if (image !== "") {
      const ImgId = currentRestaurant.image.public_id;
      if (ImgId) {
        await cloudinary.uploader.destroy(ImgId);
      }

      const newImage = await cloudinary.uploader.upload(req.file.path, {
        folder: "restaurants",
        width: 1200,
        crop: "scale",
      });

      data.image = {
        public_id: newImage.public_id,
        url: newImage.secure_url,
      };
    }

    console.log("Final data for update:", data);

    // Cập nhật thông tin của nhà hàng
    const restaurantUpdate = await Restaurant.findByIdAndUpdate(
      idRestaurant,
      data,
      { new: true }
    );

    console.log("Updated restaurant:", restaurantUpdate);

    res.status(200).json({
      success: true,
      restaurantUpdate,
    });
  } catch (error) {
    console.error("Error updating restaurant:", error);
    next(error);
  }
};
