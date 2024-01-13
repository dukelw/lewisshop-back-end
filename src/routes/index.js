const siteRouter = require("./site");
const shopRouter = require("./shop");
const { pushToLogDiscord } = require("../middlewares/index");

function route(app) {
  // Add log to discord
  app.use(pushToLogDiscord);

  // Use router
  app.use("/", siteRouter);
  app.use("/api/v1/shop", shopRouter);
}

module.exports = route;
