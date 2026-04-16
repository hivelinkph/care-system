import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'
import ChatWidget from '@/components/ChatWidget'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Care System by Kyte',
  description: 'Manage your daily tasks with precision and modern simplicity.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${roboto.variable}`}>
      <body className="font-body text-[var(--color-brand-primary)] bg-[var(--color-brand-bg)] antialiased selection:bg-[var(--color-brand-accent)] selection:text-white">
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}
