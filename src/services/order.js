const { OrderModel } = require("../models/Order");
const ShopModel = require("../models/Shop");
const UserModel = require("../models/User");
const { NotFoundError, BadRequestError } = require("../core/error-response");
const { findCartByID } = require("../models/function/Cart");
const { checkProductByServer } = require("../models/function/Product");
const { acquireLock, releaseLock } = require("../services/redis");
const discountService = require("../services/discount");
const { convertToObjectIDMongo } = require("../utils");
const { restoreInventory } = require("../models/function/Inventory");
const {
  updateDiscountByCode,
  restoreDiscount,
} = require("../models/function/Discount");
const { deleteCartItemsForUser } = require("./cart");
const { updateStatusOfOrder } = require("../models/function/Order");

class OrderService {
  /*
    {
      cart_id,
      user_id,
      shop_order_ids: [
        {
          shop_id,
          shop_discounts: [],
          item_products: [
            {
              price,
              quantity,
              product_id
            }
          ]
        },
        {
          shop_id,
          shop_discounts: [],
          item_products: [
            {
              price,
              quantity,
              product_id
            }
          ]
        }
      ]
    }
  */

  async checkoutReview({ cart_id, user_id, shop_order_ids }) {
    // Check cart's existence
    const foundCart = await findCartByID({ cart_id });
    if (!foundCart) throw new NotFoundError("Cart does not exist");

    const checkout_order = {
        totalPrice: 0,
        feeShip: 0,
        totalDiscount: 0,
        totalCheckout: 0,
      },
      shop_order_ids_new = [];

    // Calculate bill
    for (let i = 0; i < shop_order_ids.length; i++) {
      const {
        shop_id,
        shop_discounts = [],
        item_products = [],
      } = shop_order_ids[i];

      const foundShop = await ShopModel.findById(shop_id);

      // Check product available
      const checkProductServer = await checkProductByServer(item_products);
      if (!checkProductServer) throw new BadRequestError("Order wrong");

      // Bill of order
      const checkoutPrice = checkProductServer.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      // Bill of order before applying discount and shipping fee
      checkout_order.totalPrice += checkoutPrice;

      const itemCheckout = {
        shop_id,
        shop_name: foundShop.name,
        shop_discounts,
        rawPrice: checkoutPrice,
        appliedDiscountPrice: checkoutPrice,
        item_products: checkProductServer,
      };

      // If shop discount > 0, check validate
      if (shop_discounts.length > 0) {
        const { discount = 0 } = await discountService.getDiscountAmount({
          code: shop_discounts[0].code,
          user_id,
          shop_id,
          products: checkProductServer,
        });

        // Sum discounts
        checkout_order.totalDiscount += discount;

        // If discount > 0
        if (discount > 0) {
          itemCheckout.appliedDiscountPrice = checkoutPrice - discount;
        }
      }
      // Final bill
      checkout_order.totalCheckout += itemCheckout.appliedDiscountPrice;
      shop_order_ids_new.push(itemCheckout);
    }
    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }

  // Order
  async orderByUser({
    shop_order_ids,
    cart_id,
    user_id,
    user_address = {},
    user_payment = {},
  }) {
    const { shop_order_ids_new, checkout_order } = await this.checkoutReview({
      cart_id,
      user_id,
      shop_order_ids,
    });

    // One more check inventory of product
    // Get new array by flatmap
    const products = shop_order_ids_new.flatMap((order) => order.item_products);
    const productIDs = [];
    const acquireProduct = [];

    for (let i = 0; i < products.length; i++) {
      const { product_id, quantity } = products[i];
      productIDs.push(product_id);
      const keyLock = await acquireLock(product_id, quantity, cart_id);
      acquireProduct.push(keyLock ? true : false);
      if (keyLock) {
        await releaseLock(keyLock);
      }
    }

    // Check if some products is out of stock
    if (acquireProduct.includes(false))
      throw new BadRequestError(
        `Some products have been updated recently. please try again`
      );

    const newOrder = await OrderModel.create({
      order_user_id: user_id,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_new,
      order_cart_id: cart_id,
    });

    // Delete ordered products in cart
    if (newOrder) {
      await deleteCartItemsForUser({ user_id, product_ids: productIDs });
    }

    const discountInfos = [];
    if (newOrder) {
      shop_order_ids_new.forEach((order_id) => {
        order_id.shop_discounts.map((discount) => {
          discountInfos.push({
            id: discount.discount_id,
            shop: discount.shop_id,
            code: discount.code,
          });
        });
      });

      for (const discount of discountInfos) {
        const bodyUpdate = {
          $inc: {
            discount_uses_count: 1,
            discount_max_uses: -1,
          },
          $push: {
            discount_users_used: user_id,
          },
        };

        updateDiscountByCode({
          discount_shop_id: discount.shop,
          discount_code: discount.code,
          bodyUpdate,
        });
      }
    }

    return newOrder;
  }

