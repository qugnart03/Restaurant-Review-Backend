const cloudinary = require("../utils/cloudinary");
const ErrorResponse = require("../utils/errorResponse");
const main = require("../server");
const Restaurant = require("../models/restaurantModel");
const User = require("../models/userModel");
const AccessToken =
  "pk.eyJ1IjoibWFpaHV5bWFwMTIzIiwiYSI6ImNsdmR0ZTloazAybDcyaXBweGp0ZmQ0eDYifQ.Umosc-ZzdKZOI6CKCCs8rA";

//CREATE RESTAURANT
exports.createRestaurant = async (req, res, next) => {
  try {
    const existingRestaurant = await Restaurant.findOne({
      postedBy: req.user._id,
    });

    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        error: "User has already created a restaurant",
      });
    }

    const { name, type, country, timeWork, phone, description, address } =
      req.body;
    const coordinates = await getCoordinatesFromAddress(address, AccessToken);
    console.log(coordinates);
    const startTime = timeWork ? timeWork.split("-")[0] : undefined;
    const endTime = timeWork ? timeWork.split("-")[1] : undefined;

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "restaurants",
      width: 400,
      crop: "scale",
    });

    const restaurant = await Restaurant.create({
      name,
      type,
      country,
      phone,
      description,
      address,
      timeWork: { start: startTime, end: endTime },
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
      coordinates,
      postedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    next(error);
  }
};

//SHOW ALL RESTAURANT
exports.getAllRestaurant = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find()
      .populate({
        path: "postedBy",
        select: "name image",
      })
      .exec();

    res.status(200).json({
      success: true,
      restaurants,
    });
  } catch (error) {
    next(error);
  }
};

//SHOW SINGLE RESTAURANT
exports.showSingleRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.idRestaurant)
      .populate({
        path: "comments.postedBy",
        select: "name image",
      })
      .exec();

    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, error: "Restaurant not found" });
    }
    console.log(restaurant);

    res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    next(error);
  }
};

//DELETE RESTAURANT
exports.deleteRestaurant = async (req, res, next) => {
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

//UPDATE RESTAURANT
exports.updateRestaurant = async (req, res, next) => {
  try {
    console.log(req.body);

    const {
      name,
      type,
      country,
      timeWork,
      phone,
      description,
      address,
      image,
      status,
    } = req.body;

    const coordinates = await getCoordinatesFromAddress(address, AccessToken);

    const currentRestaurant = await Restaurant.findOne({
      postedBy: req.user._id,
    });

    console.log(currentRestaurant);

    const startTime = timeWork ? timeWork.split("-")[0] : undefined;
    const endTime = timeWork ? timeWork.split("-")[1] : undefined;

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
      coordinates: coordinates || currentRestaurant.coordinates,
      status: status || currentRestaurant.status,
    };

    if (image !== null && image !== "") {
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
      currentRestaurant._id,
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
//ADD COMMENT

exports.addComment = async (req, res, next) => {
  const { comment, rating } = req.body;
  try {
    const restaurantId = req.params.id;

    await Restaurant.findByIdAndUpdate(
      restaurantId,
      {
        $push: {
          comments: { text: comment, rating: rating, postedBy: req.user._id },
        },
      },
      { new: true }
    );

    const populatedRestaurant = await Restaurant.findById(restaurantId)
      .populate("comments.postedBy", "name email image")
      .exec();

    res.status(200).json({
      success: true,
      restaurant: populatedRestaurant,
    });
  } catch (error) {
    next(error);
  }
};

//ADD BOOKMARK
exports.toggleBookmark = async (req, res, next) => {
  try {
    const restaurantId = req.params.id;
    const userId = req.user._id;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, error: "restaurant not found" });
    }

    const bookmarkIndex = restaurant.bookmarks.findIndex(
      (id) => id.toString() === userId.toString()
    );

    if (bookmarkIndex === -1) {
      restaurant.bookmarks.push(userId);
      restaurant.bookmarked = true;

      req.user.bookmarks.push(restaurantId);
      await req.user.save();
    } else {
      restaurant.bookmarks.splice(bookmarkIndex, 1);
      restaurant.bookmarked = false;

      req.user.bookmarks = req.user.bookmarks.filter(
        (id) => id.toString() !== restaurantId.toString()
      );
      await req.user.save();
    }

    await restaurant.save();

    res.status(200).json({ success: true, check: restaurant.bookmarked });
  } catch (error) {
    next(error);
  }
};

