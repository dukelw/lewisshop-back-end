const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "Notification";
const COLLECTION_NAME = "Notifications";

/*
  "ORDER-001": order successfully
  "ORDER-002": order failed
  "PROMOTION-001": new Promotion
  "SHOP-001": new product by User following
*/

var notificationSchema = new Schema(
  {
    notification_type: {
      type: String,
      enum: ["ORDER-001", "ORDER-002", "PROMOTION-001", "SHOP-001"],
      required: true,
    },
    notification_sender_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Shop",
    },
    notification_receiver_id: {
      type: Number,
      required: true,
    },
    notification_content: {
      type: String,
      required: true,
    },
    notification_options: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = {
  NotificationModel: model(DOCUMENT_NAME, notificationSchema),
};
