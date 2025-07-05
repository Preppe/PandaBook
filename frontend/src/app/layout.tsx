import './globals.css';
import { cn } from '@/lib/utils';
import ClientLayout from './ClientLayout';
import AudioPlayer from '../components/AudioPlayer';

export const metadata = {
  title: "My Next App",
  description: "State-of-the-art Next.js starter"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="application-name" content="Audiobook App" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Audiobook App" />
        <meta name="description" content="State-of-the-art Next.js starter" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#2B5797" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/android/android-launchericon-192-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/android/android-launchericon-512-512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/ios/180.png" />
      </head>
      <body suppressHydrationWarning={true}>
        <ClientLayout>
          {children}
          <AudioPlayer />
        </ClientLayout>
      </body>
    </html>
  );
}
