import { Router } from "express";
import axios from "axios";

const router = Router();

// In-memory storage (replace with database in production)
// TODO: Replace with MongoDB, PostgreSQL, or other database
const apiListings = new Map<string, any>();

// GitHub OAuth Configuration
// TODO: Create a GitHub OAuth App and replace these values
// https://github.com/settings/developers -> New OAuth App
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "YOUR_GITHUB_CLIENT_ID";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "YOUR_GITHUB_CLIENT_SECRET";
const GITHUB_REDIRECT_URI =
  process.env.GITHUB_REDIRECT_URI || "http://localhost:5174/api/auth/github/callback";

// ==================== API Listing Routes ====================

// Get all API listings
router.get("/listings", (req, res) => {
  const listings = Array.from(apiListings.values());
  res.json({ success: true, data: listings });
});

// Get API listing by ID
router.get("/listings/:id", (req, res) => {
  const { id } = req.params;
  const listing = apiListings.get(id);

  if (!listing) {
    return res.status(404).json({ success: false, error: "API listing not found" });
  }

  res.json({ success: true, data: listing });
});

// Create new API listing
router.post("/listings", (req, res) => {
  try {
    const {
      name,
      description,
      baseUrl,
      apiKey,
      pricePerCall,
      category,
      owner,
      source,
      githubRepo,
    } = req.body;

    // Validation
    if (!name || !baseUrl || !pricePerCall || !owner) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, baseUrl, pricePerCall, owner",
      });
    }

    // Generate unique ID
    const id = `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newListing = {
      id,
      name,
      description: description || "",
      baseUrl,
      apiKey: apiKey || null,
      pricePerCall,
      category: category || "Uncategorized",
      tags: [],
      status: "active",
      source: source || "manual",
      githubRepo: githubRepo || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner,
      totalCalls: 0,
      revenue: "0 sats",
    };

    apiListings.set(id, newListing);

    res.status(201).json({
      success: true,
      data: newListing,
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
router.put("/listings/:id", (req, res) => {
  try {
    const { id } = req.params;
    const listing = apiListings.get(id);

    if (!listing) {
      return res.status(404).json({ success: false, error: "API listing not found" });
    }

    // Check ownership (in production, verify JWT token)
    if (listing.owner !== req.body.owner) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    const updatedListing = {
      ...listing,
      ...req.body,
      id, // Prevent ID from being changed
      owner: listing.owner, // Prevent owner from being changed
      updatedAt: new Date().toISOString(),
    };

    apiListings.set(id, updatedListing);

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
router.delete("/listings/:id", (req, res) => {
  try {
    const { id } = req.params;
    const listing = apiListings.get(id);

    if (!listing) {
      return res.status(404).json({ success: false, error: "API listing not found" });
    }

    // Check ownership (in production, verify JWT token)
    if (listing.owner !== req.body.owner) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    apiListings.delete(id);

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
router.get("/listings/owner/:walletAddress", (req, res) => {
  const { walletAddress } = req.params;
  const userListings = Array.from(apiListings.values()).filter(
    listing => listing.owner === walletAddress,
  );

  res.json({ success: true, data: userListings });
});

// ==================== GitHub OAuth Routes ====================

// Initiate GitHub OAuth flow
router.get("/auth/github", (req, res) => {
  const state = Math.random().toString(36).substring(7);
  const scope = "repo,user:email"; // Request repo and email access

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=${scope}&state=${state}`;

  res.json({
    success: true,
    authUrl: githubAuthUrl,
    state,
  });
});

// GitHub OAuth callback
router.get("/auth/github/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: "No code provided",
    });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_REDIRECT_URI,
      },
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      throw new Error("No access token received");
    }

    // Redirect back to frontend with token
    res.redirect(`http://localhost:5174/api-marketplace?github_token=${access_token}`);
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to authenticate with GitHub",
    });
  }
});

// Get GitHub user repositories
router.get("/github/repos", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "GitHub token required",
    });
  }

  try {
    // Get user's repositories
    const reposResponse = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
      params: {
        sort: "updated",
        per_page: 100,
      },
    });

    res.json({
      success: true,
      data: reposResponse.data,
    });
  } catch (error) {
    console.error("Error fetching GitHub repos:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch GitHub repositories",
    });
  }
});

// Get GitHub user info
router.get("/github/user", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "GitHub token required",
    });
  }

  try {
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    res.json({
      success: true,
      data: userResponse.data,
    });
  } catch (error) {
    console.error("Error fetching GitHub user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch GitHub user info",
    });
  }
});

export default router;
