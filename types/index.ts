export type ConfidenceLevel = 'immediate' | 'uncertain' | 'need_to_check'

export type Question = {
  id: number
  keyQuestion: string
  requirement: string
  theme: string
  question: string
}

export type InspectionResponse = {
  id: string
  inspection_id: string
  question_id: number
  question: string
  answer: string
  response_confidence: ConfidenceLevel
  created_at: string
}

export type Inspection = {
  id: string
  email: string
  company_name: string | null
  care_type: string | null
  service_users_count: number | null
  last_rating: string | null
  created_at: string
  readiness_score: number | null
  evidence_gaps: string[] | null
  status: 'in_progress' | 'completed' | 'abandoned'
}

export type InspectionWithResponses = Inspection & {
  inspection_responses: InspectionResponse[]
}
