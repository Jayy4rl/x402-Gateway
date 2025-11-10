import pool from "./pool.ts";
import type { APIListing, APIUsage, APIEndpoint } from "./schema.ts";

export class DatabaseService {
  /**
   * Creates a new API listing in the database
   *
   * @param listing - The API listing data to create
   * @returns The created API listing
   */
  async createAPIListing(
    listing: Omit<APIListing, "id" | "created_at" | "updated_at">,
  ): Promise<APIListing> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `INSERT INTO api_listings 
         (name, description, base_url, api_key, price_per_call, category, status, source, owner) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING *`,
        [
          listing.name,
          listing.description,
          listing.base_url,
          listing.api_key,
          listing.price_per_call,
          listing.category,
          "active",
          listing.source,
          listing.owner,
        ],
      );
      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Gets a single API listing by ID
   *
   * @param id - The ID of the API listing to retrieve
   * @returns The API listing if found, null otherwise
   */
  async getAPIListing(id: string): Promise<APIListing | null> {
    const result = await pool.query("SELECT * FROM api_listings WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  /**
   * Gets all API listings
   *
   * @returns Array of all API listings
   */
  async getAllAPIListings(): Promise<APIListing[]> {
    const result = await pool.query("SELECT * FROM api_listings ORDER BY created_at DESC");
    return result.rows;
  }

  /**
   * Gets all API listings for a specific owner
   *
   * @param owner - The address of the owner
   * @returns Array of API listings owned by the specified address
   */
  async getAPIListingsByOwner(owner: string): Promise<APIListing[]> {
    const result = await pool.query(
      "SELECT * FROM api_listings WHERE owner = $1 ORDER BY created_at DESC",
      [owner],
    );
    return result.rows;
  }

  /**
   * Checks if an API listing with the given name exists
   *
   * @param name - The name to check
   * @returns The API listing if found, null otherwise
   */
  async getAPIListingByName(name: string): Promise<APIListing | null> {
    const result = await pool.query("SELECT * FROM api_listings WHERE name = $1", [name]);
    return result.rows[0] || null;
  }

  /**
   * Generates a unique API name by appending numbers if duplicates exist
   *
   * @param baseName - The base name to make unique
   * @returns A unique name that doesn't exist in the database
   */
  async generateUniqueName(baseName: string): Promise<string> {
    let uniqueName = baseName;
    let counter = 2;

    // Keep checking until we find a unique name
    while (await this.getAPIListingByName(uniqueName)) {
      uniqueName = `${baseName}-${counter}`;
      counter++;
    }

    return uniqueName;
  }

  /**
   * Updates an API listing
   *
   * @param id - The ID of the API listing to update
   * @param updates - The partial API listing data to update
   * @returns The updated API listing
   */
  async updateAPIListing(id: string, updates: Partial<APIListing>): Promise<APIListing> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");
    const values = Object.values(updates);

    const result = await pool.query(
      `UPDATE api_listings 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id, ...values],
    );

    if (result.rows.length === 0) {
      throw new Error("API listing not found");
    }
    return result.rows[0];
  }

  /**
   * Deletes an API listing
   *
   * @param id - The ID of the API listing to delete
   */
  async deleteAPIListing(id: string): Promise<void> {
    const result = await pool.query("DELETE FROM api_listings WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      throw new Error("API listing not found");
    }
  }

  /**
   * Gets usage statistics for an API
   *
   * @param apiId - The ID of the API listing
   * @returns The usage statistics containing total calls and revenue
   */
  async getAPIUsageStats(apiId: string): Promise<{ total_calls: number; total_revenue: string }> {
    const result = await pool.query("SELECT total_calls, revenue FROM api_listings WHERE id = $1", [
      apiId,
    ]);

    if (result.rows.length === 0) {
      throw new Error("API listing not found");
    }

    return {
      total_calls: result.rows[0].total_calls,
      total_revenue: result.rows[0].revenue,
    };
  }

  /**
   * Records API usage and updates stats
   *
   * @param usage - The API usage data to record
   * @returns The recorded API usage entry
   */
  async recordAPIUsage(usage: Omit<APIUsage, "id" | "timestamp">): Promise<APIUsage> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Insert usage record
      const usageResult = await client.query(
        `INSERT INTO api_usage (api_id, user_address, success, error, cost)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [usage.api_id, usage.user_address, usage.success, usage.error, usage.cost],
      );

      // Update API listing stats
      await this.updateAPIStats(client, usage.api_id, usage.cost);

      await client.query("COMMIT");
      return usageResult.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== Endpoint Management ====================

  /**
   * Creates a new API endpoint
   *
   * @param endpoint - The endpoint data to create
   * @returns The created endpoint
   */
  async createEndpoint(endpoint: Omit<APIEndpoint, "id" | "created_at">): Promise<APIEndpoint> {
    const result = await pool.query(
      `INSERT INTO api_endpoints 
       (api_id, path, method, summary, description, parameters, request_body, responses) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        endpoint.api_id,
        endpoint.path,
        endpoint.method,
        endpoint.summary || null,
        endpoint.description || null,
        endpoint.parameters ? JSON.stringify(endpoint.parameters) : null,
        endpoint.request_body ? JSON.stringify(endpoint.request_body) : null,
        endpoint.responses ? JSON.stringify(endpoint.responses) : null,
      ],
    );
    return result.rows[0];
  }

  /**
   * Creates multiple endpoints for an API in a transaction
   *
   * @param apiId - The API listing ID
   * @param endpoints - Array of endpoints to create
   * @returns Array of created endpoints
   */
  async createEndpoints(
    apiId: string,
    endpoints: Omit<APIEndpoint, "id" | "api_id" | "created_at">[],
  ): Promise<APIEndpoint[]> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const createdEndpoints: APIEndpoint[] = [];
      for (const endpoint of endpoints) {
        const result = await client.query(
          `INSERT INTO api_endpoints 
           (api_id, path, method, summary, description, parameters, request_body, responses) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
           RETURNING *`,
          [
            apiId,
            endpoint.path,
            endpoint.method,
            endpoint.summary || null,
            endpoint.description || null,
            endpoint.parameters ? JSON.stringify(endpoint.parameters) : null,
            endpoint.request_body ? JSON.stringify(endpoint.request_body) : null,
            endpoint.responses ? JSON.stringify(endpoint.responses) : null,
          ],
        );
        createdEndpoints.push(result.rows[0]);
      }

      await client.query("COMMIT");
      return createdEndpoints;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Gets all endpoints for an API listing
   *
   * @param apiId - The API listing ID
   * @returns Array of endpoints
   */
  async getEndpointsByAPIId(apiId: string): Promise<APIEndpoint[]> {
    const result = await pool.query(
      "SELECT * FROM api_endpoints WHERE api_id = $1 ORDER BY path, method",
      [apiId],
    );
    return result.rows;
  }

  /**
   * Gets a specific endpoint by ID
   *
   * @param id - The endpoint ID
   * @returns The endpoint if found, null otherwise
   */
  async getEndpoint(id: string): Promise<APIEndpoint | null> {
    const result = await pool.query("SELECT * FROM api_endpoints WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  /**
   * Deletes all endpoints for an API listing
   *
   * @param apiId - The API listing ID
   */
  async deleteEndpointsByAPIId(apiId: string): Promise<void> {
    await pool.query("DELETE FROM api_endpoints WHERE api_id = $1", [apiId]);
  }

  /**
   * Updates an endpoint
   *
   * @param id - The endpoint ID
   * @param updates - The endpoint data to update
   * @returns The updated endpoint
   */
  async updateEndpoint(id: string, updates: Partial<APIEndpoint>): Promise<APIEndpoint> {
    const setClause = Object.keys(updates)
      .filter(key => key !== "id" && key !== "api_id" && key !== "created_at")
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");
    const values = Object.entries(updates)
      .filter(([key]) => key !== "id" && key !== "api_id" && key !== "created_at")
      .map(([, value]) => value);

    const result = await pool.query(
      `UPDATE api_endpoints SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values],
    );

    if (result.rows.length === 0) {
      throw new Error("Endpoint not found");
    }
    return result.rows[0];
  }

  /**
   * Updates API usage statistics
   *
   * @param client - The database client from pg pool
   * @param apiId - The ID of the API listing
   * @param cost - The cost of the API call
   */
  private async updateAPIStats(
    client: import("pg").PoolClient,
    apiId: string,
    cost: string,
  ): Promise<void> {
    await client.query(
      `UPDATE api_listings 
       SET total_calls = total_calls + 1,
           revenue = CAST(CAST(revenue AS NUMERIC) + CAST($2 AS NUMERIC) AS TEXT)
       WHERE id = $1`,
      [apiId, cost],
    );
  }
}

// Export singleton instance
export const dbService = new DatabaseService();
