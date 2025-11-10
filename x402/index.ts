import { config } from "dotenv";
import express from "express";
import cors from "cors";
import axios from "axios";
import { paymentMiddleware, type SolanaAddress } from "x402-express";
import apiRoutes from "./routes.ts";
import { initializeDatabase } from "./db/init.ts";
import { DatabaseService } from "./db/service.ts";

config();

const PORT = process.env.PORT || 4021;
const facilitatorUrl = process.env.FACILITATOR_URL as `${string}://${string}`;
const payTo = process.env.ADDRESS as SolanaAddress;

if (!facilitatorUrl || !payTo) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const app = express();
const db = new DatabaseService();

// ============================================================
// GATEWAY STORAGE (In-memory for development)
// ============================================================
const apiRegistry: Record<
  string,
  {
    slug: string;
    originalBaseUrl: string;
    pricePerCall: number;
    owner: string;
    apiId: string;
  }
> = {};

const userBalances: Record<string, number> = {
  // Demo wallet with initial balance for testing
  DtupYWBhjHYaarQ64Ujr9Qrv1v9uURcLHh659bSscz9E: 100,
};

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5174", "http://localhost:5173"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

interface RouteConfig {
  price: string;
  network: "solana-devnet";
  payTo: string;
}

// Get routes configuration from API listings
const getRoutesConfig = async (): Promise<Record<string, RouteConfig>> => {
  const routesConfig: Record<string, RouteConfig> = {};
  const listings = await db.getAllAPIListings();

  listings.forEach(listing => {
    // Skip if base_url is empty or invalid
    if (!listing.base_url || listing.base_url.trim() === "") {
      console.warn(`Skipping listing ${listing.id} - empty base_url`);
      return;
    }

    try {
      // Extract the path from the gateway URL
      const urlPath = new URL(listing.base_url).pathname;
      const route = `*${urlPath}/*`;

      routesConfig[route] = {
        price: listing.price_per_call,
        network: "solana-devnet",
        payTo: listing.owner,
      };
    } catch {
      console.warn(`Skipping listing ${listing.id} - invalid URL: ${listing.base_url}`);
    }
  });

  return routesConfig;
};

// ============================================================
// GATEWAY ROUTES (Payment Gateway Functionality)
// ============================================================

/**
 * Register API with gateway
 * Called automatically when a new API is listed
 */
app.post("/gateway/register", (req, res) => {
  try {
    const { slug, originalBaseUrl, pricePerCall, owner, apiId } = req.body;

    if (!slug || !originalBaseUrl || !pricePerCall || !owner || !apiId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    apiRegistry[slug] = {
      slug,
      originalBaseUrl,
      pricePerCall: parseFloat(pricePerCall),
      owner,
      apiId,
    };

    console.log(`✅ Gateway: Registered ${slug} → ${originalBaseUrl}`);

    res.json({
      success: true,
      gatewayUrl: `http://localhost:${PORT}/${slug}`,
      message: "API registered with gateway",
    });
  } catch (error) {
    console.error("Gateway registration error:", error);
    res.status(500).json({ error: "Failed to register API" });
  }
});

/**
 * Gateway health check
 */
app.get("/gateway/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    registeredApis: Object.keys(apiRegistry).length,
  });
});

/**
 * List registered APIs
 */
app.get("/gateway/apis", (req, res) => {
  res.json({
    apis: Object.values(apiRegistry),
    count: Object.keys(apiRegistry).length,
  });
});

/**
 * Check wallet balance
 */
app.get("/gateway/balance/:wallet", (req, res) => {
  const { wallet } = req.params;
  res.json({
    wallet,
    balance: userBalances[wallet] || 0,
  });
});

/**
 * Top up balance (for testing)
 */
app.post("/gateway/topup", (req, res) => {
  const { wallet, amount } = req.body;
  if (!wallet || !amount) {
    return res.status(400).json({ error: "Missing wallet or amount" });
  }

  userBalances[wallet] = (userBalances[wallet] || 0) + parseFloat(amount);

  res.json({
    success: true,
    wallet,
    newBalance: userBalances[wallet],
  });
});

