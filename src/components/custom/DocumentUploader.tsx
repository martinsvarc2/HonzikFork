'use client'

import { useState, useCallback, ChangeEvent, DragEvent } from 'react'
import { Upload } from 'lucide-react'

interface DocumentUploaderProps {
  onUpload: (content: string, fileName: string) => void
}

export default function DocumentUploader({ onUpload }: DocumentUploaderProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const processFile = async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      let content = ''

      if (file.type === 'text/plain') {
        content = await file.text()
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const mammoth = await import('mammoth')
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.convertToHtml({ arrayBuffer }, {
          styleMap: [
            "p[style-name='Normal'] => p:fresh",
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "p[style-name='Heading 4'] => h4:fresh",
            "p[style-name='Heading 5'] => h5:fresh",
            "p[style-name='Heading 6'] => h6:fresh",
            "r[style-name='Strong'] => strong",
            "r[style-name='Emphasis'] => em",
            "table => table.docx-table",
            "tr => tr.docx-tr",
            "td => td.docx-td"
          ]
        })

        if (result.messages && result.messages.length > 0) {
          console.warn('Mammoth conversion messages:', result.messages)
        }

        content = result.value
      } else if (file.type === 'application/pdf') {
        content = `Content of PDF file "${file.name}". (PDF content extraction is not supported in this demo.)`
      } else {
        throw new Error('Unsupported file type')
      }

      onUpload(content, file.name)
    } catch (err) {
      setError('Error processing file. Please try again.')
      console.error('File processing error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }, [])

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }

  return (
    <div className="mt-3">
      <div
        className={`bg-[#f2f3f8] p-6 rounded-[20px] text-center border-2 border-dashed transition-colors ${
          isDragging ? 'border-[#5b06be] bg-[#f0e6ff]' : 'border-gray-300'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          onChange={handleFileChange}
          accept=".txt,.pdf,.docx"
          className="hidden"
          id="file-upload"
          disabled={isLoading}
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer font-montserrat font-semibold text-base md:text-sm sm:text-xs ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="flex flex-col items-center justify-center">
            <Upload className="w-12 h-12 text-[#5b06be] mb-2" />
            {isLoading ? 'Uploading...' : 'Drag & drop your file here or click to select'}
          </div>
        </label>
        <p className="mt-2 text-sm md:text-xs sm:text-xs text-gray-500 font-montserrat">
          Supported formats: .txt or .docx
        </p>
      </div>
      {error && (
        <p className="mt-2 text-red-500 font-montserrat text-sm md:text-xs sm:text-xs">
          {error}
        </p>
      )}
    </div>
  )
}
