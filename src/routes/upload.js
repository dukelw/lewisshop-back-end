const express = require("express");
const router = express.Router();
const asyncHandler = require("../helpers/async-handler");

const UploadController = require("../controllers/UploadController");
const { uploadDisk, uploadMemory } = require("../configs/multer");

router.post(
  "/thumb-s3",
  uploadMemory.single("file"),
  asyncHandler(UploadController.uploadImageS3)
);

router.post(
  "/thumb",
  uploadDisk.single("file"),
  asyncHandler(UploadController.uploadThumb)
);

module.exports = router;
