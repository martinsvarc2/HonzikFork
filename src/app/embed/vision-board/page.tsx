'use client';

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import VisionBoard from '@/components/custom/VisionBoard';

// Add debug log to track component lifecycle
console.log('Page module initializing');

function ErrorFallback({ error }: { error: Error }) {
  console.error('ErrorFallback rendered:', error);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
      <pre className="mt-2 text-sm text-gray-500">{error.message}</pre>
    </div>
  );
}

function LoadingFallback() {
  console.log('LoadingFallback rendered');
  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5b06be]"></div>
    </div>
  );
}

export default function VisionBoardPage() {
  console.log('VisionBoardPage rendering');

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error) => console.error('Root error boundary caught:', error)}
    >
      <Suspense fallback={<LoadingFallback />}>
        <VisionBoard />
      </Suspense>
    </ErrorBoundary>
  );
}