//OTHER
//SHOW 5 RECENT RESTAURANT
exports.showRecentRestaurant = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find()
      .sort({ createdAt: -1 })
      .limit(5);
    res.status(200).json({
      success: true,
      restaurants,
    });
  } catch (error) {
    next(error);
  }
};

exports.showBookmarkedRestaurants = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("bookmarks");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const bookmarkedRestaurants = user.bookmarks;

    res.status(200).json({ success: true, bookmarkedRestaurants });
  } catch (error) {
    next(error);
  }
};

exports.showRestaurantWithAdmin = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({
      postedBy: req.user._id,
    })
      .populate({
        path: "comments.postedBy",
        select: "name image",
      })
      .exec();

    if (!restaurant) {
      console.log("Restaurant not found for this user");
      return res.status(404).json({
        success: false,
        message: "Restaurant not found for this user",
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

const getCoordinatesFromAddress = async (address, AccessToken) => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address
      )}.json?access_token=${AccessToken}`
    );
    const data = await response.json();

    // Extract coordinates from the first result
    if (data.features.length > 0) {
      const coordinates = data.features[0].center;
      return {
        latitude: coordinates[1],
        longitude: coordinates[0],
      };
    } else {
      throw new Error("No coordinates found for the address.");
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error.message);
    return null;
  }
};

exports.searchRestaurantByName = async (req, res, next) => {
  try {
    let filter = {};

    const searchTerm = req.params.name ? req.params.name.toLowerCase() : "";

    if (searchTerm) {
      filter = { name: { $regex: new RegExp(searchTerm, "i") } };
    }

    const foundRestaurants = await Restaurant.find(filter)
      .populate({
        path: "postedBy",
        select: "name image",
      })
      .exec();

    res.status(200).json({
      success: true,
      restaurants: foundRestaurants || [],
    });
  } catch (error) {
    next(error);
  }
};

exports.searchRestaurantByType = async (req, res, next) => {
  try {
    const type = req.params.type;
    let restaurants;

    if (type === "all") {
      restaurants = await Restaurant.find()
        .populate({
          path: "postedBy",
          select: "name image",
        })
        .exec();
    } else {
      restaurants = await Restaurant.find({ type: type })
        .populate({
          path: "postedBy",
          select: "name image",
        })
        .exec();
    }

    res.status(200).json({ success: true, restaurants: restaurants });
  } catch (error) {
    next(error);
  }
};

//RATING

exports.avgRatingsOfRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ postedBy: req.user._id });

    let totalRating = 0;
    if (restaurant.comments && restaurant.comments.length > 0) {
      restaurant.comments.forEach((comment) => {
        totalRating += comment.rating;
      });
      const averageRating = totalRating / restaurant.comments.length;

      res.status(200).json({ success: true, averageRating });
    } else {
      res.status(200).json({ success: true, averageRating: 0 });
    }
  } catch (error) {
    next(error);
  }
};

exports.avgRatingsOfRestaurantById = async (req, res, next) => {
  try {
    const { id } = req.body;
    const restaurant = await Restaurant.findById(id);

    let totalRating = 0;
    if (restaurant.comments && restaurant.comments.length > 0) {
      restaurant.comments.forEach((comment) => {
        totalRating += comment.rating;
      });
      const averageRating = totalRating / restaurant.comments.length;

      res.status(200).json({ success: true, averageRating });
    } else {
      res.status(200).json({ success: true, averageRating: 0 });
    }
  } catch (error) {
    next(error);
  }
};
