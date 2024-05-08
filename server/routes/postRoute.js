const express = require("express");
const router = express.Router();
const {
  createPost,
  showPost,
  showSinglePost,
  deletePost,
  updatePost,
  addComment,
  showMyPost,
  toggleLike,
} = require("../controllers/postController");
const { isAuthenticated } = require("../middleware/auth");
const upload = require("../middleware/multer");

//NOT PERMISSION
router.get("/posts/show", isAuthenticated, showPost);
router.get("/post/:id", isAuthenticated, showSinglePost);
router.put(
  "/comment/post/:id",
  isAuthenticated,
  upload.single("image"),
  addComment
);
router.delete("/delete/post/:id", isAuthenticated, deletePost);
router.put(
  "/update/post/:id",
  isAuthenticated,
  upload.single("image"),
  updatePost
);
router.put("/like/post/:id", isAuthenticated, toggleLike);

router.post(
  "/post/create",
  isAuthenticated,
  upload.single("image"),
  createPost
);

router.get("/me/posts", isAuthenticated, showMyPost);
module.exports = router;
