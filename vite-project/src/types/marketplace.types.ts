// Marketplace API Types

export interface APIListing {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  apiKey?: string;
  pricePerCall: string; // e.g., "$0.001" or "100 sats"
  category?: string;
  tags?: string[];
  status: "active" | "inactive" | "pending";
  source: "github" | "manual";
  githubRepo?: string;
  createdAt: string;
  updatedAt: string;
  owner: string; // Wallet address of the owner
  totalCalls?: number;
  revenue?: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  created_at: string;
  updated_at: string;
  language: string | null;
  topics: string[];
  private: boolean;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  email: string | null;
}

export interface AddAPIFormData {
  name: string;
  baseUrl: string;
  description: string;
  apiKey?: string;
  pricePerCall: string;
  category?: string;
  walletAddress?: string; // owner's wallet provided in the form
  originalBaseUrl?: string; // keep original URL when we replace baseUrl with gateway URL
}

export interface GitHubAuthResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface APIEndpoint {
  id: string;
  api_id: string;
  path: string;
  method: string;
  summary?: string;
  description?: string;
  parameters?: Record<string, unknown>;
  request_body?: Record<string, unknown>;
  responses?: Record<string, unknown>;
  created_at: string;
}
