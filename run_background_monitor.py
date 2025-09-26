import time
import os
import threading
import logging
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from typing import Set

from src.pipeline import analyze_image, analyze_pdf
from src.database_manager import add_item, delete_item
from src.config import PATHS_TO_WATCH, SUPPORTED_EXTENSIONS, IGNORED_PATTERNS, POLLING_INTERVAL_SECONDS

# --- Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

PROCESSED_FILES: Set[str] = set()
PROCESSING_LOCK = threading.Lock()
SHUTDOWN_EVENT = threading.Event()

def is_valid_file(file_path: str) -> bool:
    """Checks if a file is valid for processing."""
    filename = os.path.basename(file_path)
    if not os.path.exists(file_path):
        return False
    if filename.startswith('.'):
        return False
    if not filename.lower().endswith(SUPPORTED_EXTENSIONS):
        return False
    if any(p in filename.lower() for p in IGNORED_PATTERNS):
        return False
    return True

def process_file(file_path: str, user_caption: str = None):
    """Handles the analysis and database addition for a single file."""
    filename = os.path.basename(file_path)
    logging.info(f"Starting analysis for: {filename}")

    # --- Analyze and add to database ---
    try:
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            analysis_data = analyze_image(file_path, user_caption=user_caption)
            if analysis_data:
                add_item(analysis_data)
        elif filename.lower().endswith('.pdf'):
            list_of_page_data = analyze_pdf(file_path, user_caption=user_caption)
            if list_of_page_data:
                for page_data in list_of_page_data:
                    add_item(page_data)
    except Exception as e:
        logging.error(f"An unexpected error occurred during analysis of {filename}: {e}")

def wait_for_file_stability_and_process(file_path: str, user_caption: str = None, interactive: bool = False):
    """
    Waits for a file to stop changing in size before processing.
    This is crucial for large files that are still being written to disk.
    """
    filename = os.path.basename(file_path)
    logging.info(f"File '{filename}' detected. Waiting for it to stabilize...")

    # --- Get optional user caption if running interactively ---
    if interactive:
        print("-" * 30)
        user_caption = input(f" > Add an optional note for '{filename}' (or press Enter to skip): ")
        print("-" * 30)
    
    user_caption = user_caption.strip() if user_caption else None

    last_size = -1
    stable_checks = 0
    max_stable_checks = 3  # Require the size to be stable for 3 checks (6 seconds)

    for _ in range(120): # Wait for a total of ~4 minutes before timing out
        if SHUTDOWN_EVENT.is_set():
            logging.info("Shutdown signal received, stopping stability check.")
            return

        try:
            if not os.path.exists(file_path):
                logging.warning(f"File '{filename}' was removed before it could be processed.")
                return

            current_size = os.path.getsize(file_path)
            if current_size == last_size and current_size > 0:
                stable_checks += 1
            else:
                stable_checks = 0  # Reset if size changes

            if stable_checks >= max_stable_checks:
                logging.info(f"File '{filename}' is stable. Proceeding with processing.")
                process_file(file_path, user_caption)
                return

            last_size = current_size
            time.sleep(2)
        except (OSError, FileNotFoundError):
            logging.warning(f"Could not access '{filename}'. Retrying...")
            time.sleep(2)

    logging.warning(f"Timed out waiting for '{filename}' to stabilize. Skipping.")

def process_file_if_new(file_path: str, user_caption: str = None, interactive: bool = False):
    """Schedules a file for processing if it's new and valid."""
    global PROCESSED_FILES
    if not is_valid_file(file_path):
        return

    with PROCESSING_LOCK:
        if file_path in PROCESSED_FILES:
            return
        PROCESSED_FILES.add(file_path)

    # Process each file in a separate thread to avoid blocking the main loop
    thread = threading.Thread(target=wait_for_file_stability_and_process, args=(file_path, user_caption, interactive))
    thread.start()

def handle_deleted_file(file_path: str):
    """Removes a file from the processed set and the database."""
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
            handle_deleted_file(event.src_path)
            process_file_if_new(event.dest_path)

    def on_deleted(self, event):
        if not event.is_directory:
            handle_deleted_file(event.src_path)

def polling_safety_net(paths: list[str]):
    """Periodically scans watched paths to catch any missed file events."""
    logging.info(f"Safety net poller started. Will scan every {POLLING_INTERVAL_SECONDS} seconds.")
    while not SHUTDOWN_EVENT.is_set():
        try:
            for path in paths:
                if os.path.exists(path):
                    for root, _, files in os.walk(path):
                        for filename in files:
                            file_path = os.path.join(root, filename)
                            process_file_if_new(file_path)
        except Exception as e:
            logging.error(f"Error during polling safety net: {e}")
        SHUTDOWN_EVENT.wait(POLLING_INTERVAL_SECONDS)

def main(interactive: bool = False):
    logging.info("Starting Context Background Monitor...")
    logging.info(f"Watching for new files in: {PATHS_TO_WATCH}")

    # 1. Start Polling Safety Net
    poller_thread = threading.Thread(target=polling_safety_net, args=(PATHS_TO_WATCH,))
    poller_thread.start()

    # 2. Start Real-Time Watchdog Observer
    event_handler = FileEventHandler()
    observer = Observer()
    for path in PATHS_TO_WATCH:
        if os.path.exists(path):
            observer.schedule(event_handler, path, recursive=True)
        else:
            logging.warning(f"Path not found and will not be watched: {path}")

    observer.start()

    # 3. Wait for shutdown signal
    try:
        while not SHUTDOWN_EVENT.is_set():
            time.sleep(1)
    except KeyboardInterrupt:
        logging.info("Shutdown signal received. Stopping monitor...")
        SHUTDOWN_EVENT.set()
        observer.stop()

    observer.join()
    poller_thread.join()
    logging.info("--- Monitor stopped successfully. ---")

if __name__ == "__main__":
    main(interactive=True)