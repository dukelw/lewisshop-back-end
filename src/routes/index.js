const siteRouter = require("./site");
const shopRouter = require("./shop");
const userRouter = require("./user");
const productRouter = require("./product");
const discountRouter = require("./discount");
const cartRouter = require("./cart");
const inventoryRouter = require("./inventory");
const orderRouter = require("./order");
const commentRouter = require("./comment");
const notificationRouter = require("./notification");
const paymentRouter = require("./payment");
const uploadRouter = require("./upload");
const variantRouter = require("./variant");
const { apiKey, permission } = require("../auth/check-auth");
const { pushToLogDiscord } = require("../middlewares/index");

function route(app) {
  // Add log to discord
  app.use(pushToLogDiscord);
  // Check API key
  app.use(apiKey);
  // Check permissions
  app.use(permission("0000"));
  // Use router
  app.use("/api/v1/shop", shopRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/product", productRouter);
  app.use("/api/v1/discount", discountRouter);
  app.use("/api/v1/cart", cartRouter);
  app.use("/api/v1/inventory", inventoryRouter);
  app.use("/api/v1/order", orderRouter);
  app.use("/api/v1/comment", commentRouter);
  app.use("/api/v1/notification", notificationRouter);
  app.use("/api/v1/payment", paymentRouter);
  app.use("/api/v1/variant", variantRouter);
  app.use("/api/v1/upload", uploadRouter);
  app.use("/", siteRouter);
}

module.exports = route;