  async cloneOrder({
    shop_order_ids,
    cart_id,
    user_id,
    user_address = {},
    user_payment = {},
  }) {
    const { shop_order_ids_new, checkout_order } = await this.checkoutReview({
      cart_id,
      user_id,
      shop_order_ids,
    });

    // One more check inventory of product
    // Get new array by flatmap
    const products = shop_order_ids_new.flatMap((order) => order.item_products);
    const productIDs = [];
    const acquireProduct = [];

    for (let i = 0; i < products.length; i++) {
      const { product_id, quantity } = products[i];
      productIDs.push(product_id);
      const keyLock = await acquireLock(product_id, quantity, cart_id);
      acquireProduct.push(keyLock ? true : false);
      if (keyLock) {
        await releaseLock(keyLock);
      }
    }

    // Check if some products is out of stock
    if (acquireProduct.includes(false))
      throw new BadRequestError(
        `Some products have been updated recently. please try again`
      );

    const newOrder = await OrderModel.create({
      order_user_id: user_id,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_new,
      order_cart_id: cart_id,
    });

    return newOrder;
  }
  /*
    1. Query Orders [User]
  */
  async getOrderByUser({ limit = 50, page = 1, sort = "ctime", user_id }) {
    const foundUser = await UserModel.findById(user_id);
    if (!foundUser) throw new NotFoundError("User id not found");
    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
    const orders = await OrderModel.find({
      order_user_id: user_id,
    })
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean();
    return orders;
  }

  async getOrderByStatus({
    limit = 50,
    page = 1,
    sort = "ctime",
    user_id,
    order_status,
  }) {
    const foundUser = await UserModel.findById(user_id);
    if (!foundUser) throw new NotFoundError("User id not found");
    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
    const orders = await OrderModel.find({
      order_user_id: user_id,
      order_status,
    })
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean();
    return orders;
  }

  /*
    2. Query Orders Using ID [User]
  */
  async getOneOrderByUser({ user_id, order_id }) {
    if (!user_id) throw new NotFoundError("User id not found");
    const order = await OrderModel.find({
      order_user_id: user_id,
      _id: convertToObjectIDMongo(order_id),
    }).lean();
    return order;
  }

  /*
    3. Cancel Orders [User]
  */
  async cancelOrderByUser({ user_id, order_id }) {
    const foundOrder = await OrderModel.findOne({
      order_user_id: user_id,
      _id: convertToObjectIDMongo(order_id),
    });

    if (!foundOrder) throw new NotFoundError("Order is not found");

    // Update quantity of inventory
    const restoreProducts = [];
    const restoreDiscounts = [];
    foundOrder.order_products.forEach((shop_order) => {
      shop_order.item_products.forEach((product) => {
        restoreProducts.push({
          product_id: product.product_id,
          product_quantity: product.quantity,
          cart_id: foundOrder.order_cart_id,
        });
      });
      shop_order.shop_discounts.forEach((discount) => {
        restoreDiscounts.push({
          id: discount.discount_id,
          shop: discount.shop_id,
          code: discount.code,
          user: user_id,
        });
      });
    });

    // Update discount code
    await restoreDiscount(restoreDiscounts);

    // Cancel reservation order
    await restoreInventory(restoreProducts);

    // Soft delete order
    return await OrderModel.delete({
      order_user_id: user_id,
      _id: convertToObjectIDMongo(order_id),
    });
  }
  /*
    4. Find Deleted Orders [Shop | Admin | User]
  */
  async findDeletedOrder({ user_id }) {
    if (!user_id) throw new BadRequestError("Can not find user ID");
    return await OrderModel.findWithDeleted({ deleted: true });
  }

  /*
    5. Restore Deleted Orders [User]
  */
  async restoreOrder({ user_id, order_id }) {
    if (!user_id) throw new BadRequestError("Can not find user ID");
    if (!order_id) throw new BadRequestError("Can not find order ID");
    return await OrderModel.restore({
      order_user_id: user_id,
      _id: convertToObjectIDMongo(order_id),
    });
  }

  /*
    6. Update Orders Status [Shop | Admin]
  */
  async updateOrderStatusByShop({ shop_id, order_id, action }) {
    const foundShop = await ShopModel.findById(shop_id);
    if (!foundShop) throw new NotFoundError("Can not find user");

    const foundOrder = await OrderModel.findById(order_id);
    if (!foundOrder) throw new NotFoundError("Can not find order");

    // Case when in the order only has one shop
    if (foundOrder.order_products.length === 1) {
      const isValid = shop_id === foundOrder.order_products[0].shop_id;
      if (!isValid) throw new BadRequestError("Invalid shop");

      return await updateStatusOfOrder({ order_id, action });
    } else {
      // Case when order has more than one shop
      foundOrder.order_products.forEach(async (shop, index) => {
        if (shop.shop_id === shop_id) {
          const shop_order_ids = [
            {
              shop_id: shop.shop_id,
              shop_discounts: shop.shop_discounts,
              item_products: shop.item_products,
            },
          ];
          console.log("Shop_order_ids: ", shop_order_ids);
          console.log(
            "Shop_order_ids item_products: ",
            shop_order_ids[0].item_products
          );

          const subOrder = await this.cloneOrder({
            shop_order_ids,
            cart_id: foundOrder.order_cart_id,
            user_id: foundOrder.order_user_id,
            user_address: foundOrder.order_shipping,
            user_payment: foundOrder.order_payment,
          });

          if (!subOrder) {
            throw new BadRequestError("Can not create sub order");
          } else {
            await updateStatusOfOrder({ order_id: subOrder._id, action });
            foundOrder.order_products.splice(index, 1);
            await foundOrder.save();
          }

          return {
            newOrder: foundOrder,
            updatedStatusOrder: subOrder,
          };
        }
      });
    }
  }
}

module.exports = new OrderService();
