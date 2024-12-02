import swaggerJSDoc from 'swagger-jsdoc';
import swaggerDefinition from './swagger.config';

const options: swaggerJSDoc.Options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/**/*.ts'], // Path to your route files
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
