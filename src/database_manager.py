import chromadb
import os
from pipeline import EMBEDDING_MODEL


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
    
    if COLLECTION.get(ids=[file_path])['ids']:
        print(f"Item '{os.path.basename(file_path)}' already exists in the database. Skipping.")
        return

    try:
        tags_str = ",".join(analysis_result.get('tags', []))

        COLLECTION.add(
            ids=[file_path],
            embeddings=[analysis_result['vector']],
            metadatas=[{
                "file_path": file_path,
                "ocr_text": analysis_result['ocr_text'],
                "user_caption": analysis_result.get('user_caption', ''),
                "tags": tags_str  
            }]
        )
        print(f"Successfully added '{os.path.basename(file_path)}' to the database.")
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