const UploadService = require("../services/upload");
const { SuccessResponse } = require("../core/success-response");
const { BadRequestError } = require("../core/error-response");

class UploadController {
  async upload(req, res, next) {
    new SuccessResponse({
      message: "Upload image success",
      metadata: await UploadService.uploadImageFromUrl(),
    }).send(res);
  }

  async uploadThumb(req, res, next) {
    const {
      file,
      body: { folderName },
    } = req;
    console.log(file, folderName);
    if (!file) throw new BadRequestError("File missing");
    new SuccessResponse({
      message: "Upload thumbnail image success",
      metadata: await UploadService.uploadImageFromLocal({
        path: file.path,
        folderName: folderName,
        name: file.filename,
      }),
    }).send(res);
  }
}

module.exports = new UploadController();
