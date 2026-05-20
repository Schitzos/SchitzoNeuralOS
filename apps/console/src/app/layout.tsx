import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Neural Console — Schitzo NeuralOS',
  description: 'Multi-Agent AI Operating System Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen">{children}</body>
    </html>
  );
}
