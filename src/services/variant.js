const { NotFoundError, AuthFailureError } = require("../core/error-response");
const { VariantModel } = require("../models/Variant");
const { ProductModel } = require("../models/Product");
const { convertToObjectIDMongo } = require("../utils/index");
const { findProduct } = require("../models/function/Product");

class VariantService {
  async createVariant({
    shop_id,
    product_id,
    size = "",
    color = "",
    image = "",
    quantity,
    sold = 0,
  }) {
    const product = await ProductModel.findById(product_id);
    if (!product) throw new NotFoundError("Product not found");

    if (shop_id !== product.product_shop.toString()) {
      console.log(
        "Shop:::: ",
        shop_id,
        "ProductShop:: ",
        product.product_shop.toString()
      );
      throw new AuthFailureError(
        "You dont have permission to create variants of this product"
      );
    }

    const variant = new VariantModel({
      variant_product_id: product_id,
      variant_size: size,
      variant_color: color,
      variant_image: image,
      variant_remain_quantity: quantity,
      variant_sold_quantity: sold,
    });

    return await variant.save();
  }

  async getVariantByID(ID) {
    const variant = await VariantModel.findById(ID);
    if (!variant) throw new NotFoundError("Can not find variant");
    return variant;
  }

  async getVariantByProductID({ product_id, limit = 10, offset = 0 }) {
    const product = await ProductModel.findById(product_id);
    if (!product) throw new NotFoundError("Product not found");

    const variants = await VariantModel.find({
      variant_product_id: convertToObjectIDMongo(product_id),
    });

    return variants;
  }

  async updateVariant(bodyUpdate, ID) {
    const foundVariance = await VariantModel.findById(ID);
    if (!foundVariance) throw new NotFoundError("Variance not found");

    const result = await VariantModel.updateOne(
      {
        _id: ID,
      },
      bodyUpdate,
      {
        upsert: true,
      }
    );

    console.log("Body update: " + bodyUpdate);

    return result;
  }

  async deleteProductVariant(product_id) {
    const foundProduct = await findProduct({ product_id });
    if (!foundProduct) throw new NotFoundError("Product not found");

    const result = await VariantModel.deleteMany({
      variant_product_id: convertToObjectIDMongo(product_id),
    });

    return result;
  }

  async deleteVariant(variant_id) {
    const foundVariant = await VariantModel.findById(variant_id);
    if (!foundVariant) throw new NotFoundError("Variant not found");

    const result = await VariantModel.deleteOne({
      _id: convertToObjectIDMongo(variant_id),
    });

    return result;
  }
}

module.exports = new VariantService();
