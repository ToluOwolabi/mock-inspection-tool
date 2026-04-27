import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CQC Inspection Readiness Tool',
  description:
    'Test your CQC inspection readiness in 10 minutes. Get a free readiness score, identify evidence gaps, and download your report.',
  openGraph: {
    title: 'CQC Inspection Readiness Tool',
    description: 'Test your CQC inspection readiness in 10 minutes.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
