# SmartPlant Game

<p align="center">
  <b>把真實植物變成會互動的虛擬夥伴。</b><br/>
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

# 中文版

## 專案介紹

SmartPlant 是一套以 Raspberry Pi 為核心的智慧植物互動系統。

與一般只顯示溫度、濕度與土壤數值的智慧盆栽不同，本專案希望替真實植物建立一個「虛擬分身」。Raspberry Pi 會蒐集溫度、空氣濕度、土壤濕度、光照與觸碰等資訊，再由網頁將這些真實世界的訊號轉換成虛擬植物的狀態與情緒回饋。

主要互動包括：

- 土壤乾燥時，虛擬植物會顯示口渴狀態
- 觸碰真實植物時，虛擬植物會產生互動反應
- 在網頁按下澆水按鈕後，實體水泵會啟動
- 可直接從網頁觸發 Raspberry Pi Camera 拍照
- 將真實感測資料轉換成虛擬植物的情緒狀態

SmartPlant 不只是顯示感測數值，而是希望讓植物照護變得更有互動感與情緒連結。

> **一個屬於真實植物的虛擬寵物。**

---

## 展示影片

<p align="center">
  <a href="https://youtu.be/a2GsV1feKWs">
    <img src="images/video.jpg" width="820" alt="SmartPlant demo video">
  </a>
</p>

點擊上方圖片即可觀看 Demo。

---

## 主要功能

| 功能 | 說明 |
|---|---|
| 環境感測 | 使用 DHT22 讀取溫度與空氣濕度 |
| 土壤監測 | 使用土壤濕度感測器偵測乾濕狀態 |
| 光照感測 | 使用 BH1750 量測環境光照 |
| 觸碰互動 | 使用 TTP223 偵測植物被觸碰 |
| 遠端澆水 | 網頁 → Raspberry Pi → Relay → 12V 水泵 |
| 澆水保護 | 每日澆水上限與冷卻時間 |
| 植物情緒系統 | 將感測資料轉換成口渴、開心、滿足、興奮等狀態 |
| 相機控制 | 從網頁觸發 Raspberry Pi Camera 拍照 |
| API 保護 | 澆水與拍照功能需通過 API Key 驗證 |
| 互動式網頁 | Next.js 介面與實體感測資料同步 |

---

## 系統架構

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

前端透過 Flask REST API 讀取 Raspberry Pi 的感測資料，並將真實世界的狀態轉換成虛擬植物的互動狀態。使用者也可以透過網頁反向控制實體裝置，例如啟動水泵或相機。

---

## 硬體設備

- Raspberry Pi 4
- DHT22 溫溼度感測器
- Soil Moisture Sensor 土壤濕度感測器
- BH1750 光照感測器
- TTP223 觸控感測器
- FL-3FF-S-Z 繼電器模組
- 12V DC 水泵
- Raspberry Pi Camera

### 線路圖

<p align="center">
  <img src="images/howtoelectric.PNG" width="820" alt="SmartPlant wiring diagram">
</p>

### 接線表

| 功能 | 元件 | GPIO (BCM) | 實體腳位 | 電源 | GND | 備註 |
|---|---|---:|---:|---|---|---|
| 溫溼度感測 | DHT22 | GPIO4 | Pin 7 | 3.3V | GND | 單線通訊 |
| 土壤濕度感測 | Soil Moisture Sensor (DO) | GPIO17 | Pin 11 | 3.3V | GND | 數位乾濕輸出 |
| 光照感測 | BH1750 | GPIO2 / GPIO3 | Pin 3 / 5 | 3.3V | GND | I2C |
| 觸碰感測 | TTP223 | GPIO22 | Pin 15 | 3.3V | GND | 觸碰時輸出 HIGH |
| 繼電器控制 | FL-3FF-S-Z | GPIO27 | Pin 13 | 5V | GND | Active-low |
| 水泵 | 12V DC Pump | Relay 控制 | — | 外接 12V | 共地 | 不可直接接 GPIO |
| 攝影機 | Raspberry Pi Camera | CSI | 排線 | — | — | 使用 CSI 介面 |

---

## 技術架構

### 後端

- Python 3.11+
- Flask
- RPi.GPIO
- libcamera
- Flask-CORS
- python-dotenv

### 前端

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

---

## 專案結構

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

## 安裝與執行

### 1. 環境變數

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

> 請勿將真實 API Key 上傳到公開 Repository。

