# SmartPlant Game

<p align="center">
  <b>Turn your real plant into a virtual pet.</b><br/>
  <b>把真實植物變成會互動的虛擬夥伴。</b>
</p>

<p align="center">
  A Raspberry Pi powered IoT plant-care game that mirrors a real plant's condition into an interactive web experience.<br/>
  透過 Raspberry Pi 與多種感測器，將真實植物的狀態同步到互動式網頁遊戲中。
</p>

<p align="center">
  <img alt="Raspberry Pi" src="https://img.shields.io/badge/Raspberry%20Pi-IoT-C51A4A?logo=raspberrypi&logoColor=white">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-Frontend-000000?logo=nextdotjs&logoColor=white">
  <img alt="Flask" src="https://img.shields.io/badge/Flask-Backend-000000?logo=flask&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-Web-3178C6?logo=typescript&logoColor=white">
</p>

<p align="center">
  <img src="images/helloplant.JPG" width="820" alt="SmartPlant device">
</p>

---

## Overview｜專案介紹

SmartPlant turns a physical plant into a small **digital companion**.

A Raspberry Pi collects real-world sensor data such as temperature, humidity, soil moisture, light, and touch interaction. The web application converts those signals into a virtual plant with visible moods and reactions.

SmartPlant 將真實植物轉化成一個可互動的 **虛擬植物分身**。

Raspberry Pi 會蒐集溫度、空氣濕度、土壤濕度、光照與觸碰等資訊，再由網頁將這些真實世界的訊號轉換成虛擬植物的狀態與情緒回饋。

- Dry soil → the virtual plant becomes thirsty  
  土壤乾燥 → 虛擬植物會顯示口渴狀態
- Touch the real plant → the virtual plant reacts  
  觸碰真實植物 → 虛擬植物會產生互動反應
- Press the water button → the real water pump activates  
  在網頁按下澆水按鈕 → 實體水泵啟動
- Trigger the Raspberry Pi Camera from the browser  
  可直接從網頁觸發 Raspberry Pi Camera 拍照
- Real-world sensor data → virtual emotional state  
  真實感測資料 → 轉換成虛擬植物情緒狀態

Instead of displaying sensor values only, SmartPlant makes plant care more interactive and emotionally engaging.

SmartPlant 不只是顯示感測數值，而是希望讓植物照護變得更有互動感與情緒連結。

> **A real-world Tamagotchi for plants.**  
> **一個屬於真實植物的虛擬寵物。**

---

## Demo｜展示影片

<p align="center">
  <a href="https://youtu.be/a2GsV1feKWs">
    <img src="images/video.jpg" width="820" alt="SmartPlant demo video">
  </a>
</p>

Click the image above to watch the demo.  
點擊上方圖片即可觀看 Demo。

---

## Features｜主要功能

| Feature 功能 | Description 說明 |
|---|---|
| Environment sensing 環境感測 | Temperature and air humidity via DHT22 / 使用 DHT22 讀取溫度與空氣濕度 |
| Soil monitoring 土壤監測 | Detects dry/wet soil using a soil moisture sensor / 偵測土壤乾濕狀態 |
| Light sensing 光照感測 | Measures ambient light with BH1750 / 使用 BH1750 量測環境光照 |
| Touch interaction 觸碰互動 | TTP223 allows physical touch interaction / 使用 TTP223 偵測植物被觸碰 |
| Remote watering 遠端澆水 | Browser → Raspberry Pi → Relay → 12V pump / 從網頁控制實體水泵 |
| Watering protection 澆水保護 | Daily watering limit and cooldown / 每日澆水上限與冷卻時間 |
| Plant mood system 植物情緒系統 | Thirsty, happy, satisfied, excited and other states / 將感測資料轉換成不同情緒 |
| Camera control 相機控制 | Trigger Raspberry Pi Camera from the browser / 從網頁觸發拍照 |
| Protected actions API 保護 | Watering and camera APIs require an API key / 澆水與拍照需 API Key |
| Interactive web UI 互動式網頁 | Next.js interface synchronized with physical sensors / 網頁與實體感測資料同步 |

