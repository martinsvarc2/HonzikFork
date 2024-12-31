'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamic imports to avoid hydration issues
const ScriptUploader2 = dynamic(() => import('@/components/custom/ScriptUploader2'), {
  loading: () => <div className="flex items-center justify-center h-32">Loading...</div>,
  ssr: false // This helps avoid hydration issues
});

const SetCallTargetsModal2 = dynamic(() => import('@/components/custom/SetCallTargetsModal2'), {
  loading: () => <div className="flex items-center justify-center h-32">Loading...</div>,
  ssr: false
});

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col lg:flex-row gap-3 p-4">
        <div className="w-full lg:w-1/2">
          <ScriptUploader2 />
        </div>
        <div className="w-full lg:w-1/2">
          <SetCallTargetsModal2 />
        </div>
      </div>
    </Suspense>
  );
}