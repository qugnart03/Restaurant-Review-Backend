const User = require("../../models/userModel");
const Post = require("../../models/postModel");
const Restaurant = require("../../models/restaurantModel");
const cloudinary = require("../../utils/cloudinary");

exports.getCounts = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const restaurantCount = await Restaurant.countDocuments();

    res.status(200).json({
      success: true,
      counts: {
        user: userCount,
        post: postCount,
        restaurant: restaurantCount,
      },
    });
  } catch (error) {
    console.error("Error while fetching counts:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

exports.getLatestUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(6);

    const data = users.map((user) => ({
      name: user.name,
      image: user.image,
      createdAt: user.createdAt,
    }));

    res.status(200).json({
      success: true,
      users: data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPopularRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.aggregate([
      {
        $project: {
          name: 1,
          image: 1, // Include the image field
          bookmarksCount: { $size: "$bookmarks" },
          commentsCount: { $size: "$comments" },
          status: 1,
          type: 1,
        },
      },
      {
        $sort: { bookmarksCount: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    res.status(200).json({
      success: true,
      restaurants,
    });
  } catch (error) {
    console.error("Error fetching top bookmarked restaurants:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

exports.updateRestaurantById = async (req, res, next) => {
  try {
    const { name, type, timeWork, phone, description, address, image } =
      req.body;

    const idRestaurant = req.params.idRestaurant;
    if (!idRestaurant) {
      return res
        .status(400)
        .json({ success: false, message: "idRestaurant is required." });
    }

    const currentRestaurant = await Restaurant.findOne({
      _id: idRestaurant,
    });

    if (!currentRestaurant) {
      return res.status(404).json({
        success: false,
        message:
          "Restaurant not found or you do not have permission to update.",
      });
    }

    const startTime = timeWork ? timeWork.start : undefined;
    const endTime = timeWork ? timeWork.end : undefined;

    const data = {
      name: name || currentRestaurant.name,
      type: type || currentRestaurant.type,
      timeWork: {
        start: startTime || currentRestaurant.timeWork.start,
        end: endTime || currentRestaurant.timeWork.end,
      },
      phone: phone || currentRestaurant.phone,
      description: description || currentRestaurant.description,
      address: address || currentRestaurant.address,
    };

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

    const restaurantUpdate = await Restaurant.findByIdAndUpdate(
      idRestaurant,
      data,
      { new: true }
    );

    res.status(200).json({
      success: true,
      restaurantUpdate,
    });
  } catch (error) {
    console.error("Error updating restaurant:", error);
    next(error);
  }
};

exports.getRestaurantById = async (req, res, next) => {
  try {
    const { idRestaurant } = req.params;

    const restaurant = await Restaurant.findOne(
      { _id: idRestaurant },
      {
        name: 1,
        type: 1,
        phone: 1,
        description: 1,
        address: 1,
        timeWork: 1,
        image: 1,
        status: 1,
      }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found for this ID",
      });
    }

    res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { idUser } = req.params;

    const user = await User.findOne(
      { _id: idUser },
      {
        email: 1,
        name: 1,
        type: 1,
        phone: 1,
        address: 1,
        image: 1,
        role: 1,
      }
    );

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

//DELETE RESTAURANT
exports.deleteUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.idUser);

    const ImgId = user.image.public_id;
    if (ImgId) {
      await cloudinary.uploader.destroy(ImgId);
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted",
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserById = async (req, res, next) => {
  try {
    const { name, address, phone, image, role } = req.body;

    const user = await User.findById(req.params.idUser);

    if (
      user.name === name &&
      user.address === address &&
      user.phone === phone &&
      user.role === role &&
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
      role: role || user.role,
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

    const userUpdate = await User.findByIdAndUpdate(user._id, data, {
      new: true,
    });
    console.log(userUpdate);

    res.status(200).json({
      success: true,
      userUpdate,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $lookup: {
          from: "users", // Tên của collection chứa thông tin người dùng
          localField: "postedBy",
          foreignField: "_id",
          as: "postedBy",
        },
      },
      {
        $addFields: {
          countComment: { $size: "$comments" }, // Đếm số lượng bình luận
          countLike: { $size: "$likes" }, // Đếm số lượt thích
        },
      },
      {
        $project: {
          image: 1,
          title: 1,
          content: 1,
          "postedBy.name": 1,
          countComment: 1,
          countLike: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

const moment = require("moment");

exports.getBookmarkAndCommentStats = async (req, res) => {
  try {
    // Lấy dữ liệu tất cả nhà hàng
    const restaurants = await Restaurant.find(
      {},
      { _id: 1, name: 1, comments: 1 }
    );

    // Khởi tạo mảng để lưu trữ kết quả
    const commentCountsByRestaurant = {};

    // Lặp qua từng nhà hàng để tính tổng số comment trong từng ngày của tuần
    restaurants.forEach((restaurant) => {
      const { _id, name, comments } = restaurant;
      const commentStats = {};

      // Lặp qua từng comment của nhà hàng để phân loại theo ngày trong tuần
      comments.forEach((comment) => {
        const createdDate = moment(comment.created);
        const dayOfWeek = createdDate.day(); // Lấy ngày trong tuần (0: Chủ nhật, 1: Thứ 2, ..., 6: Thứ 7)
        commentStats[dayOfWeek] = (commentStats[dayOfWeek] || 0) + 1; // Tăng số comment của ngày đó lên 1
      });

      // Lưu tổng số comment của từng ngày trong tuần vào mảng kết quả
      commentCountsByRestaurant[_id] = { name: name };
      for (let i = 0; i < 7; i++) {
        commentCountsByRestaurant[_id][i] = commentStats[i] || 0;
      }
    });

    // Trả về kết quả
    res.json({ success: true, commentCountsByRestaurant });
  } catch (error) {
    console.error("Error while getting bookmark and comment stats:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
