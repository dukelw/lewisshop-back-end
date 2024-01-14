const express = require("express");
const router = express.Router();
const { authentication } = require("../auth/utils");
const asyncHandler = require("../helpers/async-handler");
const shopController = require("../controllers/ShopController");

router.post("/signin", asyncHandler(shopController.signin));
router.post("/signup", asyncHandler(shopController.signup));

router.use(authentication);
router.post("/logout", asyncHandler(shopController.logout));
router.post("/refresh-token", asyncHandler(shopController.refreshToken));

module.exports = router;
