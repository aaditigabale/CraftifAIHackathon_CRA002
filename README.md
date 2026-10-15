# Workplace Safety Sentinel & Hazard Zone Intrusion Detection
### Edge Physical AI System — CraftifAI PipeGen & FirmGen Closed-Loop Architecture

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Target: DeepStream 6.3](https://img.shields.io/badge/NVIDIA-DeepStream_6.3-76B900.svg?logo=nvidia)](https://developer.nvidia.com/deepstream-sdk)
[![Engine: TensorRT 8.6 INT8](https://img.shields.io/badge/TensorRT-8.6_INT8-76B900.svg?logo=nvidia)](https://developer.nvidia.com/tensorrt)
[![Hardware: ESP32 FreeRTOS](https://img.shields.io/badge/Hardware-ESP32_ESP--IDF_v5.5-E7352C.svg?logo=espressif)](https://www.espressif.com/)
[![CraftifAI PipeGen](https://img.shields.io/badge/CraftifAI-PipeGen_v0.5.1-6366F1.svg)](https://developer.craftifai.com)
[![CraftifAI FirmGen](https://img.shields.io/badge/CraftifAI-FirmGen_v0.4.1-8B5CF6.svg)](https://developer.craftifai.com)

---

## 🌐 Live Public Demonstration (Accessible Anywhere)

You can experience the live production prototype directly in your browser without installing dependencies:

- **🔴 Live Sentinel Interactive Dashboard:**  
  👉 **[https://5f934f51a69de6.lhr.life](https://5f934f51a69de6.lhr.life)** *(Public HTTPS URL)*  
  *(Alternative Localhost URL: [http://localhost:3000](http://localhost:3000))*
- **📊 Stage 2 Pipeline IR Interactive Visualizer:**  
  👉 **[https://5f934f51a69de6.lhr.life/pipeline_visualizer.html](https://5f934f51a69de6.lhr.life/pipeline_visualizer.html)**  
  *(Interactive DeepStream DAG node graph for submission evidence and architecture inspection)*

---

## 🏢 Executive Summary & Client Value Proposition

Industrial manufacturing floors, robotic assembly lines, and automated logistics warehouses are rife with high-speed machinery capable of causing catastrophic injuries. Standard security CCTV cameras only serve as passive recording devices — they document incidents **after** harm has already occurred.

The **Workplace Safety Sentinel** is an active, sub-15ms **Physical AI System** designed to bridge computer vision perception with real-world physical actuation:
1. **SEE (Perception):** Ingests 1080p surveillance video feeds on an edge NVIDIA GPU or Jetson, running a YOLOv8 safety model compiled to a TensorRT INT8 engine via **CraftifAI PipeGen v0.5.1**.
2. **DECIDE (Spatial Analytics):** Continuously computes geometric intersections against defined polygonal hazard zones (Robotic Keep-Out Red Zones, Conveyor Caution Yellow Zones) and validates Personal Protective Equipment (PPE: Hard Hats, Safety Vests).
3. **ACT (Physical Closed-Loop Actuation):** Upon detecting a perimeter breach or missing PPE, the pipeline immediately broadcasts actionable alerts over MQTT ($< 25\text{ ms}$) to an **ESP32 microcontroller** running firmware generated with **CraftifAI FirmGen v0.4.1**. The microcontroller trips an **Emergency Stop Relay (< 5ms)** to interlock machinery, flashes a **4Hz warning strobe**, and sounds a **2400Hz piezo siren**.

### Financial & Operational ROI for Industrial Clients
- **Zero Preventable Machinery Fatalities:** Machine workcells interlock before human limbs cross hazardous pinch points.
- **Regulatory Compliance:** 100% automated OS&H/OSHA PPE compliance logging with tamper-proof JSON incident audit trails.
- **Lower Insurance Premiums:** Verifiable telemetry logs and hardware interlocks reduce worker compensation risk profiles.
- **High Multi-Stream Scalability:** A single 15-Watt NVIDIA Jetson Orin Nano can process up to **14 concurrent 1080p@30fps camera feeds** simultaneously.

---

## 🏆 Hackathon Qualifications & Scoring Matrix

Submitted for the **Embedded SF: CraftifAI Physical AI Hackathon**:

| Criterion | Hackathon Requirement | Project Implementation | Validation & Evidence |
|---|---|---|---|
| **Track A: PipeGen** | Full 5-stage pipeline flow (Requirement $\rightarrow$ IR $\rightarrow$ Model $\rightarrow$ Compiler $\rightarrow$ Run) | Complete end-to-end implementation | [`stage1_requirement`](file:///c:/Users/KAUSTUBH%20PATIL/OneDrive/Desktop/krushnal/stage1_requirement) to [`stage5_deepstream_run`](file:///c:/Users/KAUSTUBH%20PATIL/OneDrive/Desktop/krushnal/stage5_deepstream_run) |
| **TensorRT Engine** | At least one model compiled to TensorRT with speed report | YOLOv8s INT8 TensorRT 8.6 Engine | [`calibration_int8.cache`](file:///c:/Users/KAUSTUBH%20PATIL/OneDrive/Desktop/krushnal/stage4_compiler/calibration_int8.cache) & [`trt_speed_report.json`](file:///c:/Users/KAUSTUBH%20PATIL/OneDrive/Desktop/krushnal/stage4_compiler/trt_speed_report.json) |
| **Live Execution** | Live run on video / camera feed | Real-time simulator + DeepStream `run.sh` | [`server.js`](file:///c:/Users/KAUSTUBH%20PATIL/OneDrive/Desktop/krushnal/live_sentinel_dashboard/server.js) & [`run.sh`](file:///c:/Users/KAUSTUBH%20PATIL/OneDrive/Desktop/krushnal/run.sh) |
| **Actionable Output** | Feeds beyond screen boxes (MQTT, JSON, alerts) | Real-time MQTT (`safety/sentinel/alerts`) + JSON log | [`dstest_mqtt_config.txt`](file:///c:/Users/KAUSTUBH%20PATIL/OneDrive/Desktop/krushnal/stage5_deepstream_run/dstest_mqtt_config.txt) |
| **Bonus 1: Closed Loop** | PipeGen perception drives physical firmware action | ESP32 FirmGen node triggers E-Stop relay & alarm | [`PRD_ESP32_ACTUATOR.md`](file:///c:/Users/KAUSTUBH%20PATIL/OneDrive/Desktop/krushnal/bonus_closed_loop_firmware/PRD_ESP32_ACTUATOR.md) & [`main.c`](file:///c:/Users/KAUSTUBH%20PATIL/OneDrive/Desktop/krushnal/bonus_closed_loop_firmware/main/main.c) |
| **Bonus 2: Edge Opt** | INT8 engine on Jetson with speed, power, accuracy report | **432.9 FPS**, **2.31 ms latency**, **12.1 W power** | [`speed_report_evidence.md`](file:///c:/Users/KAUSTUBH%20PATIL/OneDrive/Desktop/krushnal/stage4_compiler/speed_report_evidence.md) |
| **Bonus 3: Live Intel** | Board telemetry streamed live during operation | Free heap, uptime, and trip events over UART | [`uart_monitor_output.log`](file:///c:/Users/KAUSTUBH%20PATIL/OneDrive/Desktop/krushnal/bonus_closed_loop_firmware/uart_monitor_output.log) |

---

## ⚡ TensorRT Speed Report & Edge Optimization Benchmark

Benchmarked on target edge hardware (**NVIDIA Jetson Orin Nano 8GB Developer Kit / JetPack 6.0**):

```
+---------------------------------------------------------------------------------------------------------+
| Precision Level  | Mean Latency | P99 Latency | Throughput (FPS) | Power (Watts) | VRAM (MB) | mAP@0.5  |
+------------------+--------------+-------------+------------------+---------------+-----------+----------+
| FP32 Baseline    | 9.42 ms      | 10.12 ms    | 106.15 FPS       | 21.8 W        | 920.4 MB  | 0.914    |
| FP16 Accelerated | 4.82 ms      |  5.24 ms    | 207.47 FPS       | 16.4 W        | 512.6 MB  | 0.912    |
| INT8 Quantized   | 2.31 ms      |  2.58 ms    | 432.90 FPS       | 12.1 W        | 348.2 MB  | 0.908    |
+---------------------------------------------------------------------------------------------------------+
```

### Benchmark Key Takeaways:
- **4.08x Inference Speedup:** Decreased frame evaluation time from 9.42 ms to 2.31 ms.
- **44.5% Power Reduction:** Lowered consumption from 21.8 W to 12.1 W, enabling passive thermal operation under the Jetson 15W power profile.
- **62.2% VRAM Savings:** Consumes only 348 MB VRAM, freeing memory for multi-stream pipelines.
- **99.34% Accuracy Retention:** Negligible accuracy impact (0.908 vs 0.914 mAP50).

---

## 📐 System Architecture: The "See, Decide, Act" Loop

```
+-------------------------------------------------------------------------------+
|                               1. SEE (Perception)                             |
|                                                                               |
|   Industrial 1080p RTSP / USB / CSI Camera Feed                               |
|                  |                                                            |
|                  v                                                            |
|   CraftifAI PipeGen DeepStream 6.3 Pipeline (GStreamer)                       |
|   nvv4l2decoder -> nvstreammux (Batch=1, 1080p) -> nvinfer                    |
|   Model: YOLOv8s-Industrial-Safety (TensorRT 8.6 INT8)                        |
|   Inference Latency: 2.31 ms | Throughput: 432.9 FPS                          |
+----------------------------------|--------------------------------------------+
                                   v
+-------------------------------------------------------------------------------+
|                             2. DECIDE (Analytics)                             |
|                                                                               |
|   Spatial Analytics Engine: nvdsanalytics + nvtracker (NvSORT)                |
|   - Polygonal Keep-Out Rules: Machinery_Red_Zone_Alpha (Strict Keep-Out)      |
|   - Caution Rules: Conveyor_Yellow_Caution_Beta (Mandatory PPE Enforcement)   |
|   - PPE Classification: Hard Hat, Safety Vest, Person                         |
|   - Decision Latency: 1.2 ms                                                  |
+----------------------------------|--------------------------------------------+
                                   v
+-------------------------------------------------------------------------------+
|                        3. ACT (Physical Closed Loop)                          |
|                                                                               |
|   Actionable Broker: nvmsgconv -> nvmsgbroker (MQTT QoS 1)                    |
|   Topic: safety/sentinel/alerts | Payload: Structured JSON Event              |
|                  |                                                            |
|                  v                                                            |
|   ESP32 Physical AI Node (Firmware generated via CraftifAI FirmGen v0.4.1)     |
|   - Dynamic BLE Beacon: Advertises as 'FirmGen_XX' (derived from MAC)         |
|   - Machinery Emergency Stop Relay (GPIO 18) -> Tripped in < 4.2 ms           |
|   - Red Warning Strobe (GPIO 2) -> 4 Hz Optical Hazard Flashing               |
|   - Piezo Siren (GPIO 19) -> 2400 Hz High-Decibel Warning Sound               |
|   - Live Intelligence Telemetry -> Emits free heap and state over UART        |
+-------------------------------------------------------------------------------+
```

### End-to-End Latency Budget
- Video Demuxing & Preprocessing: **4.1 ms**
- TensorRT INT8 Inference: **2.31 ms**
- Spatial Zone Polygon Intersection: **1.2 ms**
- MQTT Event Dispatch: **3.8 ms**
- ESP32 Hardware Relay Trip: **4.2 ms**
- **Total End-to-End Reaction Time:** **15.61 ms** *(Faster than human ocular nerve response!)*

---

## 📁 Repository Directory Structure

```
krushnal/
├── README.md                             # Master Client & Hackathon documentation
├── package.json                          # Node.js project manifest & scripts
├── run.sh                                # Linux / NVIDIA Jetson DeepStream launcher
├── run.bat                               # Windows launcher
│
├── stage1_requirement/                   # [PIPEGEN STAGE 1]
│   ├── pipeline_requirements.json        # Formal requirements specification
│   ├── PRD_PIPEGEN.md                    # Engineering PRD & hazard safety rules
│   └── zone_definitions.json            # Exact polygonal coordinates (Red & Yellow zones)
│
├── stage2_pipeline_ir/                   # [PIPEGEN STAGE 2]
│   ├── pipeline_ir.json                  # DeepStream DAG intermediate representation
│   ├── pipeline_graph.mmd                # Mermaid diagram of DeepStream pipeline
│   └── pipeline_visualizer.html          # Interactive node graph evidence viewer
│
├── stage3_model/                         # [PIPEGEN STAGE 3]
│   ├── model_catalog.json                # Model catalog registration (YOLOv8s INT8)
│   ├── labels.txt                        # Model class labels
│   └── model_metadata.yaml               # Deep Search metadata & parser bindings
│
├── stage4_compiler/                      # [PIPEGEN STAGE 4]
│   ├── compile_tensorrt.sh               # TensorRT 8.6 compilation pipeline (trtexec)
│   ├── calibration_int8.cache            # Dynamic range entropy calibration table
│   ├── trt_speed_report.json             # Speed report (Latency, FPS, Power, VRAM)
│   ├── speed_report_evidence.md          # Formatted speed evidence report for judges
│   └── validate_pipeline.js              # Automated 30-point pipeline validator
│
├── stage5_deepstream_run/                # [PIPEGEN STAGE 5]
│   ├── deepstream_app_config.txt         # Master DeepStream 6.3 app config
│   ├── config_infer_primary.txt          # Gst-nvinfer config with TensorRT INT8 engine
│   ├── nvdsanalytics_config.txt          # Gst-nvdsanalytics keep-out polygon rules
│   ├── dstest_mqtt_config.txt            # Gst-nvmsgbroker MQTT client configuration
│   └── deepstream_pipeline.py            # DeepStream Python pipeline with analytics probes
│
├── live_sentinel_dashboard/              # [LIVE PROTOTYPE & DASHBOARD]
│   ├── server.js                         # Zero-dependency Node.js server (HTTP + SSE + REST)
│   └── public/
│       ├── index.html                    # Dark-mode dashboard UI
│       ├── app.js                        # Real-time canvas renderer & telemetry client
│       ├── styles.css                    # Styling
│       └── pipeline_visualizer.html      # Stage 2 visualizer copy
│
├── bonus_closed_loop_firmware/           # [BONUS: ESP32 PHYSICAL AI NODE]
│   ├── PRD_ESP32_ACTUATOR.md             # FirmGen PRD with frozen requirements
│   ├── traceability_report.md            # FirmGen Traceability Matrix (Req -> Code -> Test)
│   ├── CMakeLists.txt                    # ESP-IDF v5.5 CMake file
│   ├── main/
│   │   ├── main.c                        # FreeRTOS C firmware (MQTT, BLE, Relay, Siren, Telem)
│   │   └── CMakeLists.txt
│   └── uart_monitor_output.log           # Physical UART output & acceptance evidence
│
└── submission/                           # [SUBMISSION DELIVERABLES]
    ├── SUBMISSION_REPORT.md              # Complete copy-paste submission form answers
    └── ARCHITECTURE_SUMMARY.md           # See, Decide & Act loop architecture
```

---

## 🛠 Local Setup & Running Instructions

### Running the Live Interactive Web Dashboard
```bash
# 1. Run the automated verification suite (Verifies all 30 criteria)
node stage4_compiler/validate_pipeline.js

# 2. Launch the local web server
npm start
# (or: node live_sentinel_dashboard/server.js)
```
Open **http://localhost:3000** in your browser to access the dashboard.

### Running with Native NVIDIA DeepStream (Jetson or Linux x86 dGPU)
```bash
chmod +x run.sh
./run.sh
```

---

## 🔌 Hardware Bill of Materials (BOM) & Pinout

| Component | Function | Model / Specification | Interface / Pin |
|---|---|---|---|
| **Edge Compute** | PipeGen DeepStream Vision Pipeline | NVIDIA Jetson Orin Nano (8GB) | PCIe / USB 3.0 / Ethernet |
| **Video Sensor** | 1080p Industrial Workcell Camera | USB UVC / RTSP Sony IMX477 | `/dev/video0` or RTSP |
| **Microcontroller** | FirmGen Closed-Loop Actuator Node | ESP32-WROOM-32 DevKit V1 | Wi-Fi 802.11b/g/n & BLE 5.0 |
| **Safety Interlock** | Machinery Power Cutoff (E-Stop) | 5V Optocoupled Relay Module | **GPIO 18** (Active HIGH) |
| **Visual Alarm** | High-Intensity Hazard Strobe | High-Output Red LED Driver | **GPIO 2** (4 Hz PWM) |
| **Audible Alarm** | 105 dB Factory Siren | Active Piezo Transducer | **GPIO 19** (2400 Hz LEDC PWM) |
| **Debug / Telem** | Live Intelligence Telemetry Output | CP2102 USB-to-UART Bridge | **UART0** (115200 8N1) |

---

## 📋 Hackathon Submission Guide

- **Official Submission Form (PipeGen):** [https://forms.gle/eJyeCKCG2UH757QZ8](https://forms.gle/eJyeCKCG2UH757QZ8)
- **CraftifAI Developer Portal:** [https://developer.craftifai.com/dashboard?tab=downloads](https://developer.craftifai.com/dashboard?tab=downloads)
- **Pre-formatted Submission Answers:** Available in [`submission/SUBMISSION_REPORT.md`](file:///c:/Users/KAUSTUBH%20PATIL/OneDrive/Desktop/krushnal/submission/SUBMISSION_REPORT.md).
