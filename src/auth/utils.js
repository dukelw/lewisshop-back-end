const JWT = require("jsonwebtoken");
const { AuthFailureError } = require("../core/error-response");
const { findByUserID } = require("../services/key-token");
const asyncHandler = require("../helpers/async-handler");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "user",
  AUTHORIZATION: "authorization",
  REFRESHTOKEN: "token",
};

const generatePairOfToken = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "1d",
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "365d",
    });

    JWT.verify(accessToken, publicKey, (error, success) => {
      if (error) {
        console.error(`Error occurs when verify token:`, error);
      } else {
        console.log(`Successfully verified token:`, success);
      }
    });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error(error);
  }
};

const authentication = asyncHandler(async (req, res, next) => {
  /*
    1. Check userID missing
    2. Get access token
    3. Verify token
    4. Check user in database
    5. Check keyStore with userID
    6. Return next
  */

  // 1. Check userID missing
  const userID = req.headers[HEADER.CLIENT_ID];
  console.log(`UserID`, userID);
  console.log(`AccessToken`, req.headers[HEADER.AUTHORIZATION]);
  if (!userID) throw new AuthFailureError("Invalid user ID");

  // 2. Get access token
  const keyStore = await findByUserID(userID);
  if (!keyStore) throw new AuthFailureError("Not found keyStore");

  // 3. Verify token
  console.log("RF::::", req.headers[HEADER.REFRESHTOKEN]);
  if (req.headers[HEADER.REFRESHTOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESHTOKEN];
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);

      if (userID !== decodeUser.user_id)
        throw new AuthFailureError("Invalid userID");
      req.keyStore = keyStore;
      req.user = decodeUser;
      req.refreshToken = refreshToken;
      console.log(`req.user`, JSON.stringify(req.user));
      return next();
    } catch (error) {
      console.error(error);
    }
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid request");

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userID !== decodeUser.user_id)
      throw new AuthFailureError("Invalid userID");
    req.keyStore = keyStore;
    req.user = decodeUser;
    return next();
  } catch (error) {
    throw error;
  }
});

module.exports = {
  generatePairOfToken,
  authentication,
};
