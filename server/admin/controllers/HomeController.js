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
    console.log("Updating restaurant...");

    const { name, type, timeWork, phone, description, address, image } =
      req.body;

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

    console.log("Update data:", data);

    if (image !== "") {
      const ImgId = currentRestaurant.image.public_id;
      if (ImgId) {
        await cloudinary.uploader.destroy(ImgId);
      }

      console.log(ImgId);

      const newImage = await cloudinary.uploader.upload(req.file.path, {
        folder: "restaurants",
        width: 1200,
        crop: "scale",
      });

      data.image = {
        public_id: newImage.public_id,
        url: newImage.secure_url,
      };

      console.log(data.image);
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
