'use client'

import { Upload, FileText } from 'lucide-react'
import Image from 'next/image'

interface ScriptActionsProps {
  onUpload: () => void
  onTemplateSelect: () => Promise<void>
}

export default function ScriptActions({ onUpload, onTemplateSelect }: ScriptActionsProps) {
  return (
    <div className="w-full flex justify-between gap-2 mt-1">
      <button
        className="bg-white text-black h-[45px] flex-1 px-3 rounded-[20px] font-montserrat font-semibold transition-all duration-300 flex items-center justify-center text-sm md:text-xs hover:border-2 hover:border-[#5b06be] border-2 border-[#f2f3f8]"
        onClick={onUpload}
      >
        Upload Script
        <Image
          src="https://res.cloudinary.com/drkudvyog/image/upload/v1733750646/upload_icon_bjsfxf.png"
          alt="Upload icon"
          width={16}
          height={16}
          className="ml-2 flex-shrink-0"
        />
      </button>
      <button
        className="bg-white text-black h-[45px] flex-1 px-3 rounded-[20px] font-montserrat font-semibold transition-all duration-300 flex items-center justify-center text-sm md:text-xs hover:border-2 hover:border-[#5b06be] border-2 border-[#f2f3f8]"
        onClick={onTemplateSelect}
      >
        Choose Template
        <Image
          src="https://res.cloudinary.com/drkudvyog/image/upload/v1733751206/Transcript_icon_xebqtc.png"
          alt="Transcript icon"
          width={16}
          height={16}
          className="ml-2 flex-shrink-0"
        />
      </button>
    </div>
  )
}
