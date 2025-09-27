
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
    raw_tags = analysis_result.get("tags", [])
    if isinstance(raw_tags, str):
        # Split by comma and strip whitespace, lowercase for consistency
        tag_list = [t.strip().lower() for t in raw_tags.split(",") if t.strip()]
    elif isinstance(raw_tags, list):
        tag_list = [str(t).strip().lower() for t in raw_tags if str(t).strip()]
    else:
        tag_list = [] # Default to empty list if format is unexpected

    # ChromaDB metadata values must be primitive types. Convert the list of tags to a single string.
    tags_as_string = ", ".join(tag_list)

    try:
        COLLECTION.add(
            ids=[file_path],
            embeddings=[analysis_result['vector']],
            metadatas=[{
                "file_path": analysis_result.get("original_pdf_path", file_path), # Use original path for PDFs
                "page_id": file_path, # This is the unique ID for the item (image path or page path)
                "ocr_text": analysis_result.get("ocr_text", ""),
                "tags": tags_as_string,
                "user_caption": analysis_result.get("user_caption", "")
            }]
        )
        print(f"✅ Successfully added '{os.path.basename(file_path)}' to the database.")
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
        # The strategy is to fetch more results based on semantic similarity and then filter in Python.
        # We must manually create the embedding to ensure it matches the model used for indexing (clip-ViT-B-32).
        query_vector = EMBEDDING_MODEL.encode(entity_name).tolist()

        results = COLLECTION.query(
            query_embeddings=[query_vector],
            include=["metadatas"],
            n_results=limit * 5 # Fetch more to have a good pool for filtering
        )
    except Exception as e:
        print(f"Error during query: {e}")
        return {"nodes": [], "edges": []}

    if not results or not results.get("metadatas") or not results["metadatas"][0]:
        return {"nodes": [], "edges": []}

    # Filter the results in Python since the DB doesn't support substring matching in `where`.
    # We check if the query_tag is a whole word in the comma-separated 'tags' string.
    filtered_metadatas = [
        md for md in results["metadatas"][0]
        if query_tag in [tag.strip() for tag in md.get("tags", "").split(",")]
    ][:limit]

    # --- Build Graph ---
    nodes = [{"id": entity_name, "label": entity_name, "type": "entity"}]
    edges = []

    for metadata in filtered_metadatas:
        file_id = metadata["page_id"] # Use the unique page_id for graph nodes
        file_label = os.path.basename(file_id)

        # Ensure tags are returned as a list, consistent with the /search endpoint.
        tags_str = metadata.get('tags', '')
        if isinstance(tags_str, str) and tags_str:
            metadata['tags'] = [tag.strip() for tag in tags_str.split(',') if tag.strip()]
        else:
            metadata['tags'] = []

        nodes.append({
            "id": file_id,
            "label": file_label,
            "type": "file",
            "metadata": metadata
        })
        edges.append({"from": entity_name, "to": file_id, "label": "mentions"})

    print(f"✅ Graph generated with {len(nodes)} nodes and {len(edges)} edges.")
    return {"nodes": nodes, "edges": edges}
