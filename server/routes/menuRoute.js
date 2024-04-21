const express = require("express");
const router = express.Router();
const {
  addMenuItem,
  deleteDishMenu,
  showAllMenuItem,
  // showRestaurantMenu,
  getType,
  // getDishById,
  getAllDishesByType,
  updateDishMenu,
  showDishMenu,
} = require("../controllers/menuController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const upload = require("../middleware/multer");

router.post(
  "/menu/create",
  isAuthenticated,
  isAdmin,
  upload.single("image"),
  addMenuItem
);
router.delete(
  "/menu/delete/dish/:idDish",
  isAuthenticated,
  isAdmin,
  deleteDishMenu
);
router.get("/menu/show", isAuthenticated, isAdmin, showAllMenuItem);
// router.get("/menu/show/:idRestaurant", isAuthenticated, showRestaurantMenu);
router.get("/typeDish", isAuthenticated, isAdmin, getType);
router.get("/dishes/:type", isAuthenticated, getAllDishesByType);
// router.get("/dish/:id", isAuthenticated, isAdmin, getDishById);

router.get("/dish/:idDish", isAuthenticated, showDishMenu);

router.put(
  "/menu/update/dish/:idDish",
  isAuthenticated,
  isAdmin,
  upload.single("image"),
  updateDishMenu
);
module.exports = router;
