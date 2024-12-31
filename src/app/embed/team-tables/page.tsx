// src/app/embed/team-tables/page.tsx
'use client';

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ActivityView } from "@/components/custom/activity-view"
import { RatingsView } from "@/components/custom/ratings-view"
import { CallLogsView } from "@/components/custom/call-logs-view"

function ErrorFallback({ error }: { error: Error }) {
 return (
   <div className="flex flex-col items-center justify-center min-h-screen">
     <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
     <pre className="mt-2 text-sm text-gray-500">{error.message}</pre>
   </div>
 );
}

function LoadingFallback() {
 return (
   <div className="flex justify-center items-center min-h-screen bg-white">
     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5b06be]"></div>
   </div>
 );
}

export default function TeamTablesPage() {
 const handleError = (error: Error) => {
   console.error('Error in TeamTables:', error);
 };

 return (
   <div className="min-h-screen bg-white">
     <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
       <Suspense fallback={<LoadingFallback />}>
         <div className="container mx-auto p-4 space-y-4">
           <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
             <ActivityView />
           </ErrorBoundary>
           <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
             <RatingsView />
           </ErrorBoundary>
           <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
             <CallLogsView />
           </ErrorBoundary>
         </div>
       </Suspense>
     </ErrorBoundary>
   </div>
 );
}