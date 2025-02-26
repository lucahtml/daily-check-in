import './globals.css';
import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Daily Check In',
  description: 'Track your daily health and wellness data',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Daily Check In',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <main className="min-h-screen max-w-md mx-auto p-4 pb-20">
          {children}
          <Navigation />
        </main>
      </body>
    </html>
  );
}
