'use client';

import React, { useEffect, useRef } from 'react';

interface ScreenReaderAnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
  clearAfter?: number; // Clear message after X milliseconds
}

/**
 * Screen reader announcer component for dynamic content updates
 * Announces important changes to screen reader users
 */
export default function ScreenReaderAnnouncer({ 
  message, 
  priority = 'polite',
  clearAfter = 5000 
}: ScreenReaderAnnouncerProps) {
  const announcerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!message || !announcerRef.current) return;

    // Set the message
    announcerRef.current.textContent = message;

    // Clear the message after specified time
    const timer = setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = '';
      }
    }, clearAfter);

    return () => clearTimeout(timer);
  }, [message, clearAfter]);

  return (
    <div
      ref={announcerRef}
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
      role="status"
    />
  );
}

/**
 * Hook for programmatic screen reader announcements
 */
export function useScreenReaderAnnouncer() {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  // Create announcer element if it doesn't exist
  useEffect(() => {
    if (!announcerRef.current) {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.setAttribute('role', 'status');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }

    return () => {
      if (announcerRef.current && document.body.contains(announcerRef.current)) {
        document.body.removeChild(announcerRef.current);
      }
    };
  }, []);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcerRef.current) return;

    // Clear previous message
    announcerRef.current.textContent = '';
    
    // Set priority
    announcerRef.current.setAttribute('aria-live', priority);
    
    // Announce new message after a brief delay to ensure screen readers pick it up
    setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = message;
      }
    }, 100);

    // Clear message after 5 seconds
    setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = '';
      }
    }, 5000);
  };

  return { announce };
}