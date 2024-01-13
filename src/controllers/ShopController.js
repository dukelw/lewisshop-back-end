const shopService = require("../services/shop");
const { CREATED, SuccessResponse } = require("../core/success-response");
class ShopController {
  async signup(req, res, next) {
    new CREATED({
      message: "Registered successfully",
      metadata: await shopService.signUp(req.body),
      options: { limit: 10 },
    }).send(res);
  }
}

module.exports = new ShopController();
