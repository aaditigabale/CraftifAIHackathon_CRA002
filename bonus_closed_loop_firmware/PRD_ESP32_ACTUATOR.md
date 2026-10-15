# FirmGen Product Requirements Document (PRD)
## Project: Physical AI Closed-Loop Actuator & Alarm Node
**CraftifAI FirmGen Version:** v0.4.1  
**Target Hardware:** ESP32 DevKit V1 (ESP-IDF v5.5)  
**Hackathon Track:** Closed Loop Bonus Prize (Track A + Track B)  
**Status:** Reviewed and Frozen  

---

### 1. Objective
Create firmware for an ESP32 microcontroller that serves as the physical actuation arm of the PipeGen Workplace Safety Sentinel. Upon receiving high-priority hazard alerts from the vision pipeline via MQTT or UART, the ESP32 drives physical actuators in real time: flashing high-intensity warning strobes, sounding an audible alarm siren, disconnecting power via an Emergency-Stop safety relay, and broadcasting device telemetry over BLE and UART.

---

### 2. Categorized Requirements Matrix

| Req ID | Type | Category | Description | Acceptance Criteria |
|---|---|---|---|---|
| **REQ-01** | Explicit | BLE | Automatically initialize BLE advertising upon device boot. | BLE radio starts within 500ms of boot. |
| **REQ-02** | Explicit | BLE | Device name dynamically formatted as `FirmGen_XX`, where XX is the last 2 hex digits of the ESP32 MAC address. | Advertised name matches `FirmGen_XX` on BLE scanners. |
| **REQ-03** | Explicit | Comms | Connect to Wi-Fi network and subscribe to MQTT topic `safety/sentinel/alerts`. | Subscribed and receiving within 5s of boot. |
| **REQ-04** | Explicit | Serial | Support UART serial command input at 115200 baud for direct wired closed-loop operation. | Parser processes JSON commands over UART. |
| **REQ-05** | Explicit | Actuator | On `CRITICAL` alert: Engage Emergency Stop Relay (GPIO 18) within 20ms to halt machinery. | Relay output pin goes HIGH ($< 20\text{ ms}$). |
| **REQ-06** | Explicit | Actuator | On `CRITICAL` or `WARNING`: Pulse Warning Strobe LED (GPIO 2) at 4 Hz and sound 2.4 kHz piezo buzzer (GPIO 19). | Audible and visual indicators activate. |
| **REQ-07** | Inferred | Fail-Safe | If communications loss exceeds 5.0 seconds during active operation, enter safe fallback mode. | Watchdog enters safe state. |
| **REQ-08** | Inferred | Telemetry | Emit periodic Live Intelligence runtime telemetry (free heap, uptime, actuation count) over UART. | Telemetry emitted every 2 seconds. |

---

### 3. Pin Mapping & Hardware Interface
- **GPIO 2:** Red Warning LED Strobe
- **GPIO 4:** Yellow Caution LED Indicator
- **GPIO 18:** Emergency Stop Relay Output (Active High)
- **GPIO 19:** Piezo Buzzer PWM Output (LEDC Channel 0)
- **UART0 (TX=GPIO 1, RX=GPIO 3):** 115200 8N1 Debug / Control / Telemetry

---

### 4. Review & Sign-Off
- **Requirements Frozen:** Yes
- **Toolchain:** ESP-IDF v5.5
- **FirmGen Path:** Requirements-Driven Build & Traceability Generation
