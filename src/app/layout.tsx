import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Humming Agent AI - Video Conferencing',
  description: 'Professional video conferencing by Humming Agent AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
