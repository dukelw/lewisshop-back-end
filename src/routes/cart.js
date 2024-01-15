const express = require("express");
const router = express.Router();
const asyncHandler = require("../helpers/async-handler");

const cartController = require("../controllers/CartController");
const { authentication } = require("../auth/utils");

// Authentication
router.use(authentication);

router.get("", asyncHandler(cartController.getCartOfUser));
router.post("/update", asyncHandler(cartController.updateCart));
router.post("", asyncHandler(cartController.addToCart));
router.delete("", asyncHandler(cartController.deleteCartItem));

module.exports = router;
