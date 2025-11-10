import request from "supertest";
import express from "express";
import apiRoutes from "../routes";
import { DatabaseService } from "../db/service";

const app = express();
app.use(express.json());
app.use("/api", apiRoutes);

describe("API Routes - Integration Tests", () => {
  const db = new DatabaseService();
  let testApiId: string;
  const testWallet = "IntegrationTestWallet" + Date.now();

  describe("POST /api/listings - Create API Listing", () => {
    test("should create a new API listing with manual entry", async () => {
      const response = await request(app).post("/api/listings").send({
        name: "Integration Test API",
        description: "An API for integration testing",
        baseUrl: "https://api.integration-test.com",
        apiKey: "test-key",
        pricePerCall: "150",
        category: "Testing",
        walletAddress: testWallet,
        source: "manual",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.name).toBe("Integration Test API");
      expect(response.body.data.owner).toBe(testWallet);

      testApiId = response.body.data.id;
    });

    test("should return 400 for missing required fields", async () => {
      const response = await request(app).post("/api/listings").send({
        name: "Incomplete API",
        // Missing other required fields
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Missing required fields");
    });

    test("should generate unique name for duplicate", async () => {
      const response = await request(app).post("/api/listings").send({
        name: "Integration Test API",
        description: "Duplicate name test",
        baseUrl: "https://api.duplicate-test.com",
        pricePerCall: "100",
        category: "Testing",
        walletAddress: testWallet,
        source: "manual",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).not.toBe("Integration Test API");
      expect(response.body.data.name).toContain("Integration Test API");
      expect(response.body.message).toContain("original name already exists");
    });
  });

  describe("GET /api/listings - Get All Listings", () => {
    test("should get all API listings", async () => {
      const response = await request(app).get("/api/listings");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/listings/:id - Get Listing by ID", () => {
    test("should get a specific API listing", async () => {
      const response = await request(app).get(`/api/listings/${testApiId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(testApiId);
    });

    test("should return 404 for non-existent listing", async () => {
      const response = await request(app).get("/api/listings/00000000-0000-0000-0000-000000000000");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("not found");
    });
  });

  describe("GET /api/listings/owner/:walletAddress - Get by Owner", () => {
    test("should get all listings for a specific owner", async () => {
      const response = await request(app).get(`/api/listings/owner/${testWallet}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.every((l: any) => l.owner === testWallet)).toBe(true);
    });
  });

  describe("PUT /api/listings/:id - Update Listing", () => {
    test("should update an API listing", async () => {
      const response = await request(app).put(`/api/listings/${testApiId}`).send({
        description: "Updated description for integration test",
        owner: testWallet,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe("Updated description for integration test");
    });

    test("should return 404 for non-existent listing", async () => {
      const response = await request(app)
        .put("/api/listings/00000000-0000-0000-0000-000000000000")
        .send({
          description: "Test",
          owner: testWallet,
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test("should return 403 for unauthorized update", async () => {
      const response = await request(app).put(`/api/listings/${testApiId}`).send({
        description: "Unauthorized update",
        owner: "WrongOwner",
      });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Unauthorized");
    });
  });

  describe("POST /api/listings/:id/usage - Record Usage", () => {
    test("should record successful API usage", async () => {
      const response = await request(app).post(`/api/listings/${testApiId}/usage`).send({
        user_address: testWallet,
        success: true,
        cost: "150",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.usage).toBeDefined();
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.stats.total_calls).toBeGreaterThan(0);
    });

    test("should record failed API usage", async () => {
      const response = await request(app).post(`/api/listings/${testApiId}/usage`).send({
        user_address: testWallet,
        success: false,
        error: "Test error message",
        cost: "150",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.usage.success).toBe(false);
      expect(response.body.data.usage.error).toBe("Test error message");
    });

    test("should return 400 for missing required fields", async () => {
      const response = await request(app).post(`/api/listings/${testApiId}/usage`).send({
        user_address: testWallet,
        // Missing success and cost
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Missing required fields");
    });
  });

  describe("GET /api/usage - Get Usage Data", () => {
    test("should get all usage data", async () => {
      const response = await request(app).get("/api/usage");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test("should get usage data with limit", async () => {
      const response = await request(app).get("/api/usage?limit=10");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });

    test("should get usage data filtered by owner", async () => {
      const response = await request(app).get(`/api/usage?owner=${testWallet}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("GET /api/usage/owner/:walletAddress - Get Usage by Owner", () => {
    test("should get usage for specific owner", async () => {
      const response = await request(app).get(`/api/usage/owner/${testWallet}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("GET /api/listings/:id/usage - Get Usage by API", () => {
    test("should get usage for specific API", async () => {
      const response = await request(app).get(`/api/listings/${testApiId}/usage`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("GET /api/usage/stats/summary - Get Usage Statistics", () => {
    test("should get overall usage statistics", async () => {
      const response = await request(app).get("/api/usage/stats/summary");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalRequests).toBeDefined();
      expect(response.body.data.successfulRequests).toBeDefined();
      expect(response.body.data.failedRequests).toBeDefined();
      expect(response.body.data.totalRevenue).toBeDefined();
    });

    test("should get usage statistics for specific owner", async () => {
      const response = await request(app).get(`/api/usage/stats/summary?owner=${testWallet}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalRequests).toBeGreaterThan(0);
    });

    test("should get usage statistics with time range", async () => {
      const response = await request(app).get("/api/usage/stats/summary?timeRange=24h");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(typeof response.body.data.totalRequests).toBe("number");
    });
  });

  describe("GET /api/listings/:id/endpoints - Get Endpoints", () => {
    test("should get endpoints for an API", async () => {
      const response = await request(app).get(`/api/listings/${testApiId}/endpoints`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("POST /api/listings/upload-spec - Upload OpenAPI Spec", () => {
    test("should create API from OpenAPI spec", async () => {
      const openApiSpec = {
        openapi: "3.0.0",
        info: {
          title: "Spec Upload Test API",
          description: "API created from spec upload",
          version: "1.0.0",
        },
        servers: [{ url: "https://api.spec-test.com" }],
        paths: {
          "/users": {
            get: {
              summary: "Get all users",
              responses: {
                "200": { description: "Success" },
              },
            },
          },
        },
      };

      const response = await request(app)
        .post("/api/listings/upload-spec")
        .send({
          spec: JSON.stringify(openApiSpec),
          fileType: "json",
          walletAddress: testWallet,
          pricePerCall: "200",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.listing).toBeDefined();
      expect(response.body.data.listing.name).toBe("Spec Upload Test API");
      expect(response.body.data.endpointsCount).toBeGreaterThan(0);
    });

    test("should return 400 for invalid spec", async () => {
      const response = await request(app).post("/api/listings/upload-spec").send({
        spec: "invalid json",
        fileType: "json",
        walletAddress: testWallet,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should return 400 for missing fields", async () => {
      const response = await request(app).post("/api/listings/upload-spec").send({
        spec: "{}",
        // Missing walletAddress
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Missing required fields");
    });
  });

  describe("DELETE /api/listings/:id - Delete Listing", () => {
    test("should delete an API listing", async () => {
      const response = await request(app)
        .delete(`/api/listings/${testApiId}`)
        .send({ owner: testWallet });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("deleted successfully");
    });

    test("should return 404 for non-existent listing", async () => {
      const response = await request(app)
        .delete("/api/listings/00000000-0000-0000-0000-000000000000")
        .send({ owner: testWallet });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test("should return 403 for unauthorized delete", async () => {
      // Create a new listing
      const createResponse = await request(app).post("/api/listings").send({
        name: "Delete Test API",
        description: "For testing delete authorization",
        baseUrl: "https://api.delete-test.com",
        pricePerCall: "100",
        category: "Testing",
        walletAddress: testWallet,
        source: "manual",
      });

      const newApiId = createResponse.body.data.id;

      // Try to delete with wrong owner
      const deleteResponse = await request(app)
        .delete(`/api/listings/${newApiId}`)
        .send({ owner: "WrongOwner" });

      expect(deleteResponse.status).toBe(403);
      expect(deleteResponse.body.success).toBe(false);
      expect(deleteResponse.body.error).toContain("Unauthorized");

      // Clean up
      await request(app).delete(`/api/listings/${newApiId}`).send({ owner: testWallet });
    });
  });
});
