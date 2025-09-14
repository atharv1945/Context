#!/usr/bin/env python3
"""
Startup script for the Context Search API.
This script ensures the database is initialized before starting the API server.
"""

import sys
import os

# Add the current directory to Python path so we can import our modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def main():
    """Start the API server with proper initialization."""
    print("🚀 Starting Context Search API Server")
    print("=" * 50)
    
    # Import and initialize the database manager to ensure it's ready
    try:
        from src.database_manager import COLLECTION, CLIENT
        if CLIENT is None or COLLECTION is None:
            print("❌ Database initialization failed. Please check your ChromaDB setup.")
            return
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        return
    
    # Import and start the API server
    try:
        import uvicorn
        from api_server import app
        
        print("✅ API server ready")
        print("🌐 Server will be available at: http://127.0.0.1:8000")
        print("📚 API documentation at: http://127.0.0.1:8000/docs")
        print("🔍 Test the API with: python test_api.py")
        print("\nPress Ctrl+C to stop the server")
        print("=" * 50)
        
        uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting API server: {e}")

if __name__ == "__main__":
    main()
