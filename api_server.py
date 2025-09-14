from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import threading
from src.database_manager import search, delete_item, get_graph_for_entity
from src.map_manager import create_map, get_all_maps, get_map_data, add_node_to_map, create_edge
from run_background_monitor import process_file_if_new

# Initialize FastAPI app
app = FastAPI(
    title="Context Search API",
    description="API for searching through indexed files using AI-powered semantic search",
    version="1.0.0"
)

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
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

def determine_file_type(file_path: str) -> str:
    """Determine the file type based on the file path."""
    if file_path.endswith('.pdf'):
        return "pdf"
    elif any(file_path.lower().endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff']):
        return "image"
    else:
        return "unknown"

def extract_pdf_info(file_path: str) -> dict:
    """Extract PDF page information from file path."""
    if "_page_" in file_path:
        # This is a PDF page
        base_path = file_path.rsplit("_page_", 1)[0]
        page_num = int(file_path.rsplit("_page_", 1)[1])
        return {
            "original_pdf_path": base_path,
            "page_num": page_num
        }
    return {}

def format_search_results(search_results: dict, limit: int) -> List[dict]:
    """Format the search results into the required JSON structure."""
    if not search_results or not search_results.get('metadatas'):
        return []
    
    formatted_results = []
    
    # Get the metadata and distances from the search results
    metadatas = search_results['metadatas'][0]  # First (and only) query
    distances = search_results['distances'][0]  # First (and only) query
    
    for i, (metadata, distance) in enumerate(zip(metadatas, distances)):
        if i >= limit:
            break
            
        file_path = metadata['file_path']
        file_type = determine_file_type(file_path)
        
        # Calculate similarity score (1 - distance, since lower distance = higher similarity)
        similarity = max(0.0, 1.0 - distance)
        
        result = {
            "file_path": file_path,
            "type": file_type,
            "tags": metadata.get('tags', []),
            "user_caption": metadata.get('user_caption', ''),
            "similarity": round(similarity, 2)
        }
        
        # Add PDF-specific information if it's a PDF page
        if file_type == "pdf" and "_page_" in file_path:
            pdf_info = extract_pdf_info(file_path)
            result.update(pdf_info)
            result["type"] = "pdf_page"
        
        formatted_results.append(result)
    
    return formatted_results

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Context Search API",
        "version": "1.0.0",
        "endpoints": {
            "/search": "Search through indexed files",
            "/health": "Health check endpoint"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "context-search-api"}

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
        # Call the search function from database_manager
        search_results = search(query_text=q, n_results=limit)
        
        # Format the results according to the API specification
        formatted_results = format_search_results(search_results, limit)
        
        return formatted_results
        
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
        
        # Process the file in a background thread to avoid blocking the API
        def process_file():
            try:
                process_file_if_new(request.file_path, user_caption=request.user_caption)
            except Exception as e:
                print(f"Error processing file {request.file_path}: {e}")
        
        thread = threading.Thread(target=process_file, daemon=True)
        thread.start()
        
        return StatusResponse(
            status="File accepted for processing",
            message=f"File '{filename}' is being indexed in the background."
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
        # Call the delete function from database_manager
        delete_item(request.file_path)
        
        filename = os.path.basename(request.file_path)
        return StatusResponse(
            status="File removed from Context",
            message=f"File '{filename}' has been removed from the database."
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to remove file: {str(e)}"
        )

# --- Graph and Map Management Endpoints ---

@app.get("/graph/entity", response_model=GraphResponse)
async def get_entity_graph(name: str = Query(..., description="Entity name to generate graph for")):
    """
    Retrieves all files and entities connected to a specific tag (AI-Generated Graph).
    
    - **name**: The entity/tag name to generate a graph for (e.g., "Samsung", "Q3 2025")
    
    Returns a graph structure with nodes and edges showing relationships.
    """
    try:
        graph_data = get_graph_for_entity(name)
        return GraphResponse(nodes=graph_data.get("nodes", []), edges=graph_data.get("edges", []))
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate graph for entity '{name}': {str(e)}"
        )

@app.post("/maps", response_model=MapResponse)
async def create_new_map(request: CreateMapRequest):
    """
    Creates a new, empty user-curated map.
    
    - **name**: The name of the new map
    
    Returns the created map with its ID.
    """
    try:
        map_id = create_map(request.name)
        if map_id is None:
            raise HTTPException(
                status_code=409,
                detail=f"Map with name '{request.name}' already exists"
            )
        
        return MapResponse(id=map_id, name=request.name)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create map: {str(e)}"
        )

