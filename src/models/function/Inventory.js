const { BadRequestError } = require("../../core/error-response");
const { convertToObjectIDMongo } = require("../../utils/index");
const { InventoryModel } = require("../Inventory");

const insertInventory = async ({
  product_id,
  shop_id,
  stock,
  location = "unknown",
}) => {
  return await InventoryModel.create({
    inven_product_id: product_id,
    inven_stock: stock,
    inven_location: location,
    inven_shop_id: shop_id,
  });
};

const restoreInventory = async (restore_products) => {
  for (const restoreProduct of restore_products) {
    const { product_id, product_quantity, cart_id } = restoreProduct;
    const query = {
      inven_product_id: convertToObjectIDMongo(product_id),
    };
    const update = {
      $inc: {
        inven_stock: product_quantity,
      },
      $pull: {
        inven_reservation: { cart_id: cart_id.toString() },
      },
    };
    await InventoryModel.updateOne(query, update);
  }
};

const reservationInventory = async ({ product_id, quantity, cart_id }) => {
  const foundInventory = await InventoryModel.findOne({
    inven_stock: { $gte: quantity },
  });
  if (!foundInventory) throw new BadRequestError("Not enough inventory");
  const query = {
      inven_product_id: convertToObjectIDMongo(product_id),
      inven_stock: { $gte: quantity },
    },
    updateSet = {
      $inc: {
        inven_stock: -quantity,
      },
      $push: {
        inven_reservation: {
          quantity,
          cart_id,
          createAt: new Date(),
        },
      },
    },
    options = { upsert: true, new: true };
  return await InventoryModel.updateOne(query, updateSet, options);
};

module.exports = {
  insertInventory,
  restoreInventory,
  reservationInventory,
};
