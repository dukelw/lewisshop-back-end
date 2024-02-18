const https = require("https");
const crypto = require("crypto");
const uuid = require("uuid");

class PaymentService {
  momoPay({ amount }) {
    return new Promise((resolve, reject) => {
      const endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
      const partnerCode = "MOMO";
      const accessKey = "F8BBA842ECF85";
      const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
      const orderInfo = "pay with MoMo";
      const redirectUrl =
        "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b";
      const ipnUrl =
        "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b";
      const orderId = uuid.v4();
      const requestId = uuid.v4();
      const requestType = "captureWallet";
      const extraData = ""; // Pass empty value or Encode base64 JsonString

      const rawSignature =
        "accessKey=" +
        accessKey +
        "&amount=" +
        amount +
        "&extraData=" +
        extraData +
        "&ipnUrl=" +
        ipnUrl +
        "&orderId=" +
        orderId +
        "&orderInfo=" +
        orderInfo +
        "&partnerCode=" +
        partnerCode +
        "&redirectUrl=" +
        redirectUrl +
        "&requestId=" +
        requestId +
        "&requestType=" +
        requestType;

      const signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");

      const jsonRequestToMomo = {
        partnerCode,
        partnerName: "Test",
        storeId: "MomoTestStore",
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        lang: "vi",
        extraData,
        requestType,
        signature,
      };

      const requestOptions = {
        hostname: "test-payment.momo.vn",
        port: 443,
        path: "/v2/gateway/api/create",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const req = https.request(requestOptions, (res) => {
        let responseData = "";

        res.on("data", (data) => {
          responseData += data;
        });

        res.on("end", () => {
          try {
            const responseJson = JSON.parse(responseData);
            resolve(responseJson);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on("error", (e) => {
        reject(e);
      });

      req.write(JSON.stringify(jsonRequestToMomo));
      req.end();
    });
  }
}

module.exports = new PaymentService();
