'use client'

import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  onClick: () => void
}

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-full bg-white border-2 border-[#f2f3f8] mr-2"
      aria-label="Go back"
      type="button"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  )
}
