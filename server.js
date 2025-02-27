const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
const sequelize = require("./util/dbConnection");
const indexRoutes = require("./routes/index");
const swaggerUi = require("swagger-ui-express");
const swaggerDocumentCandidate = require("./util/swagger_2025_01_28_candidate.json");
const swaggerDocumentHr = require("./util/swagger_2025_01_28_hr.json");

const xss = require("xss-clean");
const cors = require("cors");
const errorHandler = require("./util/error_handler");
const Error = require("./util/errors");
const userActivityLogs = require("./util/userActivityLog");

const corsOpts = {
  origin: (origin, callback) => {
    if (!origin || origin.endsWith("pages.dev") || origin.startsWith("http://localhost")) {
      callback(null, true); 
    } else {
      callback(Error.authError("Access denied: The origin of this request is not authorized."));
    }
  },
  methods: [
    "GET",
    "POST",
    "OPTIONS",
    "CONNECT",
    "TRACE",
    "PUT",
    "PATCH",
    "DELETE"
  ],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};


dotenv.config({ path: "./.env" });
app.use(morgan("dev"));
app.use(helmet.hidePoweredBy());
app.use(helmet.xssFilter());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.json());
app.use(cors(corsOpts));
app.use(xss());
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static('resources'));
//including routes
app.use(userActivityLogs.handleAuthAndUserActivity);
indexRoutes(app);

app.use("/candidate-api-docs", swaggerUi.serveFiles(swaggerDocumentCandidate), swaggerUi.setup(swaggerDocumentCandidate));
app.use("/employer-api-docs", swaggerUi.serveFiles(swaggerDocumentHr), swaggerUi.setup(swaggerDocumentHr));

app.use(errorHandler);

app.all('*', (req, res) => {
  res.status(404).json({ message: "Bad request, please check the requested Url" });
});

sequelize
  .sync({ alter: false })
  .then((result) => {
    app.listen(process.env.PORT);
    console.log(`Node Server running on port ${process.env.PORT}`);
  })
  .catch((err) => {
    console.log(err);
    throw new Error('DB Error');
  });