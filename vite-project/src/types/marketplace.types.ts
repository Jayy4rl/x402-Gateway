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
}

export interface GitHubAuthResponse {
  access_token: string;
  token_type: string;
  scope: string;
}
