"use client"

import { useState } from "react"

interface PlantSelectorProps {
  selectedPlant: "rubber" | "cactus" | "monstera" | "ivy"
  onSelectPlant: (plant: "rubber" | "cactus" | "monstera" | "ivy") => void
}

export function PlantSelector({ selectedPlant, onSelectPlant }: PlantSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const plants = [
    { id: "rubber" as const, icon: "🌿" },
    { id: "cactus" as const, icon: "🌵" },
    { id: "monstera" as const, icon: "🍃" },
    { id: "ivy" as const, icon: "🌱" },
  ]

  const currentPlant = plants.find((p) => p.id === selectedPlant)

  const handleSelect = (plantId: "rubber" | "cactus" | "monstera" | "ivy") => {
    onSelectPlant(plantId)
    setIsOpen(false)
  }

  return (
    <div className="relative flex flex-col items-center w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 backdrop-blur-sm border border-plant-secondary/30 hover:bg-white/60 transition-all shadow-sm"
      >
        <span className="text-xl">{currentPlant?.icon}</span>
        <svg
          className={`w-3 h-3 text-foreground/50 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-[90vw] max-w-md z-50 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="relative">
            <div className="overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex gap-4 px-4 py-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-plant-secondary/20 w-max mx-auto">
                {plants.map((plant) => (
                  <button
                    key={plant.id}
                    onClick={() => handleSelect(plant.id)}
                    className={`transition-all ${selectedPlant === plant.id ? "scale-110" : "hover:scale-105"}`}
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all ${
                        selectedPlant === plant.id
                          ? "bg-plant-accent/30 ring-2 ring-plant-accent shadow-lg"
                          : "bg-white/60 hover:bg-plant-accent/10"
                      }`}
                    >
                      {plant.icon}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
