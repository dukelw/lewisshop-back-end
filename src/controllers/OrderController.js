const orderService = require("../services/order");
const { SuccessResponse } = require("../core/success-response");

class OrderController {
  async review(req, res, next) {
    new SuccessResponse({
      message: "Order review successfully",
      metadata: await orderService.checkoutReview({ ...req.body }),
    }).send(res);
  }

  async order(req, res, next) {
    new SuccessResponse({
      message: "Order successfully",
      metadata: await orderService.orderByUser({ ...req.body }),
    }).send(res);
  }

  async findOrderOfUser(req, res, next) {
    new SuccessResponse({
      message: "Find order of user successfully",
      metadata: await orderService.getOrderByUser({
        user_id: req.body.user_id,
      }),
    }).send(res);
  }

  async findOrderOfUserByStatus(req, res, next) {
    new SuccessResponse({
      message: "Find order of user by status successfully",
      metadata: await orderService.getOrderByStatus({
        user_id: req.body.user_id,
        order_status: req.body.order_status,
      }),
    }).send(res);
  }

  async findPendingOrderOfShop(req, res, next) {
    new SuccessResponse({
      message: "Find pending order of shop successfully",
      metadata: await orderService.getPendingOrderByShop({
        shop_id: req.body.shop_id,
      }),
    }).send(res);
  }

  async findOrderOfUserByID(req, res, next) {
    new SuccessResponse({
      message: "Find order of user by ID successfully",
      metadata: await orderService.getOneOrderByUser({
        user_id: req.body.user_id,
        order_id: req.body.order_id,
      }),
    }).send(res);
  }

  async cancel(req, res, next) {
    new SuccessResponse({
      message: "Cancel order successfully",
      metadata: await orderService.cancelOrderByUser({
        user_id: req.body.user_id,
        order_id: req.body.order_id,
      }),
    }).send(res);
  }

  async findDeleted(req, res, next) {
    new SuccessResponse({
      message: "Find deleted order successfully",
      metadata: await orderService.findDeletedOrder({
        user_id: req.body.user_id,
      }),
    }).send(res);
  }

  async restore(req, res, next) {
    new SuccessResponse({
      message: "Restore order successfully",
      metadata: await orderService.restoreOrder({
        user_id: req.body.user_id,
        order_id: req.body.order_id,
      }),
    }).send(res);
  }

  async updateStatus(req, res, next) {
    new SuccessResponse({
      message: "Update order status successfully",
      metadata: await orderService.updateOrderStatusByShop({
        shop_id: req.body.shop_id,
        order_id: req.body.order_id,
        action: req.body.action,
      }),
    }).send(res);
  }
}

module.exports = new OrderController();
