require("dotenv").config();
const compression = require("compression");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const express = require("express");
const cors = require("cors");
const route = require("./routes");
const { API_KEY } = require("./private/api-key");
const app = express();
// const cookieParser = require("cookie-parser");
const corsOptions = {
  origin: "http://localhost:1610",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
  credentials: true, // enable set cookie
};

app.use(cors(corsOptions));
// app.use(cookieParser());

app.use((req, res, next) => {
  if (req.headers.origin && req.headers.origin === "http://localhost:1610") {
    req.headers["x-api-key"] = API_KEY;
  }
  next();
});

const { v4: uuid } = require("uuid");
const logsWriter = require("./helpers/logs-writer");

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
  logsWriter(`UID: ${uuid()} ${req.url} -- ${req.method} -- ${error.message}`);
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "Internal server error",
  });
});

module.exports = app;
