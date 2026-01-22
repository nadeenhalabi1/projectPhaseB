import { createRequire } from 'module';
import mammoth from 'mammoth';
import fs from 'fs/promises';
import path from 'path';

// pdf-parse is CommonJS, use require
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

class ParserService {
  /**
   * Parse resume file and extract text
   * @param {Object} file - Multer file object
   * @returns {Promise<string>} Extracted text
   */
  async parseResume(file) {
    const extension = path.extname(file.originalname).toLowerCase();

    try {
      switch (extension) {
        case '.pdf':
          return await this.parsePDF(file.path);

        case '.docx':
        case '.doc':
          return await this.parseDOCX(file.path);

        case '.txt':
          return await this.parseTXT(file.path);

        default:
          throw new Error(`Unsupported file type: ${extension}`);
      }
    } catch (error) {
      console.error('Parser error:', error);
      throw new Error(`Failed to parse ${extension} file: ${error.message}`);
    }
  }

  /**
   * Parse PDF file
   * @param {string} filePath - Path to PDF file
   * @returns {Promise<string>} Extracted text
   */
  async parsePDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);

      if (!data.text || data.text.trim().length === 0) {
        throw new Error('PDF appears to be empty or text could not be extracted');
      }

      return data.text;
    } catch (error) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }

  /**
   * Parse DOCX file
   * @param {string} filePath - Path to DOCX file
   * @returns {Promise<string>} Extracted text
   */
  async parseDOCX(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });

      if (!result.value || result.value.trim().length === 0) {
        throw new Error('DOCX appears to be empty or text could not be extracted');
      }

      // Log warnings if any
      if (result.messages.length > 0) {
        console.warn('DOCX parsing warnings:', result.messages);
      }

      return result.value;
    } catch (error) {
      throw new Error(`DOCX parsing failed: ${error.message}`);
    }
  }

  /**
   * Parse TXT file
   * @param {string} filePath - Path to TXT file
   * @returns {Promise<string>} Extracted text
   */
  async parseTXT(filePath) {
    try {
      const text = await fs.readFile(filePath, 'utf-8');

      if (!text || text.trim().length === 0) {
        throw new Error('TXT file is empty');
      }

      return text;
    } catch (error) {
      throw new Error(`TXT parsing failed: ${error.message}`);
    }
  }

  /**
   * Delete uploaded file
   * @param {string} filePath - Path to file
   */
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Don't throw - file deletion is not critical
    }
  }
}

export default new ParserService();
