'use client'

import { useState } from 'react'
import Link from 'next/link'
import { questions } from '@/lib/questions'
import {
  getScoreLabel,
  getScoreColor,
  getScoreDescription,
  getStrengths,
  getGaps,
} from '@/lib/scoring'
import type { Inspection, InspectionResponse } from '@/types'

function ScoreGauge({ score, color }: { score: number; color: string }) {
  // Semicircle gauge: radius 80, centre (110, 100)
  const r = 80
  const cx = 110
  const cy = 100
  const circumference = Math.PI * r
  const filled = Math.min((score / 100) * circumference, circumference)

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-56 h-32">
        <svg viewBox="0 0 220 110" className="w-full h-full" aria-hidden="true">
          {/* Track */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Score arc */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            strokeDashoffset={0}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-4xl font-bold leading-none" style={{ color }}>
            {score}
          </span>
          <span className="text-gray-400 text-sm">/100</span>
        </div>
      </div>
    </div>
  )
}

function ConfidenceBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    immediate: 'bg-green-100 text-green-800',
    uncertain: 'bg-amber-100 text-amber-800',
    need_to_check: 'bg-red-100 text-red-800',
  }
  const labels: Record<string, string> = {
    immediate: 'Immediate',
    uncertain: 'Uncertain',
    need_to_check: 'Needs checking',
  }
  return (
    <span className={`badge ${styles[level] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[level] ?? level}
    </span>
  )
}

export default function ResultsClient({
  inspection,
  responses,
}: {
  inspection: Inspection
  responses: InspectionResponse[]
}) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const score = inspection.readiness_score ?? 0
  const color = getScoreColor(score)
  const label = getScoreLabel(score)
  const description = getScoreDescription(score)
  const strengths = getStrengths(responses, questions)
  const gaps = getGaps(responses, questions)
  const date = new Date(inspection.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  async function handleDownloadPdf() {
    setIsGeneratingPdf(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'mm', format: 'a4' })

      const pageW = doc.internal.pageSize.getWidth()
      const margin = 20
      let y = margin

      // Header bar
      doc.setFillColor(0, 94, 184)
      doc.rect(0, 0, pageW, 18, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('CQC INSPECTION READINESS REPORT', margin, 12)

      y = 30

      // Provider details
      doc.setTextColor(30, 30, 30)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(inspection.company_name ?? 'Your Organisation', margin, y)
      y += 7

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text(`Report date: ${date}`, margin, y)
      if (inspection.care_type) {
        doc.text(`  ·  Service type: ${inspection.care_type}`, margin + 30, y)
      }
      if (inspection.last_rating) {
        doc.text(`  ·  Last rating: ${inspection.last_rating}`, margin + 30 + (inspection.care_type ? 40 : 0), y)
      }
      y += 10

      // Divider
      doc.setDrawColor(220, 220, 220)
      doc.line(margin, y, pageW - margin, y)
      y += 10

      // Score section
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text('READINESS SCORE', margin, y)
      y += 7

      // Score value
      const [r, g, b] = hexToRgb(color)
      doc.setFontSize(36)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(r, g, b)
      doc.text(`${score}/100`, margin, y + 10)

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(r, g, b)
      doc.text(label, margin + 35, y + 5)

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      const descLines = doc.splitTextToSize(description, pageW - margin * 2 - 35)
      doc.text(descLines, margin + 35, y + 11)

      // Score bar
      y += 22
      const barW = pageW - margin * 2
      const filledW = (score / 100) * barW
      doc.setFillColor(229, 231, 235)
      doc.roundedRect(margin, y, barW, 5, 2, 2, 'F')
      doc.setFillColor(r, g, b)
      doc.roundedRect(margin, y, filledW, 5, 2, 2, 'F')
      y += 12

      // Divider
      doc.setDrawColor(220, 220, 220)
      doc.line(margin, y, pageW - margin, y)
      y += 10

      // Strengths
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 127, 59)
      doc.text('STRENGTHS IDENTIFIED', margin, y)
      y += 7

      if (strengths.length > 0) {
        for (const strength of strengths) {
          doc.setFontSize(9)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(30, 30, 30)
          doc.text(`✓  ${strength}`, margin + 3, y)
          y += 6
        }
      } else {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(120, 120, 120)
        doc.text('No areas with immediate evidence retrieval identified.', margin + 3, y)
        y += 6
      }

      y += 5

      // Gaps
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(220, 38, 38)
      doc.text('EVIDENCE RETRIEVAL GAPS', margin, y)
      y += 7

      if (gaps.length > 0) {
        for (const gap of gaps) {
          doc.setFontSize(9)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(30, 30, 30)
          doc.text(`•  ${gap}`, margin + 3, y)
          y += 6
        }
      } else {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(120, 120, 120)
        doc.text('No significant retrieval gaps identified.', margin + 3, y)
        y += 6
      }

      y += 8

      // Key insight
      doc.setFillColor(232, 244, 248)
      const insightBoxH = 28
      doc.roundedRect(margin, y, pageW - margin * 2, insightBoxH, 3, 3, 'F')

      doc.setFontSize(9)
      doc.setFont('helvetica', 'bolditalic')
      doc.setTextColor(0, 48, 135)
      const insight =
        '"The gap isn\'t compliance — it\'s being able to prove it quickly when inspectors ask.\nMost managers know what good looks like. The evidence exists. Getting to it in minutes is what matters."'
      const insightLines = doc.splitTextToSize(insight, pageW - margin * 2 - 10)
      doc.text(insightLines, margin + 5, y + 7)
      y += insightBoxH + 10

      // Response summary table
      if (responses.length > 0) {
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 30, 30)
        doc.text('QUESTION BY QUESTION SUMMARY', margin, y)
        y += 7

        for (const resp of responses) {
          if (y > 260) {
            doc.addPage()
            y = margin
          }
          const q = questions.find((q) => q.id === resp.question_id)
          if (!q) continue

          doc.setFontSize(8.5)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(30, 30, 30)
          doc.text(`${q.theme} (${q.keyQuestion} – ${q.requirement})`, margin, y)
          y += 5

          const confLabels: Record<string, string> = {
            immediate: 'IMMEDIATE',
            uncertain: 'UNCERTAIN',
            need_to_check: 'NEEDS CHECKING',
          }
          const confColors: Record<string, [number, number, number]> = {
            immediate: [0, 127, 59],
            uncertain: [180, 100, 0],
            need_to_check: [180, 30, 30],
          }
          const [cr, cg, cb] = confColors[resp.response_confidence] ?? [60, 60, 60]
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(cr, cg, cb)
          doc.setFontSize(7)
          doc.text(confLabels[resp.response_confidence] ?? resp.response_confidence, margin, y)
          y += 5

          doc.setFont('helvetica', 'normal')
          doc.setTextColor(80, 80, 80)
          doc.setFontSize(8)
          const ansLines = doc.splitTextToSize(resp.answer, pageW - margin * 2)
          doc.text(ansLines.slice(0, 3), margin, y)
          y += ansLines.slice(0, 3).length * 4.5 + 4

          doc.setDrawColor(230, 230, 230)
          doc.line(margin, y, pageW - margin, y)
          y += 5
        }
      }

      // Footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(160, 160, 160)
        doc.text(
          `CQC Inspection Readiness Report · Generated ${date} · Page ${i} of ${pageCount}`,
          margin,
          doc.internal.pageSize.getHeight() - 8
        )
      }

      doc.save(
        `CQC-Readiness-Report-${(inspection.company_name ?? 'Organisation').replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
      )
    } catch (err) {
      console.error('PDF generation error:', err)
      alert('Could not generate PDF. Please try again.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            CQC Readiness
          </Link>
          <span className="text-xs text-gray-400">Inspection complete</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-6">
        {/* Score hero */}
        <div className="card text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Your Readiness Score
          </p>
          {inspection.company_name && (
            <p className="text-sm text-gray-500 mb-1">{inspection.company_name}</p>
          )}
          <ScoreGauge score={score} color={color} />
          <h2 className="text-xl font-bold mt-3 mb-2" style={{ color }}>
            {label}
          </h2>
          <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">{description}</p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {isGeneratingPdf ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating PDF&hellip;
                </span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF Report
                </>
              )}
            </button>
            <Link href="/inspect" className="btn-secondary flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retake Inspection
            </Link>
          </div>
        </div>

        {/* Strengths & Gaps */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-nhs-pale-green rounded-lg flex items-center justify-center flex-none">
                <svg className="w-4 h-4 text-nhs-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Strengths identified</h3>
            </div>
            {strengths.length > 0 ? (
              <ul className="space-y-2">
                {strengths.map((s) => (
                  <li key={s} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <span className="flex-none w-1.5 h-1.5 rounded-full bg-nhs-green mt-1.5" />
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic">
                No areas with immediate evidence retrieval. Focus on the gaps below.
              </p>
            )}
          </div>

          {/* Gaps */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center flex-none">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Evidence retrieval gaps</h3>
            </div>
            {gaps.length > 0 ? (
              <ul className="space-y-2">
                {gaps.map((g) => (
                  <li key={g} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <span className="flex-none w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5" />
                    {g}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic">No significant retrieval gaps — great work.</p>
            )}
          </div>
        </div>

        {/* Key insight */}
        <div className="bg-nhs-light-blue rounded-2xl p-6 md:p-8">
          <p className="text-xs font-semibold text-nhs-mid-blue uppercase tracking-wider mb-3">
            Key insight
          </p>
          <blockquote className="text-nhs-dark-blue font-medium leading-relaxed text-lg mb-2">
            &ldquo;The gap isn&rsquo;t compliance &mdash; it&rsquo;s being able to prove it quickly when inspectors ask.&rdquo;
          </blockquote>
          <p className="text-nhs-mid-blue text-sm">
            The evidence exists. Getting to it in minutes — not hours — is what separates a smooth inspection from a stressful one.
          </p>
        </div>

        {/* Full response breakdown */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-5">Full response breakdown</h3>
          <div className="space-y-5">
            {responses.map((resp) => {
              const q = questions.find((q) => q.id === resp.question_id)
              return (
                <div key={resp.id} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-start gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-500">{q?.keyQuestion} · {q?.requirement}</span>
                    <ConfidenceBadge level={resp.response_confidence} />
                  </div>
                  <p className="text-sm font-medium text-gray-800 mb-1">{q?.theme}</p>
                  <p className="text-sm text-gray-500 italic mb-2 leading-snug">{q?.question}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{resp.answer}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Subtle Grene mention */}
        <div className="text-center py-4 border border-gray-100 rounded-xl bg-white">
          <p className="text-sm text-gray-500 mb-1">
            Want help turning these gaps into a reliable system?
          </p>
          <p className="text-sm font-medium text-gray-700">
            Grene helps care providers get inspection-ready — and stay that way.{' '}
            <a
              href="https://grene.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-nhs-blue hover:underline"
            >
              Find out how →
            </a>
          </p>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-6 mt-8">
        <div className="max-w-3xl mx-auto px-4 text-center text-xs text-gray-400">
          <p>Your data is stored securely and used only for your inspection report and follow-up.</p>
        </div>
      </footer>
    </div>
  )
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0]
}
