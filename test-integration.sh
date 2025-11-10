#!/bin/bash

# Integration Test Script for API Marketplace
# This script tests the complete flow of uploading specs and parsing URLs

set -e

BASE_URL="http://localhost:4021/api"
WALLET_ADDRESS="0x1234567890abcdef"
PRICE="100"

echo "========================================="
echo "API Marketplace Integration Test"
echo "========================================="
echo ""

# Test 1: Upload JSON OpenAPI Spec
echo "Test 1: Upload JSON OpenAPI Spec"
echo "---------------------------------"

PETSTORE_SPEC='{
  "openapi": "3.0.0",
  "info": {
    "title": "Pet Store API",
    "description": "A simple pet store API",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://petstore.example.com/api/v1"
    }
  ],
  "paths": {
    "/pets": {
      "get": {
        "summary": "List all pets",
        "operationId": "listPets",
        "parameters": [
          {
            "name": "limit",
            "in": "query",
            "description": "How many items to return",
            "required": false,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "A list of pets"
          }
        }
      },
      "post": {
        "summary": "Create a pet",
        "operationId": "createPet",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "species": { "type": "string" }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Pet created"
          }
        }
      }
    },
    "/pets/{petId}": {
      "get": {
        "summary": "Get a pet by ID",
        "operationId": "getPet",
        "parameters": [
          {
            "name": "petId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Pet details"
          }
        }
      }
    }
  }
}'

UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/listings/upload-spec" \
  -H "Content-Type: application/json" \
  -d "{
    \"spec\": $(echo "$PETSTORE_SPEC" | jq -c -R -s '.'),
    \"fileType\": \"json\",
    \"walletAddress\": \"$WALLET_ADDRESS\",
    \"pricePerCall\": \"$PRICE\"
  }")

echo "Response: $UPLOAD_RESPONSE"

if echo "$UPLOAD_RESPONSE" | jq -e '.success' > /dev/null; then
  API_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.data.listing.id')
  ENDPOINT_COUNT=$(echo "$UPLOAD_RESPONSE" | jq -r '.data.endpointsCount')
  echo "✅ SUCCESS: Created API with ID: $API_ID"
  echo "✅ Extracted $ENDPOINT_COUNT endpoints"
else
  echo "❌ FAILED: $(echo "$UPLOAD_RESPONSE" | jq -r '.error')"
  exit 1
fi

echo ""

# Test 2: Get endpoints for the created API
echo "Test 2: Get Endpoints for API"
echo "------------------------------"

ENDPOINTS_RESPONSE=$(curl -s "$BASE_URL/listings/$API_ID/endpoints")
echo "Response: $ENDPOINTS_RESPONSE"

if echo "$ENDPOINTS_RESPONSE" | jq -e '.success' > /dev/null; then
  FETCHED_ENDPOINTS=$(echo "$ENDPOINTS_RESPONSE" | jq -r '.data | length')
  echo "✅ SUCCESS: Retrieved $FETCHED_ENDPOINTS endpoints"
  echo ""
  echo "Endpoints:"
  echo "$ENDPOINTS_RESPONSE" | jq -r '.data[] | "  \(.method | ascii_upcase) \(.path) - \(.summary // "No summary")"'
else
  echo "❌ FAILED: $(echo "$ENDPOINTS_RESPONSE" | jq -r '.error')"
  exit 1
fi

echo ""

# Test 3: Parse Documentation URL
echo "Test 3: Parse Public Documentation URL"
echo "---------------------------------------"

URL_RESPONSE=$(curl -s -X POST "$BASE_URL/listings/parse-url" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"https://petstore.swagger.io/v2/swagger.json\",
    \"walletAddress\": \"$WALLET_ADDRESS\",
    \"pricePerCall\": \"$PRICE\"
  }")

echo "Response: $URL_RESPONSE"

if echo "$URL_RESPONSE" | jq -e '.success' > /dev/null; then
  URL_API_ID=$(echo "$URL_RESPONSE" | jq -r '.data.listing.id')
  URL_ENDPOINT_COUNT=$(echo "$URL_RESPONSE" | jq -r '.data.endpointsCount')
  echo "✅ SUCCESS: Created API with ID: $URL_API_ID"
  echo "✅ Extracted $URL_ENDPOINT_COUNT endpoints from URL"
else
  echo "❌ FAILED: $(echo "$URL_RESPONSE" | jq -r '.error')"
  exit 1
fi

echo ""

# Test 4: Get all listings
echo "Test 4: Get All Listings"
echo "------------------------"

ALL_LISTINGS=$(curl -s "$BASE_URL/listings")

if echo "$ALL_LISTINGS" | jq -e '.success' > /dev/null; then
  TOTAL_LISTINGS=$(echo "$ALL_LISTINGS" | jq -r '.data | length')
  echo "✅ SUCCESS: Retrieved $TOTAL_LISTINGS total listings"
  echo ""
  echo "Listings:"
  echo "$ALL_LISTINGS" | jq -r '.data[] | "  - \(.name) (\(.id))"'
else
  echo "❌ FAILED: $(echo "$ALL_LISTINGS" | jq -r '.error')"
  exit 1
fi

echo ""

# Test 5: Get listings by owner
echo "Test 5: Get Listings by Owner"
echo "------------------------------"

OWNER_LISTINGS=$(curl -s "$BASE_URL/listings/owner/$WALLET_ADDRESS")

if echo "$OWNER_LISTINGS" | jq -e '.success' > /dev/null; then
  OWNER_COUNT=$(echo "$OWNER_LISTINGS" | jq -r '.data | length')
  echo "✅ SUCCESS: Retrieved $OWNER_COUNT listings for owner"
else
  echo "❌ FAILED: $(echo "$OWNER_LISTINGS" | jq -r '.error')"
  exit 1
fi

echo ""
echo "========================================="
echo "✅ ALL TESTS PASSED!"
echo "========================================="
echo ""
echo "Summary:"
echo "  - Uploaded JSON spec: ✅"
echo "  - Retrieved endpoints: ✅"
echo "  - Parsed URL: ✅"
echo "  - Listed all APIs: ✅"
echo "  - Filtered by owner: ✅"
echo ""
echo "Integration complete! 🎉"
