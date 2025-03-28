import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/providers/auth-provider"
import { cn } from "@/lib/utils"
import "./globals.css"
import { Toaster } from 'react-hot-toast'
import { Plus_Jakarta_Sans } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
  preload: true,
})

export const metadata = {
  title: "Walkie AI",
  description: "Your AI companion",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jakarta.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={cn(
        "min-h-screen w-full overflow-x-hidden bg-background antialiased",
        jakarta.className
      )}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AuthProvider>
            {children}
            <Toaster 
              position="top-center"
              containerStyle={{
                top: 40,
                fontFamily: 'var(--font-jakarta)',
              }}
              toastOptions={{
                duration: 4000,
                style: {
                  maxWidth: '50%',
                  minWidth: '300px',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                  padding: '16px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  fontFamily: 'var(--font-jakarta)',
                },
                success: {
                  style: {
                    background: 'white',
                    color: '#10B981',
                  },
                  iconTheme: {
                    primary: '#10B981',
                    secondary: 'white',
                  },
                },
                error: {
                  style: {
                    background: 'white',
                    color: '#EF4444',
                  },
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: 'white',
                  },
                },
                loading: {
                  style: {
                    background: 'white',
                    color: '#3B82F6',
                  },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}