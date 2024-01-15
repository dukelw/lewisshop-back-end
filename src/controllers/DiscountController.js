const discountService = require("../services/discount");
const { SuccessResponse } = require("../core/success-response");
class DiscountController {
  async create(req, res, next) {
    new SuccessResponse({
      message: "Create new discount code successfully",
      metadata: await discountService.createDiscountCode({
        ...req.body,
        discount_shop_id: req.user.user_id,
      }),
    }).send(res);
  }

  async update(req, res, next) {
    new SuccessResponse({
      message: "Update discount code successfully",
      metadata: await discountService.updateDiscountCode(
        req.user.user_id,
        req.params.code,
        {
          ...req.body,
          discount_shop_id: req.user.user_id,
        }
      ),
    }).send(res);
  }

  async getAllProductApplyADiscountCode(req, res, next) {
    new SuccessResponse({
      message: `Get all product apply discount code successfully`,
      metadata: await discountService.getAllProductCanUseADiscountCode({
        ...req.query,
      }),
    }).send(res);
  }

  async getAllDiscountCodesOfShop(req, res, next) {
    new SuccessResponse({
      message: `Get all discount codes of shop ${req.user.user_id} successfully`,
      metadata: await discountService.getAllDiscountCodeOfShop({
        ...req.query,
        discount_shop_id: req.user.user_id,
      }),
    }).send(res);
  }

  async getDiscountAmount(req, res, next) {
    new SuccessResponse({
      message: `Get discount amount successfully`,
      metadata: await discountService.getDiscountAmount({
        ...req.body,
      }),
    }).send(res);
  }

  async deleteDiscountCode(req, res, next) {
    new SuccessResponse({
      message: `Delete discount code ${req.params.code} successfully`,
      metadata: await discountService.deleteDiscountCode({
        shop_id: req.user.user_id,
        code: req.params.code,
      }),
    }).send(res);
  }

  async cancelDiscountCode(req, res, next) {
    new SuccessResponse({
      message: `Cancel discount code successfully`,
      metadata: await discountService.cancelDiscountCode({
        shop_id: req.params.shop_id,
        code: req.body.code,
        user_id: req.body.user_id,
      }),
    }).send(res);
  }
}

module.exports = new DiscountController();
