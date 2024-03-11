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
router.get(
  "/discount-codes",
  asyncHandler(discountController.getAllDiscountCodesOfAShopByUser)
);
router.get(
  "/codes/all",
  asyncHandler(discountController.getAllDiscountCodesOfShop)
);
router.post(
  "/codes-of-shops",
  asyncHandler(discountController.getAllDiscountCodesOfShopsByUser)
);
// Authentication
router.use(authentication);

router.post("/create", asyncHandler(discountController.create));
router.delete(
  "/delete/:code",
  asyncHandler(discountController.deleteDiscountCode)
);
router.delete(
  "/destroy/:id",
  asyncHandler(discountController.destroyDiscountCode)
);
router.post(
  "/restore/:id",
  asyncHandler(discountController.restoreDiscountCode)
);
router.get(
  "/deleted-codes",
  asyncHandler(discountController.getDeletedDiscountCode)
);
router.post(
  "/cancel/:shop_id",
  asyncHandler(discountController.cancelDiscountCode)
);
router.patch("/update/:code", asyncHandler(discountController.update));

module.exports = router;
