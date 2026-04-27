'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { questions } from '@/lib/questions'
import { calculateScore } from '@/lib/scoring'
import type { ConfidenceLevel, Question } from '@/types'

type Step = 'email' | 'context' | 'question' | 'submitting'

type ResponseData = {
  answer: string
  confidence: ConfidenceLevel
}

const CARE_TYPES = [
  'Residential care home',
  'Nursing home',
  'Domiciliary care',
  'Supported living',
  'Extra care housing',
  'Day services',
  'Other',
]

const CQC_RATINGS = [
  'Outstanding',
  'Good',
  'Requires Improvement',
  'Inadequate',
  'Not yet rated',
]

const CONFIDENCE_OPTIONS = [
  {
    value: 'immediate' as ConfidenceLevel,
    label: 'I can show you right now',
    description: 'Evidence is readily accessible — I know exactly where it is',
    defaultClass:
      'border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-700',
    selectedClass: 'border-green-500 bg-green-50 text-green-900',
    indicator: 'bg-green-500',
  },
  {
    value: 'uncertain' as ConfidenceLevel,
    label: 'I think I know, let me check',
    description: 'Evidence exists but would take a few minutes to locate',
    defaultClass:
      'border-gray-200 hover:border-amber-400 hover:bg-amber-50 text-gray-700',
    selectedClass: 'border-amber-500 bg-amber-50 text-amber-900',
    indicator: 'bg-amber-400',
  },
  {
    value: 'need_to_check' as ConfidenceLevel,
    label: "I'd need to find that",
    description: 'Evidence may exist but retrieval would take significant time',
    defaultClass:
      'border-gray-200 hover:border-red-400 hover:bg-red-50 text-gray-700',
    selectedClass: 'border-red-500 bg-red-50 text-red-900',
    indicator: 'bg-red-500',
  },
]

