import { Metadata } from 'next';
import MapsInterface from './MapsInterface';

export const metadata: Metadata = {
  title: 'Mind Maps - Context Frontend',
  description: 'Create and manage custom mind maps for organizing your knowledge',
};

export default function MapsPage() {
  return <MapsInterface />;
}