const ProductService = require("../services/product");
const { SuccessResponse } = require("../core/success-response");
class ProductController {
  async create(req, res, next) {
    new SuccessResponse({
      message: "Create new product successfully",
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.user_id,
      }),
    }).send(res);
  }

  async update(req, res, next) {
    new SuccessResponse({
      message: "Update product successfully",
      metadata: await ProductService.updateProduct(
        req.body.product_type,
        req.params.id,
        {
          ...req.body,
          product_shop: req.user.user_id,
        }
      ),
    }).send(res);
  }

  async publishProduct(req, res, next) {
    new SuccessResponse({
      message: "Publish product successfully",
      metadata: await ProductService.publishProductByShop({
        product_shop: req.user.user_id,
        product_id: req.params.id,
      }),
    }).send(res);
  }

  async unpublishProduct(req, res, next) {
    new SuccessResponse({
      message: "Unpublish product successfully",
      metadata: await ProductService.unpublishProductByShop({
        product_shop: req.user.user_id,
        product_id: req.params.id,
      }),
    }).send(res);
  }

  async getAllDraft(req, res, next) {
    new SuccessResponse({
      message: "Get all draft product successfully",
      metadata: await ProductService.findAllDraftProductOfShop({
        product_shop: req.user.user_id,
      }),
    }).send(res);
  }

  async getAllPublish(req, res, next) {
    new SuccessResponse({
      message: "Get all publish product successfully",
      metadata: await ProductService.findAllPublishProductOfShop({
        product_shop: req.user.user_id,
      }),
    }).send(res);
  }

  async getMatchProduct(req, res, next) {
    new SuccessResponse({
      message: "Get match product with key search successfully",
      metadata: await ProductService.searchProduct(req.params),
    }).send(res);
  }

  async findAllProducts(req, res, next) {
    new SuccessResponse({
      message: "Find all product successfully",
      metadata: await ProductService.findAllProducts(req.query),
    }).send(res);
  }

  async findProduct(req, res, next) {
    new SuccessResponse({
      message: "Find product by id successfully",
      metadata: await ProductService.findProduct({
        product_id: req.params.id,
      }),
    }).send(res);
  }

  async findProducts(req, res, next) {
    new SuccessResponse({
      message: "Find products by id successfully",
      metadata: await ProductService.findProducts({
        product_ids: req.body,
      }),
    }).send(res);
  }

  async getAllRelateProduct(req, res, next) {
    console.log("Product_type", req.params.type);
    new SuccessResponse({
      message: "Get all relate product successfully",
      metadata: await ProductService.findAllProductSameCategory({
        product_type: req.params.type,
      }),
    }).send(res);
  }
}

module.exports = new ProductController();
