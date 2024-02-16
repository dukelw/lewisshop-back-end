const app = require("./src/app");
const cron = require("node-cron");
const { checkAndUpdateDiscountStatus } = require("./src/services/discount");
const PORT = process.env.PORT || 3008;

// Set cron job to run at 00:00
cron.schedule(
  "0 0 * * *",
  async () => {
    console.log("Running cron job to update discount status...");
    await checkAndUpdateDiscountStatus();
  },
  {
    timezone: "Asia/Ho_Chi_Minh", // Time zone of cron job is (Asia/Ho_Chi_Minh)
  }
);

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
  server.close(() => console.log("Exit server express"));
});
