import { Router } from "express";
import { DatabaseService } from "./db/service.ts";
import {
  parseOpenAPISpec,
  parseYAMLSpec,
  parseDocumentationURL,
  type ParsedEndpoint,
} from "./db/parsers/index";
import type { APIEndpoint } from "./db/schema";

const router = Router();
const db = new DatabaseService();

/**
 * Converts parsed endpoints to database format
 *
 * @param endpoints - Array of parsed endpoints
 * @returns Array of endpoints in database format
 */
function convertEndpointsToDBFormat(
  endpoints: ParsedEndpoint[],
): Omit<APIEndpoint, "id" | "api_id" | "created_at">[] {
  return endpoints.map(endpoint => ({
    path: endpoint.path,
    method: endpoint.method,
    summary: endpoint.summary,
    description: endpoint.description,
    parameters: endpoint.parameters as unknown as Record<string, unknown>,
    request_body: endpoint.request_body as unknown as Record<string, unknown>,
    responses: endpoint.responses,
  }));
}

// ==================== API Listing Routes ====================

// Get all API listings
router.get("/listings", async (req, res) => {
  try {
    const listings = await db.getAllAPIListings();
    res.json({ success: true, data: listings });
  } catch (error) {
    console.error("Error fetching API listings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch API listings",
    });
  }
});

// Get API listing by ID
router.get("/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await db.getAPIListing(id);

    if (!listing) {
      return res.status(404).json({ success: false, error: "API listing not found" });
    }

    res.json({ success: true, data: listing });
  } catch (error) {
    console.error("Error fetching API listing:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch API listing",
    });
  }
});

// Create new API listing
router.post("/listings", async (req, res) => {
  try {
    // Convert camelCase to snake_case for database fields
    const {
      name,
      description,
      baseUrl: base_url,
      apiKey: api_key,
      pricePerCall: price_per_call,
      category,
      walletAddress: owner,
      source,
    } = req.body;

    // Log the received data for debugging
    console.log("Received form data:", req.body);

    // Validation
    if (!name || !base_url || !price_per_call || !owner) {
      console.log("Missing fields:", {
        name: !name,
        base_url: !base_url,
        price_per_call: !price_per_call,
        owner: !owner,
      });
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, baseUrl, pricePerCall, walletAddress",
      });
    }

    const newListing = {
      name,
      description: description || "",
      base_url,
      api_key: api_key || null,
      price_per_call,
      category: category || "Uncategorized",
      source: source || "manual",
      owner,
      status: "active",
      total_calls: 0,
      revenue: "0",
    };

    const createdListing = await db.createAPIListing(newListing);

    res.status(201).json({
      success: true,
      data: createdListing,
      message: "API listing created successfully",
    });
  } catch (error) {
    console.error("Error creating API listing:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create API listing",
    });
  }
});

// Update API listing
router.put("/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await db.getAPIListing(id);

    if (!listing) {
      return res.status(404).json({ success: false, error: "API listing not found" });
    }

    // Check ownership (in production, verify JWT token)
    if (listing.owner !== req.body.owner) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    const updatedListing = await db.updateAPIListing(id, {
      ...req.body,
      owner: listing.owner, // Prevent owner from being changed
    });

    res.json({
      success: true,
      data: updatedListing,
      message: "API listing updated successfully",
    });
  } catch (error) {
    console.error("Error updating API listing:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update API listing",
    });
  }
});

// Delete API listing
router.delete("/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await db.getAPIListing(id);

    if (!listing) {
      return res.status(404).json({ success: false, error: "API listing not found" });
    }

    // Check ownership (in production, verify JWT token)
    if (listing.owner !== req.body.owner) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    await db.deleteAPIListing(id);

    res.json({
      success: true,
      message: "API listing deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting API listing:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete API listing",
    });
  }
});

// Get listings by owner
router.get("/listings/owner/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const listings = await db.getAPIListingsByOwner(walletAddress);
    res.json({ success: true, data: listings });
  } catch (error) {
    console.error("Error fetching user listings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user listings",
    });
  }
});

