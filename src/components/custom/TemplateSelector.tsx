'use client'

import { useState } from 'react'
import { Category, Template } from '@/types'
import templates from '@/data/templates'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface TemplateSelectorProps {
  category: Category
  onSelect: (template: Template) => void
}

export default function TemplateSelector({ category, onSelect }: TemplateSelectorProps) {
  const categoryTemplates = templates[category]
  const [expandedTemplate, setExpandedTemplate] = useState<number | null>(null)

  const toggleTemplate = (index: number) => {
    setExpandedTemplate(expandedTemplate === index ? null : index)
  }

  return (
    <div className="dynamic-height-container dynamic-height-content space-y-3">
      {categoryTemplates.map((template, index) => (
        <div
          key={index}
          className="bg-white p-3 rounded-[20px] border-2 border-[#f2f3f8] transition-colors duration-300"
        >
          <h3 className="font-montserrat font-semibold text-base md:text-sm sm:text-xs mb-1">
            {template.title}
          </h3>
          <p className="mb-2 text-sm md:text-xs sm:text-xs font-montserrat">
            {template.preview}
          </p>
          <div className="mt-2">
            <button
              className="text-[#5b06be] h-[45px] w-full sm:w-auto px-3 rounded-[20px] font-montserrat font-semibold transition-colors duration-300 flex items-center justify-start text-sm md:text-xs"
              onClick={() => toggleTemplate(index)}
            >
              {expandedTemplate === index ? (
                <ChevronUp className="mr-2 w-4 h-4" />
              ) : (
                <ChevronDown className="mr-2 w-4 h-4" />
              )}
              {expandedTemplate === index ? 'Hide Full Script' : 'Show Full Script'}
            </button>
            {expandedTemplate === index && (
              <div className="mt-2 p-2 bg-[#f2f3f8] rounded-[20px] max-h-[200px] overflow-y-auto">
                <p className="font-montserrat text-sm md:text-xs sm:text-xs">
                  {template.fullScript}
                </p>
                <div className="mt-2 flex justify-start">
                  <button
                    className="text-white h-[45px] w-full sm:w-auto px-3 rounded-[20px] font-montserrat font-semibold transition-shadow duration-300 flex items-center justify-center bg-[#f8bd30] text-sm md:text-xs"
                    onClick={() => onSelect(template)}
                  >
                    Choose This Script
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
