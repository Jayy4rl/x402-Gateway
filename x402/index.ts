import { config } from "dotenv";
import express from "express";
import cors from "cors";
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
    } catch (error) {
      console.warn(`Skipping listing ${listing.id} - invalid URL: ${listing.base_url}`);
    }
  });

  return routesConfig;
};

// Initialize database and start server
initializeDatabase()
  .then(async () => {
    console.log("Database initialized successfully");

    // API Routes
    app.use("/api", apiRoutes);

    // Configure payment middleware with initial routes
    const initialRoutes = await getRoutesConfig();
    app.use(paymentMiddleware(payTo, initialRoutes, { url: facilitatorUrl }));

    // Start server
    app.listen(PORT, () => {
      console.log(`Server listening at http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });
