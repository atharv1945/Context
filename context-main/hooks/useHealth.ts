import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/api";
import { HealthStatus, NetworkError, ServerError } from "../services/types";

export interface UseHealthReturn {
  health: HealthStatus | null;
  status: "healthy" | "degraded" | "down" | "checking";
  isLoading: boolean;
  error: string | null;
  lastChecked: Date | null;
  checkHealth: () => Promise<void>;
}

/**
 * Custom hook for system health monitoring with periodic checks
 * Implements requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
export function useHealth(checkInterval: number = 30000): UseHealthReturn {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [status, setStatus] = useState<
    "healthy" | "degraded" | "down" | "checking"
  >("checking");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const healthData = await apiService.getHealth();
      setHealth(healthData);
      // Map backend status to frontend status
      if (healthData.status === "healthy") {
        setStatus("healthy");
      } else {
        setStatus("degraded");
      }
      setLastChecked(new Date());

      // Clear any previous errors on successful check
      if (error) {
        setError(null);
      }
    } catch (err) {
      console.error("Health check failed:", err);

      if (err instanceof NetworkError) {
        setStatus("down");
        setError("Network connection failed");
      } else if (err instanceof ServerError) {
        setStatus("down");
        setError("Server error occurred");
      } else {
        setStatus("down");
        setError("Health check failed");
      }

      setLastChecked(new Date());
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  // Set up periodic health checks
  useEffect(() => {
    // Initial health check
    checkHealth();

    // Set up interval for periodic checks
    const interval = setInterval(checkHealth, checkInterval);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [checkHealth, checkInterval]);

  // Handle visibility change to check health when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkHealth();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkHealth]);

  return {
    health,
    status,
    isLoading,
    error,
    lastChecked,
    checkHealth,
  };
}
