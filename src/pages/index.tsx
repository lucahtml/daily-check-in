import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PagesIndex() {
  const router = useRouter();

  useEffect(() => {
    router.push('/');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-primary mb-4">Daily Check In</h1>
        <p className="mb-4">Lade Anwendung...</p>
      </div>
    </div>
  );
}
