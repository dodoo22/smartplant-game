"use client"

import { useState, useRef, useEffect } from "react"

interface TopToolbarProps {
  selectedPlant: "rubber" | "cactus" | "monstera" | "ivy"
  selectedPot: "classic" | "modern" | "ceramic" | "terracotta"
  onSelectPlant: (plant: "rubber" | "cactus" | "monstera" | "ivy") => void
  onSelectPot: (pot: "classic" | "modern" | "ceramic" | "terracotta") => void
}

export function TopToolbar({ selectedPlant, selectedPot, onSelectPlant, onSelectPot }: TopToolbarProps) {
  const [isToolbarOpen, setIsToolbarOpen] = useState(false)
  const [activeSelector, setActiveSelector] = useState<"plant" | "pot" | null>(null)
  const selectorRef = useRef<HTMLDivElement>(null)

  const plants = [
    { id: "rubber" as const, name: "橡膠樹" },
    { id: "cactus" as const, name: "仙人掌" },
    { id: "monstera" as const, name: "龜背芋" },
    { id: "ivy" as const, name: "常春藤" },
  ]

  const pots = [
    { id: "classic" as const, name: "經典盆" },
    { id: "modern" as const, name: "現代盆" },
    { id: "ceramic" as const, name: "陶瓷盆" },
    { id: "terracotta" as const, name: "赤陶盆" },
  ]

  const renderPlantIcon = (type: string) => {
    switch (type) {
      case "rubber":
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <ellipse cx="12" cy="8" rx="4" ry="6" fill="currentColor" opacity="0.7" />
            <ellipse cx="8" cy="12" rx="3" ry="5" fill="currentColor" opacity="0.5" />
            <ellipse cx="16" cy="11" rx="3" ry="5" fill="currentColor" opacity="0.5" />
            <rect x="11" y="14" width="2" height="8" fill="currentColor" opacity="0.6" />
          </svg>
        )
      case "cactus":
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <rect x="10" y="6" width="4" height="16" rx="2" fill="currentColor" />
            <rect x="7" y="10" width="3" height="6" rx="1.5" fill="currentColor" opacity="0.8" />
            <rect x="14" y="8" width="3" height="6" rx="1.5" fill="currentColor" opacity="0.8" />
          </svg>
        )
      case "monstera":
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <ellipse cx="9" cy="8" rx="3" ry="4" fill="currentColor" opacity="0.7" transform="rotate(-20 9 8)" />
            <ellipse cx="15" cy="10" rx="3" ry="4" fill="currentColor" opacity="0.7" transform="rotate(20 15 10)" />
            <ellipse cx="12" cy="14" rx="3" ry="4" fill="currentColor" opacity="0.5" />
            <rect x="11" y="16" width="2" height="6" fill="currentColor" opacity="0.6" />
          </svg>
        )
      case "ivy":
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <ellipse cx="12" cy="7" rx="2" ry="8" fill="currentColor" />
            <ellipse cx="9" cy="10" rx="1.5" ry="6" fill="currentColor" opacity="0.7" transform="rotate(-20 9 10)" />
            <ellipse cx="15" cy="10" rx="1.5" ry="6" fill="currentColor" opacity="0.7" transform="rotate(20 15 10)" />
            <ellipse cx="7" cy="13" rx="1.5" ry="5" fill="currentColor" opacity="0.5" transform="rotate(-30 7 13)" />
            <ellipse cx="17" cy="13" rx="1.5" ry="5" fill="currentColor" opacity="0.5" transform="rotate(30 17 13)" />
          </svg>
        )
    }
  }

  const renderPotIcon = (type: string) => {
    switch (type) {
      case "classic":
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <path d="M8 12 L8 20 Q8 22 10 22 L14 22 Q16 22 16 20 L16 12 Z" fill="currentColor" />
            <rect x="7" y="10" width="10" height="2" rx="1" fill="currentColor" />
          </svg>
        )
      case "modern":
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <rect x="8" y="10" width="8" height="12" rx="1" fill="currentColor" />
            <rect x="7" y="9" width="10" height="1.5" fill="currentColor" />
          </svg>
        )
      case "ceramic":
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <path d="M9 11 L9 21 Q9 22 10 22 L14 22 Q15 22 15 21 L15 11 Z" fill="currentColor" />
            <ellipse cx="12" cy="11" rx="3.5" ry="1.5" fill="currentColor" />
          </svg>
        )
      case "terracotta":
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <path d="M7 13 L8 21 Q8 22 10 22 L14 22 Q16 22 16 21 L17 13 Z" fill="currentColor" />
            <path d="M7 13 L8 11 L16 11 L17 13 Z" fill="currentColor" opacity="0.8" />
          </svg>
        )
    }
  }

  const handlePlantSelect = (plantId: "rubber" | "cactus" | "monstera" | "ivy") => {
    onSelectPlant(plantId)
  }

  const handlePotSelect = (potId: "classic" | "modern" | "ceramic" | "terracotta") => {
    onSelectPot(potId)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setActiveSelector(null)
      }
    }

    if (activeSelector) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [activeSelector])

  return (
    <>
      <button
        onClick={() => setIsToolbarOpen(!isToolbarOpen)}
        className="absolute top-20 right-8 z-30 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-white/40 flex items-center justify-center hover:bg-white/90 transition-colors"
      >
        <svg className="w-5 h-5 text-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {isToolbarOpen && (
        <div
          className="absolute top-20 right-20 z-30 origin-right"
          style={{
            animation: "flyOut 0.3s ease-out forwards",
          }}
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-white/40">
            {/* Pot selector button */}
            <button
              onClick={() => setActiveSelector(activeSelector === "pot" ? null : "pot")}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                activeSelector === "pot" ? "bg-plant-accent/30 scale-110" : "bg-foreground/10 hover:bg-foreground/15"
              }`}
            >
              <div className="text-foreground/70 scale-75">{renderPotIcon(selectedPot)}</div>
            </button>

            {/* Plant selector button */}
            <button
              onClick={() => setActiveSelector(activeSelector === "plant" ? null : "plant")}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                activeSelector === "plant" ? "bg-plant-accent/30 scale-110" : "bg-foreground/10 hover:bg-foreground/15"
              }`}
            >
              <div className="text-foreground/70 scale-75">{renderPlantIcon(selectedPlant)}</div>
            </button>
          </div>
        </div>
      )}

      {activeSelector === "plant" && (
        <div
          ref={selectorRef}
          className="fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm animate-in slide-in-from-top-2 fade-in duration-200"
        >
          <div className="bg-white/95 backdrop-blur-md shadow-lg border-b border-plant-secondary/20 px-4 py-3">
            <div className="flex gap-3 justify-center items-center">
              {plants.map((plant) => (
                <button
                  key={plant.id}
                  onClick={() => handlePlantSelect(plant.id)}
                  className={`flex flex-col items-center gap-1.5 transition-all ${
                    selectedPlant === plant.id ? "scale-110" : "hover:scale-105"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      selectedPlant === plant.id
                        ? "bg-plant-accent/30 ring-2 ring-plant-accent shadow-lg"
                        : "bg-foreground/5 hover:bg-plant-accent/10"
                    }`}
                  >
                    <div
                      className={`scale-75 ${selectedPlant === plant.id ? "text-plant-accent" : "text-foreground/60"}`}
                    >
                      {renderPlantIcon(plant.id)}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-medium ${
                      selectedPlant === plant.id ? "text-plant-accent" : "text-foreground/60"
                    }`}
                  >
                    {plant.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSelector === "pot" && (
        <div
          ref={selectorRef}
          className="fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm animate-in slide-in-from-top-2 fade-in duration-200"
        >
          <div className="bg-white/95 backdrop-blur-md shadow-lg border-b border-plant-secondary/20 px-4 py-3">
            <div className="flex gap-3 justify-center items-center">
              {pots.map((pot) => (
                <button
                  key={pot.id}
                  onClick={() => handlePotSelect(pot.id)}
                  className={`flex flex-col items-center gap-1.5 transition-all ${
                    selectedPot === pot.id ? "scale-110" : "hover:scale-105"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      selectedPot === pot.id
                        ? "bg-plant-accent/30 ring-2 ring-plant-accent shadow-lg"
                        : "bg-foreground/5 hover:bg-plant-accent/10"
                    }`}
                  >
                    <div className={`scale-75 ${selectedPot === pot.id ? "text-plant-accent" : "text-foreground/60"}`}>
                      {renderPotIcon(pot.id)}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-medium ${
                      selectedPot === pot.id ? "text-plant-accent" : "text-foreground/60"
                    }`}
                  >
                    {pot.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes flyOut {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}
