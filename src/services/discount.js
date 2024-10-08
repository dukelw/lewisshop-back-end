const { DiscountModel } = require("../models/Discount");
const ShopModel = require("../models/Shop");
const { BadRequestError, NotFoundError } = require("../core/error-response");
const {
  convertToObjectIDMongo,
  updateNestedObjectParser,
} = require("../utils/index");
const {
  updateDiscountByCode,
  findAllDiscountCodesUnselect,
  checkDiscountExistence,
} = require("../models/function/Discount");
const { findAllProducts } = require("../models/function/Product");
const { ProductModel } = require("../models/Product");

class DiscountService {
  async createDiscountCode(payload) {
    const {
      discount_code,
      discount_start_date,
      discount_end_date,
      discount_is_active,
      discount_shop_id,
      discount_min_order_value,
      discount_product_ids,
      discount_applies_to,
      discount_name,
      discount_description,
      discount_type,
      discount_value,
      discount_max_value,
      discount_users_uses,
      discount_max_uses,
      discount_uses_count,
      discount_max_uses_per_user,
    } = payload;

    // Check
    if (new Date() > new Date(discount_end_date))
      throw new BadRequestError("Discount code has expired!");

    if (new Date(discount_start_date) > new Date(discount_end_date))
      throw new BadRequestError("Start day must before end day");

    // Create index for discount code
    const foundDiscount = await DiscountModel.findOne({
      discount_code: discount_code,
      discount_shop_id: convertToObjectIDMongo(discount_shop_id),
    }).lean();

    if (foundDiscount && foundDiscount.discount_is_active)
      throw new BadRequestError("Discount code existed!");

    const newDiscount = await DiscountModel.create({
      discount_name,
      discount_description,
      discount_type,
      discount_value,
      discount_max_value,
      discount_code,
      discount_start_date: new Date(discount_start_date),
      discount_end_date: new Date(discount_end_date),
      discount_max_uses,
      discount_uses_count,
      discount_users_used: discount_users_uses,
      discount_max_uses_per_user,
      discount_min_order_value: discount_min_order_value || 0,
      discount_shop_id: convertToObjectIDMongo(discount_shop_id),
      discount_is_active,
      discount_applies_to: discount_applies_to === "all" ? "all" : "specific",
      discount_product_ids,
    });
    return newDiscount;
  }

  async updateDiscountCode(discount_shop_id, discount_code, bodyUpdate) {
    const newBodyUpdate = updateNestedObjectParser(bodyUpdate);
    return await updateDiscountByCode({
      discount_shop_id,
      discount_code,
      bodyUpdate: newBodyUpdate,
    });
  }

  async getAllProductCanUseADiscountCode({
    discount_code,
    discount_shop_id,
    limit,
    page,
  }) {
    const foundDiscount = await checkDiscountExistence({
      Model: DiscountModel,
      filter: {
        discount_code,
        discount_shop_id: convertToObjectIDMongo(discount_shop_id),
      },
    });

    if (!foundDiscount || !foundDiscount.discount_is_active)
      throw new NotFoundError("Discount doesn't existed!");

    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let products;
    if (discount_applies_to === "all") {
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectIDMongo(discount_shop_id),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    } else if (discount_applies_to === "specific") {
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }
    return products;
  }

  async getAllDiscountCodeOfShop({ limit, page, discount_shop_id }) {
    const discounts = await findAllDiscountCodesUnselect({
      limit: +limit,
      page: +page,
      Model: DiscountModel,
      filter: {
        discount_shop_id: convertToObjectIDMongo(discount_shop_id),
        discount_is_active: true,
      },
      unSelect: ["__v", "discount_shop_id"],
    });
    return discounts;
  }

  async getAllDiscountCodeOfAShopByUser({ limit, page, discount_shop_id }) {
    const discounts = await findAllDiscountCodesUnselect({
      limit: +limit,
      page: +page,
      Model: DiscountModel,
      filter: {
        discount_shop_id: convertToObjectIDMongo(discount_shop_id),
        discount_is_active: true,
      },
      unSelect: ["__v"],
    });
    const shop = await ShopModel.findById(discount_shop_id);
    let newDiscounts = discounts.map((discount) => {
      return {
        ...discount,
        discount_shop_name: shop.name,
      };
    });
    return newDiscounts;
  }

