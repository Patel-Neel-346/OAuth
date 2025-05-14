import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { ConfigENV } from "./index.js";

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Authentication API",
      version: "1.0.0",
      description: "API documentation for authentication with OAuth",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
      servers: [
        {
          url: `http://localhost:${ConfigENV.PORT}`,
          description: "Development server",
        },
      ],
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          required: ["name", "email"],
          properties: {
            _id: {
              type: "string",
              description: "The auto-generated id of the user",
            },
            name: {
              type: "string",
              description: "The name of the user",
            },
            email: {
              type: "string",
              description: "The email of the user",
            },
            googleId: {
              type: "string",
              description: "Google ID for OAuth users",
            },
            facebookId: {
              type: "string",
              description: "Facebook ID for OAuth users",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "The date the user was created",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            password: {
              type: "string",
              format: "password",
              description: "User password",
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: {
              type: "string",
              description: "User full name",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            password: {
              type: "string",
              format: "password",
              description: "User password",
            },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            statusCode: {
              type: "integer",
              description: "HTTP status code",
            },
            data: {
              type: "object",
              description: "Response data",
            },
            message: {
              type: "string",
              description: "Response message",
            },
            success: {
              type: "boolean",
              description: "Success status",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/controller/*.js", "./src/models/*.js"], // Path to the API docs
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsDoc(swaggerOptions);

// Function to setup our swagger
const swaggerDocs = (app) => {
  // Route for swagger docs
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log(
    `Swagger docs available at: http://localhost:${ConfigENV.PORT}/api-docs`
  );
};

export default swaggerDocs;
