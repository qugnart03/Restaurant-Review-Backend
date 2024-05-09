const express = require("express");
const router = express.Router();
const {
  showNotificationById,
  showAllNotificationOfUser,
  updateNotificationById,
} = require("../controllers/notificationController");
const { isAuthenticated } = require("../middleware/auth");

router.get("/notification/:id", isAuthenticated, showNotificationById);
router.get("/notifications/show", isAuthenticated, showAllNotificationOfUser);
router.get("/notification/read/:id", isAuthenticated, updateNotificationById);
module.exports = router;
