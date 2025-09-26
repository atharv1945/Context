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

export const useMap = (mapId: number) => {
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

      const data = await apiService.getMap(mapId.toString());
      setMapData({ map: { id: mapId, name: "" }, ...data });
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
  const addNode = async (
    filePath: string,
    x: number,
    y: number
  ): Promise<{ status: string; message: string }> => {
    try {
      const result = await apiService.addMapNode(
        mapId.toString(),
        filePath,
        x,
        y
      );
      // Note: The backend doesn't return the new node, so we can't update the local state
      // In a real implementation, you'd need to refetch the map data
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to add node");
      setError(error);
      throw error;
    }
  };

  // Add an edge to the map
  const addEdge = async (
    sourceId: number,
    targetId: number,
    label: string
  ): Promise<{ status: string; message: string }> => {
    try {
      const result = await apiService.addMapEdge(
        mapId.toString(),
        sourceId,
        targetId,
        label
      );
      // Note: The backend doesn't return the new edge, so we can't update the local state
      // In a real implementation, you'd need to refetch the map data
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to add edge");
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
    refetch: () => loadMap(true),
    canRetry: retryCount < 3 && !!error && !error.message.includes("not found"),
    retryCount,
  };
};