// Initialize database and start server
initializeDatabase()
  .then(async () => {
    console.log("Database initialized successfully");

    // API Routes
    app.use("/api", apiRoutes);

    // Configure payment middleware with initial routes
    const initialRoutes = await getRoutesConfig();
    app.use(paymentMiddleware(payTo, initialRoutes, { url: facilitatorUrl }));

    // ============================================================
    // GATEWAY PROXY (Must be last - catch-all route)
    // ============================================================

    /**
     * Main gateway handler - Proxies API requests with payment
     * This must be LAST to avoid conflicting with other routes
     */
    app.all("/:slug/*", async (req, res) => {
      try {
        const { slug } = req.params;
        const restOfPath = (req.params as Record<string, string>)["0"] || "";
        const endpoint = "/" + restOfPath;

        // 1. Find API in registry
        const apiConfig = apiRegistry[slug];
        if (!apiConfig) {
          return res.status(404).json({
            error: "API not found",
            slug,
            hint: "Use /gateway/apis to see available APIs",
          });
        }

        // 2. Check authentication
        const userWallet = req.headers["x-wallet-address"] as string;
        if (!userWallet) {
          return res.status(401).json({
            error: "Authentication required",
            hint: "Include X-Wallet-Address header with your wallet address",
          });
        }

        // 3. Check balance
        const balance = userBalances[userWallet] || 0;
        const cost = apiConfig.pricePerCall;

        if (balance < cost) {
          return res.status(402).json({
            error: "Insufficient balance",
            required: cost,
            available: balance,
            message: `You need ${cost} USD but only have ${balance} USD`,
          });
        }

        // 4. Forward request to actual API
        const queryString = req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : "";
        const targetUrl = `${apiConfig.originalBaseUrl}${endpoint}${queryString}`;

        console.log(
          `🔄 [${slug}] ${req.method} ${endpoint} (cost: ${cost} USD, user: ${userWallet.substring(0, 8)}...)`,
        );

        try {
          const response = await axios({
            method: req.method,
            url: targetUrl,
            data: req.body,
            headers: {
              ...req.headers,
              host: new URL(apiConfig.originalBaseUrl).host,
              "x-wallet-address": undefined,
            },
            validateStatus: () => true,
          });

          // 5. Deduct payment on successful response
          if (response.status < 500) {
            userBalances[userWallet] -= cost;
            userBalances[apiConfig.owner] = (userBalances[apiConfig.owner] || 0) + cost;

            console.log(
              `💰 Payment: ${cost} USD | User: ${userBalances[userWallet].toFixed(2)} USD | Owner: +${cost} USD`,
            );
          }

          // 6. Add gateway metadata to response
          res.set("X-Gateway-Cost", cost.toString());
          res.set("X-Gateway-Balance", userBalances[userWallet]?.toString() || "0");
          res.set("X-Gateway-Api", slug);

          // 7. Return proxied response
          return res.status(response.status).json(response.data);
        } catch (apiError: unknown) {
          const errorMessage = apiError instanceof Error ? apiError.message : "Unknown error";
          console.error(`❌ API error for ${slug}:`, errorMessage);
          return res.status(503).json({
            error: "API unavailable",
            details: errorMessage,
          });
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Gateway proxy error:", errorMessage);
        return res.status(500).json({
          error: "Gateway error",
          message: errorMessage,
        });
      }
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║      🚀 API Marketplace + X402 Gateway Running        ║
║                                                        ║
║  URL: http://localhost:${PORT}                         ║
║                                                        ║
║  📊 Backend Routes:                                    ║
║     /api/listings        - CRUD API listings          ║
║     /api/endpoints       - Manage endpoints           ║
║                                                        ║
║  💳 Gateway Routes:                                    ║
║     /gateway/register    - Register API               ║
║     /gateway/apis        - List APIs                  ║
║     /gateway/balance/:w  - Check balance              ║
║     /gateway/topup       - Add balance (testing)      ║
║     /:slug/*            - Proxy API requests          ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
      `);
    });
  })
  .catch(error => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });
