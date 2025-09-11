import chromadb
import os

DB_PATH = "chroma_db"
COLLECTION_NAME = "context_collection"

if __name__ == "__main__":
    if input(f"Are you sure you want to permanently delete the collection '{COLLECTION_NAME}'? (y/n): ").lower() == 'y':
        try:
            client = chromadb.PersistentClient(path=DB_PATH)
            client.delete_collection(name=COLLECTION_NAME)
            print(f"Collection '{COLLECTION_NAME}' has been deleted.")
        except Exception as e:
            print(f"Error deleting collection: {e}")
    else:
        print("Operation cancelled.")