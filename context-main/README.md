# Context Frontend

A modern web application for semantic search and knowledge management built with Next.js 13+ App Router, TailwindCSS, and React Query.

## Features

- **Semantic Search**: AI-powered document search with natural language queries
- **File Management**: Upload, index, and manage documents with notes
- **Knowledge Graphs**: Interactive visualization of entity relationships
- **Mind Maps**: Create custom knowledge structures with drag-drop interface
- **System Health**: Real-time monitoring of API connections

## Tech Stack

- **Framework**: Next.js 13+ with App Router
- **Styling**: TailwindCSS with custom purple theme
- **State Management**: React Query (@tanstack/react-query)
- **Visualization**: vis.js for graphs and mind maps
- **TypeScript**: Full type safety throughout the application

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/                    # Next.js App Router pages
├── layout.tsx         # Root layout with providers
├── page.tsx           # Home page
├── search/            # Search functionality
├── graph/             # Knowledge graph visualization
└── maps/              # Mind mapping interface

components/            # Reusable React components
├── ui/                # Base UI components
└── [feature]/         # Feature-specific components

hooks/                 # Custom React hooks
├── useSearch.ts       # Search functionality
├── useFileManager.ts  # File operations
├── useGraph.ts        # Graph data management
├── useMaps.ts         # Mind map operations
└── useHealth.ts       # System health monitoring

services/              # API integration and utilities
├── api.ts             # API service layer
├── types.ts           # TypeScript interfaces
└── constants.ts       # API endpoints and configuration

lib/                   # Utility functions and providers
├── utils.ts           # Helper functions
└── providers.tsx      # React Query provider setup
```

## Design System

The application uses a custom purple-themed design system with:

- **Primary Colors**: Purple palette (50-950 shades)
- **Typography**: Inter font family
- **Spacing**: Consistent spacing scale
- **Shadows**: Custom purple-tinted shadows
- **Animations**: Smooth transitions and micro-interactions

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The application integrates with backend APIs for:

- Search: `GET /search?q={query}&limit={number}`
- File Management: `POST /index-file`, `DELETE /indexed-file`
- Knowledge Graphs: `GET /graph/entity?name={entity}`
- Mind Maps: `GET /maps`, `POST /maps`, `GET /maps/{id}`
- Health Monitoring: `GET /health`