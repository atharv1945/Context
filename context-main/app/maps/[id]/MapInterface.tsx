'use client';

import { useState, lazy, Suspense } from 'react';
import {
  ArrowLeftIcon,
  PlusIcon,
  DocumentTextIcon,
  LinkIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useMap } from '@/hooks';
import { MapNode, MapEdge } from '@/services/types';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import ErrorBoundary from '@/components/ErrorBoundary';
import Link from 'next/link';

// Lazy load heavy components
const MapCanvas = lazy(() => import('@/components/MapCanvas'));
const MapSidebar = lazy(() => import('@/components/MapSidebar'));

interface MapInterfaceProps {
  mapId: string;
}

export default function MapInterface({ mapId }: MapInterfaceProps) {
  const { mapData, isLoading, error, addNode, addEdge, updateNode, deleteNode, updateEdge, deleteEdge, refetch, canRetry, retryCount } = useMap(mapId);

  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<MapEdge | null>(null);
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [showAddEdgeModal, setShowAddEdgeModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [connectFromNode, setConnectFromNode] = useState<MapNode | null>(null);

  // Form states
  const [nodeForm, setNodeForm] = useState({
    label: '',
    type: 'concept' as 'file' | 'concept',
    position: { x: 0, y: 0 }
  });

  const [edgeForm, setEdgeForm] = useState({
    fromNodeId: '',
    toNodeId: '',
    label: ''
  });

  const handleAddNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeForm.label.trim()) return;

    try {
      await addNode({
        label: nodeForm.label.trim(),
        type: nodeForm.type,
        position: nodeForm.position
      });
      setNodeForm({ label: '', type: 'concept', position: { x: 0, y: 0 } });
      setShowAddNodeModal(false);
    } catch (error) {
      console.error('Failed to add node:', error);
    }
  };

  const handleAddEdge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edgeForm.fromNodeId || !edgeForm.toNodeId) return;

    try {
      await addEdge({
        fromNodeId: edgeForm.fromNodeId,
        toNodeId: edgeForm.toNodeId,
        label: edgeForm.label.trim() || undefined
      });
      setEdgeForm({ fromNodeId: '', toNodeId: '', label: '' });
      setShowAddEdgeModal(false);
    } catch (error) {
      console.error('Failed to add edge:', error);
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    try {
      await deleteNode(nodeId);
      setSelectedNode(null);
    } catch (error) {
      console.error('Failed to delete node:', error);
    }
  };

  const handleDeleteEdge = async (edgeId: string) => {
    try {
      await deleteEdge(edgeId);
      setSelectedEdge(null);
    } catch (error) {
      console.error('Failed to delete edge:', error);
    }
  };

  const handleNodeClick = (node: MapNode | null) => {
    if (isConnectMode && node) {
      if (!connectFromNode) {
        // First node selected
        setConnectFromNode(node);
        setSelectedNode(node);
      } else if (connectFromNode.id !== node.id) {
        // Second node selected, create edge
        handleQuickConnect(connectFromNode.id, node.id);
      }
    } else {
      setSelectedNode(node);
      if (isConnectMode) {
        setIsConnectMode(false);
        setConnectFromNode(null);
      }
    }
  };

  const handleQuickConnect = async (fromNodeId: string, toNodeId: string) => {
    try {
      await addEdge({
        fromNodeId,
        toNodeId,
        label: undefined
      });
      setIsConnectMode(false);
      setConnectFromNode(null);
    } catch (error) {
      console.error('Failed to create connection:', error);
    }
  };

  const toggleConnectMode = () => {
    setIsConnectMode(!isConnectMode);
    setConnectFromNode(null);
    if (!isConnectMode) {
      setSelectedEdge(null);
    }
  };

  const handleFilesDrop = async (files: FileList, position: { x: number; y: number }) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        await addNode({
          label: file.name,
          type: 'file',
          position: {
            x: position.x + (i * 50), // Offset multiple files
            y: position.y + (i * 50)
          }
        });
      } catch (error) {
        console.error(`Failed to add file ${file.name}:`, error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading mind map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage
            title="Failed to load mind map"
            message={`${error.message} ${retryCount > 0 ? `(Attempt ${retryCount + 1}/4)` : ''}`}
            onRetry={canRetry ? refetch : undefined}
          />
          <div className="mt-4 text-center">
            <Link href="/maps">
              <Button variant="outline">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Maps
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!mapData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Map not found</h3>
          <p className="text-gray-500 mb-6">
            The mind map you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Link href="/maps">
            <Button>
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Maps
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/maps">
                <Button variant="ghost" size="sm">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to Maps
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{mapData.map.name}</h1>
                {mapData.map.description && (
                  <p className="text-sm text-gray-600">{mapData.map.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isEditMode ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
              >
                {isEditMode ? (
                  <>
                    <EyeIcon className="w-4 h-4 mr-2" />
                    View Mode
                  </>
                ) : (
                  <>
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit Mode
                  </>
                )}
              </Button>

              {isEditMode && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddNodeModal(true)}
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Node
                  </Button>
                  <Button
                    variant={isConnectMode ? 'primary' : 'outline'}
                    size="sm"
                    onClick={toggleConnectMode}
                    disabled={mapData.nodes.length < 2}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    {isConnectMode ? 'Cancel Connect' : 'Quick Connect'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddEdgeModal(true)}
                    disabled={mapData.nodes.length < 2}
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Edge
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Map Canvas */}
          <div className="flex-1 relative">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-gray-600">Loading map canvas...</p>
                </div>
              </div>
            }>
              <MapCanvas
                nodes={mapData.nodes}
                edges={mapData.edges}
                isEditMode={isEditMode}
                selectedNode={selectedNode}
                selectedEdge={selectedEdge}
                onNodeSelect={handleNodeClick}
                onEdgeSelect={setSelectedEdge}
                onNodeMove={async (nodeId: string, position: { x: number; y: number }) => {
                  try {
                    await updateNode(nodeId, { position });
                  } catch (error) {
                    console.error('Failed to update node position:', error);
                  }
                }}
                onFilesDrop={handleFilesDrop}
                isConnectMode={isConnectMode}
                connectFromNode={connectFromNode}
              />
            </Suspense>
          </div>

          {/* Sidebar */}
          <Suspense fallback={
            <div className="w-80 bg-white border-l border-gray-200 p-4">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          }>
            <MapSidebar
              map={mapData.map}
              nodes={mapData.nodes}
              edges={mapData.edges}
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              isEditMode={isEditMode}
              onNodeUpdate={async (nodeId: string, updates: Partial<MapNode>) => {
                try {
                  await updateNode(nodeId, updates);
                } catch (error) {
                  console.error('Failed to update node:', error);
                }
              }}
              onNodeDelete={handleDeleteNode}
              onEdgeUpdate={async (edgeId: string, updates: Partial<MapEdge>) => {
                try {
                  await updateEdge(edgeId, updates);
                } catch (error) {
                  console.error('Failed to update edge:', error);
                }
              }}
              onEdgeDelete={handleDeleteEdge}
            />
          </Suspense>
        </div>

        {/* Add Node Modal */}
        <Modal
          isOpen={showAddNodeModal}
          onClose={() => setShowAddNodeModal(false)}
          title="Add New Node"
        >
          <form onSubmit={handleAddNode} className="space-y-4">
            <div>
              <label htmlFor="nodeLabel" className="block text-sm font-medium text-gray-700 mb-1">
                Node Label *
              </label>
              <input
                id="nodeLabel"
                type="text"
                value={nodeForm.label}
                onChange={(e) => setNodeForm({ ...nodeForm, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter node label..."
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="nodeType" className="block text-sm font-medium text-gray-700 mb-1">
                Node Type
              </label>
              <select
                id="nodeType"
                value={nodeForm.type}
                onChange={(e) => setNodeForm({ ...nodeForm, type: e.target.value as 'file' | 'concept' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="concept">Concept</option>
                <option value="file">File</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddNodeModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!nodeForm.label.trim()}
              >
                Add Node
              </Button>
            </div>
          </form>
        </Modal>

        {/* Add Edge Modal */}
        <Modal
          isOpen={showAddEdgeModal}
          onClose={() => setShowAddEdgeModal(false)}
          title="Add New Edge"
        >
          <form onSubmit={handleAddEdge} className="space-y-4">
            <div>
              <label htmlFor="fromNode" className="block text-sm font-medium text-gray-700 mb-1">
                From Node *
              </label>
              <select
                id="fromNode"
                value={edgeForm.fromNodeId}
                onChange={(e) => setEdgeForm({ ...edgeForm, fromNodeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Select a node...</option>
                {mapData.nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="toNode" className="block text-sm font-medium text-gray-700 mb-1">
                To Node *
              </label>
              <select
                id="toNode"
                value={edgeForm.toNodeId}
                onChange={(e) => setEdgeForm({ ...edgeForm, toNodeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Select a node...</option>
                {mapData.nodes
                  .filter(node => node.id !== edgeForm.fromNodeId)
                  .map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.label}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label htmlFor="edgeLabel" className="block text-sm font-medium text-gray-700 mb-1">
                Edge Label (optional)
              </label>
              <input
                id="edgeLabel"
                type="text"
                value={edgeForm.label}
                onChange={(e) => setEdgeForm({ ...edgeForm, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe the relationship..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddEdgeModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!edgeForm.fromNodeId || !edgeForm.toNodeId}
              >
                Add Edge
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ErrorBoundary>
  );
}