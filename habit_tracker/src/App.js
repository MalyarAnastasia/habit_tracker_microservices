import React, { useState, useEffect } from 'react';
import './App.css';
import { habitAPI, notificationAPI } from './services/api';

function App() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState({ 
    title: '', 
    description: '', 
    frequency: 'daily',
    category: 'personal'
  });
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHabits();
  }, []);

  const getCurrentDate = () => {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString('ru-RU', options);
  };

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const result = await habitAPI.getHabits();
      if (result.status === 'success') {
        setHabits(result.data);
      }
    } catch (error) {
      console.error('Error fetching habits:', error);
      setNotification('Ошибка при загрузке привычек');
      setTimeout(() => setNotification(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const createHabit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await habitAPI.createHabit(newHabit);
      
      if (result.status === 'success') {
        setHabits([result.data, ...habits]);
        setNewHabit({ 
          title: '', 
          description: '', 
          frequency: 'daily',
          category: 'personal'
        });
        
        await sendNotification(`Новая привычка создана: ${result.data.title}`);
        setNotification('Привычка успешно создана! 🎉');
      }
    } catch (error) {
      console.error('Error creating habit:', error);
      setNotification('Ошибка при создании привычки');
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const sendNotification = async (message) => {
    try {
      await notificationAPI.sendNotification({
        userId: 1,
        message: message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleReminder = async (habit) => {
    await sendNotification(`Напоминание: ${habit.title}`);
    setNotification(`Напоминание отправлено: ${habit.title} 🔔`);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleComplete = async (habit) => {
    try {
      setLoading(true);
      const result = await habitAPI.updateHabit(habit.id, { completed: true });
      
      if (result.status === 'success') {
        const updatedHabits = habits.map(h => 
          h.id === habit.id ? { ...h, completed: true } : h
        );
        setHabits(updatedHabits);
        
        setNotification(`Привычка "${habit.title}" выполнена! ✅`);
        await sendNotification(`Привычка выполнена: ${habit.title}`);
      }
    } catch (error) {
      console.error('Error completing habit:', error);
      setNotification('Ошибка при отметке выполнения');
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleDelete = async (habitId) => {
    try {
      setLoading(true);
      const result = await habitAPI.deleteHabit(habitId);
      
      if (result.status === 'success') {
        setHabits(habits.filter(habit => habit.id !== habitId));
        setNotification('Привычка удалена 🗑️');
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
      setNotification('Ошибка при удалении привычки');
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleReactivate = async (habit) => {
    try {
      setLoading(true);
      const result = await habitAPI.updateHabit(habit.id, { completed: false });
      
      if (result.status === 'success') {
        const updatedHabits = habits.map(h => 
          h.id === habit.id ? { ...h, completed: false } : h
        );
        setHabits(updatedHabits);
        
        setNotification(`Привычка "${habit.title}" reactivated! 🔄`);
      }
    } catch (error) {
      console.error('Error reactivating habit:', error);
      setNotification('Ошибка при реактивации привычки');
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const runningHabits = habits.filter(habit => !habit.completed);
  const completedHabits = habits.filter(habit => habit.completed);

  const getFrequencyIcon = (frequency) => {
    switch (frequency) {
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'monthly': return '🗓️';
      default: return '⏰';
    }
  };

  const getFrequencyText = (frequency) => {
    switch (frequency) {
      case 'daily': return 'Ежедневно';
      case 'weekly': return 'Еженедельно';
      case 'monthly': return 'Ежемесячно';
      default: return frequency;
    }
  };

  const getCategoryDisplayName = (category) => {
    switch (category) {
      case 'personal': return 'Личная задача';
      case 'work': return 'Рабочая задача';
      case 'health': return 'Здоровье';
      case 'learning': return 'Обучение';
      default: return category;
    }
  };

  return (
    <div className="App">
      {/* Хедер */}
      <header className="App-header">
        <div className="header-content">
          <div className="header-left">
            <h1>My Habits</h1>
            <div className="date">{getCurrentDate()}</div>
          </div>
          <div className="header-right">
            {notification && (
              <div className="notification">
                {notification}
                <button 
                  onClick={() => setNotification('')} 
                  className="close-btn"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="main-content">
        <div className="content-header">
          <h2>Трекер Привычек</h2>
        </div>

        <div className="columns-grid">
          {/* Левая колонка - форма */}
          <div className="left-column">
            <div className="habit-form">
              <h3>➕ Новая Привычка</h3>
              <form onSubmit={createHabit}>
                <div className="form-group">
                  <label>Название привычки *</label>
                  <input
                    type="text"
                    placeholder="Например: Утренняя зарядка"
                    value={newHabit.title}
                    onChange={(e) => setNewHabit({...newHabit, title: e.target.value})}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Описание</label>
                  <textarea
                    placeholder="Описание вашей привычки..."
                    value={newHabit.description}
                    onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Категория</label>
                  <select
                    value={newHabit.category}
                    onChange={(e) => setNewHabit({...newHabit, category: e.target.value})}
                    disabled={loading}
                  >
                    <option value="personal">👤 Личная</option>
                    <option value="work">💼 Работа</option>
                    <option value="health">❤️ Здоровье</option>
                    <option value="learning">📚 Обучение</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Повторение</label>
                  <select
                    value={newHabit.frequency}
                    onChange={(e) => setNewHabit({...newHabit, frequency: e.target.value})}
                    disabled={loading}
                  >
                    <option value="daily">📅 Ежедневно</option>
                    <option value="weekly">📆 Еженедельно</option>
                    <option value="monthly">🗓️ Ежемесячно</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading || !newHabit.title.trim()}
                >
                  {loading ? 'Создание...' : 'Создать Привычку'}
                </button>
              </form>
            </div>
          </div>

          {/* Правая колонка - список привычек */}
          <div className="right-column">
            {/* Активные привычки */}
            <section className="status-section status-running">
              <h3>Активные ({runningHabits.length})</h3>
              <div className="habits-grid">
                {loading ? (
                  <div className="loading">Загрузка...</div>
                ) : runningHabits.length === 0 ? (
                  <div className="empty-state">
                    <p>Нет активных привычек</p>
                    <small>Создайте свою первую привычку!</small>
                  </div>
                ) : (
                  runningHabits.map(habit => (
                    <div key={habit.id} className="habit-card running">
                      <div className="habit-header">
                        <div>
                          <div className="habit-title">{habit.title}</div>
                          <span className="habit-category">
                            {getCategoryDisplayName(habit.category)}
                          </span>
                        </div>
                      </div>
                      
                      {habit.description && (
                        <div className="habit-description">
                          {habit.description}
                        </div>
                      )}
                      
                      <div className="habit-meta">
                        <div className="habit-frequency">
                          <span className={`frequency-icon frequency-${habit.frequency}`}>
                            {getFrequencyIcon(habit.frequency)}
                          </span>
                          {getFrequencyText(habit.frequency)}
                        </div>
                        <div className="habit-actions">
                          <button 
                            onClick={() => handleReminder(habit)}
                            className="action-btn reminder-btn"
                            disabled={loading}
                          >
                            Напомнить
                          </button>
                          <button 
                            onClick={() => handleComplete(habit)}
                            className="action-btn complete-btn"
                            disabled={loading}
                          >
                            Выполнено
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Выполненные привычки */}
            <section className="status-section status-completed">
              <h3>Выполненные ({completedHabits.length})</h3>
              <div className="habits-grid">
                {completedHabits.length === 0 ? (
                  <div className="empty-state">
                    <p>Нет выполненных привычек</p>
                    <small>Выполненные привычки появятся здесь</small>
                  </div>
                ) : (
                  completedHabits.map(habit => (
                    <div key={habit.id} className="habit-card completed">
                      <div className="habit-header">
                        <div>
                          <div className="habit-title">{habit.title}</div>
                          <span className="habit-category">
                            {getCategoryDisplayName(habit.category)}
                          </span>
                        </div>
                        <div className="habit-actions">
                          <button 
                            onClick={() => handleReactivate(habit)}
                            className="action-btn reminder-btn"
                            disabled={loading}
                          >
                            Возобновить
                          </button>
                          <button 
                            onClick={() => handleDelete(habit.id)}
                            className="action-btn delete-btn"
                            disabled={loading}
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                      
                      {habit.description && (
                        <div className="habit-description">
                          {habit.description}
                        </div>
                      )}
                      
                      <div className="habit-meta">
                        <div className="habit-frequency">
                          <span className={`frequency-icon frequency-${habit.frequency}`}>
                            {getFrequencyIcon(habit.frequency)}
                          </span>
                          {getFrequencyText(habit.frequency)}
                        </div>
                        <div className="completed-badge">
                          ✅ Выполнено
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;