// config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blockchain Certificate API',
      version: '1.0.0',
      description: 'API for managing educational certificates on the blockchain',
      contact: {
        name: 'API Support',
        email: 'support@yourdomain.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
      {
        url: 'https://api.yourdomain.com',
        description: 'Production server',
      },
    ],
    components: {
      schemas: {
        Certificate: {
          type: 'object',
          properties: {
            studentName: {
              type: 'string',
              description: 'Name of the student',
              example: 'John Doe',
            },
            courseName: {
              type: 'string',
              description: 'Name of the course',
              example: 'Advanced Blockchain Technology',
            },
            studentId: {
              type: 'string',
              description: 'Student ID',
              example: 'STU123',
            },
            courseId: {
              type: 'string',
              description: 'Course ID',
              example: 'COURSE-ABC123',
            },
            issuedDate: {
              type: 'string',
              format: 'date',
              description: 'Date when the certificate was issued',
              example: '2024-01-01',
            },
          },
          required: ['studentName', 'courseName', 'studentId', 'courseId', 'issuedDate'],
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            error: {
              type: 'string',
              example: 'Detailed error description',
            },
          },
        },
      },
      responses: {
        Success: {
          description: 'Operation successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  message: {
                    type: 'string',
                    example: 'Operation successful',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'], 
};
export const specs = swaggerJsdoc(options);
