@echo off
REM ==============================================================================
REM CraftifAI PipeGen v0.5.1 - Workplace Safety Sentinel Runner (Windows Launcher)
REM ==============================================================================
echo =====================================================================
echo   CraftifAI PipeGen v0.5.1 - Physical AI Pipeline Execution
echo   Project: Workplace Safety Sentinel ^& Hazard Zone Keep-Out
echo   Target: DeepStream / TensorRT Emulation ^& Live Web Sentinel
echo =====================================================================

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Launching PipeGen Live Runtime Engine ^& Web Sentinel Dashboard on Node.js...
    node live_sentinel_dashboard\server.js
) else (
    echo [ERROR] Node.js is required to run the local live dashboard.
    pause
)
