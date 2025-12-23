const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

export const api = {
  async getGifts(year = null) {
    const url = year 
      ? `${API_BASE_URL}/api/gifts?year=${year}` 
      : `${API_BASE_URL}/api/gifts`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch gifts');
    return response.json();
  },

  async getGift(id) {
    const response = await fetch(`${API_BASE_URL}/api/gifts/${id}`);
    if (!response.ok) throw new Error('Failed to fetch gift');
    return response.json();
  },

  async createGift(gift) {
    const response = await fetch(`${API_BASE_URL}/api/gifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gift),
    });
    if (!response.ok) throw new Error('Failed to create gift');
    return response.json();
  },

  async updateGift(id, gift) {
    const response = await fetch(`${API_BASE_URL}/api/gifts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gift),
    });
    if (!response.ok) throw new Error('Failed to update gift');
    return response.json();
  },

  async deleteGift(id) {
    const response = await fetch(`${API_BASE_URL}/api/gifts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete gift');
  },

  async getAllowedNames() {
    const response = await fetch(`${API_BASE_URL}/api/allowed-names`);
    if (!response.ok) throw new Error('Failed to fetch allowed names');
    return response.json();
  },

  async getYearlyStatistics() {
    const response = await fetch(`${API_BASE_URL}/api/statistics/yearly`);
    if (!response.ok) throw new Error('Failed to fetch yearly statistics');
    return response.json();
  },

  async getStatisticsByPerson() {
    const response = await fetch(`${API_BASE_URL}/api/statistics/by-person`);
    if (!response.ok) throw new Error('Failed to fetch statistics by person');
    return response.json();
  },
};

export const USE_API = import.meta.env.VITE_USE_API === 'true';
