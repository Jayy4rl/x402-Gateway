import { config } from "dotenv";

// Load environment variables
config();

// Set test environment
process.env.NODE_ENV = "test";

// Global test setup (no need to declare jest.setTimeout in setup file)
