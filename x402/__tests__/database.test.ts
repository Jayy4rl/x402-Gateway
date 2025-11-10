import { DatabaseService } from "../db/service";
import type { APIListing, APIEndpoint, APIUsage } from "../db/schema";

describe("Database Service - Unit Tests", () => {
  let db: DatabaseService;
  let testApiId: string;
  let testEndpointId: string;
  const testWallet = "TestWallet" + Date.now();

  beforeAll(() => {
    db = new DatabaseService();
  });

  describe("API Listing Management", () => {
    test("should create a new API listing", async () => {
      const newListing = {
        name: "Test API " + Date.now(),
        description: "A test API for unit testing",
        base_url: "https://api.test.com",
        api_key: null,
        price_per_call: "100",
        category: "Testing",
        source: "manual",
        owner: testWallet,
        status: "active",
        total_calls: 0,
        revenue: "0",
      };

      const created = await db.createAPIListing(newListing);
      testApiId = created.id;

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.name).toBe(newListing.name);
      expect(created.description).toBe(newListing.description);
      expect(created.base_url).toBe(newListing.base_url);
      expect(created.price_per_call).toBe(newListing.price_per_call);
      expect(created.category).toBe(newListing.category);
      expect(created.owner).toBe(testWallet);
      expect(created.created_at).toBeDefined();
    });

    test("should retrieve an API listing by ID", async () => {
      const listing = await db.getAPIListing(testApiId);

      expect(listing).toBeDefined();
      expect(listing?.id).toBe(testApiId);
      expect(listing?.owner).toBe(testWallet);
    });

    test("should return null for non-existent API listing", async () => {
      const listing = await db.getAPIListing("00000000-0000-0000-0000-000000000000");
      expect(listing).toBeNull();
    });

    test("should get all API listings", async () => {
      const listings = await db.getAllAPIListings();

      expect(listings).toBeDefined();
      expect(Array.isArray(listings)).toBe(true);
      expect(listings.length).toBeGreaterThan(0);
      expect(listings.some(l => l.id === testApiId)).toBe(true);
    });

    test("should get API listings by owner", async () => {
      const listings = await db.getAPIListingsByOwner(testWallet);

      expect(listings).toBeDefined();
      expect(Array.isArray(listings)).toBe(true);
      expect(listings.every(l => l.owner === testWallet)).toBe(true);
      expect(listings.some(l => l.id === testApiId)).toBe(true);
    });

    test("should get API listing by name", async () => {
      const listing = await db.getAPIListing(testApiId);
      const foundByName = await db.getAPIListingByName(listing!.name);

      expect(foundByName).toBeDefined();
      expect(foundByName?.id).toBe(testApiId);
    });

    test("should generate unique name for duplicate", async () => {
      const listing = await db.getAPIListing(testApiId);
      const uniqueName = await db.generateUniqueName(listing!.name);

      expect(uniqueName).toBeDefined();
      expect(uniqueName).not.toBe(listing!.name);
      expect(uniqueName).toContain(listing!.name);
    });

    test("should update an API listing", async () => {
      const updatedDescription = "Updated description " + Date.now();
      const updated = await db.updateAPIListing(testApiId, {
        description: updatedDescription,
      });

      expect(updated).toBeDefined();
      expect(updated.description).toBe(updatedDescription);
      expect(updated.updated_at).toBeDefined();
    });

    test("should throw error when updating non-existent listing", async () => {
      await expect(
        db.updateAPIListing("00000000-0000-0000-0000-000000000000", {
          description: "Test",
        }),
      ).rejects.toThrow("API listing not found");
    });
  });

  describe("API Endpoint Management", () => {
    test("should create a single endpoint", async () => {
      const endpoint = {
        api_id: testApiId,
        path: "/test",
        method: "GET",
        summary: "Test endpoint",
        description: "A test endpoint",
        parameters: { query: { name: "test" } },
        request_body: null,
        responses: { "200": { description: "Success" } },
      };

      const created = await db.createEndpoint(endpoint);
      testEndpointId = created.id;

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.api_id).toBe(testApiId);
      expect(created.path).toBe(endpoint.path);
      expect(created.method).toBe(endpoint.method);
      expect(created.summary).toBe(endpoint.summary);
    });

    test("should create multiple endpoints in batch", async () => {
      const endpoints = [
        {
          path: "/users",
          method: "GET",
          summary: "Get users",
          description: "Get all users",
          parameters: null,
          request_body: null,
          responses: null,
        },
        {
          path: "/users",
          method: "POST",
          summary: "Create user",
          description: "Create a new user",
          parameters: null,
          request_body: { type: "object" },
          responses: null,
        },
      ];

      const created = await db.createEndpoints(testApiId, endpoints);

      expect(created).toBeDefined();
      expect(created.length).toBe(2);
      expect(created[0].api_id).toBe(testApiId);
      expect(created[1].api_id).toBe(testApiId);
    });

    test("should get endpoints by API ID", async () => {
      const endpoints = await db.getEndpointsByAPIId(testApiId);

      expect(endpoints).toBeDefined();
      expect(Array.isArray(endpoints)).toBe(true);
      expect(endpoints.length).toBeGreaterThan(0);
      expect(endpoints.every(e => e.api_id === testApiId)).toBe(true);
    });

    test("should get a specific endpoint", async () => {
      const endpoint = await db.getEndpoint(testEndpointId);

      expect(endpoint).toBeDefined();
      expect(endpoint?.id).toBe(testEndpointId);
      expect(endpoint?.api_id).toBe(testApiId);
    });

    test("should update an endpoint", async () => {
      const updatedSummary = "Updated endpoint summary";
      const updated = await db.updateEndpoint(testEndpointId, {
        summary: updatedSummary,
      });

      expect(updated).toBeDefined();
      expect(updated.summary).toBe(updatedSummary);
    });

    test("should throw error when updating non-existent endpoint", async () => {
      await expect(
        db.updateEndpoint("00000000-0000-0000-0000-000000000000", {
          summary: "Test",
        }),
      ).rejects.toThrow("Endpoint not found");
    });
  });

  describe("Usage Tracking", () => {
    test("should record API usage", async () => {
      const usage = {
        api_id: testApiId,
        user_address: testWallet,
        success: true,
        error: null,
        cost: "100",
      };

      const recorded = await db.recordAPIUsage(usage);

      expect(recorded).toBeDefined();
      expect(recorded.id).toBeDefined();
      expect(recorded.api_id).toBe(testApiId);
      expect(recorded.user_address).toBe(testWallet);
      expect(recorded.success).toBe(true);
      expect(recorded.cost).toBe("100");
      expect(recorded.timestamp).toBeDefined();
    });

    test("should update stats when recording usage", async () => {
      const statsBefore = await db.getAPIUsageStats(testApiId);

      await db.recordAPIUsage({
        api_id: testApiId,
        user_address: testWallet,
        success: true,
        error: null,
        cost: "50",
      });

      const statsAfter = await db.getAPIUsageStats(testApiId);

      expect(statsAfter.total_calls).toBe(statsBefore.total_calls + 1);
      expect(parseFloat(statsAfter.total_revenue)).toBeGreaterThan(
        parseFloat(statsBefore.total_revenue),
      );
    });

    test("should record failed API usage", async () => {
      const usage = {
        api_id: testApiId,
        user_address: testWallet,
        success: false,
        error: "Test error message",
        cost: "100",
      };

      const recorded = await db.recordAPIUsage(usage);

      expect(recorded).toBeDefined();
      expect(recorded.success).toBe(false);
      expect(recorded.error).toBe("Test error message");
    });

    test("should get all usage data", async () => {
      const usageData = await db.getAllUsage(100);

      expect(usageData).toBeDefined();
      expect(Array.isArray(usageData)).toBe(true);
    });

    test("should get usage by owner", async () => {
      const usageData = await db.getUsageByOwner(testWallet, 100);

      expect(usageData).toBeDefined();
      expect(Array.isArray(usageData)).toBe(true);
    });

    test("should get usage by API ID", async () => {
      const usageData = await db.getUsageByAPIId(testApiId, 100);

      expect(usageData).toBeDefined();
      expect(Array.isArray(usageData)).toBe(true);
      expect(usageData.length).toBeGreaterThan(0);
    });

    test("should get usage stats summary", async () => {
      const stats = await db.getUsageStatsSummary();

      expect(stats).toBeDefined();
      expect(stats.totalRequests).toBeGreaterThan(0);
      expect(stats.successfulRequests).toBeDefined();
      expect(stats.failedRequests).toBeDefined();
      expect(stats.totalRevenue).toBeDefined();
    });

    test("should get usage stats summary filtered by owner", async () => {
      const stats = await db.getUsageStatsSummary(testWallet);

      expect(stats).toBeDefined();
      expect(stats.totalRequests).toBeGreaterThan(0);
    });

    test("should get usage stats summary with time range", async () => {
      const stats = await db.getUsageStatsSummary(undefined, "24h");

      expect(stats).toBeDefined();
      expect(typeof stats.totalRequests).toBe("number");
    });
  });

  describe("Cleanup", () => {
    test("should delete endpoints by API ID", async () => {
      await db.deleteEndpointsByAPIId(testApiId);
      const endpoints = await db.getEndpointsByAPIId(testApiId);

      expect(endpoints.length).toBe(0);
    });

    test("should delete an API listing", async () => {
      await db.deleteAPIListing(testApiId);
      const listing = await db.getAPIListing(testApiId);

      expect(listing).toBeNull();
    });

    test("should throw error when deleting non-existent listing", async () => {
      await expect(db.deleteAPIListing("00000000-0000-0000-0000-000000000000")).rejects.toThrow(
        "API listing not found",
      );
    });
  });
});
