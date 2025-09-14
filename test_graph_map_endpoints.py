#!/usr/bin/env python3
"""
Test script for the new Graph and Map Management API endpoints.
"""

import requests
import json
import tempfile
import os

API_BASE_URL = "http://127.0.0.1:8000"

def test_entity_graph_endpoint():
    """Test the GET /graph/entity endpoint."""
    print("🧪 Testing GET /graph/entity endpoint")
    print("-" * 50)
    
    # Test 1: Valid entity name
    response = requests.get(f"{API_BASE_URL}/graph/entity?name=Samsung")
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Entity graph generation successful")
        print(f"   Nodes: {len(result.get('nodes', []))}")
        print(f"   Edges: {len(result.get('edges', []))}")
        
        # Print first few nodes and edges
        nodes = result.get('nodes', [])
        edges = result.get('edges', [])
        
        if nodes:
            print(f"   First node: {nodes[0]}")
        if edges:
            print(f"   First edge: {edges[0]}")
    else:
        print(f"❌ Entity graph generation failed: {response.status_code}")
        print(f"   Error: {response.text}")
    
    # Test 2: Missing name parameter
    response = requests.get(f"{API_BASE_URL}/graph/entity")
    
    if response.status_code == 422:
        print("✅ Missing name parameter properly rejected")
    else:
        print(f"❌ Missing name should return 422, got: {response.status_code}")

def test_map_crud_endpoints():
    """Test the CRUD endpoints for user-curated maps."""
    print("\n🧪 Testing Map CRUD endpoints")
    print("-" * 50)
    
    # Test 1: Create a new map
    print("Creating a new map...")
    payload = {"name": "Test Research Project"}
    response = requests.post(f"{API_BASE_URL}/maps", json=payload)
    
    if response.status_code == 200:
        result = response.json()
        map_id = result["id"]
        print(f"✅ Map created successfully with ID: {map_id}")
        print(f"   Map name: {result['name']}")
    else:
        print(f"❌ Map creation failed: {response.status_code}")
        print(f"   Error: {response.text}")
        return
    
    # Test 2: List all maps
    print("\nListing all maps...")
    response = requests.get(f"{API_BASE_URL}/maps")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Retrieved {len(result)} maps")
        for map_item in result:
            print(f"   - ID: {map_item['id']}, Name: {map_item['name']}")
    else:
        print(f"❌ Map listing failed: {response.status_code}")
    
    # Test 3: Get specific map details
    print(f"\nGetting details for map ID {map_id}...")
    response = requests.get(f"{API_BASE_URL}/maps/{map_id}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Map details retrieved")
        print(f"   Nodes: {len(result.get('nodes', []))}")
        print(f"   Edges: {len(result.get('edges', []))}")
    else:
        print(f"❌ Map details retrieval failed: {response.status_code}")
    
    # Test 4: Add a node to the map
    print(f"\nAdding a node to map {map_id}...")
    # Create a temporary file for testing
    with tempfile.NamedTemporaryFile(mode='w', suffix='.pdf', delete=False) as f:
        f.write("Test PDF content")
        temp_file_path = f.name
    
    try:
        payload = {
            "file_path": temp_file_path,
            "x": 100,
            "y": 150
        }
        response = requests.post(f"{API_BASE_URL}/maps/{map_id}/nodes", json=payload)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Node added successfully")
            print(f"   Status: {result['status']}")
            print(f"   Message: {result['message']}")
        else:
            print(f"❌ Node addition failed: {response.status_code}")
            print(f"   Error: {response.text}")
    finally:
        # Clean up temporary file
        try:
            os.unlink(temp_file_path)
        except:
            pass
    
    # Test 5: Create an edge between nodes
    print(f"\nCreating an edge in map {map_id}...")
    payload = {
        "source_id": 1,
        "target_id": 2,
        "label": "references"
    }
    response = requests.post(f"{API_BASE_URL}/maps/{map_id}/edges", json=payload)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Edge created successfully")
        print(f"   Status: {result['status']}")
        print(f"   Message: {result['message']}")
    else:
        print(f"❌ Edge creation failed: {response.status_code}")
        print(f"   Error: {response.text}")

def test_error_cases():
    """Test error handling for the new endpoints."""
    print("\n🧪 Testing Error Cases")
    print("-" * 50)
    
    # Test 1: Get non-existent map
    response = requests.get(f"{API_BASE_URL}/maps/99999")
    if response.status_code == 404:
        print("✅ Non-existent map properly returns 404")
    else:
        print(f"❌ Non-existent map should return 404, got: {response.status_code}")
    
    # Test 2: Add node to non-existent map
    payload = {
        "file_path": "C:/test/file.pdf",
        "x": 100,
        "y": 150
    }
    response = requests.post(f"{API_BASE_URL}/maps/99999/nodes", json=payload)
    if response.status_code == 404:
        print("✅ Adding node to non-existent map properly returns 404")
    else:
        print(f"❌ Adding node to non-existent map should return 404, got: {response.status_code}")
    
    # Test 3: Create edge with invalid node IDs
    payload = {
        "source_id": 999,
        "target_id": 998,
        "label": "test"
    }
    response = requests.post(f"{API_BASE_URL}/maps/1/edges", json=payload)
    if response.status_code == 404:
        print("✅ Creating edge with invalid node IDs properly returns 404")
    else:
        print(f"❌ Creating edge with invalid node IDs should return 404, got: {response.status_code}")

def main():
    """Run all tests for the graph and map endpoints."""
    print("🧪 Testing Graph and Map Management Endpoints")
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
    test_entity_graph_endpoint()
    test_map_crud_endpoints()
    test_error_cases()
    
    print("\n🎉 Graph and Map endpoint testing completed!")
    print("\n📚 You can view the interactive API documentation at:")
    print("   http://127.0.0.1:8000/docs")

if __name__ == "__main__":
    main()