---

## How It Works｜系統架構

```text
┌─────────────────────────┐
│     Browser / Web UI    │
│     Next.js + React     │
└────────────┬────────────┘
             │ HTTP / REST API
             ▼
┌─────────────────────────┐
│      Flask Backend      │
│      Raspberry Pi 4     │
└────────────┬────────────┘
             │
     ┌───────┼───────────────┐
     ▼       ▼               ▼
  Sensors   Relay          Camera
     │       │               │
     ▼       ▼               ▼
   Plant   Water Pump      Photos
```

The frontend reads sensor data through the Flask REST API and converts physical signals into virtual plant states. User actions from the browser can also affect the physical device, such as activating the water pump or taking a photo.

前端透過 Flask REST API 讀取 Raspberry Pi 的感測資料，並將真實世界的狀態轉換成虛擬植物的互動狀態。使用者也可以透過網頁反向控制實體裝置，例如啟動水泵或相機。

---

## Hardware｜硬體設備

- Raspberry Pi 4
- DHT22 temperature / humidity sensor 溫溼度感測器
- Soil Moisture Sensor 土壤濕度感測器
- BH1750 light sensor 光照感測器
- TTP223 touch sensor 觸控感測器
- FL-3FF-S-Z relay module 繼電器模組
- 12V DC water pump 水泵
- Raspberry Pi Camera 攝影機模組

### Wiring Diagram｜線路圖

<p align="center">
  <img src="images/howtoelectric.PNG" width="820" alt="SmartPlant wiring diagram">
</p>

### Wiring Table｜接線表

| Function 功能 | Component 元件 | GPIO (BCM) | Physical Pin 實體腳位 | Power 電源 | GND | Notes 備註 |
|---|---|---:|---:|---|---|---|
| Temperature / humidity 溫溼度 | DHT22 | GPIO4 | Pin 7 | 3.3V | GND | Single-wire communication 單線通訊 |
| Soil moisture 土壤濕度 | Soil Moisture Sensor (DO) | GPIO17 | Pin 11 | 3.3V | GND | Digital dry/wet output 數位乾濕輸出 |
| Light 光照 | BH1750 | GPIO2 / GPIO3 | Pin 3 / 5 | 3.3V | GND | I2C |
| Touch 觸碰 | TTP223 | GPIO22 | Pin 15 | 3.3V | GND | HIGH when touched |
| Relay 繼電器 | FL-3FF-S-Z | GPIO27 | Pin 13 | 5V | GND | Active-low |
| Water pump 水泵 | 12V DC Pump | Relay controlled | — | External 12V | Common GND | Do not connect directly to GPIO |
| Camera 相機 | Raspberry Pi Camera | CSI | Ribbon cable | — | — | Uses CSI instead of GPIO |

---

## Tech Stack｜技術架構

### Backend 後端

- Python 3.11+
- Flask
- RPi.GPIO
- libcamera
- Flask-CORS
- python-dotenv

### Frontend 前端

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

---

## Project Structure｜專案結構

```text
smartplant/
├── backend/
│   ├── app.py
│   ├── sensors.py
│   ├── pump.py
│   ├── camera.py
│   └── .env
│
├── frontend/
│   ├── app/
│   │   └── page.tsx
│   ├── components/
│   └── public/
│
└── README.md
```

---

## Setup｜安裝與執行

### 1. Environment Variables｜環境變數

Create your own `.env` file for the backend.  
請在後端建立自己的 `.env` 檔案。

```env
MOCK_SENSORS=0
PUMP_MOCK=0

WATER_API_KEY=your_secret_key

PUMP_PIN=27
DHT_PIN=4

DAILY_LIMIT_SEC=30
COOLDOWN_SEC=60
```

> Never commit a real API key to a public repository.  
> 請勿將真實 API Key 上傳到公開 Repository。

### 2. Backend｜後端

```bash
cd backend

python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
python app.py
```

### 3. Frontend｜前端

