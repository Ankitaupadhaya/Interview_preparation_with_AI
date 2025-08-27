// server/index.js

// Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Use this for local development if you have a .env file
require('dotenv').config();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Set up Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Set up Nodemailer for email sending
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper function to format the chat history for the AI model
const formatChatHistory = (history, userText) => {
  let formattedHistory = history.map(item => ({
    role: item.role === 'user' ? 'user' : 'model',
    parts: [{ text: item.text }]
  }));

  // Add the current user message to the history
  formattedHistory.push({
    role: 'user',
    parts: [{ text: userText }]
  });

  return formattedHistory;
};

// --- API Endpoint to handle AI chat responses ---
app.post('/api/chat', async (req, res) => {
  const { chatHistory, userText } = req.body;

  try {
    const formattedHistory = formatChatHistory(chatHistory, userText);
    const result = await model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 200,
      },
    }).sendMessage(userText);
    const response = await result.response;
    const text = response.text();
    res.json({ message: text });
  } catch (error) {
    console.error('Error fetching AI response:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// --- API Endpoint to handle email sending ---
app.post('/api/email', async (req, res) => {
  const { to, history } = req.body;

  // Format the interview history into a readable string
  const formattedHistory = history.map(item => `${item.role === 'user' ? 'You' : 'AI'}: ${item.text}`).join('\n\n');
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: 'AI Interview Performance Summary',
    text: `Here is a summary of your recent interview:\n\n${formattedHistory}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending email');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});