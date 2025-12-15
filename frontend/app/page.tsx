"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { PlantCharacter } from "@/components/plant-character"
import { SensorDisplay } from "@/components/sensor-display"
import { ControlButtons } from "@/components/control-buttons"
import { WaterDrops } from "@/components/water-drops"
import { TopToolbar } from "@/components/top-toolbar"
import { ButterflyBeeAnimation } from "@/components/butterfly-bee-animation"

type Emotion = "happy" | "thirsty" | "excited" | "content"
type PlantType = "rubber" | "cactus" | "monstera" | "ivy"
type PotType = "classic" | "modern" | "ceramic" | "terracotta"

type StatusPayload = {
  humidity: boolean // true=乾、false=濕
  env_humi: number | null
  temperature: number | null
  light: number
  touch: boolean
  daily_sec?: number
  last_water_at?: string | null
}

export default function PlantCareGame() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE
  const WATER_API_KEY = process.env.NEXT_PUBLIC_WATER_API_KEY

  const [emotion, setEmotion] = useState<Emotion>("content")

  // 後端 humidity(boolean) true=乾 false=濕
  const [soilHumidity, setSoilHumidity] = useState<boolean>(false)

  const [envHumidity, setEnvHumidity] = useState<number>(0)
  const [temperature, setTemperature] = useState<number>(22)
  const [lightLevel, setLightLevel] = useState<number>(0)

  const [isWatering, setIsWatering] = useState<boolean>(false)
  
  // ❤️ 愛心系統：三個每日任務（拍照、澆水、觸摸）
  const [hearts, setHearts] = useState<{photo: boolean, water: boolean, touch: boolean}>({
    photo: false,
    water: false,
    touch: false,
  })
  
  // 🦋 追蹤今天是否已經招蜂引蝶
  const [hasCalledInsectsToday, setHasCalledInsectsToday] = useState<boolean>(false)

  const [plantType, setPlantType] = useState<PlantType>("rubber")
  const [potType, setPotType] = useState<PotType>("classic")

  const [showInsects, setShowInsects] = useState<boolean>(false)
  const [isPlayingAnimation, setIsPlayingAnimation] = useState<boolean>(false)

  // ✅ 429 cooldown 倒數（秒）
  const [cooldownLeft, setCooldownLeft] = useState<number>(0)

  // edge detection refs
  const lastTouchRef = useRef(false)
  const lastSoilHumidityRef = useRef<boolean | undefined>(undefined)
  // ref mirror of soilHumidity so callbacks can read latest value without changing identity
  const soilHumidityRef = useRef<boolean>(soilHumidity)

  // timer refs
  const waterTimeoutRef = useRef<number | null>(null)
  const cooldownTimerRef = useRef<number | null>(null)

  // ✅ 避免閉包問題
  const isWateringRef = useRef(false)
  const isPlayingAnimationRef = useRef(false)
  const lastEmotionSetTimeRef = useRef(0)

  // ========== 相機狀態（方案B：預覽串流 + 拍照） ==========
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraMode, setCameraMode] = useState<"preview" | "photo">("preview") // preview=串流, photo=照片
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [cameraBusy, setCameraBusy] = useState(false)
  const [cameraErr, setCameraErr] = useState<string | null>(null)

  // 串流 URL（後端要有 /camera/stream?api_key=xxx）
  const cameraStreamUrl =
    API_BASE && WATER_API_KEY
      ? `${API_BASE}/camera/stream?api_key=${encodeURIComponent(WATER_API_KEY)}`
      : null

  // ========== 小工具 ==========
  const playWaterSound = () => {
    try {
      const audio = new Audio("/water-sound.mp3")
      audio.volume = 0.5
      audio.play().catch(() => {})
    } catch {
      // ignore
    }
  }

  const deriveEmotionFromSoil = (isDry: boolean): Emotion => {
    return isDry ? "thirsty" : "content"
  }

  // Map raw lux -> simplified light level (0..3)
  // Increased sensitivity: smaller lux changes move levels.
  const luxToLevel = (lux: number): number => {
    if (lux <= 10) return 0
    if (lux <= 200) return 1
    if (lux <= 2000) return 2
    return 3
  }

  const startCooldown = (sec: number) => {
    if (cooldownTimerRef.current) window.clearInterval(cooldownTimerRef.current)
    setCooldownLeft(sec)

    cooldownTimerRef.current = window.setInterval(() => {
      setCooldownLeft(prev => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) window.clearInterval(cooldownTimerRef.current)
          cooldownTimerRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // ========== 相機：叫樹莓派拍照 ==========
  const captureFromPi = async () => {
    if (!API_BASE) return
    setCameraBusy(true)
    setCameraErr(null)

    try {
      const res = await fetch(`${API_BASE}/camera/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-api-key": WATER_API_KEY ?? "",
        },
      })

      const data = await res.json().catch(() => ({} as any))
      if (!res.ok || data.ok === false) {
        setCameraErr(data?.error || `capture failed: ${res.status}`)
        return
      }

      // 後端回傳 { ok: true, url: "/photos/xxx.jpg" }
      const full = `${API_BASE}${data.url}`
      setPhotoUrl(full)
      setCameraMode("photo")
      // ❤️ 拍照獲得愛心
      setHearts(prev => ({ ...prev, photo: true }))
    } catch (e: any) {
      setCameraErr(e?.message || "capture error")
    } finally {
      setCameraBusy(false)
    }
  }

  // ========== 後端狀態輪詢 ==========
  useEffect(() => {
    if (!API_BASE) {
      console.warn("⚠️ NEXT_PUBLIC_API_BASE is not set. Please set it in frontend .env.local")
      return
    }

    let cancelled = false

    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/status`, { cache: "no-store" })
        if (!res.ok) return

        const data: StatusPayload = await res.json()
        if (cancelled) return

        // 數值更新
        if (typeof data.humidity === "boolean") setSoilHumidity(data.humidity)
        if (typeof data.env_humi === "number") setEnvHumidity(data.env_humi)
        if (typeof data.temperature === "number") setTemperature(data.temperature)

        const lux = Number(data.light ?? 0)
        setLightLevel(luxToLevel(lux))

        // touch edge trigger：false -> true
        const touched = !!data.touch
        const lastTouch = lastTouchRef.current

        if (touched && !lastTouch) {
          setEmotion("happy")
          // ❤️ 觸摸獲得愛心
          setHearts(prev => ({ ...prev, touch: true }))
          window.setTimeout(() => {
            setEmotion(prev => (prev === "happy" ? deriveEmotionFromSoil(data.humidity) : prev))
          }, 1200)
        }
        lastTouchRef.current = touched

        // 土壤乾->濕 edge：顯示澆水動畫提示
        const prevSoil = lastSoilHumidityRef.current
        const nowSoil = data.humidity
        // ✅ 只有在 prevSoil 不是 undefined 時才檢查邊緣觸發
        // ✅ humidity: true=乾、false=濕，所以乾→濕是 prevSoil(true) && !nowSoil(false)
        if (prevSoil !== undefined && prevSoil && !nowSoil) {
          playWaterSound()
          setIsWatering(true)
          isWateringRef.current = true
          setEmotion("happy")
          // ❤️ 澆水獲得愛心
          setHearts(prev => ({ ...prev, water: true }))

          if (waterTimeoutRef.current !== null) window.clearTimeout(waterTimeoutRef.current)
          waterTimeoutRef.current = window.setTimeout(() => {
            setIsWatering(false)
            isWateringRef.current = false

            setEmotion(deriveEmotionFromSoil(nowSoil))
            lastEmotionSetTimeRef.current = Date.now()
            waterTimeoutRef.current = null
          }, 5000)
        }
        lastSoilHumidityRef.current = nowSoil

        // 平常情緒跟著土壤（避免覆蓋剛剛 happy 或動畫中的 excited）
        const timeSinceLastSet = Date.now() - lastEmotionSetTimeRef.current
        if (!isWateringRef.current && !touched && !isPlayingAnimationRef.current && timeSinceLastSet > 3500) {
          setEmotion(prev => {
            if (prev === "happy" || prev === "excited") return prev
            return deriveEmotionFromSoil(data.humidity)
          })
        }
      } catch {
        // ignore
      }
    }

    fetchStatus()
    const id = window.setInterval(fetchStatus, 800)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [API_BASE])

  // ========== 澆水 ==========
  const handleWater = async () => {
    if (!API_BASE) return
    if (cooldownLeft > 0) return

    playWaterSound()
    setIsWatering(true)
    isWateringRef.current = true
    setEmotion("happy")

    try {
      const res = await fetch(`${API_BASE}/water`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-api-key": WATER_API_KEY ?? "",
        },
        body: new URLSearchParams({ sec: "2" }),
      })

      const data: any = await res.json().catch(() => ({}))

      if (res.status === 429 && data?.error === "cooldown") {
        startCooldown(60)
        return
      }

      if (!res.ok || data?.ok === false) {
        console.error("water failed:", res.status, data)
        return
      }

      // ❤️ 澆水獲得愛心
      setHearts(prev => ({ ...prev, water: true }))
      startCooldown(60)
    } catch (err) {
      console.error("water error", err)
    } finally {
      if (waterTimeoutRef.current !== null) window.clearTimeout(waterTimeoutRef.current)

      waterTimeoutRef.current = window.setTimeout(() => {
        setIsWatering(false)
        isWateringRef.current = false
        setEmotion(deriveEmotionFromSoil(soilHumidity))
        lastEmotionSetTimeRef.current = Date.now()
        waterTimeoutRef.current = null
      }, 5000)
    }
  }

  const handleTouch = () => {
    setEmotion("happy")
    // ❤️ 觸摸獲得愛心（重複邏輯，此處保留以防手動觸摸按鈕）
    setHearts(prev => ({ ...prev, touch: true }))
    window.setTimeout(() => setEmotion(deriveEmotionFromSoil(soilHumidity)), 1200)
  }

  const handleCallInsects = () => {
    // 防止在動畫進行中重複觸發
    if (isPlayingAnimationRef.current) return
    setShowInsects(true)
    setIsPlayingAnimation(true)
    isPlayingAnimationRef.current = true
    setEmotion("excited")
    lastEmotionSetTimeRef.current = Date.now()
    // 🦋 標記今天已經招過蜂引過蝶
    setHasCalledInsectsToday(true)
  }

  // keep a stable callback identity so child animation effect doesn't restart
  useEffect(() => {
    soilHumidityRef.current = soilHumidity
  }, [soilHumidity])

  const handleAnimationComplete = useCallback(() => {
    setShowInsects(false)
    setIsPlayingAnimation(false)
    isPlayingAnimationRef.current = false
    // ❤️ 愛心保持滿的，不清空（一天只能解一次任務）
    // ⏸️ 等待每日重置時再清空
    setEmotion(deriveEmotionFromSoil(soilHumidityRef.current))
    lastEmotionSetTimeRef.current = Date.now()
  }, [])

  return (
    <div className="min-h-screen bg-plant-bg flex items-center justify-center p-4">
  {/* phone frame applied only on md+; mobile gets a plain full-width layout */}
  {/* slightly taller on mobile so user can scroll and collapse the URL area */}
  <div className="w-full max-w-md bg-plant-bg relative overflow-hidden flex flex-col p-4 min-h-[760px] md:aspect-[9/19.5] md:rounded-[3rem] md:shadow-2xl md:border-8 md:border-black md:scale-[0.82] md:origin-center">
        {/* status bar removed for mobile: simplified layout (simulated time/battery removed) */}

        {/* 上方中間：相機按鈕 */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
          <button
            onClick={() => {
              setCameraOpen(true)
              setCameraErr(null)
              setCameraMode("preview")
              // 如果你想每次打開都清掉上一張照片，就打開下面這行
              // setPhotoUrl(null)
            }}
            className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center border-2 border-plant-border hover:scale-110 active:scale-95 transition"
            aria-label="相機"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M4 7h3l2-2h6l2 2h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z"
              />
              <circle cx="12" cy="13" r="3.2" strokeWidth={2.2} />
            </svg>
          </button>

          {/* ❤️ 三顆愛心 - 相機下方 */}
          <div className="flex gap-3 mt-1">
            {/* 拍照 */}
            <div className="flex flex-col items-center gap-1">
              <svg 
                className={`w-6 h-6 transition-all duration-300 ${hearts.photo ? 'scale-110' : ''}`}
                viewBox="0 0 24 24"
                style={{ fill: hearts.photo ? '#E65C5C' : '#D1D5DB' }}
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>

            {/* 澆水 */}
            <div className="flex flex-col items-center gap-1">
              <svg 
                className={`w-6 h-6 transition-all duration-300 ${hearts.water ? 'scale-110' : ''}`}
                viewBox="0 0 24 24"
                style={{ fill: hearts.water ? '#E65C5C' : '#D1D5DB' }}
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>

            {/* 觸摸 */}
            <div className="flex flex-col items-center gap-1">
              <svg 
                className={`w-6 h-6 transition-all duration-300 ${hearts.touch ? 'scale-110' : ''}`}
                viewBox="0 0 24 24"
                style={{ fill: hearts.touch ? '#E65C5C' : '#D1D5DB' }}
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-between py-4 px-6 overflow-visible">
          {isWatering && <WaterDrops />}
          {showInsects && <ButterflyBeeAnimation onComplete={handleAnimationComplete} />}

          {/* 左上角太陽 */}
          {lightLevel > 0 && (
            <div className="absolute top-20 left-6 z-20">
              <svg
                className={`w-8 h-8 transition-all duration-500 ${
                  lightLevel === 1
                    ? "text-gray-400 opacity-50"
                    : lightLevel === 2
                    ? "text-gray-600 opacity-75"
                    : "text-black opacity-100"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="4" strokeWidth="2" />
                <path
                  d="M12 1v3m0 16v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M1 12h3m16 0h3M4.22 19.78l2.12-2.12M18.36 5.64l2.12-2.12"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}

          <TopToolbar
            selectedPlant={plantType}
            selectedPot={potType}
            onSelectPlant={setPlantType}
            onSelectPot={setPotType}
          />

          <div className="flex-1 flex items-center justify-center w-full min-h-[400px] overflow-visible pt-4">
            <PlantCharacter emotion={emotion} plantType={plantType} potType={potType} />
          </div>

          <div className="w-full space-y-6">
            <ControlButtons
              onWater={handleWater}
              onTouch={handleTouch}
              disabled={cooldownLeft > 0 || isWatering}
              waterHint={cooldownLeft > 0 ? `冷卻 ${cooldownLeft}s` : undefined}
            />

            <div className="flex justify-center gap-4">
              <SensorDisplay type="env_humi" value={envHumidity} label="空氣濕度" />
              <SensorDisplay type="temperature" value={temperature} label="溫度" />
            </div>
          </div>

          {/* 招蜂引蝶按鈕 - 只有三顆都滿才能按，且今天還沒招過 */}
          {hearts.photo && hearts.water && hearts.touch && !isPlayingAnimation && !hasCalledInsectsToday && (
            <div className="w-full mt-4">
              <button
                onClick={handleCallInsects}
                style={{ backgroundColor: 'color-mix(in oklab, var(--plant-border) 85%, var(--plant-accent) 15%)' }}
                className="w-full py-3 text-white rounded-2xl font-medium shadow-lg transition-all duration-300 hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>play</span>
              </button>
            </div>
          )}
        </div>

        {/* ✅ 相機 Modal（方案B：預覽串流 + 拍照） */}
        {cameraOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl p-4 shadow-xl border">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium">相機</div>
                <button
                  className="text-sm text-gray-600 hover:text-black"
                  onClick={() => {
                    setCameraOpen(false)
                    setCameraErr(null)
                  }}
                  type="button"
                >
                  關閉
                </button>
              </div>

              <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                {/* 預覽模式：顯示 MJPEG stream */}
                {cameraMode === "preview" && cameraStreamUrl ? (
                  <img
                    src={`${cameraStreamUrl}&t=${Date.now()}`}
                    alt="camera preview"
                    className="w-full h-full object-cover"
                    onError={() => setCameraErr("預覽失敗：後端可能沒有 /camera/stream 或網址/金鑰錯誤")}
                  />
                ) : null}

                {/* 拍照模式：顯示拍到的照片 */}
                {cameraMode === "photo" && photoUrl ? (
                  <img
                    src={`${photoUrl}?t=${Date.now()}`}
                    alt="captured"
                    className="w-full h-full object-cover"
                    onError={() => setCameraErr("照片載入失敗：後端 /photos 靜態路徑可能沒開")}
                  />
                ) : null}

                {/* fallback */}
                {cameraMode === "preview" && !cameraStreamUrl && (
                  <div className="text-sm text-gray-500">API_BASE 或 KEY 未設定</div>
                )}
                {cameraMode === "photo" && !photoUrl && <div className="text-sm text-gray-500">尚未拍照</div>}
              </div>

              {cameraErr && <div className="mt-2 text-xs text-red-600">{cameraErr}</div>}

              <div className="mt-4 flex gap-2">
                {/* 拍照 / 重新拍照 */}
                {cameraMode === "preview" ? (
                  <button
                    onClick={captureFromPi}
                    disabled={cameraBusy}
                    className={`flex-1 py-2 rounded-xl text-white ${
                      cameraBusy ? "bg-gray-400" : "bg-black hover:opacity-90"
                    }`}
                    type="button"
                  >
                    {cameraBusy ? "拍照中..." : "拍照"}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setCameraMode("preview")
                      setCameraErr(null)
                    }}
                    className="flex-1 py-2 rounded-xl text-white bg-black hover:opacity-90"
                    type="button"
                  >
                    重新拍照
                  </button>
                )}

                {/* 完成（只有拍完才可按） */}
                <button
                  onClick={() => setCameraOpen(false)}
                  disabled={cameraMode !== "photo" || !photoUrl}
                  className={`flex-1 py-2 rounded-xl border ${
                    cameraMode === "photo" && photoUrl
                      ? "border-black hover:bg-gray-50"
                      : "border-gray-300 text-gray-400"
                  }`}
                  type="button"
                >
                  完成
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}