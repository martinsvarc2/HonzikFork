'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  Palette, 
  Highlighter, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Heading1, 
  Heading2, 
  Heading3, 
  RotateCcw 
} from 'lucide-react'

interface FormattingToolbarProps {
  editorRef: React.RefObject<HTMLDivElement>
  onRevert: () => void
  hasChanges: boolean
}

// We could move this to a constants file if needed
const colors = [
  { value: '#000000', name: 'Black' },
  { value: '#3182ce', name: 'Blue' },
  { value: '#38a169', name: 'Green' },
  { value: '#ecc94b', name: 'Yellow' },
  { value: '#e53e3e', name: 'Red' },
]

const formatButtons = [
  { icon: Bold, command: 'bold', title: 'Bold' },
  { icon: Italic, command: 'italic', title: 'Italic' },
  { icon: Underline, command: 'underline', title: 'Underline' },
  { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
  { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
  { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
  { icon: Heading1, command: 'heading', value: 'h1', title: 'Heading 1' },
  { icon: Heading2, command: 'heading', value: 'h2', title: 'Heading 2' },
  { icon: Heading3, command: 'heading', value: 'h3', title: 'Heading 3' },
]

export function FormattingToolbar({ editorRef, onRevert, hasChanges }: FormattingToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#000000')
  const colorPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleFormat = (command: string, value?: string) => {
    if (!editorRef.current) return
    
    document.execCommand('styleWithCSS', false, 'true')
    
    try {
      switch (command) {
        case 'color':
          if (value) {
            document.execCommand('foreColor', false, value)
            setSelectedColor(value)
          }
          break
        case 'highlight':
          document.execCommand('backColor', false, '#fff3cd')
          break
        case 'heading':
          document.execCommand('formatBlock', false, value || 'p')
          break
        default:
          document.execCommand(command, false, value)
      }
    } catch (error) {
      console.error('Formatting error:', error)
    }

    editorRef.current.focus()
  }

  return (
    <div className="sticky top-0 left-0 right-0 flex items-center gap-0.5 bg-white p-2 border-b border-[#f2f3f8] z-10 flex-wrap rounded-t-[20px]">
      {formatButtons.map((button, index) => (
        <button
          key={index}
          onClick={() => handleFormat(button.command, button.value)}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title={button.title}
          type="button"
        >
          <button.icon className="w-4 h-4 text-[#5b06be] hover:text-[#4a05a0]" />
        </button>
      ))}
      
      <div className="relative" ref={colorPickerRef}>
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="p-2 hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
          title="Text Color"
          type="button"
        >
          <Palette className="w-4 h-4 text-[#5b06be] hover:text-[#4a05a0]" />
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: selectedColor }}
          />
        </button>
        {showColorPicker && (
          <div className="absolute top-full left-0 bg-white shadow-lg rounded-lg p-2 flex flex-col gap-1 z-20 mt-1 min-w-[120px]">
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => {
                  handleFormat('color', color.value)
                  setShowColorPicker(false)
                }}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded transition-colors w-full"
                title={color.name}
                type="button"
              >
                <div 
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: color.value }}
                />
                <span className="text-sm">{color.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => handleFormat('highlight')}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Highlight"
        type="button"
      >
        <Highlighter className="w-4 h-4 text-[#5b06be] hover:text-[#4a05a0]" />
      </button>

      {hasChanges && (
        <button
          onClick={onRevert}
          className="p-2 hover:bg-gray-100 rounded transition-colors ml-auto"
          title="Undo Changes"
          type="button"
        >
          <RotateCcw className="w-4 h-4 text-[#5b06be] hover:text-[#4a05a0]" />
        </button>
      )}
    </div>
  )
}