```bash
cd frontend

npm install
npm run dev
```

---

## API Examples｜API 範例

### Read sensor status｜查看感測狀態

```bash
curl http://<PI_IP>:8000/status
```

### Water the plant｜觸發澆水

```bash
curl -X POST http://<PI_IP>:8000/water \
  -H "x-api-key: YOUR_KEY" \
  -d "sec=2"
```

### Capture a photo｜拍照

```bash
curl -X POST http://<PI_IP>:8000/camera/capture \
  -H "x-api-key: YOUR_KEY"
```

---

## Hardware Tests｜硬體測試

| File 檔名 | Purpose 用途 | Test 測試內容 |
|---|---|---|
| `test_dht22.py` | DHT22 sensor 測試 | Reads temperature and humidity / 讀取溫度與濕度 |
| `test_pump.py` | Pump / relay control 水泵控制 | Starts the pump briefly and safely releases GPIO / 短時間啟動水泵並安全釋放 GPIO |
| `test_relay.py` | Relay switching 繼電器切換 | Verifies HIGH / LOW relay behavior / 測試 HIGH / LOW 切換 |
| `test_soil_do.py` | Soil sensor 土壤感測 | Reads digital dry / wet state / 讀取數位乾濕狀態 |

---

## Why This Project?｜為什麼做這個專案？

Most smart-plant projects focus on dashboards and sensor values.

SmartPlant explores a different idea: **what if the plant could express how it feels?**

大多數智慧植物專案著重在感測器數據與監控儀表板，但 SmartPlant 想探索另一個方向：

**如果植物能用虛擬角色表達自己的狀態呢？**

By turning physical sensor data into a virtual character, the project combines:

**IoT + Embedded Systems + Web Development + Human-Computer Interaction + Game-like Feedback**

透過將實體感測資料轉換成虛擬角色，本專案結合了：

**IoT + 嵌入式系統 + Web 開發 + 人機互動 + 遊戲化回饋**

Potential use cases / 應用方向：

- Beginner-friendly plant care / 植物照護初學者
- Interactive science education / 中小學自然科互動學習
- Remote plant monitoring / 遠距植物照護
- IoT and embedded-system learning / IoT 與嵌入式系統教學
- Digital twin / virtual-pet experiments / 數位分身與虛擬寵物應用

---

## Roadmap｜未來改進方向

- [ ] Replace digital soil sensing with analog measurement through an ADC  
      使用 ADC 將土壤濕度改為類比量測
- [ ] Show soil moisture as a percentage  
      顯示土壤濕度百分比
- [ ] Support moisture thresholds for different plant species  
      支援不同植物的濕度需求設定
- [ ] Improve relay hardware and control reliability  
      改善 Relay 硬體與控制穩定性
- [ ] Analyze plant images from the Raspberry Pi Camera  
      分析 Raspberry Pi Camera 拍攝的植物影像
- [ ] Detect leaf color or wilting  
      辨識葉片顏色與枯萎狀態
- [ ] Combine image and sensor data for plant-health estimation  
      結合影像與感測器資料進行植物健康評估
- [ ] Expand the virtual plant's animation and emotion system  
      擴充虛擬植物動畫與情緒系統

---

## References｜參考資料

1. Raspberry Pi Powered IoT Garden — Instructables  
   https://www.instructables.com/Raspberry-Pi-Powered-IOT-Garden/

2. Building Smarter Farming Irrigation with Raspberry Pi and IoT — Raspberry Pi Foundation  
   https://www.raspberrypi.com/news/building-smarter-farming-irrigation-with-raspberry-pi-and-iot/

3. The Application of Touch Sensor — YouTube  
   https://www.youtube.com/watch?v=wPbU09bvwr0

---

## Support｜支持這個專案

If you find SmartPlant interesting, feel free to **Star this repository**.  
如果你覺得 SmartPlant 有趣，歡迎幫這個 Repository 點一顆 Star。

It helps more people discover the project and supports future improvements.  
這能讓更多人看到這個專案，也會成為我繼續改進它的動力。
