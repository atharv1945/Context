# src/maps_manager.py

import sqlite3
import os

DB_FILE = "context_maps.db"
DB_PATH = os.path.join(os.path.dirname(__file__), '..', DB_FILE)  # DB in project root


def init_db():
    """Initializes the database and creates tables if they don't exist."""
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()

        # Maps
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS maps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            )
        ''')

        # Nodes
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS nodes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                map_id INTEGER,
                file_path TEXT NOT NULL,
                position_x INTEGER,
                position_y INTEGER,
                FOREIGN KEY (map_id) REFERENCES maps (id)
            )
        ''')

        # Edges
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS edges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                map_id INTEGER,
                source_node_id INTEGER,
                target_node_id INTEGER,
                label TEXT,
                FOREIGN KEY (map_id) REFERENCES maps (id),
                FOREIGN KEY (source_node_id) REFERENCES nodes (id),
                FOREIGN KEY (target_node_id) REFERENCES nodes (id)
            )
        ''')

        conn.commit()
        print("✅ Maps database initialized.")


# --- Map Management Functions ---

def create_map(name: str) -> int:
    """Creates a new map and returns its ID."""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO maps (name) VALUES (?)", (name,))
            conn.commit()
            return cursor.lastrowid
    except sqlite3.IntegrityError:
        # Map already exists
        return None


def get_all_maps() -> list:
    """Returns a list of all available maps."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT id, name FROM maps")
        return [dict(row) for row in cursor.fetchall()]


# --- Node & Edge Functions ---

def add_node_to_map(map_id: int, file_path: str, x: int, y: int) -> int:
    """Adds a file node to a specific map at a given position."""
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO nodes (map_id, file_path, position_x, position_y) VALUES (?, ?, ?, ?)",
            (map_id, file_path, x, y)
        )
        conn.commit()
        return cursor.lastrowid


def create_edge(map_id: int, source_id: int, target_id: int, label: str) -> int:
    """Creates an edge between two nodes on a map."""
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO edges (map_id, source_node_id, target_node_id, label) VALUES (?, ?, ?, ?)",
            (map_id, source_id, target_id, label)
        )
        conn.commit()
        return cursor.lastrowid


def get_map_data(map_id: int) -> dict:
    """Retrieves all nodes and edges for a given map to be drawn on the UI."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Get nodes
        cursor.execute("SELECT id, file_path, position_x, position_y FROM nodes WHERE map_id = ?", (map_id,))
        nodes = [dict(row) for row in cursor.fetchall()]

        # Get edges
        cursor.execute("SELECT id, source_node_id, target_node_id, label FROM edges WHERE map_id = ?", (map_id,))
        edges = [dict(row) for row in cursor.fetchall()]

        return {"nodes": nodes, "edges": edges}


# --- Initialize DB if not present ---
if not os.path.exists(DB_PATH):
    init_db()
