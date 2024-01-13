const asyncHandler = require("../helpers/async-handler");
const express = require("express");
const router = express.Router();
const shopController = require("../controllers/ShopController");

router.post("/signin", asyncHandler(shopController.signin));
router.post("/signup", asyncHandler(shopController.signup));

module.exports = router;
