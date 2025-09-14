'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import '@/styles/globals.css'

const UserContext = createContext({ user: null, setUser: null })

export const useUser = () => useContext(UserContext)

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for user session
    checkUser()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        checkUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        router.push('/')
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setUser({ ...user, ...profile })
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <html lang="en" className="dark">
        <head>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#0ea5e9" />

          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest" />

          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

          <meta name="robots" content="index, follow" />
          <meta name="googlebot" content="index, follow" />

          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="MathPro Academy" />
          <meta property="og:locale" content="en_US" />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@mathproacademy" />

          {process.env.NEXT_PUBLIC_PAYHERE_JS && (
            <script
              type="text/javascript"
              src={process.env.NEXT_PUBLIC_PAYHERE_JS}
              async
            />
          )}

          {process.env.NEXT_PUBLIC_GA_ID && (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                      page_path: window.location.pathname,
                    });
                  `,
                }}
              />
            </>
          )}

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "EducationalOrganization",
                "name": "MathPro Academy",
                "description": "Excellence in Mathematics Education",
                "url": "https://mathpro.lk",
                "logo": "https://mathpro.lk/logo.png",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Colombo",
                  "addressCountry": "LK"
                },
                "contactPoint": {
                  "@type": "ContactPoint",
                  "telephone": "+94-77-123-4567",
                  "contactType": "customer service",
                  "email": "support@mathpro.lk"
                }
              })
            }}
          />
        </head>
        <body className="bg-dark-900 text-gray-100 antialiased">
          <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping">
                <div className="h-20 w-20 rounded-full bg-primary-500 opacity-20"></div>
              </div>
              <div className="relative h-20 w-20 rounded-full bg-primary-500 flex items-center justify-center">
                <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0ea5e9" />

        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="MathPro Academy" />
        <meta property="og:locale" content="en_US" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@mathproacademy" />

        {process.env.NEXT_PUBLIC_PAYHERE_JS && (
          <script
            type="text/javascript"
            src={process.env.NEXT_PUBLIC_PAYHERE_JS}
            async
          />
        )}

        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "MathPro Academy",
              "description": "Excellence in Mathematics Education",
              "url": "https://mathpro.lk",
              "logo": "https://mathpro.lk/logo.png",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Colombo",
                "addressCountry": "LK"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+94-77-123-4567",
                "contactType": "customer service",
                "email": "support@mathpro.lk"
              }
            })
          }}
        />
      </head>
      <body className="bg-dark-900 text-gray-100 antialiased">
        <UserContext.Provider value={{ user, setUser }}>
          {children}
        </UserContext.Provider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '10px',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              padding: '16px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        {/* WhatsApp Widget */}
        <div className="fixed bottom-6 right-6 z-50">
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-14 h-14 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-colors"
            aria-label="WhatsApp Support"
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </a>
        </div>
      </body>
    </html>
  )
}