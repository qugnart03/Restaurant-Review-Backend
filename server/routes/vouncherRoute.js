const express = require("express");
const router = express.Router();
const {
  createVoucher,
  updateVoucherById,
  deleteVoucherById,
  toggleVoucher,
  showVoucherOfRestaurant,
  showUserVouchers,
  showVoucherWithRestaurant,
} = require("../controllers/vouncherController");

const { isAuthenticated } = require("../middleware/auth");

router.post("/vouncher/create", isAuthenticated, createVoucher);
router.get(
  "/vouncher/restaurant/:idRes",
  isAuthenticated,
  showVoucherOfRestaurant
);
router.put("/vouncher/update/:id", isAuthenticated, updateVoucherById);
router.delete("/vouncher/delete/:id", isAuthenticated, deleteVoucherById);
router.put("/vouncher/get/:id", isAuthenticated, toggleVoucher);

router.get(
  "/restaurant/vouncher/show",
  isAuthenticated,
  showVoucherWithRestaurant
);

router.get("/me/vouncher/show", isAuthenticated, showUserVouchers);
module.exports = router;
