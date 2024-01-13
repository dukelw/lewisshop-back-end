const siteRouter = require("./site");
const shopRouter = require("./shop");
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
  app.use("/", siteRouter);
  app.use("/api/v1/shop", shopRouter);
}

module.exports = route;
