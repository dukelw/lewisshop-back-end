const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error-response");
const ShopModel = require("../models/Shop");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const keyTokenService = require("../services/key-token");
const { generatePairOfToken } = require("../auth/utils");
const { getInfoData } = require("../utils/index");
const { findByEmail } = require("../helpers/function/shop");

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
      console.log("Created Token Success::", tokens);

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

  signIn = async ({ email, password, refresh_token = null }) => {
    // 1. Check email
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop has not registered");

    // 2. Match password
    const isMatch = await bcrypt.compare(password, foundShop.password);
    if (!isMatch) throw new AuthFailureError("Authentication failed");

    // 3. Create privateKey, publicKey
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    // 4. Generate token
    const { _id: userID } = foundShop;
    const tokens = await generatePairOfToken(
      { user_id: userID, email },
      publicKey,
      privateKey
    );

    await keyTokenService.createKeyToken({
      user_id: userID,
      public_key: publicKey,
      private_key: privateKey,
      refresh_token: tokens.refreshToken,
    });

    // 5. Get data
    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  logOut = async (keyStore) => {
    const deletedKey = await keyTokenService.removeKeyByID(keyStore._id);
    console.log(`Deleted key:::${deletedKey}`);
    return deletedKey;
  };

  refreshToken = async ({ refreshToken, user, keyStore }) => {
    const { user_id, email } = user;
    console.log(`User ID: ${user_id} email: ${email}`);
    if (keyStore.refreshTokenUsed.includes(refreshToken)) {
      // Delete all tokens in keyStore
      await keyTokenService.deleteKeyByUserID(user_id);
      throw new ForbiddenError(`Something went wrong, please re-login`);
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError("Shop has not been registered");
    }

    // Check userID
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError("Shop has not been registered");

    // Create new token
    const tokens = await generatePairOfToken(
      { user_id, email },
      keyStore.publicKey,
      keyStore.privateKey
    );

    // Update token
    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokenUsed: refreshToken,
      },
    });

    return {
      user,
      tokens,
    };
  };
}

module.exports = new ShopService();
