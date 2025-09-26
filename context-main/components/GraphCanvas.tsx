'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { GraphData, GraphNode, GraphEdge } from '@/services/types';

interface GraphCanvasProps {
    data: GraphData;
    onNodeClick?: (node: GraphNode) => void;
    onNodeHover?: (node: GraphNode | null) => void;
    height?: number;
    className?: string;
}

interface VisNode {
    id: string;
    label: string;
    shape: 'circle' | 'box';
    color: {
        background: string;
        border: string;
        highlight: {
            background: string;
            border: string;
        };
    };
    font: {
        color: string;
        size: number;
    };
    size?: number;
    image?: string;
}

interface VisEdge {
    id: string;
    from: string;
    to: string;
    label?: string;
    color: {
        color: string;
        highlight: string;
    };
    font: {
        color: string;
        size: number;
    };
    smooth: {
        type: string;
    };
}

interface TooltipState {
    visible: boolean;
    x: number;
    y: number;
    node: GraphNode | null;
}

export default function GraphCanvas({
    data,
    onNodeClick,
    onNodeHover,
    height = 600,
    className = ''
}: GraphCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const networkRef = useRef<Network | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [tooltip, setTooltip] = useState<TooltipState>({
        visible: false,
        x: 0,
        y: 0,
        node: null
    });

    // Convert our GraphNode to vis.js node format
    const convertToVisNodes = (nodes: GraphNode[]): VisNode[] => {
        return nodes.map(node => ({
            id: node.id,
            label: node.label,
            shape: node.type === 'entity' ? 'circle' : 'box',
            color: {
                background: node.type === 'entity' ? '#8B5CF6' : '#F3F4F6',
                border: node.type === 'entity' ? '#7C3AED' : '#9CA3AF',
                highlight: {
                    background: node.type === 'entity' ? '#A78BFA' : '#E5E7EB',
                    border: node.type === 'entity' ? '#8B5CF6' : '#6B7280'
                }
            },
            font: {
                color: node.type === 'entity' ? '#FFFFFF' : '#374151',
                size: 14
            },
            size: node.type === 'entity' ? 25 : 20,
            ...(node.thumbnail && { image: node.thumbnail })
        }));
    };

    // Convert our GraphEdge to vis.js edge format
    const convertToVisEdges = (edges: GraphEdge[]): VisEdge[] => {
        return edges.map(edge => ({
            id: edge.id,
            from: edge.from,
            to: edge.to,
            label: edge.label,
            color: {
                color: '#9CA3AF',
                highlight: '#8B5CF6'
            },
            font: {
                color: '#6B7280',
                size: 12
            },
            smooth: {
                type: 'continuous'
            }
        }));
    };

    useEffect(() => {
        if (!containerRef.current || !data) return;

        setIsLoading(true);

        try {
            // Convert data to vis.js format
            const visNodes = convertToVisNodes(data.nodes);
            const visEdges = convertToVisEdges(data.edges);

            // Create DataSets
            const nodes = new DataSet(visNodes);
            const edges = new DataSet(visEdges);

            // Network options
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
                    chosen: {
                        node: (values: any, id: string, selected: boolean, hovering: boolean) => {
                            if (hovering) {
                                values.shadow = true;
                                values.shadowColor = 'rgba(139, 92, 246, 0.3)';
                                values.shadowSize = 10;
                            }
                        }
                    } as any
                },
                edges: {
                    width: 2,
                    shadow: {
                        enabled: true,
                        color: 'rgba(0,0,0,0.1)',
                        size: 3,
                        x: 1,
                        y: 1
                    },
                    smooth: {
                        enabled: true,
                        type: 'continuous',
                        roundness: 0.5
                    } as any,
                    chosen: {
                        edge: (values: any, id: string, selected: boolean, hovering: boolean) => {
                            if (hovering) {
                                values.color = '#8B5CF6';
                                values.width = 3;
                            }
                        }
                    } as any
                },
                physics: {
                    enabled: true,
                    stabilization: {
                        enabled: true,
                        iterations: 100,
                        updateInterval: 25
                    },
                    barnesHut: {
                        gravitationalConstant: -2000,
                        centralGravity: 0.3,
                        springLength: 95,
                        springConstant: 0.04,
                        damping: 0.09,
                        avoidOverlap: 0.1
                    }
                },
                interaction: {
                    hover: true,
                    hoverConnectedEdges: true,
                    zoomView: true,
                    dragView: true,
                    selectConnectedEdges: false,
                    tooltipDelay: 200,
                    zoomSpeed: 1
                },
                layout: {
                    improvedLayout: true,
                    clusterThreshold: 150
                }
            };

            // Create network
            const network = new Network(
                containerRef.current,
                { nodes, edges } as any,
                options
            );

            networkRef.current = network;

            // Event handlers
            network.on('click', (params) => {
                // Hide tooltip on click
                setTooltip(prev => ({ ...prev, visible: false }));

                if (params.nodes.length > 0 && onNodeClick) {
                    const nodeId = params.nodes[0];
                    const node = data.nodes.find(n => n.id === nodeId);
                    if (node) {
                        onNodeClick(node);
                    }
                }
            });

            network.on('hoverNode', (params) => {
                const node = data.nodes.find(n => n.id === params.node);
                if (node) {
                    // Get mouse position relative to the container
                    const canvasPosition = network.canvasToDOM({ x: params.pointer.canvas.x, y: params.pointer.canvas.y });
                    const containerRect = containerRef.current?.getBoundingClientRect();

                    if (containerRect) {
                        setTooltip({
                            visible: true,
                            x: canvasPosition.x,
                            y: canvasPosition.y,
                            node: node
                        });
                    }

                    if (onNodeHover) {
                        onNodeHover(node);
                    }
                }
            });

            network.on('blurNode', () => {
                setTooltip(prev => ({ ...prev, visible: false }));

                if (onNodeHover) {
                    onNodeHover(null);
                }
            });

            // Hide tooltip when dragging or zooming
            network.on('dragStart', () => {
                setTooltip(prev => ({ ...prev, visible: false }));
            });

            network.on('zoom', () => {
                setTooltip(prev => ({ ...prev, visible: false }));
            });

            // Handle stabilization
            network.on('stabilizationIterationsDone', () => {
                setIsLoading(false);
            });

            // Fit the network to the container
            network.fit({
                animation: {
                    duration: 1000,
                    easingFunction: 'easeInOutQuad'
                }
            });

        } catch (error) {
            console.error('Error creating graph:', error);
            setIsLoading(false);
        }

        // Cleanup
        return () => {
            if (networkRef.current) {
                networkRef.current.destroy();
                networkRef.current = null;
            }
        };
    }, [data, onNodeClick, onNodeHover]);

    return (
        <div className={`relative ${className}`}>
            <div
                ref={containerRef}
                style={{ height: `${height}px` }}
                className="w-full border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                tabIndex={0}
                role="application"
                aria-label="Interactive knowledge graph. Use arrow keys to navigate, Enter to select nodes, and Tab to access controls."
                onKeyDown={(e) => {
                    // Basic keyboard navigation for accessibility
                    if (e.key === 'Tab') {
                        // Allow normal tab navigation
                        return;
                    }

                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        // Focus on the first node if available
                        if (networkRef.current && data.nodes.length > 0) {
                            networkRef.current.selectNodes([data.nodes[0].id]);
                            if (onNodeClick) {
                                onNodeClick(data.nodes[0]);
                            }
                        }
                    }

                    // Prevent default for arrow keys to avoid page scrolling
                    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                        e.preventDefault();
                    }
                }}
            />

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                        <span className="text-gray-600">Loading graph...</span>
                    </div>
                </div>
            )}

            {/* Tooltip */}
            {tooltip.visible && tooltip.node && (
                <div
                    className="absolute z-50 pointer-events-none"
                    style={{
                        left: tooltip.x + 10,
                        top: tooltip.y - 10,
                        transform: 'translateY(-100%)'
                    }}
                >
                    <div className="bg-gray-900 text-white text-sm rounded-lg shadow-lg p-3 max-w-xs">
                        <div className="flex items-start space-x-3">
                            {/* Thumbnail */}
                            {tooltip.node.thumbnail && (
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded border border-gray-600 overflow-hidden">
                                        <img
                                            src={tooltip.node.thumbnail}
                                            alt={tooltip.node.label}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className={`inline-block w-2 h-2 rounded-full ${tooltip.node.type === 'entity' ? 'bg-purple-400' : 'bg-gray-400'
                                        }`}></span>
                                    <span className="text-xs text-gray-300 uppercase tracking-wide">
                                        {tooltip.node.type}
                                    </span>
                                </div>

                                <div className="font-medium text-white truncate">
                                    {tooltip.node.label}
                                </div>

                                {/* Metadata */}
                                {tooltip.node.metadata && Object.keys(tooltip.node.metadata).length > 0 && (
                                    <div className="mt-2 text-xs text-gray-300">
                                        {Object.entries(tooltip.node.metadata).slice(0, 3).map(([key, value]) => (
                                            <div key={key} className="truncate">
                                                <span className="text-gray-400">{key}:</span> {String(value)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tooltip arrow */}
                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                </div>
            )}
        </div>
    );
}