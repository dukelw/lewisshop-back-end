const express = require("express");
const router = express.Router();
const asyncHandler = require("../helpers/async-handler");

const UploadController = require("../controllers/UploadController");
const { uploadDisk } = require("../configs/multer");

router.post(
  "/thumb",
  uploadDisk.single("file"),
  asyncHandler(UploadController.uploadThumb)
);

module.exports = router;
