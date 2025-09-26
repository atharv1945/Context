import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 className="text-6xl font-bold text-high-contrast mb-6">
              Context
            </h1>
            <p className="text-xl text-medium-contrast mb-12 max-w-2xl mx-auto leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-16">
              <div className="search-glass p-4 flex items-center">
                <svg className="w-6 h-6 text-white/70 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search your Document"
                  className="flex-1 bg-transparent text-high-contrast placeholder-white/80 outline-none text-lg"
                />
                <Link href="/search">
                  <Button className="btn-primary-dark ml-4 px-8">
                    View
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Document Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="card-dark p-0 overflow-hidden transition-all duration-300">
                {/* Image */}
                <div className="h-32 bg-gradient-to-br from-gray-400 to-gray-600 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="text-high-contrast font-semibold mb-2 text-base">
                    Search Title {index}
                  </h3>
                  <p className="text-medium-contrast text-sm leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
              </div>
            ))}
          </div>


        </div>
      </main>
    </div>
  )
}