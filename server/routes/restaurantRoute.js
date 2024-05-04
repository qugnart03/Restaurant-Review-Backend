const express = require("express");
const router = express.Router();
const {
  createRestaurant,
  getAllRestaurant,
  deleteRestaurant,
  updateRestaurant,
  addComment,
  toggleBookmark,
  showRecentRestaurant,
  showBookmarkedRestaurants,
  showRestaurantWithAdmin,
  searchRestaurantByName,
  searchRestaurantByType,
  avgRatingsOfRestaurant,
} = require("../controllers/restaurantController");

const { isAuthenticated, isOwnRestaurant } = require("../middleware/auth");

const upload = require("../middleware/multer");

// NOT PERMISSION
router.get("/restaurant/show", isAuthenticated, getAllRestaurant);
router.put(
  "/restaurant/comment/:id",
  isAuthenticated,
  upload.single("image"),
  addComment
);
router.put("/restaurant/bookmark/:id", isAuthenticated, toggleBookmark);
router.get("/search/restaurant/:name", isAuthenticated, searchRestaurantByName);
router.get(
  "/search/restaurant/type/:type",
  isAuthenticated,
  searchRestaurantByType
);
// RESTAURANT
router.post(
  "/restaurant/create",
  isAuthenticated,
  isOwnRestaurant,
  upload.single("image"),
  createRestaurant
);

router.get(
  "/admin/restaurant/show",
  isAuthenticated,
  isOwnRestaurant,
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

//OTHER
router.get("/restaurant/recent/show", showRecentRestaurant);
router.get(
  "/restaurant/bookmarked/show",
  isAuthenticated,
  showBookmarkedRestaurants
);

router.get("/restaurant/rating/avg/:id", avgRatingsOfRestaurant);
module.exports = router;
