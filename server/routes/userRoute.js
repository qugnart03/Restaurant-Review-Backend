const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  logout,
  userProfile,
  loginWithToken,
  updateUser,
  sendVerificationEmail,
  verifyEmail,
  searchUserByName,
  sendForgotPassword,
  verifyPassword,
  updatePassword,
  getChatBotResponse
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
router.put("/verify", isAuthenticated, verifyEmail);

// Send email verified
router.put("/sendVerification", isAuthenticated, sendVerificationEmail);
router.get("/search/user/:name", isAuthenticated, searchUserByName);

router.put("/sendForgotPassword", sendForgotPassword);
router.post("/message", isAuthenticated, getChatBotResponse);
router.put("/verifyPassword", verifyPassword);
router.put("/updatePassword", updatePassword);
module.exports = router;
