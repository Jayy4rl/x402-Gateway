/**
 * Script to simulate API usage for testing the Activity page
 * Run this to populate the database with sample usage data
 */

import fetch from "node-fetch";
import { config } from "dotenv";

config();

const BASE_URL = "http://localhost:4021/api";

// Sample data
const TEST_USERS = [
  "DtupYWBhjHYaarQ64Ujr9Qrv1v9uURcLHh659bSscz9E",
  "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
  "7K3pBQVqQBuYDuGUFKhMqvJFr4VjKvKpW8pKYwB1qCqF",
];

const API_COSTS = ["0.001", "0.002", "0.005", "0.01"];

async function createTestAPI() {
  console.log("Creating test API...");

  const response = await fetch(`${BASE_URL}/listings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test Weather API",
      description: "A test API for simulating usage",
      base_url: "https://api.weather.test.com",
      price_per_call: "0.002",
      category: "Weather",
      owner: TEST_USERS[0],
      source: "manual",
    }),
  });

  const data = await response.json();

  if (!data.success) {
    // API might already exist, try to get existing ones
    const listingsResponse = await fetch(`${BASE_URL}/listings`);
    const listingsData = await listingsResponse.json();

    if (listingsData.success && listingsData.data.length > 0) {
      console.log("Using existing API:", listingsData.data[0].name);
      return listingsData.data[0].id;
    }

    throw new Error(data.error || "Failed to create/find API");
  }

  console.log("Created API:", data.data.name, "ID:", data.data.id);
  return data.data.id;
}

async function simulateUsage(apiId: string, count: number = 20) {
  console.log(`\nSimulating ${count} API calls...`);

  const successRate = 0.95; // 95% success rate

  for (let i = 0; i < count; i++) {
    const userAddress = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
    const cost = API_COSTS[Math.floor(Math.random() * API_COSTS.length)];
    const success = Math.random() < successRate;

    const usageData = {
      user_address: userAddress,
      success,
      error: success ? null : "Request timeout",
      cost,
    };

    try {
      const response = await fetch(`${BASE_URL}/listings/${apiId}/usage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usageData),
      });

      const data = await response.json();

      if (data.success) {
        console.log(
          `✓ Call ${i + 1}/${count} - ${success ? "SUCCESS" : "FAILED"} - $${cost} - User: ${userAddress.slice(0, 8)}...`,
        );
      } else {
        console.error(`✗ Failed to record usage:`, data.error);
      }
    } catch (error) {
      console.error(`✗ Error recording usage:`, error);
    }

    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function main() {
  try {
    console.log("Starting usage simulation...\n");

    // Create or get test API
    const apiId = await createTestAPI();

    // Simulate some usage
    await simulateUsage(apiId, 30);

    console.log("\n✅ Simulation complete!");
    console.log("\nYou can now view the activity in the Activity page.");
  } catch (error) {
    console.error("❌ Simulation failed:", error);
    process.exit(1);
  }
}

main();
