'use client';

import React, { useState, lazy, Suspense } from 'react';
import { useGraph } from '@/hooks/useGraph';
import { GraphNode } from '@/services/types';
import { Button } from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { GraphSkeleton } from '@/components/ui/Skeleton';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy load the heavy GraphCanvas component
const GraphCanvas = lazy(() => import('@/components/GraphCanvas'));

export default function GraphInterface() {
  const [entityName, setEntityName] = useState<string>('');
  const [searchEntity, setSearchEntity] = useState<string>('');
  const [clickedNode, setClickedNode] = useState<GraphNode | null>(null);

  const { graphData, isLoading, error, getGraphData, refetch, canRetry, retryCount } = useGraph({
    entityName: searchEntity,
    autoFetch: false
  });

  const handleSearch = async () => {
    if (entityName.trim()) {
      setSearchEntity(entityName.trim());
      await getGraphData(entityName.trim());
    } else {
      // Fetch all graph data if no entity specified
      setSearchEntity('');
      await getGraphData();
    }
  };

  const handleNodeClick = (node: GraphNode) => {
    setClickedNode(node);

    // Clear the clicked node notification after 3 seconds
    setTimeout(() => setClickedNode(null), 3000);

    if (node.type === 'entity') {
      // Focus graph on the clicked entity
      setEntityName(node.label);
      setSearchEntity(node.label);
      getGraphData(node.label);
    } else if (node.type === 'file') {
      // For file nodes, we could potentially open the file or show details
      console.log('File node clicked:', node);
      // TODO: Implement file preview or navigation
    }
  };

  const handleNodeHover = (node: GraphNode | null) => {
    // Hover handling is now done in the GraphCanvas component via tooltips
    if (node) {
      console.log('Hovering over:', node.type, node.label);
    }
  };

  const handleLoadAll = async () => {
    setEntityName('');
    setSearchEntity('');
    await getGraphData();
  };

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-high-contrast mb-2">Knowledge Graph</h1>
            <p className="text-medium-contrast text-lg">
              Explore relationships between entities and files in your knowledge base
            </p>
          </div>
          {/* Search Controls */}
          <div className="card-dark p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="entity-search" className="block text-base font-medium text-high-contrast mb-2">
                  Search by Entity (optional)
                </label>
                <input
                  id="entity-search"
                  type="text"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter entity name to focus the graph..."
                  className="w-full px-3 py-2 bg-white/15 border border-white/30 rounded-md text-high-contrast placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 backdrop-blur-sm text-base"
                />
              </div>
              <div className="flex gap-2 sm:items-end">
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="px-6 py-2"
                >
                  {isLoading ? 'Loading...' : 'Search'}
                </Button>
                <Button
                  onClick={handleLoadAll}
                  disabled={isLoading}
                  variant="outline"
                  className="px-6 py-2"
                >
                  Load All
                </Button>
              </div>
            </div>

            {searchEntity && (
              <div className="mt-3 text-base text-medium-contrast">
                Showing graph for entity: <span className="font-medium text-purple-200">{searchEntity}</span>
              </div>
            )}

            {clickedNode && (
              <div className="mt-3 p-3 bg-purple-500/20 border border-purple-500/30 rounded-md backdrop-blur-sm">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${clickedNode.type === 'entity' ? 'bg-purple-400' : 'bg-white/70'
                    }`}></div>
                  <span className="text-base text-purple-100">
                    Clicked on {clickedNode.type}: <span className="font-medium">{clickedNode.label}</span>
                    {clickedNode.type === 'entity' && ' - Focusing graph...'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Graph Visualization */}
          <div className="card-dark p-6">
            {error && (
              <div className="mb-4">
                <ErrorMessage
                  title="Graph Loading Error"
                  message={`${error} ${retryCount > 0 ? `(Attempt ${retryCount + 1}/4)` : ''}`}
                  variant="error"
                  onRetry={canRetry ? refetch : undefined}
                />
              </div>
            )}

            {isLoading && (
              <GraphSkeleton />
            )}

            {!isLoading && !error && !graphData && (
              <div className="text-center py-12">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 13l-6-3m6 3V4" />
                  </svg>
                </div>
                <p className="text-xl font-medium text-high-contrast mb-2">No graph data loaded</p>
                <p className="text-base text-medium-contrast">Search for a specific entity or load all data to view the knowledge graph</p>
              </div>
            )}

            {!isLoading && !error && graphData && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-base text-medium-contrast">
                    <span className="font-medium text-high-contrast">{graphData.nodes.length}</span> nodes,
                    <span className="font-medium ml-1 text-high-contrast">{graphData.edges.length}</span> connections
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-subtle-contrast">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-purple-400 mr-2"></div>
                      Entities
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-white/30 border border-white/40 mr-2"></div>
                      Files
                    </div>
                  </div>
                </div>

                <Suspense fallback={<GraphSkeleton />}>
                  <GraphCanvas
                    data={graphData}
                    onNodeClick={handleNodeClick}
                    onNodeHover={handleNodeHover}
                    height={600}
                    className="border border-white/20 rounded-lg bg-white/5 backdrop-blur-sm"
                  />
                </Suspense>
              </div>
            )}
          </div>

          {/* Graph Instructions */}
          <div className="bg-purple-500/25 border border-purple-500/40 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="text-base font-medium text-purple-100 mb-2">How to use the graph:</h3>
            <ul className="text-base text-purple-50 space-y-1">
              <li>• Click and drag to pan around the graph</li>
              <li>• Use mouse wheel to zoom in and out</li>
              <li>• Click on entity nodes (circles) to focus the graph on that entity</li>
              <li>• Hover over nodes to see additional information</li>
              <li>• File nodes (squares) represent documents in your knowledge base</li>
            </ul>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}