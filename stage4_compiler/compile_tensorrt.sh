#!/bin/bash
# ==============================================================================
# CraftifAI PipeGen v0.5.1 - Stage 4: TensorRT Compiler
# Compiles ONNX model into optimized TensorRT FP16 / INT8 Execution Engines
# ==============================================================================

set -e

ONNX_MODEL="stage3_model/yolov8s_safety.onnx"
CALIBRATION_CACHE="stage4_compiler/calibration_int8.cache"
OUTPUT_DIR="stage4_compiler"

echo "====================================================================="
echo "  CraftifAI PipeGen v0.5.1 — Stage 4: TensorRT Engine Compiler"
echo "  Target Hardware: NVIDIA Jetson Orin Nano / RTX 4090 / JetPack 6"
echo "====================================================================="

mkdir -p "$OUTPUT_DIR"

echo "[1/3] Building TensorRT FP32 Baseline Engine..."
trtexec \
  --onnx="$ONNX_MODEL" \
  --saveEngine="$OUTPUT_DIR/model_yolov8s_safety_fp32.engine" \
  --memPoolSize=workspace:2048 \
  --minShapes=images:1x3x640x640 \
  --optShapes=images:1x3x640x640 \
  --maxShapes=images:4x3x640x640 \
  --exportProfile="$OUTPUT_DIR/fp32_profile.json" \
  --dumpOutput

echo "[2/3] Building TensorRT FP16 Optimized Engine..."
trtexec \
  --onnx="$ONNX_MODEL" \
  --fp16 \
  --saveEngine="$OUTPUT_DIR/model_yolov8s_safety_fp16.engine" \
  --memPoolSize=workspace:2048 \
  --minShapes=images:1x3x640x640 \
  --optShapes=images:1x3x640x640 \
  --maxShapes=images:4x3x640x640 \
  --exportProfile="$OUTPUT_DIR/fp16_profile.json"

echo "[3/3] Building TensorRT INT8 Quantized Engine (Bonus: Edge Optimization)..."
trtexec \
  --onnx="$ONNX_MODEL" \
  --int8 \
  --fp16 \
  --calib="$CALIBRATION_CACHE" \
  --saveEngine="$OUTPUT_DIR/model_yolov8s_safety_int8.engine" \
  --memPoolSize=workspace:2048 \
  --minShapes=images:1x3x640x640 \
  --optShapes=images:1x3x640x640 \
  --maxShapes=images:4x3x640x640 \
  --exportProfile="$OUTPUT_DIR/int8_profile.json" \
  --exportLayerInfo="$OUTPUT_DIR/int8_layer_info.json"

echo "====================================================================="
echo "[SUCCESS] TensorRT Engines compiled successfully with PipeGen v0.5.1!"
echo "Generated Engines:"
echo " - FP32: $OUTPUT_DIR/model_yolov8s_safety_fp32.engine"
echo " - FP16: $OUTPUT_DIR/model_yolov8s_safety_fp16.engine"
echo " - INT8: $OUTPUT_DIR/model_yolov8s_safety_int8.engine"
echo "====================================================================="
