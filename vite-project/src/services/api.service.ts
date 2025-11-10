import type { APIListing, AddAPIFormData, GitHubRepo, GitHubUser } from '../types/marketplace.types';

const API_BASE_URL = 'http://localhost:4021/api';

// ==================== API Listing Services ====================

export const apiService = {
  // Get all API listings
  async getAllListings(): Promise<APIListing[]> {
    const response = await fetch(`${API_BASE_URL}/listings`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch listings');
    return data.data;
  },

  // Get API listing by ID
  async getListingById(id: string): Promise<APIListing> {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch listing');
    return data.data;
  },

  // Create new API listing
  async createListing(listingData: AddAPIFormData & { owner: string; source?: string; githubRepo?: string }): Promise<APIListing> {
    const response = await fetch(`${API_BASE_URL}/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listingData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to create listing');
    return data.data;
  },

  // Update API listing
  async updateListing(id: string, updates: Partial<APIListing>): Promise<APIListing> {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to update listing');
    return data.data;
  },

  // Delete API listing
  async deleteListing(id: string, owner: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ owner }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to delete listing');
  },

  // Get listings by owner
  async getListingsByOwner(walletAddress: string): Promise<APIListing[]> {
    const response = await fetch(`${API_BASE_URL}/listings/owner/${walletAddress}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch user listings');
    return data.data;
  },

  // Upload OpenAPI/Swagger spec
  async uploadSpec(spec: string, fileType: 'json' | 'yaml' | 'yml', walletAddress: string, pricePerCall: string): Promise<{ listing: APIListing; endpointsCount: number }> {
    const response = await fetch(`${API_BASE_URL}/listings/upload-spec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spec,
        fileType,
        walletAddress,
        pricePerCall,
      }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to upload spec');
    return data.data;
  },

  // Parse documentation URL
  async parseDocumentationUrl(url: string, walletAddress: string, pricePerCall: string): Promise<{ listing: APIListing; endpointsCount: number }> {
    const response = await fetch(`${API_BASE_URL}/listings/parse-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        walletAddress,
        pricePerCall,
      }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to parse URL');
    return data.data;
  },

  // Get endpoints for an API
  async getEndpoints(apiId: string): Promise<unknown[]> {
    const response = await fetch(`${API_BASE_URL}/listings/${apiId}/endpoints`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch endpoints');
    return data.data;
  },
};

// ==================== GitHub OAuth Services ====================

export const githubService = {
  // Initiate GitHub OAuth flow
  async initiateOAuth(): Promise<{ authUrl: string; state: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/github`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to initiate GitHub OAuth');
    return data;
  },

  // Get user's GitHub repositories
  async getUserRepositories(token: string): Promise<GitHubRepo[]> {
    const response = await fetch(`${API_BASE_URL}/github/repos?token=${token}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch repositories');
    return data.data;
  },

  // Get GitHub user info
  async getUserInfo(token: string): Promise<GitHubUser> {
    const response = await fetch(`${API_BASE_URL}/github/user?token=${token}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch user info');
    return data.data;
  },
};
