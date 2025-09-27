"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  CalendarIcon,
  DocumentTextIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

import { useMaps } from "@/hooks";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { MapCardSkeleton } from "@/components/ui/Skeleton";
import ErrorBoundary from "@/components/ErrorBoundary";
import Link from "next/link";

interface CreateMapFormData {
  name: string;
  description: string;
}

export default function MapsInterface() {
  const {
    maps,
    isLoading,
    error,
    createMap,
    deleteMap,
    refetch,
    canRetry,
    retryCount,
  } = useMaps();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateMapFormData>({
    name: "",
    description: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateMap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsCreating(true);
    try {
      // The useMaps hook's createMap should return the newly created map object
      const newMap = await createMap(formData.name.trim());
      setFormData({ name: "", description: "" });
      setShowCreateModal(false);
      
      // On successful creation, navigate to the new map's page
      if (newMap && newMap.id) {
        router.push(`/maps/${newMap.id}`);
      }
    } catch (error) {
      console.error("Failed to create map:", error);
      // Optionally, show an error toast to the user here
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteMap = async (mapId: string | number) => {
    setIsDeleting(true);
    try {
      await deleteMap(Number(mapId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete map:", error);
      // Optionally, show an error toast to the user here
    } finally {
      setIsDeleting(false);
    }
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

  const router = useRouter();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-4 w-24 bg-white/20 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-white/20 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <MapCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage
          title="Failed to load mind maps"
          message={`${error.message} ${
            retryCount > 0 ? `(Attempt ${retryCount + 1}/4)` : ""
          }`}
          variant="error"
          onRetry={canRetry ? refetch : undefined}
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-high-contrast mb-2">
              Mind Maps
            </h1>
            <p className="text-medium-contrast text-lg">
              Create and manage custom mind maps to organize your knowledge and
              visualize connections.
            </p>
          </div>

          {/* Create Map Button */}
          <div className="flex justify-between items-center">
            <div className="text-base text-medium-contrast">
              {maps?.length || 0} mind map{maps?.length !== 1 ? "s" : ""}
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Create New Map
            </Button>
          </div>

          {/* Maps Grid */}
          {maps && maps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {maps.map((map: any) => (
                <div
                  key={map.id}
                  className="card-dark transition-all duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-high-contrast truncate">
                          {map.name}
                        </h3>
                        {map.description && (
                          <p
                            className="text-base text-medium-contrast mt-1 overflow-hidden text-ellipsis"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {map.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => setDeleteConfirm(map.id)}
                          className="p-1 text-white/70 hover:text-red-300 transition-colors"
                          title="Delete map"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-subtle-contrast mb-4">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        Created {formatDate((map as any)?.createdAt)}
                      </div>
                      {Boolean((map as any)?.updatedAt) &&
                        (map as any)?.updatedAt !== (map as any)?.createdAt && (
                          <div className="flex items-center gap-1">
                            <PencilIcon className="w-3 h-3" />
                            Updated {formatDate((map as any)?.updatedAt)}
                          </div>
                        )}
                    </div>

                    <Link href={`/maps/${map.id}`}>
                      <Button variant="outline" className="w-full">
                        <DocumentTextIcon className="w-4 h-4 mr-2" />
                        Open Map
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-high-contrast mb-2">
                No mind maps yet
              </h3>
              <p className="text-medium-contrast mb-6 text-base">
                Create your first mind map to start organizing your knowledge.
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Your First Map
              </Button>
            </div>
          )}

          {/* Create Map Modal */}
          <Modal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            title="Create New Mind Map"
          >
            <form onSubmit={handleCreateMap} className="space-y-4">
              <div>
                <label
                  htmlFor="mapName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Map Name *
                </label>
                <input
                  id="mapName"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter map name..."
                  required
                  autoFocus
                />
              </div>

              <div>
                <label
                  htmlFor="mapDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description (optional)
                </label>
                <textarea
                  id="mapDescription"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe what this map is for..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!formData.name.trim() || isCreating}
                >
                  {isCreating ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Map"
                  )}
                </Button>
              </div>
            </form>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            isOpen={!!deleteConfirm}
            onClose={() => setDeleteConfirm(null)}
            title="Delete Mind Map"
          >
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete this mind map? This action
                cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    deleteConfirm && handleDeleteMap(deleteConfirm)
                  }
                  loading={isDeleting}
                >
                  Delete Map
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </ErrorBoundary>
  );
}
