import type { ConfidenceLevel } from '@/types'

export const CONFIDENCE_WEIGHTS: Record<ConfidenceLevel, number> = {
  immediate: 1.0,
  uncertain: 0.5,
  need_to_check: 0.0,
}

export function calculateScore(
  responses: Array<{ response_confidence: ConfidenceLevel }>
): number {
  if (responses.length === 0) return 0
  const total = responses.reduce(
    (sum, r) => sum + CONFIDENCE_WEIGHTS[r.response_confidence],
    0
  )
  return Math.round((total / responses.length) * 100)
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return 'Strong Readiness'
  if (score >= 70) return 'Good Foundation'
  if (score >= 50) return 'Moderate Gaps'
  return 'Significant Preparation Needed'
}

export function getScoreColor(score: number): string {
  if (score >= 85) return '#007F3B'
  if (score >= 70) return '#005EB8'
  if (score >= 50) return '#d97706'
  return '#dc2626'
}

export function getScoreDescription(score: number): string {
  if (score >= 85)
    return 'Your service demonstrates strong inspection readiness. Evidence is readily accessible and well-organised.'
  if (score >= 70)
    return 'A good foundation is in place. Some evidence retrieval gaps to address before inspection.'
  if (score >= 50)
    return 'Core practices are in place but significant preparation is needed to ensure evidence is quickly accessible.'
  return 'Considerable preparation recommended. Focus on making evidence retrievable within minutes, not hours.'
}

export function getStrengths(
  responses: Array<{ response_confidence: ConfidenceLevel; question_id: number }>,
  questions: Array<{ id: number; theme: string }>
): string[] {
  return responses
    .filter((r) => r.response_confidence === 'immediate')
    .map((r) => questions.find((q) => q.id === r.question_id)?.theme ?? '')
    .filter(Boolean)
    .slice(0, 3)
}

export function getGaps(
  responses: Array<{ response_confidence: ConfidenceLevel; question_id: number }>,
  questions: Array<{ id: number; theme: string }>
): string[] {
  return responses
    .filter(
      (r) =>
        r.response_confidence === 'need_to_check' ||
        r.response_confidence === 'uncertain'
    )
    .sort((a, b) => {
      const order = { need_to_check: 0, uncertain: 1, immediate: 2 }
      return order[a.response_confidence] - order[b.response_confidence]
    })
    .map((r) => questions.find((q) => q.id === r.question_id)?.theme ?? '')
    .filter(Boolean)
    .slice(0, 3)
}
