'use client';

import { useMemo, useState } from 'react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';

type KeyQuestion = 'Safe' | 'Effective' | 'Caring' | 'Responsive' | 'Well-led';

type Prompt = {
  id: number;
  keyQuestion: KeyQuestion;
  requirement: string;
  question: string;
};

const prompts: Prompt[] = [
  {
    id: 1,
    keyQuestion: 'Well-led',
    requirement: 'Regulation 17',
    question:
      'What type of service are you providing, how many people use it, and what was your most recent CQC rating across the five key questions?',
  },
  {
    id: 2,
    keyQuestion: 'Safe',
    requirement: 'Regulation 12',
    question:
      'Walk me through your current medication process, and show me where I would find the latest MAR chart and any medication error log from the last 3 months.',
  },
  {
    id: 3,
    keyQuestion: 'Safe',
    requirement: 'Regulation 13',
    question:
      'Tell me about your most recent safeguarding concern. How quickly did staff escalate it, and where is your response timeline recorded?',
  },
  {
    id: 4,
    keyQuestion: 'Effective',
    requirement: 'Regulation 18',
    question:
      'How often are supervisions completed, and can you identify who is currently overdue and what action has been taken?',
  },
  {
    id: 5,
    keyQuestion: 'Effective',
    requirement: 'Regulation 9',
    question:
      'Pick one person you support. When was their care plan last reviewed, and how would you evidence that changes in need were reflected promptly?',
  },
  {
    id: 6,
    keyQuestion: 'Caring',
    requirement: 'Regulation 10',
    question:
      'How do you evidence that people are treated with dignity and involved in decisions? Please reference one recent documented example.',
  },
  {
    id: 7,
    keyQuestion: 'Responsive',
    requirement: 'Regulation 16',
    question:
      'Show me your complaints log for this quarter. How quickly were complaints acknowledged, investigated, and closed with feedback to the person?',
  },
  {
    id: 8,
    keyQuestion: 'Safe',
    requirement: 'Regulation 19',
    question:
      'For your latest staff recruit, how would you evidence safer recruitment checks: DBS, right to work, and references before start date?',
  },
  {
    id: 9,
    keyQuestion: 'Well-led',
    requirement: 'Regulation 17',
    question:
      'What are your two weakest inspection-readiness areas today, and how would you provide evidence for each within 5 minutes?',
  },
];

import { supabase } from '@/lib/supabase';

export default function Home() {
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<string[]>(Array(prompts.length).fill(''));
  const [slowEvidence, setSlowEvidence] = useState<boolean[]>(
    Array(prompts.length).fill(false),
  );
  const [goodPractice, setGoodPractice] = useState<boolean[]>(
    Array(prompts.length).fill(false),
  );
  const [workEmail, setWorkEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contactSaved, setContactSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const active = prompts[index];
  const isLast = index === prompts.length - 1;
  const complete = responses.every((entry) => entry.trim().length > 0);

  const completedCount = useMemo(
    () => responses.filter((entry) => entry.trim().length > 0).length,
    [responses],
  );

  const updateResponse = (value: string) => {
    setResponses((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const updateFlag = (setter: Dispatch<SetStateAction<boolean[]>>, value: boolean) => {
    setter((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (responses[index].trim().length === 0) {
      return;
    }
    if (!isLast) {
      setIndex((prev) => prev + 1);
    }
  };

  const onContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (workEmail.trim().length === 0) {
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await supabase.from('inspection_results').insert([
        {
          email: workEmail,
          phone: phoneNumber,
          responses: responses,
          slow_evidence: slowEvidence,
          good_practice: goodPractice,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
      setContactSaved(true);
    } catch (err) {
      console.error('Error saving to Supabase:', err);
      alert('Failed to save details. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="card intro-card">
        <p className="eyebrow">CQC Mock Inspection Tool</p>
        <h1>Minimal, conversational inspection dry run</h1>
        <p className="lead">
          Ask questions as an inspector would, gather evidence quickly, and expose
          where retrieval is slow before inspection day.
        </p>
      </section>

      <section className="card question-card">
        <div className="question-meta">
          <span>Question {index + 1} of {prompts.length}</span>
          <span>{active.keyQuestion}</span>
          <span>{active.requirement}</span>
        </div>
        <p className="question-text">{active.question}</p>

        <form onSubmit={onSubmit}>
          <label htmlFor="response" className="label">
            Manager response
          </label>
          <textarea
            id="response"
            value={responses[index]}
            onChange={(event) => updateResponse(event.target.value)}
            placeholder="Type how you would answer during inspection..."
          />

          <div className="toggles">
            <label>
              <input
                type="checkbox"
                checked={slowEvidence[index]}
                onChange={(event) => updateFlag(setSlowEvidence, event.target.checked)}
              />
              Evidence was slow to retrieve
            </label>
            <label>
              <input
                type="checkbox"
                checked={goodPractice[index]}
                onChange={(event) => updateFlag(setGoodPractice, event.target.checked)}
              />
              Strong practice demonstrated
            </label>
          </div>

          <div className="actions">
            <button
              type="button"
              onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
              disabled={index === 0}
            >
              Back
            </button>
            <button type="submit">{isLast ? 'Finish questions' : 'Next question'}</button>
          </div>
        </form>
      </section>

      <section className="card progress-card">
        <p>
          <strong>{completedCount}</strong> / {prompts.length} responses completed
        </p>
        <p>
          Slow retrieval flags: <strong>{slowEvidence.filter(Boolean).length}</strong> | Good
          practice flags: <strong>{goodPractice.filter(Boolean).length}</strong>
        </p>
      </section>

      {complete && (
        <>
          <section className="card closeout-card">
            <h2>Inspection closeout prompt</h2>
            <ol>
              <li>List 3 specific strengths observed.</li>
              <li>List 3 areas where evidence retrieval was slow or uncertain.</li>
              <li>
                Identify one systemic pattern (for example: evidence exists but retrieval
                is manual and time-consuming).
              </li>
            </ol>
            <blockquote>
              The gap isn&apos;t usually in the care itself - it&apos;s in being able to prove
              it quickly when inspectors ask. Most managers know what good looks like but
              lose hours every week making sure it&apos;s documented correctly.
            </blockquote>
          </section>

          <section className="card contact-card">
            <h2>Get your mock inspection summary</h2>
            <p>
              Leave your work email and we&apos;ll send a copy of this dry run checklist.
              Phone number is optional if you want follow-up support.
            </p>
            <form className="contact-form" onSubmit={onContactSubmit}>
              <label htmlFor="work-email" className="label">
                Work email
              </label>
              <input
                id="work-email"
                type="email"
                required
                value={workEmail}
                onChange={(event) => setWorkEmail(event.target.value)}
                placeholder="manager@careprovider.co.uk"
              />

              <label htmlFor="phone-number" className="label">
                Phone number (optional)
              </label>
              <input
                id="phone-number"
                type="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder="+44..."
              />

              <button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save details'}
              </button>
              {contactSaved && (
                <p className="contact-success">
                  Details saved. Thanks - your inspection prep summary is ready to send.
                </p>
              )}
            </form>
          </section>
        </>
      )}
    </main>
  );
}
