const cartService = require("../services/cart");
const { SuccessResponse } = require("../core/success-response");
class CartController {
  async addToCart(req, res, next) {
    new SuccessResponse({
      message: "Add product to cart successfully",
      metadata: await cartService.addToCart({
        ...req.body,
      }),
    }).send(res);
  }

  async updateCart(req, res, next) {
    new SuccessResponse({
      message: "Update cart successfully",
      metadata: await cartService.updateCart({
        ...req.body,
      }),
    }).send(res);
  }

  async deleteCartItem(req, res, next) {
    new SuccessResponse({
      message: `Delete cart item successfully`,
      metadata: await cartService.deleteUserCartItem({
        ...req.body,
      }),
    }).send(res);
  }

  async getCartOfUser(req, res, next) {
    new SuccessResponse({
      message: `Get cart of user successfully`,
      metadata: await cartService.getCartOfUser({
        ...req.query,
      }),
    }).send(res);
  }
}

module.exports = new CartController();
