import chromadb
import os

DB_PATH = "chroma_db" 
COLLECTION_NAME = "context_collection"

print("🧠 Initializing ChromaDB...")
try:
    CLIENT = chromadb.PersistentClient(path=DB_PATH)    
    COLLECTION = CLIENT.get_or_create_collection(name=COLLECTION_NAME)
    print("ChromaDB initialized successfully.")
    
except Exception as e:
    print(f"Error initializing ChromaDB: {e}")
    CLIENT = None
    COLLECTION = None

def add_item(analysis_result: dict):
    if not COLLECTION:
        print("Database not initialized. Cannot add item.")
        return

    file_path = analysis_result['file_path']    
    # check is already exists
    if COLLECTION.get(ids=[file_path])['ids']:
        print(f"Item '{os.path.basename(file_path)}' already exists in the database. Skipping.")
        return

    try:
        COLLECTION.add(
            ids=[file_path],
            embeddings=[analysis_result['vector']],
            metadatas=[{
                "file_path": file_path,
                "caption": analysis_result['caption'],
                "ocr_text": analysis_result['ocr_text']
            }]
        )
        print(f"Successfully added '{os.path.basename(file_path)}' to the database.")
    except Exception as e:
        print(f"Error adding item {file_path} to DB: {e}")