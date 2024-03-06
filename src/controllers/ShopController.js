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

  async logout(req, res, next) {
    new SuccessResponse({
      message: "Logout successfully",
      metadata: await shopService.logOut(req.keyStore),
    }).send(res);
  }

  async refreshToken(req, res, next) {
    new SuccessResponse({
      message: "Refresh token successfully",
      metadata: await shopService.refreshToken({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore,
      }),
    }).send(res);
  }

  async findShopByID(req, res, next) {
    new SuccessResponse({
      message: "Find shop by ID successfully",
      metadata: await shopService.getShopByID(req.params.id),
    }).send(res);
  }

  async findAllShops(req, res, next) {
    new SuccessResponse({
      message: "Find all shop successfully",
      metadata: await shopService.getAllShop(),
    }).send(res);
  }

  async updateInformation(req, res, next) {
    console.log("Req user::: ", req.user);
    new SuccessResponse({
      message: "Update information successfully",
      metadata: await shopService.updateInformation({
        ...req.body,
        shop_id: req.user.user_id,
      }),
    }).send(res);
  }

  async updateAddress(req, res, next) {
    new SuccessResponse({
      message: "Update address successfully",
      metadata: await shopService.updateAddresses({
        new_address: req.body.address,
        index: req.body.index,
        shop_id: req.user.shop_id,
      }),
    }).send(res);
  }

  async updateAddressDefault(req, res, next) {
    new SuccessResponse({
      message: "Update address default successfully",
      metadata: await shopService.setDefaultAddress({
        index: req.body.index,
        shop_id: req.user.shop_id,
      }),
    }).send(res);
  }

  async addAddress(req, res, next) {
    new SuccessResponse({
      message: "Update address successfully",
      metadata: await shopService.addAddress({
        address: req.body.address,
        shop_id: req.user.shop_id,
      }),
    }).send(res);
  }

  async changePassword(req, res, next) {
    new SuccessResponse({
      message: "Change password successfully",
      metadata: await shopService.changePassword(req.body),
    }).send(res);
  }
}

module.exports = new ShopController();
