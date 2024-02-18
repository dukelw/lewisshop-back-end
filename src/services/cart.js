const { NotFoundError, BadRequestError } = require("../core/error-response");
const { CartModel } = require("../models/Cart");
const { ProductModel } = require("../models/Product");
const ShopModel = require("../models/Shop");
const {
  createUserCart,
  checkProductInCart,
  updateUserCartQuantity,
} = require("../models/function/Cart");
const { getProductByID } = require("../models/function/Product");
const { convertToObjectIDMongo } = require("../utils");

class CartService {
  async addToCart({ user_id, product = {} }) {
    // Check cart's existence
    const foundCart = await CartModel.findOne({
      cart_user_id: user_id,
    });

    // Add product name and price to cart too
    const foundProduct = await ProductModel.findById(product.product_id).lean();
    if (!foundProduct) throw new NotFoundError("Product does not exist");
    const product_name = foundProduct.product_name;
    const product_price = foundProduct.product_price;
    const product_thumb = foundProduct.product_thumb;
    const product_description = foundProduct.product_description;
    const shop = await ShopModel.findById(foundProduct.product_shop.toString());
    console.log(`Shop::::${shop}`);
    product = {
      ...product,
      product_name,
      product_price,
      shop_id: foundProduct.product_shop.toString(),
      shop_name: shop.name,
      product_thumb,
      product_description,
    };

    if (!foundCart) {
      // Create a new cart for the user
      return await createUserCart({ user_id, product });
    }

    // If having cart but no product in it
    if (!foundCart.cart_products.length) {
      foundCart.cart_products = [product];
      foundCart.cart_count_products = product.quantity; // old: 1
      return await foundCart.save();
    } else if (
      // If having cart but does not have this product in it
      foundCart.cart_products.length &&
      !checkProductInCart({
        cart_products: foundCart.cart_products,
        product_id: product.product_id,
      })
    ) {
      foundCart.cart_products = [...foundCart.cart_products, product];
      const quantities = foundCart.cart_products.reduce((acc, curr) => {
        return (acc += curr.quantity);
      }, 0);
      foundCart.cart_count_products = quantities;
      return await foundCart.save();
    }

    // If having cart and this product is in it, increase it by 1
    return await updateUserCartQuantity({ user_id, product });
  }

  // updateCart
  /*
    shop_order_ids: [
      {
        shop_id,
        item_products: [
          {
            quantity,
            price,
            shop_id,
            old_quantity,
            product_id
          }
        ],
        version
      }
    ]
  */

  async updateCart({ user_id, shop_order_ids = {} }) {
    const { product_id, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];

    // Check product
    const foundProduct = await getProductByID(product_id);
    if (!foundProduct) throw new NotFoundError("Product does not exist");
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shop_id)
      throw new BadRequestError("Product does not belong to this shop");
    if (quantity === 0) {
      // Have not already thought about this situation
    }
    return await updateUserCartQuantity({
      user_id,
      product: {
        product_id,
        quantity: quantity - old_quantity,
      },
    });
  }

  async deleteUserCartItem({ user_id, product_id }) {
    const foundCart = await CartModel.findOne({ cart_user_id: user_id });
    const oldQuantities = foundCart.cart_products.reduce((acc, curr) => {
      return (acc += curr.quantity);
    }, 0);
    const deleteQuantities = foundCart.cart_products.find((product) => {
      return product.product_id === product_id;
    }).quantity;
    const query = {
        cart_user_id: user_id,
        cart_state: "active",
      },
      updateSet = {
        $pull: {
          cart_products: {
            product_id,
          },
        },
        $set: {
          cart_count_products: oldQuantities - deleteQuantities,
        },
      };
    const deletedCart = await CartModel.updateOne(query, updateSet);
    return deletedCart;
  }

  async getCartOfUser({ user_id }) {
    return await CartModel.findOne({
      cart_user_id: convertToObjectIDMongo(user_id),
    }).lean();
  }

  async deleteCart({ cart_id }) {
    const foundCart = await CartModel.findById(cart_id);
    if (!foundCart) throw new NotFoundError("Cart not found");
    await CartModel.delete({ _id: convertToObjectIDMongo(cart_id) });
  }
}

module.exports = new CartService();
