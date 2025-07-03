// backend/routes/predict.js
import express from 'express';
import axios from 'axios';
const router = express.Router();

// POST /api/predict-task-duration
router.post('/predict-task-duration', async (req, res) => {
  const { weather, taskType } = req.body;
  try {
    // Call the Python ML service (assumed running on localhost:5000)
    console.log('Prediction request to Python service:', { weather, task_type: taskType });
    const response = await axios.post('http://localhost:5000/predict', {
      weather,
      task_type: taskType
    });
    res.json({ predictedTime: response.data.predicted_time });
  } catch (err) {
    console.error('Prediction service error:', err.message);
    if (err.response && err.response.data) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ error: 'Prediction service error' });
    }
  }
});

export default router;
