const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  logout,
  userProfile,
  loginWithToken,
  updateUser,
  sendEmail,
  verifiedEmail,
  searchUserByName,
} = require("../controllers/userController");
const { isAuthenticated } = require("../middleware/auth");

const upload = require("../middleware/multer");

// Đăng ký
router.post("/signup", signup);

// Đăng nhập
router.post("/signin", signin);

// Đăng xuất
router.get("/logout", logout);

// Thông tin cá nhân
router.get("/me", isAuthenticated, userProfile);

// Cập nhật thông tin cá nhân
router.post(
  "/user/update",
  isAuthenticated,
  upload.single("image"),
  updateUser
);

// Đăng nhập bằng token
router.post("/login-with-token", loginWithToken);

// Verify email
router.get("/verify/:id", verifiedEmail);

// Send email verified
router.get("/sendVerification", isAuthenticated, sendEmail);

router.get("/search/user/:name", isAuthenticated, searchUserByName);

module.exports = router;
