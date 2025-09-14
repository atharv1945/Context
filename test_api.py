#!/usr/bin/env python3
"""
Test script for the Context Search API.
This script tests the /search endpoint to ensure it works correctly.
"""

import requests
import json
import time

API_BASE_URL = "http://127.0.0.1:8000"

def test_api_health():
    """Test the health check endpoint."""
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API server. Make sure it's running on port 8000.")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_search_endpoint(query: str, limit: int = 5):
    """Test the search endpoint with a given query."""
    try:
        params = {"q": query, "limit": limit}
        response = requests.get(f"{API_BASE_URL}/search", params=params)
        
        if response.status_code == 200:
            results = response.json()
            print(f"✅ Search successful for query: '{query}'")
            print(f"   Found {len(results)} results")
            
            for i, result in enumerate(results, 1):
                print(f"   Result {i}:")
                print(f"     File: {result.get('file_path', 'N/A')}")
                print(f"     Type: {result.get('type', 'N/A')}")
                print(f"     Tags: {result.get('tags', [])}")
                print(f"     Caption: {result.get('user_caption', 'N/A')}")
                print(f"     Similarity: {result.get('similarity', 'N/A')}")
                if 'original_pdf_path' in result:
                    print(f"     PDF: {result['original_pdf_path']} (page {result.get('page_num', 'N/A')})")
                print()
            
            return True
        else:
            print(f"❌ Search failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Search error: {e}")
        return False

def test_invalid_requests():
    """Test the API with invalid requests."""
    print("Testing invalid requests...")
    
    # Test empty query
    try:
        response = requests.get(f"{API_BASE_URL}/search", params={"q": ""})
        if response.status_code == 422:  # Validation error
            print("✅ Empty query properly rejected")
        else:
            print(f"❌ Empty query should be rejected: {response.status_code}")
    except Exception as e:
        print(f"❌ Empty query test error: {e}")
    
    # Test missing query parameter
    try:
        response = requests.get(f"{API_BASE_URL}/search")
        if response.status_code == 422:  # Validation error
            print("✅ Missing query parameter properly rejected")
        else:
            print(f"❌ Missing query should be rejected: {response.status_code}")
    except Exception as e:
        print(f"❌ Missing query test error: {e}")

def main():
    """Run all API tests."""
    print("🧪 Testing Context Search API")
    print("=" * 50)
    
    # Test health check
    if not test_api_health():
        print("\n❌ API server is not running. Please start it with: python api_server.py")
        return
    
    print("\n" + "=" * 50)
    
    # Test search functionality
    test_queries = [
        "ID card",
        "financial report",
        "Samsung",
        "document",
        "image"
    ]
    
    for query in test_queries:
        print(f"Testing search query: '{query}'")
        test_search_endpoint(query, limit=3)
        print("-" * 30)
    
    # Test invalid requests
    test_invalid_requests()
    
    print("\n🎉 API testing completed!")

if __name__ == "__main__":
    main()
