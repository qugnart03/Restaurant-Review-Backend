const Menu = require("../models/menuModel");
const Notification = require("../models/notificationModel");
const Restaurant = require("../models/restaurantModel");
const cloudinary = require("../utils/cloudinary");

// ADD MENU
exports.addMenuItem = async (req, res, next) => {
  try {
    const { typeDish, nameDish, priceDish } = req.body;
    const restaurant = await Restaurant.findOne({ postedBy: req.user._id });
    let existingMenu = await Menu.findOne({ restaurant: restaurant._id });

    if (!existingMenu) {
      existingMenu = new Menu({
        restaurant: restaurant._id,
        items: [],
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "restaurants",
      width: 400,
      crop: "scale",
    });
    const newMenuItem = {
      typeDish,
      nameDish,
      priceDish,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    };

    existingMenu.items.push(newMenuItem);
    await existingMenu.save();

    const newNotification = new Notification({
      message: `${restaurant.name} added a new dish to my menu:  ${nameDish}`,
      type: "menu",
      restaurant: restaurant._id,
      menu: existingMenu.items[existingMenu.items.length - 1]._id,
    });
    await newNotification.save();

    res.status(201).json({
      success: true,
      message: "Item added to menu",
      menuItem: {
        _id: existingMenu.items[existingMenu.items.length - 1]._id,
        ...newMenuItem,
      },
    });
  } catch (error) {
    next(error);
  }
};

// exports.addMenuItem = async (req, res) => {
//   try {
//     const { typeDish, nameDish, priceDish } = req.body;
//     const restaurant = await Restaurant.findOne({ postedBy: req.user._id });

//     let existingMenu = await Menu.findOneAndUpdate(
//       { restaurant: restaurant._id },
//       {
//         $push: {
//           items: {
//             typeDish,
//             nameDish,
//             priceDish,
//             image: {
//               public_id: result.public_id,
//               url: result.secure_url,
//             },
//           },
//         },
//       },
//       { new: true, upsert: true }
//     );

//     if (!existingMenu) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Menu not found" });
//     }

//     const result = await cloudinary.uploader.upload(req.file.path, {
//       folder: "restaurants",
//       width: 400,
//       crop: "scale",
//     });

//     const newNotification = new Notification({
//       message: `${restaurant.name} added a new dish to my menu:  ${nameDish}`,
//       type: "menu",
//       restaurant: restaurant._id,
//       menu: existingMenu.items[existingMenu.items.length - 1]._id,
//     });
//     await newNotification.save();

//     res.status(201).json({
//       success: true,
//       message: "Item added to menu",
//       menuItem: {
//         _id: existingMenu.items[existingMenu.items.length - 1]._id,
//         ...newMenuItem,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// SHOW ALL MENU
exports.showAllMenuItem = async (req, res, next) => {
  try {
    const menuItems = await Menu.find().populate("restaurant", "name");

    if (!menuItems || menuItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No menu items found",
      });
    }

    res.status(200).json({
      success: true,
      menuItems,
    });
  } catch (error) {
    next(error);
  }
};

// SHOW MENU
exports.showMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ postedBy: req.user._id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found for this user",
      });
    }

    // Fetch menu items for the found restaurant and populate the "restaurant" field with just the "name"
    const menuItems = await Menu.find({ restaurant: restaurant._id }).populate(
      "restaurant",
      "name"
    );

    if (!menuItems || menuItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No menu items found for this restaurant",
      });
    }

    res.status(200).json({
      success: true,
      menuItems,
    });
  } catch (error) {
    next(error);
  }
};

