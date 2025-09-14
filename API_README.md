# Context Search API

A FastAPI-based REST API for searching through indexed files using AI-powered semantic search.

## Quick Start

1. **Install dependencies:**

   ```bash
   pip install -r requirement.txt
   ```

2. **Start the API server:**

   ```bash
   python start_api.py
   ```

3. **Test the API:**
   ```bash
   python test_api.py
   ```

## API Endpoints

### GET /search

Search through indexed files using semantic search.

**Parameters:**

- `q` (string, required): Search query text
- `limit` (integer, optional): Maximum number of results (default: 5, max: 50)

**Example Request:**

```
GET http://127.0.0.1:8000/search?q=ID card financials&limit=3
```

**Example Response:**

```json
[
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
  }
]
```

### POST /index-file

Manually index a file from any location.

**Request Body (JSON):**

```json
{
  "file_path": "C:/path/to/some/other/file.pdf",
  "user_caption": "This is an optional note from the user."
}
```

**Example Request:**

```bash
curl -X POST "http://127.0.0.1:8000/index-file" \
  -H "Content-Type: application/json" \
  -d '{
    "file_path": "C:/Users/athar/Desktop/document.pdf",
    "user_caption": "Important contract document"
  }'
```

**Example Response (202 Accepted):**

```json
{
  "status": "File accepted for processing",
  "message": "File 'document.pdf' is being indexed in the background."
}
```

**Supported File Types:**

- PNG, JPG, JPEG (images)
- PDF (documents)

### DELETE /indexed-file

Remove a file from the database ("Remove from Context").

**Request Body (JSON):**

```json
{
  "file_path": "C:/path/to/the/file_to_delete.jpg"
}
```

**Example Request:**

```bash
curl -X DELETE "http://127.0.0.1:8000/indexed-file" \
  -H "Content-Type: application/json" \
  -d '{
    "file_path": "C:/Users/athar/Desktop/old_document.pdf"
  }'
```

**Example Response (200 OK):**

```json
{
  "status": "File removed from Context",
  "message": "File 'old_document.pdf' has been removed from the database."
}
```

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "healthy",
  "service": "context-search-api"
}
```

### GET /

Root endpoint with API information.

## Graph and Map Management Endpoints

### GET /graph/entity

Retrieves all files and entities connected to a specific tag (AI-Generated Graph).

**Parameters:**

- `name` (string, required): Entity/tag name to generate graph for (e.g., "Samsung", "Q3 2025")

**Example Request:**

```
GET http://127.0.0.1:8000/graph/entity?name=Samsung
```

**Example Response:**

```json
{
  "nodes": [
    {
      "id": "Samsung",
      "label": "Samsung",
      "type": "entity"
    },
    {
      "id": "C:/Users/athar/Downloads/report.pdf_page_3",
      "label": "report.pdf_page_3",
      "type": "file",
      "metadata": {
        "file_path": "C:/Users/athar/Downloads/report.pdf_page_3",
        "tags": ["Samsung", "Q3 2025"]
      }
    }
  ],
  "edges": [
    {
      "from": "Samsung",
      "to": "C:/Users/athar/Downloads/report.pdf_page_3",
      "label": "mentions"
    }
  ]
}
```

### POST /maps

Creates a new, empty user-curated map.

**Request Body (JSON):**

```json
{
  "name": "My Thesis Project"
}
```

**Example Response (200 OK):**

```json
{
  "id": 1,
  "name": "My Thesis Project"
}
```

### GET /maps

Lists all available user-curated maps.

**Example Response:**

```json
[
  {
    "id": 1,
    "name": "My Thesis Project"
  },
  {
    "id": 2,
    "name": "Research Papers"
  }
]
```

### GET /maps/{map_id}

Gets all nodes and edges for a specific user-curated map.

**Example Request:**

```
GET http://127.0.0.1:8000/maps/1
```

**Example Response:**

```json
{
  "nodes": [
    {
      "id": 1,
      "file_path": "C:/Users/athar/Desktop/document1.pdf",
      "position_x": 100,
      "position_y": 150
    },
    {
      "id": 2,
      "file_path": "C:/Users/athar/Desktop/image1.jpg",
      "position_x": 300,
      "position_y": 200
    }
  ],
  "edges": [
    {
      "id": 1,
      "source_node_id": 1,
      "target_node_id": 2,
      "label": "references"
    }
  ]
}
```

### POST /maps/{map_id}/nodes

Adds a file node to a specific user-curated map.

**Request Body (JSON):**

```json
{
  "file_path": "C:/path/to/file.pdf",
  "x": 100,
  "y": 150
}
```

**Example Response (200 OK):**

```json
{
  "status": "Node added successfully",
  "message": "File 'file.pdf' added to map as node 3"
}
```

### POST /maps/{map_id}/edges

Creates a labeled connection between two nodes in a user-curated map.

**Request Body (JSON):**

```json
{
  "source_id": 1,
  "target_id": 2,
  "label": "cites"
}
```

**Example Response (200 OK):**

```json
{
  "status": "Edge created successfully",
  "message": "Connection 'cites' created between nodes 1 and 2 (edge 1)"
}
```

## Response Format

Each search result contains:

- `file_path`: Full path to the file
- `type`: File type (`image`, `pdf`, `pdf_page`, or `unknown`)
- `tags`: Array of extracted tags from the file
- `user_caption`: User-provided caption for the file
- `similarity`: Similarity score (0.0 to 1.0, higher is more similar)

For PDF pages, additional fields:

- `original_pdf_path`: Path to the original PDF file
- `page_num`: Page number within the PDF

## Development

### Running the Server

```bash
# Using the startup script (recommended)
python start_api.py

# Or directly with uvicorn
python api_server.py
```

### Testing

```bash
# Run the test suite
python test_api.py

# Test specific queries
curl "http://127.0.0.1:8000/search?q=your search query"
```

### API Documentation

Once the server is running, visit:

- Interactive docs: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

## Integration with Frontend

The API is designed to work seamlessly with a desktop GUI. The frontend should:

1. Make GET requests to `/search` with the user's query
2. Display results in a user-friendly format
3. Handle file opening when users click on results
4. Show similarity scores and metadata

Example frontend integration:

```javascript
async function searchFiles(query) {
  const response = await fetch(
    `http://127.0.0.1:8000/search?q=${encodeURIComponent(query)}&limit=10`
  );
  const results = await response.json();
  return results;
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `422`: Validation error (invalid parameters)
- `500`: Internal server error

Error responses include a `detail` field with the error message.
