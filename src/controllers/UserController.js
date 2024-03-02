const userService = require("../services/user");
const { CREATED, SuccessResponse } = require("../core/success-response");
class UserController {
  async signup(req, res, next) {
    new CREATED({
      message: "Registered successfully",
      metadata: await userService.signUp(req.body),
      options: { limit: 10 },
    }).send(res);
  }

  async signin(req, res, next) {
    new SuccessResponse({
      message: "Login successfully",
      metadata: await userService.signIn(req.body),
    }).send(res);
  }

  async logout(req, res, next) {
    new SuccessResponse({
      message: "Logout successfully",
      metadata: await userService.logOut(req.keyStore),
    }).send(res);
  }

  async refreshToken(req, res, next) {
    new SuccessResponse({
      message: "Refresh token successfully",
      metadata: await userService.refreshToken({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore,
      }),
    }).send(res);
  }

  async find(req, res, next) {
    new SuccessResponse({
      message: "Find user successfully",
      metadata: await userService.find({
        user_id: req.body.user_id,
      }),
    }).send(res);
  }

  async updateInformation(req, res, next) {
    new SuccessResponse({
      message: "Update information successfully",
      metadata: await userService.updateInformation({
        ...req.body,
        user_id: req.user.user_id,
      }),
    }).send(res);
  }
}

module.exports = new UserController();
