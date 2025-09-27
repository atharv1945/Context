// API endpoints and configuration constants

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export const API_ENDPOINTS = {
  // Search endpoints
  SEARCH: "/search",

  // File management endpoints
  INDEX_FILE: "/index-file",
  INDEXED_FILE: "/indexed-file",

  // Graph endpoints
  GRAPH_ENTITY: "/graph/entity",
  GRAPH_ALL: "/graph/all",

  // Mind map endpoints
  MAPS: "/maps",
  MAP_NODES: (mapId: string) => `/maps/${mapId}/nodes`,
  MAP_EDGES: (mapId: string) => `/maps/${mapId}/edges`,

  // Health endpoint
  HEALTH: "/health",
} as const;

export const DEFAULT_LIMITS = {
  SEARCH_RESULTS: 20,
  MAP_NODES: 100,
  GRAPH_NODES: 50,
} as const;

export const SUPPORTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const QUERY_KEYS = {
  SEARCH: "search",
  HEALTH: "health",
  MAPS: "maps",
  MAP: "map",
  GRAPH: "graph",
} as const;
