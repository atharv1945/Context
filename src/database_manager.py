import chromadb
import os
from src.pipeline import EMBEDDING_MODEL


DB_PATH = "chroma_db" 
COLLECTION_NAME = "context_collection"

print("Initializing ChromaDB...")
try:
    CLIENT = chromadb.PersistentClient(path=DB_PATH)    
    COLLECTION = CLIENT.get_or_create_collection(name=COLLECTION_NAME)
    print("ChromaDB initialized successfully.")
    
except Exception as e:
    print(f"Error initializing ChromaDB: {e}")
    CLIENT = None
    COLLECTION = None

# CORE DATABASE FUNCTIONS
def add_item(analysis_result: dict):
    if not COLLECTION:
        print("Database not initialized. Cannot add item.")
        return

    file_path = analysis_result['file_path']

    # Prevent duplicates
    if COLLECTION.get(ids=[file_path])['ids']:
        print(f"Item '{os.path.basename(file_path)}' already exists in the database. Skipping.")
        return

    # --- Normalize tags ---
    raw_tags = analysis_result.get("tags", "")
    if isinstance(raw_tags, str):
        # Split by comma and strip whitespace, lowercase for consistency
        tag_list = [t.strip().lower() for t in raw_tags.split(",") if t.strip()]
    elif isinstance(raw_tags, list):
        tag_list = [str(t).strip().lower() for t in raw_tags if str(t).strip()]
    else:
        tag_list = []

    try:
        COLLECTION.add(
            ids=[file_path],
            embeddings=[analysis_result['vector']],
            metadatas=[{
                "file_path": file_path,
                "caption": analysis_result.get("caption", ""),
                "ocr_text": analysis_result.get("ocr_text", ""),
                "tags": tag_list,
                "user_caption": analysis_result.get("user_caption", "")
            }]
        )
        print(f"✅ Successfully added '{os.path.basename(file_path)}' to the database with tags {tag_list}")
    except Exception as e:
        print(f"Error adding item {file_path} to DB: {e}")
   
   
def search(query_text: str, n_results: int = 3) -> dict:
    if not COLLECTION or not EMBEDDING_MODEL:
        print("Database or embedding model not initialized.")
        return {}

    print(f"\n Searching for: '{query_text}'")
    
    query_vector = EMBEDDING_MODEL.encode(query_text).tolist()
    
    results = COLLECTION.query(
        query_embeddings=[query_vector],
        n_results=n_results,
        include=["metadatas", "distances"] 
    )
    
    print("Search complete.")
    return results

def delete_item(file_path: str):
    if not COLLECTION:
        print(" Database not initialized. Cannot delete item.")
        return
    
    try:
        if file_path.lower().endswith('.pdf'):
            possible_page_ids = [f"{file_path}_page_{i+1}" for i in range(500)] 
            COLLECTION.delete(ids=possible_page_ids)        
        COLLECTION.delete(ids=[file_path])
        print(f" Successfully removed entries for '{os.path.basename(file_path)}' from the database.")
    except Exception as e:
        print(f" Error deleting item {file_path} from DB: {e}")
    
def get_graph_for_entity(entity_name: str, limit: int = 25) -> dict:
    if not COLLECTION:
        print("Database not initialized.")
        return {"nodes": [], "edges": []}

    print(f"\nGenerating graph for entity: '{entity_name}'")
    query_tag = entity_name.lower()

    try:
        results = COLLECTION.get(
            where={"tags": {"$in": [query_tag]}},  # works directly on lists
            include=["metadatas"],
            limit=1000
        )
    except Exception as e:
        print(f"Error during query: {e}")
        return {"nodes": [], "edges": []}

    if not results or not results.get("metadatas"):
        return {"nodes": [], "edges": []}

    # Since tags are stored as a list, just check membership
    filtered_items = [
        md for md in results["metadatas"]
        if md and "tags" in md and query_tag in md["tags"]
    ][:limit]

    if not filtered_items:
        return {"nodes": [], "edges": []}

    # --- Build Graph ---
    nodes = [{"id": entity_name, "label": entity_name, "type": "entity"}]
    edges = []

    for metadata in filtered_items:
        file_id = metadata["file_path"]
        file_label = os.path.basename(file_id)

        nodes.append({
            "id": file_id,
            "label": file_label,
            "type": "file",
            "metadata": metadata
        })
        edges.append({"from": entity_name, "to": file_id, "label": "mentions"})

    print(f"✅ Graph generated with {len(nodes)} nodes and {len(edges)} edges.")
    return {"nodes": nodes, "edges": edges}
