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
  getPostRecent,
  deleteRestaurantById,
  updateItemsById,
  showMenuByRestaurantId,
  getItemsById,
  deleteItemsById,
} = require("../admin/controllers/HomeController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const upload = require("../middleware/multer");

router.get("/admin/total", isAuthenticated, isAdmin, getCounts);
router.get("/admin/latest/user", isAuthenticated, isAdmin, getLatestUsers);
router.get(
  "/admin/popular/restaurant",
  isAuthenticated,
  isAdmin,
  getPopularRestaurants
);
router.put(
  "/admin/update/restaurant/:idRestaurant",
  isAuthenticated,
  isAdmin,
  upload.single("image"),
  updateRestaurantById
);
router.get(
  "/admin/restaurant/:idRestaurant",
  isAuthenticated,
  isAdmin,
  getRestaurantById
);
router.get("/admin/show/user", isAuthenticated, isAdmin, getAllUsers);
router.get("/admin/show/user/:idUser", isAuthenticated, isAdmin, getUserById);
router.delete(
  "/admin/delete/user/:idUser",
  isAuthenticated,
  isAdmin,
  deleteUserById
);

router.delete(
  "/admin/delete/restaurant/:idRestaurant",
  isAuthenticated,
  isAdmin,
  deleteRestaurantById
);

router.put(
  "/admin/update/user/:idUser",
  isAuthenticated,
  isAdmin,
  upload.single("image"),
  updateUserById
);

router.get("/admin/show/post", isAuthenticated, isAdmin, getAllPosts);
router.get("/admin/latest/post", isAuthenticated, isAdmin, getPostRecent);
router.get(
  "/admin/chart",
  isAuthenticated,
  isAdmin,
  getBookmarkAndCommentStats
);

router.get(
  "/admin/restaurant/menu/:idRestaurant",
  isAuthenticated,
  showMenuByRestaurantId
);

router.get("/admin/menu/:idItem", isAuthenticated, getItemsById);

router.put(
  "/admin/update/menu/:idItem",
  isAuthenticated,

  upload.single("image"),
  updateItemsById
);

router.delete("/admin/delete/menu/:idItem", isAuthenticated, deleteItemsById);
module.exports = router;