  async getAllDiscountCodeOfShopsByUser({
    limit,
    page,
    discount_shop_ids = [],
    user_id,
  }) {
    const allDiscountsPromises = discount_shop_ids.map(async (shop_id) => {
      const discounts = await findAllDiscountCodesUnselect({
        limit: +limit,
        page: +page,
        Model: DiscountModel,
        filter: {
          discount_shop_id: convertToObjectIDMongo(shop_id),
          discount_is_active: true,
        },
        unSelect: ["__v"],
      });
      const shop = await ShopModel.findById(shop_id);
      let shop_name = "";
      let newDiscounts = discounts.map((discount) => {
        return {
          ...discount,
          discount_shop_name: shop.name,
        };
      });
      const shop_discount = newDiscounts.map((discount) => {
        shop_name = discount.discount_shop_name;
        return {
          _id: discount._id,
          code: discount.discount_code,
          name: discount.discount_name,
          minimum: discount.discount_min_order_value,
          maxUse: discount.discount_max_uses_per_user,
          userUsed: discount.discount_users_used,
        };
      });

      return { shop_id, shop_name, shop_discount };
    });

    return Promise.all(allDiscountsPromises);
  }

  async getDiscountAmount({ code, user_id, shop_id, products }) {
    const foundDiscount = await checkDiscountExistence({
      Model: DiscountModel,
      filter: {
        discount_code: code,
        discount_shop_id: convertToObjectIDMongo(shop_id),
      },
    });

    if (!foundDiscount) throw new NotFoundError("Discount does not exist");

    const {
      discount_is_active,
      discount_max_uses,
      discount_min_order_value,
      discount_users_used,
      discount_type,
      discount_value,
      discount_end_date,
      discount_max_uses_per_user,
    } = foundDiscount;

    if (!discount_is_active) throw new NotFoundError("Discount is expired");
    if (!discount_max_uses) throw new NotFoundError("Discount are out");
    if (new Date() > new Date(discount_end_date))
      throw new NotFoundError("Discount are out");

    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      for (const product of products) {
        const foundProduct = await ProductModel.findById(product.product_id);
        if (!foundProduct) throw new NotFoundError("Product not found");
        totalOrder += product.quantity * foundProduct.product_price;
      }

      if (totalOrder < discount_min_order_value)
        throw new BadRequestError(
          `Discount requires minimum order value ${discount_min_order_value}`
        );
    }

    if (discount_max_uses_per_user > 0) {
      const usedUserDiscount = discount_users_used.filter(
        (user) => user === user_id
      );

      if (usedUserDiscount.length >= discount_max_uses_per_user)
        throw new BadRequestError(
          `Each user can only user this code ${discount_max_uses_per_user} times`
        );
    }

    const amount =
      discount_type === "fixed_amount"
        ? discount_value
        : totalOrder * (discount_value / 100);

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  async deleteDiscountCode({ shop_id, code }) {
    const deleted = await DiscountModel.delete({
      discount_code: code,
      discount_shop_id: shop_id,
    });

    return deleted;
  }

  async cancelDiscountCode({ code, shop_id, user_id }) {
    const foundDiscount = checkDiscountExistence({
      Model: DiscountModel,
      filter: {
        discount_code: code,
        discount_shop_id: convertToObjectIDMongo(shop_id),
      },
    });

    if (!foundDiscount) throw new NotFoundError("Discount does not exist");

    const result = await DiscountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: user_id,
      },
      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1,
      },
    });

    return result;
  }

  async findDeletedDiscount({ shop_id }) {
    const foundShop = ShopModel.findById(shop_id);
    if (!foundShop) throw new BadRequestError("Can not find shop");
    return await DiscountModel.findWithDeleted({
      deleted: true,
      discount_shop_id: convertToObjectIDMongo(shop_id),
    });
  }

  async restoreDiscount({ discount_id }) {
    const foundDiscount = DiscountModel.findById(discount_id);
    if (!foundDiscount) throw new BadRequestError("Can not find discount");
    return await DiscountModel.restore({
      _id: convertToObjectIDMongo(discount_id),
    });
  }

  async destroyDiscount({ discount_id, shop_id }) {
    const foundShop = DiscountModel.findById(shop_id);
    if (!foundShop) throw new BadRequestError("Can not find shop");
    const foundDiscount = DiscountModel.findById(discount_id);
    if (!foundDiscount) throw new BadRequestError("Can not find discount");
    if (foundShop._id !== foundDiscount.discount_shop_id)
      throw new BadRequestError(
        "You dont have permission to delete this discount"
      );
    return await DiscountModel.deleteOne({ _id: discount_id });
  }

  async checkAndUpdateDiscountStatus() {
    try {
      // Get all the expired discount
      const activeDiscounts = await DiscountModel.find({
        discount_end_date: { $gt: new Date() }, // Get all the active discount
      });

      // Update expired discount
      const expiredDiscounts = await DiscountModel.updateMany(
        {
          _id: { $nin: activeDiscounts.map((discount) => discount._id) }, // Get all discount with is not in active discount list
        },
        { discount_is_active: false } // Update their status to false
      );

      console.log("Updated discounts:", expiredDiscounts.nModified);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new DiscountService();
