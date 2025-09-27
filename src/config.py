import os

# --- Core Paths ---

# Directories to monitor for new files.
# Add any paths you want to watch here.
PATHS_TO_WATCH = [
    # A specific project folder for testing
    os.path.expanduser(r"C:\Users\ashvi\OneDrive\Desktop\test_folder"),
]

# --- File Processing ---

# File extensions to be processed by the pipeline.
SUPPORTED_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.pdf')

# File patterns to ignore during scanning (e.g., temporary download files).
IGNORED_PATTERNS = ('.tmp', '.crdownload', '.part')

# --- Performance Tuning ---
POLLING_INTERVAL_SECONDS = 150 # How often the safety-net poller runs.