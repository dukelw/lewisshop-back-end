const express = require("express");
const router = express.Router();
const asyncHandler = require("../helpers/async-handler");

const discountController = require("../controllers/DiscountController");
const { authentication } = require("../auth/utils");

router.get(
  "/codes/applyfor",
  asyncHandler(discountController.getAllProductApplyADiscountCode)
);
router.post("/amount", asyncHandler(discountController.getDiscountAmount));

// Authentication
router.use(authentication);

router.post("/create", asyncHandler(discountController.create));
router.get(
  "/codes/all",
  asyncHandler(discountController.getAllDiscountCodesOfShop)
);
router.delete(
  "/delete/:code",
  asyncHandler(discountController.deleteDiscountCode)
);
router.post(
  "/cancel/:shop_id",
  asyncHandler(discountController.cancelDiscountCode)
);
router.patch("/update/:code", asyncHandler(discountController.update));

module.exports = router;
