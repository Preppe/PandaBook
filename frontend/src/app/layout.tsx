import "./globals.css"
import { cn } from "@/lib/utils"
import BottomNav from "@/components/ui/layout/BottomNav"
import Header from "@/components/ui/layout/Header"

export const metadata = {
  title: "My Next App",
  description: "State-of-the-art Next.js starter"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-gray-50 font-sans antialiased")}>
        <BottomNav />
        <Header />
        {children}
      </body>
    </html>
  )
}
