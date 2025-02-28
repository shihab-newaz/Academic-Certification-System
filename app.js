//la-bc-certificate-api/app.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import logger from './logger.js';
import adminRoutes from './routes/adminRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Add this before your routes in app.js
app.use((req, res, next) => {
  logger.info('Incoming request', {
      method: req.method,
      path: req.path,

  });
  next();
});

app.use('/admin', adminRoutes);
app.use('/certificate', certificateRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Certificate API Documentation",
  customfavIcon: "/assets/favicon.ico",
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestDuration: true,
  },
}));
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});