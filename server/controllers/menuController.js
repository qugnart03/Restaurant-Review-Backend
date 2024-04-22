const Menu = require("../models/menuModel");
const Restaurant = require("../models/restaurantModel");
const cloudinary = require("../utils/cloudinary");

// ADD MENU
exports.addMenuItem = async (req, res, next) => {
  try {
    const { typeDish, nameDish, priceDish } = req.body;
    const restaurant = await Restaurant.findOne({ postedBy: req.user._id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found for this user",
      });
    }

    let existingMenu = await Menu.findOne({ restaurant: restaurant._id });

    if (!existingMenu) {
      existingMenu = new Menu({
        restaurant: restaurant._id,
        items: [],
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "restaurants",
      width: 1200,
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

    res.status(201).json({
      success: true,
      message: "Item added to menu",
      menuItem: newMenuItem,
    });
  } catch (error) {
    next(error);
  }
};

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

exports.showMenuItem = async (req, res, next) => {
  try {
    // Find the restaurant belonging to the currently authenticated user
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

// SHOW ONLY MENU
exports.showRestaurantMenu = async (req, res, next) => {
  try {
    const restaurantMenu = await Menu.findOne({
      restaurant: req.params.idRestaurant,
    }).populate({
      path: "items",
      select: "typeDish nameDish priceDish image",
    });

    if (!restaurantMenu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found for this restaurant",
      });
    }

    res.status(200).json({
      success: true,
      menu: restaurantMenu.items,
    });
  } catch (error) {
    next(error);
  }
};

exports.showDishMenu = async (req, res, next) => {
  try {
    const { idDish } = req.params; // Get the dish ID from the request parameters

    // Find the restaurant by the user's ID
    const restaurant = await Restaurant.findOne({ postedBy: req.user._id });

    // Find the menu by the restaurant's ID
    const menu = await Menu.findOne({ restaurant: restaurant._id });

    // Check if the menu exists
    if (!menu) {
      return res.status(404).json({
        success: false,
        error: "Menu not found for this restaurant",
      });
    }

    // Find the menu item by its ID
    const menuItem = menu.items.find((item) => item._id.toString() === idDish);

    // Check if the menu item exists
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
    const { idDish } = req.params; // Get the dish ID from the request parameters

    // Find the restaurant by the user's ID
    const restaurant = await Restaurant.findOne({ postedBy: req.user._id });

    // Find the menu by the restaurant's ID
    const menu = await Menu.findOne({ restaurant: restaurant._id });

    // Check if the menu exists
    if (!menu) {
      return res.status(404).json({
        success: false,
        error: "Menu not found for this restaurant",
      });
    }

    // Find the menu item by its ID
    const menuItem = menu.items.find((item) => item._id.toString() === idDish);

    // Check if the menu item exists
    if (!menuItem) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }

    // Remove the item from the items array
    menu.items = menu.items.filter((item) => item._id.toString() !== idDish);

    // Save the updated menu
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

//GET DISH BY ID
// exports.getDishById = async (req, res, next) => {
//   try {
//     const menu = await Menu.findOne({ "items._id": req.params.id }).populate(
//       "restaurant"
//     );

//     if (!menu) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Menu not found" });
//     }

//     const dish = menu.items.find(
//       (item) => item._id.toString() === req.params.id
//     );

//     if (!dish) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Dish not found" });
//     }

//     res.status(200).json({
//       success: true,
//       dish,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// GET DISH BY TYPE
exports.getAllDishesByType = async (req, res, next) => {
  try {
    let type = req.params.type;

    let dishes;

    if (req.user.role === "user") {
      console.log("USER");
      if (type === "all") {
        dishes = await Menu.find();
      } else {
        dishes = await Menu.find({ "items.typeDish": type });
        console.log("xzxz");
      }
    } else {
      const restaurant = await Restaurant.findOne({ postedBy: req.user._id });
      if (!restaurant) {
        return res
          .status(404)
          .json({ success: false, error: "Restaurant not found" });
      }

      console.log("Admin ROLE");
      dishes = await Menu.find({ restaurant: restaurant._id });
    }

    if (!(type === "all")) {
      console.log("zcxxzcz");
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
      menu: menu,
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
      dataDishes = dishes.filter((dish) =>
        dish.items.some((item) => item.typeDish === type)
      );
    }
    // 6624e0971bb4fe27f0af39ff //soup
    res.status(200).json({
      success: true,
      dishes: dataDishes,
    });
  } catch (error) {
    next(error);
  }
};
