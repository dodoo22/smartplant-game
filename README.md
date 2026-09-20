# 🌱 SmartPlant Game

<p align="center">
  <b>Turn your real plant into a virtual pet.</b><br/>
  A Raspberry Pi powered IoT plant-care game that mirrors your plant's real-world condition into an interactive web experience.
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

## ✨ What is SmartPlant?

SmartPlant turns a physical plant into a small **digital companion**.

The Raspberry Pi collects real-world sensor data such as temperature, humidity, soil moisture, light, and touch interaction. The web game then translates those signals into a virtual plant with visible moods and reactions.

- 💧 Dry soil → the virtual plant becomes thirsty
- 🫳 Touch the real plant → the virtual plant reacts
- 🚿 Press water in the web UI → the real water pump activates
- 📷 Trigger the Raspberry Pi Camera from the browser
- 🌱 Real-world sensor data → virtual emotional state

Instead of showing sensor numbers only, SmartPlant tries to make plant care feel more interactive and emotionally engaging.

> **A real-world Tamagotchi for plants.**

---

## 🎬 Demo

<p align="center">
  <a href="https://youtu.be/a2GsV1feKWs">
    <img src="images/video.jpg" width="820" alt="SmartPlant demo video">
  </a>
</p>

Click the image above to watch the demo.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🌡️ Environment sensing | Temperature and air humidity via DHT22 |
| 💧 Soil monitoring | Detects dry/wet soil using a soil moisture sensor |
| ☀️ Light sensing | Measures ambient light with BH1750 |
| 🫳 Touch interaction | TTP223 lets the physical plant respond to touch |
| 🚿 Remote watering | Browser → Raspberry Pi → Relay → 12V pump |
| 🛡️ Watering protection | Daily watering limit and cooldown protection |
| 🌱 Plant mood system | Thirsty, happy, satisfied, excited and other states |
| 📷 Camera control | Trigger photos using Raspberry Pi Camera |
| 🔑 Protected actions | Watering and camera APIs require an API key |
| 🎮 Interactive web UI | Next.js interface synchronized with physical sensors |

---

## 🧠 How It Works

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

The frontend reads sensor status through the Flask REST API and converts physical signals into the plant's virtual state. Actions from the browser can also affect the physical device, such as activating the water pump or camera.

---

## 🛠️ Hardware

- Raspberry Pi 4
- DHT22 temperature / humidity sensor
- Soil Moisture Sensor (digital output)
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

## 💻 Tech Stack

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

## 📁 Project Structure

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

## ⚙️ Setup

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

## 🔌 API Examples

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

## 🧪 Hardware Tests

| File | Purpose | Test |
|---|---|---|
| `test_dht22.py` | DHT22 sensor | Reads temperature and humidity |
| `test_pump.py` | Pump / relay control | Starts the pump briefly and safely releases GPIO |
| `test_relay.py` | Relay switching | Verifies HIGH / LOW relay behavior |
| `test_soil_do.py` | Soil sensor | Reads digital dry / wet state |

---

## 🌱 Why This Project?

Most smart-plant projects focus on dashboards and sensor values.

SmartPlant explores a different idea: **what if the plant could express how it feels?**

By turning physical sensor data into a virtual character, the project combines:

**IoT + embedded systems + web development + human-computer interaction + game-like feedback**

Potential use cases include:

- Beginner-friendly plant care
- Interactive science education
- Remote plant monitoring
- IoT and embedded-system learning
- Digital twin / virtual-pet experiments

---

## 🗺️ Roadmap

- [ ] Replace digital soil sensing with analog measurement through an ADC
- [ ] Show soil moisture as a percentage
- [ ] Support moisture thresholds for different plant species
- [ ] Improve relay hardware and control reliability
- [ ] Analyze plant images from the Raspberry Pi Camera
- [ ] Detect leaf color or wilting
- [ ] Combine image and sensor data for plant-health estimation
- [ ] Expand the virtual plant's animation and emotion system

---

## 中文介紹

SmartPlant 是一套以 Raspberry Pi 為核心的智慧植物互動系統。

與一般只顯示溫度、濕度與土壤數值的智慧盆栽不同，本專案希望替真實植物建立一個「虛擬分身」。感測器會讀取植物目前的環境狀態，並在網頁中轉換成口渴、開心、滿足、興奮等互動回饋。

使用者也可以從網頁觸發實體澆水與拍照，讓虛擬世界與真實植物互相連動。

這個專案結合了 **IoT、Raspberry Pi、感測器、Flask API、Next.js 與遊戲化互動設計**。

---

## 📚 References

1. Raspberry Pi Powered IoT Garden — Instructables  
   https://www.instructables.com/Raspberry-Pi-Powered-IOT-Garden/

2. Building Smarter Farming Irrigation with Raspberry Pi and IoT — Raspberry Pi Foundation  
   https://www.raspberrypi.com/news/building-smarter-farming-irrigation-with-raspberry-pi-and-iot/

3. The Application of Touch Sensor — YouTube  
   https://www.youtube.com/watch?v=wPbU09bvwr0

---

## ⭐ Like the idea?

If you find SmartPlant interesting, feel free to **Star ⭐ this repository**.

It helps more people discover the project and motivates future improvements.
