const { BadRequestError } = require("../core/error-response");
const { InventoryModel } = require("../models/Inventory");
const { getProductByID } = require("../models/function/Product");

class InventoryService {
  async addStockToInventory({
    stock,
    product_id,
    shop_id,
    location = "An Giang",
  }) {
    const product = await getProductByID(product_id);
    if (!product) throw new BadRequestError("The product does not exist");

    const query = {
        inven_shop_id: shop_id,
        inven_product_id: product_id,
      },
      updateSet = {
        $inc: {
          inven_stock: stock,
        },
        $set: {
          inven_location: location,
        },
      },
      options = { upsert: true, new: true };

    return await InventoryModel.findOneAndUpdate(query, updateSet, options);
  }
}

module.exports = new InventoryService();
