import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'accent' | 'neutral';
  className?: string;
  label?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
  label = 'Loading...'
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colors = {
    primary: 'border-neutral-200 border-t-primary-600',
    secondary: 'border-neutral-200 border-t-secondary-600',
    accent: 'border-neutral-200 border-t-accent-600',
    neutral: 'border-neutral-300 border-t-neutral-600'
  };

  return (
    <div className="flex items-center justify-center" role="status" aria-label={label}>
      <div
        className={cn(
          'animate-spin rounded-full border-2',
          sizes[size],
          colors[color],
          className
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

// Inline spinner for buttons and small spaces
export const InlineSpinner: React.FC<Omit<LoadingSpinnerProps, 'label'>> = ({
  size = 'sm',
  color = 'primary',
  className
}) => {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const colors = {
    primary: 'border-neutral-200 border-t-primary-600',
    secondary: 'border-neutral-200 border-t-secondary-600',
    accent: 'border-neutral-200 border-t-accent-600',
    neutral: 'border-neutral-300 border-t-neutral-600'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2',
        sizes[size],
        colors[color],
        className
      )}
      aria-hidden="true"
    />
  );
};

// Full page loading overlay
export const LoadingOverlay: React.FC<{
  message?: string;
  size?: LoadingSpinnerProps['size'];
}> = ({ message = 'Loading...', size = 'lg' }) => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-40 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size={size} label={message} />
        <p className="mt-4 text-neutral-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

// Card loading skeleton
export const LoadingSkeleton: React.FC<{
  className?: string;
  lines?: number;
}> = ({ className, lines = 3 }) => {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="bg-neutral-200 rounded-lg h-4 w-3/4 mb-3"></div>
      {Array.from({ length: lines - 1 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'bg-neutral-200 rounded-lg h-4 mb-2',
            index === lines - 2 ? 'w-1/2' : 'w-full'
          )}
        ></div>
      ))}
    </div>
  );
};

export default LoadingSpinner;