import swaggerUi from "swagger-ui-express";
import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./registry";

export function setupSwagger(app: any) {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  const openApiDoc = generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Auto Generated API",
      description: "This API documentation is auto-generated from Zod schemas.",
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