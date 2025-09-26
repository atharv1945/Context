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

## ⚙️ Setup and Installation
Follow these steps to get the backend service running.
Follow these steps to get the full application running.

1. Prerequisites:
### 1. Prerequisites

- Python 3.9+

- Node.js and npm (for the frontend)
- Google Tesseract OCR Engine. Make sure it's installed on your system and added to your PATH.

2. Clone the Repository:
### 2. Clone the Repository
``` bash
git clone [https://github.com/your-repo/project-context.git](https://github.com/your-repo/project-context.git)
cd project-context
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
pip install -r requirement.txt
```

4. Download the NLP Model:
Run this one-time command to download the necessary spaCy model.
```bash
python -m spacy download en_core_web_sm
```
▶️ How to Run
1. Start the Background Service:
To start the monitor, simply run the following command in your terminal:
```bash
python run_background_monitor.py
```
The service is now active! It will print status messages to the console as it detects and processes new files. When a new file is found, it will prompt you directly in the terminal to add an optional user caption.

2. Resetting the Database (for Development):
If you need to start fresh (e.g., after a model change), you can clear the entire database by running:`
```bash
python clear_database.py
```
You will be asked to confirm before any data is deleted.

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