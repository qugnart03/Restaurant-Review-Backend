const cloudinary = require("../utils/cloudinary");
const ErrorResponse = require("../utils/errorResponse");
const main = require("../server");
const Restaurant = require("../models/restaurantModel");
const User = require("../models/userModel");

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

    const startTime = timeWork ? timeWork.split("-")[0] : undefined;
    const endTime = timeWork ? timeWork.split("-")[1] : undefined;

    //UPLOAD IMAGE IN CLOUDINARY
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "restaurants",
      width: 1200,
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
      postedBy: req.user._id,
    });
    res.status(201).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//SHOW RESTAURANT
exports.showRestaurant = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.status(201).json({
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
    const restaurant = await Restaurant.findById(req.params.idRestaurant);
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
const AccessToken =
  "pk.eyJ1IjoibWFpaHV5bWFwMTIzIiwiYSI6ImNsdmR0ZTloazAybDcyaXBweGp0ZmQ0eDYifQ.Umosc-ZzdKZOI6CKCCs8rA";

//UPDATE RESTAURANT
exports.updateRestaurant = async (req, res, next) => {
  try {
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

    console.log(address);

    const coordinates = await getCoordinatesFromAddress(address, AccessToken);
    console.log(coordinates);
    // console.log("Request body:", req.body);

    const currentRestaurant = await Restaurant.findOne({
      postedBy: req.user._id,
    });

    // console.log("Current restaurant:", currentRestaurant);

    const startTime = timeWork ? timeWork.start : undefined;
    const endTime = timeWork ? timeWork.end : undefined;

    // console.log("Start time:", startTime);
    // console.log("End time:", endTime);

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

    // console.log("Update data:", data);

    if (image !== null && image !== "") {
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

    const restaurantUpdate = await Restaurant.findByIdAndUpdate(
      currentRestaurant._id,
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

//ADD COMMENT
exports.addComment = async (req, res, next) => {
  const { comment } = req.body;
  try {
    const restaurantComment = await Restaurant.findByIdAndUpdate(
      req.params.id,
      {
        $push: { comments: { text: comment, postedBy: req.user._id } },
      },
      { new: true }
    );
    const restaurant = await Restaurant.findById(
      restaurantComment._id
    ).populate("comments.postedBy", "name email");
    res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    next(error);
  }
};

//ADD BOOKMARK
exports.addBookmark = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const restaurantId = req.params.id;

    const user = await User.findById(userId);
    if (user.bookmarks.includes(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: "Restaurant already bookmarked",
      });
    }

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { bookmarks: restaurantId } },
      { new: true }
    );

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { $addToSet: { bookmarks: userId } },
      { new: true }
    );

    const restaurants = await Restaurant.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "name");
    main.io.emit("add-like", restaurants);

    res.status(200).json({
      success: true,
      message: "Bookmark added successfully",
      restaurant,
      restaurants,
    });
  } catch (error) {
    next(error);
  }
};

//REMOVE LIKE
exports.removeBookmark = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { bookmarks: req.user._id },
      },
      { new: true }
    );

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { bookmarks: req.params.id },
      },
      { new: true }
    );

    const restaurants = await Restaurant.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "name");
    main.io.emit("remove-like", restaurants);

    res.status(200).json({
      success: true,
      restaurant,
      restaurants,
    });
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

    res.status(200).json({ success: true, bookmarks: bookmarkedRestaurants });
  } catch (error) {
    next(error);
  }
};

exports.showRestaurantWithAdmin = async (req, res, next) => {
  console.log(req.user._id);
  try {
    const restaurant = await Restaurant.findOne({ postedBy: req.user._id });

    if (!restaurant) {
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
