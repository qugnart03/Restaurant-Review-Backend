const express = require("express");
const router = express.Router();
const {
  createPost,
  showPost,
  showSinglePost,
  deletePost,
  updatePost,
  addComment,
  addLike,
  removeLike,
} = require("../controllers/postController");
const { isAuthenticated } = require("../middleware/auth");
const upload = require("../middleware/multer");
router.post(
  "/post/create",
  isAuthenticated,
  upload.single("image"),
  createPost
);
router.get("/posts/show", showPost);
router.get("/post/:id", showSinglePost);
router.delete("/delete/post/:id", isAuthenticated, deletePost);
router.put("/update/post/:id", isAuthenticated, updatePost);
router.put("/comment/post/:id", isAuthenticated, addComment);
router.put("/addlike/post/:id", isAuthenticated, addLike);
router.put("/removelike/post/:id", isAuthenticated, removeLike);

module.exports = router;
