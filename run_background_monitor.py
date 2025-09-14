import time
import os
import threading
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from src.pipeline import analyze_image, analyze_pdf
from src.database_manager import add_item, delete_item

# --- Configuration ---
PATHS_TO_WATCH = [
    os.path.expanduser(r"~/Desktop\test_folder"),  # Example path
]

PROCESSED_FILES = set()
PROCESSING_LOCK = threading.Lock()

def process_file_if_new(file_path: str, user_caption: str = None):
    global PROCESSED_FILES
    with PROCESSING_LOCK:
        if file_path in PROCESSED_FILES:
            return 
        filename = os.path.basename(file_path)
        if filename.startswith('.') or filename.endswith(('.tmp', '.crdownload', '.part')):
            return
            
        print(f"New file identified: {filename}")
        PROCESSED_FILES.add(file_path)
        
    #USER CAPTION    
    if user_caption is None:
        print("-" * 30)
        user_caption = input(f" > Add an optional note for '{filename}' (or press Enter to skip): ")
        if not user_caption.strip():
            user_caption = None
        print("-" * 30)
    
    time.sleep(1) 
    last_size = -1
    for _ in range(120): 
        try:
            current_size = os.path.getsize(file_path)
            if current_size > 0 and current_size == last_size:
                print(f"File stable. Proceeding with analysis for {filename}.")
                
                if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                    analysis_data = analyze_image(file_path, user_caption=user_caption)
                    if analysis_data:
                        add_item(analysis_data)
                elif filename.lower().endswith('.pdf'):
                    list_of_page_data = analyze_pdf(file_path, user_caption=user_caption)
                    if list_of_page_data:
                        for page_data in list_of_page_data:
                            add_item(page_data)
                return 
            last_size = current_size
            time.sleep(2)
        except (OSError, FileNotFoundError):
            time.sleep(2) 
            continue
    print(f"Timed out waiting for {filename} to stabilize. Skipping.")

def handle_deleted_file(file_path: str):
    global PROCESSED_FILES
    with PROCESSING_LOCK:
        if file_path in PROCESSED_FILES:
            PROCESSED_FILES.remove(file_path)    
    delete_item(file_path)

class FileEventHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory:
            process_file_if_new(event.src_path)

    def on_moved(self, event):
        if not event.is_directory:
            process_file_if_new(event.dest_path)
    
    def on_deleted(self, event): 
        if not event.is_directory:
            handle_deleted_file(event.src_path)


def polling_safety_net(paths: list[str], interval: int = 150):
    print(f" Safety net poller started. Will scan every {interval} seconds.")
    while True:
        try:
            for path in paths:
                if os.path.exists(path):
                    for root, _, files in os.walk(path):
                        for filename in files:
                            file_path = os.path.join(root, filename)
                            process_file_if_new(file_path)
        except Exception as e:
            print(f"Error during polling: {e}")
        time.sleep(interval)


def main():
    print("Starting Context Background Monitor (Hybrid Mode)")
    print(f"Watching for new files in: {PATHS_TO_WATCH}")
    
    # Polling Safety Net
    poller_thread = threading.Thread(target=polling_safety_net, args=(PATHS_TO_WATCH,), daemon=True)
    poller_thread.start()

    # Real-Time Watchdog Observer 
    event_handler = FileEventHandler()
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
    print("--- Monitor stopped. ---")

if __name__ == "__main__":
    main()