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
  searchDishByName,
} = require("../controllers/menuController");
const {
  isAuthenticated,
  isAdmin,
  isOwnRestaurant,
} = require("../middleware/auth");

const upload = require("../middleware/multer");

router.post(
  "/menu/create",
  isAuthenticated,
  isOwnRestaurant,
  upload.single("image"),
  addMenuItem
);
router.delete(
  "/menu/delete/dish/:idDish",
  isAuthenticated,
  isOwnRestaurant,
  deleteDishMenu
);
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
router.put(
  "/menu/update/dish/:idDish",
  isAuthenticated,
  isAdmin,
  upload.single("image"),
  updateDishMenu
);
module.exports = router;
