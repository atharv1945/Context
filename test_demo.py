#!/usr/bin/env python3
"""
Test script to verify the demo is working correctly
"""

import requests
import time
import json

def test_api_server():
    """Test if the API server is running and responding"""
    try:
        # Test health endpoint
        response = requests.get("http://127.0.0.1:8000/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ API Server Health: {health_data}")
            return True
        else:
            print(f"❌ API Server Health Check Failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ API Server Connection Failed: {e}")
        return False

def test_search_endpoint():
    """Test the search endpoint"""
    try:
        response = requests.get("http://127.0.0.1:8000/search?q=test&limit=3", timeout=5)
        if response.status_code == 200:
            search_data = response.json()
            print(f"✅ Search Endpoint Working: Found {len(search_data)} results")
            for i, result in enumerate(search_data[:2]):  # Show first 2 results
                print(f"   Result {i+1}: {result.get('file_path', 'Unknown')} (similarity: {result.get('similarity', 'N/A')})")
            return True
        else:
            print(f"❌ Search Endpoint Failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Search Endpoint Connection Failed: {e}")
        return False

def test_frontend_server():
    """Test if the frontend server is running"""
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend Server Running")
            return True
        else:
            print(f"❌ Frontend Server Failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Frontend Server Connection Failed: {e}")
        return False

def main():
    print("🚀 Testing Context Demo Setup...")
    print("=" * 50)
    
    # Test API server
    print("\n1. Testing API Server...")
    api_ok = test_api_server()
    
    if api_ok:
        print("\n2. Testing Search Endpoint...")
        search_ok = test_search_endpoint()
    else:
        search_ok = False
    
    # Test frontend server
    print("\n3. Testing Frontend Server...")
    frontend_ok = test_frontend_server()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"   API Server: {'✅ Working' if api_ok else '❌ Failed'}")
    print(f"   Search Endpoint: {'✅ Working' if search_ok else '❌ Failed'}")
    print(f"   Frontend Server: {'✅ Working' if frontend_ok else '❌ Failed'}")
    
    if api_ok and search_ok and frontend_ok:
        print("\n🎉 All systems are working! You can now:")
        print("   • Visit http://localhost:3000/debug to see the demo")
        print("   • Try the search functionality")
        print("   • Test all the different demo sections")
    else:
        print("\n⚠️  Some systems are not working. Please check the errors above.")
        
        if not api_ok:
            print("   • Make sure the API server is running: python api_server_simple.py")
        if not frontend_ok:
            print("   • Make sure the frontend server is running: cd context-main && npm run dev")

if __name__ == "__main__":
    main()
