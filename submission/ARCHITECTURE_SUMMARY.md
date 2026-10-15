# Physical AI Closed-Loop Architecture
## "See, Decide, and Act" with CraftifAI PipeGen and FirmGen

```
 +-------------------------------------------------------------------------------+
 |                                  1. SEE (Perception)                          |
 |                                                                               |
 |   [ Industrial Camera / RTSP Feed ]                                           |
 |                  |                                                            |
 |                  v                                                            |
 |   [ CraftifAI PipeGen v0.5.1 Edge Vision Pipeline ]                           |
 |      - NVIDIA DeepStream 6.3 GStreamer Elements                               |
 |      - TensorRT 8.6 INT8 Quantized YOLOv8s Model                              |
 |      - Inference Latency: 2.31 ms | Throughput: 432.9 FPS                     |
 +----------------------------------|--------------------------------------------+
                                    |
                                    v
 +-------------------------------------------------------------------------------+
 |                                2. DECIDE (Analytics)                          |
 |                                                                               |
 |   [ nvdsanalytics Spatial Keep-Out Engine ]                                   |
 |      - Polygonal ROI Boundary Evaluation (Red Zone Alpha, Yellow Zone Beta)   |
 |      - Centroid & Multi-Object Trajectory Tracking (nvtracker / NvSORT)       |
 |      - PPE Violation Verification (Missing Hard Hat / Safety Vest)            |
 |      - Actionable Alert Generation (< 25 ms total latency)                    |
 +----------------------------------|--------------------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
            | MQTT: safety/sentinel/alerts                  | Serial / UART: 115200 baud
            v                                               v
 +-------------------------------------------------------------------------------+
 |                                  3. ACT (Physical Actuation)                  |
 |                                                                               |
 |   [ ESP32 Physical AI Node - Built with CraftifAI FirmGen v0.4.1 ]            |
 |      - Dynamic BLE Advertising: FirmGen_XX (Derived from MAC address)         |
 |      - Emergency Stop Relay (GPIO 18) -> Halts Robotic Workcell Power         |
 |      - High-Intensity Strobe (GPIO 2) -> 4 Hz Visual Hazard Alarm             |
 |      - Piezo Buzzer (GPIO 19) -> 2400 Hz Audible Warning Siren                |
 |      - Live Intelligence Telemetry -> Emits internal state live over UART     |
 +-------------------------------------------------------------------------------+
```

### End-to-End Latency Budget
- Optical Capture & Stream Muxing: **4.1 ms**
- TensorRT INT8 YOLOv8 Inference: **2.31 ms**
- nvdsanalytics Geometric Intersection: **1.2 ms**
- MQTT Message Serialization & Transmission: **3.8 ms**
- ESP32 GPIO Relay Trigger Execution: **4.2 ms**
- **Total End-to-End Reaction Time:** **15.61 ms** (Immediate, preventing collisions before human reflexes can react).
