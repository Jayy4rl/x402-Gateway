import { parseOpenAPISpec, parseYAMLSpec } from "../db/parsers/openapi-parser";

describe("OpenAPI Parser - Unit Tests", () => {
  describe("parseOpenAPISpec", () => {
    test("should parse valid OpenAPI 3.0 spec", async () => {
      const spec = {
        openapi: "3.0.0",
        info: {
          title: "Test API",
          description: "A test API for parsing",
          version: "1.0.0",
        },
        servers: [
          {
            url: "https://api.example.com",
          },
        ],
        tags: [{ name: "users" }, { name: "posts" }],
        paths: {
          "/users": {
            get: {
              summary: "Get all users",
              description: "Retrieves a list of all users",
              tags: ["users"],
              parameters: [
                {
                  name: "limit",
                  in: "query",
                  schema: { type: "integer" },
                },
              ],
              responses: {
                "200": {
                  description: "Success",
                },
              },
            },
            post: {
              summary: "Create a user",
              tags: ["users"],
              requestBody: {
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        email: { type: "string" },
                      },
                    },
                  },
                },
              },
              responses: {
                "201": {
                  description: "Created",
                },
              },
            },
          },
          "/users/{id}": {
            get: {
              summary: "Get user by ID",
              parameters: [
                {
                  name: "id",
                  in: "path",
                  required: true,
                  schema: { type: "string" },
                },
              ],
              responses: {
                "200": {
                  description: "Success",
                },
                "404": {
                  description: "Not found",
                },
              },
            },
          },
        },
      };

      const result = await parseOpenAPISpec(JSON.stringify(spec));

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe("Test API");
      expect(result.data?.description).toBe("A test API for parsing");
      expect(result.data?.version).toBe("1.0.0");
      expect(result.data?.base_url).toBe("https://api.example.com");
      expect(result.data?.tags).toEqual(["users", "posts"]);
      expect(result.data?.endpoints).toBeDefined();
      expect(result.data?.endpoints.length).toBeGreaterThan(0);
    });

    test("should extract endpoints correctly", async () => {
      const spec = {
        openapi: "3.0.0",
        info: {
          title: "Endpoint Test API",
          version: "1.0.0",
        },
        paths: {
          "/test": {
            get: {
              summary: "Test GET",
              responses: { "200": { description: "OK" } },
            },
            post: {
              summary: "Test POST",
              responses: { "201": { description: "Created" } },
            },
          },
        },
      };

      const result = await parseOpenAPISpec(JSON.stringify(spec));

      expect(result.success).toBe(true);
      expect(result.data?.endpoints.length).toBe(2);

      const getEndpoint = result.data?.endpoints.find(e => e.method === "GET");
      const postEndpoint = result.data?.endpoints.find(e => e.method === "POST");

      expect(getEndpoint).toBeDefined();
      expect(getEndpoint?.path).toBe("/test");
      expect(getEndpoint?.summary).toBe("Test GET");

      expect(postEndpoint).toBeDefined();
      expect(postEndpoint?.path).toBe("/test");
      expect(postEndpoint?.summary).toBe("Test POST");
    });

    test("should handle spec without servers", async () => {
      const spec = {
        openapi: "3.0.0",
        info: {
          title: "No Server API",
          version: "1.0.0",
        },
        paths: {},
      };

      const result = await parseOpenAPISpec(JSON.stringify(spec));

      expect(result.success).toBe(true);
      expect(result.data?.base_url).toBe("");
    });

    test("should handle spec without tags", async () => {
      const spec = {
        openapi: "3.0.0",
        info: {
          title: "No Tags API",
          version: "1.0.0",
        },
        paths: {},
      };

      const result = await parseOpenAPISpec(JSON.stringify(spec));

      expect(result.success).toBe(true);
      expect(result.data?.tags).toEqual([]);
    });

    test("should handle spec without description", async () => {
      const spec = {
        openapi: "3.0.0",
        info: {
          title: "No Description API",
          version: "1.0.0",
        },
        paths: {},
      };

      const result = await parseOpenAPISpec(JSON.stringify(spec));

      expect(result.success).toBe(true);
      expect(result.data?.description).toBe("");
    });

    test("should return error for invalid JSON", async () => {
      const result = await parseOpenAPISpec("invalid json");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test("should return error for invalid OpenAPI spec", async () => {
      const invalidSpec = {
        // Missing required fields
        some: "data",
      };

      const result = await parseOpenAPISpec(JSON.stringify(invalidSpec));

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("parseYAMLSpec", () => {
    test("should parse valid YAML OpenAPI spec", async () => {
      const yamlSpec = `
openapi: 3.0.0
info:
  title: YAML Test API
  description: API from YAML
  version: 1.0.0
servers:
  - url: https://api.yaml-test.com
paths:
  /test:
    get:
      summary: Test endpoint
      responses:
        '200':
          description: Success
      `;

      const result = await parseYAMLSpec(yamlSpec);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe("YAML Test API");
      expect(result.data?.description).toBe("API from YAML");
      expect(result.data?.base_url).toBe("https://api.yaml-test.com");
    });

    test("should return error for invalid YAML", async () => {
      const invalidYaml = `
      invalid: yaml: syntax:
        - incomplete
        nested
      `;

      const result = await parseYAMLSpec(invalidYaml);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("Endpoint Extraction", () => {
    test("should extract parameters from endpoints", async () => {
      const spec = {
        openapi: "3.0.0",
        info: {
          title: "Parameters Test",
          version: "1.0.0",
        },
        paths: {
          "/users/{userId}/posts": {
            get: {
              parameters: [
                {
                  name: "userId",
                  in: "path",
                  required: true,
                  schema: { type: "string" },
                },
                {
                  name: "limit",
                  in: "query",
                  schema: { type: "integer" },
                },
                {
                  name: "Authorization",
                  in: "header",
                  schema: { type: "string" },
                },
              ],
              responses: {
                "200": { description: "OK" },
              },
            },
          },
        },
      };

      const result = await parseOpenAPISpec(JSON.stringify(spec));

      expect(result.success).toBe(true);
      expect(result.data?.endpoints.length).toBe(1);
      expect(result.data?.endpoints[0].parameters).toBeDefined();
    });

    test("should extract request body from endpoints", async () => {
      const spec = {
        openapi: "3.0.0",
        info: {
          title: "Request Body Test",
          version: "1.0.0",
        },
        paths: {
          "/users": {
            post: {
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        email: { type: "string" },
                      },
                      required: ["name", "email"],
                    },
                  },
                },
              },
              responses: {
                "201": { description: "Created" },
              },
            },
          },
        },
      };

      const result = await parseOpenAPISpec(JSON.stringify(spec));

      expect(result.success).toBe(true);
      expect(result.data?.endpoints.length).toBe(1);
      expect(result.data?.endpoints[0].request_body).toBeDefined();
    });

    test("should extract multiple response codes", async () => {
      const spec = {
        openapi: "3.0.0",
        info: {
          title: "Responses Test",
          version: "1.0.0",
        },
        paths: {
          "/data": {
            get: {
              responses: {
                "200": { description: "Success" },
                "400": { description: "Bad Request" },
                "401": { description: "Unauthorized" },
                "404": { description: "Not Found" },
                "500": { description: "Server Error" },
              },
            },
          },
        },
      };

      const result = await parseOpenAPISpec(JSON.stringify(spec));

      expect(result.success).toBe(true);
      expect(result.data?.endpoints.length).toBe(1);
      expect(result.data?.endpoints[0].responses).toBeDefined();
      expect(Object.keys(result.data?.endpoints[0].responses || {}).length).toBe(5);
    });
  });

  describe("Complex OpenAPI Specs", () => {
    test("should handle spec with multiple servers", async () => {
      const spec = {
        openapi: "3.0.0",
        info: {
          title: "Multi-Server API",
          version: "1.0.0",
        },
        servers: [
          { url: "https://api.production.com" },
          { url: "https://api.staging.com" },
          { url: "http://localhost:3000" },
        ],
        paths: {},
      };

      const result = await parseOpenAPISpec(JSON.stringify(spec));

      expect(result.success).toBe(true);
      // Should use first server
      expect(result.data?.base_url).toBe("https://api.production.com");
    });

    test("should handle all HTTP methods", async () => {
      const spec = {
        openapi: "3.0.0",
        info: {
          title: "All Methods API",
          version: "1.0.0",
        },
        paths: {
          "/resource": {
            get: { summary: "GET", responses: { "200": { description: "OK" } } },
            post: { summary: "POST", responses: { "201": { description: "Created" } } },
            put: { summary: "PUT", responses: { "200": { description: "OK" } } },
            patch: { summary: "PATCH", responses: { "200": { description: "OK" } } },
            delete: { summary: "DELETE", responses: { "204": { description: "No Content" } } },
          },
        },
      };

      const result = await parseOpenAPISpec(JSON.stringify(spec));

      expect(result.success).toBe(true);
      expect(result.data?.endpoints.length).toBe(5);

      const methods = result.data?.endpoints.map(e => e.method);
      expect(methods).toContain("GET");
      expect(methods).toContain("POST");
      expect(methods).toContain("PUT");
      expect(methods).toContain("PATCH");
      expect(methods).toContain("DELETE");
    });
  });
});
