import type { Question } from '@/types'

export const questions: Question[] = [
  {
    id: 1,
    keyQuestion: 'Safe',
    requirement: 'Regulation 12',
    theme: 'Medication management',
    question:
      'Walk me through your current medication process, and show me where I would find the latest MAR chart and any medication error log from the last 3 months.',
  },
  {
    id: 2,
    keyQuestion: 'Safe',
    requirement: 'Regulation 13',
    theme: 'Safeguarding',
    question:
      'Tell me about your most recent safeguarding concern. How quickly did staff escalate it, and where is your response timeline recorded?',
  },
  {
    id: 3,
    keyQuestion: 'Safe',
    requirement: 'Regulation 19',
    theme: 'Safer recruitment',
    question:
      'For your latest staff recruit, how would you evidence safer recruitment checks: DBS, right to work, and references before start date?',
  },
  {
    id: 4,
    keyQuestion: 'Effective',
    requirement: 'Regulation 18',
    theme: 'Staff supervision',
    question:
      'How often are supervisions completed, and can you identify who is currently overdue and what action has been taken?',
  },
  {
    id: 5,
    keyQuestion: 'Effective',
    requirement: 'Regulation 9',
    theme: 'Person-centred care planning',
    question:
      'Pick one person you support. When was their care plan last reviewed, and how would you evidence that changes in need were reflected promptly?',
  },
  {
    id: 6,
    keyQuestion: 'Caring',
    requirement: 'Regulation 10',
    theme: 'Dignity and respect',
    question:
      'How do you evidence that people are treated with dignity and involved in decisions? Please reference one recent documented example.',
  },
  {
    id: 7,
    keyQuestion: 'Responsive',
    requirement: 'Regulation 16',
    theme: 'Complaints handling',
    question:
      'Show me your complaints log for this quarter. How quickly were complaints acknowledged, investigated, and closed with feedback to the person?',
  },
  {
    id: 8,
    keyQuestion: 'Well-led',
    requirement: 'Regulation 17',
    theme: 'Governance and oversight',
    question:
      'What are your two weakest inspection-readiness areas today, and how would you provide evidence for each within 5 minutes?',
  },
  {
    id: 9,
    keyQuestion: 'Well-led',
    requirement: 'Regulation 17',
    theme: 'Quality assurance',
    question:
      'How do you audit your own service quality? When was your last internal audit or mock inspection, and where are those results?',
  },
]
