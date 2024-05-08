const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

exports.showNotificationById = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate({
        path: "restaurant",
        select: "name image",
      })
      .exec();
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }
    res.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

exports.showAllNotificationOfUser = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("bookmarks");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const bookmarkedRestaurantIds = user.bookmarks.map(
      (bookmark) => bookmark._id
    );
    const notifications = await Notification.find({
      restaurant: { $in: bookmarkedRestaurantIds },
    }).populate("restaurant", "name image");

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
};

exports.updateNotificationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    ).populate({
      path: "restaurant",
      select: "name image",
    });

    if (!updatedNotification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, notification: updatedNotification });
  } catch (error) {
    next(error);
  }
};
