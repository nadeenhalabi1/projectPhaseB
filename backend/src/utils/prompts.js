/**
 * Build OpenAI extraction prompt for resume parsing
 * @param {string} resumeText - Raw text extracted from resume
 * @param {Array} criteria - Job criteria to evaluate against
 * @returns {string} Formatted prompt for OpenAI
 */
export const buildExtractionPrompt = (resumeText, criteria) => {
  const criteriaList = criteria
    .map(c => `- ${c.name}: ${c.description || c.name}`)
    .join('\n');

  return `You are a resume parsing assistant. Extract structured information from the resume below based on the specified evaluation criteria.

EVALUATION CRITERIA:
${criteriaList}

RESUME TEXT:
"""
${resumeText}
"""

INSTRUCTIONS:
1. Extract ONLY information relevant to the listed criteria
2. For each criterion, provide:
   - A numeric score (0-10) based on relevance/strength
   - A brief explanation for the score
   - Any specific evidence from the resume
3. Also extract basic candidate info (name, email, phone)

RESPOND WITH VALID JSON ONLY:
{
  "candidate": {
    "name": "string",
    "email": "string or null",
    "phone": "string or null"
  },
  "criteriaScores": [
    {
      "criterionName": "exact name from criteria list",
      "rawValue": 0-10,
      "explanation": "brief reason for score",
      "evidence": ["specific items from resume"]
    }
  ],
  "summary": "2-3 sentence overview of candidate"
}
  criterionName must match exactly.`;
};
