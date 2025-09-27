'use client';

import { useState } from 'react';
import { SearchResult } from '../services/types';
import LazyImage from './ui/LazyImage';
import { 
  DocumentIcon, 
  PhotoIcon, 
  FilmIcon,
  MusicalNoteIcon,
  CodeBracketIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface ResultCardProps {
  result: SearchResult;
  onContextMenu?: (result: SearchResult, position: { x: number; y: number }) => void;
}

/**
 * ResultCard component with Figma styling
 * Implements requirements 1.3 and 1.4
 */
export default function ResultCard({ result, onContextMenu }: ResultCardProps) {
  const [imageError, setImageError] = useState(false);

  // Normalize incoming data to a consistent shape (supports backend SearchResult and UI shape)
  const filePath: string | undefined = (result as any).file_path;
  const filename: string = (result as any).filename || (filePath ? filePath.split(/[/\\]/).pop() || filePath : 'Untitled');
  const backendType: string | undefined = (result as any).type; // 'pdf' | 'pdf_page' | 'image'
  const derivedMime: string = backendType === 'image' ? 'image/jpeg'
    : backendType === 'pdf' || backendType === 'pdf_page' ? 'application/pdf'
    : (result as any).fileType || 'application/octet-stream';
  const fileType: string = (result as any).fileType || derivedMime;
  const similarityRaw: number | undefined = (result as any).similarity;
  const similarityScore: number = (result as any).similarityScore ?? (
    typeof similarityRaw === 'number' ? Math.round(similarityRaw * 100) : 0
  );
  const aiTags: string[] = (result as any).aiTags || (result as any).tags || [];
  const userCaption: string | undefined = (result as any).userCaption || (result as any).user_caption;
  const thumbnail: string | undefined = (result as any).thumbnail;
  const stableId: string = (result as any).id?.toString() || filePath || filename;

  const originalPdfPath: string | undefined = (result as any).original_pdf_path;
  const pageNum: number | undefined = (result as any).page_num;
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onContextMenu) {
      onContextMenu(result, { x: e.clientX, y: e.clientY });
    }
  };

  const handleOpenFile = async () => {
    // In a standard web browser, directly opening local file paths is a security restriction.
    // This function sends a request to the backend, which can be logged or intercepted by a desktop wrapper.
    const openPath = originalPdfPath || filePath;
    if (openPath) {
      try {
        await fetch('http://127.0.0.1:8000/open-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file_path: openPath }),
        });
        console.log(`Sent open request for: ${openPath}`);
      } catch (error) {
        console.error('Failed to send open-file request:', error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Handle card activation (could open file or show details)
      handleOpenFile();
    } else if (e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey)) {
      e.preventDefault();
      if (onContextMenu) {
        // Get the card element's position for context menu
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        onContextMenu(result, { 
          x: rect.left + rect.width / 2, 
          y: rect.top + rect.height / 2 
        });
      }
    }
  };

  const getFileTypeIcon = (fileType?: string) => {
    if (!fileType) return <DocumentIcon className="w-5 h-5" />;
    if (fileType.startsWith('image/')) {
      return <PhotoIcon className="w-5 h-5" />;
    } else if (fileType.startsWith('video/')) {
      return <FilmIcon className="w-5 h-5" />;
    } else if (fileType.startsWith('audio/')) {
      return <MusicalNoteIcon className="w-5 h-5" />;
    } else if (fileType.includes('code') || fileType.includes('javascript') || fileType.includes('typescript')) {
      return <CodeBracketIcon className="w-5 h-5" />;
    } else {
      return <DocumentIcon className="w-5 h-5" />;
    }
  };

  const getFileTypeColor = (fileType?: string) => {
    if (!fileType) return 'text-gray-600 bg-gray-50';
    if (fileType.startsWith('image/')) {
      return 'text-green-600 bg-green-50';
    } else if (fileType.startsWith('video/')) {
      return 'text-blue-600 bg-blue-50';
    } else if (fileType.startsWith('audio/')) {
      return 'text-purple-600 bg-purple-50';
    } else if (fileType.includes('pdf')) {
      return 'text-red-600 bg-red-50';
    } else {
      return 'text-gray-600 bg-gray-50';
    }
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div 
      className="group card-dark focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 transition-all duration-300 overflow-hidden cursor-pointer"
      onContextMenu={handleContextMenu}
      onClick={handleOpenFile}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Search result: ${filename}. Similarity score: ${similarityScore}%. ${userCaption ? `Note: ${userCaption}` : ''}`}
      aria-describedby={`result-${stableId}-details`}
    >
      {/* Thumbnail Section */}
      <div className="relative h-32 bg-gradient-to-br from-gray-600 to-gray-800">
        {thumbnail && !imageError ? (
          <LazyImage
            src={thumbnail}
            alt={filename}
            fill
            className="object-cover"
            objectFit="cover"
            onError={() => setImageError(true)}
            fallback={
              <div className="flex items-center justify-center h-full text-white/70">
                {getFileTypeIcon(fileType)}
              </div>
            }
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white/70">
            {getFileTypeIcon(fileType)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* File Type Indicator */}
        <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-sm font-medium flex items-center gap-1 bg-black/50 text-high-contrast backdrop-blur-sm">
          {getFileTypeIcon(fileType)}
          <span className="uppercase">{(fileType.split('/')[1]) || 'FILE'}</span>
        </div>
        
      </div>
      
      {/* Content Section */}
      <div className="p-4">
        {/* Filename */}
        <h3 className="font-semibold text-high-contrast mb-2 line-clamp-2 group-hover:text-purple-200 group-focus:text-purple-200 transition-colors text-base">
          {filename}
        </h3>
        
        {/* Hidden details for screen readers */}
        <div id={`result-${stableId}-details`} className="sr-only">
          File type: {fileType}. 
          {aiTags?.length > 0 && `Tags: ${aiTags.join(', ')}. `}
          {userCaption && `User note: ${userCaption}. `}
          Press Enter to open, or Shift+F10 for more options.
        </div>
        
        {/* AI Tags */}
        {aiTags && aiTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {aiTags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="inline-block px-2 py-1 text-sm font-medium text-purple-100 bg-purple-500/40 rounded-full backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
            {aiTags.length > 3 && (
              <span className="inline-block px-2 py-1 text-sm font-medium text-medium-contrast bg-white/15 rounded-full backdrop-blur-sm">
                +{aiTags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* User Caption */}
        {userCaption && (
          <div className="flex items-start gap-2 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <PencilIcon className="w-4 h-4 text-medium-contrast mt-0.5 flex-shrink-0" />
            <p className="text-sm text-medium-contrast line-clamp-2 leading-relaxed">
              {userCaption}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}