// Record API usage
router.post("/listings/:id/usage", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_address, success, error, cost } = req.body;

    // Validation
    if (!user_address || typeof success !== "boolean" || !cost) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: user_address, success, cost",
      });
    }

    const usage = await db.recordAPIUsage({
      api_id: id,
      user_address,
      success,
      error: error || null,
      cost,
    });

    const stats = await db.getAPIUsageStats(id);

    res.json({
      success: true,
      data: { usage, stats },
      message: "API usage recorded successfully",
    });
  } catch (error) {
    console.error("Error recording API usage:", error);
    res.status(500).json({
      success: false,
      error: "Failed to record API usage",
    });
  }
});

// ==================== Spec Upload Routes ====================

// Upload and parse OpenAPI spec file
router.post("/listings/upload-spec", async (req, res) => {
  try {
    const { spec, fileType, walletAddress: owner } = req.body;

    if (!spec || !owner) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: spec, walletAddress",
      });
    }

    // Parse the spec based on file type
    let parseResult;
    if (fileType === "yaml" || fileType === "yml") {
      parseResult = await parseYAMLSpec(spec);
    } else {
      parseResult = await parseOpenAPISpec(spec);
    }

    if (!parseResult.success || !parseResult.data) {
      return res.status(400).json({
        success: false,
        error: parseResult.error || "Failed to parse API specification",
      });
    }

    const parsedData = parseResult.data;

    // Create API listing
    const newListing = {
      name: parsedData.name,
      description: parsedData.description,
      base_url: parsedData.base_url || "",
      api_key: null,
      price_per_call: req.body.pricePerCall || "100", // Default or from form
      category: parsedData.tags?.[0] || "Uncategorized",
      source: "spec_upload",
      owner,
      status: "active",
      total_calls: 0,
      revenue: "0",
    };

    const createdListing = await db.createAPIListing(newListing);

    // Create endpoints
    if (parsedData.endpoints && parsedData.endpoints.length > 0) {
      const dbEndpoints = convertEndpointsToDBFormat(parsedData.endpoints);
      await db.createEndpoints(createdListing.id, dbEndpoints);
    }

    res.status(201).json({
      success: true,
      data: {
        listing: createdListing,
        endpointsCount: parsedData.endpoints?.length || 0,
      },
      message: "API listing created successfully from specification",
    });
  } catch (error) {
    console.error("Error uploading API spec:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload API specification",
    });
  }
});

// Parse documentation URL
router.post("/listings/parse-url", async (req, res) => {
  try {
    const { url, walletAddress: owner } = req.body;

    if (!url || !owner) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: url, walletAddress",
      });
    }

    // Parse the documentation URL
    const parseResult = await parseDocumentationURL(url);

    if (!parseResult.success || !parseResult.data) {
      return res.status(400).json({
        success: false,
        error: parseResult.error || "Failed to parse documentation URL",
      });
    }

    const parsedData = parseResult.data;

    // Create API listing
    const newListing = {
      name: parsedData.name,
      description: parsedData.description,
      base_url: parsedData.base_url || "",
      api_key: null,
      price_per_call: req.body.pricePerCall || "100", // Default or from form
      category: parsedData.tags?.[0] || "Uncategorized",
      source: "url_import",
      owner,
      status: "active",
      total_calls: 0,
      revenue: "0",
    };

    const createdListing = await db.createAPIListing(newListing);

    // Create endpoints
    if (parsedData.endpoints && parsedData.endpoints.length > 0) {
      const dbEndpoints = convertEndpointsToDBFormat(parsedData.endpoints);
      await db.createEndpoints(createdListing.id, dbEndpoints);
    }

    res.status(201).json({
      success: true,
      data: {
        listing: createdListing,
        endpointsCount: parsedData.endpoints?.length || 0,
      },
      message: "API listing created successfully from documentation URL",
    });
  } catch (error) {
    console.error("Error parsing documentation URL:", error);
    res.status(500).json({
      success: false,
      error: "Failed to parse documentation URL",
    });
  }
});

// Get endpoints for an API listing
router.get("/listings/:id/endpoints", async (req, res) => {
  try {
    const { id } = req.params;
    const endpoints = await db.getEndpointsByAPIId(id);

    res.json({
      success: true,
      data: endpoints,
    });
  } catch (error) {
    console.error("Error fetching endpoints:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch endpoints",
    });
  }
});

export default router;
