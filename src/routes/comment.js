const express = require("express");
const router = express.Router();
const asyncHandler = require("../helpers/async-handler");

const commentController = require("../controllers/CommentController");
const { authentication } = require("../auth/utils");

// Authentication
router.get("/product", asyncHandler(commentController.getCommentOfProduct));
router.use(authentication);
router.post("", asyncHandler(commentController.create));
router.get("", asyncHandler(commentController.getCommentByParentID));
router.delete("", asyncHandler(commentController.delete));

module.exports = router;
