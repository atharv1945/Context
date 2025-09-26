"use client";

import { useState } from "react";
import {
  DocumentTextIcon,
  CubeIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { MindMap, MapNode, MapEdge } from "@/services/types";
import { Button } from "@/components/ui/Button";

interface MapSidebarProps {
  map: any;
  nodes: any[];
  edges: any[];
  selectedNode: any | null;
  selectedEdge: any | null;
  isEditMode: boolean;
  onNodeUpdate: (nodeId: string, updates: any) => void;
  onNodeDelete: (nodeId: string) => void;
  onEdgeUpdate: (edgeId: string, updates: any) => void;
  onEdgeDelete: (edgeId: string) => void;
}

export default function MapSidebar({
  map,
  nodes,
  edges,
  selectedNode,
  selectedEdge,
  isEditMode,
  onNodeUpdate,
  onNodeDelete,
  onEdgeUpdate,
  onEdgeDelete,
}: MapSidebarProps) {
  const [editingNode, setEditingNode] = useState<string | number | null>(null);
  const [editingEdge, setEditingEdge] = useState<string | number | null>(null);
  const [nodeLabel, setNodeLabel] = useState("");
  const [edgeLabel, setEdgeLabel] = useState("");

  const handleEditNode = (node: any) => {
    setEditingNode(node?.id);
    const label = node?.label || node?.file_path || `Node ${node?.id}`;
    setNodeLabel(label);
  };

  const handleSaveNode = () => {
    if (editingNode != null && nodeLabel.trim()) {
      onNodeUpdate(String(editingNode), { label: nodeLabel.trim() });
      setEditingNode(null);
      setNodeLabel("");
    }
  };

  const handleCancelNodeEdit = () => {
    setEditingNode(null);
    setNodeLabel("");
  };

  const handleEditEdge = (edge: any) => {
    setEditingEdge(edge?.id);
    setEdgeLabel(edge?.label || "");
  };

  const handleSaveEdge = () => {
    if (editingEdge != null) {
      onEdgeUpdate(String(editingEdge), {
        label: edgeLabel.trim() || undefined,
      });
      setEditingEdge(null);
      setEdgeLabel("");
    }
  };

  const handleCancelEdgeEdit = () => {
    setEditingEdge(null);
    setEdgeLabel("");
  };

  const formatDate = (date: unknown) => {
    try {
      if (!date) return "—";
      const d = new Date(date as any);
      if (isNaN(d.getTime())) return "—";
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return "—";
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Map Details</h2>
        <div className="mt-2 text-sm text-gray-600">
          <p>
            {nodes.length} nodes, {edges.length} connections
          </p>
          <p>Updated {formatDate(map?.updatedAt)}</p>
        </div>
      </div>

      {/* Selected Item Details */}
      {(selectedNode || selectedEdge) && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          {selectedNode && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  {selectedNode?.type === "file" ? (
                    <DocumentTextIcon className="w-4 h-4" />
                  ) : (
                    <CubeIcon className="w-4 h-4" />
                  )}
                  Selected Node
                </h3>
                {isEditMode && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditNode(selectedNode)}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Edit node"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onNodeDelete(selectedNode.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete node"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {String(editingNode) === String(selectedNode.id) ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={nodeLabel}
                    onChange={(e) => setNodeLabel(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Node label..."
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveNode}
                      disabled={!nodeLabel.trim()}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelNodeEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">
                    {selectedNode?.label ||
                      selectedNode?.file_path ||
                      `Node ${selectedNode?.id}`}
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>
                      Type:{" "}
                      {(selectedNode as any).type === "file"
                        ? "File"
                        : "Concept"}
                    </p>
                    <p>
                      Position: (
                      {Math.round(
                        (selectedNode?.position?.x ??
                          selectedNode?.position_x) ||
                          0
                      )}
                      ,{" "}
                      {Math.round(
                        (selectedNode?.position?.y ??
                          selectedNode?.position_y) ||
                          0
                      )}
                      )
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedEdge && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Selected Edge
                </h3>
                {isEditMode && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditEdge(selectedEdge)}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Edit edge"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdgeDelete(selectedEdge.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete edge"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {editingEdge === selectedEdge.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={edgeLabel}
                    onChange={(e) => setEdgeLabel(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Edge label (optional)..."
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdge}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdgeEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">
                    {selectedEdge.label || "Unlabeled connection"}
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>
                      From:{" "}
                      {(() => {
                        const fromId =
                          (selectedEdge as any).fromNodeId ??
                          (selectedEdge as any).source_node_id;
                        const n = nodes.find((n) => (n as any).id === fromId);
                        return (
                          (n as any)?.label ||
                          (n as any)?.file_path ||
                          "Unknown"
                        );
                      })()}
                    </p>
                    <p>
                      To:{" "}
                      {(() => {
                        const toId =
                          (selectedEdge as any).toNodeId ??
                          (selectedEdge as any).target_node_id;
                        const n = nodes.find((n) => (n as any).id === toId);
                        return (
                          (n as any)?.label ||
                          (n as any)?.file_path ||
                          "Unknown"
                        );
                      })()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Nodes List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Nodes ({nodes.length})
          </h3>
          <div className="space-y-2">
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedNode?.id === node.id
                    ? "border-purple-200 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    {node.type === "file" ? (
                      <DocumentTextIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <CubeIcon className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {(node as any).label ||
                          (node as any).file_path ||
                          `Node ${(node as any).id}`}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {(node as any).type}
                      </p>
                    </div>
                  </div>
                  {isEditMode && selectedNode?.id === node.id && (
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditNode(node);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Edit node"
                      >
                        <PencilIcon className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNodeDelete(node.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete node"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {nodes.length === 0 && (
              <div className="text-center py-8">
                <CubeIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No nodes yet</p>
                {isEditMode && (
                  <p className="text-xs text-gray-400 mt-1">
                    Add nodes to start building your map
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Edges List */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Connections ({edges.length})
          </h3>
          <div className="space-y-2">
            {edges.map((edge) => (
              <div
                key={edge.id}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedEdge?.id === edge.id
                    ? "border-purple-200 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <LinkIcon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {edge.label || "Unlabeled"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(() => {
                          const fromId =
                            (edge as any).fromNodeId ??
                            (edge as any).source_node_id;
                          const n = nodes.find(
                            (n) => String((n as any).id) === String(fromId)
                          );
                          return (
                            (n as any)?.label ||
                            (n as any)?.file_path ||
                            "Unknown"
                          );
                        })()}{" "}
                        →{" "}
                        {(() => {
                          const toId =
                            (edge as any).toNodeId ??
                            (edge as any).target_node_id;
                          const n = nodes.find(
                            (n) => String((n as any).id) === String(toId)
                          );
                          return (
                            (n as any)?.label ||
                            (n as any)?.file_path ||
                            "Unknown"
                          );
                        })()}
                      </p>
                    </div>
                  </div>
                  {isEditMode && selectedEdge?.id === edge.id && (
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEdge(edge);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Edit edge"
                      >
                        <PencilIcon className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdgeDelete(edge.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete edge"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {edges.length === 0 && (
              <div className="text-center py-8">
                <LinkIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No connections yet</p>
                {isEditMode && (
                  <p className="text-xs text-gray-400 mt-1">
                    Connect nodes to show relationships
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
