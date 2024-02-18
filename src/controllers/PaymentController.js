const paymentService = require("../services/payment");
const { SuccessResponse } = require("../core/success-response");
class PaymentController {
  async payWithMomo(req, res, next) {
    new SuccessResponse({
      message: "Pay with Momo successfully",
      metadata: await paymentService.momoPay({
        ...req.body,
      }),
    }).send(res);
  }
}

module.exports = new PaymentController();
