const { NotificationModel } = require("../models/Notification");

class NotificationService {
  async pushNotificationToSystem({
    type = "SHOP-001",
    receiver_id = 1,
    sender_id = 1,
    options = {},
  }) {
    let notificationContent;

    if (type === "SHOP-001") {
      notificationContent = `shop_name has just added a new product: product_name`;
    } else if (type === "PROMOTION-001") {
      notificationContent = `shop_name has just added a new voucher: voucher_name`;
    }

    const newNotification = await NotificationModel.create({
      notification_type: type,
      notification_content: notificationContent,
      notification_sender_id: sender_id,
      notification_receiver_id: receiver_id,
      notification_options: options,
    });

    return newNotification;
  }

  async listNotificationOfUser({ user_id = 1, type = "ALL", is_read = 0 }) {
    const match = { notification_receiver_id: user_id };
    if (type !== "ALL") {
      match["notification_type"] = type;
    }
    return await NotificationModel.aggregate([
      {
        $match: match,
      },
      {
        $project: {
          notification_type: 1,
          notification_sender_id: 1,
          notification_receiver_id: 1,
          notification_content: {
            $concat: [
              {
                $substr: [`$notification_options.shop_name`, 0, -1],
              },
              " has just added a new product: ",
              {
                $substr: [`$notification_options.product_name`, 0, -1],
              },
            ],
          },
          notification_options: 1,
          createdAt: 1,
        },
      },
    ]);
  }
}

module.exports = new NotificationService();
