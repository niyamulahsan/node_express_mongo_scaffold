const path = require("path");
const express = require("express");
const app = express();
const upload = require("express-fileupload");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const serveIndex = require("serve-index");
const swaggerUI = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const morgan = require("morgan");
const connectDB = require("./config/db");

// internal import
const { notFoundHandler, defaultErrorHandler } = require("./middleware/errorhandler");
const routes = require("./routes/index");

// request handler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// database connection with mongoose
app.use(morgan('dev'));
connectDB();

// cors issue setup
app.use(cors({
  credentials: true,
  origin: '*'
}));

// cookie parser
app.use(cookieParser());

// swagger setup must before router setup
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node Express Scaffold",
      version: "1.0.0",
      description: "Scaffold server end",
      contact: {
        email: "niyamulahsan@gmail.com",
      },
    },
    basePath: "/",
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "jwt",
        },
      },
    },
    servers: [{
      url: `http://localhost:${process.env.PORT}`,
    }]
  },
  apis: ["./src/modules/**/*.js"],
};

const openapiSpecification = swaggerJsdoc(options);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(openapiSpecification, {
  swaggerOptions: {
    filter: true,
    docExpression: "list",
  }
}));

// rate limiter for api request
const limiter = rateLimit({
  max: 60,
  windowMs: 60 * 1000,
  message: "Too many request from this IP, please trye again after 1 minute later"
});

// serve index
app.use("/public", express.static(path.join("/public")), serveIndex(path.join(__dirname, "/public"), { icons: true }));

// upload file setup
app.use(upload());

// router setup
app.use("/api", limiter, routes);

// home route
app.use("/", (req, res) => {
  res.send("It's wrok...");
});

// // frontend technology dashboard linkup
// const reactBuild = path.join(__dirname, '../../frontend', 'dist');
// app.use(express.static(reactBuild));
// app.get('*', async (req, res) => {
//   res.sendFile(path.join(reactBuild, 'index.html'));
// });

// error handler
app.use(notFoundHandler);
app.use(defaultErrorHandler);


// run server
app.listen(process.env.PORT, () => {
  console.log(`Server is running with ${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}`);
});