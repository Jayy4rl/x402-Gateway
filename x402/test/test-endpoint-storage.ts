import fetch from "node-fetch";
import { sampleOpenAPISpec, sampleYAMLSpec } from "./sample-specs";

const BASE_URL = "http://localhost:4021/api";
const TEST_WALLET = "test_wallet_" + Date.now();

async function testEndpointStorage() {
  console.log("🧪 Testing Endpoint Storage Implementation\n");

  try {
    // Test 1: Upload OpenAPI Spec (JSON)
    console.log("Test 1: Upload OpenAPI JSON Spec");
    console.log("=====================================");
    const specUploadRes = await fetch(`${BASE_URL}/listings/upload-spec`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spec: JSON.stringify(sampleOpenAPISpec),
        fileType: "json",
        walletAddress: TEST_WALLET,
        pricePerCall: "150",
      }),
    });
    const specUploadData = await specUploadRes.json();
    console.log("✅ Status:", specUploadRes.status);
    console.log("✅ Response:", JSON.stringify(specUploadData, null, 2));
    console.log("");

    if (!specUploadData.success) {
      throw new Error("Spec upload failed: " + specUploadData.error);
    }

    const apiId1 = specUploadData.data.listing.id;
    console.log(`📝 Created API ID: ${apiId1}`);
    console.log(`📊 Endpoints created: ${specUploadData.data.endpointsCount}\n`);

    // Test 2: Get endpoints for the created API
    console.log("Test 2: Get Endpoints for API");
    console.log("==============================");
    const endpointsRes = await fetch(`${BASE_URL}/listings/${apiId1}/endpoints`);
    const endpointsData = await endpointsRes.json();
    console.log("✅ Status:", endpointsRes.status);
    console.log("✅ Endpoints found:", endpointsData.data.length);
    endpointsData.data.forEach((endpoint: Record<string, unknown>, index: number) => {
      console.log(`  ${index + 1}. ${endpoint.method} ${endpoint.path}`);
      if (endpoint.summary) {
        console.log(`     Summary: ${endpoint.summary}`);
      }
    });
    console.log("");

    // Test 3: Upload YAML Spec
    console.log("Test 3: Upload YAML Spec");
    console.log("========================");
    const yamlUploadRes = await fetch(`${BASE_URL}/listings/upload-spec`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spec: sampleYAMLSpec,
        fileType: "yaml",
        walletAddress: TEST_WALLET,
        pricePerCall: "200",
      }),
    });
    const yamlUploadData = await yamlUploadRes.json();
    console.log("✅ Status:", yamlUploadRes.status);
    console.log("✅ Response:", JSON.stringify(yamlUploadData, null, 2));
    console.log("");

    // Test 4: Parse Public Swagger URL
    console.log("Test 4: Parse Public Swagger URL");
    console.log("=================================");
    const urlParseRes = await fetch(`${BASE_URL}/listings/parse-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: "https://petstore.swagger.io/v2/swagger.json",
        walletAddress: TEST_WALLET,
        pricePerCall: "100",
      }),
    });
    const urlParseData = await urlParseRes.json();
    console.log("✅ Status:", urlParseRes.status);
    if (urlParseData.success) {
      console.log("✅ API Name:", urlParseData.data.listing.name);
      console.log("✅ Endpoints created:", urlParseData.data.endpointsCount);
    } else {
      console.log("⚠️  Error:", urlParseData.error);
    }
    console.log("");

    // Test 5: Get all listings by owner
    console.log("Test 5: Get Listings by Owner");
    console.log("==============================");
    const ownerListingsRes = await fetch(`${BASE_URL}/listings/owner/${TEST_WALLET}`);
    const ownerListingsData = await ownerListingsRes.json();
    console.log("✅ Status:", ownerListingsRes.status);
    console.log("✅ Total listings:", ownerListingsData.data.length);
    ownerListingsData.data.forEach((listing: Record<string, unknown>, index: number) => {
      console.log(`  ${index + 1}. ${listing.name} (${listing.source})`);
    });
    console.log("");

    // Test 6: Verify database integrity
    console.log("Test 6: Verify Database Integrity");
    console.log("==================================");
    const allListingsRes = await fetch(`${BASE_URL}/listings`);
    const allListingsData = await allListingsRes.json();
    console.log("✅ Total listings in DB:", allListingsData.data.length);

    // Count total endpoints
    let totalEndpoints = 0;
    for (const listing of allListingsData.data) {
      const epRes = await fetch(`${BASE_URL}/listings/${listing.id}/endpoints`);
      const epData = await epRes.json();
      totalEndpoints += epData.data.length;
    }
    console.log("✅ Total endpoints in DB:", totalEndpoints);
    console.log("");

    console.log("🎉 All tests completed successfully!\n");
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

// Run tests
console.log("\n" + "=".repeat(60));
console.log("  ENDPOINT STORAGE & PARSING TEST SUITE");
console.log("=".repeat(60) + "\n");

testEndpointStorage()
  .then(() => {
    console.log("✅ Test suite completed");
    process.exit(0);
  })
  .catch(error => {
    console.error("❌ Test suite failed:", error);
    process.exit(1);
  });
