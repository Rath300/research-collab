export const metadata = {
  title: 'ResearchCollab - Deployment Test',
  description: 'Testing deployment for the ResearchCollab platform',
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
