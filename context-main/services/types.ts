// Core TypeScript interfaces for the application

// File and Search Types
export interface SearchResult {
  file_path: string;
  type: "pdf" | "pdf_page" | "image";
  tags: string[];
  user_caption?: string;
  similarity: number;
  original_pdf_path?: string; // for pdf_page type
  page_num?: number; // for pdf_page type
}

export interface IndexedFile {
  file_path: string;
  user_caption?: string;
}

// Graph Types
export interface GraphNode {
  id: string;
  label: string;
  type: "entity" | "file";
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Mind Map Types
export interface MindMap {
  id: number;
  name: string;
}

export interface MapNode {
  id: number;
  file_path: string;
  position_x: number;
  position_y: number;
}

export interface MapEdge {
  id: number;
  source_node_id: number;
  target_node_id: number;
  label: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface HealthStatus {
  status: string;
  service: string;
  mode: string;
}

// Error Types
export class ApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = "Network connection failed") {
    super(message);
    this.name = "NetworkError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ServerError extends ApiError {
  constructor(message: string = "Server error occurred") {
    super(message, 500);
    this.name = "ServerError";
  }
}
