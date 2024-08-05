const {
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError,
} = require("../core/error-response");
const ShopModel = require("../models/Shop");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const keyTokenService = require("../services/key-token");
const { generatePairOfToken } = require("../auth/utils");
const {
  getInfoData,
  convertToObjectIDMongo,
  getSelectData,
} = require("../utils/index");
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

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email", "thumb", "description"],
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

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email", "thumb", "description"],
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

  getShopByID = async (shop_id) => {
    return await ShopModel.findOne({
      _id: convertToObjectIDMongo(shop_id),
    })
      .select(
        getSelectData([
          "_id",
          "name",
          "thumb",
          "email",
          "description",
          "status",
          "birthday",
          "phone_number",
        ])
      )
      .lean();
  };

  getAllShop = async () => {
    return await ShopModel.find()
      .select(
        getSelectData([
          "_id",
          "name",
          "thumb",
          "email",
          "description",
          "status",
          "birthday",
          "phone_number",
        ])
      )
      .lean();
  };

  getShopByName = async (keyword) => {
    if (!keyword) throw new BadRequestError("Keyword is required");

    // Tách từ khóa thành mảng các từ
    const keywords = keyword.split(" ").map((word) => new RegExp(word, "i"));

    const shops = await ShopModel.find({
      $or: keywords.map((word) => ({ name: { $regex: word } })),
    })
      .select(
        getSelectData([
          "_id",
          "name",
          "thumb",
          "email",
          "description",
          "status",
          "birthday",
          "phone_number",
        ])
      )
      .lean();

    if (!shops || shops.length === 0) throw new NotFoundError("No shops found");

    return shops;
  };

  updateInformation = async ({
    shop_id,
    name,
    email,
    phone_number,
    gender,
    birthday,
    address,
    bank_account_number,
    thumb,
  }) => {
    const foundShop = await ShopModel.findById(shop_id);
    if (!foundShop) throw new NotFoundError("Shop not found");
    const filter = {
      _id: shop_id,
    };

    const bodyUpdate = {
      name,
      email,
      phone_number,
      gender,
      birthday: new Date(birthday),
      address,
      bank_account_number,
      thumb,
    };

    const updatedShop = await ShopModel.findOneAndUpdate(filter, bodyUpdate, {
      new: true,
    });

    return updatedShop;
  };

  addAddress = async ({ shop_id, address }) => {
    const foundShop = await ShopModel.findById(shop_id);
    if (!foundShop) throw new NotFoundError("User not found");
    foundShop.all_addresses.push(address);
    await foundShop.save();

    if (address.default) {
      const index = foundShop.all_addresses.indexOf(address);
      await this.setDefaultAddress({ shop_id, index });
    }

    return { shop: foundShop };
  };

  updateAddresses = async ({ shop_id, index, new_address = {} }) => {
    const foundShop = await ShopModel.findById(shop_id);
    if (!foundShop) throw new NotFoundError("User not found");
    foundShop.all_addresses[index] = new_address;
    await foundShop.save();

    if (new_address.default) {
      await this.setDefaultAddress({ shop_id, index });
    }

    return { shop: foundShop };
  };

  setDefaultAddress = async ({ shop_id, index }) => {
    const foundShop = await ShopModel.findById(shop_id);
    if (!foundShop) throw new NotFoundError("User not found");
    const newAddresses = [];
    for (let i = 0; i < foundShop.all_addresses.length; i++) {
      if (i !== index) {
        foundShop.all_addresses[i].default = false;
      } else {
        foundShop.all_addresses[i].default = true;
      }
      newAddresses.push(foundShop.all_addresses[i]);
    }

    const filter = {
        _id: convertToObjectIDMongo(shop_id),
      },
      bodyUpdate = {
        all_addresses: newAddresses,
      };

    return await ShopModel.findOneAndUpdate(filter, bodyUpdate);
  };

  changePassword = async ({ email, password, new_password }) => {
    // 1. Check email
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError("User has not registered");

    // 2. Match password
    const isMatch = await bcrypt.compare(password, foundShop.password);
    if (!isMatch) throw new AuthFailureError("Authentication failed");

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // 4. Change password
    const updatedShop = await ShopModel.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    );

    return updatedShop.modifiedCount;
  };
}

module.exports = new ShopService();
