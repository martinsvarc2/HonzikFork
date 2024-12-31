import { SavedScript, Category } from '@/types';

interface ScriptUpdateParams {
  name?: string;
  content?: string;
  isSelected?: boolean;
  isPrimary?: boolean;
  memberstackId?: string;
  category?: Category;
}

export const scriptService = {
  async getScripts(_teamId: string, memberstackId: string, category?: Category): Promise<SavedScript[]> {
    const params = new URLSearchParams({
      teamId: "undefined", // Always send "undefined" as string
      memberstackId,
      ...(category && { category })
    });
    
    const response = await fetch(`/api/scripts/scripts?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch scripts');
    }
    
    return response.json();
  },

  async createScript(
    _teamId: string,
    memberstackId: string,
    name: string,
    content: string,
    category: Category,
    isPrimary: boolean = false
  ): Promise<SavedScript> {
    const response = await fetch('/api/scripts/scripts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamId: "undefined", // Always send "undefined" as string
        memberstackId,
        name,
        content,
        category,
        isPrimary
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create script');
    }

    return response.json();
  },

  async updateScript(
    id: string,
    _teamId: string,
    updates: ScriptUpdateParams
  ): Promise<SavedScript> {
    const response = await fetch('/api/scripts/scripts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        teamId: "undefined", // Always send "undefined" as string
        ...updates
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update script');
    }

    return response.json();
  },

  async deleteScript(id: string, _teamId: string): Promise<{ success: boolean }> {
    const params = new URLSearchParams({ 
      id,
      teamId: "undefined" // Always send "undefined" as string
    });
    
    const response = await fetch(`/api/scripts/scripts?${params}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete script');
    }

    return response.json();
  },

  async setPrimaryScript(
    id: string,
    _teamId: string,
    category: Category,
    isPrimary: boolean
  ): Promise<SavedScript> {
    if (isPrimary) {
      await this.updateScript(id, "undefined", {
        category,
        isPrimary: false
      });
    }

    return this.updateScript(id, "undefined", {
      isPrimary
    });
  }
};