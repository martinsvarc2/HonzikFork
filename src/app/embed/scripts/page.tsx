'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamic imports to avoid hydration issues
const ScriptUploader = dynamic(() => import('@/components/custom/ScriptUploader'), {
  loading: () => <div className="flex items-center justify-center h-32">Loading...</div>,
  ssr: false // This helps avoid hydration issues
});

const SetCallTargetsModal = dynamic(() => import('@/components/custom/SetCallTargetsModal'), {
  loading: () => <div className="flex items-center justify-center h-32">Loading...</div>,
  ssr: false
});

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col lg:flex-row gap-3 p-4">
        <div className="w-full lg:w-1/2">
          <ScriptUploader />
        </div>
        <div className="w-full lg:w-1/2">
          <SetCallTargetsModal />
        </div>
      </div>
    </Suspense>
  );
}