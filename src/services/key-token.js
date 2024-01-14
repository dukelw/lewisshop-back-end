const KeyTokenModel = require("../models/KeyToken");
const { Types } = require("mongoose");

class KeyTokenService {
  createKeyToken = async ({
    user_id,
    public_key,
    private_key,
    refresh_token,
  }) => {
    try {
      const filter = { user: user_id },
        update = {
          privateKey: private_key,
          publicKey: public_key,
          refreshTokenUsed: [],
          refreshToken: refresh_token,
        },
        options = { upsert: true, new: true };

      const tokens = await KeyTokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );

      console.log(`Public key created: ${tokens.publicKey}`);
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      console.error(error);
    }
  };

  findByUserID = async (user_id) => {
    return await KeyTokenModel.findOne({ user: new Types.ObjectId(user_id) });
  };

  removeKeyByID = async (id) => {
    return await KeyTokenModel.deleteOne({ _id: new Types.ObjectId(id) });
  };
}

module.exports = new KeyTokenService();
