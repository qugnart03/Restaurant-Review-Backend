const User = require("../../models/userModel");
const Post = require("../../models/postModel");
const Restaurant = require("../../models/restaurantModel");
const cloudinary = require("../../utils/cloudinary");
const moment = require("moment");
const Menu = require("../../models/menuModel");
const mongoose = require("mongoose");

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
          image: 1,
          postedBy: 1,
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
        $limit: 6,
      },
    ]);

    res.status(200).json({
      success: true,
      restaurants,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

exports.updateRestaurantById = async (req, res, next) => {
  try {
    const idRestaurant = req.params.idRestaurant;

    if (!idRestaurant) {
      return res
        .status(400)
        .json({ success: false, message: "Restaurant not found." });
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

    const { name, type, timeWork, phone, description, address, image } =
      req.body;

    if (
      currentRestaurant.name === name &&
      currentRestaurant.type === type &&
      currentRestaurant.timeWork === timeWork &&
      currentRestaurant.phone === phone &&
      currentRestaurant.description === description &&
      currentRestaurant.address === address &&
      !req.file
    ) {
      return res
        .status(200)
        .json({ success: true, message: "User information unchanged", user });
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

    if (req.file) {
      if (currentRestaurant.image && currentRestaurant.image.public_id) {
        await cloudinary.uploader.destroy(currentRestaurant.image.public_id);
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
    const idRestaurant = req.params.idRestaurant;

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
    const { name, address, phone, role } = req.body;

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
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "postedBy",
        },
      },
      {
        $addFields: {
          countComment: { $size: "$comments" },
          countLike: { $size: "$likes" },
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

exports.getBookmarkAndCommentStats = async (req, res) => {
  try {
    const restaurants = await Restaurant.find(
      {},
      { _id: 1, name: 1, comments: 1 }
    );

    const commentCountsByRestaurant = {};

    restaurants.forEach((restaurant) => {
      const { _id, name, comments } = restaurant;
      const commentStats = {};

      comments.forEach((comment) => {
        const createdDate = moment(comment.created);
        const dayOfWeek = createdDate.day();
        commentStats[dayOfWeek] = (commentStats[dayOfWeek] || 0) + 1;
      });

      commentCountsByRestaurant[_id] = { name: name };
      for (let i = 0; i < 7; i++) {
        commentCountsByRestaurant[_id][i] = commentStats[i] || 0;
      }
    });

    res.json({ success: true, commentCountsByRestaurant });
  } catch (error) {
    console.error("Error while getting bookmark and comment stats:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getPostRecent = async (req, res, next) => {
  try {
    const posts = await Post.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "postedBy",
        },
      },
      {
        $project: { image: 1, title: 1, "postedBy.name": 1, createdAt: 1 },
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

exports.deleteRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.idRestaurant);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const ImgId = restaurant.image.public_id;
    if (ImgId) {
      await cloudinary.uploader.destroy(ImgId);
    }

    await restaurant.deleteOne();

    res.status(200).json({
      success: true,
      message: "Restaurant deleted",
    });
  } catch (error) {
    next(error);
  }
};

exports.showMenuByRestaurantId = async (req, res, next) => {
  try {
    const { idRestaurant } = req.params;

    const restaurant = await Restaurant.findById(idRestaurant);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    const menu = await Menu.findOne({ restaurant: idRestaurant });
    if (!menu) {
      return res.status(200).json({
        success: true,
        menu: { items: [] },
      });
    }

    res.status(200).json({
      success: true,
      menu,
    });
  } catch (error) {
    next(error);
  }
};

exports.getItemsById = async (req, res, next) => {
  try {
    const { idItem } = req.params;

    const menu = await Menu.findOne({ "items._id": idItem });
    if (!menu) {
      return res.status(404).json({
        success: false,
        error: "Menu not found",
      });
    }

    const menuItem = menu.items.find((item) => item._id == idItem);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      item: menuItem,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateItemsById = async (req, res, next) => {
  try {
    const { typeDish, nameDish, priceDish } = req.body;

    const menu = await Menu.findOne({ "items._id": req.params.idItem });

    if (!menu) {
      return res.status(404).json({
        success: false,
        error: "Menu not found for this restaurant",
      });
    }

    const dishIndex = menu.items.findIndex(
      (item) => item._id.toString() === req.params.idItem
    );

    if (dishIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Dish not found in the menu",
      });
    }

    if (typeDish) menu.items[dishIndex].typeDish = typeDish;
    if (nameDish) menu.items[dishIndex].nameDish = nameDish;
    if (priceDish) menu.items[dishIndex].priceDish = priceDish;

    if (req.file) {
      const newImage = await cloudinary.uploader.upload(req.file.path, {
        folder: "menu",
        width: 1200,
        crop: "scale",
      });
      menu.items[dishIndex].image = {
        public_id: newImage.public_id,
        url: newImage.secure_url,
      };
    }

    await menu.save();

    res.status(200).json({
      success: true,
      message: "Dish updated successfully",
      menu: menu.items[dishIndex],
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteItemsById = async (req, res, next) => {
  try {
    const result = await Menu.updateOne(
      { "items._id": new mongoose.Types.ObjectId(req.params.idItem) },
      {
        $pull: {
          items: { _id: new mongoose.Types.ObjectId(req.params.idItem) },
        },
      }
    );

    if (result.nModified === 0) {
      return res.status(404).json({
        success: false,
        error: "Menu item not found",
      });
    }

    res.status(200).json({ success: true, message: "Menu item deleted" });
  } catch (error) {
    next(error);
  }
};
