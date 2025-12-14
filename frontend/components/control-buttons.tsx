"use client"

interface ControlButtonsProps {
  onWater: () => void | Promise<void>
  onTouch: () => void

  // ✅ 新增：讓 page.tsx 可以控制澆水按鈕
  disabled?: boolean
  waterHint?: string
}

export function ControlButtons({
  onWater,
  onTouch,
  disabled = false,
  waterHint,
}: ControlButtonsProps) {
  const buttons = [
    {
      key: "water",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
          />
        </svg>
      ),
      label: "澆水",
      onClick: onWater,
      // ✅ 只有澆水會被禁用
      disabled,
      hint: waterHint,
    },
    {
      key: "touch",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
          />
        </svg>
      ),
      label: "觸摸",
      onClick: onTouch,
      disabled: false,
      hint: undefined,
    },
    {
      key: "fertilizer",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {/* 肥料袋 */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M8 6h8M7 6c0-1 1-2 2-2h6c1 0 2 1 2 2m0 0l1 14c0 1-1 2-2 2H8c-1 0-2-1-2-2L7 6"
          />
          {/* 肥料顆粒 */}
          <circle cx="10" cy="12" r="0.8" fill="currentColor" />
          <circle cx="14" cy="12" r="0.8" fill="currentColor" />
          <circle cx="12" cy="14" r="0.8" fill="currentColor" />
          <circle cx="11" cy="16" r="0.8" fill="currentColor" />
          <circle cx="13" cy="16" r="0.8" fill="currentColor" />
        </svg>
      ),
      label: "肥料",
      onClick: () => {},
      disabled: false,
      hint: undefined,
    },
  ]

  return (
    <div className="flex justify-center gap-3">
      {buttons.map(button => (
        <div key={button.key} className="relative flex flex-col items-center">
          <button
            onClick={button.onClick}
            disabled={button.disabled}
            className={[
              "w-12 h-12 rounded-full backdrop-blur-sm shadow-md flex items-center justify-center transition-all border-2 border-plant-border",
              button.disabled
                ? "bg-white/50 text-gray-400 cursor-not-allowed"
                : "bg-white/80 hover:scale-110 active:scale-95",
            ].join(" ")}
            aria-label={button.label}
          >
            <div className="text-plant-icon">{button.icon}</div>
          </button>

          {/* ✅ 只在澆水且有提示文字時顯示 */}
          {button.hint && (
            <div className="absolute -bottom-5 text-[10px] text-gray-500 whitespace-nowrap">
              {button.hint}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}