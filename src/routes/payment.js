const express = require("express");
const router = express.Router();
const asyncHandler = require("../helpers/async-handler");

const paymentController = require("../controllers/PaymentController");
const { authentication } = require("../auth/utils");

router.post("/momo", asyncHandler(paymentController.payWithMomo));

// Authentication
router.use(authentication);

module.exports = router;
