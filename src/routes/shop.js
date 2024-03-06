const express = require("express");
const router = express.Router();
const { authentication } = require("../auth/utils");
const asyncHandler = require("../helpers/async-handler");
const shopController = require("../controllers/ShopController");

router.post("/signin", asyncHandler(shopController.signin));
router.post("/signup", asyncHandler(shopController.signup));
router.get("/all", asyncHandler(shopController.findAllShops));
router.get("/:id", asyncHandler(shopController.findShopByID));

router.use(authentication);
router.post("/change-password", asyncHandler(shopController.changePassword));
// router.post(
//   "/update-address-default",
//   asyncHandler(shopController.updateAddressDefault)
// );
// router.post("/update-address", asyncHandler(shopController.updateAddress));
// router.post("/add-address", asyncHandler(shopController.addAddress));
router.post("/update", asyncHandler(shopController.updateInformation));
router.post("/logout", asyncHandler(shopController.logout));
router.post("/refresh-token", asyncHandler(shopController.refreshToken));

module.exports = router;
