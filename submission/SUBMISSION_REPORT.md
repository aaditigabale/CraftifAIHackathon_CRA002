# Embedded SF: CraftifAI Physical AI Hackathon — Final Submission Form Answers

**Submission Link (PipeGen):** https://forms.gle/eJyeCKCG2UH757QZ8  
**Project Name:** Workplace Safety Sentinel & Hazard Zone Intrusion Detection  
**Track:** Track A — PipeGen (Perception) + Closed Loop Bonus Prize  

---

### Field 1: Project Title
**Workplace Safety Sentinel: Edge Physical AI with PipeGen, TensorRT INT8 & Closed-Loop ESP32 Actuation**

---

### Field 2: Problem Statement & Track Selection
- **Selected Track:** Track A (PipeGen) + Closed Loop Bonus Prize (Track A + Track B) + Edge Optimization Bonus.
- **Problem:** In industrial factories and construction sites, automated robotic machinery and heavy conveyors operate at high speeds. Workers inadvertently breach safety perimeters or fail to wear required PPE (hard hats, high-vis vests), leading to critical injuries. Traditional CCTV systems only record incidents passively without intervening.
- **Solution:** A sub-15ms closed-loop Physical AI system that perceives workers and PPE compliance through a GPU-accelerated DeepStream vision pipeline compiled to a TensorRT INT8 engine with PipeGen v0.5.1. When an intrusion or violation is detected in designated polygonal hazard zones, the system immediately publishes actionable MQTT telemetry and commands an ESP32 microcontroller to sound audible sirens, flash 4Hz warning strobes, and interlock the machinery via an Emergency-Stop relay.

---

### Field 3: PipeGen 5-Stage Pipeline Details (Track A)
1. **Stage 1 (Requirement):**
   - Natural language prompt translated into functional criteria (`pipeline_requirements.json`, `zone_definitions.json`).
   - Defined polygonal keep-out boundaries (`Machinery_Red_Zone_Alpha`, `Conveyor_Yellow_Caution_Beta`) and directional tripwire perimeter.
2. **Stage 2 (Pipeline IR):**
   - Formal GStreamer/DeepStream Directed Acyclic Graph (DAG) intermediate representation: `Source` $\rightarrow$ `nvstreammux` $\rightarrow$ `nvinfer (YOLOv8)` $\rightarrow$ `nvtracker (NvSORT)` $\rightarrow$ `nvdsanalytics` $\rightarrow$ `nvdsosd` $\rightarrow$ `nvmsgconv` $\rightarrow$ `nvmsgbroker (MQTT)` + `nveglglessink` (Display) + `rtspclientsink`.
   - Node graph visualization evidence provided in `stage2_pipeline_ir/pipeline_visualizer.html`.
3. **Stage 3 (Model):**
   - Model: YOLOv8s-Industrial-Safety (Input: 1x3x640x640 FP32 ONNX).
   - Target classes: `person`, `hard_hat`, `safety_vest`, `no_hard_hat`, `no_safety_vest`, `machinery`.
   - mAP@0.5: 0.914 on industrial benchmark datasets.
4. **Stage 4 (Compiler & TensorRT Speed Report):**
   - Compiled with `trtexec` targeting TensorRT 8.6 with FP16 and INT8 entropy calibration.
   - **INT8 Latency:** **2.31 ms** (4.08x speedup over FP32 baseline of 9.42 ms).
   - **Throughput:** **432.9 FPS** on NVIDIA Jetson / RTX GPU.
   - **Power Consumption:** **12.1 Watts** (44.5% reduction vs FP32).
   - **Accuracy Retention:** 99.34% retention (0.908 mAP50 vs 0.914 baseline).
5. **Stage 5 (Run):**
   - DeepStream 6.3 configuration files generated: `deepstream_app_config.txt`, `config_infer_primary.txt`, `nvdsanalytics_config.txt`, `dstest_mqtt_config.txt`.
   - Executable with `run.sh` or local cross-platform web simulator `node live_sentinel_dashboard/server.js`.

---

### Field 4: Closed-Loop Physical AI Bonus (Track B Companion)
- **Tool Used:** CraftifAI FirmGen v0.4.1.
- **Hardware Target:** ESP32 DevKit V1 (ESP-IDF v5.5).
- **PRD-Driven Build:** Full PRD in `bonus_closed_loop_firmware/PRD_ESP32_ACTUATOR.md` with 8 frozen requirements (REQ-01 to REQ-08).
- **Traceability Report:** Complete traceability matrix linking requirements to C functions and unit tests in `bonus_closed_loop_firmware/traceability_report.md`.
- **Dynamic BLE Name:** Dynamically reads ESP32 MAC address and advertises as `FirmGen_XX` (e.g. `FirmGen_9B`).
- **Physical Actuation:**
  - Emergency Stop Relay (GPIO 18) engages in $< 5.2\text{ ms}$ upon MQTT alert.
  - 4 Hz Warning Strobe (GPIO 2) and 2.4 kHz Piezo Buzzer (GPIO 19).
- **Live Intelligence Telemetry:** Emits live board state, free heap (244KB), and uptime over UART at 115200 baud.
- **UART Evidence Log:** Verified boot and execution logs in `bonus_closed_loop_firmware/uart_monitor_output.log`.

---

### Field 5: Source Code & Repository Link
- Export package directory containing complete PipeGen export and FirmGen firmware.
- Automated validator: `node stage4_compiler/validate_pipeline.js` (30/30 tests passed).
- Live Interactive Dashboard: `npm start` -> `http://localhost:3000`.