export default function InspectPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('email')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [inspectionId, setInspectionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')

  // Step 2
  const [careType, setCareType] = useState('')
  const [serviceUsersCount, setServiceUsersCount] = useState('')
  const [lastRating, setLastRating] = useState('')

  // Step 3+: array holds responses indexed by question index
  const [responses, setResponses] = useState<(ResponseData | null)[]>(
    Array(questions.length).fill(null)
  )
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [currentConfidence, setCurrentConfidence] = useState<ConfidenceLevel | null>(null)

  const totalSteps = 2 + questions.length
  const currentStepNum =
    step === 'email'
      ? 1
      : step === 'context'
      ? 2
      : 2 + questionIndex + 1
  const progressPct = Math.round((currentStepNum / totalSteps) * 100)

  const currentQuestion: Question = questions[questionIndex]
  const isLastQuestion = questionIndex === questions.length - 1

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setError(null)
    setIsLoading(true)
    try {
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), company_name: companyName.trim() || null }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setInspectionId(data.id)
      setStep('context')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleContextSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!careType || !lastRating) {
      setError('Please select your care type and most recent CQC rating.')
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      await fetch(`/api/inspections/${inspectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          care_type: careType,
          service_users_count: serviceUsersCount ? parseInt(serviceUsersCount, 10) : null,
          last_rating: lastRating,
        }),
      })
      setStep('question')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleQuestionNext() {
    if (!currentAnswer.trim()) {
      setError('Please provide a response before continuing.')
      return
    }
    if (!currentConfidence) {
      setError('Please select your confidence level.')
      return
    }
    setError(null)
    setIsLoading(true)

    const responseData: ResponseData = { answer: currentAnswer.trim(), confidence: currentConfidence }
    const newResponses = [...responses]
    newResponses[questionIndex] = responseData
    setResponses(newResponses)

    try {
      await fetch(`/api/inspections/${inspectionId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: currentQuestion.id,
          question: currentQuestion.question,
          answer: responseData.answer,
          response_confidence: responseData.confidence,
        }),
      })

      if (!isLastQuestion) {
        const nextIdx = questionIndex + 1
        const existing = newResponses[nextIdx]
        setCurrentAnswer(existing?.answer ?? '')
        setCurrentConfidence(existing?.confidence ?? null)
        setQuestionIndex(nextIdx)
      } else {
        setStep('submitting')
        const completedResponses = newResponses.filter(Boolean) as ResponseData[]
        const score = calculateScore(
          completedResponses.map((r) => ({ response_confidence: r.confidence }))
        )
        const gaps = newResponses
          .map((r, i) => ({ r, q: questions[i] }))
          .filter(({ r }) => r?.confidence === 'need_to_check' || r?.confidence === 'uncertain')
          .map(({ q }) => q.theme)

        await fetch(`/api/inspections/${inspectionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ readiness_score: score, evidence_gaps: gaps, status: 'completed' }),
        })

        router.push(`/results/${inspectionId}`)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setStep('question')
    } finally {
      setIsLoading(false)
    }
  }

  function handleQuestionBack() {
    setError(null)
    if (questionIndex > 0) {
      const prevIdx = questionIndex - 1
      const existing = responses[prevIdx]
      setCurrentAnswer(existing?.answer ?? '')
      setCurrentConfidence(existing?.confidence ?? null)
      setQuestionIndex(prevIdx)
    } else {
      setStep('context')
    }
  }

  // Render
  if (step === 'submitting') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-nhs-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Analysing your responses&hellip;</p>
          <p className="text-sm text-gray-400 mt-1">Calculating your readiness score</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            CQC Readiness
          </a>
          <span className="text-xs text-gray-400">
            Step {currentStepNum} of {totalSteps}
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-200">
        <div
          className="h-full bg-nhs-blue transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            <svg className="flex-none w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {step === 'email' && (
          <EmailStep
            email={email}
            companyName={companyName}
            onEmailChange={setEmail}
            onCompanyNameChange={setCompanyName}
            onSubmit={handleEmailSubmit}
            isLoading={isLoading}
          />
        )}

        {step === 'context' && (
          <ContextStep
            careType={careType}
            serviceUsersCount={serviceUsersCount}
            lastRating={lastRating}
            onCareTypeChange={setCareType}
            onServiceUsersCountChange={setServiceUsersCount}
            onLastRatingChange={setLastRating}
            onSubmit={handleContextSubmit}
            isLoading={isLoading}
          />
        )}

        {step === 'question' && currentQuestion && (
          <QuestionStep
            question={currentQuestion}
            questionIndex={questionIndex}
            totalQuestions={questions.length}
            answer={currentAnswer}
            confidence={currentConfidence}
            onAnswerChange={setCurrentAnswer}
            onConfidenceChange={setCurrentConfidence}
            onNext={handleQuestionNext}
            onBack={handleQuestionBack}
            isLoading={isLoading}
            isLast={isLastQuestion}
          />
        )}
      </main>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EmailStep({
  email, companyName, onEmailChange, onCompanyNameChange, onSubmit, isLoading,
}: {
  email: string; companyName: string
  onEmailChange: (v: string) => void; onCompanyNameChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void; isLoading: boolean
}) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Let&rsquo;s start with your details
        </h1>
        <p className="text-gray-500">
          We&rsquo;ll use your email to send a copy of your readiness report.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Work email <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="manager@careprovider.co.uk"
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Organisation name <span className="text-gray-400 text-xs font-normal">(optional)</span>
          </label>
          <input
            id="company-name"
            type="text"
            autoComplete="organization"
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.target.value)}
            placeholder="Your care organisation"
            className="form-input"
          />
        </div>

        <button
          type="submit"
          disabled={!email.trim() || isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Starting&hellip;
            </span>
          ) : (
            <>
              Start Mock Inspection
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Your email is only used to send your report. No marketing without your consent.
        </p>
      </form>
    </div>
  )
}

function ContextStep({
  careType, serviceUsersCount, lastRating,
  onCareTypeChange, onServiceUsersCountChange, onLastRatingChange,
  onSubmit, isLoading,
}: {
  careType: string; serviceUsersCount: string; lastRating: string
  onCareTypeChange: (v: string) => void; onServiceUsersCountChange: (v: string) => void
  onLastRatingChange: (v: string) => void; onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
}) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your service</h1>
        <p className="text-gray-500">
          This helps us contextualise your readiness score.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="care-type" className="block text-sm font-medium text-gray-700 mb-1.5">
            Type of care service <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <select
            id="care-type"
            value={careType}
            onChange={(e) => onCareTypeChange(e.target.value)}
            required
            className="form-input bg-white"
          >
            <option value="">Select type&hellip;</option>
            {CARE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="service-users" className="block text-sm font-medium text-gray-700 mb-1.5">
            Approximate number of people you support{' '}
            <span className="text-gray-400 text-xs font-normal">(optional)</span>
          </label>
          <input
            id="service-users"
            type="number"
            min="1"
            max="9999"
            value={serviceUsersCount}
            onChange={(e) => onServiceUsersCountChange(e.target.value)}
            placeholder="e.g. 24"
            className="form-input"
          />
        </div>

        <div>
          <p className="block text-sm font-medium text-gray-700 mb-3">
            Most recent CQC rating <span className="text-red-500" aria-hidden="true">*</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CQC_RATINGS.map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => onLastRatingChange(rating)}
                className={`px-3 py-2.5 text-sm font-medium rounded-lg border-2 transition-colors text-left ${
                  lastRating === rating
                    ? 'border-nhs-blue bg-nhs-light-blue text-nhs-dark-blue'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!careType || !lastRating || isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving&hellip;
            </span>
          ) : (
            <>
              Begin Inspection Questions
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

function QuestionStep({
  question, questionIndex, totalQuestions,
  answer, confidence, onAnswerChange, onConfidenceChange,
  onNext, onBack, isLoading, isLast,
}: {
  question: Question; questionIndex: number; totalQuestions: number
  answer: string; confidence: ConfidenceLevel | null
  onAnswerChange: (v: string) => void; onConfidenceChange: (v: ConfidenceLevel) => void
  onNext: () => void; onBack: () => void; isLoading: boolean; isLast: boolean
}) {
  const completedSoFar = questionIndex
  const pct = Math.round((completedSoFar / totalQuestions) * 100)

  return (
    <div>
      {/* Question meta */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="badge bg-nhs-light-blue text-nhs-dark-blue">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
        <span className="badge bg-gray-100 text-gray-600">{question.keyQuestion}</span>
        <span className="badge bg-gray-100 text-gray-600">{question.requirement}</span>
      </div>

      {/* Mini progress */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-nhs-blue rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 flex-none">{pct}% done</span>
      </div>

      {/* Question card */}
      <div className="card mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-none w-7 h-7 bg-nhs-light-blue rounded-full flex items-center justify-center mt-0.5">
            <svg className="w-4 h-4 text-nhs-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-900 leading-relaxed">{question.question}</p>
        </div>
      </div>

      {/* Response */}
      <div className="mb-6">
        <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
          Your response
        </label>
        <textarea
          id="response"
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type how you would answer during an inspection…"
          rows={5}
          className="form-input resize-none"
        />
      </div>

      {/* Confidence selection */}
      <div className="mb-8">
        <p className="text-sm font-medium text-gray-700 mb-3">
          How confident are you that you could evidence this right now?
        </p>
        <div className="space-y-2">
          {CONFIDENCE_OPTIONS.map((opt) => {
            const isSelected = confidence === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onConfidenceChange(opt.value)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all ${
                  isSelected ? opt.selectedClass : opt.defaultClass
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex-none w-3 h-3 rounded-full ${opt.indicator} ${
                      isSelected ? 'opacity-100' : 'opacity-30'
                    }`}
                  />
                  <div>
                    <div className="font-medium text-sm leading-tight">{opt.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{opt.description}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="btn-secondary flex-none flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!answer.trim() || !confidence || isLoading}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving&hellip;
            </span>
          ) : (
            <>
              {isLast ? 'Complete Inspection' : 'Next Question'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
