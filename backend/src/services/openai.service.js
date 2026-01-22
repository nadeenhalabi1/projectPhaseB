import OpenAI from 'openai';
import { buildExtractionPrompt } from '../utils/prompts.js';
import dummyAIService from './dummyAI.service.js';

class OpenAIService {
  constructor() {
    this.client = null;
  }

  /**
   * Get or initialize OpenAI client (lazy loading)
   */
  getClient() {
    if (!this.client) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in .env file.');
      }
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    return this.client;
  }

  /**
   * Extract structured data from resume text using OpenAI
   * @param {string} resumeText - Raw text from resume
   * @param {Array} criteria - Job criteria to evaluate against
   * @returns {Promise<Object>} Extracted candidate data
   */
  async extractResumeData(resumeText, criteria) {
    // Check if dummy mode is enabled (for testing without OpenAI costs)
    // Check dynamically so changes to .env take effect without restart
    if (process.env.USE_DUMMY_AI === 'true') {
      console.log('🤖 Using DUMMY AI mode for testing');
      return dummyAIService.extractResumeData(resumeText, criteria);
    }

    console.log('🧠 Using OpenAI API');

    try {
      const prompt = buildExtractionPrompt(resumeText, criteria);
      const client = this.getClient(); // Lazy load client

      const response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a resume parsing assistant. Extract structured information and respond ONLY with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent extraction
        response_format: { type: 'json_object' }, // Force JSON response
      });

      const content = response.choices[0].message.content;
      const extractedData = JSON.parse(content);

      // Validate response structure
      if (!extractedData.candidate || !extractedData.criteriaScores) {
        throw new Error('Invalid response structure from OpenAI');
      }

      return extractedData;
    } catch (error) {
      console.error('OpenAI extraction error:', error);

      if (error.message.includes('Invalid response structure')) {
        throw error;
      }

      throw new Error(`Failed to extract resume data: ${error.message}`);
    }
  }

  /**
   * Test OpenAI connection
   * @returns {Promise<boolean>} True if connection successful
   */
  async testConnection() {
    try {
      const client = this.getClient();
      await client.models.list();
      return true;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }
}

export default new OpenAIService();
