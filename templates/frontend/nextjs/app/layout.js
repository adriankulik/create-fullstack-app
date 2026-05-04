export const metadata = {
  title: 'Fullstack App',
  description: 'A simple fullstack application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
