"use client";

import { useState, useEffect } from "react";
import { MindMap, MapNode, MapEdge } from "@/services/types";
import { apiService } from "@/services/api";

export interface MapData {
  map: MindMap;
  nodes: MapNode[];
  edges: MapEdge[];
}

export const useMaps = () => {
  const [maps, setMaps] = useState<MindMap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Load all maps
  const loadMaps = async (isRetry: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isRetry) {
        setRetryCount(0);
      }

      const mapsData = await apiService.getMaps();
      setMaps(mapsData);
      setRetryCount(0); // Reset on success
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error(
              "Failed to load maps. Please check your connection and try again."
            );
      setError(error);

      if (isRetry) {
        setRetryCount((prev) => prev + 1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new map
  const createMap = async (name: string): Promise<MindMap> => {
    try {
      const newMap = await apiService.createMap(name);
      setMaps((prev) => [newMap, ...prev]);
      return newMap;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to create map");
      setError(error);
      throw error;
    }
  };

  // Delete a map
  const deleteMap = async (mapId: number): Promise<void> => {
    try {
      await apiService.deleteMap(mapId.toString());
      setMaps((prev) => prev.filter((map) => map.id !== mapId));
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete map");
      setError(error);
      throw error;
    }
  };

  // Load maps on mount
  useEffect(() => {
    loadMaps();
  }, []);

  return {
    maps,
    isLoading,
    error,
    createMap,
    deleteMap,
    refetch: () => loadMaps(true),
    canRetry: retryCount < 3 && !!error,
    retryCount,
  };
};

export const useMap = (mapId: string) => {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Load specific map with nodes and edges
  const loadMap = async (isRetry: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isRetry) {
        setRetryCount(0);
      }

      const data = await apiService.getMap(mapId);

      // Transform backend data to frontend format
      const transformedNodes: MapNode[] = data.nodes.map((node: any) => ({
        id: node.id.toString(),
        label: node.file_path
          ? node.file_path.split("/").pop() || node.file_path
          : `Node ${node.id}`,
        type: node.file_path ? "file" : "concept",
        position: { x: node.position_x, y: node.position_y },
        file_path: node.file_path,
      }));

      const transformedEdges: MapEdge[] = data.edges.map((edge: any) => ({
        id: edge.id.toString(),
        fromNodeId: edge.source_node_id.toString(),
        toNodeId: edge.target_node_id.toString(),
        label: edge.label || undefined,
      }));

      setMapData({
        map: { id: parseInt(mapId), name: "Mind Map" },
        nodes: transformedNodes,
        edges: transformedEdges,
      });
      setRetryCount(0); // Reset on success
    } catch (err) {
      let errorMessage = "Failed to load map";

      if (err instanceof Error) {
        if (err.message.includes("404")) {
          errorMessage = "Map not found. It may have been deleted.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(new Error(errorMessage));

      if (isRetry) {
        setRetryCount((prev) => prev + 1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add a node to the map
  const addNode = async (nodeData: {
    label: string;
    type: "file" | "concept";
    position: { x: number; y: number };
  }): Promise<void> => {
    try {
      // For now, we'll use a placeholder file path for concept nodes
      const filePath =
        nodeData.type === "file" ? nodeData.label : `concept_${Date.now()}`;

      await apiService.addMapNode(
        mapId,
        filePath,
        nodeData.position.x,
        nodeData.position.y
      );

      // Refetch the map data to get the updated state
      await loadMap();
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to add node");
      setError(error);
      throw error;
    }
  };

  // Add an edge to the map
  const addEdge = async (edgeData: {
    fromNodeId: string;
    toNodeId: string;
    label?: string;
  }): Promise<void> => {
    try {
      await apiService.addMapEdge(
        mapId,
        parseInt(edgeData.fromNodeId),
        parseInt(edgeData.toNodeId),
        edgeData.label || ""
      );

      // Refetch the map data to get the updated state
      await loadMap();
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to add edge");
      setError(error);
      throw error;
    }
  };

  // Update a node
  const updateNode = async (
    nodeId: string,
    updates: Partial<MapNode>
  ): Promise<void> => {
    try {
      if (updates.position) {
        await apiService.updateMapNode(
          mapId,
          nodeId,
          updates.position.x,
          updates.position.y
        );
      }

      // Refetch the map data to get the updated state
      await loadMap();
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to update node");
      setError(error);
      throw error;
    }
  };

  // Delete a node
  const deleteNode = async (nodeId: string): Promise<void> => {
    try {
      await apiService.deleteMapNode(mapId, nodeId);

      // Refetch the map data to get the updated state
      await loadMap();
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete node");
      setError(error);
      throw error;
    }
  };

  // Update an edge
  const updateEdge = async (
    edgeId: string,
    updates: Partial<MapEdge>
  ): Promise<void> => {
    try {
      if (updates.label !== undefined) {
        await apiService.updateMapEdge(mapId, edgeId, updates.label);
      }

      // Refetch the map data to get the updated state
      await loadMap();
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to update edge");
      setError(error);
      throw error;
    }
  };

  // Delete an edge
  const deleteEdge = async (edgeId: string): Promise<void> => {
    try {
      await apiService.deleteMapEdge(mapId, edgeId);

      // Refetch the map data to get the updated state
      await loadMap();
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete edge");
      setError(error);
      throw error;
    }
  };

  // Load map on mount or when mapId changes
  useEffect(() => {
    if (mapId) {
      loadMap();
    }
  }, [mapId]);

  return {
    mapData,
    isLoading,
    error,
    addNode,
    addEdge,
    updateNode,
    deleteNode,
    updateEdge,
    deleteEdge,
    refetch: () => loadMap(true),
    canRetry: retryCount < 3 && !!error && !error.message.includes("not found"),
    retryCount,
  };
};
