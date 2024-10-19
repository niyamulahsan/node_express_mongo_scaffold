const swaggerUI = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node Express MongoDB with Mongoose ODM Scaffold",
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

module.exports = {
  swaggerServe: swaggerUI.serve,
  swaggerSetup: swaggerUI.setup(openapiSpecification, {
    swaggerOptions: {
      filter: true,
      docExpression: "list",
    },
  }),
};