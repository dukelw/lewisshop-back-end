const ProductService = require("../services/product");
const { SuccessResponse } = require("../core/success-response");
class ShopController {
  async create(req, res, next) {
    new SuccessResponse({
      message: "Create new product successfully",
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userID,
      }),
    }).send(res);
  }
}

module.exports = new ShopController();
