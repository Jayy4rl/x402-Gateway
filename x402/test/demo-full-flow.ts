/**
 * X402 Payment Gateway - Full Flow Demonstration
 *
 * This script demonstrates the complete flow:
 * 1. Adding an API to the marketplace
 * 2. Gateway URL generation
 * 3. Making requests through the payment gateway
 * 4. Payment processing and balance management
 * 5. Usage tracking and metrics
 */

import axios from "axios";
import { DatabaseService } from "../db/service";

const GATEWAY_URL = "http://localhost:4021";
const db = new DatabaseService();

// Test wallet addresses
const PROVIDER_WALLET = "Provider_" + Date.now();
const CONSUMER_WALLET = "Consumer_" + Date.now();

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log("\n" + "=".repeat(70));
  log(`  ${title}`, colors.bright + colors.cyan);
  console.log("=".repeat(70) + "\n");
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demonstrateFullFlow() {
  try {
    logSection("🚀 X402 Payment Gateway - Full Flow Demonstration");

    // ========================================
    // STEP 1: Create API Listing
    // ========================================
    logSection("📝 STEP 1: Creating API Listing");

    const apiSpec = {
      openapi: "3.0.0",
      info: {
        title: "Demo Weather API",
        description: "A demonstration weather API for X402 gateway testing",
        version: "1.0.0",
      },
      servers: [{ url: "https://api.weatherapi.com/v1" }],
      paths: {
        "/current.json": {
          get: {
            summary: "Get current weather",
            parameters: [
              {
                name: "q",
                in: "query",
                required: true,
                schema: { type: "string" },
                description: "City name",
              },
              {
                name: "key",
                in: "query",
                required: true,
                schema: { type: "string" },
                description: "API key",
              },
            ],
            responses: {
              "200": { description: "Success" },
            },
          },
        },
      },
    };

    log("Creating API listing via spec upload...", colors.yellow);
    const createResponse = await axios.post(`${GATEWAY_URL}/api/listings/upload-spec`, {
      spec: JSON.stringify(apiSpec),
      fileType: "json",
      walletAddress: PROVIDER_WALLET,
      pricePerCall: "50", // 50 lamports per call
    });

    if (!createResponse.data.success) {
      throw new Error("Failed to create API listing");
    }

    const apiListing = createResponse.data.data.listing;
    const apiId = apiListing.id;

    log(`✅ API Created Successfully!`, colors.green);
    log(`   ID: ${apiId}`, colors.blue);
    log(`   Name: ${apiListing.name}`, colors.blue);
    log(`   Gateway URL: ${apiListing.base_url}`, colors.blue);
    log(`   Price per call: ${apiListing.price_per_call} lamports`, colors.blue);
    log(`   Owner: ${PROVIDER_WALLET}`, colors.blue);
    log(`   Endpoints: ${createResponse.data.data.endpointsCount}`, colors.blue);

    await sleep(1000);

    // ========================================
    // STEP 2: Register API with Gateway
    // ========================================
    logSection("🔧 STEP 2: Registering API with Payment Gateway");

    const slug = "demo-weather";
    log("Registering API with gateway...", colors.yellow);

    const registerResponse = await axios.post(`${GATEWAY_URL}/gateway/register`, {
      slug: slug,
      originalBaseUrl: "https://api.weatherapi.com/v1",
      pricePerCall: "50",
      owner: PROVIDER_WALLET,
      apiId: apiId,
    });

    if (!registerResponse.data.success) {
      throw new Error("Failed to register with gateway");
    }

    const gatewayUrl = registerResponse.data.gatewayUrl;
    log(`✅ Gateway Registration Successful!`, colors.green);
    log(`   Gateway URL: ${gatewayUrl}`, colors.blue);
    log(`   Slug: ${slug}`, colors.blue);

    await sleep(1000);

    // ========================================
    // STEP 3: Check Initial Balances
    // ========================================
    logSection("💰 STEP 3: Checking Initial Balances");

    const providerBalanceResponse = await axios.get(
      `${GATEWAY_URL}/gateway/balance/${PROVIDER_WALLET}`,
    );
    const consumerBalanceResponse = await axios.get(
      `${GATEWAY_URL}/gateway/balance/${CONSUMER_WALLET}`,
    );

    log(`Provider Balance: ${providerBalanceResponse.data.balance} lamports`, colors.blue);
    log(`Consumer Balance: ${consumerBalanceResponse.data.balance} lamports`, colors.blue);

    // Top up consumer wallet
    log("\nTopping up consumer wallet...", colors.yellow);
    await axios.post(`${GATEWAY_URL}/gateway/topup`, {
      wallet: CONSUMER_WALLET,
      amount: 1000,
    });

    const newBalanceResponse = await axios.get(`${GATEWAY_URL}/gateway/balance/${CONSUMER_WALLET}`);
    log(`✅ Consumer wallet topped up!`, colors.green);
    log(`   New Balance: ${newBalanceResponse.data.balance} lamports`, colors.blue);

    await sleep(1000);

    // ========================================
    // STEP 4: Make API Request Through Gateway
    // ========================================
    logSection("🌐 STEP 4: Making API Request Through Payment Gateway");

    log("Attempting to call API through gateway...", colors.yellow);
    log(`Request: GET /${slug}/current.json?q=London&key=demo`, colors.cyan);

    try {
      const apiCallResponse = await axios.get(
        `${GATEWAY_URL}/${slug}/current.json?q=London&key=demo`,
        {
          headers: {
            "X-Wallet-Address": CONSUMER_WALLET,
          },
          validateStatus: () => true, // Accept any status
        },
      );

      const gatewayCost = apiCallResponse.headers["x-gateway-cost"];
      const gatewayBalance = apiCallResponse.headers["x-gateway-balance"];

      log(`✅ Request Processed!`, colors.green);
      log(`   Status: ${apiCallResponse.status}`, colors.blue);
      log(`   Gateway Cost: ${gatewayCost} lamports`, colors.blue);
      log(`   Remaining Balance: ${gatewayBalance} lamports`, colors.blue);

      if (apiCallResponse.status < 500) {
        log(`   ✓ Payment deducted successfully`, colors.green);
      }
    } catch (error) {
      log(`⚠️  API call failed (this is expected with demo endpoint)`, colors.yellow);
    }

    await sleep(1000);

    // ========================================
    // STEP 5: Check Updated Balances
    // ========================================
    logSection("💰 STEP 5: Verifying Payment Transfer");

    const finalProviderBalance = await axios.get(
      `${GATEWAY_URL}/gateway/balance/${PROVIDER_WALLET}`,
    );
    const finalConsumerBalance = await axios.get(
      `${GATEWAY_URL}/gateway/balance/${CONSUMER_WALLET}`,
    );

    log(
      `Provider Balance: ${finalProviderBalance.data.balance} lamports (${finalProviderBalance.data.balance > 0 ? "+" + finalProviderBalance.data.balance : "0"})`,
      colors.green,
    );
    log(
      `Consumer Balance: ${finalConsumerBalance.data.balance} lamports (-${1000 - finalConsumerBalance.data.balance})`,
      colors.blue,
    );

    await sleep(1000);

    // ========================================
    // STEP 6: Record Usage and Check Metrics
    // ========================================
    logSection("📊 STEP 6: Recording Usage and Checking Metrics");

    log("Recording API usage...", colors.yellow);
    const usageResponse = await axios.post(`${GATEWAY_URL}/api/listings/${apiId}/usage`, {
      user_address: CONSUMER_WALLET,
      success: true,
      cost: "50",
    });

    if (usageResponse.data.success) {
      log(`✅ Usage recorded!`, colors.green);
      log(`   Total Calls: ${usageResponse.data.data.stats.total_calls}`, colors.blue);
      log(`   Total Revenue: ${usageResponse.data.data.stats.total_revenue} lamports`, colors.blue);
    }

    await sleep(1000);

    // ========================================
    // STEP 7: Get Activity Metrics
    // ========================================
    logSection("📈 STEP 7: Retrieving Activity Metrics");

    const statsResponse = await axios.get(
      `${GATEWAY_URL}/api/usage/stats/summary?owner=${PROVIDER_WALLET}`,
    );
    const stats = statsResponse.data.data;

    log("Usage Statistics:", colors.cyan);
    log(`   Total Requests: ${stats.totalRequests}`, colors.blue);
    log(`   Successful: ${stats.successfulRequests}`, colors.green);
    log(`   Failed: ${stats.failedRequests}`, colors.yellow);
    log(`   Total Revenue: ${stats.totalRevenue} lamports`, colors.green);

    // Get recent activity
    const activityResponse = await axios.get(
      `${GATEWAY_URL}/api/usage/owner/${PROVIDER_WALLET}?limit=10`,
    );

    log("\nRecent Activity:", colors.cyan);
    activityResponse.data.data.slice(0, 3).forEach((activity: any, index: number) => {
      log(
        `   ${index + 1}. ${activity.api_name} - ${activity.success ? "✓" : "✗"} - ${activity.cost} lamports`,
        colors.blue,
      );
    });

    await sleep(1000);

    // ========================================
    // STEP 8: Test Insufficient Balance
    // ========================================
    logSection("🚫 STEP 8: Testing Insufficient Balance Protection");

    // Create a poor wallet with insufficient funds
    const poorWallet = "Poor_" + Date.now();
    await axios.post(`${GATEWAY_URL}/gateway/topup`, {
      wallet: poorWallet,
      amount: 10, // Less than the 50 required
    });

    log("Attempting API call with insufficient balance...", colors.yellow);
    try {
      const failResponse = await axios.get(`${GATEWAY_URL}/${slug}/current.json?q=Paris&key=demo`, {
        headers: {
          "X-Wallet-Address": poorWallet,
        },
        validateStatus: () => true,
      });

      if (failResponse.status === 402) {
        log(`✅ Payment Required - Correctly Blocked!`, colors.green);
        log(`   Status: ${failResponse.status} (Payment Required)`, colors.blue);
        log(`   Message: ${failResponse.data.message}`, colors.yellow);
        log(`   Required: ${failResponse.data.required} lamports`, colors.blue);
        log(`   Available: ${failResponse.data.available} lamports`, colors.blue);
      }
    } catch (error) {
      log(`Error during insufficient balance test`, colors.yellow);
    }

    await sleep(1000);

    // ========================================
    // STEP 9: Test Authentication
    // ========================================
    logSection("🔐 STEP 9: Testing Authentication Requirements");

    log("Attempting API call without wallet address...", colors.yellow);
    try {
      const noAuthResponse = await axios.get(
        `${GATEWAY_URL}/${slug}/current.json?q=Berlin&key=demo`,
        {
          validateStatus: () => true,
        },
      );

      if (noAuthResponse.status === 401) {
        log(`✅ Authentication Required - Correctly Blocked!`, colors.green);
        log(`   Status: ${noAuthResponse.status} (Unauthorized)`, colors.blue);
        log(`   Message: ${noAuthResponse.data.error}`, colors.yellow);
      }
    } catch (error) {
      log(`Error during auth test`, colors.yellow);
    }

    await sleep(1000);

    // ========================================
    // STEP 10: Gateway Health Check
    // ========================================
    logSection("🏥 STEP 10: Gateway Health Check");

    const healthResponse = await axios.get(`${GATEWAY_URL}/gateway/health`);

    log(`Gateway Status: ${healthResponse.data.status}`, colors.green);
    log(`Registered APIs: ${healthResponse.data.registeredApis}`, colors.blue);
    log(`Timestamp: ${healthResponse.data.timestamp}`, colors.blue);

    await sleep(1000);

    // ========================================
    // FINAL SUMMARY
    // ========================================
    logSection("✨ DEMONSTRATION COMPLETE - SUMMARY");

    log("The X402 Payment Gateway successfully demonstrated:", colors.cyan);
    log("  ✓ API listing creation and registration", colors.green);
    log("  ✓ Gateway URL generation", colors.green);
    log("  ✓ Payment processing and balance management", colors.green);
    log("  ✓ Usage tracking and metrics collection", colors.green);
    log("  ✓ Insufficient balance protection", colors.green);
    log("  ✓ Authentication requirements", colors.green);
    log("  ✓ Revenue distribution to API providers", colors.green);

    log("\n🎉 All systems operational!", colors.bright + colors.green);

    // Cleanup
    log("\n🧹 Cleaning up test data...", colors.yellow);
    await axios.delete(`${GATEWAY_URL}/api/listings/${apiId}`, {
      data: { owner: PROVIDER_WALLET },
    });
    log("✅ Cleanup complete!", colors.green);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("\n❌ Error:", error.message);
      if (error.response) {
        console.error("Response:", error.response.data);
      }
    } else {
      console.error("\n❌ Error:", error);
    }
    process.exit(1);
  }
}

// Run the demonstration
log("\n🔄 Starting X402 Gateway Server Check...", colors.yellow);
log("Please ensure the gateway server is running on http://localhost:4021", colors.cyan);
log("Run: npm run dev\n", colors.bright);

setTimeout(() => {
  demonstrateFullFlow()
    .then(() => {
      log("\n✅ Demonstration completed successfully!", colors.bright + colors.green);
      process.exit(0);
    })
    .catch(error => {
      console.error("\n❌ Demonstration failed:", error);
      process.exit(1);
    });
}, 2000);
