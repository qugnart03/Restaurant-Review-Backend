const Menu = require("../models/menuModel");
const Restaurant = require("../models/restaurantModel");
const cloudinary = require("../utils/cloudinary");

// ADD MENU
exports.addMenuItem = async (req, res, next) => {
  try {
    const { typeDish, nameDish, priceDish, descriptionDish, image } = req.body;

    const existingMenu = await Menu.findOne({ restaurant: req.params.id });
    if (!existingMenu) {
      const newMenu = new Menu({
        restaurant: req.params.id,
        items: [],
      });
      await newMenu.save();
      const result = await cloudinary.uploader.upload(image, {
        folder: "restaurants",
        width: 1200,
        crop: "scale",
      });
      const newMenuItem = {
        typeDish,
        nameDish,
        priceDish,
        descriptionDish,
        image: {
          public_id: result.public_id,
          url: result.secure_url,
        },
      };
      newMenu.items.push(newMenuItem);
      await newMenu.save();
      return res.status(201).json({
        success: true,
        message: "Item added to menu",
        menuItem: newMenuItem,
      });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: "restaurants",
      width: 1200,
      crop: "scale",
    });
    const newMenuItem = {
      typeDish,
      nameDish,
      priceDish,
      descriptionDish,
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

// SHOW ONLY MENU
exports.showRestaurantMenu = async (req, res, next) => {
  try {
    const restaurantMenu = await Menu.findOne({
      restaurant: req.params.id,
    }).populate("items");

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

// DELETE MENU
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const itemId = req.params.idItem;

    const menuItem = await Menu.findOne({ "items._id": itemId });
    if (!menuItem) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }

    const itemIndex = menuItem.items.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Dish not found" });
    }

    menuItem.items.splice(itemIndex, 1);

    await menuItem.save();

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
exports.getDishById = async (req, res, next) => {
  try {
    const menu = await Menu.findOne({ "items._id": req.params.id }).populate(
      "restaurant"
    );

    if (!menu) {
      return res
        .status(404)
        .json({ success: false, message: "Menu not found" });
    }

    const dish = menu.items.find(
      (item) => item._id.toString() === req.params.id
    );

    if (!dish) {
      return res
        .status(404)
        .json({ success: false, message: "Dish not found" });
    }

    res.status(200).json({
      success: true,
      dish,
    });
  } catch (error) {
    next(error);
  }
};

// GET DISH BY TYPE
exports.getAllDishesByType = async (req, res, next) => {
  try {
    const type = req.params.type;

    const dishes = await Menu.find({ "items.typeDish": type });

    const listDishes = dishes.reduce((array, dish) => {
      dish.items.forEach((item) => {
        if (item.typeDish === type) {
          if (!array[item.typeDish]) {
            array[item.typeDish] = [];
          }
          array[item.typeDish].push(item);
        }
      });
      return array;
    }, {});

    const dishesByType = Object.entries(listDishes).map(
      ([typeDish, items]) => ({
        items,
      })
    );

    res.status(200).json({
      success: true,
      dishes: dishesByType,
    });
  } catch (error) {
    next(error);
  }
};
