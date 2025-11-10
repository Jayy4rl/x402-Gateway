/**
 * Simple Database Test Script
 * Tests database operations directly without Jest
 */

import { DatabaseService } from "../db/service";
import { initializeDatabase } from "../db/init";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function runDatabaseTests() {
  const db = new DatabaseService();
  const testWallet = "TestWallet_" + Date.now();
  let testApiId: string;
  let testEndpointId: string;
  let passedTests = 0;
  let failedTests = 0;

  console.log("\n" + "=".repeat(70));
  log("  🧪 Database Service Tests", colors.cyan);
  console.log("=".repeat(70) + "\n");

  try {
    // Initialize database
    log("Initializing database...", colors.yellow);
    await initializeDatabase();
    log("✓ Database initialized\n", colors.green);

    // Test 1: Create API Listing
    log("Test 1: Create API Listing", colors.cyan);
    try {
      const newListing = {
        name: "Test API " + Date.now(),
        description: "A test API for database testing",
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

      if (created && created.id && created.name === newListing.name) {
        log(`✓ PASSED - API listing created with ID: ${testApiId}`, colors.green);
        passedTests++;
      } else {
        throw new Error("Created listing data is invalid");
      }
    } catch (error) {
      log(`✗ FAILED - ${error}`, colors.red);
      failedTests++;
    }

    // Test 2: Get API Listing by ID
    log("\nTest 2: Get API Listing by ID", colors.cyan);
    try {
      const listing = await db.getAPIListing(testApiId);

      if (listing && listing.id === testApiId) {
        log(`✓ PASSED - Retrieved listing: ${listing.name}`, colors.green);
        passedTests++;
      } else {
        throw new Error("Failed to retrieve listing");
      }
    } catch (error) {
      log(`✗ FAILED - ${error}`, colors.red);
      failedTests++;
    }

    // Test 3: Get All API Listings
    log("\nTest 3: Get All API Listings", colors.cyan);
    try {
      const listings = await db.getAllAPIListings();

      if (Array.isArray(listings) && listings.length > 0) {
        log(`✓ PASSED - Retrieved ${listings.length} listings`, colors.green);
        passedTests++;
      } else {
        throw new Error("Failed to get listings array");
      }
    } catch (error) {
      log(`✗ FAILED - ${error}`, colors.red);
      failedTests++;
    }

    // Test 4: Get Listings by Owner
    log("\nTest 4: Get Listings by Owner", colors.cyan);
    try {
      const listings = await db.getAPIListingsByOwner(testWallet);

      if (Array.isArray(listings) && listings.some(l => l.id === testApiId)) {
        log(`✓ PASSED - Found ${listings.length} listing(s) for owner`, colors.green);
        passedTests++;
      } else {
        throw new Error("Owner listings not found");
      }
    } catch (error) {
      log(`✗ FAILED - ${error}`, colors.red);
      failedTests++;
    }

    // Test 5: Update API Listing
    log("\nTest 5: Update API Listing", colors.cyan);
    try {
      const updatedDescription = "Updated description " + Date.now();
      const updated = await db.updateAPIListing(testApiId, {
        description: updatedDescription,
      });

      if (updated && updated.description === updatedDescription) {
        log(`✓ PASSED - Listing updated successfully`, colors.green);
        passedTests++;
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      log(`✗ FAILED - ${error}`, colors.red);
      failedTests++;
    }

    // Test 6: Create Endpoint
    log("\nTest 6: Create Endpoint", colors.cyan);
    try {
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

      if (created && created.id && created.path === endpoint.path) {
        log(`✓ PASSED - Endpoint created with ID: ${testEndpointId}`, colors.green);
        passedTests++;
      } else {
        throw new Error("Endpoint creation failed");
      }
    } catch (error) {
      log(`✗ FAILED - ${error}`, colors.red);
      failedTests++;
    }

    // Test 7: Get Endpoints by API ID
    log("\nTest 7: Get Endpoints by API ID", colors.cyan);
    try {
      const endpoints = await db.getEndpointsByAPIId(testApiId);

      if (Array.isArray(endpoints) && endpoints.some(e => e.id === testEndpointId)) {
        log(`✓ PASSED - Retrieved ${endpoints.length} endpoint(s)`, colors.green);
        passedTests++;
      } else {
        throw new Error("Failed to get endpoints");
      }
    } catch (error) {
      log(`✗ FAILED - ${error}`, colors.red);
      failedTests++;
    }

    // Test 8: Record API Usage
    log("\nTest 8: Record API Usage", colors.cyan);
    try {
      const usage = {
        api_id: testApiId,
        user_address: testWallet,
        success: true,
        error: null,
        cost: "100",
      };

      const recorded = await db.recordAPIUsage(usage);

      if (recorded && recorded.id && recorded.api_id === testApiId) {
        log(`✓ PASSED - Usage recorded`, colors.green);
        passedTests++;
      } else {
        throw new Error("Usage recording failed");
      }
    } catch (error) {
      log(`✗ FAILED - ${error}`, colors.red);
      failedTests++;
    }

    // Test 9: Get API Usage Stats
    log("\nTest 9: Get API Usage Stats", colors.cyan);
    try {
      const stats = await db.getAPIUsageStats(testApiId);

      if (stats && stats.total_calls > 0) {
        log(
          `✓ PASSED - Stats: ${stats.total_calls} calls, ${stats.total_revenue} revenue`,
          colors.green,
        );
        passedTests++;
      } else {
        throw new Error("Stats retrieval failed");
      }
    } catch (error) {
      log(`✗ FAILED - ${error}`, colors.red);
      failedTests++;
    }

    // Test 10: Get Usage by API ID
    log("\nTest 10: Get Usage by API ID", colors.cyan);
    try {
      const usageData = await db.getUsageByAPIId(testApiId, 10);

      if (Array.isArray(usageData) && usageData.length > 0) {
        log(`✓ PASSED - Retrieved ${usageData.length} usage record(s)`, colors.green);
        passedTests++;
      } else {
        throw new Error("Usage data retrieval failed");
      }
    } catch (error) {
      log(`✗ FAILED - ${error}`, colors.red);
      failedTests++;
    }

    // Test 11: Get Usage Stats Summary
    log("\nTest 11: Get Usage Stats Summary", colors.cyan);
    try {
      const summary = await db.getUsageStatsSummary(testWallet);

      if (summary && typeof summary.totalRequests === "number") {
        log(
          `✓ PASSED - Summary: ${summary.totalRequests} requests, ${summary.totalRevenue} revenue`,
          colors.green,
        );
        passedTests++;
      } else {
        throw new Error("Summary retrieval failed");
      }
    } catch (error) {
      log(`✗ FAILED - ${error}`, colors.red);
      failedTests++;
    }

    // Cleanup Tests
    log("\n--- Cleanup Tests ---", colors.yellow);

    // Test 12: Delete Endpoints
    log("\nTest 12: Delete Endpoints by API ID", colors.cyan);
    try {
      await db.deleteEndpointsByAPIId(testApiId);
      const endpoints = await db.getEndpointsByAPIId(testApiId);

      if (endpoints.length === 0) {
        log(`✓ PASSED - Endpoints deleted`, colors.green);
        passedTests++;
      } else {
        throw new Error("Endpoints not deleted");
      }
    } catch (error) {
      log(`✗ FAILED - ${error}`, colors.red);
      failedTests++;
    }

    // Test 13: Delete API Listing
    log("\nTest 13: Delete API Listing", colors.cyan);
    try {
      // First delete usage records (foreign key constraint)
      await db.deleteAPIListing(testApiId);
      const listing = await db.getAPIListing(testApiId);

      if (!listing) {
        log(`✓ PASSED - API listing deleted (cascade deleted usage)`, colors.green);
        passedTests++;
      } else {
        throw new Error("API listing not deleted");
      }
    } catch (error) {
      log(`✗ FAILED - ${error}`, colors.red);
      failedTests++;
    }

    // Summary
    console.log("\n" + "=".repeat(70));
    log("  📊 Test Results Summary", colors.cyan);
    console.log("=".repeat(70));
    log(`\n  Total Tests: ${passedTests + failedTests}`, colors.cyan);
    log(`  Passed: ${passedTests}`, colors.green);
    log(`  Failed: ${failedTests}`, failedTests > 0 ? colors.red : colors.green);

    if (failedTests === 0) {
      log(`\n  ✨ All tests passed!`, colors.green);
    } else {
      log(`\n  ⚠️  Some tests failed`, colors.yellow);
    }
    console.log("\n" + "=".repeat(70) + "\n");

    process.exit(failedTests > 0 ? 1 : 0);
  } catch (error) {
    log(`\n❌ Fatal Error: ${error}`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runDatabaseTests();
