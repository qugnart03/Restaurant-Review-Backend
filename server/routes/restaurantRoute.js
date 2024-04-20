const express = require("express");
const router = express.Router();
const {
  createRestaurant,
  showRestaurant,
  showSingleRestaurant,
  deleteRestaurant,
  updateRestaurant,
  addComment,
  addBookmark,
  removeBookmark,
  showRecentRestaurant,
  showBookmarkedRestaurants,
} = require("../controllers/restaurantController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

router.post("/restaurant/create", isAuthenticated, isAdmin, createRestaurant);
router.get("/restaurant/show", showRestaurant);
router.get("/restaurant/show/:idRestaurant", showSingleRestaurant);
router.delete(
  "/restaurant/delete/:idRestaurant",
  isAuthenticated,
  isAdmin,
  deleteRestaurant
);
router.put(
  "/restaurant/update/:id",
  isAuthenticated,
  isAdmin,
  updateRestaurant
);
router.put("/restaurant/comment/:id", isAuthenticated, addComment);
router.put("/restaurant/bookmark/:id", isAuthenticated, addBookmark);
router.put("/restaurant/unbookmark/:id", isAuthenticated, removeBookmark);

//OTHER
router.get("/restaurant/recent/show", showRecentRestaurant);
router.get(
  "/restaurant/bookmarked/show",
  isAuthenticated,
  showBookmarkedRestaurants
);
module.exports = router;
