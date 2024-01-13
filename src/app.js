require("dotenv").config();
const compression = require("compression");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const express = require("express");
const route = require("./routes");
const app = express();

// Init middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Init db
require("./databases/connect-mongodb");

// Use routes
route(app);

// Handling errors
app.use((req, res, next) => {
  res.status(404);
  res.json({
    status: 404,
    message: "Not found your URL request",
  });
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "Internal server error",
  });
});

module.exports = app;
