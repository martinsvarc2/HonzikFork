export type Category = 'Wholesaling' | 'Creative Finance' | 'Agent Outreach' | 'Foreclosure'

export interface Template {
  title: string
  preview: string
  fullScript: string
}

export interface SavedScript {
  id: string
  name: string
  content: string
  lastEdited: string
  isSelected: boolean
  isPrimary: boolean
  category: Category
}

export interface CategoryData {
  category: Category
  scripts: SavedScript[]
}

export interface HeaderProps {
  step: number
  selectedCategory: Category | null
  isUploadMode: boolean
  selectedTemplate: boolean
}

export interface ScriptEditorProps {
  template: Template | null
  uploadedContent?: string
  editingScript: SavedScript | null
  onSave: (content: string, scriptName?: string) => Promise<void>
  handleGoBack: () => void
  onRename: (scriptId: string, newName: string) => Promise<void>
  onNameUpdate: (newName: string) => void
}

export interface ScriptFolderProps {
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
