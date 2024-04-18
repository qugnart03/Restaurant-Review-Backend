const express = require("express");
const router = express.Router();
const {
  createRestaurant,
  showRestaurant,
} = require("../controllers/restaurantController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

//blog routes
router.post("/restaurant/create", isAuthenticated, isAdmin, createRestaurant);
router.get("/restaurant/show", showRestaurant);
// router.get("/post/:id", showSinglePost);
// router.delete("/delete/post/:id", isAuthenticated, isAdmin, deletePost);
// router.put("/update/post/:id", isAuthenticated, isAdmin, updatePost);
// router.put("/comment/post/:id", isAuthenticated, addComment);
// router.put("/addlike/post/:id", isAuthenticated, addLike);
// router.put("/removelike/post/:id", isAuthenticated, removeLike);

module.exports = router;
