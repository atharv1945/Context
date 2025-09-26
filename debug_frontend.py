#!/usr/bin/env python3
"""
Comprehensive frontend debugging script
"""

import requests
import json
import time

def test_api_endpoints():
    """Test all API endpoints"""
    print("🔍 Testing API Endpoints...")
    
    base_url = "http://127.0.0.1:8000"
    endpoints = [
        ("/health", "GET"),
        ("/search?q=test&limit=3", "GET"),
        ("/maps", "GET"),
        ("/graph/entity?name=Samsung", "GET"),
    ]
    
    results = {}
    
    for endpoint, method in endpoints:
        try:
            url = f"{base_url}{endpoint}"
            if method == "GET":
                response = requests.get(url, timeout=5)
            else:
                response = requests.post(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                results[endpoint] = {"status": "✅ OK", "data": data}
                print(f"  ✅ {endpoint}: {response.status_code}")
            else:
                results[endpoint] = {"status": f"❌ {response.status_code}", "data": None}
                print(f"  ❌ {endpoint}: {response.status_code}")
                
        except Exception as e:
            results[endpoint] = {"status": f"❌ Error: {str(e)}", "data": None}
            print(f"  ❌ {endpoint}: {str(e)}")
    
    return results

def test_frontend_pages():
    """Test frontend pages"""
    print("\n🌐 Testing Frontend Pages...")
    
    base_url = "http://localhost:3000"
    pages = [
        "/",
        "/search",
        "/debug",
        "/maps",
        "/graph",
    ]
    
    results = {}
    
    for page in pages:
        try:
            url = f"{base_url}{page}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                results[page] = {"status": "✅ OK", "size": len(response.content)}
                print(f"  ✅ {page}: {response.status_code} ({len(response.content)} bytes)")
            else:
                results[page] = {"status": f"❌ {response.status_code}", "size": 0}
                print(f"  ❌ {page}: {response.status_code}")
                
        except Exception as e:
            results[page] = {"status": f"❌ Error: {str(e)}", "size": 0}
            print(f"  ❌ {page}: {str(e)}")
    
    return results

def test_cors_headers():
    """Test CORS headers"""
    print("\n🔗 Testing CORS Headers...")
    
    try:
        # Test preflight request
        response = requests.options(
            "http://127.0.0.1:8000/search",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Content-Type"
            },
            timeout=5
        )
        
        cors_headers = {
            "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
            "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
            "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers"),
        }
        
        print(f"  CORS Headers: {cors_headers}")
        
        if cors_headers["Access-Control-Allow-Origin"]:
            print("  ✅ CORS configured")
            return True
        else:
            print("  ❌ CORS not configured")
            return False
            
    except Exception as e:
        print(f"  ❌ CORS test failed: {str(e)}")
        return False

def check_network_connectivity():
    """Check basic network connectivity"""
    print("\n🌐 Testing Network Connectivity...")
    
    # Test API server
    try:
        response = requests.get("http://127.0.0.1:8000/health", timeout=3)
        print(f"  ✅ API Server (127.0.0.1:8000): {response.status_code}")
        api_ok = True
    except Exception as e:
        print(f"  ❌ API Server (127.0.0.1:8000): {str(e)}")
        api_ok = False
    
    # Test Frontend server
    try:
        response = requests.get("http://localhost:3000", timeout=3)
        print(f"  ✅ Frontend Server (localhost:3000): {response.status_code}")
        frontend_ok = True
    except Exception as e:
        print(f"  ❌ Frontend Server (localhost:3000): {str(e)}")
        frontend_ok = False
    
    return api_ok, frontend_ok

def main():
    print("🚀 Frontend Debugging Script")
    print("=" * 50)
    
    # Test network connectivity
    api_ok, frontend_ok = check_network_connectivity()
    
    if not api_ok:
        print("\n❌ API Server is not running. Start it with: python api_server_simple.py")
        return
    
    if not frontend_ok:
        print("\n❌ Frontend Server is not running. Start it with: cd context-main && npm run dev")
        return
    
    # Test CORS
    cors_ok = test_cors_headers()
    
    # Test API endpoints
    api_results = test_api_endpoints()
    
    # Test frontend pages
    frontend_results = test_frontend_pages()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Debug Summary:")
    
    print(f"\n🔗 Network:")
    print(f"  API Server: {'✅' if api_ok else '❌'}")
    print(f"  Frontend Server: {'✅' if frontend_ok else '❌'}")
    print(f"  CORS: {'✅' if cors_ok else '❌'}")
    
    print(f"\n🔍 API Endpoints:")
    for endpoint, result in api_results.items():
        print(f"  {endpoint}: {result['status']}")
    
    print(f"\n🌐 Frontend Pages:")
    for page, result in frontend_results.items():
        print(f"  {page}: {result['status']}")
    
    # Recommendations
    print(f"\n💡 Recommendations:")
    
    if not cors_ok:
        print("  • Fix CORS configuration in api_server_simple.py")
    
    failed_apis = [ep for ep, result in api_results.items() if "❌" in result['status']]
    if failed_apis:
        print(f"  • Fix API endpoints: {', '.join(failed_apis)}")
    
    failed_pages = [page for page, result in frontend_results.items() if "❌" in result['status']]
    if failed_pages:
        print(f"  • Fix frontend pages: {', '.join(failed_pages)}")
    
    if api_ok and frontend_ok and cors_ok and not failed_apis and not failed_pages:
        print("  • All systems working! Check browser console for JavaScript errors")
        print("  • Open http://localhost:3000/debug for the demo")

if __name__ == "__main__":
    main()
