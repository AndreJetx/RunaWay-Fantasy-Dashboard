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
    return fetchApi<{ user: { id: string; username: string } }>("/api/auth/user");
  },
  
  async logout() {
    return fetchApi<{ success: boolean }>("/api/auth/logout", { method: "POST" });
  },

  // Characters
  async getCharacters() {
    return fetchApi<Character[]>("/api/characters");
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

  // Items
  async getItems() {
    return fetchApi<Item[]>("/api/items");
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

  // Campaigns
  async getCampaigns() {
    return fetchApi<Campaign[]>("/api/campaigns");
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

  // Maps
  async getMaps() {
    return fetchApi<Map[]>("/api/maps");
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
  async getNotes() {
    return fetchApi<Note[]>("/api/notes");
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
