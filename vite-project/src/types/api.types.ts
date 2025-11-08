// API Marketplace Types

export interface APIListing {
  id: string;
  name: string;
  baseUrl: string;
  description: string;
  apiKey?: string; // Optional, encrypted on backend
  pricePerCall: number; // In sats or USD
  currency: "sats" | "usd";
  category?: string;
  tags?: string[];
  owner: string; // Wallet address of owner
  createdAt: string;
  updatedAt: string;
  status: "active" | "inactive" | "pending";

  // GitHub integration (if imported from GitHub)
  githubRepo?: string;
  githubBranch?: string;
  isGithubImported?: boolean;

  // Usage statistics
  totalCalls?: number;
  totalRevenue?: number;

  // Additional metadata
  version?: string;
  documentation?: string;
  endpoints?: APIEndpoint[];
}

export interface APIEndpoint {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  description?: string;
  price?: number;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  language: string | null;
  default_branch: string;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  email: string | null;
}

export interface CreateAPIRequest {
  name: string;
  baseUrl: string;
  description: string;
  apiKey?: string;
  pricePerCall: number;
  currency: "sats" | "usd";
  category?: string;
  tags?: string[];

  // GitHub import data
  githubRepo?: string;
  githubBranch?: string;
  isGithubImported?: boolean;
}

export interface APIListingResponse {
  success: boolean;
  data?: APIListing;
  error?: string;
}

export interface APIListingsResponse {
  success: boolean;
  data?: APIListing[];
  error?: string;
}
