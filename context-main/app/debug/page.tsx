"use client";

import { useState, useEffect } from "react";
import { useSearch } from "../../hooks/useSearch";
import { useHealth } from "../../hooks/useHealth";
import { useMaps } from "../../hooks/useMaps";
import { useGraph } from "../../hooks/useGraph";
import SearchBar from "../../components/SearchBar";
import SearchResults from "../../components/SearchResults";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";

export default function DemoPage() {
  const [activeDemo, setActiveDemo] = useState<
    "search" | "health" | "maps" | "graph"
  >("search");
  const [searchQuery, setSearchQuery] = useState("test");
  const [graphEntity, setGraphEntity] = useState("Samsung");

  // Hooks for different features
  const {
    results,
    isLoading: searchLoading,
    error: searchError,
    setQuery,
  } = useSearch();
  const { health, isLoading: healthLoading, error: healthError } = useHealth();
  const { maps, isLoading: mapsLoading, error: mapsError } = useMaps();
  const {
    graphData,
    isLoading: graphLoading,
    error: graphError,
    getGraphData,
  } = useGraph();

  // Set initial search query
  useEffect(() => {
    if (searchQuery) {
      setQuery(searchQuery);
    }
  }, [searchQuery, setQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setQuery(query);
  };

  const handleGraphSearch = () => {
    if (graphEntity.trim()) {
      getGraphData(graphEntity.trim());
    }
  };

  const demoSections = [
    { id: "search", label: "Search Demo", icon: "🔍" },
    { id: "health", label: "Health Check", icon: "💚" },
    { id: "maps", label: "Mind Maps", icon: "🗺️" },
    { id: "graph", label: "Knowledge Graph", icon: "🕸️" },
  ] as const;

  return (
    <div className="min-h-screen bg-context-dark p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Context Demo</h1>
          <p className="text-gray-300 text-lg">
            Interactive demonstration of all working features
          </p>
        </div>

        {/* Demo Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {demoSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveDemo(section.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeDemo === section.id
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <span className="mr-2">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </div>

        {/* Demo Content */}
        <div className="bg-gray-800 rounded-lg p-6">
          {activeDemo === "search" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  🔍 Search Demo
                </h2>
                <p className="text-gray-300 mb-6">
                  Try searching for documents. The API returns mock results for
                  demonstration.
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <SearchBar
                  onSearch={handleSearch}
                  isLoading={searchLoading}
                  placeholder="Search your documents..."
                />
              </div>

              {searchError && (
                <ErrorMessage
                  title="Search Error"
                  message={searchError}
                  variant="error"
                />
              )}

              <SearchResults
                results={results}
                isLoading={searchLoading}
                error={searchError}
                query={searchQuery}
                onContextMenu={() => {}}
              />
            </div>
          )}

          {activeDemo === "health" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  💚 Health Check
                </h2>
                <p className="text-gray-300 mb-6">
                  API server status and connection information.
                </p>
              </div>

              {healthLoading && (
                <div className="flex justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              )}

              {healthError && (
                <ErrorMessage
                  title="Health Check Failed"
                  message={healthError}
                  variant="error"
                />
              )}

              {health && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-green-400 mb-4">
                    API Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 rounded p-4">
                      <div className="text-sm text-gray-400">Status</div>
                      <div className="text-lg font-semibold text-green-400">
                        {health.status}
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded p-4">
                      <div className="text-sm text-gray-400">Service</div>
                      <div className="text-lg font-semibold text-white">
                        {health.service}
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded p-4">
                      <div className="text-sm text-gray-400">Mode</div>
                      <div className="text-lg font-semibold text-yellow-400">
                        {health.mode}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeDemo === "maps" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  🗺️ Mind Maps
                </h2>
                <p className="text-gray-300 mb-6">
                  Available mind maps for organizing your documents.
                </p>
              </div>

              {mapsLoading && (
                <div className="flex justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              )}

              {mapsError && (
                <ErrorMessage
                  title="Failed to Load Maps"
                  message={mapsError.message || "Failed to load maps"}
                  variant="error"
                />
              )}

              {maps && maps.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {maps.map((map) => (
                    <div
                      key={map.id}
                      className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {map.name}
                      </h3>
                      <div className="text-sm text-gray-400">ID: {map.id}</div>
                    </div>
                  ))}
                </div>
              )}

              {maps && maps.length === 0 && (
                <div className="text-center text-gray-400">
                  No maps available. Create one through the Maps interface.
                </div>
              )}
            </div>
          )}

          {activeDemo === "graph" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  🕸️ Knowledge Graph
                </h2>
                <p className="text-gray-300 mb-6">
                  Generate knowledge graphs for entities and their
                  relationships.
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={graphEntity}
                    onChange={(e) => setGraphEntity(e.target.value)}
                    placeholder="Enter entity name..."
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={handleGraphSearch}
                    disabled={graphLoading || !graphEntity.trim()}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {graphLoading ? "Loading..." : "Generate"}
                  </button>
                </div>
              </div>

              {graphError && (
                <ErrorMessage
                  title="Graph Generation Failed"
                  message={graphError}
                  variant="error"
                />
              )}

              {graphData && (
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Graph for "{graphEntity}"
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium text-gray-300 mb-3">
                        Nodes ({graphData.nodes.length})
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {graphData.nodes.map((node, index) => (
                          <div key={index} className="bg-gray-600 rounded p-3">
                            <div className="font-medium text-white">
                              {node.label}
                            </div>
                            <div className="text-sm text-gray-400">
                              Type: {node.type}
                            </div>
                            {node.metadata && (
                              <div className="text-xs text-gray-500 mt-1">
                                {JSON.stringify(node.metadata, null, 2)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-gray-300 mb-3">
                        Edges ({graphData.edges.length})
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {graphData.edges.map((edge, index) => (
                          <div key={index} className="bg-gray-600 rounded p-3">
                            <div className="text-white">
                              <span className="font-medium">{edge.from}</span>
                              <span className="mx-2 text-gray-400">→</span>
                              <span className="font-medium">{edge.to}</span>
                            </div>
                            <div className="text-sm text-gray-400">
                              Label: {edge.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-blue-400 mb-4">
            📋 Demo Instructions
          </h3>
          <div className="text-gray-300 space-y-2">
            <p>
              <strong>Search Demo:</strong> Type any query to see mock search
              results
            </p>
            <p>
              <strong>Health Check:</strong> Shows API server status and
              connection info
            </p>
            <p>
              <strong>Mind Maps:</strong> Displays available user-curated maps
            </p>
            <p>
              <strong>Knowledge Graph:</strong> Enter an entity name to generate
              a graph
            </p>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            <p>
              <strong>Note:</strong> This demo uses mock data. The API server is
              running in mock mode for demonstration purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
