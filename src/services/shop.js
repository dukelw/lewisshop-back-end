const { BadRequestError, AuthFailureError } = require("../core/error-response");
const ShopModel = require("../models/Shop");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const keyTokenService = require("../services/key-token");
const { generatePairOfToken } = require("../auth/utils");
const { getInfoData } = require("../utils/index");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class ShopService {
  signUp = async ({ name, email, password }) => {
    // Step 1: Check the existence of email
    const foundShop = await ShopModel.findOne({ email }).lean();
    if (foundShop) throw new BadRequestError("Shop is already registered");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newShop = await ShopModel.create({
      name,
      email,
      password: hashedPassword,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      // Create privateKey, publicKey
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      const keyStore = await keyTokenService.createKeyToken({
        user_id: newShop._id,
        public_key: publicKey,
        private_key: privateKey,
      });

      if (!keyStore) {
        return {
          code: "400",
          message: "keyStore error",
        };
      }

      // Create pair of token
      const tokens = await generatePairOfToken(
        { user_id: newShop._id, email },
        publicKey,
        privateKey
      );

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
    }
    return {
      code: 200,
      metadata: null,
    };
  };
}

module.exports = new ShopService();
