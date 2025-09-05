# run_indexer.py

import os
from src.pipeline import analyze_image
from src.database_manager import add_item

# --- Configuration ---
IMAGE_DIRECTORY = "sample_images"

def main():
    print(f"\n Starting Indexer for directory: '{IMAGE_DIRECTORY}' ")
    
    if not os.path.exists(IMAGE_DIRECTORY):
        print(f"Error: Directory '{IMAGE_DIRECTORY}' not found. Please create it and add images.")
        return

    image_files = [f for f in os.listdir(IMAGE_DIRECTORY) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    if not image_files:
        print("No images found to index in the directory.")
        return

    print(f"Found {len(image_files)} images to process.")
    
    for filename in image_files:
        full_path = os.path.join(IMAGE_DIRECTORY, filename)
        
        analysis_data = analyze_image(full_path)        
        if analysis_data:
            add_item(analysis_data)
    
    print("\nIndexing complete")

if __name__ == "__main__":
    main()