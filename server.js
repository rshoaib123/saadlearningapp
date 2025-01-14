import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI client
const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.OPENAI_API_KEY,
});

// Test endpoint
app.get('/api/status', (req, res) => {
  res.json({ message: 'API is running' });
});

// Handle messages with OpenAI API
app.post('/api/message', async (req, res) => {
  try {
    const { correctAnswer, studentAnswer } = req.body;

    if (!correctAnswer || !studentAnswer) {
      return res.status(400).json({ error: 'Both correctAnswer and studentAnswer are required' });
    }

    // Construct a prompt for the ChatGPT API
    const prompt = `
      I have the following correct answer for a question:

      Correct Answer: 
      ${correctAnswer}

      The student has provided the following answer:

      Student Answer:
      ${studentAnswer}

      Please analyze the following:
      1. Does the student answer cover all the main points of the correct answer?
      2. Does the student’s answer capture the essence of all the key points from the correct answer?
      3. How close is the language of the student's answer to the language of the correct answer?
      4. Is the language too casual or inappropriate for an academic setting? Please provide feedback on any informal language.

      Provide your analysis in a structured format with:
      - A percentage match (how similar the student's answer is to the correct answer).
      - Any missing points in the student’s answer.
      - Comments on the formality and language appropriateness of the student’s answer.
    `;

    

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await client.chat.completions.create({
         messages: [
          { role: "system", content: "You are an assistant that helps evaluate and compare student answers to a given correct answer. You assess the coverage of key points, language formality, and overall similarity." },
          { role: "user", content: prompt },
        ],
        model: "gpt-4o",
        temperature: 1,
        max_tokens: 4096,
        top_p: 1
      });
    
    res.json({ response: response.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
