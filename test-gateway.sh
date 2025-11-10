#!/bin/bash

# X402 Gateway Test Script
# This script helps you test the payment gateway functionality

echo "════════════════════════════════════════════════════════"
echo "           X402 Gateway Testing Script"
echo "════════════════════════════════════════════════════════"
echo ""

# Configuration
GATEWAY_URL="http://localhost:4021"
BACKEND_URL="http://localhost:4021"
WALLET_ADDRESS="DtupYWBhjHYaarQ64Ujr9Qrv1v9uURcLHh659bSscz9E"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "📋 Test Configuration:"
echo "   Gateway URL: $GATEWAY_URL"
echo "   Backend URL: $BACKEND_URL"
echo "   Test Wallet: $WALLET_ADDRESS"
echo ""

# Test 1: Check if gateway is running
echo "${YELLOW}Test 1: Gateway Health Check${NC}"
if curl -s "$GATEWAY_URL/health" > /dev/null; then
    echo "${GREEN}✓ Gateway is running${NC}"
else
    echo "${RED}✗ Gateway is not running. Start it with: cd x402 && npx tsx gateway.ts${NC}"
    exit 1
fi
echo ""

# Test 2: Check user balance
echo "${YELLOW}Test 2: Check Initial Balance${NC}"
BALANCE=$(curl -s "$GATEWAY_URL/gateway/balance/$WALLET_ADDRESS" | grep -o '"balance":[0-9.]*' | cut -d':' -f2)
echo "   Current balance: $BALANCE USD"
echo ""

# Test 3: List an API
echo "${YELLOW}Test 3: Create Test API via Marketplace${NC}"
echo "   Creating 'Test Weather API'..."

API_RESPONSE=$(curl -s -X POST "$BACKEND_URL/listings" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Weather API",
    "description": "A test API for weather data",
    "baseUrl": "https://api.open-meteo.com",
    "pricePerCall": "0.001",
    "category": "Weather",
    "owner": "'"$WALLET_ADDRESS"'",
    "source": "manual",
    "status": "active"
  }')

API_ID=$(echo $API_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$API_ID" ]; then
    echo "${GREEN}✓ API created with ID: $API_ID${NC}"
    GATEWAY_URL_CREATED=$(echo $API_RESPONSE | grep -o '"base_url":"[^"]*"' | cut -d'"' -f4)
    echo "   Gateway URL: $GATEWAY_URL_CREATED"
else
    echo "${RED}✗ Failed to create API${NC}"
    echo "   Response: $API_RESPONSE"
fi
echo ""

# Test 4: Register API with gateway (manual registration for testing)
echo "${YELLOW}Test 4: Register API with Gateway${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/gateway/register" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "test-weather",
    "originalBaseUrl": "https://api.open-meteo.com",
    "pricePerCall": "0.001",
    "owner": "'"$WALLET_ADDRESS"'",
    "apiId": "'"$API_ID"'"
  }')

if echo $REGISTER_RESPONSE | grep -q '"success":true'; then
    echo "${GREEN}✓ API registered with gateway${NC}"
else
    echo "${YELLOW}⚠ Gateway registration may have failed (check if already registered)${NC}"
fi
echo ""

# Test 5: Make a paid API call
echo "${YELLOW}Test 5: Make Paid API Call${NC}"
echo "   Calling: GET /v1/forecast?latitude=52.52&longitude=13.41"

API_CALL_RESPONSE=$(curl -s -X GET \
  -H "X-Wallet-Address: $WALLET_ADDRESS" \
  "$GATEWAY_URL/test-weather/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true")

if echo $API_CALL_RESPONSE | grep -q '"current_weather"'; then
    echo "${GREEN}✓ API call successful${NC}"
    echo "   Response preview: $(echo $API_CALL_RESPONSE | cut -c1-100)..."
else
    echo "${RED}✗ API call failed${NC}"
    echo "   Response: $API_CALL_RESPONSE"
fi
echo ""

# Test 6: Check balance after call
echo "${YELLOW}Test 6: Verify Payment Deduction${NC}"
NEW_BALANCE=$(curl -s "$GATEWAY_URL/gateway/balance/$WALLET_ADDRESS" | grep -o '"balance":[0-9.]*' | cut -d':' -f2)
echo "   Previous balance: $BALANCE USD"
echo "   Current balance:  $NEW_BALANCE USD"

if [ "$NEW_BALANCE" != "$BALANCE" ]; then
    DEDUCTED=$(echo "$BALANCE - $NEW_BALANCE" | bc)
    echo "${GREEN}✓ Payment deducted: $DEDUCTED USD${NC}"
else
    echo "${YELLOW}⚠ Balance unchanged (check if payment logic is working)${NC}"
fi
echo ""

# Test 7: List registered APIs
echo "${YELLOW}Test 7: List All Registered APIs${NC}"
APIS=$(curl -s "$GATEWAY_URL/gateway/apis")
API_COUNT=$(echo $APIS | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo "   Registered APIs: $API_COUNT"
if [ "$API_COUNT" -gt "0" ]; then
    echo "${GREEN}✓ APIs found in gateway registry${NC}"
fi
echo ""

# Test 8: Test insufficient balance
echo "${YELLOW}Test 8: Test Insufficient Balance${NC}"
echo "   Setting balance to 0..."
curl -s -X POST "$GATEWAY_URL/gateway/topup" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "'"$WALLET_ADDRESS"'",
    "amount": -100
  }' > /dev/null

INSUFFICIENT_RESPONSE=$(curl -s -X GET \
  -H "X-Wallet-Address: $WALLET_ADDRESS" \
  "$GATEWAY_URL/test-weather/v1/forecast?latitude=52.52&longitude=13.41")

if echo $INSUFFICIENT_RESPONSE | grep -q '"error":"Insufficient balance"'; then
    echo "${GREEN}✓ Insufficient balance error working correctly${NC}"
else
    echo "${YELLOW}⚠ Insufficient balance check may not be working${NC}"
    echo "   Response: $INSUFFICIENT_RESPONSE"
fi
echo ""

# Restore balance
echo "   Restoring balance..."
curl -s -X POST "$GATEWAY_URL/gateway/topup" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "'"$WALLET_ADDRESS"'",
    "amount": 100
  }' > /dev/null

# Summary
echo "════════════════════════════════════════════════════════"
echo "           Test Summary"
echo "════════════════════════════════════════════════════════"
echo ""
echo "🎯 Next Steps:"
echo "   1. Check dashboard at http://localhost:5174"
echo "   2. View API details page for usage stats"
echo "   3. Test with your own APIs"
echo "   4. Deploy gateway to production"
echo ""
echo "📚 For more info, see: X402_GATEWAY_TESTING_GUIDE.md"
echo ""
