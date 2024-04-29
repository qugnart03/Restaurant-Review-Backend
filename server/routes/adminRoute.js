const express = require("express");
const router = express.Router();
const {
  getCounts,
  getLatestUsers,
  getPopularRestaurants,
  updateRestaurantById,
  getRestaurantById,
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUserById,
  getAllPosts,
  getBookmarkAndCommentStats,
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

router.get("/admin/restaurant/:idRestaurant", getRestaurantById);
router.get("/admin/show/user", getAllUsers);
router.get("/admin/show/user/:idUser", getUserById);
router.delete("/admin/delete/user/:idUser", deleteUserById);

router.put(
  "/admin/update/user/:idUser",
  upload.single("image"),
  updateUserById
);

router.get("/admin/show/post", getAllPosts);

router.get("/admin/chart", getBookmarkAndCommentStats);
module.exports = router;
