'use client';

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Creative from '@/components/custom/Creative';

function ErrorFallback({ error }: { error: Error }) {
  console.error('Error details:', error); // Add this for debugging
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
      <pre className="mt-2 text-sm text-gray-500">{error.message}</pre>
      <pre className="mt-2 text-xs text-gray-400">{error.stack}</pre>
    </div>
  );
}

function LoadingFallback() {
  console.log('Loading state rendered'); // Add this for debugging
  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5b06be]"></div>
    </div>
  );
}

export default function CreativePage() {
  console.log('CreativePage rendering'); // Add this for debugging

  const handleError = (error: Error) => {
    console.error('Error in Creative page:', error);
  };

  return (
    <div className="min-h-screen bg-white">
      <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
        <Suspense fallback={<LoadingFallback />}>
          <div className="container mx-auto p-4">
            {/* Add immediate error boundary for Creative component */}
            <ErrorBoundary 
              FallbackComponent={ErrorFallback} 
              onError={(error) => console.error('Error in Creative component:', error)}
            >
              <Creative />
            </ErrorBoundary>
          </div>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}