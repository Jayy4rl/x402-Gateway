import axios from "axios";
import { parseOpenAPISpec, parseYAMLSpec } from "./openapi-parser";
import type { ParsedAPIInfo, ParserResult } from "./types";

/**
 * Parses API documentation from a URL
 * Supports OpenAPI/Swagger JSON/YAML URLs
 *
 * @param url - The URL to the API documentation
 * @returns Parsed API information
 */
export async function parseDocumentationURL(url: string): Promise<ParserResult<ParsedAPIInfo>> {
  try {
    // Validate URL
    new URL(url); // Throws if invalid

    // Fetch the documentation
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        Accept: "application/json, application/yaml, text/yaml, text/plain",
      },
    });

    const content = response.data;
    const contentType = response.headers["content-type"] || "";

    // Determine the format and parse accordingly
    if (isJSONContent(contentType, url)) {
      return parseOpenAPISpec(typeof content === "string" ? content : JSON.stringify(content));
    } else if (isYAMLContent(contentType, url)) {
      return parseYAMLSpec(typeof content === "string" ? content : JSON.stringify(content));
    } else {
      // Try to parse as JSON first, then YAML
      try {
        return await parseOpenAPISpec(
          typeof content === "string" ? content : JSON.stringify(content),
        );
      } catch {
        return await parseYAMLSpec(typeof content === "string" ? content : JSON.stringify(content));
      }
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: `Failed to fetch documentation: ${error.message}`,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse documentation URL",
    };
  }
}

/**
 * Checks if content is JSON based on content-type or URL
 *
 * @param contentType - Content-Type header
 * @param url - The URL
 * @returns True if content is JSON
 */
function isJSONContent(contentType: string, url: string): boolean {
  return (
    contentType.includes("application/json") ||
    url.endsWith(".json") ||
    url.includes("swagger.json") ||
    url.includes("openapi.json")
  );
}

/**
 * Checks if content is YAML based on content-type or URL
 *
 * @param contentType - Content-Type header
 * @param url - The URL
 * @returns True if content is YAML
 */
function isYAMLContent(contentType: string, url: string): boolean {
  return (
    contentType.includes("yaml") ||
    contentType.includes("yml") ||
    url.endsWith(".yaml") ||
    url.endsWith(".yml") ||
    url.includes("swagger.yaml") ||
    url.includes("swagger.yml") ||
    url.includes("openapi.yaml") ||
    url.includes("openapi.yml")
  );
}
