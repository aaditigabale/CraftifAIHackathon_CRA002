# Product Requirements Document (PRD) — PipeGen Vision Pipeline
## Project: Workplace Safety Sentinel & Hazard Zone Intrusion Detection
**CraftifAI PipeGen Version:** v0.5.1  
**Hackathon Track:** Track A — PipeGen (Perception) + Closed Loop Bonus Prize  

---

### 1. Executive Summary & Objective
Industrial workplaces suffer thousands of preventable injuries annually caused by workers entering automated machinery work envelopes or failing to wear required Personal Protective Equipment (PPE). Standard CCTV systems are passive recording devices that do not prevent incidents in real time.

The **Workplace Safety Sentinel** is an edge-accelerated Physical AI system generated with **CraftifAI PipeGen v0.5.1**. It observes live camera feeds, detects humans and PPE items, enforces geometric hazard zones, and immediately publishes structured alerts over MQTT and serial buses to physical microcontrollers (ESP32) that activate physical warning sirens and machinery kill-switches.

---

### 2. Five-Stage PipeGen Architecture
1. **Stage 1 (Requirement):** Specification of hazard boundaries, PPE compliance rules, and latency/power budgets.
2. **Stage 2 (Pipeline IR):** Directed Acyclic Graph (DAG) intermediate representation connecting DeepStream elements: Video In $\rightarrow$ Decoder $\rightarrow$ StreamMux $\rightarrow$ Inference (TensorRT YOLOv8) $\rightarrow$ Tracker $\rightarrow$ Spatial Analytics $\rightarrow$ OSD $\rightarrow$ MQTT Message Broker $\rightarrow$ File Incident Logger.
3. **Stage 3 (Model):** YOLOv8s-Safety model registered from CraftifAI catalog / Deep Search, trained on 15,000 industrial safety images across 5 classes (`person`, `hard_hat`, `safety_vest`, `no_hard_hat`, `no_safety_vest`).
4. **Stage 4 (Compiler):** Multi-precision TensorRT 8.6 compilation pipeline generating FP32, FP16, and INT8 calibration engines with full latency, speed, and memory benchmark reports.
5. **Stage 5 (Run):** Deployment via native DeepStream app configs, `run.sh` script, live RTSP/video streaming, and real-time MQTT incident telemetry.

---

### 3. Spatial Hazard Zone Definitions
- **Red Zone (Alpha) — High-Voltage Robotic Arm Perimeter:**
  - Polygon Coordinates: `[(520, 280), (840, 280), (920, 680), (460, 680)]`
  - Rule: **Strict Keep-Out**. Any human entry immediately triggers a Critical Severity 1 alarm.
- **Yellow Zone (Beta) — Conveyor & Forklift Crossing:**
  - Polygon Coordinates: `[(120, 400), (450, 400), (420, 700), (80, 700)]`
  - Rule: **PPE Mandatory**. Dwell time $> 3.0$ seconds without hard hat or safety vest triggers a Warning Severity 2 alarm.
- **Tripwire Line (Gamma) — Safety Threshold Perimeter:**
  - Segment: `[(480, 200) -> (480, 720)]`
  - Rule: Directional crossing detection (Left-to-Right entry into restricted area).

---

### 4. Actionable Output Specifications
1. **MQTT Telemetry Feed:**
   - Broker Topic: `safety/sentinel/alerts`
   - Quality of Service (QoS): 1
   - Publishing Rate: Immediate on event ($< 25\text{ ms}$ processing time)
   - Payload Format: JSON schema containing timestamp, track_id, violation_type, bbox, confidence, and recommended action.
2. **JSON Incident Log:**
   - Local persistent append-only storage in `incidents/incident_log_YYYYMMDD.json`
3. **Hardware Actuator Protocol (Closed Loop):**
   - Serial/UART baud rate: `115200`
   - Command schema: `{"cmd":"ALARM","zone":"ALPHA","severity":1,"relay":1}\n`

---

### 5. Acceptance Criteria
| ID | Requirement | Acceptance Metric | Validation Method |
|---|---|---|---|
| **AC-01** | Full 5-stage PipeGen flow executed | All 5 stage directories & artifacts generated | Automated pipeline validation script |
| **AC-02** | TensorRT Engine Compilation | Verified TRT engine file with speed report | PipeGen trtexec benchmark analyzer |
| **AC-03** | Inference throughput | $\ge 30\text{ FPS}$ (Target: $> 100\text{ FPS}$) | Real-time DeepStream pipeline counter |
| **AC-04** | Hazard zone detection latency | $\le 50\text{ ms}$ from frame capture to alert | End-to-end timestamp delta |
| **AC-05** | Closed-loop hardware actuation | ESP32 responds physically within $100\text{ ms}$ | Physical strobe/buzzer activation |
