"use client";

import { useState } from "react";
import { apiService } from "@/services/api";

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const health = await apiService.getHealth();
      setResult(health);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const testSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const search = await apiService.search("test", 5);
      setResult(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const testMaps = async () => {
    setLoading(true);
    setError(null);
    try {
      const maps = await apiService.getMaps();
      setResult(maps);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-context-dark p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">API Test Page</h1>

        <div className="space-y-4 mb-8">
          <button
            onClick={testHealth}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-4 disabled:opacity-50"
          >
            Test Health
          </button>

          <button
            onClick={testSearch}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-4 disabled:opacity-50"
          >
            Test Search
          </button>

          <button
            onClick={testMaps}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Test Maps
          </button>
        </div>

        {loading && <div className="text-white">Loading...</div>}

        {error && (
          <div className="bg-red-500 text-white p-4 rounded mb-4">
            Error: {error}
          </div>
        )}

        {result && (
          <div className="bg-gray-800 text-white p-4 rounded">
            <h3 className="font-bold mb-2">Result:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
