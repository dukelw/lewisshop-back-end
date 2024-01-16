const express = require("express");
const router = express.Router();
const asyncHandler = require("../helpers/async-handler");

const notificationController = require("../controllers/NotificationController");
const { authentication } = require("../auth/utils");

// Authentication (Signined)
router.use(authentication);
router.get("", asyncHandler(notificationController.getNotificationOfUser));

module.exports = router;