### 2. 後端

```bash
cd backend

python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
python app.py
```

### 3. 前端

```bash
cd frontend

npm install
npm run dev
```

---

## API 範例

### 查看感測狀態

```bash
curl http://<PI_IP>:8000/status
```

### 觸發澆水

```bash
curl -X POST http://<PI_IP>:8000/water \
  -H "x-api-key: YOUR_KEY" \
  -d "sec=2"
```

### 拍照

```bash
curl -X POST http://<PI_IP>:8000/camera/capture \
  -H "x-api-key: YOUR_KEY"
```

---

## 硬體測試

| 檔名 | 用途 | 測試內容 |
|---|---|---|
| `test_dht22.py` | DHT22 感測器測試 | 讀取溫度與濕度 |
| `test_pump.py` | 水泵 / Relay 控制 | 短時間啟動水泵並安全釋放 GPIO |
| `test_relay.py` | Relay 切換測試 | 測試 HIGH / LOW 切換 |
| `test_soil_do.py` | 土壤感測器測試 | 讀取數位乾濕狀態 |

---

## 為什麼做這個專案？

大多數智慧植物專案著重在感測器數據與監控儀表板，但 SmartPlant 想探索另一個方向：

**如果植物能用虛擬角色表達自己的狀態呢？**

透過將實體感測資料轉換成虛擬角色，本專案結合了：

**IoT + 嵌入式系統 + Web 開發 + 人機互動 + 遊戲化回饋**

可能的應用方向包括：

- 植物照護初學者
- 中小學自然科互動學習
- 遠距植物照護
- IoT 與嵌入式系統教學
- 數位分身與虛擬寵物應用

---

## 未來改進方向

- [ ] 使用 ADC 將土壤濕度改為類比量測
- [ ] 顯示土壤濕度百分比
- [ ] 支援不同植物的濕度需求設定
- [ ] 改善 Relay 硬體與控制穩定性
- [ ] 分析 Raspberry Pi Camera 拍攝的植物影像
- [ ] 辨識葉片顏色與枯萎狀態
- [ ] 結合影像與感測器資料進行植物健康評估
- [ ] 擴充虛擬植物動畫與情緒系統

---

## 參考資料

1. Raspberry Pi Powered IoT Garden — Instructables  
   https://www.instructables.com/Raspberry-Pi-Powered-IOT-Garden/

2. Building Smarter Farming Irrigation with Raspberry Pi and IoT — Raspberry Pi Foundation  
   https://www.raspberrypi.com/news/building-smarter-farming-irrigation-with-raspberry-pi-and-iot/

3. The Application of Touch Sensor — YouTube  
   https://www.youtube.com/watch?v=wPbU09bvwr0

---

# English Version

## Overview

SmartPlant is a Raspberry Pi based interactive plant-care system that turns a physical plant into a **digital companion**.

Unlike typical smart-plant projects that mainly display sensor values, SmartPlant mirrors the condition of a real plant into an interactive web experience. Raspberry Pi collects temperature, humidity, soil moisture, ambient light, and touch data, then translates those signals into visible moods and reactions.

Main interactions include:

- Dry soil makes the virtual plant appear thirsty
- Touching the real plant triggers a reaction in the virtual plant
- Pressing the watering button in the web UI activates the real water pump
- The Raspberry Pi Camera can be triggered directly from the browser
- Real-world sensor data is converted into virtual emotional states

SmartPlant aims to make plant care feel more interactive and emotionally engaging.

> **A real-world Tamagotchi for plants.**

---

## Demo

<p align="center">
  <a href="https://youtu.be/a2GsV1feKWs">
    <img src="images/video.jpg" width="820" alt="SmartPlant demo video">
  </a>
</p>

Click the image above to watch the demo.

---

## Features

| Feature | Description |
|---|---|
| Environment sensing | Temperature and air humidity via DHT22 |
| Soil monitoring | Detects dry/wet soil using a soil moisture sensor |
| Light sensing | Measures ambient light with BH1750 |
| Touch interaction | TTP223 lets the physical plant respond to touch |
| Remote watering | Browser → Raspberry Pi → Relay → 12V pump |
| Watering protection | Daily watering limit and cooldown |
| Plant mood system | Thirsty, happy, satisfied, excited and other states |
| Camera control | Trigger photos using Raspberry Pi Camera |
| Protected actions | Watering and camera APIs require an API key |
| Interactive web UI | Next.js interface synchronized with physical sensors |

