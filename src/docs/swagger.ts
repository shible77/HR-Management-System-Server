import swaggerUi from "swagger-ui-express";
import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./registry";

export function setupSwagger(app: any) {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  const openApiDoc = generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "HR Management System API",
      description: "API documentation for the HR Management System. This documentation provides details about the available endpoints, request/response formats, and authentication methods. Use this documentation to understand how to interact with the API and integrate it into your applications. For any questions or issues, feel free to reach us through the following email: shible0805@gmail.com",
      version: "1.0.0",
    },
    servers: [{ url: "http://localhost:5000" }],
  });

  openApiDoc.components = {
    ...openApiDoc.components,
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  };

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDoc));
}