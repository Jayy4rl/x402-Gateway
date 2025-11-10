import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPIV3 } from "@apidevtools/swagger-parser";
import type { ParsedAPIInfo, ParsedEndpoint, ParserResult, ParameterDefinition } from "./types";

/**
 * Parses OpenAPI/Swagger specification files (JSON or YAML)
 *
 * @param fileContent - The content of the OpenAPI spec file as string
 * @returns Parsed API information with endpoints
 */
export async function parseOpenAPISpec(fileContent: string): Promise<ParserResult<ParsedAPIInfo>> {
  try {
    // Parse the OpenAPI specification
    const api = (await SwaggerParser.validate(JSON.parse(fileContent))) as OpenAPIV3.Document;

    // Extract basic API information
    const info: ParsedAPIInfo = {
      name: api.info.title,
      description: api.info.description || "",
      version: api.info.version,
      base_url: extractBaseUrl(api),
      endpoints: [],
      tags: extractTags(api),
    };

    // Extract endpoints from paths
    if (api.paths) {
      info.endpoints = extractEndpoints(api.paths);
    }

    return {
      success: true,
      data: info,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse OpenAPI spec",
    };
  }
}

/**
 * Parses YAML OpenAPI specification
 *
 * @param yamlContent - The YAML content as string
 * @returns Parsed API information
 */
export async function parseYAMLSpec(yamlContent: string): Promise<ParserResult<ParsedAPIInfo>> {
  try {
    const yaml = await import("js-yaml");
    const jsonContent = yaml.load(yamlContent);
    return parseOpenAPISpec(JSON.stringify(jsonContent));
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse YAML spec",
    };
  }
}

/**
 * Extracts base URL from OpenAPI servers
 *
 * @param api - OpenAPI document
 * @returns Base URL string
 */
function extractBaseUrl(api: OpenAPIV3.Document): string {
  if (api.servers && api.servers.length > 0) {
    return api.servers[0].url;
  }
  return "";
}

/**
 * Extracts tags from OpenAPI spec
 *
 * @param api - OpenAPI document
 * @returns Array of tag names
 */
function extractTags(api: OpenAPIV3.Document): string[] {
  if (api.tags) {
    return api.tags.map(tag => tag.name);
  }
  return [];
}

/**
 * Extracts endpoints from OpenAPI paths
 *
 * @param paths - OpenAPI paths object
 * @returns Array of parsed endpoints
 */
function extractEndpoints(paths: OpenAPIV3.PathsObject): ParsedEndpoint[] {
  const endpoints: ParsedEndpoint[] = [];

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem) continue;

    // Process each HTTP method
    const methods = ["get", "post", "put", "delete", "patch", "options", "head"] as const;

    for (const method of methods) {
      const operation = pathItem[method] as OpenAPIV3.OperationObject | undefined;
      if (!operation) continue;

      const endpoint: ParsedEndpoint = {
        path,
        method: method.toUpperCase(),
        summary: operation.summary,
        description: operation.description,
        parameters: extractParameters(operation.parameters),
        request_body: extractRequestBody(operation.requestBody),
        responses: extractResponses(operation.responses),
      };

      endpoints.push(endpoint);
    }
  }

  return endpoints;
}

/**
 * Extracts parameters from operation
 *
 * @param parameters - Array of parameter objects or references
 * @returns Array of parameter definitions
 */
function extractParameters(
  parameters?: (OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject)[],
): ParameterDefinition[] | undefined {
  if (!parameters) return undefined;

  return parameters
    .filter((param): param is OpenAPIV3.ParameterObject => !("$ref" in param))
    .map(param => ({
      name: param.name,
      in: param.in as "query" | "header" | "path" | "cookie",
      description: param.description,
      required: param.required,
      schema: param.schema as Record<string, unknown>,
    }));
}

/**
 * Extracts request body from operation
 *
 * @param requestBody - Request body object or reference
 * @returns Request body definition
 */
function extractRequestBody(
  requestBody?: OpenAPIV3.RequestBodyObject | OpenAPIV3.ReferenceObject,
): Record<string, unknown> | undefined {
  if (!requestBody || "$ref" in requestBody) return undefined;

  return {
    description: requestBody.description,
    required: requestBody.required,
    content: requestBody.content,
  };
}

/**
 * Extracts responses from operation
 *
 * @param responses - Responses object
 * @returns Response definitions
 */
function extractResponses(
  responses?: OpenAPIV3.ResponsesObject,
): Record<string, unknown> | undefined {
  if (!responses) return undefined;

  const extractedResponses: Record<string, unknown> = {};

  for (const [statusCode, response] of Object.entries(responses)) {
    if (!response || (typeof response === "object" && "$ref" in response)) continue;

    extractedResponses[statusCode] = {
      description: (response as OpenAPIV3.ResponseObject).description,
      content: (response as OpenAPIV3.ResponseObject).content,
    };
  }

  return extractedResponses;
}
