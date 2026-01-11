#!/bin/bash
# Comprehensive testing script for dummy data

echo "============================================"
echo "🧪 E-Commerce Dummy Data Test Suite"
echo "============================================"

# Test 1: MongoDB Connection
echo -e "\n✅ Test 1: Checking MongoDB Connection..."
MONGO_COUNT=$(curl -s http://localhost:5001/api/products | jq '.pagination.totalProducts')
echo "   ✓ Total Products in DB: $MONGO_COUNT"

# Test 2: Categories
echo -e "\n✅ Test 2: Checking Categories..."
CATEGORIES=$(curl -s http://localhost:5001/api/categories | jq '.data | length')
echo "   ✓ Total Categories: $CATEGORIES"

# Test 3: Product Structure
echo -e "\n✅ Test 3: Checking Product Structure..."
curl -s http://localhost:5001/api/products | jq '.data[0] | {name, price, originalPrice, rating, reviews, hasImages: (.images | length), hasSpecs: (.specifications | length)}' 

# Test 4: Images Accessibility
echo -e "\n✅ Test 4: Checking Image Accessibility..."
curl -s -o /dev/null -w "   ✓ Almond-1 image status: %{http_code}\n" http://localhost:5001/images/almond-1.png
curl -s -o /dev/null -w "   ✓ Cashew-1 image status: %{http_code}\n" http://localhost:5001/images/cashew-1.png
curl -s -o /dev/null -w "   ✓ Dates-1 image status: %{http_code}\n" http://localhost:5001/images/dates-1.png

# Test 5: Specifications on products
echo -e "\n✅ Test 5: Checking Product Specifications..."
curl -s http://localhost:5001/api/products | jq '.data[0:2] | .[] | {name, specs: .specifications}' 

echo -e "\n============================================"
echo "✅ All Tests Completed!"
echo "============================================"
