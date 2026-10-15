/**
 * CraftifAI PipeGen v0.5.1 - Live Sentinel Runtime Engine & Web Dashboard
 * Pure Node.js (Zero external dependencies)
 * Serves real-time vision telemetry, MQTT alert event stream, and interactive UI.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Global Sentinel Runtime State
let pipelineState = {
  active_engine: 'TensorRT_INT8',
  fps: 432.9,
  latency_ms: 2.31,
  total_frames_processed: 12450,
  active_alerts: [],
  workers: [
    { id: 101, name: 'Worker #101', x: 220, y: 450, vx: 1.2, vy: 0.5, ppe: { hard_hat: true, safety_vest: true }, zone: 'SAFE_CORRIDOR' },
    { id: 102, name: 'Worker #102', x: 680, y: 380, vx: -0.8, vy: 0.3, ppe: { hard_hat: false, safety_vest: true }, zone: 'Machinery_Red_Zone_Alpha' },
    { id: 103, name: 'Technician #103', x: 310, y: 520, vx: 0.5, vy: -0.4, ppe: { hard_hat: true, safety_vest: false }, zone: 'Conveyor_Yellow_Caution_Beta' }
  ],
  closed_loop_esp32: {
    connected: true,
    ble_name: 'FirmGen_9B',
    ip_address: '192.168.1.185',
    relay_estop: true,
    strobe_active: true,
    buzzer_freq_hz: 2400,
    free_heap_bytes: 244920,
    uptime_sec: 142
  }
};

// Connected SSE clients for real-time telemetry stream
let sseClients = [];

function broadcastSSE(data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(res => {
    try { res.write(msg); } catch (e) {}
  });
}

// Background simulation ticker (30 ticks per second)
setInterval(() => {
  pipelineState.total_frames_processed++;
  pipelineState.closed_loop_esp32.uptime_sec++;

  // Animate workers
  let hasCriticalIntrusion = false;
  pipelineState.workers.forEach(w => {
    w.x += w.vx;
    w.y += w.vy;

    // Bounce off walls
    if (w.x < 80 || w.x > 1150) w.vx *= -1;
    if (w.y < 220 || w.y > 660) w.vy *= -1;

    // Check if inside Red Zone Alpha [620,240 to 1150,660]
    if (w.x >= 600 && w.x <= 1120 && w.y >= 240 && w.y <= 660) {
      w.zone = 'Machinery_Red_Zone_Alpha';
      hasCriticalIntrusion = true;
    } else if (w.x >= 100 && w.x <= 500 && w.y >= 320 && w.y <= 680) {
      w.zone = 'Conveyor_Yellow_Caution_Beta';
    } else {
      w.zone = 'SAFE_CORRIDOR';
    }
  });

  pipelineState.closed_loop_esp32.relay_estop = hasCriticalIntrusion;
  pipelineState.closed_loop_esp32.strobe_active = hasCriticalIntrusion;
  pipelineState.closed_loop_esp32.buzzer_freq_hz = hasCriticalIntrusion ? 2400 : 0;

  broadcastSSE({
    type: 'FRAME_UPDATE',
    state: pipelineState,
    timestamp: new Date().toISOString()
  });
}, 200);

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  // SSE Stream
  if (parsedUrl.pathname === '/api/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    sseClients.push(res);
    req.on('close', () => {
      sseClients = sseClients.filter(client => client !== res);
    });
    return;
  }

  // REST API: Trigger Manual Intrusion or Reset
  if (parsedUrl.pathname === '/api/trigger_intrusion' && req.method === 'POST') {
    pipelineState.workers[1].x = 750;
    pipelineState.workers[1].y = 420;
    pipelineState.workers[1].zone = 'Machinery_Red_Zone_Alpha';
    pipelineState.closed_loop_esp32.relay_estop = true;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'TRIGGERED', alert: 'Manual intrusion simulated in Red Zone Alpha.' }));
    return;
  }

  if (parsedUrl.pathname === '/api/reset_estop' && req.method === 'POST') {
    pipelineState.workers[1].x = 180;
    pipelineState.workers[1].y = 480;
    pipelineState.workers[1].zone = 'SAFE_CORRIDOR';
    pipelineState.closed_loop_esp32.relay_estop = false;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'RESET', message: 'Safety interlock cleared. Machinery operational.' }));
    return;
  }

  // Serve static files
  let reqPath = parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;
  let filePath = path.join(PUBLIC_DIR, reqPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`=====================================================================`);
  console.log(`  CraftifAI PipeGen v0.5.1 — Workplace Safety Sentinel Dashboard`);
  console.log(`  Target: DeepStream / TensorRT Physical AI Live Runtime`);
  console.log(`  Live URL: http://localhost:${PORT}`);
  console.log(`=====================================================================`);
});
