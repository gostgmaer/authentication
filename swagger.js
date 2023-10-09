// swagger.js
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerAutogen = require("swagger-autogen")();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node Swagger API",
      version: "1.0.0",
      description: "A sample Node.js API with Swagger documentation",
    },
    host: "authentication-beta.vercel.app", // by default: 'localhost:3000'
    basePath: "/api", // by default: '/'
    schemes: ["https","http"], // by default: ['http']
    consumes: [], // by default: ['application/json']
    produces: [], // by default: ['application/json']
    tags: [
      // by default: empty Array
      {
        name: "", // Tag name
        description: "", // Tag description
      },
  
    ],
    securityDefinitions: {}, // by default: empty object
    definitions: {}, // by default: empty object (Swagger 2.0)
    components: {},
  },
  apis: ["./routes/*.js"], // Specify the path to your Express app file
};

const outputFile = "./doc/swagger.json";
const endpointsFiles = ["./routes/*.js"];

/* NOTE: if you use the express Router, you must pass in the 
   'endpointsFiles' only the root file where the route starts,
   such as index.js, app.js, routes.js, ... */

// swaggerAutogen(outputFile, endpointsFiles, options);

swaggerAutogen(outputFile, endpointsFiles, options).then(() => {
  require("./index.js"); // Your project's root file
});

// const swaggerSpec = swaggerJsdoc(options);

// module.exports = swaggerSpec;