---

## How It Works

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

---

## Hardware

- Raspberry Pi 4
- DHT22 temperature / humidity sensor
- Soil Moisture Sensor
- BH1750 light sensor
- TTP223 touch sensor
- FL-3FF-S-Z relay module
- 12V DC water pump
- Raspberry Pi Camera

### Wiring Diagram

<p align="center">
  <img src="images/howtoelectric.PNG" width="820" alt="SmartPlant wiring diagram">
</p>

### Wiring Table

| Function | Component | GPIO (BCM) | Physical Pin | Power | GND | Notes |
|---|---|---:|---:|---|---|---|
| Temperature / humidity | DHT22 | GPIO4 | Pin 7 | 3.3V | GND | Single-wire communication |
| Soil moisture | Soil Moisture Sensor (DO) | GPIO17 | Pin 11 | 3.3V | GND | Digital dry/wet output |
| Light | BH1750 | GPIO2 / GPIO3 | Pin 3 / 5 | 3.3V | GND | I2C |
| Touch | TTP223 | GPIO22 | Pin 15 | 3.3V | GND | HIGH when touched |
| Relay | FL-3FF-S-Z | GPIO27 | Pin 13 | 5V | GND | Active-low |
| Water pump | 12V DC Pump | Relay controlled | — | External 12V | Common GND | Do not connect directly to GPIO |
| Camera | Raspberry Pi Camera | CSI | Ribbon cable | — | — | Uses CSI instead of GPIO |

---

## Tech Stack

### Backend

- Python 3.11+
- Flask
- RPi.GPIO
- libcamera
- Flask-CORS
- python-dotenv

### Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

---

## Project Structure

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

## Setup

### 1. Environment Variables

Create your own `.env` file for the backend.

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

### 2. Backend

```bash
cd backend

python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
python app.py
```

### 3. Frontend

```bash
cd frontend

npm install
npm run dev
```

---

## API Examples

### Read sensor status

```bash
curl http://<PI_IP>:8000/status
```

### Water the plant

```bash
curl -X POST http://<PI_IP>:8000/water \
  -H "x-api-key: YOUR_KEY" \
  -d "sec=2"
```

### Capture a photo

```bash
curl -X POST http://<PI_IP>:8000/camera/capture \
  -H "x-api-key: YOUR_KEY"
```

---

## Hardware Tests

| File | Purpose | Test |
|---|---|---|
| `test_dht22.py` | DHT22 sensor test | Reads temperature and humidity |
| `test_pump.py` | Pump / relay control | Starts the pump briefly and safely releases GPIO |
| `test_relay.py` | Relay switching | Verifies HIGH / LOW relay behavior |
| `test_soil_do.py` | Soil sensor | Reads digital dry / wet state |

---

## Why This Project?

Most smart-plant projects focus on dashboards and sensor values.

SmartPlant explores a different idea:

**What if the plant could express how it feels?**

By turning physical sensor data into a virtual character, the project combines:

**IoT + Embedded Systems + Web Development + Human-Computer Interaction + Game-like Feedback**

Potential use cases include:

- Beginner-friendly plant care
- Interactive science education
- Remote plant monitoring
- IoT and embedded-system learning
- Digital twin / virtual-pet experiments

---

## Roadmap

- [ ] Replace digital soil sensing with analog measurement through an ADC
- [ ] Show soil moisture as a percentage
- [ ] Support moisture thresholds for different plant species
- [ ] Improve relay hardware and control reliability
- [ ] Analyze plant images from the Raspberry Pi Camera
- [ ] Detect leaf color or wilting
- [ ] Combine image and sensor data for plant-health estimation
- [ ] Expand the virtual plant's animation and emotion system

---

## References

1. Raspberry Pi Powered IoT Garden — Instructables  
   https://www.instructables.com/Raspberry-Pi-Powered-IOT-Garden/

2. Building Smarter Farming Irrigation with Raspberry Pi and IoT — Raspberry Pi Foundation  
   https://www.raspberrypi.com/news/building-smarter-farming-irrigation-with-raspberry-pi-and-iot/

3. The Application of Touch Sensor — YouTube  
   https://www.youtube.com/watch?v=wPbU09bvwr0

---

## Support

If you find SmartPlant interesting, feel free to **Star this repository**.

It helps more people discover the project and supports future improvements.