@app.get("/maps", response_model=List[MapResponse])
async def list_all_maps():
    """
    Lists all available user-curated maps.
    
    Returns a list of all maps with their IDs and names.
    """
    try:
        maps = get_all_maps()
        return [MapResponse(id=map["id"], name=map["name"]) for map in maps]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve maps: {str(e)}"
        )

@app.get("/maps/{map_id}", response_model=GraphResponse)
async def get_map_details(map_id: int):
    """
    Gets all nodes and edges for a specific user-curated map.
    
    - **map_id**: The ID of the map to retrieve
    
    Returns the map data with nodes and edges.
    """
    try:
        map_data = get_map_data(map_id)
        if not map_data["nodes"] and not map_data["edges"]:
            # Check if map exists by trying to get all maps
            all_maps = get_all_maps()
            if not any(map["id"] == map_id for map in all_maps):
                raise HTTPException(
                    status_code=404,
                    detail=f"Map with ID {map_id} not found"
                )
        
        return GraphResponse(nodes=map_data["nodes"], edges=map_data["edges"])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve map data: {str(e)}"
        )

@app.post("/maps/{map_id}/nodes", response_model=StatusResponse)
async def add_node_to_user_map(map_id: int, request: AddNodeRequest):
    """
    Adds a file node to a specific user-curated map.
    
    - **map_id**: The ID of the map to add the node to
    - **file_path**: Path to the file to add as a node
    - **x**: X coordinate position on the map
    - **y**: Y coordinate position on the map
    
    Returns confirmation that the node was added.
    """
    try:
        # Validate that the map exists
        all_maps = get_all_maps()
        if not any(map["id"] == map_id for map in all_maps):
            raise HTTPException(
                status_code=404,
                detail=f"Map with ID {map_id} not found"
            )
        
        # Validate that the file exists
        if not os.path.exists(request.file_path):
            raise HTTPException(
                status_code=404,
                detail=f"File not found: {request.file_path}"
            )
        
        node_id = add_node_to_map(map_id, request.file_path, request.x, request.y)
        
        filename = os.path.basename(request.file_path)
        return StatusResponse(
            status="Node added successfully",
            message=f"File '{filename}' added to map as node {node_id}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add node to map: {str(e)}"
        )

@app.post("/maps/{map_id}/edges", response_model=StatusResponse)
async def create_edge_in_user_map(map_id: int, request: CreateEdgeRequest):
    """
    Creates a labeled connection between two nodes in a user-curated map.
    
    - **map_id**: The ID of the map to add the edge to
    - **source_id**: ID of the source node
    - **target_id**: ID of the target node
    - **label**: Label for the connection (e.g., "cites", "references", "relates to")
    
    Returns confirmation that the edge was created.
    """
    try:
        # Validate that the map exists
        all_maps = get_all_maps()
        if not any(map["id"] == map_id for map in all_maps):
            raise HTTPException(
                status_code=404,
                detail=f"Map with ID {map_id} not found"
            )
        
        # Validate that both nodes exist in this map
        map_data = get_map_data(map_id)
        node_ids = [node["id"] for node in map_data["nodes"]]
        
        if request.source_id not in node_ids:
            raise HTTPException(
                status_code=404,
                detail=f"Source node {request.source_id} not found in map {map_id}"
            )
        
        if request.target_id not in node_ids:
            raise HTTPException(
                status_code=404,
                detail=f"Target node {request.target_id} not found in map {map_id}"
            )
        
        edge_id = create_edge(map_id, request.source_id, request.target_id, request.label)
        
        return StatusResponse(
            status="Edge created successfully",
            message=f"Connection '{request.label}' created between nodes {request.source_id} and {request.target_id} (edge {edge_id})"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create edge: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    print("Starting Context Search API server...")
    print("API will be available at: http://127.0.0.1:8000")
    print("API documentation at: http://127.0.0.1:8000/docs")
    uvicorn.run(app, host="127.0.0.1", port=8000)
