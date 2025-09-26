from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import threading

# Initialize FastAPI app
app = FastAPI(
    title="Context Search API",
    description="API for searching through indexed files using AI-powered semantic search",
    version="1.0.0"
)

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "https://preview--synth-map.lovable.app"],  # Allow your Loveable frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response bodies
class IndexFileRequest(BaseModel):
    file_path: str
    user_caption: Optional[str] = None

class DeleteFileRequest(BaseModel):
    file_path: str

class StatusResponse(BaseModel):
    status: str
    message: Optional[str] = None

class CreateMapRequest(BaseModel):
    name: str

class AddNodeRequest(BaseModel):
    file_path: str
    x: int
    y: int

class CreateEdgeRequest(BaseModel):
    source_id: int
    target_id: int
    label: str

class MapResponse(BaseModel):
    id: int
    name: str

class GraphResponse(BaseModel):
    nodes: List[dict]
    edges: List[dict]

def mock_search_results(query_text: str, limit: int) -> List[dict]:
    """Mock search results for testing when the AI backend isn't available."""
    return [
        {
            "file_path": "C:/Users/athar/Desktop/back.jpg",
            "type": "image",
            "tags": ["ID CARD", "BACK COVER"],
            "user_caption": "ID CARD BACK COVER",
            "similarity": 0.85
        },
        {
            "file_path": "C:/Users/athar/Downloads/report.pdf_page_3",
            "type": "pdf_page",
            "original_pdf_path": "C:/Users/athar/Downloads/report.pdf",
            "page_num": 3,
            "tags": ["Samsung", "Q3 2025"],
            "user_caption": "Financials",
            "similarity": 0.78
        },
        {
            "file_path": "C:/Users/athar/Documents/contract.pdf",
            "type": "pdf",
            "tags": ["CONTRACT", "LEGAL"],
            "user_caption": "Service Agreement",
            "similarity": 0.65
        }
    ][:limit]

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Context Search API",
        "version": "1.0.0",
        "status": "running (mock mode - AI backend not available)",
        "endpoints": {
            "/search": "Search through indexed files",
            "/health": "Health check endpoint"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "context-search-api", "mode": "mock"}

@app.get("/search")
async def search_files(
    q: str = Query(..., description="Search query text", min_length=1),
    limit: int = Query(5, description="Maximum number of results to return", ge=1, le=50)
):
    """
    Search through indexed files using semantic search.
    
    - **q**: The search query text (required)
    - **limit**: Maximum number of results to return (default: 5, max: 50)
    
    Returns a JSON array of search results with file information and similarity scores.
    """
    try:
        # For now, return mock results since the AI backend has dependency issues
        # In production, this would call the actual search function from database_manager
        results = mock_search_results(q, limit)
        
        return results
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Search failed: {str(e)}"
        )

@app.post("/index-file", response_model=StatusResponse)
async def index_file(request: IndexFileRequest):
    """
    Manually index a file from any location.
    
    - **file_path**: Full path to the file to index
    - **user_caption**: Optional caption/note for the file
    
    Returns a status message indicating the file was accepted for processing.
    """
    try:
        # Validate that the file exists
        if not os.path.exists(request.file_path):
            raise HTTPException(
                status_code=404,
                detail=f"File not found: {request.file_path}"
            )
        
        # Check if it's a supported file type
        filename = os.path.basename(request.file_path)
        if not (filename.lower().endswith(('.png', '.jpg', '.jpeg', '.pdf'))):
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Only PNG, JPG, JPEG, and PDF files are supported."
            )
        
        # In mock mode, just simulate processing
        def mock_process_file():
            print(f"Mock: Processing file {request.file_path} with caption: {request.user_caption}")
            # Simulate processing time
            import time
            time.sleep(2)
            print(f"Mock: File {request.file_path} processed successfully")
        
        thread = threading.Thread(target=mock_process_file, daemon=True)
        thread.start()
        
        return StatusResponse(
            status="File accepted for processing",
            message=f"File '{filename}' is being indexed in the background (mock mode)."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process file: {str(e)}"
        )

@app.delete("/indexed-file", response_model=StatusResponse)
async def delete_indexed_file(request: DeleteFileRequest):
    """
    Remove a file from the database ("Remove from Context").
    
    - **file_path**: Full path to the file to remove from the database
    
    Returns a status message confirming the file was removed.
    """
    try:
        # In mock mode, just simulate deletion
        print(f"Mock: Removing file {request.file_path} from database")
        
        filename = os.path.basename(request.file_path)
        return StatusResponse(
            status="File removed from Context",
            message=f"File '{filename}' has been removed from the database (mock mode)."
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to remove file: {str(e)}"
        )

