const express = require("express");
const router = express.Router();
const asyncHandler = require("../helpers/async-handler");

const orderController = require("../controllers/OrderController");
const { authentication } = require("../auth/utils");

// Authentication
router.use(authentication);
router.post("/review", asyncHandler(orderController.review));
router.post("", asyncHandler(orderController.order));
router.post("/all", asyncHandler(orderController.findOrderOfUser));
router.post(
  "/find-status",
  asyncHandler(orderController.findOrderOfUserByStatus)
);
router.post("/find", asyncHandler(orderController.findOrderOfUserByID));
router.post("/cancel", asyncHandler(orderController.cancel));
router.post("/deleted", asyncHandler(orderController.findDeleted));
router.post("/restore", asyncHandler(orderController.restore));

module.exports = router;
