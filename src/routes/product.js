const express = require("express");
const router = express.Router();
const { authentication } = require("../auth/utils");
const asyncHandler = require("../helpers/async-handler");
const productController = require("../controllers/ProductController");

router.get(
  "/search/:keySearch",
  asyncHandler(productController.getMatchProduct)
);
router.get(
  "/all-product-no-limit",
  asyncHandler(productController.findAllProductsNoLimit)
);
router.post("/find-products", asyncHandler(productController.findProducts));
router.get("/type/:type", asyncHandler(productController.getAllRelateProduct));
router.get("/id/:id", asyncHandler(productController.findProduct));
router.get("", asyncHandler(productController.findAllProducts));
router.get("/publish/all", asyncHandler(productController.getAllPublish));

router.use(authentication);
router.post("/publish/:id", asyncHandler(productController.publishProduct));
router.post("/create", asyncHandler(productController.create));
router.patch("/update/:id", asyncHandler(productController.update));
router.post("/unpublish/:id", asyncHandler(productController.unpublishProduct));
router.get("/draft/all", asyncHandler(productController.getAllDraft));

module.exports = router;
