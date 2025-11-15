const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'habit_tracker',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

app.get('/api/habits', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM habits ORDER BY created_at DESC');
    res.json({
      status: 'success',
      data: result.rows,
      message: 'Habits retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch habits'
    });
  }
});

app.post('/api/habits', async (req, res) => {
  try {
    const { title, description, frequency } = req.body;
    
    const result = await pool.query(
      'INSERT INTO habits (title, description, frequency) VALUES ($1, $2, $3) RETURNING *',
      [title, description, frequency]
    );
    
    res.json({
      status: 'success',
      data: result.rows[0],
      message: 'Habit created successfully'
    });
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create habit'
    });
  }
});

app.put('/api/habits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, title, description, frequency, category } = req.body;
    
    console.log('🔄 Обновление привычки:', id, req.body);
    
    let query = 'UPDATE habits SET ';
    let params = [];
    let setParts = [];
    
    if (completed !== undefined) {
      params.push(completed);
      setParts.push(`completed = $${params.length}`);
    }
    
    if (title !== undefined) {
      params.push(title);
      setParts.push(`title = $${params.length}`);
    }
    
    if (description !== undefined) {
      params.push(description);
      setParts.push(`description = $${params.length}`);
    }
    
    if (frequency !== undefined) {
      params.push(frequency);
      setParts.push(`frequency = $${params.length}`);
    }
    
    if (category !== undefined) {
      params.push(category);
      setParts.push(`category = $${params.length}`);
    }
    
    if (setParts.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No fields to update'
      });
    }
    
    params.push(id);
    query += setParts.join(', ') + ` WHERE id = $${params.length} RETURNING *`;
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Habit not found'
      });
    }
    
    console.log('✅ Привычка обновлена:', result.rows[0]);
    
    res.json({
      status: 'success',
      data: result.rows[0],
      message: 'Habit updated successfully'
    });
  } catch (error) {
    console.error('❌ Ошибка при обновлении привычки:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update habit',
      error: error.message
    });
  }
});

app.delete('/api/habits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Удаление привычки:', id);
    
    const result = await pool.query('DELETE FROM habits WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Habit not found'
      });
    }
    
    console.log('✅ Привычка удалена:', result.rows[0]);
    
    res.json({
      status: 'success',
      data: result.rows[0],
      message: 'Habit deleted successfully'
    });
  } catch (error) {
    console.error('❌ Ошибка при удалении привычки:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete habit',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Проверка подключения к БД
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'healthy',
      service: 'habit-data-service',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      service: 'habit-data-service',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});


app.listen(PORT, () => {
  console.log(`Habit Data Service running on port ${PORT}`);
});