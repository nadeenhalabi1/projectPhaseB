class KNNService {
  /**
   * Rank all candidates for a job using weighted KNN
   * @param {Array} candidates - Array of candidate documents
   * @param {Array} criteria - Job criteria with weights
   * @returns {Array} Ranked candidates with scores
   */
  rankCandidates(candidates, criteria) {
    // Ideal vector: all scores at maximum (1.0)
    const idealVector = criteria.map(() => 1.0);

    const ranked = candidates.map(candidate => {
      // Create feature vector from extracted data
      const vector = criteria.map(criterion => {
        const scoreData = candidate.extractedData?.criteriaScores?.find(
          s => s.criterionName === criterion.name
        );

        return {
          criterionId: criterion._id,
          criterionName: criterion.name,
          rawValue: scoreData?.rawValue || 0,
          normalizedValue: (scoreData?.rawValue || 0) / 10,  // 0-10 → 0-1
          weight: criterion.weight / 100,                  // Percentage → decimal
          explanation: scoreData?.explanation || 'No data found'
        };
      });

      // Calculate weighted Euclidean distance
      let sumSquared = 0;
      for (let i = 0; i < vector.length; i++) {
        const diff = vector[i].normalizedValue - idealVector[i];
        const weight = vector[i].weight;
        sumSquared += weight * Math.pow(diff, 2);
      }
      const distance = Math.sqrt(sumSquared);

      // Convert distance to similarity score (0-100)
      const overallScore = Math.round((1 - distance) * 100 * 100) / 100;

      // Calculate weighted contribution of each criterion
      const scores = vector.map(v => ({
        ...v,
        weightedValue: v.normalizedValue * v.weight * 100
      }));

      return {
        candidateId: candidate._id,
        overallScore,
        scores,
        distance
      };
    });

    // Sort by score descending
    ranked.sort((a, b) => b.overallScore - a.overallScore);

    // Assign ranks
    ranked.forEach((c, index) => {
      c.rank = index + 1;
    });

    return ranked;
  }

}

export default new KNNService();
