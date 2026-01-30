const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ecommerce API",
      version: "1.0.0",
      description: "Ecommerce REST API документация (Swagger/OpenAPI)",
    },
    servers: [
      { url: "http://localhost:4000", description: "Local" },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: { error: { type: "string" } },
        },
        UserPublic: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            name: { type: "string", nullable: true },
            role: { type: "string", enum: ["USER", "ADMIN"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        RegisterBody: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "test@mail.com" },
            password: { type: "string", example: "123456" },
            name: { type: "string", example: "Test", nullable: true },
          },
        },
        LoginBody: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "test@mail.com" },
            password: { type: "string", example: "123456" },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            description: { type: "string", nullable: true },
            price: { type: "integer", description: "amount in tiyin/sent", example: 25000000 },
            stock: { type: "integer", example: 3 },
            categoryId: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CreateProductBody: {
          type: "object",
          required: ["title", "price"],
          properties: {
            title: { type: "string", example: "MacBook Pro" },
            description: { type: "string", example: "M3, 16GB RAM" },
            price: { type: "integer", example: 25000000 },
            stock: { type: "integer", example: 3 },
            categoryId: { type: "string", nullable: true },
          },
        },
        UpdateProductBody: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            price: { type: "integer" },
            stock: { type: "integer" },
            categoryId: { type: "string", nullable: true },
          },
        },
        CartItem: {
          type: "object",
          properties: {
            id: { type: "string" },
            productId: { type: "string" },
            quantity: { type: "integer" },
            product: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                price: { type: "integer" },
                stock: { type: "integer" },
              },
            },
          },
        },
        OrderItem: {
          type: "object",
          properties: {
            id: { type: "string" },
            productId: { type: "string" },
            title: { type: "string" },
            price: { type: "integer" },
            quantity: { type: "integer" },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "string" },
            userId: { type: "string" },
            status: { type: "string", enum: ["PENDING", "PAID", "CANCELED"] },
            subtotal: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            items: { type: "array", items: { $ref: "#/components/schemas/OrderItem" } },
          },
        },
      },
    },
    tags: [
      { name: "Auth" },
      { name: "Products" },
      { name: "Cart" },
      { name: "Orders" },
    ],
    paths: {
      "/health": {
        get: {
          summary: "Health check",
          responses: {
            200: { description: "OK" },
          },
        },
      },

      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register new user",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/RegisterBody" } },
            },
          },
          responses: {
            201: {
              description: "Created",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { user: { $ref: "#/components/schemas/UserPublic" } },
                  },
                },
              },
            },
            400: { description: "Bad Request", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            409: { description: "Email already in use", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },

      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/LoginBody" } },
            },
          },
          responses: {
            200: {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      accessToken: { type: "string" },
                      refreshToken: { type: "string" },
                      user: { $ref: "#/components/schemas/UserPublic" },
                    },
                  },
                },
              },
            },
            401: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },

      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current user",
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: "OK",
              content: {
                "application/json": {
                  schema: { type: "object", properties: { user: { $ref: "#/components/schemas/UserPublic" } } },
                },
              },
            },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },

      "/api/products": {
        get: {
          tags: ["Products"],
          summary: "List products",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", example: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", example: 10 } },
            { name: "q", in: "query", schema: { type: "string", example: "mac" } },
          ],
          responses: {
            200: { description: "OK" },
          },
        },
        post: {
          tags: ["Products"],
          summary: "Create product (ADMIN)",
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreateProductBody" } } },
          },
          responses: {
            201: {
              description: "Created",
              content: { "application/json": { schema: { type: "object", properties: { product: { $ref: "#/components/schemas/Product" } } } } },
            },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            403: { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },

      "/api/products/{id}": {
        get: {
          tags: ["Products"],
          summary: "Get product",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "OK" },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
        patch: {
          tags: ["Products"],
          summary: "Update product (ADMIN)",
          security: [{ BearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateProductBody" } } },
          },
          responses: {
            200: { description: "OK" },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            403: { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
        delete: {
          tags: ["Products"],
          summary: "Delete product (ADMIN)",
          security: [{ BearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "OK" },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            403: { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },

      "/api/cart": {
        get: {
          tags: ["Cart"],
          summary: "Get my cart",
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } },
        },
        delete: {
          tags: ["Cart"],
          summary: "Clear my cart",
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } },
        },
      },

      "/api/cart/items": {
        post: {
          tags: ["Cart"],
          summary: "Add item to cart",
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["productId"],
                  properties: {
                    productId: { type: "string" },
                    quantity: { type: "integer", example: 1 },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Created" }, 400: { description: "Bad Request" }, 401: { description: "Unauthorized" } },
        },
      },

      "/api/cart/items/{id}": {
        patch: {
          tags: ["Cart"],
          summary: "Update cart item quantity",
          security: [{ BearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", required: ["quantity"], properties: { quantity: { type: "integer", example: 2 } } },
              },
            },
          },
          responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" } },
        },
        delete: {
          tags: ["Cart"],
          summary: "Remove cart item",
          security: [{ BearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" } },
        },
      },

      "/api/orders/checkout": {
        post: {
          tags: ["Orders"],
          summary: "Checkout (create order from cart)",
          security: [{ BearerAuth: [] }],
          responses: {
            201: { description: "Created", content: { "application/json": { schema: { type: "object", properties: { order: { $ref: "#/components/schemas/Order" } } } } } },
            400: { description: "Cart empty / stock issue", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },

      "/api/orders": {
        get: {
          tags: ["Orders"],
          summary: "List my orders",
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } },
        },
      },

      "/api/orders/{id}": {
        get: {
          tags: ["Orders"],
          summary: "Get my order",
          security: [{ BearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" } },
        },
      },
    },
  },
  // Bu variantda annotation emas, config ichidagi `paths` bilan ishlatyapmiz.
  apis: [],
};

module.exports = swaggerJSDoc(options);
