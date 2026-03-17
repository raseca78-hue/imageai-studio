import './globals.css'

export const metadata = {
  title: 'ContractAI - Analiza Contratos con IA',
  description: 'Detecta cláusulas peligrosas en contratos usando inteligencia artificial. Ahorra dinero en abogados.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
