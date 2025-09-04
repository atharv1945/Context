from transformers import VisionEncoderDecoderModel, AutoTokenizer, AutoImageProcessor
from PIL import Image
import torch

model_name = "nlpconnect/vit-gpt2-image-captioning"

# Load model, tokenizer, and image processor (newer replacement for AutoFeatureExtractor)
model = VisionEncoderDecoderModel.from_pretrained(model_name)
image_processor = AutoImageProcessor.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Load image and ensure it's in RGB
img_path = r"D:\Desktop Data\ML\Projects\Context\Context\sample_images\sample_screenshot.png"
img = Image.open(img_path).convert("RGB")

# Preprocess
pixel_values = image_processor(images=img, return_tensors="pt").pixel_values.to(device)

# Generate caption
generated_ids = model.generate(pixel_values, max_length=50)
caption = tokenizer.decode(generated_ids[0], skip_special_tokens=True)

print("Caption:", caption)

