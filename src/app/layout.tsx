import type { Metadata } from 'next'
import { Montserrat, Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from "sonner"

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '600', '800'],
  variable: '--font-montserrat',
  display: 'swap',
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TrainedByAI Platform',
  description: 'Comprehensive AI-powered training and management platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className={`font-sans bg-background min-h-screen antialiased ${inter.variable}`}>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#18181B',
                color: '#fff',
                border: 'none',
              },
              duration: 2000,
            }}
          />
        </Providers>
      </body>
    </html>
  )
}