#!/usr/bin/env python3
"""
Test script for the new API endpoints: /index-file and /indexed-file
"""

import requests
import json
import os
import tempfile

API_BASE_URL = "http://127.0.0.1:8000"

def test_index_file_endpoint():
    """Test the POST /index-file endpoint."""
    print("🧪 Testing POST /index-file endpoint")
    print("-" * 50)
    
    # Create a temporary test file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        f.write("This is a test file for indexing")
        temp_file_path = f.name
    
    try:
        # Test 1: Valid file with caption
        payload = {
            "file_path": temp_file_path,
            "user_caption": "Test file for API testing"
        }
        
        response = requests.post(f"{API_BASE_URL}/index-file", json=payload)
        
        if response.status_code == 202:
            result = response.json()
            print("✅ Valid file indexing successful")
            print(f"   Status: {result['status']}")
            print(f"   Message: {result['message']}")
        else:
            print(f"❌ Valid file indexing failed: {response.status_code}")
            print(f"   Error: {response.text}")
        
        # Test 2: File not found
        payload = {
            "file_path": "C:/nonexistent/file.pdf",
            "user_caption": "This file doesn't exist"
        }
        
        response = requests.post(f"{API_BASE_URL}/index-file", json=payload)
        
        if response.status_code == 404:
            print("✅ File not found properly handled")
        else:
            print(f"❌ File not found should return 404, got: {response.status_code}")
        
        # Test 3: Unsupported file type
        payload = {
            "file_path": temp_file_path,
            "user_caption": "Unsupported file type"
        }
        
        response = requests.post(f"{API_BASE_URL}/index-file", json=payload)
        
        if response.status_code == 400:
            print("✅ Unsupported file type properly rejected")
        else:
            print(f"❌ Unsupported file type should return 400, got: {response.status_code}")
        
        # Test 4: Missing required fields
        payload = {
            "user_caption": "Missing file_path"
        }
        
        response = requests.post(f"{API_BASE_URL}/index-file", json=payload)
        
        if response.status_code == 422:
            print("✅ Missing required fields properly rejected")
        else:
            print(f"❌ Missing fields should return 422, got: {response.status_code}")
            
    finally:
        # Clean up temporary file
        try:
            os.unlink(temp_file_path)
        except:
            pass

def test_delete_file_endpoint():
    """Test the DELETE /indexed-file endpoint."""
    print("\n🧪 Testing DELETE /indexed-file endpoint")
    print("-" * 50)
    
    # Test 1: Valid deletion request
    payload = {
        "file_path": "C:/Users/test/example.pdf"
    }
    
    response = requests.delete(f"{API_BASE_URL}/indexed-file", json=payload)
    
    if response.status_code == 200:
        result = response.json()
        print("✅ File deletion successful")
        print(f"   Status: {result['status']}")
        print(f"   Message: {result['message']}")
    else:
        print(f"❌ File deletion failed: {response.status_code}")
        print(f"   Error: {response.text}")
    
    # Test 2: Missing required fields
    payload = {}
    
    response = requests.delete(f"{API_BASE_URL}/indexed-file", json=payload)
    
    if response.status_code == 422:
        print("✅ Missing required fields properly rejected")
    else:
        print(f"❌ Missing fields should return 422, got: {response.status_code}")

def test_api_documentation():
    """Test that the API documentation is accessible."""
    print("\n🧪 Testing API Documentation")
    print("-" * 50)
    
    try:
        response = requests.get(f"{API_BASE_URL}/docs")
        if response.status_code == 200:
            print("✅ API documentation accessible at /docs")
        else:
            print(f"❌ API documentation not accessible: {response.status_code}")
    except Exception as e:
        print(f"❌ Error accessing API documentation: {e}")

def main():
    """Run all tests for the new endpoints."""
    print("🧪 Testing New API Endpoints")
    print("=" * 60)
    
    # Check if API is running
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code != 200:
            print("❌ API server is not running. Please start it first.")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API server. Make sure it's running on port 8000.")
        return
    
    # Run tests
    test_index_file_endpoint()
    test_delete_file_endpoint()
    test_api_documentation()
    
    print("\n🎉 New endpoint testing completed!")
    print("\n📚 You can view the interactive API documentation at:")
    print("   http://127.0.0.1:8000/docs")

if __name__ == "__main__":
    main()
