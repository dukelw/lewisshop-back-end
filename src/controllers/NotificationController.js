const notificationService = require("../services/notification");
const { SuccessResponse } = require("../core/success-response");

class NotificationController {
  async getNotificationOfUser(req, res, next) {
    new SuccessResponse({
      message: "Get notification of user successfully",
      metadata: await notificationService.listNotificationOfUser(req.body),
    }).send(res);
  }
}

module.exports = new NotificationController();
