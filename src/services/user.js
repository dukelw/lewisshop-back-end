const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
  NotFoundError,
} = require("../core/error-response");
const UserModel = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const keyTokenService = require("./key-token");
const { generatePairOfToken } = require("../auth/utils");
const { getInfoData, convertToObjectIDMongo } = require("../utils/index");
const { findByEmail } = require("../helpers/function/user");

class UserService {
  signUp = async ({ name, email, password, isAdmin }) => {
    // Step 1: Check the existence of email
    const foundUser = await UserModel.findOne({ email }).lean();
    if (foundUser) throw new BadRequestError("User is already registered");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      isAdmin,
    });

    if (newUser) {
      // Create privateKey, publicKey
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      const keyStore = await keyTokenService.createKeyToken({
        user_id: newUser._id,
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
        { user_id: newUser._id, email },
        publicKey,
        privateKey
      );

      return {
        code: 201,
        metadata: {
          user: getInfoData({
            fields: [
              "_id",
              "name",
              "email",
              "thumb",
              "bank_account_number",
              "address",
              "phone_number",
              "gender",
              "isAdmin",
              "birthday",
              "all_addresses",
            ],
            object: newUser,
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
    const foundUser = await findByEmail({ email });
    if (!foundUser) throw new BadRequestError("User has not registered");

    // 2. Match password
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) throw new AuthFailureError("Authentication failed");

    // 3. Create privateKey, publicKey
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    // 4. Generate token
    const { _id: userID } = foundUser;
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
      user: getInfoData({
        fields: [
          "_id",
          "name",
          "email",
          "thumb",
          "bank_account_number",
          "address",
          "phone_number",
          "gender",
          "isAdmin",
          "birthday",
          "all_addresses",
        ],
        object: foundUser,
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
      throw new AuthFailureError("User has not been registered");
    }

    // Check userID
    const foundUser = await findByEmail({ email });
    if (!foundUser) throw new AuthFailureError("User has not been registered");

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

  find = async ({ user_id }) => {
    const foundUser = await UserModel.findById(user_id);
    if (!foundUser) throw new NotFoundError("Can find user");

    const user = {
      _id: foundUser._id,
      name: foundUser.name,
      phone_number: foundUser.phone_number,
      email: foundUser.email,
      thumb: foundUser.thumb,
      bank_account_number: foundUser.bank_account_number,
      birthday: foundUser.birthday,
      gender: foundUser.gender,
      address: foundUser.address,
      phone_number: foundUser.phone_number,
      all_addresses: foundUser.all_addresses,
    };
    return {
      user,
    };
  };

  updateInformation = async ({
    user_id,
    name,
    email,
    phone_number,
    gender,
    birthday,
    address,
    bank_account_number,
    thumb,
  }) => {
    const foundUser = await UserModel.findById(user_id);
    if (!foundUser) throw new NotFoundError("User not found");
    const filter = {
      _id: user_id,
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

    const updatedUser = await UserModel.findOneAndUpdate(filter, bodyUpdate, {
      new: true,
    });

    return updatedUser;
  };

  addAddress = async ({ user_id, address }) => {
    const foundUser = await UserModel.findById(user_id);
    if (!foundUser) throw new NotFoundError("User not found");
    foundUser.all_addresses.push(address);
    await foundUser.save();

    if (address.default) {
      const index = foundUser.all_addresses.indexOf(address);
      await this.setDefaultAddress({ user_id, index });
    }

    return { user: foundUser };
  };

  updateAddresses = async ({ user_id, index, new_address = {} }) => {
    const foundUser = await UserModel.findById(user_id);
    if (!foundUser) throw new NotFoundError("User not found");
    foundUser.all_addresses[index] = new_address;
    await foundUser.save();

    if (new_address.default) {
      await this.setDefaultAddress({ user_id, index });
    }

    return { user: foundUser };
  };

  setDefaultAddress = async ({ user_id, index }) => {
    const foundUser = await UserModel.findById(user_id);
    if (!foundUser) throw new NotFoundError("User not found");
    const newAddresses = [];
    for (let i = 0; i < foundUser.all_addresses.length; i++) {
      if (i !== index) {
        foundUser.all_addresses[i].default = false;
      } else {
        foundUser.all_addresses[i].default = true;
      }
      newAddresses.push(foundUser.all_addresses[i]);
    }

    const filter = {
        _id: convertToObjectIDMongo(user_id),
      },
      bodyUpdate = {
        all_addresses: newAddresses,
      };

    return await UserModel.findOneAndUpdate(filter, bodyUpdate);
  };

  changePassword = async ({ email, password, new_password }) => {
    // 1. Check email
    const foundUser = await findByEmail({ email });
    if (!foundUser) throw new BadRequestError("User has not registered");

    // 2. Match password
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) throw new AuthFailureError("Authentication failed");

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // 4. Change password
    const updatedUser = await UserModel.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    );

    console.log("Updated user: " + updatedUser, updatedUser.modifiedCount);
    return updatedUser.modifiedCount;
  };
}

module.exports = new UserService();
