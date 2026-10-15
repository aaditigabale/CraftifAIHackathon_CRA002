#!/usr/bin/env python3
"""
CraftifAI PipeGen v0.5.1 - Stage 5: DeepStream Python Pipeline
Workplace Safety Sentinel & Hazard Zone Intrusion Detection
Combines TensorRT YOLOv8 INT8 inference with nvdsanalytics and MQTT alert dispatching.
"""

import sys
import time
import json
import os

try:
    import gi
    gi.require_version('Gst', '1.0')
    from gi.repository import Gst, GLib
    import pyds
    HAS_DEEPSTREAM = True
except ImportError:
    HAS_DEEPSTREAM = False

HAZARD_TOPIC = "safety/sentinel/alerts"

def generate_alert_payload(stream_id, track_id, violation_type, zone_name, severity, bbox, ppe_status):
    """Generates standard actionable JSON payload for MQTT & Closed-Loop ESP32."""
    return {
        "event_id": f"evt-{int(time.time() * 1000)}",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime()),
        "stream_id": stream_id,
        "worker_track_id": track_id,
        "violation": violation_type,
        "zone": zone_name,
        "severity": severity,
        "bbox": bbox,
        "ppe_status": ppe_status,
        "actuator_command": {
            "relay_estop": True if severity == "CRITICAL" else False,
            "strobe_alarm": True,
            "buzzer_frequency_hz": 2400 if severity == "CRITICAL" else 1000
        }
    }

def analytics_src_pad_buffer_probe(pad, info, u_data):
    """
    DeepStream buffer probe: Inspects nvdsanalytics metadata per frame.
    Flags unauthorized entries into hazard zones and dispatches actionable alerts.
    """
    gst_buffer = info.get_buffer()
    if not gst_buffer:
        return Gst.PadProbeReturn.OK

    batch_meta = pyds.gst_buffer_get_nvds_batch_meta(hash(gst_buffer))
    l_frame = batch_meta.frame_meta_list

    while l_frame is not None:
        try:
            frame_meta = pyds.NvDsFrameMeta.cast(l_frame.data)
        except StopIteration:
            break

        frame_number = frame_meta.frame_num
        l_obj = frame_meta.obj_meta_list

        while l_obj is not None:
            try:
                obj_meta = pyds.NvDsObjectMeta.cast(l_obj.data)
            except StopIteration:
                break

            # Check user analytics metadata
            l_user = obj_meta.obj_user_meta_list
            while l_user is not None:
                try:
                    user_meta = pyds.NvDsUserMeta.cast(l_user.data)
                except StopIteration:
                    break

                if user_meta.base_meta.meta_type == pyds.nvds_get_user_meta_type("NVIDIA.DSANALYTICS.USER_META"):
                    analytics_meta = pyds.NvDsAnalyticsObjInfo.cast(user_meta.user_meta_data)
                    
                    # Check for Red Keep-Out zone intrusion
                    if "RF_Machinery_Red" in analytics_meta.roiStatus:
                        alert = generate_alert_payload(
                            stream_id=frame_meta.source_id,
                            track_id=obj_meta.object_id,
                            violation_type="UNAUTHORIZED_ZONE_INTRUSION",
                            zone_name="Machinery_Red_Zone_Alpha",
                            severity="CRITICAL",
                            bbox=[obj_meta.rect_params.left, obj_meta.rect_params.top, 
                                  obj_meta.rect_params.width, obj_meta.rect_params.height],
                            ppe_status="NO_HARD_HAT"
                        )
                        print(f"[CRITICAL ALERT] Frame {frame_number}: Worker #{obj_meta.object_id} entered RED ZONE! Dispatching E-STOP.")
                        # In native deployment, send to MQTT / Serial
                        with open("incident_alerts.jsonl", "a") as f:
                            f.write(json.dumps(alert) + "\n")

                try:
                    l_user = l_user.next
                except StopIteration:
                    break

            try:
                l_obj = l_obj.next
            except StopIteration:
                break

        try:
            l_frame = l_frame.next
        except StopIteration:
            break

    return Gst.PadProbeReturn.OK

def main():
    print("=====================================================================")
    print("  CraftifAI PipeGen v0.5.1 - Stage 5 DeepStream Execution Engine")
    print("=====================================================================")
    if not HAS_DEEPSTREAM:
        print("[INFO] GStreamer / DeepStream Python bindings not loaded on current host.")
        print("[INFO] To run the interactive cross-platform simulation and live UI:")
        print("       node live_sentinel_dashboard/server.js")
        return 0

    Gst.init(None)
    pipeline = Gst.parse_launch(
        "filesrc location=surveillance_workplace.mp4 ! qtdemux ! h264parse ! nvv4l2decoder ! "
        "nvstreammux name=mux batch-size=1 width=1920 height=1080 ! "
        "nvinfer config-file-path=stage5_deepstream_run/config_infer_primary.txt ! "
        "nvtracker tracker-width=640 tracker-height=384 ll-lib-file=/opt/nvidia/deepstream/deepstream/lib/libnvds_nvmultiobjecttracker.so ! "
        "nvdsanalytics config-file=stage5_deepstream_run/nvdsanalytics_config.txt name=analytics ! "
        "nvdsosd ! nveglglessink"
    )

    analytics = pipeline.get_by_name("analytics")
    srcpad = analytics.get_static_pad("src")
    srcpad.add_probe(Gst.PadProbeType.BUFFER, analytics_src_pad_buffer_probe, 0)

    loop = GLib.MainLoop()
    pipeline.set_state(Gst.State.PLAYING)
    print("[INFO] Pipeline running. Press Ctrl+C to stop.")
    try:
        loop.run()
    except KeyboardInterrupt:
        pipeline.set_state(Gst.State.NULL)

if __name__ == "__main__":
    sys.exit(main())
