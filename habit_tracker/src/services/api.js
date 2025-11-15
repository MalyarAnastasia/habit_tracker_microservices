const API_BASE = '';

export const habitAPI = {
  async getHabits() {
    const response = await fetch(`${API_BASE}/api/habits/habits`);
    return await response.json();
  },

  async createHabit(habitData) {
    const response = await fetch(`${API_BASE}/api/habits/habits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(habitData),
    });
    return await response.json();
  },

  async updateHabit(id, habitData) {
    const response = await fetch(`${API_BASE}/api/habits/habits/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(habitData),
    });
    return await response.json();
  },

  async deleteHabit(id) {
    const response = await fetch(`${API_BASE}/api/habits/habits/${id}`, {
      method: 'DELETE',
    });
    return await response.json();
  }
};

export const notificationAPI = {
  async sendNotification(notificationData) {
    const response = await fetch(`${API_BASE}/api/notifications/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });
    return await response.json();
  }
};