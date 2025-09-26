"use client";

import { useState, useEffect } from "react";
import { GraphData, GraphNode, GraphEdge, ApiError } from "@/services/types";
import { apiService } from "@/services/api";

interface UseGraphOptions {
  entityName?: string;
  autoFetch?: boolean;
}

interface UseGraphReturn {
  graphData: GraphData | null;
  isLoading: boolean;
  error: string | null;
  getGraphData: (entityName?: string) => Promise<void>;
  refetch: () => Promise<void>;
  isError: boolean;
  canRetry: boolean;
  retryCount: number;
  lastFetchedEntity: string | undefined;
}

export function useGraph(options: UseGraphOptions = {}): UseGraphReturn {
  const { entityName, autoFetch = true } = options;

  const [data, setData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetchedEntity, setLastFetchedEntity] = useState<
    string | undefined
  >(undefined);

  const fetchGraph = async (entity?: string, isRetry: boolean = false) => {
    const targetEntity = entity || entityName;

    setIsLoading(true);
    setError(null);
    setLastFetchedEntity(targetEntity);

    if (!isRetry) {
      setRetryCount(0);
    }

    try {
      const graphData = await apiService.getGraphData(targetEntity);
      setData(graphData);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error("Error fetching graph data:", err);

      let errorMessage = "Failed to load graph data";

      if (err instanceof ApiError) {
        errorMessage = err.message;
        if (err.statusCode === 404) {
          errorMessage = targetEntity
            ? `No graph data found for entity "${targetEntity}"`
            : "No graph data available";
        } else if (err.statusCode === 429) {
          errorMessage =
            "Too many requests. Please wait a moment and try again.";
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setData(null);

      if (isRetry) {
        setRetryCount((prev) => prev + 1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    await fetchGraph(lastFetchedEntity, true);
  };

  useEffect(() => {
    if (autoFetch) {
      fetchGraph();
    }
  }, [entityName, autoFetch]);

  return {
    graphData: data,
    isLoading,
    error,
    getGraphData: fetchGraph,
    refetch,
    isError: !!error,
    canRetry: retryCount < 3 && !!error && !error.includes("404"),
    retryCount,
    lastFetchedEntity,
  };
}
