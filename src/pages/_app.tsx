import '@/app/globals.css';
import type { AppProps } from 'next/app';
import Navigation from '@/components/Navigation';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className="min-h-screen max-w-md mx-auto p-4 pb-20">
      <div className="animate-fadeIn">
        <Component {...pageProps} />
      </div>
      <Navigation />
    </main>
  );
}
