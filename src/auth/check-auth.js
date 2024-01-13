const { findById } = require("../services/api-key");
const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
};

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key)
      return res.status(403).json({
        message: "Forbidden error",
      });

    // Check apiKey
    const foundKey = await findById(key);
    if (!foundKey)
      return res.status(403).json({
        message: "Forbidden error",
      });

    req.foundApiKey = foundKey;
    return next();
  } catch (error) {
    console.error(error);
  }
};

const permission = (permission) => {
  return (req, res, next) => {
    if (!req.foundApiKey.permissions) {
      return res.status(403).json({
        message: "Permission denied",
      });
    }

    console.log("Permissions::", req.foundApiKey.permissions);
    const validPermission = req.foundApiKey.permissions.includes(permission);
    if (!validPermission) {
      return res.status(403).json({
        message: "Permission denied",
      });
    }

    return next();
  };
};

module.exports = {
  apiKey,
  permission,
};
