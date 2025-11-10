/**
 * Parsed API information from various sources
 */
export interface ParsedAPIInfo {
  name: string;
  description: string;
  base_url: string;
  version?: string;
  endpoints: ParsedEndpoint[];
  tags?: string[];
}

/**
 * Parsed endpoint information
 */
export interface ParsedEndpoint {
  path: string;
  method: string;
  summary?: string;
  description?: string;
  parameters?: ParameterDefinition[];
  request_body?: RequestBodyDefinition;
  responses?: Record<string, ResponseDefinition>;
}

/**
 * Parameter definition from OpenAPI spec
 */
export interface ParameterDefinition {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  description?: string;
  required?: boolean;
  schema?: Record<string, unknown>;
}

/**
 * Request body definition
 */
export interface RequestBodyDefinition {
  description?: string;
  required?: boolean;
  content?: Record<string, unknown>;
}

/**
 * Response definition
 */
export interface ResponseDefinition {
  description: string;
  content?: Record<string, unknown>;
}

/**
 * Parser result with success/error handling
 */
export interface ParserResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
