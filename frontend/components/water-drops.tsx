"use client"

export function WaterDrops() {
  return (
    <div className="absolute top-50 right-60 z-20 pointer-events-none">
      <div className="relative">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-fall"
            style={{
              left: `${i * 12}px`,
              top: `${Math.random() * 20}px`,
              animationDelay: `${i * 0.15}s`,
            }}
          >
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
              <path
                d="M8 0C8 0 0 8 0 13C0 16.866 3.582 20 8 20C12.418 20 16 16.866 16 13C16 8 8 0 8 0Z"
                fill="#7DD3FC"
                opacity="0.8"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}
