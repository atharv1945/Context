'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import Modal from './ui/Modal';
import Button from './ui/Button';

export interface ContextMenuOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

export interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  options: ContextMenuOption[];
  onClose: () => void;
  className?: string;
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
  isLoading?: boolean;
}

// Confirmation Modal Component
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false,
  isLoading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="space-y-4">
        <p className="text-neutral-700">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? 'primary' : 'primary'}
            onClick={onConfirm}
            loading={isLoading}
            disabled={isLoading}
            className={isDestructive ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : ''}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Context Menu Component
const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  position,
  options,
  onClose,
  className
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Adjust position to keep menu within viewport
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let { x, y } = position;

    // Adjust horizontal position
    if (x + rect.width > viewportWidth) {
      x = viewportWidth - rect.width - 10;
    }
    if (x < 10) {
      x = 10;
    }

    // Adjust vertical position
    if (y + rect.height > viewportHeight) {
      y = viewportHeight - rect.height - 10;
    }
    if (y < 10) {
      y = 10;
    }

    setAdjustedPosition({ x, y });
  }, [isOpen, position]);

  // Handle clicks outside the menu
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={cn(
        'fixed z-50 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 min-w-48 animate-scale-in',
        className
      )}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
      role="menu"
      aria-orientation="vertical"
    >
      {options.map((option, index) => (
        <button
          key={option.id}
          onClick={() => {
            if (!option.disabled) {
              option.onClick();
              onClose();
            }
          }}
          disabled={option.disabled}
          className={cn(
            'w-full px-4 py-2 text-left text-sm flex items-center space-x-3 transition-colors duration-150',
            option.disabled
              ? 'text-neutral-400 cursor-not-allowed'
              : option.destructive
              ? 'text-red-700 hover:bg-red-50 focus:bg-red-50'
              : 'text-neutral-700 hover:bg-neutral-100 focus:bg-neutral-100',
            'focus:outline-none'
          )}
          role="menuitem"
          tabIndex={option.disabled ? -1 : 0}
        >
          {option.icon && (
            <span className="w-4 h-4 flex-shrink-0">
              {option.icon}
            </span>
          )}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
};

// Hook for managing context menu state
export const useContextMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const openContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setPosition({ x: event.clientX, y: event.clientY });
    setIsOpen(true);
  }, []);

  const closeContextMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    position,
    openContextMenu,
    closeContextMenu,
  };
};

// File Context Menu Component with predefined options
export interface FileContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onOpenFile: () => void;
  onShowInFolder: () => void;
  onAddToContextMap: () => void;
  onRemoveFromContext: () => void;
  fileName?: string;
  className?: string;
}

export const FileContextMenu: React.FC<FileContextMenuProps> = ({
  isOpen,
  position,
  onClose,
  onOpenFile,
  onShowInFolder,
  onAddToContextMap,
  onRemoveFromContext,
  fileName,
  className
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveClick = useCallback(() => {
    setShowConfirmation(true);
  }, []);

  const handleConfirmRemove = useCallback(async () => {
    setIsRemoving(true);
    try {
      await onRemoveFromContext();
      setShowConfirmation(false);
    } catch (error) {
      console.error('Failed to remove file:', error);
    } finally {
      setIsRemoving(false);
    }
  }, [onRemoveFromContext]);

  const handleCancelRemove = useCallback(() => {
    setShowConfirmation(false);
  }, []);

  const options: ContextMenuOption[] = [
    {
      id: 'open-file',
      label: 'Open Original File',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      ),
      onClick: onOpenFile,
    },
    {
      id: 'show-in-folder',
      label: 'Show in Folder',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      onClick: onShowInFolder,
    },
    {
      id: 'add-to-context-map',
      label: 'Add to Context Map',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      onClick: onAddToContextMap,
    },
    {
      id: 'remove-from-context',
      label: 'Remove from Context',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: handleRemoveClick,
      destructive: true,
    },
  ];

  return (
    <>
      <ContextMenu
        isOpen={isOpen}
        position={position}
        options={options}
        onClose={onClose}
        className={className}
      />
      
      <ConfirmationModal
        isOpen={showConfirmation}
        title="Remove File from Context"
        message={
          fileName
            ? `Are you sure you want to remove "${fileName}" from the context? This action cannot be undone.`
            : 'Are you sure you want to remove this file from the context? This action cannot be undone.'
        }
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
        isDestructive={true}
        isLoading={isRemoving}
      />
    </>
  );
};

export default ContextMenu;
export { ConfirmationModal };