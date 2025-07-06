// Gestisce il cambio tra vista griglia e lista

import React from "react"
import { Button } from "@/components/ui/button"
import { Grid, List } from "lucide-react"

interface LibraryViewToggleProps {
  viewMode: "grid" | "list"
  setViewMode: (mode: "grid" | "list") => void
}

export default function LibraryViewToggle({ viewMode, setViewMode }: LibraryViewToggleProps) {
  return (
    <div className="border rounded-md flex">
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="icon"
        onClick={() => setViewMode("grid")}
        className="rounded-r-none"
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="icon"
        onClick={() => setViewMode("list")}
        className="rounded-l-none"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  )
}
