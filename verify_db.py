# verify_db.py

import chromadb
import os

DB_PATH = "chroma_db"
COLLECTION_NAME = "context_collection"

def verify_database():
    """
    Connects to the ChromaDB and prints a summary of its contents.
    """
    print(f"--- 🕵️‍♂️ Connecting to ChromaDB at '{DB_PATH}' to verify data ---")
    
    if not os.path.exists(DB_PATH):
        print("❌ Database directory not found. Have you run the indexer yet?")
        return
        
    client = chromadb.PersistentClient(path=DB_PATH)
    
    try:
        collection = client.get_collection(name=COLLECTION_NAME)
    except ValueError:
        print(f"❌ Collection '{COLLECTION_NAME}' not found in the database.")
        return

    # --- Verification Step 1: Check the item count ---
    item_count = collection.count()
    print(f"\n✅ Found {item_count} items in the database.")

    # --- Verification Step 2: Inspect a few items ---
    if item_count > 0:
        print("\n--- Inspecting the metadata of the first 3 items... ---")
        
        # Retrieve the first 3 items, we only need their metadata for verification
        retrieved_items = collection.get(limit=8, include=["metadatas"])
        
        for i, metadata in enumerate(retrieved_items['metadatas']):
            print(f"\n--- Item {i+1} ---")
            print(f"  File Path: {metadata.get('file_path')}")
            print(f"  Caption: {metadata.get('caption')}")
            # Show the first 70 characters of the OCR text
            print(f"  OCR (preview): {metadata.get('ocr_text', '').strip()[:70]}...")
            
    print("\n--- ✅ Verification Complete! ---")

if __name__ == "__main__":
    verify_database()