// SHOW DISH BY ID
exports.showDishByID = async (req, res, next) => {
  try {
    const { idDish } = req.params;

    const restaurant = await Restaurant.findOne({ postedBy: req.user._id });

    const menu = await Menu.findOne({ restaurant: restaurant._id });

    if (!menu) {
      return res.status(404).json({
        success: false,
        error: "Menu not found for this restaurant",
      });
    }

    const menuItem = menu.items.find((item) => item._id.toString() === idDish);

    if (!menuItem) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }

    res.status(200).json({
      success: true,
      menuItem: menuItem,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE DISH MENU
exports.deleteDishMenu = async (req, res, next) => {
  try {
    const { idDish } = req.params;

    const restaurant = await Restaurant.findOne({ postedBy: req.user._id });

    const menu = await Menu.findOne({ restaurant: restaurant._id });

    if (!menu) {
      return res.status(404).json({
        success: false,
        error: "Menu not found for this restaurant",
      });
    }

    const menuItem = menu.items.find((item) => item._id.toString() === idDish);

    if (!menuItem) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }

    menu.items = menu.items.filter((item) => item._id.toString() !== idDish);

    await menu.save();

    res.status(200).json({ success: true, message: "Menu item deleted" });
  } catch (error) {
    next(error);
  }
};

//GET TYPE DISH
exports.getType = async (req, res, next) => {
  try {
    const allMenus = await Menu.find().populate("items");

    let allTypes = [];

    allMenus.forEach((menu) => {
      menu.items.forEach((item) => {
        if (!allTypes.includes(item.typeDish)) {
          allTypes.push(item.typeDish);
        }
      });
    });

    res.status(200).json({
      success: true,
      types: allTypes,
    });
  } catch (error) {
    next(error);
  }
};

// GET DISH BY TYPE
exports.getAllDishesByType = async (req, res, next) => {
  try {
    let type = req.params.type;

    let dishes;

    if (req.user.role === "user") {
      if (type === "all") {
        dishes = await Menu.find();
      } else {
        dishes = await Menu.find({ "items.typeDish": type });
      }
    } else {
      const restaurant = await Restaurant.findOne({ postedBy: req.user._id });
      if (!restaurant) {
        return res
          .status(404)
          .json({ success: false, error: "Restaurant not found" });
      }

      dishes = await Menu.find({ restaurant: restaurant._id });
    }

    if (!(type === "all")) {
      dishes = dishes
        .map((dish) => ({
          _id: dish._id,
          restaurant: dish.restaurant,
          items: dish.items.filter((item) => item.typeDish === type),
        }))
        .filter((dish) => dish.items.length > 0);
    }

    let dataDishes;
    if (!(req.user.role === "user")) {
      const allItems = dishes.map((dish) => dish.items).flat();
      dataDishes = allItems;
    } else {
      dataDishes = dishes;
    }

    res.status(200).json({
      success: true,
      dishes: dataDishes,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE DISH
exports.updateDishMenu = async (req, res, next) => {
  try {
    const { typeDish, nameDish, priceDish } = req.body;

    const restaurant = await Restaurant.findOne({ postedBy: req.user._id });

    const menu = await Menu.findOne({ restaurant: restaurant._id });

    if (!menu) {
      return res.status(404).json({
        success: false,
        error: "Menu not found for this restaurant",
      });
    }

    const dishIndex = menu.items.findIndex(
      (item) => item._id.toString() === req.params.idDish
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
        folder: "restaurants",
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

exports.getAllDishOfRestaurant = async (req, res, next) => {
  try {
    let type = req.params.type;
    let idRestaurant = req.params.idRestaurant;

    const dishes = await Menu.find({ restaurant: idRestaurant });

    let dataDishes = dishes;
    if (type && type !== "all") {
      dataDishes = dishes.flatMap((dish) =>
        dish.items.filter((item) => item.typeDish === type)
      );
    } else {
      dataDishes = dishes.flatMap((dish) => dish.items);
    }

    res.status(200).json({
      success: true,
      dishes: dataDishes,
    });
  } catch (error) {
    next(error);
  }
};

exports.searchDishByName = async (req, res, next) => {
  try {
    const searchTerm = req.params.name.toLowerCase();

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: "Please provide a search term",
      });
    }

    let foundItems;

    if (req.user.role === "user") {
      foundItems = await Menu.aggregate([
        {
          $unwind: "$items", // Giải nén mảng
        },
        {
          $match: {
            "items.nameDish": { $regex: new RegExp(searchTerm, "i") },
          },
        },
        {
          $group: {
            _id: {
              _id: "$_id",
              restaurant: "$restaurant",
            },
            items: { $push: "$items" }, // Tạo một mảng các items
          },
        },
        {
          $project: {
            _id: "$_id._id", // Sử dụng _id của Menu làm _id cho mục kết quả
            restaurant: "$_id.restaurant", // Lấy restaurant từ _id
            items: 1, // Giữ nguyên mảng items
          },
        },
      ]);
    } else {
      const restaurant = await Restaurant.findOne({ postedBy: req.user._id });

      const menu = await Menu.findOne({ restaurant: restaurant._id });

      const menuItems = menu.items;

      foundItems = menuItems.filter((item) => {
        return item.nameDish.toLowerCase().includes(searchTerm);
      });
    }

    if (foundItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No dishes found with the provided search term",
      });
    }

    res.status(200).json({
      success: true,
      dishes: foundItems,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDishOfRestaurantByAdmin = async (req, res) => {
  const restaurantId = req.params.id;

  try {
    const menu = await Menu.findOne({ restaurant: restaurantId }).populate(
      "restaurant",
      "name"
    );
    if (!menu) {
      return res
        .status(404)
        .json({ message: "Menu not found for this restaurant" });
    }
    res.json(menu);
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ message: "Server error" });
  }
};
