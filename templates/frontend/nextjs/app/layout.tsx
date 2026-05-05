import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fullstack App',
  description: 'A simple fullstack application',
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
