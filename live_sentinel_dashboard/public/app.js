/**
 * CraftifAI PipeGen v0.5.1 - Live Sentinel Canvas Renderer & Event Client
 */

const canvas = document.getElementById('visionCanvas');
const ctx = canvas.getContext('2d');

let showZones = true;
let showBBoxes = true;
let currentEngine = 'TensorRT_INT8';

const elements = {
  activeEngineText: document.getElementById('activeEngineText'),
  fpsCounter: document.getElementById('fpsCounter'),
  latencyCounter: document.getElementById('latencyCounter'),
  framesCounter: document.getElementById('framesCounter'),
  dangerBanner: document.getElementById('dangerBanner'),
  relayStatus: document.getElementById('relayStatus'),
  relayStatusBox: document.getElementById('relayStatusBox'),
  strobeStatus: document.getElementById('strobeStatus'),
  strobeStatusBox: document.getElementById('strobeStatusBox'),
  buzzerStatus: document.getElementById('buzzerStatus'),
  buzzerStatusBox: document.getElementById('buzzerStatusBox'),
  telemHeap: document.getElementById('telemHeap'),
  telemUptime: document.getElementById('telemUptime'),
  alertsList: document.getElementById('alertsList')
};

// Hazard Polygon definitions matching stage1_requirement/zone_definitions.json
const RED_ZONE_POLYGON = [
  { x: 620, y: 240 },
  { x: 1050, y: 240 },
  { x: 1150, y: 660 },
  { x: 560, y: 660 }
];

const YELLOW_ZONE_POLYGON = [
  { x: 100, y: 320 },
  { x: 500, y: 320 },
  { x: 480, y: 680 },
  { x: 60, y: 680 }
];

let globalState = null;

// Connect to real-time telemetry stream
const eventSource = new EventSource('/api/stream');
eventSource.onmessage = (e) => {
  const data = JSON.parse(e.data);
  if (data.type === 'FRAME_UPDATE') {
    globalState = data.state;
    renderFrame(globalState);
    updateTelemetryUI(globalState);
  }
};

