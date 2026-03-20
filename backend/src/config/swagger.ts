const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "BookLeaf Support Portal API",
    version: "1.0.0",
    description:
      "Backend API for BookLeaf Author Support & Communication Portal",
  },
  servers: [
    {
      url: "http://localhost:5000/api",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "Server is running",
          },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Login user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "admin@bookleaf.com" },
                  password: { type: "string", example: "Admin@123" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Login successful" },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/auth/me": {
      get: {
        summary: "Get current user",
        responses: {
          "200": { description: "Current user fetched" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/author/books": {
      get: {
        summary: "Get logged-in author books",
        responses: {
          "200": { description: "Books fetched" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/author/tickets": {
      get: {
        summary: "Get logged-in author tickets",
        responses: {
          "200": { description: "Tickets fetched" },
        },
      },
      post: {
        summary: "Create support ticket",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["subject", "description"],
                properties: {
                  bookId: {
                    type: "string",
                    example: "GENERAL",
                  },
                  subject: {
                    type: "string",
                    example: "Print issue",
                  },
                  description: {
                    type: "string",
                    example: "Pages are misaligned",
                  },
                  attachments: {
                    type: "array",
                    items: {
                      type: "string",
                      format: "binary",
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Ticket created successfully" },
          "400": { description: "Validation failed" },
        },
      },
    },
    "/author/tickets/{ticketId}": {
      get: {
        summary: "Get author ticket detail",
        parameters: [
          {
            name: "ticketId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Ticket fetched" },
          "404": { description: "Ticket not found" },
        },
      },
    },
    "/admin/tickets": {
      get: {
        summary: "Get all tickets for admin",
        responses: {
          "200": { description: "Tickets fetched" },
        },
      },
    },
    "/admin/tickets/{ticketId}": {
      get: {
        summary: "Get admin ticket detail",
        parameters: [
          {
            name: "ticketId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Ticket fetched" },
        },
      },
      patch: {
        summary: "Update ticket status/category/priority",
        parameters: [
          {
            name: "ticketId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "Resolved",
                  },
                  category: {
                    type: "string",
                    example: "Printing & Quality",
                  },
                  priority: {
                    type: "string",
                    example: "High",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Ticket updated" },
        },
      },
    },
    "/admin/tickets/{ticketId}/assign": {
      post: {
        summary: "Assign ticket to current admin",
        parameters: [
          {
            name: "ticketId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Ticket assigned" },
        },
      },
    },
    "/admin/tickets/{ticketId}/notes": {
      post: {
        summary: "Add internal note",
        parameters: [
          {
            name: "ticketId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["note"],
                properties: {
                  note: {
                    type: "string",
                    example: "Checking with production team.",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Note added" },
        },
      },
    },
    "/admin/tickets/{ticketId}/respond": {
      post: {
        summary: "Respond to a ticket",
        parameters: [
          {
            name: "ticketId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["message"],
                properties: {
                  message: {
                    type: "string",
                    example:
                      "Thanks for reaching out. Our team is reviewing this issue.",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Response added" },
        },
      },
    },
    "/admin/tickets/{ticketId}/ai-draft": {
      post: {
        summary: "Generate AI draft for a ticket",
        parameters: [
          {
            name: "ticketId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "AI draft generated" },
        },
      },
    },
    "/events/stream": {
      get: {
        summary: "SSE stream endpoint",
        responses: {
          "200": { description: "SSE stream opened" },
        },
      },
    },
  },
};

export default swaggerDocument;
