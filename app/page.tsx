import Link from 'next/link'

const features = [
  {
    step: '1',
    title: 'Tell us about your service',
    description:
      'A brief context form about your care setting, number of service users, and most recent CQC rating.',
  },
  {
    step: '2',
    title: 'Answer 9 inspector-style questions',
    description:
      'Real questions across Safe, Effective, Caring, Responsive, and Well-led — asked exactly as an inspector would.',
  },
  {
    step: '3',
    title: 'Get your readiness score and report',
    description:
      'Instant analysis showing where evidence is strong and where retrieval is slow. Download as PDF.',
  },
]

const benefits = [
  'Know exactly which evidence you can retrieve in seconds vs. what needs searching for',
  'Identify the patterns inspectors flag as "organised but manually managed"',
  'Your readiness score across all 5 key CQC questions',
  'A downloadable PDF report to share with your management team',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-nhs-blue rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-800">CQC Readiness</span>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Free · No account needed
          </span>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-nhs-light-blue text-nhs-dark-blue text-sm font-medium px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-nhs-blue rounded-full"></span>
            Takes 10 minutes · Free to use
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Test Your CQC Inspection<br />
            <span className="text-nhs-blue">Readiness in 10 Minutes</span>
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed mb-10">
            Go through a realistic mock inspection. See exactly where your evidence retrieval is slow — before an inspector does.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Link
              href="/inspect"
              className="inline-flex items-center justify-center bg-nhs-blue text-white text-lg font-semibold px-8 py-4 rounded-xl hover:bg-nhs-dark-blue transition-colors shadow-sm"
            >
              Start Free Mock Inspection
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className="text-sm text-gray-500">No sign-up until you want your report</p>
          </div>
        </div>
      </section>

      <div className="bg-gray-50 border-y border-gray-100 py-4">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            Covers all 5 key CQC questions ·{' '}
            <span className="font-medium text-gray-700">Safe · Effective · Caring · Responsive · Well-led</span>
          </p>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((item) => (
            <div key={item.step} className="flex flex-col gap-4">
              <div className="w-10 h-10 bg-nhs-blue text-white rounded-xl flex items-center justify-center font-bold text-lg flex-none">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-nhs-warm-white border-y border-gray-100 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">What you will discover</h2>
            <ul className="space-y-4">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="mt-0.5 flex-none w-5 h-5 bg-nhs-pale-green rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-nhs-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <p className="text-gray-700">{benefit}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="bg-nhs-light-blue rounded-2xl p-8 md:p-12 max-w-2xl mx-auto text-center">
          <blockquote className="text-xl text-nhs-dark-blue font-medium leading-relaxed mb-4">
            &ldquo;The gap isn&rsquo;t usually in the care itself &mdash; it&rsquo;s in being able to prove it quickly when inspectors ask.&rdquo;
          </blockquote>
          <p className="text-nhs-mid-blue text-sm">
            Most managers know what good looks like. This tool shows where the documentation lags behind.
          </p>
        </div>
      </section>

      <section className="bg-nhs-blue py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to see where you stand?</h2>
          <p className="text-blue-100 mb-10 text-lg">Takes 10 minutes. Free. No account needed.</p>
          <Link
            href="/inspect"
            className="inline-flex items-center bg-white text-nhs-blue text-lg font-semibold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Start Free Mock Inspection
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>Built to help care providers prepare confidently for CQC inspections.</p>
        </div>
      </footer>
    </div>
  )
}
