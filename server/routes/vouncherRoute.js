const express = require("express");
const router = express.Router();
const {
  createVoucher,
  showVoucher,
  updateVoucherById,
  deleteVoucherById,
  toggleVoucher,
} = require("../controllers/vouncherController");

const { isAuthenticated } = require("../middleware/auth");

router.post("/vouncher/create", isAuthenticated, createVoucher);
router.get("/vouncher/show", isAuthenticated, showVoucher);
router.put("/vouncher/update/:id", isAuthenticated, updateVoucherById);
router.delete("/vouncher/delete/:id", isAuthenticated, deleteVoucherById);
router.put("/vouncher/get/:id", isAuthenticated, toggleVoucher);
module.exports = router;
