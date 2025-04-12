"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, BookOpen, Home, Library, Menu, Moon, Settings, Sun, Upload, User, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeProvider } from "@/components/theme-provider"
import { useTheme } from "next-themes"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Library", href: "/dashboard/library", icon: Library },
    { name: "Upload", href: "/dashboard/upload", icon: Upload },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar for desktop */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex flex-col flex-grow border-r border-border bg-card">
            <div className="flex items-center h-16 px-4 border-b border-border">
              <Link href="/dashboard" className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-redpanda-fur" />
                <span className="font-bold text-xl">RedPanda Audio</span>
              </Link>
            </div>
            <div className="flex-grow flex flex-col justify-between">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-md
                      ${
                        pathname === item.href
                          ? "bg-redpanda-fur/10 text-redpanda-fur"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }
                    `}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-redpanda-fur/10 flex items-center justify-center text-redpanda-fur">
                      <User className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Admin User</p>
                    <p className="text-xs text-muted-foreground">admin@audiobooks.com</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden">
          <div className="flex items-center justify-between h-16 px-4 border-b border-border bg-card">
            <Link href="/dashboard" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-redpanda-fur" />
              <span className="font-bold text-xl">RedPanda Audio</span>
            </Link>
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between h-16 px-4 border-b border-border">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      <BookOpen className="h-6 w-6 text-redpanda-fur" />
                      <span className="font-bold text-xl">RedPanda Audio</span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileNavOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <nav className="flex-1 px-2 py-4 space-y-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`
                          flex items-center px-3 py-2 text-sm font-medium rounded-md
                          ${
                            pathname === item.href
                              ? "bg-redpanda-fur/10 text-redpanda-fur"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }
                        `}
                        onClick={() => setIsMobileNavOpen(false)}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  <div className="p-4 border-t border-border">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-redpanda-fur/10 flex items-center justify-center text-redpanda-fur">
                          <User className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">Admin User</p>
                        <p className="text-xs text-muted-foreground">admin@audiobooks.com</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      >
                        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 md:pl-64">
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  )
}

