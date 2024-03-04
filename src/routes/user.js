const express = require("express");
const router = express.Router();
const { authentication } = require("../auth/utils");
const asyncHandler = require("../helpers/async-handler");
const userController = require("../controllers/UserController");

router.post("/signin", asyncHandler(userController.signin));
router.post("/signup", asyncHandler(userController.signup));

router.use(authentication);
router.post("/logout", asyncHandler(userController.logout));
router.post("/find", asyncHandler(userController.find));
router.post(
  "/update-address-default",
  asyncHandler(userController.updateAddressDefault)
);
router.post("/update-address", asyncHandler(userController.updateAddress));
router.post("/add-address", asyncHandler(userController.addAddress));
router.post("/update", asyncHandler(userController.updateInformation));
router.post("/refresh-token", asyncHandler(userController.refreshToken));

module.exports = router;
