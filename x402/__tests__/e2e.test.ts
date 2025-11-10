import request from "supertest";
import express from "express";
import { DatabaseService } from "../db/service";
import apiRoutes from "../routes";

const app = express();
app.use(express.json());
app.use("/api", apiRoutes);

describe("End-to-End Flow Tests", () => {
  const db = new DatabaseService();
  const testWallet = "E2ETestWallet" + Date.now();
  let apiId: string;
  let apiSlug: string;

  describe("Complete Flow: Manual API Addition", () => {
    test("Step 1: Create API via manual entry", async () => {
      const response = await request(app).post("/api/listings").send({
        name: "E2E Weather API",
        description: "End-to-end test weather API",
        baseUrl: "https://api.weather-e2e.com",
        apiKey: "test-key-123",
        pricePerCall: "250",
        category: "Weather",
        walletAddress: testWallet,
        source: "manual",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      apiId = response.body.data.id;
      apiSlug = "e2e-weather";

      expect(apiId).toBeDefined();
    });

    test("Step 2: Verify API appears in listings", async () => {
      const response = await request(app).get("/api/listings");

      expect(response.status).toBe(200);
      expect(response.body.data.some((api: any) => api.id === apiId)).toBe(true);
    });

    test("Step 3: Verify API can be retrieved by owner", async () => {
      const response = await request(app).get(`/api/listings/owner/${testWallet}`);

      expect(response.status).toBe(200);
      expect(response.body.data.some((api: any) => api.id === apiId)).toBe(true);
    });

    test("Step 4: Record successful API usage", async () => {
      const response = await request(app)
        .post(`/api/listings/${apiId}/usage`)
        .send({
          user_address: "Consumer" + Date.now(),
          success: true,
          cost: "250",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stats.total_calls).toBeGreaterThan(0);
    });

    test("Step 5: Verify usage data is recorded", async () => {
      const response = await request(app).get(`/api/listings/${apiId}/usage`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test("Step 6: Check updated statistics", async () => {
      const response = await request(app).get(`/api/listings/${apiId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.total_calls).toBeGreaterThan(0);
      expect(parseFloat(response.body.data.revenue)).toBeGreaterThan(0);
    });

    test("Step 7: Update API details", async () => {
      const response = await request(app).put(`/api/listings/${apiId}`).send({
        description: "Updated E2E weather API description",
        owner: testWallet,
      });

      expect(response.status).toBe(200);
      expect(response.body.data.description).toBe("Updated E2E weather API description");
    });

    test("Step 8: Delete API", async () => {
      const response = await request(app)
        .delete(`/api/listings/${apiId}`)
        .send({ owner: testWallet });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("Step 9: Verify API is deleted", async () => {
      const response = await request(app).get(`/api/listings/${apiId}`);

      expect(response.status).toBe(404);
    });
  });

  describe("Complete Flow: OpenAPI Spec Upload", () => {
    let specApiId: string;

    test("Step 1: Upload OpenAPI spec", async () => {
      const openApiSpec = {
        openapi: "3.0.0",
        info: {
          title: "E2E Spec Upload API",
          description: "API created via spec upload for E2E testing",
          version: "2.0.0",
        },
        servers: [{ url: "https://api.spec-e2e.com" }],
        tags: [{ name: "weather" }, { name: "forecast" }],
        paths: {
          "/weather": {
            get: {
              summary: "Get current weather",
              tags: ["weather"],
              parameters: [
                {
                  name: "city",
                  in: "query",
                  required: true,
                  schema: { type: "string" },
                },
              ],
              responses: {
                "200": { description: "Success" },
                "400": { description: "Bad Request" },
              },
            },
          },
          "/forecast": {
            get: {
              summary: "Get weather forecast",
              tags: ["forecast"],
              parameters: [
                {
                  name: "city",
                  in: "query",
                  schema: { type: "string" },
                },
                {
                  name: "days",
                  in: "query",
                  schema: { type: "integer" },
                },
              ],
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
          pricePerCall: "300",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.listing).toBeDefined();
      expect(response.body.data.endpointsCount).toBe(2);

      specApiId = response.body.data.listing.id;
    });

    test("Step 2: Verify endpoints were created", async () => {
      const response = await request(app).get(`/api/listings/${specApiId}/endpoints`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);

      const paths = response.body.data.map((e: any) => e.path);
      expect(paths).toContain("/weather");
      expect(paths).toContain("/forecast");
    });

    test("Step 3: Verify category was inferred correctly", async () => {
      const response = await request(app).get(`/api/listings/${specApiId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.category).toBe("Weather");
    });

    test("Step 4: Record multiple usage events", async () => {
      const usageEvents = [
        { user_address: "User1", success: true, cost: "300" },
        { user_address: "User2", success: true, cost: "300" },
        { user_address: "User3", success: false, error: "API timeout", cost: "300" },
      ];

      for (const usage of usageEvents) {
        const response = await request(app).post(`/api/listings/${specApiId}/usage`).send(usage);

        expect(response.status).toBe(200);
      }
    });

    test("Step 5: Verify usage statistics", async () => {
      const response = await request(app).get(`/api/usage/stats/summary?owner=${testWallet}`);

      expect(response.status).toBe(200);
      expect(response.body.data.totalRequests).toBeGreaterThan(0);
      expect(response.body.data.successfulRequests).toBeGreaterThan(0);
      expect(response.body.data.failedRequests).toBeGreaterThan(0);
    });

    test("Step 6: Get all activity for owner", async () => {
      const response = await request(app).get(`/api/usage/owner/${testWallet}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test("Step 7: Clean up", async () => {
      await request(app).delete(`/api/listings/${specApiId}`).send({ owner: testWallet });
    });
  });

  describe("Complete Flow: Multiple APIs and Cross-Statistics", () => {
    const apiIds: string[] = [];

    beforeAll(async () => {
      // Create multiple APIs
      const apis = [
        {
          name: "E2E Payment API",
          description: "Payment processing API",
          baseUrl: "https://api.payment-e2e.com",
          pricePerCall: "500",
          category: "Payment",
        },
        {
          name: "E2E Social API",
          description: "Social media API",
          baseUrl: "https://api.social-e2e.com",
          pricePerCall: "200",
          category: "Social",
        },
      ];

      for (const api of apis) {
        const response = await request(app)
          .post("/api/listings")
          .send({
            ...api,
            walletAddress: testWallet,
            source: "manual",
          });

        apiIds.push(response.body.data.id);
      }
    });

    afterAll(async () => {
      // Clean up
      for (const id of apiIds) {
        await request(app).delete(`/api/listings/${id}`).send({ owner: testWallet });
      }
    });

    test("Step 1: Record usage across multiple APIs", async () => {
      for (const apiId of apiIds) {
        for (let i = 0; i < 3; i++) {
          await request(app)
            .post(`/api/listings/${apiId}/usage`)
            .send({
              user_address: `Consumer${i}`,
              success: true,
              cost: i === 0 ? "500" : "200",
            });
        }
      }

      // Verify all usage was recorded
      const statsResponse = await request(app).get(`/api/usage/stats/summary?owner=${testWallet}`);

      expect(statsResponse.body.data.totalRequests).toBeGreaterThanOrEqual(6);
    });

    test("Step 2: Verify individual API statistics", async () => {
      for (const apiId of apiIds) {
        const response = await request(app).get(`/api/listings/${apiId}`);

        expect(response.status).toBe(200);
        expect(response.body.data.total_calls).toBeGreaterThan(0);
        expect(parseFloat(response.body.data.revenue)).toBeGreaterThan(0);
      }
    });

    test("Step 3: Test time-range filtering", async () => {
      const timeRanges = ["1h", "24h", "7d", "30d"];

      for (const range of timeRanges) {
        const response = await request(app).get(
          `/api/usage/stats/summary?owner=${testWallet}&timeRange=${range}`,
        );

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
      }
    });

    test("Step 4: Verify owner can see all their APIs", async () => {
      const response = await request(app).get(`/api/listings/owner/${testWallet}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(apiIds.length);
    });
  });

  describe("Error Handling Flow", () => {
    test("Should handle full error workflow", async () => {
      // Try to create with missing fields
      let response = await request(app).post("/api/listings").send({
        name: "Incomplete API",
      });
      expect(response.status).toBe(400);

      // Try to get non-existent API
      response = await request(app).get("/api/listings/00000000-0000-0000-0000-000000000000");
      expect(response.status).toBe(404);

      // Try to update non-existent API
      response = await request(app)
        .put("/api/listings/00000000-0000-0000-0000-000000000000")
        .send({ description: "Test", owner: testWallet });
      expect(response.status).toBe(404);

      // Try to delete non-existent API
      response = await request(app)
        .delete("/api/listings/00000000-0000-0000-0000-000000000000")
        .send({ owner: testWallet });
      expect(response.status).toBe(404);

      // Try to upload invalid spec
      response = await request(app).post("/api/listings/upload-spec").send({
        spec: "invalid spec",
        walletAddress: testWallet,
      });
      expect(response.status).toBe(400);
    });
  });
});
