const variantService = require("../services/variant");
const { SuccessResponse } = require("../core/success-response");

class VariantController {
  // Create
  async create(req, res, next) {
    new SuccessResponse({
      message: "Create new variant successfully",
      metadata: await variantService.createVariant({ ...req.body }),
    }).send(res);
  }

  // Get variant by id
  async getVariantByID(req, res, next) {
    new SuccessResponse({
      message: "Get variant by ID successfully",
      metadata: await variantService.getVariantByID(req.params.id),
    }).send(res);
  }

  // Get variant by product id
  async getVariantByProductID(req, res, next) {
    new SuccessResponse({
      message: "Get variant by product ID successfully",
      metadata: await variantService.getVariantByProductID(req.query),
    }).send(res);
  }

  // Update variant of product
  async update(req, res, next) {
    new SuccessResponse({
      message: "Update variant of product successfully",
      metadata: await variantService.updateVariant(req.body, req.params.id),
    }).send(res);
  }

  // Delete variant of product
  async deleteVariantsOfProduct(req, res, next) {
    new SuccessResponse({
      message: "Delete variant of product successfully",
      metadata: await variantService.deleteProductVariant(req.body),
    }).send(res);
  }

  async delete(req, res, next) {
    new SuccessResponse({
      message: "Delete variant successfully",
      metadata: await variantService.deleteVariant(req.body),
    }).send(res);
  }
}

module.exports = new VariantController();
