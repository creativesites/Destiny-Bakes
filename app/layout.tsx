import type { Metadata } from 'next'
import { Playfair_Display, Poppins, Dancing_Script } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { CopilotKit } from "@copilotkit/react-core"
import "@copilotkit/react-ui/styles.css"
import './globals.css'

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

const dancing = Dancing_Script({ 
  subsets: ['latin'],
  variable: '--font-dancing',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Destiny Bakes - Custom Cakes with Love | Chirundu, Zambia',
  description: 'Experience the magic of custom cakes made with love. AI-powered cake design, perfect for every celebration in Chirundu, Zambia.',
  keywords: ['custom cakes', 'bakery', 'Chirundu', 'Zambia', 'birthday cakes', 'wedding cakes', 'celebration cakes'],
  authors: [{ name: 'Destiny Bakes' }],
  openGraph: {
    title: 'Destiny Bakes - Custom Cakes with Love',
    description: 'Experience the magic of custom cakes made with love in Chirundu, Zambia.',
    type: 'website',
    locale: 'en_ZM',
    siteName: 'Destiny Bakes',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${playfair.variable} ${poppins.variable} ${dancing.variable}`}>
        <head>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#ec4899" />
        </head>
        <body className={`min-h-screen font-body antialiased hero-background`}>
          <CopilotKit publicApiKey="ck_pub_40e482be29b4a52905e7b63dad1d5e1f">
            {children}
          </CopilotKit>
        </body>
      </html>
    </ClerkProvider>
  )
}