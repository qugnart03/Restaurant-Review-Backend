const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  logout,
  userProfile,
  updateUser,
  loginWithToken,
} = require("../controllers/authController");
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

// const id = "6628ca827182c7204ce5c094";
// Đăng nhập bằng token
router.post("/login-with-token", loginWithToken);

module.exports = router;
