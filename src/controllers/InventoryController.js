const inventoryService = require("../services/inventory");
const { SuccessResponse } = require("../core/success-response");
class InventoryController {
  async addStock(req, res, next) {
    new SuccessResponse({
      message: "Add stock successfully",
      metadata: await inventoryService.addStockToInventory({
        ...req.body,
      }),
    }).send(res);
  }
}

module.exports = new InventoryController();
