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
} = require("../admin/controllers/homeController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const upload = require("../middleware/multer");

// DASHBOARD
router.get("/admin/total", isAuthenticated, isAdmin, getCounts);

router.get("/admin/latest/user", isAuthenticated, isAdmin, getLatestUsers);

router.get(
  "/admin/popular/restaurant",
  isAuthenticated,
  isAdmin,
  getPopularRestaurants
);

router.get("/admin/latest/post", isAuthenticated, isAdmin, getPostRecent);

router.get(
  "/admin/chart",
  isAuthenticated,
  isAdmin,
  getBookmarkAndCommentStats
);

// RESTAURANT PAGE
router.get(
  "/admin/restaurant/:idRestaurant",
  isAuthenticated,
  isAdmin,
  getRestaurantById
);

router.put(
  "/admin/update/restaurant/:idRestaurant",
  isAuthenticated,
  isAdmin,
  upload.single("image"),
  updateRestaurantById
);

router.delete(
  "/admin/delete/restaurant/:idRestaurant",
  isAuthenticated,
  isAdmin,
  deleteRestaurantById
);

// USER PAGE
router.get("/admin/show/user", isAuthenticated, isAdmin, getAllUsers);
router.get("/admin/show/user/:idUser", isAuthenticated, isAdmin, getUserById);
router.delete(
  "/admin/delete/user/:idUser",
  isAuthenticated,
  isAdmin,
  deleteUserById
);

router.put(
  "/admin/update/user/:idUser",
  isAuthenticated,
  isAdmin,
  upload.single("image"),
  updateUserById
);

// MENU PAGE

router.get(
  "/admin/restaurant/menu/:idRestaurant",
  isAuthenticated,
  isAdmin,
  showMenuByRestaurantId
);

router.get("/admin/menu/:idItem", isAuthenticated, isAdmin, getItemsById);

router.put(
  "/admin/update/menu/:idItem",
  isAuthenticated,
  isAdmin,
  upload.single("image"),
  updateItemsById
);
router.delete(
  "/admin/delete/menu/:idItem",
  isAuthenticated,
  isAdmin,
  deleteItemsById
);

// POST
router.get("/admin/show/post", isAuthenticated, isAdmin, getAllPosts);

module.exports = router;
