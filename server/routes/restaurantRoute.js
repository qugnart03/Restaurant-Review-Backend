const express = require("express");
const router = express.Router();
const {
  createRestaurant,
  getAllRestaurant,
  // showSingleRestaurant,
  deleteRestaurant,
  updateRestaurant,
  addComment,
  addBookmark,
  removeBookmark,
  showRecentRestaurant,
  showBookmarkedRestaurants,
  showRestaurantWithAdmin,
  searchRestaurantByName,
} = require("../controllers/restaurantController");
const {
  isAuthenticated,
  isAdmin,
  isOwnRestaurant,
} = require("../middleware/auth");

const upload = require("../middleware/multer");

router.post(
  "/restaurant/create",
  isAuthenticated,
  isOwnRestaurant,
  upload.single("image"),
  createRestaurant
);

router.get("/restaurant/show", getAllRestaurant);

router.get(
  "/admin/restaurant/show",
  isAuthenticated,
  // isOwnRestaurant,
  showRestaurantWithAdmin
);
router.delete(
  "/restaurant/delete/:idRestaurant",
  isAuthenticated,
  isOwnRestaurant,
  deleteRestaurant
);
router.put(
  "/restaurant/update",
  isAuthenticated,
  isOwnRestaurant,
  upload.single("image"),
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

router.get("/search/restaurant/:name", isAuthenticated, searchRestaurantByName);

module.exports = router;
