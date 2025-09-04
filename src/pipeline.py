# src/pipeline.py

from PIL import Image
import pytesseract
from sentence_transformers import SentenceTransformer
from transformers import pipeline
import numpy as np
from numpy.linalg import norm
import os

# --- 1. CONFIGURATION & MODEL LOADING ---
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

print("Loading AI models into memory. This might take a moment...")

try:
    # Load the captioning model 
    CAPTIONER = pipeline("image-to-text", model="Salesforce/blip-image-captioning-base")
    
    # Load the sentence embedding model
    EMBEDDING_MODEL = SentenceTransformer('all-MiniLM-L6-v2')
    
    print("Models loaded successfully!")
except Exception as e:
    print(f"Error loading models: {e}")
    CAPTIONER = None
    EMBEDDING_MODEL = None


def analyze_image(file_path: str) -> dict | None:
    """
    Takes the path to an image, runs a full analysis, and returns a dictionary
    with the extracted data and vector embedding.
    """
    if not CAPTIONER or not EMBEDDING_MODEL:
        print(" Models are not available. Cannot perform analysis.")
        return None

    try:
        print(f"\nAnalyzing image: {os.path.basename(file_path)}...")
        image = Image.open(file_path).convert("RGB")

        # OCR 
        ocr_text = pytesseract.image_to_string(image)
        print("  - OCR complete.")

        # Generate Caption
        caption_result = CAPTIONER(image)
        caption = caption_result[0]["generated_text"] if caption_result else "No caption generated."
        print("  - Captioning complete.")

        # Combine Text
        combined_text = f"Visual Description: {caption}. Text content: {ocr_text.strip()}"
        print(" Text combined.")

        # Vector Embedding 
        embedding = EMBEDDING_MODEL.encode(combined_text, normalize_embeddings=True)
        print("Embedding complete.")

        return {
            "file_path": file_path,
            "ocr_text": ocr_text,
            "caption": caption,
            "combined_text": combined_text,
            # Convert numpy array to a standard list for better compatibility (e.g., with JSON)
            "vector": embedding.tolist() 
        }

    except FileNotFoundError:
        print(f"ERROR: File not found at {file_path}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred during analysis: {e}")
        return None


if __name__ == "__main__":
    print("\n--- Running a direct test of the full analysis pipeline ---")
    
    sample_image_path = r"D:\Desktop Data\ML\Projects\Context\Context\sample_images\sample_screenshot.png"
    
    if os.path.exists(sample_image_path):
        analysis_result = analyze_image(sample_image_path)
        
        if analysis_result:
            print("\nAnalysis successful! Here's the result:")
            print("=" * 40)
            print(f"File Path: {analysis_result['file_path']}")
            print(f"Generated Caption: {analysis_result['caption']}")
            print(f"Extracted OCR Text (first 150 chars): {analysis_result['ocr_text'][:150].strip()}...")
            print(f"Vector Dimension: {len(analysis_result['vector'])}")  
            print("=" * 40)
    else:
        print(f"Test image not found at '{sample_image_path}'. Please verify the path.")