import { SavedScript, Category } from '@/types';

interface ScriptUpdateParams {
  name?: string;
  content?: string;
  isSelected?: boolean;
  isPrimary?: boolean;
  memberstackId?: string;
  category?: Category;
}

export const scriptService2 = {
  async getScripts(teamId: string, memberstackId: string, category?: Category): Promise<SavedScript[]> {
    const params = new URLSearchParams({
      teamId,
      memberstackId,
      ...(category && { category })
    });

    const response = await fetch(`/api/scripts2/scripts?${params}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch scripts');
    }

    return response.json();
  },

  async createScript(
    teamId: string,
    memberstackId: string,
    name: string,
    content: string,
    category: Category,
    isPrimary: boolean = false
  ): Promise<SavedScript> {
    const response = await fetch('/api/scripts2/scripts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamId,
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
    teamId: string,
    updates: ScriptUpdateParams
  ): Promise<SavedScript> {
    const response = await fetch('/api/scripts2/scripts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        teamId,
        ...updates
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update script');
    }

    return response.json();
  },

  async deleteScript(id: string, teamId: string): Promise<{ success: boolean }> {
    const params = new URLSearchParams({ id, teamId });
    const response = await fetch(`/api/scripts2/scripts?${params}`, {
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
    teamId: string,
    category: Category,
    isPrimary: boolean
  ): Promise<SavedScript> {
    if (isPrimary) {
      // First, remove primary status from all scripts in the category
      const scripts = await this.getScripts(teamId, '', category);
      const currentPrimaryScript = scripts.find(script => script.isPrimary);
      
      if (currentPrimaryScript) {
        await this.updateScript(currentPrimaryScript.id, teamId, {
          isPrimary: false
        });
      }
    }

    // Then update the target script
    return this.updateScript(id, teamId, {
      isPrimary
    });
  }
};