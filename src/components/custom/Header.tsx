'use client'

import Image from 'next/image'
import { Category, HeaderProps } from '@/types'

export default function Header({ 
  step, 
  selectedCategory, 
  isUploadMode, 
  selectedTemplate 
}: HeaderProps) {
  const title = step === 1 
    ? "Upload Your Scripts" 
    : selectedCategory || ""

  let subheadline = ""
  if (step === 1) {
    subheadline = "Align and Train Yourself with Your Own Scripts or Proven Templates"
  } else if (step === 2) {
    subheadline = "Prepare your script"
  } else if (step === 3) {
    if (isUploadMode) {
      subheadline = "Your Uploaded Script. Make any edits you need, then click 'Save' when you're done."
    } else if (selectedTemplate) {
      subheadline = "Make any edits you need, then click 'Save' when you're done."
    } else {
      subheadline = "Choose One of Our Templates."
    }
  }

  return (
    <div className="w-full bg-white rounded-[20px] px-4 py-2">
      <div className="flex items-start space-x-2">
        <div className="flex-shrink-0 mt-[2px]">
          <Image
            src="https://res.cloudinary.com/drkudvyog/image/upload/v1733749804/Script_icon_qqt4mv.png"
            alt="Script icon"
            width={24}
            height={24}
            className="object-contain"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-[18px] md:text-[16px] sm:text-[14px] font-extrabold font-montserrat leading-tight text-[#5b06be] mb-1">
            {title.endsWith('.') ? title.slice(0, -1) : title}
          </h1>
          <p className="text-[14px] md:text-[14px] sm:text-[14px] font-bold font-montserrat text-gray-600 leading-snug">
            {subheadline}
          </p>
        </div>
      </div>
    </div>
  )
}
