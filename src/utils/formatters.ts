// src/utils/formatters.ts

interface FilterableData {
  name: string;
  [key: string]: any;  // Allows for additional properties
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'numeric', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
}

export function filterData<T extends FilterableData>(data: T[], query: string): T[] {
  if (!data) return [];
  return data.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase())
  )
}