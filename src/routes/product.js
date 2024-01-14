const express = require("express");
const router = express.Router();
const { authentication } = require("../auth/utils");
const asyncHandler = require("../helpers/async-handler");
const productController = require("../controllers/ProductController");

router.use(authentication);
router.post("/create", asyncHandler(productController.create));

module.exports = router;
