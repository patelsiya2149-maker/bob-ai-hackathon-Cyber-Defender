import { type ReactNode } from 'react';
import { NavBar } from './NavBar';

interface Props {
  children: ReactNode;
}

export function Layout({ children }: Props) {
  return (
    <div className="min-h-screen bg-shield-bg text-shield-text">
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
