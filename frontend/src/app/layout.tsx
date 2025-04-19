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
      <body className={cn('min-h-screen bg-gray-50 font-sans antialiased')}>
        <ClientLayout>
          {children}
          {/* Add the AudioPlayer component here */}
          <AudioPlayer />
        </ClientLayout>
      </body>
    </html>
  );
}
