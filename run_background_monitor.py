# run_background_monitor.py

import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import os
from src.pipeline import analyze_image, analyze_pdf
from src.database_manager import add_item

# --- Configuration ---
# IMPORTANT: Update these paths to the folders you want to watch on your machine
# You can add more paths to the list
PATHS_TO_WATCH = [
    os.path.expanduser("~/Desktop"),
    os.path.expanduser("~/Downloads")
]

class NewFileHandler(FileSystemEventHandler):
    """A handler for newly created files."""
    def on_created(self, event):
        if event.is_directory:
            return

        file_path = event.src_path
        filename = os.path.basename(file_path)
        
        print(f"\n✨ New file detected: {filename}")

        # Here you could trigger a pop-up to ask for a user caption.
        user_caption = None

        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            analysis_data = analyze_image(file_path, user_caption=user_caption)
            if analysis_data:
                add_item(analysis_data)
        
        elif filename.lower().endswith('.pdf'):
            list_of_page_data = analyze_pdf(file_path, user_caption=user_caption)
            if list_of_page_data:
                for page_data in list_of_page_data:
                    add_item(page_data)

def main():
    print("Starting Context Background Monitor ")
    print(f"Watching for new files in: {PATHS_TO_WATCH}")
    
    event_handler = NewFileHandler()
    observer = Observer()
    for path in PATHS_TO_WATCH:
        if os.path.exists(path):
            observer.schedule(event_handler, path, recursive=True)
        else:
            print(f"Warning: Path not found and will not be watched: {path}")

    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
    print("Monitor stopped.")

if __name__ == "__main__":
    main()