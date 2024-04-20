const express = require("express");
const router = express.Router();
const {
  addMenuItem,
  deleteMenuItem,
  showAllMenuItem,
  showRestaurantMenu,
  getType,
  getDishById,
  getAllDishesByType,
} = require("../controllers/menuController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

router.post(
  "/menu/add/item/:idRestaurant",
  isAuthenticated,
  isAdmin,
  addMenuItem
);
router.delete(
  "/menu/delete/item/:idItem",
  isAuthenticated,
  isAdmin,
  deleteMenuItem
);
router.get("/menu/show", isAuthenticated, isAdmin, showAllMenuItem);
router.get("/menu/show/:id", isAuthenticated, isAdmin, showRestaurantMenu);
router.get("/typeDish", isAuthenticated, isAdmin, getType);
router.get("/dishes/:type", isAuthenticated, getAllDishesByType);
router.get("/dish/:id", isAuthenticated, isAdmin, getDishById);
module.exports = router;
