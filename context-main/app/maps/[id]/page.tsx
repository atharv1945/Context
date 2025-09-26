import { Metadata } from 'next';
import MapInterface from './MapInterface';

interface MapPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: MapPageProps): Promise<Metadata> {
  return {
    title: `Mind Map - Context Frontend`,
    description: 'View and edit your custom mind map',
  };
}

export default function MapPage({ params }: MapPageProps) {
  return <MapInterface mapId={params.id} />;
}