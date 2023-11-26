// swagger.js
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node Swagger API",
      version: "1.0.0",
      description: "A sample Node.js API with Swagger documentation",
    },
  },
  apis: ["./routes/*.js", "./doc/swaggerSpec/*.js"], // Specify the path to your Express app file
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
