import sys
from transformers import pipeline
from PIL import Image

def test_captioning():
    print("--- Image Captioning Test ---")
    try:
        print("Loading model... (This may take a while on the first run)")
        captioner = pipeline("image-to-text", model="Salesforce/blip-image-captioning-base")

        img_path = r"D:\Desktop Data\ML\Projects\Context\Context\sample_images\sample_screenshot.png"
        image = Image.open(img_path).convert("RGB")  # ✅ ensure RGB

        print("Model loaded. Processing image...")
        outputs = captioner(image)

        # pipeline returns a list of dicts → [{'generated_text': "..."}]
        caption = outputs[0]["generated_text"]
        print("Caption:", caption)

    except Exception as e:
        print("An error occurred during captioning test:", e)

if __name__ == "__main__":
    test_captioning()
