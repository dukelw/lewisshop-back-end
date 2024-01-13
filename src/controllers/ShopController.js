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

  async signin(req, res, next) {
    new SuccessResponse({
      message: "Login successfully",
      metadata: await shopService.signIn(req.body),
    }).send(res);
  }
}

module.exports = new ShopController();
