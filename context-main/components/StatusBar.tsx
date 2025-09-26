'use client';

import { useHealth } from '../hooks/useHealth';

interface StatusBarProps {
  className?: string;
}

export default function StatusBar({ className = '' }: StatusBarProps) {
  const { status, isLoading, error, lastChecked, checkHealth } = useHealth();

  const getStatusConfig = () => {
    switch (status) {
      case 'healthy':
        return {
          color: 'bg-purple-500',
          text: 'System Healthy',
          textColor: 'text-purple-700',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          icon: '●',
        };
      case 'degraded':
        return {
          color: 'bg-amber-500',
          text: 'System Degraded',
          textColor: 'text-amber-700',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          icon: '◐',
        };
      case 'down':
        return {
          color: 'bg-red-500',
          text: 'System Down',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: '○',
        };
      case 'checking':
        return {
          color: 'bg-purple-400',
          text: 'Checking Status...',
          textColor: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          icon: '◔',
        };
      default:
        return {
          color: 'bg-neutral-400',
          text: 'Unknown Status',
          textColor: 'text-neutral-600',
          bgColor: 'bg-neutral-50',
          borderColor: 'border-neutral-200',
          icon: '?',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const isAnimating = status === 'checking' || isLoading;

  const formatLastChecked = () => {
    if (!lastChecked) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastChecked.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastChecked.toLocaleTimeString();
  };

  return (
    <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
      <div 
        className={`
          bg-black/20 border-white/20
          border rounded-xl px-4 py-2 shadow-lg backdrop-blur-sm
          transition-all duration-300 ease-in-out
          hover:shadow-xl hover:scale-105 hover:bg-black/30
          cursor-pointer group
        `}
        onClick={checkHealth}
        title={error ? `Error: ${error}` : `Last checked: ${formatLastChecked()}`}
      >
        <div className="flex items-center gap-3">
          {/* Status indicator with smooth transitions */}
          <div className="relative">
            <div 
              className={`
                w-3 h-3 rounded-full ${statusConfig.color}
                transition-all duration-500 ease-in-out
                ${isAnimating ? 'animate-pulse scale-110' : 'scale-100'}
                group-hover:scale-125
              `} 
            />
            {/* Pulse ring for active states */}
            {(status === 'healthy' || isAnimating) && (
              <div 
                className={`
                  absolute inset-0 w-3 h-3 rounded-full ${statusConfig.color}
                  opacity-30 animate-ping
                  ${isAnimating ? 'block' : 'group-hover:block hidden'}
                `}
              />
            )}
          </div>

          {/* Status text with smooth color transitions */}
          <div className="flex flex-col">
            <span 
              className={`
                text-sm font-medium text-white
                transition-colors duration-300 ease-in-out
              `}
            >
              {statusConfig.text}
            </span>
            
            {/* Last checked time - only show on hover or if there's an error */}
            {(lastChecked || error) && (
              <span 
                className={`
                  text-xs opacity-0 group-hover:opacity-70 
                  transition-opacity duration-200 ease-in-out
                  ${error ? 'text-red-300 opacity-70' : 'text-white/70'}
                `}
              >
                {error ? `Error: ${error}` : formatLastChecked()}
              </span>
            )}
          </div>

          {/* Loading spinner for checking state */}
          {isLoading && (
            <div className="ml-1">
              <div 
                className={`
                  w-4 h-4 border-2 border-white/30 border-t-white 
                  rounded-full animate-spin
                `}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}