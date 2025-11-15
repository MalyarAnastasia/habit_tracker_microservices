const HABIT_API_BASE = 'http://localhost:5000/api';
const NOTIFICATION_API_BASE = 'http://localhost:5001/api';

export const habitAPI = {
  async getHabits() {
    const response = await fetch(`${HABIT_API_BASE}/habits`);
    return await response.json();
  },

  async createHabit(habitData) {
    const response = await fetch(`${HABIT_API_BASE}/habits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(habitData),
    });
    return await response.json();
  },

  async updateHabit(id, habitData) {
    const response = await fetch(`${HABIT_API_BASE}/habits/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(habitData),
    });
    return await response.json();
  },

  async deleteHabit(id) {
    const response = await fetch(`${HABIT_API_BASE}/habits/${id}`, {
      method: 'DELETE',
    });
    return await response.json();
  }
};
export const notificationAPI = {
  async sendNotification(notificationData) {
    const response = await fetch(`${NOTIFICATION_API_BASE}/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });
    return await response.json();
  }
};