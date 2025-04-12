"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp, BookOpen, Clock, Headphones, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/chart"

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("week")

  // Sample data for charts
  const listeningData = [
    { name: "Mon", value: 420 },
    { name: "Tue", value: 380 },
    { name: "Wed", value: 510 },
    { name: "Thu", value: 470 },
    { name: "Fri", value: 590 },
    { name: "Sat", value: 620 },
    { name: "Sun", value: 550 },
  ]

  const hourlyData = [
    { name: "12am", value: 120 },
    { name: "3am", value: 50 },
    { name: "6am", value: 180 },
    { name: "9am", value: 320 },
    { name: "12pm", value: 250 },
    { name: "3pm", value: 310 },
    { name: "6pm", value: 420 },
    { name: "9pm", value: 380 },
  ]

  const popularBooks = [
    { name: "The Silent Patient", value: 1240 },
    { name: "Atomic Habits", value: 980 },
    { name: "Project Hail Mary", value: 860 },
    { name: "The Midnight Library", value: 740 },
    { name: "Educated", value: 620 },
  ]

  const genreData = [
    { name: "Fiction", value: 35 },
    { name: "Non-Fiction", value: 25 },
    { name: "Mystery", value: 15 },
    { name: "Sci-Fi", value: 12 },
    { name: "Biography", value: 8 },
    { name: "Other", value: 5 },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your audiobook analytics dashboard.</p>
        </div>
        <Tabs defaultValue="week" className="w-full md:w-auto" onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listeners</CardTitle>
            <Headphones className="h-4 w-4 text-redpanda-fur" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="mr-1 h-4 w-4 text-redpanda-forest" />
              <span className="text-redpanda-forest font-medium">+12.5%</span> from last {timeRange}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-redpanda-amber" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,942</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="mr-1 h-4 w-4 text-redpanda-forest" />
              <span className="text-redpanda-forest font-medium">+4.3%</span> from last {timeRange}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audiobooks</CardTitle>
            <BookOpen className="h-4 w-4 text-redpanda-forest" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,587</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="mr-1 h-4 w-4 text-redpanda-forest" />
              <span className="text-redpanda-forest font-medium">+28</span> new titles this {timeRange}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Listening Time</CardTitle>
            <Clock className="h-4 w-4 text-redpanda-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42 min</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowDown className="mr-1 h-4 w-4 text-destructive" />
              <span className="text-destructive font-medium">-2.5%</span> from last {timeRange}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Listening Activity</CardTitle>
            <CardDescription>Daily listening hours for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={listeningData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Peak Listening Hours</CardTitle>
            <CardDescription>Average listeners by time of day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Audiobooks</CardTitle>
            <CardDescription>Based on total listening hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularBooks} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Genre Distribution</CardTitle>
            <CardDescription>Percentage of listening time by genre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={genreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

