const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  logout,
  userProfile,
  updateUser,
} = require("../controllers/authController");
const { isAuthenticated } = require("../middleware/auth");

const upload = require("../middleware/multer");

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/logout", logout);
router.get("/me", isAuthenticated, userProfile);
router.post(
  "/user/update",
  isAuthenticated,
  upload.single("image"),
  updateUser
);

module.exports = router;
