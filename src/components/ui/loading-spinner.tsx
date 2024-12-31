'use client'

import { FC } from 'react'
import Image from 'next/image'

const LoadingSpinner: FC = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-transparent">
      <div className="relative w-24 h-24" role="status" aria-label="Loading">
        <svg
          className="w-full h-full animate-spin"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#F5F5F5"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#5b06be"
            strokeWidth="12"
            fill="none"
            strokeDasharray="30 95 30 95"
            strokeDashoffset="-15"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Image 
            src="https://res.cloudinary.com/dmbzcxhjn/image/upload/Colors_logo_gawxfo_kvyozr.png"
            alt="AI Logo"
            width={24}
            height={24}
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
    
  )
}

export default LoadingSpinner
