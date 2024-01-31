const express = require("express");
const router = express.Router();
const { authentication } = require("../auth/utils");
const asyncHandler = require("../helpers/async-handler");
const userController = require("../controllers/UserController");

router.post("/signin", asyncHandler(userController.signin));
router.post("/signup", asyncHandler(userController.signup));

router.use(authentication);
router.post("/logout", asyncHandler(userController.logout));
router.post("/refresh-token", asyncHandler(userController.refreshToken));

module.exports = router;
