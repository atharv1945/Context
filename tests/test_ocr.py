from PIL import Image
import pytesseract
import os

# --- IMPORTANT ---
# If Tesseract is not in your system's PATH, you'll need to specify its location.
# For Windows: pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def run_ocr_test(image_path):
    """
    Tests OCR on a single image and prints the extracted text.
    """
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        
        print("--- OCR Test Results ---")
        if text.strip():
            print(f"Successfully extracted text from '{os.path.basename(image_path)}':")
            print("-" * 20)
            print(text)
            print("-" * 20)
        else:
            print(f"No text found in '{os.path.basename(image_path)}'.")
        print("OCR test complete.")

    except FileNotFoundError:
        print(f" ERROR: The file '{image_path}' was not found.")
    except Exception as e:
        print(f"An error occurred during OCR test: {e}")

if __name__ == "__main__":
    test_image_path = "D:\Desktop Data\ML\Projects\Context\Context\sample_images\sample_screenshot.png"
    run_ocr_test(test_image_path)