const express = require("express");
const router = express.Router();
const { authentication } = require("../auth/utils");
const asyncHandler = require("../helpers/async-handler");
const productController = require("../controllers/ProductController");

router.get(
  "/search/:keySearch",
  asyncHandler(productController.getMatchProduct)
);
router.get("", asyncHandler(productController.findAllProducts));
router.get("/:id", asyncHandler(productController.findProduct));

router.use(authentication);
router.post("/create", asyncHandler(productController.create));
router.patch("/update/:id", asyncHandler(productController.update));
router.post("/publish/:id", asyncHandler(productController.publishProduct));
router.post("/unpublish/:id", asyncHandler(productController.unpublishProduct));
router.get("/draft/all", asyncHandler(productController.getAllDraft));
router.get("/publish/all", asyncHandler(productController.getAllPublish));

module.exports = router;
