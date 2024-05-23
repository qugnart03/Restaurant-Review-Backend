const cloudinary = require("../utils/cloudinary");
const ErrorResponse = require("../utils/errorResponse");
const main = require("../server");
const Restaurant = require("../models/restaurantModel");
const User = require("../models/userModel");
const Voucher = require("../models/vouncherModel");
const moment = require("moment");
const Notification = require("../models/notificationModel");

// exports.createVoucher = async (req, res, next) => {
//   try {
//     const { discount, content, startDate, endDate } = req.body;

//     const restaurant = await Restaurant.findOne({
//       postedBy: req.user._id,
//     });
//     if (!restaurant) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Restaurant not found" });
//     }

//     const startDateObj = moment(startDate, "YYYY-MM-DD").toDate();
//     const endDateObj = moment(endDate, "YYYY-MM-DD").toDate();

//     const newVoucher = new Voucher({
//       code: generateVoucherCode(),
//       discount: discount,
//       content: content,
//       restaurant: restaurant._id,
//       startDate: startDateObj,
//       endDate: endDateObj,
//     });

//     await newVoucher.save();

//     const newNotification = new Notification({
//       message: `${restaurant.name} added a voucher for up to ${discount}% off from ${startDate} to ${endDate}`,
//       type: "voucher",
//       restaurant: restaurant._id,
//       vouncher: newVoucher._id,
//     });
//     await newNotification.save();

//     res.status(201).json({ success: true, data: newVoucher });
//   } catch (error) {
//     next(error);
//   }
// };

exports.createVoucher = async (req, res, next) => {
  try {
    const { discount, content, startDate, endDate } = req.body;
    const { _id: userId } = req.user;

    const restaurant = await Restaurant.findOne({ postedBy: userId });
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    const startDateObj = moment.utc(startDate, "YYYY-MM-DD").toDate();
    const endDateObj = moment.utc(endDate, "YYYY-MM-DD").toDate();

    const newVoucher = new Voucher({
      code: generateVoucherCode(),
      discount: discount,
      content: content,
      restaurant: restaurant,
      startDate: startDateObj,
      endDate: endDateObj,
    });

    const newNotification = new Notification({
      message: `${restaurant.name} added a voucher for up to ${discount}% off from ${startDate} to ${endDate}`,
      type: "voucher",
      restaurant: restaurant._id,
      vouncher: newVoucher._id,
    });

    const [savedVoucher, savedNotification] = await Promise.all([
      newVoucher.save(),
      newNotification.save(),
    ]);

    const populatedVoucher = await Voucher.findById(savedVoucher._id).populate({
      path: "restaurant",
      match: { postedBy: userId },
      select: "_id name image",
    });

    res.status(201).json({ success: true, data: populatedVoucher });
  } catch (error) {
    next(error);
  }
};

const generateVoucherCode = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const codeLength = 8;
  let code = "";
  for (let i = 0; i < codeLength; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

exports.showVoucherWithRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ postedBy: req.user._id });

    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    const restaurantVouchers = await Voucher.find({
      restaurant: restaurant._id,
    })
      .populate({
        path: "restaurant",
        match: { postedBy: req.user._id },
        select: "_id name image",
      })
      .exec();

    res.status(200).json({ success: true, data: restaurantVouchers });
  } catch (error) {
    next(error);
  }
};

exports.showVoucherOfRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.idRes);

    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    const vouchers = await Voucher.find({ restaurant: req.params.idRes })
      .populate({
        path: "restaurant",
        match: { postedBy: req.user._id },
        select: "_id name image",
      })
      .select("_id code discount content startDate endDate users createdAt")
      .exec();
    res.status(200).json({ success: true, data: vouchers });
  } catch (error) {
    next(error);
  }
};

exports.updateVoucherById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { discount, content, startDate, endDate } = req.body;

    const voucher = await Voucher.findById(id);
    if (!voucher) {
      return res
        .status(404)
        .json({ success: false, message: "Voucher not found" });
    }

    if (discount) {
      voucher.discount = discount;
    }
    if (content) {
      voucher.content = content;
    }
    if (startDate) {
      voucher.startDate = moment.utc(startDate, "YYYY-MM-DD").toDate();
    }
    if (endDate) {
      voucher.endDate = moment.utc(endDate, "YYYY-MM-DD").toDate();
    }

    await voucher.save();
    const voucherWithRestaurant = await Voucher.findById(voucher._id).populate(
      "restaurant",
      "_id name image"
    );

    res.status(200).json({ success: true, data: voucherWithRestaurant });
  } catch (error) {
    next(error);
  }
};

exports.deleteVoucherById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const voucher = await Voucher.findById(id);
    if (!voucher) {
      return res
        .status(404)
        .json({ success: false, message: "Voucher not found" });
    }

    await Voucher.deleteOne({ _id: id });

    res
      .status(200)
      .json({ success: true, message: "Voucher deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.toggleVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res
        .status(404)
        .json({ success: false, message: "Voucher not found" });
    }

    const userExist = voucher.users.includes(req.user._id);

    if (userExist) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists in voucher" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!voucher.users.includes(req.user._id)) {
      voucher.users.push(req.user._id);
      await voucher.save();

      user.vouchers.push(req.params.id);
      await user.save();

      return res
        .status(200)
        .json({ success: true, message: "User added to voucher" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "User already exists in voucher" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.showUserVouchers = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const userVouchers = await Voucher.find({ users: userId })
      .populate({
        path: "restaurant",
        select: "name image",
      })
      .exec();

    res.status(200).json({ success: true, vouchers: userVouchers });
  } catch (error) {
    next(error);
  }
};
