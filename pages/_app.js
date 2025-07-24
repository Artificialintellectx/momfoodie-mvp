import '../styles/globals.css'
import '../styles/admin.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>MomFudy - Never Wonder What to Cook Again!</title>
        <meta name="description" content="Get instant Nigerian meal suggestions in under 30 seconds. No more cooking decision paralysis!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#f97316" />
        
        {/* Open Graph tags */}
                  <meta property="og:title" content="MomFudy - Instant Nigerian Meal Suggestions" />
        <meta property="og:description" content="Stop wasting time deciding what to cook. Get instant Nigerian meal suggestions!" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
                  <meta name="twitter:title" content="MomFudy - Never Wonder What to Cook Again!" />
        <meta name="twitter:description" content="Get instant Nigerian meal suggestions in seconds" />
        
        {/* PWA tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                  <meta name="apple-mobile-web-app-title" content="MomFudy" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
