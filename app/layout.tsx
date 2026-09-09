import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'
import { Splash } from '@/components/splash'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-serif',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Bryan & Estéfany | Nosso Casamento',
  description:
    'Com imensa alegria, convidamos você para celebrar o casamento de Bryan e Estéfany. Confirme sua presença.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#1c120a',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${cormorant.variable} ${jost.variable} bg-background`}
    >
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/LOGOBE.png" />
        <link rel="shortcut icon" type="image/png" href="/LOGOBE.png" />
        <link rel="apple-touch-icon" type="image/png" href="/LOGOBE.png" />
      </head>
      <body className="antialiased font-sans">
        <Splash />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
