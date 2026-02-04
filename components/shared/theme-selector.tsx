"use client"

import React from "react"
import { useTheme } from "next-themes"

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { id: "light", label: "Claro" },
    { id: "dark", label: "Oscuro" },
    { id: "system", label: "Sistema" },
  ]

  return (
    <div className="flex gap-2">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            theme === t.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
