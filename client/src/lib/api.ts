import type { Character, Campaign, Item, Note, Map } from "@shared/schema";

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Request failed");
  }

  return res.json();
}

export const api = {
  // Auth
  async getUser() {
    return fetchApi<{ user: { id: string; username: string; role: string } }>("/api/auth/user");
  },
  
  async logout() {
    return fetchApi<{ success: boolean }>("/api/auth/logout", { method: "POST" });
  },

  // Campaigns
  async getCampaigns() {
    return fetchApi<Campaign[]>("/api/campaigns");
  },

  async getCampaign(id: string) {
    return fetchApi<Campaign>(`/api/campaigns/${id}`);
  },

  async createCampaign(data: Partial<Campaign>) {
    return fetchApi<Campaign>("/api/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateCampaign(id: string, data: Partial<Campaign>) {
    return fetchApi<Campaign>(`/api/campaigns/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async deleteCampaign(id: string) {
    return fetchApi<{ success: boolean }>(`/api/campaigns/${id}`, {
      method: "DELETE",
    });
  },

  async joinCampaign(inviteCode: string) {
    return fetchApi<{ campaign: Campaign }>("/api/campaigns/join", {
      method: "POST",
      body: JSON.stringify({ inviteCode }),
    });
  },

  async getCampaignMembers(campaignId: string) {
    return fetchApi<Array<{ id: string; username: string; joinedAt: string }>>(`/api/campaigns/${campaignId}/members`);
  },

  // Characters
  async getCharactersByCampaign(campaignId: string) {
    return fetchApi<Character[]>(`/api/campaigns/${campaignId}/characters`);
  },

  async getMyCharacters() {
    return fetchApi<Character[]>("/api/characters");
  },

  async getCharacter(id: string) {
    return fetchApi<Character>(`/api/characters/${id}`);
  },

  async createCharacter(data: Partial<Character>) {
    return fetchApi<Character>("/api/characters", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateCharacter(id: string, data: Partial<Character>) {
    return fetchApi<Character>(`/api/characters/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async deleteCharacter(id: string) {
    return fetchApi<{ success: boolean }>(`/api/characters/${id}`, {
      method: "DELETE",
    });
  },

  // Change Logs (DM only)
  async getChangeLogs(campaignId: string, unseenOnly = false) {
    const url = `/api/campaigns/${campaignId}/changelog${unseenOnly ? "?unseen=true" : ""}`;
    return fetchApi<Array<{
      id: string;
      characterId: string;
      playerId: string;
      changeType: string;
      fieldChanged?: string;
      oldValue?: string;
      newValue?: string;
      description?: string;
      seenByDm: boolean;
      createdAt: string;
    }>>(url);
  },

  async markChangeLogsSeen(campaignId: string) {
    return fetchApi<{ success: boolean }>(`/api/campaigns/${campaignId}/changelog/mark-seen`, {
      method: "POST",
    });
  },

  // Items
  async getItems(campaignId?: string) {
    const url = campaignId ? `/api/items?campaignId=${campaignId}` : "/api/items";
    return fetchApi<Item[]>(url);
  },

  async createItem(data: Partial<Item>) {
    return fetchApi<Item>("/api/items", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async deleteItem(id: string) {
    return fetchApi<{ success: boolean }>(`/api/items/${id}`, {
      method: "DELETE",
    });
  },

  // Maps
  async getMaps(campaignId: string) {
    return fetchApi<Map[]>(`/api/campaigns/${campaignId}/maps`);
  },

  async createMap(data: Partial<Map>) {
    return fetchApi<Map>("/api/maps", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async deleteMap(id: string) {
    return fetchApi<{ success: boolean }>(`/api/maps/${id}`, {
      method: "DELETE",
    });
  },

  // Notes
  async getNotes(campaignId: string) {
    return fetchApi<Note[]>(`/api/campaigns/${campaignId}/notes`);
  },

  async createNote(data: Partial<Note>) {
    return fetchApi<Note>("/api/notes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateNote(id: string, data: Partial<Note>) {
    return fetchApi<Note>(`/api/notes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async deleteNote(id: string) {
    return fetchApi<{ success: boolean }>(`/api/notes/${id}`, {
      method: "DELETE",
    });
  },
};
