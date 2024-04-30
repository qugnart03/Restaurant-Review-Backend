const express = require("express");
const router = express.Router();
const {
  createRestaurant,
  showRestaurant,
  // showSingleRestaurant,
  deleteRestaurant,
  updateRestaurant,
  addComment,
  addBookmark,
  removeBookmark,
  showRecentRestaurant,
  showBookmarkedRestaurants,
  showRestaurantWithAdmin,
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
  upload.single("image"),
  createRestaurant
);

router.get("/restaurant/show", showRestaurant);
// router.get("/restaurant/show/:idRestaurant", showSingleRestaurant);
router.get(
  "/admin/restaurant/show",
  isAuthenticated,
  isOwnRestaurant,
  showRestaurantWithAdmin
);
router.delete(
  "/restaurant/delete/:idRestaurant",
  // isAuthenticated,
  // isAdmin,
  deleteRestaurant
);
router.put(
  "/restaurant/update",
  isAuthenticated,
  isAdmin,
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

module.exports = router;
