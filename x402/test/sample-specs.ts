// Test OpenAPI spec for testing the upload functionality
export const sampleOpenAPISpec = {
  openapi: "3.0.0",
  info: {
    title: "Pet Store API",
    description: "A sample Pet Store API",
    version: "1.0.0",
  },
  servers: [
    {
      url: "https://petstore.example.com/v1",
    },
  ],
  tags: [
    {
      name: "pets",
    },
  ],
  paths: {
    "/pets": {
      get: {
        summary: "List all pets",
        description: "Returns a list of all pets in the store",
        parameters: [
          {
            name: "limit",
            in: "query",
            description: "Maximum number of pets to return",
            required: false,
            schema: {
              type: "integer",
              format: "int32",
            },
          },
        ],
        responses: {
          "200": {
            description: "A list of pets",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer" },
                      name: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a pet",
        description: "Creates a new pet in the store",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string" },
                  tag: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Pet created successfully",
          },
        },
      },
    },
    "/pets/{petId}": {
      get: {
        summary: "Get a pet by ID",
        description: "Returns a single pet",
        parameters: [
          {
            name: "petId",
            in: "path",
            required: true,
            description: "The ID of the pet to retrieve",
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "A pet object",
          },
          "404": {
            description: "Pet not found",
          },
        },
      },
    },
  },
};

export const sampleYAMLSpec = `
openapi: 3.0.0
info:
  title: Weather API
  description: A simple weather API
  version: 1.0.0
servers:
  - url: https://api.weather.example.com/v1
paths:
  /weather:
    get:
      summary: Get current weather
      parameters:
        - name: city
          in: query
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Weather data
`;
