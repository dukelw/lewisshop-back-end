const ApiKeyModel = require("../models/ApiKey");
const crypto = require("crypto");

const findById = async (key) => {
  // const newKey = await ApiKeyModel.create({
  //   key: crypto.randomBytes(64).toString("hex"),
  //   permissions: ["0000"],
  // });
  // console.log(newKey);
  
  const foundKey = await ApiKeyModel.findOne({ key, status: true }).lean();
  return foundKey;
};

module.exports = { findById };
