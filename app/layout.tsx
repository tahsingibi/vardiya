import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vardiya.sungur.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Vardiya",
  description:
    "Vardiya: İzmir trafiğinde gündüzden geceye motosikletli kurye vardiyası. Trafikten sıyrıl, teslimat yap, polis takibinden kurtul.",
  manifest: "/manifest.webmanifest",
  authors: [{ name: "@tahsingibi", url: "https://sungur.dev" }],
  creator: "@tahsingibi · sungur.dev",
  keywords: ["Vardiya", "İzmir", "motosiklet", "kurye", "arcade", "browser game", "PWA"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vardiya",
  },
  openGraph: {
    type: "website",
    title: "Vardiya",
    description: "İzmir trafiğinde gündüzden geceye yaşayan kurye arcade oyunu.",
    url: siteUrl,
    siteName: "Vardiya",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Vardiya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vardiya",
    description: "İzmir trafiğinde motosikletli kurye vardiyası.",
    creator: "@tahsingibi",
    images: ["/api/og"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#050608",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                var refreshingForNewWorker = false;
              var hadServiceWorker = Boolean(navigator.serviceWorker.controller);
                navigator.serviceWorker.addEventListener('controllerchange', function() {
                  if (!hadServiceWorker || refreshingForNewWorker) return;
                  refreshingForNewWorker = true;
                  window.location.reload();
                });
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
                    .then(function(registration) { return registration.update(); })
                    .catch(function(err) {
                      console.log('SW registration failed: ', err);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
