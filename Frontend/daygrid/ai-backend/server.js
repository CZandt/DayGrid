require('dotenv').config();
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/api/insights', async (req, res) => {
    const { prompt } = req.body;
  
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a productivity coach providing personalized recommendations delivered in a short and sweet format, appealing to their human emotions' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 200,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        res.json({ insights: data.choices[0].message.content.trim() });
      } else {
        console.error('OpenAI API Error:', data);
        res.status(response.status).json({ error: data });
      }
    } catch (error) {
      console.error('Network Error:', error);
      res.status(500).json({ error: 'Network error occurred.', details: error.message });
    }
  });
  

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
