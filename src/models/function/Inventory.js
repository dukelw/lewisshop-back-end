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

const reservationInventory = async ({ product_id, quantity, cart_id }) => {
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
  reservationInventory,
};
