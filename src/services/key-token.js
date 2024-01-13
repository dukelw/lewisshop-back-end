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
          publicKey: public_key,
          privateKey: private_key,
          refreshTokenUsed: [],
          refreshToken: refresh_token,
        },
        options = { upsert: true, new: true };

      const tokens = await KeyTokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      console.error(error);
    }
  };

  findByUserID = async (user_id) => {
    return await KeyTokenModel.findOne({ user: new Types.ObjectId(user_id) });
  };
}

module.exports = new KeyTokenService();
