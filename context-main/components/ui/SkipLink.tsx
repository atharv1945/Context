'use client';

import React from 'react';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

/**
 * Skip link component for keyboard navigation accessibility
 * Allows users to skip to main content or other important sections
 */
export default function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200"
    >
      {children}
    </a>
  );
}