# --- Graph and Map Management Endpoints (Mock Mode) ---

@app.get("/graph/entity", response_model=GraphResponse)
async def get_entity_graph(name: str = Query(..., description="Entity name to generate graph for")):
    """
    Retrieves all files and entities connected to a specific tag (AI-Generated Graph).
    Mock implementation for testing.
    """
    try:
        # Mock graph data
        mock_graph = {
            "nodes": [
                {"id": name, "label": name, "type": "entity"},
                {"id": "file1.pdf", "label": "file1.pdf", "type": "file", "metadata": {"file_path": "C:/test/file1.pdf"}},
                {"id": "file2.jpg", "label": "file2.jpg", "type": "file", "metadata": {"file_path": "C:/test/file2.jpg"}}
            ],
            "edges": [
                {"from": name, "to": "file1.pdf", "label": "mentions"},
                {"from": name, "to": "file2.jpg", "label": "mentions"}
            ]
        }
        
        print(f"Mock: Generated graph for entity '{name}'")
        return GraphResponse(nodes=mock_graph["nodes"], edges=mock_graph["edges"])
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate graph for entity '{name}': {str(e)}"
        )

@app.post("/maps", response_model=MapResponse)
async def create_new_map(request: CreateMapRequest):
    """
    Creates a new, empty user-curated map.
    Mock implementation for testing.
    """
    try:
        # Mock map creation
        mock_map_id = 123
        print(f"Mock: Created map '{request.name}' with ID {mock_map_id}")
        
        return MapResponse(id=mock_map_id, name=request.name)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create map: {str(e)}"
        )

@app.get("/maps", response_model=List[MapResponse])
async def list_all_maps():
    """
    Lists all available user-curated maps.
    Mock implementation for testing.
    """
    try:
        # Mock maps data
        mock_maps = [
            {"id": 1, "name": "My Thesis Project"},
            {"id": 2, "name": "Research Papers"},
            {"id": 3, "name": "Meeting Notes"}
        ]
        
        print("Mock: Retrieved all maps")
        return [MapResponse(id=map["id"], name=map["name"]) for map in mock_maps]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve maps: {str(e)}"
        )

@app.get("/maps/{map_id}", response_model=GraphResponse)
async def get_map_details(map_id: int):
    """
    Gets all nodes and edges for a specific user-curated map.
    Mock implementation for testing.
    """
    try:
        # Mock map data
        mock_map_data = {
            "nodes": [
                {"id": 1, "file_path": "C:/test/document1.pdf", "position_x": 100, "position_y": 150},
                {"id": 2, "file_path": "C:/test/image1.jpg", "position_x": 300, "position_y": 200}
            ],
            "edges": [
                {"id": 1, "source_node_id": 1, "target_node_id": 2, "label": "references"}
            ]
        }
        
        print(f"Mock: Retrieved map data for map ID {map_id}")
        return GraphResponse(nodes=mock_map_data["nodes"], edges=mock_map_data["edges"])
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve map data: {str(e)}"
        )

@app.post("/maps/{map_id}/nodes", response_model=StatusResponse)
async def add_node_to_user_map(map_id: int, request: AddNodeRequest):
    """
    Adds a file node to a specific user-curated map.
    Mock implementation for testing.
    """
    try:
        # Mock node addition
        mock_node_id = 456
        filename = os.path.basename(request.file_path)
        
        print(f"Mock: Added node '{filename}' to map {map_id} at position ({request.x}, {request.y})")
        
        return StatusResponse(
            status="Node added successfully",
            message=f"File '{filename}' added to map as node {mock_node_id}"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add node to map: {str(e)}"
        )

@app.post("/maps/{map_id}/edges", response_model=StatusResponse)
async def create_edge_in_user_map(map_id: int, request: CreateEdgeRequest):
    """
    Creates a labeled connection between two nodes in a user-curated map.
    Mock implementation for testing.
    """
    try:
        # Mock edge creation
        mock_edge_id = 789
        
        print(f"Mock: Created edge '{request.label}' between nodes {request.source_id} and {request.target_id} in map {map_id}")
        
        return StatusResponse(
            status="Edge created successfully",
            message=f"Connection '{request.label}' created between nodes {request.source_id} and {request.target_id} (edge {mock_edge_id})"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create edge: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    print("Starting Context Search API server (Mock Mode)...")
    print("API will be available at: http://127.0.0.1:8000")
    print("API documentation at: http://127.0.0.1:8000/docs")
    print("Note: Running in mock mode due to AI dependency issues")
    uvicorn.run(app, host="127.0.0.1", port=8000)
