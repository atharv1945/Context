# Project Context: Your On-Device Second Brain
Submission for the Samsung PRISM Generative AI Hackathon 2025 (Multimodal AI Track)

Project Context is an intelligent, on-device indexing service that transforms your personal files into a searchable, cognitive memory. It solves the universal "Where did I see that?" problem by understanding the content of your files, not just their names.

## The Problem
We live in an age of information overload. We capture knowledge constantly—screenshots of important charts, photos of whiteboards, and downloads of research papers. This data is invaluable, but it's scattered and disconnected. When you need to recall a specific detail—like "that slide about Samsung's Q3 revenue with the blue pie chart"—traditional search fails us. You're left manually scrubbing through hundreds of files, wasting time and breaking your focus.

## Our Solution
Context acts as your personal cognitive assistant, working silently in the background to build a rich, semantic understanding of your information.

It automatically watches key folders (like your Desktop and Downloads) and when a new image or PDF is saved, it performs a deep analysis:

-  It reads the text using Optical Character Recognition (OCR).

-  It understands the visual content using a state-of-the-art multimodal AI model (CLIP).

- It extracts key facts like names, dates, and organizations using Named Entity Recognition (NER).

Later, you can ask a simple, conversational question, and Context will instantly retrieve the exact file or page you were thinking of.

## Key Features
- Multimodal Cognitive Search: Search by concept, not just keyword. Our engine understands the visual content of images and the semantic meaning of text.

- Automatic & Proactive: Runs in the background, automatically indexing new files without any user effort.

-  Human-AI Collaboration: A unique feature that prompts the user to add a personal note or caption to new files, blending human context with AI understanding for unparalleled search accuracy.

- Real-Time Sync: Automatically removes information from its memory when a file is deleted from the disk, keeping its knowledge up-to-date.

- On-Device & Private: All analysis and data storage happens locally on your machine. Your personal information never leaves your device.

- PDF & Image Support: Understands both images (png, jpg) and multi-page PDF documents.

## Technical Architecture & Design
Our system is a robust, event-driven service built on a modern AI stack.

1. Background Monitor (run_background_monitor.py): The service's nervous system. It uses a hybrid approach of real-time watchdog events and periodic polling for 100% reliability in detecting file changes (creations, renames, and deletions).

2. AI Pipeline (src/pipeline.py): The brain of the operation. When a file is detected, it's sent here for analysis.

- CLIP Model (clip-ViT-B-32): We use this state-of-the-art model to create unified vector embeddings from both image pixels and text. This is our core innovation for high-accuracy multimodal search.

- spaCy (NER): We use this NLP model to extract factual tags (people, products, etc.), adding a layer of structured data to our semantic search.

3. Vector Database (src/database_manager.py): The service's memory.

- ChromaDB: We use ChromaDB as a persistent, on-disk vector database for high-speed similarity search. It stores the vector "fingerprints" and their associated metadata (OCR text, tags, user captions).

## Assumptions Made for the "Context" Prototype
**Technical & Performance Assumptions**

- Sufficient On-Device Resources: We assume the user's desktop or laptop has adequate CPU and RAM (e.g., 8GB+) to run the AI models in the background without a significant negative impact on their primary tasks. GPU acceleration is considered a performance enhancement, not a requirement.

- Standard File Formats: The AI pipeline is optimized for common, unencrypted image formats (.png, .jpg) and standard, text-based PDFs. We assume the system will not frequently encounter password-protected, encrypted, or purely image-based (non-OCRable) PDFs.

- English-Language Content: The chosen Natural Language Processing (NLP) models for embedding (CLIP) and Named Entity Recognition (NER) are optimized for English. We assume the user's documents are primarily in English.

- LLM Feasibility (for Knowledge Graph): For the most advanced relational extraction feature, we assume that a powerful LLM could perform this task effectively and we are simulating that output. We assume this capability will become more accessible for on-device deployment in the near future.

**User Behavior Assumptions**

- Primary File Locations: The background monitor watches the user's Desktop and Downloads folders. We assume these are the primary, high-value locations where users save new, important information that they will want to retrieve later.

- Preference for Automation: We assume users prefer a zero-effort, automated indexing system over a manual one where they would need to actively add files. Our "works in the background" approach is based on this core product hypothesis.

- Initial Internet Connectivity: We assume the user has an internet connection during the initial setup phase to download the required AI models. The core functionality, once set up, is designed to be fully on-device.

## ⚙️ Setup and Installation
Follow these steps to get the full application running.

### 1. Prerequisites

- Python 3.9+
- Node.js and npm (for the frontend)
- Google Tesseract OCR Engine. Make sure it's installed on your system and added to your PATH.

### 2. Clone the Repository
```bash
git clone https://github.com/your-repo/project-context.git
cd Context
```

3. Set up Virtual Environment & Install Dependencies:
```bash
# Create a virtual environment
python -m venv venv

# Activate it
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install all required packages from the requirement.txt file
pip install -r requirements.txt
```

4. Download the NLP Model and install NPM:
Run this one-time command to download the necessary spaCy model.
```bash
python -m spacy download en_core_web_sm
npm install
```

5. **Install Tesseract OCR**:
   - Windows: Download installer from [GitHub](https://github.com/UB-Mannheim/tesseract/wiki)
   - Add Tesseract to PATH: `C:\Program Files\Tesseract-OCR`
   - Verify installation: `tesseract --version`

4. **Configure Monitoring Path**:
   - Open `config.py`
   - Locate the `PATHS_TO_WATCH` variable
   - Change it to your desired folder path:
```python
PATHS_TO_WATCH = os.path.expanduser("YOUR_FOLDER_PATH_HERE"),  # e.g.: r"C:\Users\ashvi\OneDrive\Desktop\test_folder"
```

// ...existing code...

## ▶️ How to Run

### 1. Start the Backend Server
Open a new terminal and run:
```bash
# Activate virtual environment if not already activated
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Start the API server
python api_server.py
```
The backend server will start running on `http://localhost:8000`

### 2. Start the Frontend Development Server
Open another terminal and run:
```bash
# Navigate to frontend directory
cd context-main

# Start the development server
npm run dev
```
The frontend will be available at `http://localhost:3000`

### 3. Verify the Setup
- Backend API documentation: Visit `http://localhost:8000/docs`
- Frontend interface: Visit `http://localhost:3000`
- Check the terminal outputs for any error messages

### Troubleshooting
If you encounter any issues:
1. Ensure both terminals are running simultaneously
2. Check if the ports 8000 and 3000 are available
3. Verify all prerequisites are installed correctly
4. Check the application logs in both terminals for error messages

🛣️ Future Roadmap
- This prototype lays a powerful foundation. Future enhancements could include:

- A full-featured desktop GUI with a rich search interface.

- Cloud sync capabilities to share the "Context" memory across devices.

- Advanced search filters in the UI based on the extracted NER tags.

👥 Team

Atharv Agarwal - ML / AI Engineer

Ashvin MK - DevOps Engineer

Darsh Nahar - Web Developer

Aayush Raj - Designer