import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jaier Gordon — Front-End Engineer',
  description: 'Front-End Engineer specializing in AI-powered customer experiences, React, TypeScript, and Next.js.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Jaier Gordon — Front-End Engineer',
    description: 'Building customer-facing AI experiences and scalable front-end systems.',
    url: 'https://jaier.dev',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#0A0A0B" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
