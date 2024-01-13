const fs = require("fs").promises;
const path = require("path");
const { format } = require("date-fns");

const file = path.join(__dirname, "../logs", "logs.log");

const logsWriter = async (msg) => {
  const logContent = `${format(
    new Date(),
    "dd-MMMM-yyy\tHH:mm:ss"
  )} ----- ${msg}\n`;
  try {
    fs.appendFile(file, logContent);
  } catch (error) {
    console.error(error);
  }
};

module.exports = logsWriter;
