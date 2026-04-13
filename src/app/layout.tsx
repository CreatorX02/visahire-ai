import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'VisaHire AI — Find Visa-Sponsored Jobs with AI',
  description: 'AI-powered job matching platform that finds and filters visa-sponsored jobs, standardizes your CV, and preps you for interviews.',
  keywords: 'visa sponsorship jobs, H1B jobs, work permit jobs, international jobs, AI job matching',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet" />
      </head>
      <body style={{ backgroundColor: '#0F1117', color: '#F1F5F9', fontFamily: "'DM Sans', sans-serif" }}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1D27',
              color: '#F1F5F9',
              border: '1px solid #2A2D3A',
            },
          }}
        />
      </body>
    </html>
  )
}
