const express = require("express");
const router = express.Router();
const asyncHandler = require("../helpers/async-handler");

const variantController = require("../controllers/VariantController");
const { authentication } = require("../auth/utils");

// Authentication
router.get("/:id", asyncHandler(variantController.getVariantByID));
router.get("", asyncHandler(variantController.getVariantByProductID));
router.use(authentication);
router.post("/:id", asyncHandler(variantController.update));
router.post("", asyncHandler(variantController.create));
router.delete("/all", asyncHandler(variantController.deleteVariantsOfProduct));
router.delete("", asyncHandler(variantController.delete));

module.exports = router;
