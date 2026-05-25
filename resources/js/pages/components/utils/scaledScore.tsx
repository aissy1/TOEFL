export function scaledScore(score: number, maxScore: number): number {
    if (maxScore <= 0) return 31;

    // formula scale score 31 + (raw/max-score × (68 - 31))
    return Math.round(31 + (score / maxScore) * 37);
}
