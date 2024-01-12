const siteRouter = require("./site");
const { pushToLogDiscord } = require("../middlewares/index");

function route(app) {
  // Add log to discord
  app.use(pushToLogDiscord);

  // Use router
  app.use("/", siteRouter);
}

module.exports = route;
