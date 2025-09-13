# test_knowledge_graph.py

import os
import pprint
from src import database_manager
from src import map_manager

# --- Configuration for the Test ---
# Use an entity you KNOW is in your test files
TEST_ENTITY = "Samsung" 

# Use the full paths to two files you KNOW have been indexed
TEST_FILE_1_PATH = os.path.expanduser(r"C:\Users\athar\Desktop\test_folder\Prism Idea.pdf") # IMPORTANT: Change this path
TEST_FILE_2_PATH = os.path.expanduser(r"C:\Users\athar\Desktop\test_folder\Prism_ DataVista_VIT_Vellore_1.pdf") # IMPORTANT: Change this path

def run_tests():
    
    print("--- 🚀 Starting Knowledge Graph Feature Test ---")
    
    # --- Test 1: AI-Generated Graph (Mode A) ---
    print(f"\n--- Testing Mode A: AI-Generated Graph for entity '{TEST_ENTITY}' ---")
    ai_graph_data = database_manager.get_graph_for_entity(TEST_ENTITY)
    
    if ai_graph_data and ai_graph_data['nodes']:
        print(f"✅ SUCCESS: Found {len(ai_graph_data['nodes'])} nodes related to '{TEST_ENTITY}'.")
        pprint.pprint(ai_graph_data) # Uncomment to see the full graph data
    else:
        print(f"⚠️  FAILURE or No Data: No graph data found for '{TEST_ENTITY}'. Make sure you indexed a file containing this tag.")
        
    # --- Test 2: User-Curated Context Maps (Mode B) ---
    print("\n--- Testing Mode B: User-Curated 'Context Maps' ---")
    
    # Step 2a: Create a new map
    print("\nStep 2a: Creating a new map called 'My Thesis Project'...")
    map_name = "My Thesis Project"
    map_id = map_manager.create_map(map_name)
    if map_id:
        print(f"✅ SUCCESS: Map created with ID: {map_id}")
    else:
        print(f"⚠️  FAILURE: Could not create map. It might already exist.")
        # Try to get the existing map's ID if creation failed
        all_maps = map_manager.get_all_maps()
        existing = next((m for m in all_maps if m['name'] == map_name), None)
        if existing:
            map_id = existing['id']
            print(f"Found existing map with ID: {map_id}")
        else:
            print("Could not proceed with Mode B test.")
            return

    # Step 2b: Add nodes to the map
    print("\nStep 2b: Adding two file nodes to the map...")
    if os.path.exists(TEST_FILE_1_PATH) and os.path.exists(TEST_FILE_2_PATH):
        node1_id = map_manager.add_node_to_map(map_id, TEST_FILE_1_PATH, 100, 150)
        node2_id = map_manager.add_node_to_map(map_id, TEST_FILE_2_PATH, 400, 250)
        print(f"✅ SUCCESS: Added Node 1 (ID: {node1_id}) and Node 2 (ID: {node2_id}).")
    else:
        print(f"⚠️  FAILURE: Test files not found at the specified paths. Please update TEST_FILE_1_PATH and TEST_FILE_2_PATH in the script.")
        return

    # Step 2c: Create an edge between the nodes
    print("\nStep 2c: Creating a labeled edge between the two nodes...")
    edge_label = "cites evidence from"
    edge_id = map_manager.create_edge(map_id, node1_id, node2_id, edge_label)
    print(f"✅ SUCCESS: Created edge with ID: {edge_id}.")

    # Step 2d: Retrieve and verify the full map data
    print("\nStep 2d: Retrieving all data for the map...")
    full_map_data = map_manager.get_map_data(map_id)
    
    if full_map_data and len(full_map_data['nodes']) == 2 and len(full_map_data['edges']) == 1:
        print("✅ SUCCESS: Retrieved correct number of nodes and edges.")
        print("\n--- Full Map Data ---")
        pprint.pprint(full_map_data)
        print("--------------------")
    else:
        print("⚠️  FAILURE: Map data does not match what was created.")
        pprint.pprint(full_map_data)

    print("\n--- 🎉 Knowledge Graph Test Complete ---")

if __name__ == "__main__":
    run_tests()