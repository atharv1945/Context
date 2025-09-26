'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Network } from 'vis-network/standalone';
import { DataSet } from 'vis-data/standalone';
import { MapNode, MapEdge } from '@/services/types';

interface MapCanvasProps {
  nodes: MapNode[];
  edges: MapEdge[];
  isEditMode: boolean;
  selectedNode: MapNode | null;
  selectedEdge: MapEdge | null;
  onNodeSelect: (node: MapNode | null) => void;
  onEdgeSelect: (edge: MapEdge | null) => void;
  onNodeMove: (nodeId: string, position: { x: number; y: number }) => void;
  onFilesDrop?: (files: FileList, position: { x: number; y: number }) => void;
  isConnectMode?: boolean;
  connectFromNode?: MapNode | null;
}

export default function MapCanvas({
  nodes,
  edges,
  isEditMode,
  selectedNode,
  selectedEdge,
  onNodeSelect,
  onEdgeSelect,
  onNodeMove,
  onFilesDrop,
  isConnectMode = false,
  connectFromNode = null
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Convert MapNode to vis.js node format
  const convertNodes = useCallback((mapNodes: MapNode[]) => {
    return mapNodes.map(node => {
      const isConnectFrom = isConnectMode && connectFromNode?.id === node.id;
      const isConnectTarget = isConnectMode && connectFromNode && connectFromNode.id !== node.id;
      
      return {
        id: node.id,
        label: node.label,
        x: node.position.x,
        y: node.position.y,
        shape: node.type === 'file' ? 'box' : 'ellipse',
        color: {
          background: isConnectFrom 
            ? '#10b981' 
            : isConnectTarget 
              ? '#f59e0b' 
              : node.type === 'file' ? '#e0f2fe' : '#f3e8ff',
          border: isConnectFrom 
            ? '#059669' 
            : isConnectTarget 
              ? '#d97706' 
              : node.type === 'file' ? '#0284c7' : '#7c3aed',
          highlight: {
            background: isConnectFrom 
              ? '#34d399' 
              : isConnectTarget 
                ? '#fbbf24' 
                : node.type === 'file' ? '#bae6fd' : '#e9d5ff',
            border: isConnectFrom 
              ? '#047857' 
              : isConnectTarget 
                ? '#b45309' 
                : node.type === 'file' ? '#0369a1' : '#6d28d9'
          }
        },
        font: {
          size: 14,
          color: '#374151'
        },
        borderWidth: isConnectFrom || isConnectTarget ? 3 : 2,
        borderWidthSelected: 4
      };
    });
  }, [isConnectMode, connectFromNode]);

  // Convert MapEdge to vis.js edge format
  const convertEdges = useCallback((mapEdges: MapEdge[]) => {
    return mapEdges.map(edge => ({
      id: edge.id,
      from: edge.fromNodeId,
      to: edge.toNodeId,
      label: edge.label || '',
      color: {
        color: '#6b7280',
        highlight: '#7c3aed'
      },
      font: {
        size: 12,
        color: '#4b5563',
        strokeWidth: 2,
        strokeColor: '#ffffff'
      },
      arrows: {
        to: {
          enabled: true,
          scaleFactor: 0.8
        }
      },
      smooth: {
        enabled: true,
        type: 'continuous',
        roundness: 0.2
      }
    }));
  }, []);

  useEffect(() => {
    if (!containerRef.current || isInitialized) return;

    const visNodes = new DataSet(convertNodes(nodes));
    const visEdges = new DataSet(convertEdges(edges));

    const options = {
      nodes: {
        borderWidth: 2,
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.1)',
          size: 5,
          x: 2,
          y: 2
        },
        font: {
          size: 14,
          color: '#374151'
        }
      },
      edges: {
        width: 2,
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.1)',
          size: 3,
          x: 1,
          y: 1
        }
      },
      physics: {
        enabled: !isEditMode,
        stabilization: {
          enabled: true,
          iterations: 100
        },
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.1,
          springLength: 200,
          springConstant: 0.05,
          damping: 0.09
        }
      },
      interaction: {
        dragNodes: isEditMode,
        dragView: true,
        zoomView: true,
        selectConnectedEdges: false
      },
      manipulation: {
        enabled: false
      },
      layout: {
        improvedLayout: true
      }
    };

    const network = new Network(
      containerRef.current,
      { nodes: visNodes, edges: visEdges },
      options
    );

    // Handle node selection
    network.on('selectNode', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = nodes.find(n => n.id === nodeId);
        onNodeSelect(node || null);
        onEdgeSelect(null);
      }
    });

    // Handle edge selection
    network.on('selectEdge', (params) => {
      if (params.edges.length > 0) {
        const edgeId = params.edges[0];
        const edge = edges.find(e => e.id === edgeId);
        onEdgeSelect(edge || null);
        onNodeSelect(null);
      }
    });

    // Handle deselection
    network.on('deselectNode', () => {
      onNodeSelect(null);
    });

    network.on('deselectEdge', () => {
      onEdgeSelect(null);
    });

    // Handle node dragging (only in edit mode)
    if (isEditMode) {
      network.on('dragEnd', (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const positions = network.getPositions([nodeId]);
          const position = positions[nodeId];
          if (position) {
            onNodeMove(nodeId, { x: position.x, y: position.y });
          }
        }
      });
    }

    networkRef.current = network;
    setIsInitialized(true);

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
      setIsInitialized(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, isEditMode, onNodeSelect, onEdgeSelect, onNodeMove, convertNodes, convertEdges]);

  // Update network when data changes
  useEffect(() => {
    if (!networkRef.current || !isInitialized) return;

    const visNodes = (networkRef.current as any).body.data.nodes;
    const visEdges = (networkRef.current as any).body.data.edges;

    // Update nodes
    const newNodes = convertNodes(nodes);
    visNodes.clear();
    visNodes.add(newNodes);

    // Update edges
    const newEdges = convertEdges(edges);
    visEdges.clear();
    visEdges.add(newEdges);
  }, [nodes, edges, isInitialized, isConnectMode, connectFromNode, convertNodes, convertEdges]);

  // Update physics when edit mode changes
  useEffect(() => {
    if (!networkRef.current || !isInitialized) return;

    networkRef.current.setOptions({
      physics: {
        enabled: !isEditMode
      },
      interaction: {
        dragNodes: isEditMode,
        dragView: true,
        zoomView: true
      }
    });

    if (!isEditMode) {
      // Stabilize the network when switching to view mode
      networkRef.current.stabilize();
    }
  }, [isEditMode, isInitialized]);

  // Highlight selected node/edge
  useEffect(() => {
    if (!networkRef.current || !isInitialized) return;

    if (selectedNode) {
      networkRef.current.selectNodes([selectedNode.id]);
    } else if (selectedEdge) {
      networkRef.current.selectEdges([selectedEdge.id]);
    } else {
      networkRef.current.unselectAll();
    }
  }, [selectedNode, selectedEdge, isInitialized]);

  // Handle file drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isEditMode && onFilesDrop) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!isEditMode || !onFilesDrop || !networkRef.current) return;

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    // Get the drop position relative to the canvas
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const canvasPosition = networkRef.current.DOMtoCanvas({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    onFilesDrop(files, canvasPosition);
  };

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className={`w-full h-full bg-white transition-colors ${
          isDragOver ? 'bg-purple-50 border-2 border-dashed border-purple-300' : ''
        }`}
        style={{ minHeight: '400px' }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
      
      {/* Mode indicator */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnectMode ? 'bg-orange-500' : isEditMode ? 'bg-green-500' : 'bg-blue-500'
          }`} />
          <span className="text-sm font-medium text-gray-700">
            {isConnectMode ? 'Connect Mode' : isEditMode ? 'Edit Mode' : 'View Mode'}
          </span>
        </div>
        {isConnectMode && (
          <p className="text-xs text-gray-600 mt-1">
            {connectFromNode ? 'Click target node to connect' : 'Click first node to start'}
          </p>
        )}
      </div>

      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-purple-100/50 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-dashed border-purple-300">
            <div className="text-center">
              <svg className="w-12 h-12 text-purple-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Drop Files Here</h3>
              <p className="text-sm text-gray-600">
                Files will be added as nodes to your mind map
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {isEditMode && !isDragOver && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-gray-200 max-w-xs">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Edit Mode</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Drag nodes to reposition them</li>
            <li>• Click nodes/edges to select them</li>
            <li>• Use sidebar to edit properties</li>
            <li>• Add nodes and edges with toolbar</li>
            <li>• Drag files onto canvas to add them</li>
          </ul>
        </div>
      )}

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Empty Mind Map</h3>
            <p className="text-gray-500 mb-4">
              Start building your mind map by adding nodes and connections.
            </p>
            {isEditMode && (
              <p className="text-sm text-gray-400">
                Click &quot;Add Node&quot; in the toolbar to get started.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}