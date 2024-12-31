'use client'

import { useState } from 'react'
import { SavedScript, Category } from '@/types'
import { Edit, Trash2, PenLine, Save, ArrowLeft } from 'lucide-react'

interface ScriptFolderProps {
  category: Category
  scripts: SavedScript[]
  onEdit: (script: SavedScript) => void
  onRemove: (scriptId: string) => void
  onSelect: (scriptId: string) => void
  onUploadNew: () => void
  onRename: (scriptId: string, newName: string) => void
  onBack: () => void
  onPrimaryChange: (scriptId: string, isPrimary: boolean) => void
}

export default function ScriptFolder({
  category,
  scripts,
  onEdit,
  onRemove,
  onSelect,
  onUploadNew,
  onRename,
  onBack,
  onPrimaryChange
}: ScriptFolderProps) {
  const [editingNameId, setEditingNameId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState<string>('')

  const handlePrimaryChange = (scriptId: string, currentValue: boolean) => {
    onPrimaryChange(scriptId, !currentValue)
  }

  const handleStartEditing = (script: SavedScript) => {
    setEditingText(script.name)
    setEditingNameId(script.id)
  }

  const handleSave = (scriptId: string) => {
    if (editingText.trim()) {
      onRename(scriptId, editingText)
    }
    setEditingNameId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2.5 rounded-[200px] hover:bg-gray-50 transition-all duration-300 border-2 border-[#f2f3f8] bg-white shadow-sm hover:shadow-md"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold font-montserrat bg-gradient-to-r from-[#5b06be] to-[#8b3bff] bg-clip-text text-transparent">
          {category} Scripts
        </h2>
      </div>
      <div className="scrollable-content space-y-4 max-h-[400px] overflow-y-auto overflow-x-hidden w-full pr-2">
        {scripts.map((script) => (
          <div 
            key={script.id} 
            className="bg-white p-5 rounded-[24px] border border-[#f2f3f8] shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex flex-col space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={editingNameId === script.id ? editingText : script.name}
                      onChange={(e) => setEditingText(e.target.value)}
                      onBlur={() => {
                        if (editingNameId === script.id) {
                          handleSave(script.id)
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSave(script.id)
                        } else if (e.key === 'Escape') {
                          setEditingNameId(null)
                        }
                      }}
                      className={`font-montserrat font-semibold text-sm truncate w-full bg-transparent ${
                        editingNameId === script.id
                          ? 'border-b-2 border-[#5b06be] focus:outline-none'
                          : 'border-b-2 border-transparent'
                      }`}
                      readOnly={editingNameId !== script.id}
                    />
                    <button
                      onClick={() => {
                        if (editingNameId === script.id) {
                          handleSave(script.id)
                        } else {
                          handleStartEditing(script)
                        }
                      }}
                      className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-all duration-300 flex-shrink-0"
                    >
                      {editingNameId === script.id ? (
                        <Save className="w-4 h-4 text-[#5b06be]" />
                      ) : (
                        <PenLine className="w-4 h-4 text-gray-400 hover:text-[#5b06be]" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 mb-3 font-montserrat">
                    Last edited: {new Date(script.lastEdited).toLocaleString()}
                  </p>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onEdit(script)}
                      className="p-2.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-all duration-300 group"
                    >
                      <Edit className="w-4 h-4 text-gray-400 group-hover:text-[#5b06be]" />
                    </button>
                    <button
                      onClick={() => onRemove(script.id)}
                      className="p-2.5 rounded-full bg-gray-50 hover:bg-red-50 transition-all duration-300 group"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                    </button>
                    <div className="flex items-center pl-1">
                      <label className="inline-flex items-center cursor-pointer group">
                        <div className="relative">
                          <input
                            type="radio"
                            name={`primary-${category}`}
                            checked={script.isPrimary}
                            onChange={() => handlePrimaryChange(script.id, script.isPrimary || false)}
                            className="peer hidden"
                          />
                          <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-[#5b06be10] transition-all duration-300 flex items-center justify-center">
                            <div 
                              className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                                script.isPrimary 
                                  ? 'border-[#5b06be] bg-[#5b06be] scale-100' 
                                  : 'border-gray-300 bg-white scale-90 group-hover:border-[#5b06be]'
                              }`}
                            />
                          </div>
                        </div>
                        <span className="ml-3 text-sm font-montserrat text-gray-600 group-hover:text-[#5b06be] transition-all duration-300">
                          Make Primary
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onUploadNew}
        className="w-full bg-gradient-to-r from-[#5b06be] to-[#8b3bff] text-white h-[50px] px-4 rounded-[24px] 
                 font-montserrat font-semibold transition-all duration-300 flex items-center justify-center 
                 text-sm hover:shadow-lg hover:from-[#6507d2] hover:to-[#9544ff] transform hover:-translate-y-0.5"
      >
        Upload New Script or Choose Template
      </button>
    </div>
  )
}
