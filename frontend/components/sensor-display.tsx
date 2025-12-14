"use client"

interface SensorDisplayProps {
  type: "humidity" | "temperature"|"env_humi"
  value: number
  label: string
}

export function SensorDisplay({ type, value, label }: SensorDisplayProps) {
  const percentage = type === "env_humi" ? value : (value / 35) * 100
  const circumference = 2 * Math.PI * 40

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r="40" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="6" fill="none" />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke={type === "env_humi" ? "#78AAE0" : "#E3AC78"}
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (percentage / 100) * circumference}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>

        {/* Value display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-foreground">{Math.round(value)}</span>
          <span className="text-xs text-muted-foreground">{type === "env_humi" ? "%" : "°C"}</span>
        </div>
      </div>

      <span className="text-sm font-medium text-foreground/80">{label}</span>
    </div>
  )
}
