const JWT = require("jsonwebtoken");
const { AuthFailureError, NotFoundError } = require("../core/error-response");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESHTOKEN: "x-rtoken-id",
};

const generatePairOfToken = async (payload, publicKey, privateKey) => {
  try {
    console.log(`Public key: ${publicKey} private key: ${privateKey}`);
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "1 days",
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "365 days",
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

const authentication = async (req, res, next) => {
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
  if (!userID) throw new AuthFailureError("Invalid user ID");

  // 2. Get access token
  // const keyStore = awai
};

module.exports = {
  generatePairOfToken,
  authentication,
};
