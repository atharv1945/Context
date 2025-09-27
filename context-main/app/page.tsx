import Link from 'next/link';
import HomepageSearchBar from '@/components/HomepageSearchBar';

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
              <HomepageSearchBar />
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