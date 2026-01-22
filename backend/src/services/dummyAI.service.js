/**
 * Dummy AI Service
 * Generates realistic dummy candidate scores for testing without OpenAI API
 */
class DummyAIService {
  /**
   * Generate dummy resume data that mimics OpenAI extraction
   * Scores are random but realistic based on criterion dataType
   * @param {string} resumeText - Parsed resume text
   * @param {Array} criteria - Job evaluation criteria
   * @returns {Promise<Object>} Extracted candidate data with scores
   */
  async extractResumeData(resumeText, criteria) {
    // Extract basic info from resume text (simple regex parsing)
    const candidate = this.extractBasicInfo(resumeText);

    // Generate scores for each criterion based on its dataType
    const criteriaScores = criteria.map((criterion) => {
      const score = this.generateScoreForCriterion(criterion);
      return {
        criterionId: criterion._id.toString(),
        criterionName: criterion.name,
        ...score,
      };
    });
    
    return {
      candidate,
      criteriaScores,
    };
  }

  /**
   * Extract basic candidate information from resume text
   * @param {string} resumeText - Raw resume text
   * @returns {Object} Candidate info (name, email, phone)
   */
  extractBasicInfo(resumeText) {
    // Extract email using regex
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
    const email = resumeText.match(emailRegex)?.[0] || 'candidate@example.com';

    // Extract phone number using regex
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const phone = resumeText.match(phoneRegex)?.[0] || null;

    // Name is usually first line or first capitalized words
    const lines = resumeText.split('\n').filter((l) => l.trim());
    const name = lines[0]?.trim() || 'Unknown Candidate';

    return { name, email, phone };
  }

  /**
   * Generate score for a single criterion based on its dataType
   * @param {Object} criterion - Criterion with dataType, minValue, maxValue
   * @returns {Object} Score with rawValue and explanation
   */
  generateScoreForCriterion(criterion) {
    const { dataType, minValue, maxValue } = criterion;

    switch (dataType) {
      case 'SCALE': {
        // Random score between minValue and maxValue (usually 0-10)
        const min = minValue || 0;
        const max = maxValue || 10;
        const rawValue = Math.random() * (max - min) + min;
        const roundedValue = Math.round(rawValue * 10) / 10; // 1 decimal

        return {
          rawValue: roundedValue,
          explanation: this.generateExplanation(
            criterion.name,
            roundedValue,
            max
          ),
        };
      }

      case 'BOOLEAN': {
        // Random yes (1) or no (0)
        const rawValue = Math.random() > 0.5 ? 1 : 0;
        return {
          rawValue,
          explanation: `Candidate ${
            rawValue ? 'meets' : 'does not meet'
          } the ${criterion.name} requirement.`,
        };
      }

      case 'YEARS': {
        // Random years between minValue and maxValue
        const min = minValue || 0;
        const max = maxValue || 20;
        const rawValue = Math.floor(Math.random() * (max - min + 1)) + min;

        return {
          rawValue,
          explanation: `Candidate has approximately ${rawValue} years of ${criterion.name.toLowerCase()}.`,
        };
      }

      case 'LEVEL': {
        // Random level: Beginner (3), Intermediate (6), Expert (9)
        const levels = [
          { value: 3, label: 'Beginner' },
          { value: 6, label: 'Intermediate' },
          { value: 9, label: 'Expert' },
        ];
        const level = levels[Math.floor(Math.random() * levels.length)];

        return {
          rawValue: level.value,
          explanation: `Candidate demonstrates ${level.label.toLowerCase()} level proficiency in ${
            criterion.name
          }.`,
        };
      }

      case 'TEXT_MATCH': {
        // Random score 0-10 for text matching
        const rawValue = Math.random() * 10;
        const roundedValue = Math.round(rawValue * 10) / 10; // 1 decimal

        return {
          rawValue: roundedValue,
          explanation: this.generateExplanation(
            criterion.name,
            roundedValue,
            10
          ),
        };
      }

      default: {
        // Fallback to SCALE behavior
        const rawValue = Math.random() * 10;
        return {
          rawValue: Math.round(rawValue * 10) / 10,
          explanation: `Evaluated ${criterion.name} based on resume content.`,
        };
      }
    }
  }

  /**
   * Generate explanation text based on score percentage
   * @param {string} criterionName - Name of the criterion
   * @param {number} score - Actual score value
   * @param {number} maxScore - Maximum possible score
   * @returns {string} Human-readable explanation
   */
  generateExplanation(criterionName, score, maxScore) {
    const percentage = (score / maxScore) * 100;

    if (percentage >= 80) {
      return `Candidate shows strong evidence of ${criterionName.toLowerCase()} with excellent qualifications.`;
    } else if (percentage >= 60) {
      return `Candidate demonstrates good ${criterionName.toLowerCase()} with relevant experience.`;
    } else if (percentage >= 40) {
      return `Candidate has moderate ${criterionName.toLowerCase()} but may need development.`;
    } else {
      return `Limited evidence of ${criterionName.toLowerCase()} in the resume.`;
    }
  }
}

export default new DummyAIService();
