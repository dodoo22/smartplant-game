# 智慧植物照護系統 SmartPlant game
Iot final project

---

## 目錄
1. [專案介紹](#專案介紹)
2. [系統架構](#系統架構)
3. [硬體設備與接線說明](#硬體設備與接線說明)
4. [系統功能說明](#系統功能說明)
5. [檔案結構說明](#檔案結構說明)
6. [安裝與執行方式](#安裝與執行方式)
7. [測試方式](#測試方式)
8. [未來改進方向](#未來改進方向)

---

## 專案介紹
本專案為一套以 Raspberry Pi 為核心的智慧植物照護系統，
透過多種感測器即時蒐集植物生長環境數據，
並結合自動澆水互動式回饋機制。目的是可以類似複製一個植物的虛擬分身到遊戲裡，讓他在遊戲中回饋在現實中無法達到的互動及情緒價值。
本系統主要應用於：
- 初學者植物照護
- 中小學自然科科教育互動
- IoT 與嵌入式系統學習

---

## 系統架構
[ Browser (Next.js) ]
        │
        │ HTTP (REST API)
        ▼
[ Flask Backend (Raspberry Pi) ]
        │
        ├── Sensors (GPIO / I2C)
        ├── Relay Control
        ├── Camera (libcamera)
        ▼
[ Physical World ]
  ├─ Plant
  ├─ Soil
  └─ Water Pump

---

## 硬體設備與接線說明
本系統使用之主要硬體設備如下：

- Raspberry Pi 4
- 溫溼度感測器 DHT22
- 土壤濕度感測器 Soil Moisture Sensor (DO)
- 光照感測器 BH1750
- 觸控感測器 TTP223
- 繼電器模組 FL-3FF-S-Z
- 水泵 12V pump
- 攝影機模組 Raspberry Pi Camera

各感測器皆透過 GPIO 腳位與 Raspberry Pi 連接，
電源統一由 3.3V 或 5V 提供，並共用 GND。

---

## 系統功能說明
系統主要功能包括：

- 即時感測
	•	溫度 / 空氣濕度（DHT11）
	•	土壤濕度（Soil Moisture Sensor）
	•	光照強度（BH1750 I2C）
	•	觸控互動（Touch Sensor）
- 實體澆水控制
	•	Web 按鈕 → Raspberry Pi → Relay → 12V 水幫浦
	•	具備每日澆水上限與冷卻時間（Cooldown）
	•	互動式前端介面
- 植物情緒狀態（口渴 / 開心 / 滿足 / 興奮）
	•	澆水動畫、觸控加分、滿意度系統
	•	Web UI 與實體感測同步
- 相機拍照功能
	•	Raspberry Pi Camera Module
	•	從前端觸發拍照並顯示照片
- API Key 保護
	•	澆水 / 拍照 API 需驗證金鑰



---

## 檔案結構說明
```text
project/
│
├─ main.py              # 主程式
├─ test_dht22.py        # 溫溼度感測測試
├─ test_soil_do.py      # 土壤濕度感測測試
├─ test_relay.py        # 繼電器測試
├─ test_pump.py         # 水泵測試
├─ README.md
