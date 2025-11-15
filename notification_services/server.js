const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4001;

app.use(cors());
app.use(express.json());

app.post('/api/send-notification', (req, res) => {
  console.log('Received notification request:', req.body);
  
  const { userId, message, habitId } = req.body;
  
  res.json({
    status: 'success',
    message: 'Notification sent successfully',
    notification: {
      userId,
      habitId,
      message,
      timestamp: new Date().toISOString()
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Notification service is running' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'notification-service',
    timestamp: new Date().toISOString()
  });
});

// Health check для корневого пути
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    service: 'notification-service',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});