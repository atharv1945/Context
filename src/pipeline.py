# src/pipeline.py

from PIL import Image
import pytesseract
from sentence_transformers import SentenceTransformer
import numpy as np
import os
import fitz  
import spacy
import torch
import cv2 

# --- 1. CONFIGURATION & OPTIMIZATION ---
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"✅ Using device: {DEVICE}")


print("Loading AI models into memory")
try:
    EMBEDDING_MODEL = SentenceTransformer('clip-ViT-B-32', device=DEVICE)
    NER_MODEL = spacy.load("en_core_web_sm")
    print("Models loaded successfully!")
    
except Exception as e:
    print(f"Error loading models: {e}")
    EMBEDDING_MODEL = None
    NER_MODEL = None


def analyze_image(file_path: str, user_caption: str = None) -> dict | None:

    if not EMBEDDING_MODEL or not NER_MODEL:
        print("Models are not loaded. Cannot perform analysis.")
        return None
        
    try:
        print(f"\nAnalyzing image: {os.path.basename(file_path)}...")
        image_cv = cv2.imread(file_path)
        image_rgb = cv2.cvtColor(image_cv, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(image_rgb)

        ocr_text = pytesseract.image_to_string(pil_image)
        
        doc = NER_MODEL(ocr_text)
        tags = list(set([ent.text for ent in doc.ents])) 
        
        # --- Step C: Unified Multimodal Embedding ---
        image_embedding = EMBEDDING_MODEL.encode(pil_image, normalize_embeddings=True, show_progress_bar=False)
        
        text_to_embed = f"{user_caption or ''} {ocr_text}"
        text_embedding = EMBEDDING_MODEL.encode(text_to_embed, normalize_embeddings=True, show_progress_bar=False)
        
        # Combine the embeddings with a slight weight towards text
        combined_embedding = np.mean([image_embedding, text_embedding * 1.2], axis=0)
        
        # Re-normalize the final combined vector to ensure it's a unit vector
        norm = np.linalg.norm(combined_embedding)
        normalized_combined_embedding = combined_embedding / norm
        
        return {
            "file_path": file_path,
            "ocr_text": ocr_text, # The full text from the image
            "tags": tags,
            "user_caption": user_caption or "",
            "vector": normalized_combined_embedding.tolist()
        }
    except Exception as e:
        print(f"An unexpected error occurred during image analysis for {file_path}: {e}")
        return None

def analyze_pdf(file_path: str, user_caption: str = None) -> list[dict]:

    if not EMBEDDING_MODEL or not NER_MODEL:
        print("Models are not loaded. Cannot perform analysis.")
        return []

    try:
        doc = fitz.open(file_path)
        results = []
        print(f"\nAnalyzing PDF: {os.path.basename(file_path)} ({doc.page_count} pages)...")

        for page_num in range(doc.page_count):
            page = doc.load_page(page_num)
            
            # Extract Text from Page 
            ocr_text = page.get_text()
            
            # NER Tag Extraction from Page Text 
            doc_ner = NER_MODEL(ocr_text)
            tags = list(set([ent.text for ent in doc_ner.ents]))
            
            # Unified Multimodal Embedding for the Page
            pix = page.get_pixmap()
            pil_image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            
            image_embedding = EMBEDDING_MODEL.encode(pil_image, normalize_embeddings=True, show_progress_bar=False)
            
            text_to_embed = f"{user_caption or ''} {ocr_text}"
            text_embedding = EMBEDDING_MODEL.encode(text_to_embed, normalize_embeddings=True, show_progress_bar=False)
            
            # Combine the embeddings with a slight weight towards text
            combined_embedding = np.mean([image_embedding, text_embedding * 1.2], axis=0)
            
            # Re-normalize the final combined vector
            norm = np.linalg.norm(combined_embedding)
            normalized_combined_embedding = combined_embedding / norm
            
            # Append Page Data
            page_id = f"{file_path}_page_{page_num + 1}"
            results.append({
                "file_path": page_id, 
                "original_pdf_path": file_path,
                "page_num": page_num + 1,
                "ocr_text": ocr_text,
                "tags": tags,
                "user_caption": user_caption or "",
                "vector": normalized_combined_embedding.tolist()
            })
            print(f"  - Analyzed page {page_num + 1}/{doc.page_count}")
        
        doc.close()
        return results

    except Exception as e:
        print(f"Error analyzing PDF {file_path}: {e}")
        return []

#DIRECT EXECUTION TEST BLOCK 
if __name__ == "__main__":
    print("\n--- Running a direct test of the IMAGE analysis pipeline ---")
    # Use absolute path to be safe when running from different directories
    sample_image_path = os.path.join(os.path.dirname(__file__), '..', 'sample_images', 'sample_screenshot.png')
    if os.path.exists(sample_image_path):
        image_result = analyze_image(sample_image_path)
        if image_result:
            print("\nImage Analysis successful!")
            print(f"Tags found: {image_result['tags']}")
            print(f"Vector Dimension: {len(image_result['vector'])}")
            print("=" * 40)
    else:
        print(f"Test image not found at '{sample_image_path}'. Skipping test.")

    # Test for PDF analysis
    print("\n--- Running a direct test of the PDF analysis pipeline ---")
    sample_pdf_path = os.path.join(os.path.dirname(__file__), '..', 'sample_images', 'sample_doc.pdf')
    if os.path.exists(sample_pdf_path):
        pdf_results = analyze_pdf(sample_pdf_path)
        if pdf_results:
            print(f"\nPDF Analysis successful! Analyzed {len(pdf_results)} pages.")
            print("--- Data for Page 1 ---")
            first_page = pdf_results[0]
            print(f"Tags found: {first_page['tags']}")
            print(f"Vector Dimension: {len(first_page['vector'])}")
            print("=" * 40)
    else:
        print(f"⚠️ Test PDF not found at '{sample_pdf_path}'. Skipping test.")