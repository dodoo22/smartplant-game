"use client"

import { useEffect, useState } from "react"

interface ButterflyBeenAnimationProps {
  onComplete: () => void
}

interface Insect {
  id: number
  type: "butterfly" | "bee"
  startX: number
  startY: number
  endX: number
  endY: number
  delay: number
}

export function ButterflyBeeAnimation({ onComplete }: ButterflyBeenAnimationProps) {
  const [insects, setInsects] = useState<Insect[]>([])
  const [phase, setPhase] = useState<"flying" | "staying" | "leaving">("flying")

  useEffect(() => {
    console.log("[v0] Animation started")
    const newInsects: Insect[] = [
      { id: 1, type: "butterfly", startX: -200, startY: -100, endX: -40, endY: -120, delay: 0 },
      { id: 2, type: "bee", startX: 200, startY: -80, endX: 50, endY: -100, delay: 300 },
      { id: 3, type: "bee", startX: -180, startY: 150, endX: -30, endY: -80, delay: 600 },
    ]

    setInsects(newInsects)

    const stayTimer = setTimeout(() => {
      console.log("[v0] Insects staying near plant")
      setPhase("staying")
    }, 2000)

    const leaveTimer = setTimeout(() => {
      console.log("[v0] Insects leaving")
      setPhase("leaving")
    }, 4000)

    const completeTimer = setTimeout(() => {
      console.log("[v0] Animation complete, calling onComplete")
      onComplete()
    }, 5000)

    return () => {
      clearTimeout(stayTimer)
      clearTimeout(leaveTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {insects.map((insect) => (
        <div
          key={insect.id}
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
            transition: `transform 2000ms ease-in-out ${insect.delay}ms, opacity 1000ms ease-out`,
            transform:
              phase === "flying"
                ? `translate(${insect.startX}px, ${insect.startY}px)`
                : phase === "staying"
                  ? `translate(${insect.endX}px, ${insect.endY}px)`
                  : `translate(${insect.endX}px, ${insect.endY - 100}px)`,
            opacity: phase === "leaving" ? 0 : 1,
          }}
        >
          <div
            className="animate-float-around"
            style={{
              animationDelay: `${insect.delay}ms`,
              animationDuration: "2s",
            }}
          >
            {insect.type === "butterfly" ? <Butterfly /> : <Bee />}
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes float-around {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(10px, -8px) rotate(5deg);
          }
          50% {
            transform: translate(-8px, 4px) rotate(-5deg);
          }
          75% {
            transform: translate(8px, -10px) rotate(3deg);
          }
        }

        .animate-float-around {
          animation: float-around 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

function Butterfly() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-wing-flap"
    >
      {/* Body */}
      <ellipse cx="16" cy="16" rx="1.5" ry="6" fill="#2D3436" />

      {/* Left wings */}
      <ellipse
        cx="10"
        cy="12"
        rx="6"
        ry="8"
        fill="#FFB7C5"
        className="origin-right"
        style={{ transformOrigin: "16px 16px" }}
      />
      <ellipse cx="10" cy="12" rx="3" ry="4" fill="#FF85A2" />
      <ellipse
        cx="10"
        cy="20"
        rx="5"
        ry="6"
        fill="#FFD1DC"
        className="origin-right"
        style={{ transformOrigin: "16px 16px" }}
      />

      {/* Right wings */}
      <ellipse
        cx="22"
        cy="12"
        rx="6"
        ry="8"
        fill="#FFB7C5"
        className="origin-left"
        style={{ transformOrigin: "16px 16px" }}
      />
      <ellipse cx="22" cy="12" rx="3" ry="4" fill="#FF85A2" />
      <ellipse
        cx="22"
        cy="20"
        rx="5"
        ry="6"
        fill="#FFD1DC"
        className="origin-left"
        style={{ transformOrigin: "16px 16px" }}
      />

      {/* Antennae */}
      <path d="M16 10 Q14 6 12 5" stroke="#2D3436" strokeWidth="0.5" fill="none" />
      <path d="M16 10 Q18 6 20 5" stroke="#2D3436" strokeWidth="0.5" fill="none" />

      <style jsx>{`
        @keyframes wing-flap {
          0%,
          100% {
            transform: scaleX(1);
          }
          50% {
            transform: scaleX(0.8);
          }
        }

        .animate-wing-flap {
          animation: wing-flap 0.3s ease-in-out infinite;
        }
      `}</style>
    </svg>
  )
}

function Bee() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-wing-buzz"
    >
      {/* Body with stripes */}
      <ellipse cx="14" cy="15" rx="5" ry="7" fill="#FFD93D" />
      <rect x="9" y="12" width="10" height="2" fill="#2D3436" rx="1" />
      <rect x="9" y="16" width="10" height="2" fill="#2D3436" rx="1" />
      <rect x="9" y="20" width="10" height="1.5" fill="#2D3436" rx="0.75" />

      {/* Head */}
      <circle cx="14" cy="10" r="3" fill="#2D3436" />

      {/* Wings */}
      <ellipse
        cx="10"
        cy="13"
        rx="4"
        ry="6"
        fill="#E8F4F8"
        opacity="0.7"
        className="origin-right"
        style={{ transformOrigin: "14px 14px" }}
      />
      <ellipse
        cx="18"
        cy="13"
        rx="4"
        ry="6"
        fill="#E8F4F8"
        opacity="0.7"
        className="origin-left"
        style={{ transformOrigin: "14px 14px" }}
      />

      {/* Antennae */}
      <path d="M14 8 Q12 5 11 4" stroke="#2D3436" strokeWidth="0.8" fill="none" />
      <path d="M14 8 Q16 5 17 4" stroke="#2D3436" strokeWidth="0.8" fill="none" />

      <style jsx>{`
        @keyframes wing-buzz {
          0%,
          100% {
            transform: scaleX(1) scaleY(1);
          }
          50% {
            transform: scaleX(0.7) scaleY(1.1);
          }
        }

        .animate-wing-buzz {
          animation: wing-buzz 0.15s ease-in-out infinite;
        }
      `}</style>
    </svg>
  )
}
