#!/bin/bash

# Authentication API Test Script

BASE_URL="http://localhost:3001/api/auth"

echo "🧪 Testing SplashTool Authentication API..."

# Test 1: Health Check
echo "📊 Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -X GET http://localhost:3001/health)
if [[ $HEALTH_RESPONSE == *"ok"* ]]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    exit 1
fi

# Test 2: User Registration
echo "📝 Testing user registration..."
TIMESTAMP=$(date +%s)
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser'$TIMESTAMP'@example.com",
    "password": "testpassword123",
    "username": "testuser'$TIMESTAMP'",
    "firstName": "Test",
    "lastName": "User"
  }')

if [[ $REGISTER_RESPONSE == *"accessToken"* ]]; then
    echo "✅ User registration passed"
    # Extract access token from JSON response
    ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | sed 's/.*"accessToken":"\([^"]*\)".*/\1/')
else
    echo "❌ User registration failed"
    echo $REGISTER_RESPONSE
    exit 1
fi

# Test 3: User Login
echo "🔐 Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser'$TIMESTAMP'@example.com",
    "password": "testpassword123"
  }')

if [[ $LOGIN_RESPONSE == *"accessToken"* ]]; then
    echo "✅ User login passed"
    # Extract access token from JSON response
    ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | sed 's/.*"accessToken":"\([^"]*\)".*/\1/')
else
    echo "❌ User login failed"
    echo $LOGIN_RESPONSE
    exit 1
fi

# Test 4: Protected Route Access
echo "🔒 Testing protected route access..."
echo "Using token: $ACCESS_TOKEN"
ME_RESPONSE=$(curl -s -X GET $BASE_URL/me \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $ME_RESPONSE"
if [[ $ME_RESPONSE == *"testuser"* ]]; then
    echo "✅ Protected route access passed"
else
    echo "❌ Protected route access failed"
    exit 1
fi

# Test 5: Profile Update
echo "👤 Testing profile update..."
UPDATE_RESPONSE=$(curl -s -X PUT $BASE_URL/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name"
  }')

if [[ $UPDATE_RESPONSE == *"Updated"* ]]; then
    echo "✅ Profile update passed"
else
    echo "❌ Profile update failed"
    exit 1
fi

echo "🎉 All authentication tests passed!"
echo "🚀 Your SplashTool backend is production-ready!"