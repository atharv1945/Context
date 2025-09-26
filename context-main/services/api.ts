import {
  SearchResult,
  IndexedFile,
  GraphData,
  MindMap,
  MapNode,
  MapEdge,
  HealthStatus,
  ApiError,
  NetworkError,
  NotFoundError,
  ServerError,
} from "./types";
import { API_BASE_URL, API_ENDPOINTS, DEFAULT_LIMITS } from "./constants";

/**
 * Centralized API service class with fetch wrapper and error handling
 */
export class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetchWithErrorHandling<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      // Debug: log outgoing request
      if (process.env.NODE_ENV !== "production") {
        // Avoid logging large bodies in production
        // eslint-disable-next-line no-console
        console.debug("[ApiService] Request", {
          url,
          method: options.method || "GET",
          headers: options.headers,
          body: options.body,
        });
      }

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        await this.handleHttpError(response);
      }

      const json = await response.json();

      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.debug("[ApiService] Response", {
          url,
          ok: response.ok,
          status: response.status,
          data: json,
        });
      }

      return json as T;
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error("[ApiService] Error", { url, error });
      }
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new NetworkError("Network connection failed");
      }

      throw new ApiError("An unexpected error occurred");
    }
  }

  /**
   * Handle HTTP error responses
   */
  private async handleHttpError(response: Response): Promise<never> {
    const statusCode = response.status;
    let errorMessage = "An error occurred";

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If we can't parse the error response, use status text
      errorMessage = response.statusText || errorMessage;
    }

    switch (statusCode) {
      case 404:
        throw new NotFoundError(errorMessage);
      case 400:
      case 422:
        throw new ApiError(errorMessage, statusCode);
      case 401:
        throw new ApiError("Unauthorized access", statusCode);
      case 403:
        throw new ApiError("Access forbidden", statusCode);
      case 429:
        throw new ApiError("Too many requests", statusCode);
      case 500:
      case 502:
      case 503:
      case 504:
        throw new ServerError(errorMessage);
      default:
        throw new ApiError(errorMessage, statusCode);
    }
  }

  // Search operations
  async search(
    query: string,
    limit: number = DEFAULT_LIMITS.SEARCH_RESULTS
  ): Promise<SearchResult[]> {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });

    return this.fetchWithErrorHandling<SearchResult[]>(
      `${API_ENDPOINTS.SEARCH}?${params}`
    );
  }

  // File management operations
  async indexFile(
    filePath: string,
    userCaption?: string
  ): Promise<{ status: string; message: string }> {
    return this.fetchWithErrorHandling<{ status: string; message: string }>(
      API_ENDPOINTS.INDEX_FILE,
      {
        method: "POST",
        body: JSON.stringify({
          file_path: filePath,
          user_caption: userCaption,
        }),
      }
    );
  }

  async deleteIndexedFile(
    filePath: string
  ): Promise<{ status: string; message: string }> {
    return this.fetchWithErrorHandling<{ status: string; message: string }>(
      API_ENDPOINTS.INDEXED_FILE,
      {
        method: "DELETE",
        body: JSON.stringify({
          file_path: filePath,
        }),
      }
    );
  }

  // Graph operations
  async getGraphData(entityName?: string): Promise<GraphData> {
    const params = entityName ? new URLSearchParams({ name: entityName }) : "";
    const endpoint = params
      ? `${API_ENDPOINTS.GRAPH_ENTITY}?${params}`
      : API_ENDPOINTS.GRAPH_ENTITY;

    return this.fetchWithErrorHandling<GraphData>(endpoint);
  }

  // Mind map operations
  async getMaps(): Promise<MindMap[]> {
    return this.fetchWithErrorHandling<MindMap[]>(API_ENDPOINTS.MAPS);
  }

  async createMap(name: string): Promise<MindMap> {
    return this.fetchWithErrorHandling<MindMap>(API_ENDPOINTS.MAPS, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async getMap(id: string): Promise<{ nodes: MapNode[]; edges: MapEdge[] }> {
    return this.fetchWithErrorHandling<{ nodes: MapNode[]; edges: MapEdge[] }>(
      `${API_ENDPOINTS.MAPS}/${id}`
    );
  }

  async deleteMap(id: string): Promise<void> {
    await this.fetchWithErrorHandling<void>(`${API_ENDPOINTS.MAPS}/${id}`, {
      method: "DELETE",
    });
  }

  async addMapNode(
    mapId: string,
    filePath: string,
    x: number,
    y: number
  ): Promise<{ status: string; message: string }> {
    return this.fetchWithErrorHandling<{ status: string; message: string }>(
      API_ENDPOINTS.MAP_NODES(mapId),
      {
        method: "POST",
        body: JSON.stringify({
          file_path: filePath,
          x: x,
          y: y,
        }),
      }
    );
  }

  async addMapEdge(
    mapId: string,
    sourceId: number,
    targetId: number,
    label: string
  ): Promise<{ status: string; message: string }> {
    return this.fetchWithErrorHandling<{ status: string; message: string }>(
      API_ENDPOINTS.MAP_EDGES(mapId),
      {
        method: "POST",
        body: JSON.stringify({
          source_id: sourceId,
          target_id: targetId,
          label: label,
        }),
      }
    );
  }

  // Health monitoring
  async getHealth(): Promise<HealthStatus> {
    return this.fetchWithErrorHandling<HealthStatus>(API_ENDPOINTS.HEALTH);
  }
}

// Export singleton instance
export const apiService = new ApiService();
