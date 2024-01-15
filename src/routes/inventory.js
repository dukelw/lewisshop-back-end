const express = require("express");
const router = express.Router();
const asyncHandler = require("../helpers/async-handler");

const inventoryController = require("../controllers/InventoryController");
const { authentication } = require("../auth/utils");

// Authentication
router.use(authentication);
router.post("", asyncHandler(inventoryController.addStock));

module.exports = router;
