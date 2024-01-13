const express = require("express");
const router = express.Router();
const shopController = require("../controllers/ShopController");

router.post("/create", shopController.signup);

module.exports = router;
