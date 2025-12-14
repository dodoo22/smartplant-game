"use client"

import { useState, useEffect } from "react"

interface PlantCharacterProps {
  emotion: "happy" | "thirsty" | "excited" | "content"
  plantType: "rubber" | "cactus" | "monstera" | "ivy"
  potType: "classic" | "modern" | "ceramic" | "terracotta"
}

export function PlantCharacter({ emotion, plantType, potType }: PlantCharacterProps) {
  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    if (emotion !== "happy" && emotion !== "content") return

    const blinkInterval = setInterval(
      () => {
        setIsBlinking(true)
        setTimeout(() => setIsBlinking(false), 150)
      },
      Math.random() * 3000 + 5000,
    )

    return () => clearInterval(blinkInterval)
  }, [emotion])

  const getFaceExpression = () => {
    if (isBlinking && (emotion === "happy" || emotion === "content")) {
      return "- ᴗ -"
    }

    switch (emotion) {
      case "happy":
        return "> ◡ <"
      case "thirsty":
        return "• ︵ •"
      case "excited":
        return (
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>ᴗ</span>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        )
      case "content":
        return "• ᴗ •"
      default:
        return "• ◡ •"
    }
  }

  const renderPlant = () => {
    switch (plantType) {
      case "rubber":
        return (
          <svg
            width="200"
            height="280"
            viewBox="0 -90 180 270"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={emotion === "happy" ? "animate-wiggle" : ""}
          >
            {/* Simple thin stem */}
            <rect x="87" y="40" width="6" height="90" fill="#697461" rx="3" />

            {/* Back layer leaves - larger, darker */}
            <ellipse cx="60" cy="-10" rx="32" ry="44" fill="#758570" />
            <ellipse cx="120" cy="-15" rx="30" ry="42" fill="#6D7D68" />

            {/* Middle layer leaves */}
            <ellipse cx="70" cy="15" rx="28" ry="40" fill="#8A9C86" />
            <ellipse cx="110" cy="10" rx="30" ry="42" fill="#7B8D77" />

            {/* Front center leaf - brightest */}
            <ellipse cx="90" cy="-5" rx="34" ry="48" fill="#99AB95" />
          </svg>
        )
      case "cactus":
        return (
          <svg
            width="200"
            height="280"
            viewBox="0 -90 180 270"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={emotion === "happy" ? "animate-wiggle" : ""}
          >
            {/* Left arm */}
            <rect x="50" y="-35" width="22" height="45" fill="#7B8D77" rx="11" />
            <rect x="50" y="-35" width="22" height="25" fill="#8A9C86" rx="11" />

            {/* Right arm */}
            <rect x="108" y="-45" width="22" height="40" fill="#758570" rx="11" />
            <rect x="108" y="-45" width="22" height="22" fill="#8A9C86" rx="11" />

            {/* Main body */}
            <rect x="75" y="-75" width="30" height="135" fill="#8A9C86" rx="15" />

            {/* Subtle highlight */}
            <rect x="85" y="-70" width="8" height="125" fill="#99AB95" opacity="0.4" rx="4" />
          </svg>
        )
      case "monstera":
        return (
          <svg
            width="200"
            height="280"
            viewBox="0 -90 180 270"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={emotion === "happy" ? "animate-wiggle" : ""}
          >
            {/* Main stem */}
            <rect x="87" y="-15" width="6" height="80" fill="#697461" rx="3" />

            {/* Four simple leaves - alternating sides */}
            <ellipse cx="65" cy="-35" rx="24" ry="32" fill="#8A9C86" transform="rotate(-25 65 -35)" />
            <ellipse cx="115" cy="-20" rx="26" ry="34" fill="#7B8D77" transform="rotate(20 115 -20)" />
            <ellipse cx="60" cy="0" rx="25" ry="33" fill="#99AB95" transform="rotate(-30 60 0)" />
            <ellipse cx="120" cy="10" rx="24" ry="32" fill="#758570" transform="rotate(25 120 10)" />
          </svg>
        )
      case "ivy":
        return (
          <svg
            width="200"
            height="280"
            viewBox="0 -90 180 270"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={emotion === "happy" ? "animate-wiggle" : ""}
          >
            {/* Back left leaf - shortest */}
            <ellipse cx="60" cy="25" rx="12" ry="50" fill="#9CAA88" transform="rotate(-40 60 25)" />
            <line
              x1="60"
              y1="75"
              x2="60"
              y2="-25"
              stroke="#7B8D6F"
              strokeWidth="1.5"
              opacity="0.7"
              transform="rotate(-40 60 25)"
            />

            {/* Left leaf */}
            <ellipse cx="70" cy="15" rx="14" ry="60" fill="#A8B694" transform="rotate(-25 70 15)" />
            <line
              x1="70"
              y1="75"
              x2="70"
              y2="-45"
              stroke="#8A9C7A"
              strokeWidth="1.5"
              opacity="0.7"
              transform="rotate(-25 70 15)"
            />

            {/* Center left leaf */}
            <ellipse cx="82" cy="0" rx="15" ry="70" fill="#B4C2A0" transform="rotate(-10 82 0)" />
            <line
              x1="82"
              y1="70"
              x2="82"
              y2="-70"
              stroke="#99AB89"
              strokeWidth="1.5"
              opacity="0.7"
              transform="rotate(-10 82 0)"
            />

            {/* Center tallest leaf - most upright */}
            <ellipse cx="90" cy="-10" rx="16" ry="78" fill="#BCC8AC" />
            <line x1="90" y1="68" x2="90" y2="-88" stroke="#A5B795" strokeWidth="2" opacity="0.7" />

            {/* Center right leaf */}
            <ellipse cx="98" cy="0" rx="15" ry="70" fill="#B4C2A0" transform="rotate(10 98 0)" />
            <line
              x1="98"
              y1="70"
              x2="98"
              y2="-70"
              stroke="#99AB89"
              strokeWidth="1.5"
              opacity="0.7"
              transform="rotate(10 98 0)"
            />

            {/* Right leaf */}
            <ellipse cx="110" cy="15" rx="14" ry="60" fill="#A8B694" transform="rotate(25 110 15)" />
            <line
              x1="110"
              y1="75"
              x2="110"
              y2="-45"
              stroke="#8A9C7A"
              strokeWidth="1.5"
              opacity="0.7"
              transform="rotate(25 110 15)"
            />

            {/* Back right leaf - shortest */}
            <ellipse cx="120" cy="25" rx="12" ry="50" fill="#9CAA88" transform="rotate(40 120 25)" />
            <line
              x1="120"
              y1="75"
              x2="120"
              y2="-25"
              stroke="#7B8D6F"
              strokeWidth="1.5"
              opacity="0.7"
              transform="rotate(40 120 25)"
            />
          </svg>
        )
    }
  }

  const renderPot = () => {
    const faceExpression = getFaceExpression()

    switch (potType) {
      case "classic":
        return (
          <>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-28 bg-[#F5F1E8] rounded-b-[50%] flex items-center justify-center shadow-md z-20">
              <div className="text-5xl font-bold tracking-wide text-gray-800 mb-3">
                {typeof faceExpression === "string" ? faceExpression : faceExpression}
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-28 h-3 bg-black/10 rounded-[50%] blur-sm z-0" />
          </>
        )
      case "modern":
        return (
          <>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#C9866B] rounded-lg flex items-center justify-center shadow-md z-20">
              <div className="text-5xl font-bold tracking-wide text-gray-800">
                {typeof faceExpression === "string" ? faceExpression : faceExpression}
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-28 h-3 bg-black/10 rounded-[50%] blur-sm z-0" />
          </>
        )
      case "ceramic":
        return (
          <>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-36 bg-[#D4D2CD] rounded-t-2xl rounded-b-3xl flex items-center justify-center shadow-md z-20">
              <div className="text-5xl font-bold tracking-wide text-gray-800 mt-2">
                {typeof faceExpression === "string" ? faceExpression : faceExpression}
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-3 bg-black/10 rounded-[50%] blur-sm z-0" />
          </>
        )
      case "terracotta":
        return (
          <>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-24 bg-[#E6C4B8] rounded-b-[60%] flex items-center justify-center shadow-md z-20">
              <div className="text-5xl font-bold tracking-wide text-gray-800 mb-2">
                {typeof faceExpression === "string" ? faceExpression : faceExpression}
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-3 bg-black/10 rounded-[50%] blur-sm z-0" />
          </>
        )
    }
  }

  return (
    <div className="relative overflow-visible">
      {/* Plant */}
      <div className="relative z-10 -mb-6 overflow-visible">{renderPlant()}</div>

      {/* Pot with Face */}
      {renderPot()}
    </div>
  )
}
