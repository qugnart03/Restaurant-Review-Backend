const express = require("express");
const router = express.Router();
const {
  getCounts,
  getLatestUsers,
  getPopularRestaurants,
  updateRestaurantById,
} = require("../admin/controllers/HomeController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const upload = require("../middleware/multer");

router.get("/admin/total", getCounts);
router.get("/admin/latest/user", getLatestUsers);
router.get("/admin/popular/restaurant", getPopularRestaurants);
router.put(
  "/admin/update/restaurant/:idRestaurant",
  upload.single("image"),
  updateRestaurantById
);
module.exports = router;
