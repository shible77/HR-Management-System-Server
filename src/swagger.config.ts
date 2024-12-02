import { OpenAPIV3 } from 'openapi-types';

const swaggerDefinition: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'HRMS API documentation',
    version: '1.0.0',
    description: 'Here, you can find all the APIs of our HRMS which includes API request types, request bodies, response types, response bodies.',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
      },
    },
  },
  security: [{ BearerAuth: [] }],
  paths: {},
};

export default swaggerDefinition;
