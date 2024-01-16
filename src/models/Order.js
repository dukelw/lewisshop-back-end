const { Schema, model } = require("mongoose");
var mongoose_delete = require("mongoose-delete");

const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "Orders";

var orderSchema = new Schema(
  {
    order_user_id: {
      type: Number,
      required: true,
    },
    order_checkout: {
      type: Object,
      default: {},
    },
    /*
      order_checkout = {
        totalPrice,
        totalApplyDiscount,
        feeShip
      }
    */
    order_shipping: {
      type: Object,
      default: {},
    },
    /*
      street,
      city,
      state,
      country
    */
    order_payment: {
      type: Object,
      default: {},
    },
    order_products: {
      type: Array,
      required: true,
    },
    order_trackingNumber: {
      type: String,
      default: "0000118052022",
    },
    order_status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "canceled", "delivered"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

orderSchema.plugin(mongoose_delete, { overrideMethods: true, deletedAt: true });

module.exports = {
  OrderModel: model(DOCUMENT_NAME, orderSchema),
};
