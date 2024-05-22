const express = require("express");
const router = express.Router();
const {
  addMenuItem,
  deleteDishMenu,
  showAllMenuItem,
  getType,
  getAllDishesByType,
  updateDishMenu,
  showDishByID,
  showMenuItem,
  getAllDishOfRestaurant,
  getDishOfRestaurantByAdmin,
  searchDishByName,
} = require("../controllers/menuController");

const { isAuthenticated, isOwnRestaurant } = require("../middleware/auth");

const upload = require("../middleware/multer");

// NOT PERMISSION
router.get("/menu/show", isAuthenticated, showAllMenuItem);
router.get("/menu/show/dish", isAuthenticated, showMenuItem);
router.get("/typeDish", isAuthenticated, getType);
router.get("/dishes/:type", isAuthenticated, getAllDishesByType);
router.get(
  "/menu/restaurant/:idRestaurant/dishes/:type",
  isAuthenticated,
  getAllDishOfRestaurant
);
router.get("/dish/:idDish", isAuthenticated, showDishByID);
router.get("/menu/search/dish/:name", isAuthenticated, searchDishByName);

// OWNRESTAURANT
router.post(
  "/menu/create",
  isAuthenticated,
  upload.single("image"),
  addMenuItem
);
router.delete(
  "/menu/delete/dish/:idDish",
  isAuthenticated,
  isOwnRestaurant,
  deleteDishMenu
);
router.put(
  "/menu/update/dish/:idDish",
  isAuthenticated,
  isOwnRestaurant,
  upload.single("image"),
  updateDishMenu
);

router.get(
  "/restaurant/:id/menus",
  isAuthenticated,
  getDishOfRestaurantByAdmin
);
module.exports = router;
