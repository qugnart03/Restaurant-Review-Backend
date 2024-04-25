const express = require("express");
const router = express.Router();
const { getUserCount } = require("../admin/controllers/HomeController");

router.get("/admin/total/member", getUserCount);

module.exports = router;
