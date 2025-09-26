'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="header-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-high-contrast hover:text-purple-200 transition-colors">
              Context
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-8">
            <Link 
              href="/search" 
              className={`text-high-contrast hover:text-purple-200 transition-colors px-3 py-2 rounded-md text-base font-medium ${
                isActive('/search') ? 'bg-white/15 text-purple-200' : ''
              }`}
            >
              Search
            </Link>
            <Link 
              href="/graph" 
              className={`text-high-contrast hover:text-purple-200 transition-colors px-3 py-2 rounded-md text-base font-medium ${
                isActive('/graph') ? 'bg-white/15 text-purple-200' : ''
              }`}
            >
              Graph
            </Link>
            <Link 
              href="/maps" 
              className={`text-high-contrast hover:text-purple-200 transition-colors px-3 py-2 rounded-md text-base font-medium ${
                isActive('/maps') ? 'bg-white/15 text-purple-200' : ''
              }`}
            >
              Maps
            </Link>
          </nav>

          {/* User Avatar */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}