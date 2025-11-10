import fetch from "node-fetch";

const BASE_URL = "http://localhost:4021";
const TEST_LISTING = {
  name: "Test API",
  description: "A test API for database integration",
  base_url: "https://api.test.com",
  price_per_call: "100",
  category: "Testing",
  owner: "test_wallet_address",
  source: "test",
};

async function testApiEndpoints() {
  try {
    // Create API listing
    console.log("\nCreating API listing...");
    const createRes = await fetch(`${BASE_URL}/listings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(TEST_LISTING),
    });
    const createData = await createRes.json();
    console.log("Created:", createData);

    const listingId = createData.data.id;

    // Get all listings
    console.log("\nFetching all listings...");
    const allRes = await fetch(`${BASE_URL}/listings`);
    const allData = await allRes.json();
    console.log("All listings:", allData);

    // Get listing by ID
    console.log("\nFetching listing by ID...");
    const getRes = await fetch(`${BASE_URL}/listings/${listingId}`);
    const getData = await getRes.json();
    console.log("Single listing:", getData);

    // Get listings by owner
    console.log("\nFetching listings by owner...");
    const ownerRes = await fetch(`${BASE_URL}/listings/owner/${TEST_LISTING.owner}`);
    const ownerData = await ownerRes.json();
    console.log("Owner listings:", ownerData);

    // Record API usage
    console.log("\nRecording API usage...");
    const usageRes = await fetch(`${BASE_URL}/listings/${listingId}/usage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_address: "test_user_address",
        success: true,
        cost: "100",
      }),
    });
    const usageData = await usageRes.json();
    console.log("Usage recorded:", usageData);

    // Update API listing
    console.log("\nUpdating API listing...");
    const updateRes = await fetch(`${BASE_URL}/listings/${listingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner: TEST_LISTING.owner,
        description: "Updated test description",
      }),
    });
    const updateData = await updateRes.json();
    console.log("Updated:", updateData);

    // Delete API listing
    console.log("\nDeleting API listing...");
    const deleteRes = await fetch(`${BASE_URL}/listings/${listingId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner: TEST_LISTING.owner }),
    });
    const deleteData = await deleteRes.json();
    console.log("Deleted:", deleteData);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the tests
testApiEndpoints();