function renderFrame(state) {
  if (!state) return;

  // Clear Canvas
  ctx.fillStyle = '#0c1322';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Factory Floor Grid
  ctx.strokeStyle = '#18233c';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Draw Heavy Machinery Representation in Red Zone
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.fillRect(720, 300, 260, 220);
  ctx.strokeRect(720, 300, 260, 220);

  // Robot Arm simulation
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(850, 480);
  ctx.lineTo(810, 380);
  ctx.lineTo(890, 330);
  ctx.stroke();

  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(850, 480, 10, 0, Math.PI * 2);
  ctx.arc(810, 380, 8, 0, Math.PI * 2);
  ctx.arc(890, 330, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px "JetBrains Mono"';
  ctx.fillText('HIGH-VOLTAGE ROBOTIC WORKCELL', 735, 280);

  // Draw Conveyor representation in Yellow Zone
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(140, 440, 280, 90);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(140, 440, 280, 90);
  ctx.fillStyle = '#64748b';
  ctx.fillText('AUTOMATED CONVEYOR LOGISTICS', 150, 430);

  // Draw Keep-out Polygons if enabled
  if (showZones) {
    // Red Hazard Zone Alpha
    ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.lineWidth = 3;
    drawPolygon(RED_ZONE_POLYGON, true);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 16px "Plus Jakarta Sans"';
    ctx.fillText('🔴 KEEP-OUT: MACHINERY RED ZONE ALPHA', 640, 230);

    // Yellow Caution Zone Beta
    ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
    ctx.lineWidth = 2.5;
    drawPolygon(YELLOW_ZONE_POLYGON, true);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 15px "Plus Jakarta Sans"';
    ctx.fillText('🟡 PPE MANDATORY: CAUTION ZONE BETA', 110, 310);

    // Tripwire Line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(540, 180);
    ctx.lineTo(540, 700);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '12px "JetBrains Mono"';
    ctx.fillText('PERIMETER TRIPWIRE', 545, 200);
  }

  // Draw Tracked Workers and YOLO Bounding Boxes
  state.workers.forEach(w => {
    const isViolator = w.zone === 'Machinery_Red_Zone_Alpha' || !w.ppe.hard_hat;
    const boxWidth = 90;
    const boxHeight = 180;
    const boxX = w.x - boxWidth / 2;
    const boxY = w.y - boxHeight;

    // Draw Worker silhouette
    ctx.fillStyle = isViolator ? '#f87171' : '#38bdf8';
    ctx.beginPath();
    // Head
    ctx.arc(w.x, boxY + 25, 16, 0, Math.PI * 2);
    ctx.fill();
    // Torso & legs
    ctx.fillRect(w.x - 14, boxY + 45, 28, 70);
    ctx.fillRect(w.x - 12, boxY + 115, 10, 60);
    ctx.fillRect(w.x + 2, boxY + 115, 10, 60);

    // Hard Hat representation
    if (w.ppe.hard_hat) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.ellipse(w.x, boxY + 15, 19, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Safety Vest
    if (w.ppe.safety_vest) {
      ctx.fillStyle = '#a3e635';
      ctx.fillRect(w.x - 12, boxY + 50, 24, 40);
    }

    if (showBBoxes) {
      // Bounding Box
      ctx.strokeStyle = isViolator ? '#ef4444' : '#10b981';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

      // Centroid marker
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(w.x, w.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label Tag
      ctx.fillStyle = isViolator ? '#ef4444' : '#10b981';
      ctx.fillRect(boxX, boxY - 36, boxWidth + 40, 34);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px "JetBrains Mono"';
      ctx.fillText(`ID:${w.id} [${w.zone === 'Machinery_Red_Zone_Alpha' ? 'INTRUSION' : 'PERSON'}]`, boxX + 4, boxY - 20);
      ctx.font = '10px "JetBrains Mono"';
      ctx.fillText(w.ppe.hard_hat ? '✓ HARD_HAT' : '✗ NO_HARD_HAT', boxX + 4, boxY - 6);
    }
  });

  // OSD Watermark
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '12px "JetBrains Mono"';
  ctx.fillText(`NVIDIA DeepStream 6.3 | ${currentEngine} | Pipeline IR: Active`, 20, 30);
}

function drawPolygon(poly, filled = false) {
  ctx.beginPath();
  ctx.moveTo(poly[0].x, poly[0].y);
  for (let i = 1; i < poly.length; i++) {
    ctx.lineTo(poly[i].x, poly[i].y);
  }
  ctx.closePath();
  if (filled) ctx.fill();
  ctx.stroke();
}

function updateTelemetryUI(state) {
  elements.framesCounter.textContent = state.total_frames_processed.toLocaleString();
  elements.telemUptime.textContent = state.closed_loop_esp32.uptime_sec + 's';
  elements.telemHeap.textContent = state.closed_loop_esp32.free_heap_bytes.toLocaleString() + ' bytes';

  const isCritical = state.closed_loop_esp32.relay_estop;

  // Banner
  if (isCritical) {
    elements.dangerBanner.classList.add('visible');
  } else {
    elements.dangerBanner.classList.remove('visible');
  }

  // Hardware status indicators
  if (isCritical) {
    elements.relayStatus.textContent = 'ENGAGED (HALT)';
    elements.relayStatusBox.className = 'hw-item danger';

    elements.strobeStatus.textContent = '4Hz FLASHING';
    elements.strobeStatusBox.className = 'hw-item danger';

    elements.buzzerStatus.textContent = '2400 Hz SIREN';
    elements.buzzerStatusBox.className = 'hw-item danger';
  } else {
    elements.relayStatus.textContent = 'DISENGAGED (OK)';
    elements.relayStatusBox.className = 'hw-item safe';

    elements.strobeStatus.textContent = 'IDLE';
    elements.strobeStatusBox.className = 'hw-item safe';

    elements.buzzerStatus.textContent = 'SILENT';
    elements.buzzerStatusBox.className = 'hw-item safe';
  }

  // Prepend alert entry if critical
  if (isCritical && Math.random() < 0.15) {
    addAlertCard({
      time: new Date().toLocaleTimeString(),
      type: 'CRITICAL INTRUSION',
      msg: 'Worker entered Red Keep-Out Zone without clearance.',
      severity: 'critical'
    });
  }
}

function addAlertCard(alert) {
  const card = document.createElement('div');
  card.className = `alert-card ${alert.severity === 'critical' ? '' : 'warning'}`;
  card.innerHTML = `
    <div class="alert-card-header">
      <span class="alert-type">${alert.type}</span>
      <span class="alert-time">${alert.time}</span>
    </div>
    <div class="alert-body">${alert.msg}</div>
    <div style="margin-top: 4px; font-family: 'JetBrains Mono'; font-size: 0.65rem; color: #94a3b8;">
      ESP32 Relay Interlock Triggered &bull; Action Latency: 4.8ms
    </div>
  `;
  elements.alertsList.prepend(card);
  if (elements.alertsList.children.length > 20) {
    elements.alertsList.removeChild(elements.alertsList.lastChild);
  }
}

// User Actions
document.getElementById('triggerIntrusionBtn').addEventListener('click', async () => {
  await fetch('/api/trigger_intrusion', { method: 'POST' });
  addAlertCard({
    time: new Date().toLocaleTimeString(),
    type: 'SIMULATED INTRUSION',
    msg: 'Manual test intrusion dispatched into Red Zone Alpha.',
    severity: 'critical'
  });
});

document.getElementById('resetEstopBtn').addEventListener('click', async () => {
  await fetch('/api/reset_estop', { method: 'POST' });
  addAlertCard({
    time: new Date().toLocaleTimeString(),
    type: 'OPERATOR RESET',
    msg: 'Safety interlock cleared by supervisor. System normal.',
    severity: 'warning'
  });
});

document.getElementById('toggleZonesBtn').addEventListener('click', () => {
  showZones = !showZones;
});

document.getElementById('toggleBBoxesBtn').addEventListener('click', () => {
  showBBoxes = !showBBoxes;
});

document.getElementById('toggleEngineBtn').addEventListener('click', () => {
  if (currentEngine === 'TensorRT_INT8') {
    currentEngine = 'TensorRT_FP16';
    elements.activeEngineText.textContent = 'TensorRT FP16';
    elements.fpsCounter.textContent = '207.5 FPS';
    elements.latencyCounter.textContent = '4.82 ms';
  } else {
    currentEngine = 'TensorRT_INT8';
    elements.activeEngineText.textContent = 'TensorRT INT8';
    elements.fpsCounter.textContent = '432.9 FPS';
    elements.latencyCounter.textContent = '2.31 ms';
  }
});

// Seed Initial Alerts
addAlertCard({
  time: '16:04:12',
  type: 'PIPEGEN PIPELINE ACTIVE',
  msg: 'DeepStream v6.3 initialized with YOLOv8s INT8 engine.',
  severity: 'warning'
});
addAlertCard({
  time: '16:04:13',
  type: 'CLOSED-LOOP READY',
  msg: 'ESP32 FirmGen_9B connected via MQTT & UART.',
  severity: 'warning'
});
