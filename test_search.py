# test_search.py

from src.database_manager import search
import os

def main():
    
    print("\n--- 🧠 Context Search Terminal ---")
    print("The database is ready. Enter your search query.")
    print("Type 'exit' or 'quit' to end the session.")
    
    while True:
        query = input("\n> ")
        if query.lower() in ['exit', 'quit']:
            print("Exiting search terminal. Goodbye!")
            break
        
        search_results = search(query_text=query, n_results=3)
        
        if not search_results or not search_results.get('metadatas') or not search_results['metadatas'][0]:
            print("No results found. Try a different query.")
            continue
        
        print("\n--- Top Results ---")
        metadatas = search_results['metadatas'][0]
        distances = search_results['distances'][0]
        
        for i, metadata in enumerate(metadatas):
            # The distance score is how different the items are. 0 is a perfect match.
            similarity = 1 - distances[i]
            
            print(f"{i+1}. File: {os.path.basename(metadata['file_path'])} (Similarity: {similarity:.2f})")
            print(f"   Caption: {metadata['caption']}")
            
        print("-" * 20)

if __name__ == "__main__":
    main()