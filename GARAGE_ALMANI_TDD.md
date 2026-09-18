# 🛠️ GARAGE ALMANI (كاراج ألماني)
## Technical Design Document (TDD)
### *System Architecture, Mobile 3D Pipeline, Networking & AI Speech Engine*

---

## 1. TECHNICAL GOALS & NON-FUNCTIONAL REQUIREMENTS
- **Target Platform:** Mobile Web Browsers (Mobile Safari on iOS 15+, Chrome Mobile on Android 10+). Zero installation required.
- **Performance Budget:** 
  - Stable **60 FPS** on mid-range devices (e.g. iPhone 11, Samsung Galaxy A52).
  - Total 3D Scene Polycount: **< 25,000 triangles**.
  - Total Memory Footprint (VRAM + RAM): **< 150 MB**.
  - Initial Bundle Size: **< 3 MB** compressed.
- **Thermal & Battery Protection:** CPU/GPU usage throttled to < 20% when it is not the local player's active turn.
- **Latency Budget:** Real-time state synchronization within **< 80 ms** across local Wi-Fi or regional internet.

---

## 2. HIGH-LEVEL TECHNOLOGY STACK

```
+-------------------------------------------------------------------------------+
|                             CLIENT (MOBILE BROWSER)                           |
|  +-------------------------------------------------------------------------+  |
|  | UI & Application Layer: React 18 + TypeScript + TailwindCSS / Lucide    |  |
|  +-------------------------------------------------------------------------+  |
|  | 3D Graphics Engine: Three.js (WebGL2 / Fallback WebGL1)                |  |
|  | - Custom Shaders: Liquid Fill/Drain Shader, Tungsten PointLight Shading |  |
|  +-------------------------------------------------------------------------+  |
|  | Computer Vision: MediaPipe Face Mesh (WASM + SIMD, Client-side)         |  |
|  | - Optimized: Dual-ROI Cropper (Eyes Canvas 2D + Mouth Canvas 2D)        |  |
|  +-------------------------------------------------------------------------+  |
|  | Audio Subsystem: Web Audio API (MediaRecorder, Opus / 16kHz PCM)        |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
                                        |
               WebSockets (State Sync)  |  HTTPS / REST (Gemini Evaluation)
                                        v
+-------------------------------------------------------------------------------+
|                            BACKEND & CLOUD SERVICES                           |
|  +-------------------------------------------------------------------------+  |
|  | Networking Relay: Node.js / ws (Lightweight Room & State Server)        |  |
|  +-------------------------------------------------------------------------+  |
|  | AI Speech Evaluation: Google AI Studio Gemini Flash (Multimodal Audio)  |  |
|  | - Round-Robin Load Balancer across the 6 Preserved Gemini API Keys      |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

---

## 3. CLIENT-SIDE 3D GRAPHICS PIPELINE (THREE.JS)

### 3.1 Scene Hierarchy & Polycount Budget
- **The Garage Interior Mesh:**
  - Walls & Ceiling (Corrugated Aluminum): ~1,500 polys with normal maps.
  - Floor (Aged Concrete): ~200 polys.
  - Garage Aluminum Shutter: ~800 polys.
- **Furniture & Props:**
  - Round Wooden Café Table: ~1,200 polys.
  - Moroccan Event Tent Chairs (*krasa d khzana*): ~1,800 polys per chair × 8 max = ~14,400 polys.
  - Café Wall Clock + Wall Calendar (*Roznama*) + Shelf: ~1,000 polys.
- **The Glasses & Liquid:**
  - 8 Glasses max on table: ~500 polys each = ~4,000 polys.
  - Total Scene Polycount: **~23,000 polys** (Well within the 25k mobile budget).

### 3.2 Dynamic Liquid Shader (The Sip & Refill System)
- Instead of heavy fluid simulation, each glass contains a procedural liquid mesh using a custom GLSL fragment shader:
  ```glsl
  uniform float uFillLevel; // 0.0 (empty) to 1.0 (full)
  uniform vec3 uLiquidColor; // changes per drink (Tee, Kaffee, Wasser...)
  uniform float uSloshTime;  // slight wobble when glass moves
  
  void main() {
    if (vPosition.y > uFillLevel + sin(vPosition.x * 5.0 + uSloshTime) * 0.02) {
      discard; // clips top of liquid
    }
    gl_FragColor = vec4(uLiquidColor, 0.95);
  }
  ```
- **Sip Action:** `uFillLevel` smoothly lerps down by 0.2 (1/5th) in 400ms.
- **Refill Action:** `uFillLevel` lerps up by 0.4 (+2 sips).

### 3.3 Lighting & Shadow Architecture
- **Primary Source:** One `PointLight` placed at the tungsten filament `(0, 2.5, 0)` with warm color `#FFB04A` (2700K).
- **Optimization:** Dynamic real-time shadow maps disabled on mobile!
  - Pre-baked contact shadow texture underneath the table and chairs (ambient occlusion plane).
  - Keeps draw calls below **40 per frame**.

---

## 4. COMPUTER VISION: THE BIG FACE & BATTERY PROTECTION

### 4.1 Dual-ROI Cropping Pipeline
- **Step 1:** Stream mobile front camera at low resolution (`320x240` or `480x360` at 30 FPS).
- **Step 2:** MediaPipe Face Mesh detects facial landmarks:
  - Eye Region Landmarks: [33, 133, 159, 145, 362, 263, 386, 374].
  - Mouth Region Landmarks: [61, 291, 0, 17, 13, 14, 78, 308].
- **Step 3:** Crop Eyes onto an off-screen `Canvas2D` (Texture A) and Mouth onto an off-screen `Canvas2D` (Texture B).
- **Step 4:** Map Textures A & B directly onto the bean head model material with cartoon outline shaders.

### 4.2 Thermal / Battery Throttling State Machine
```
[Player State == INACTIVE_SPECTATOR]
   --> Camera Feed: Paused / 0 FPS.
   --> FaceMesh Inference: Sleeping (0% CPU).
   --> Avatar displays cached smiling frame or idle breathing.

[Player State == ACTIVE_TURN]
   --> Camera Feed: Resumed (30 FPS).
   --> FaceMesh Inference: Active (High Priority).
   --> Real-time 60 FPS mouth tracking rendered to all players.
```
*Result:* Each player's phone only executes face tracking for their 10–15 second turns, reducing battery drain by over **85%**.

---

## 5. SPEECH RECOGNITION & GOOGLE AI STUDIO (GEMINI) ENGINE

### 5.1 Audio Capture Specifications
- Standard Web Audio API:
  - Sample Rate: **16,000 Hz** (Optimal for phonetic AI recognition).
  - Format: Mono PCM 16-bit / Opus compressed webm.
  - Recording Duration: Controlled by hold-to-talk button (1.0s to 6.0s max).

### 5.2 Gemini 2.5 / 1.5 Flash Multimodal Prompt Contract
When the user releases the hold-to-talk button, the audio chunk is base64 encoded and sent to Google AI Studio with this strict system prompt:

```json
{
  "system_instruction": "You are the pronunciation judge for the game GARAGE ALMANI (German A0 level). Evaluate the user's spoken audio against the target German word/sound. Be encouraging, fun, and beginner-tolerant. Return strict JSON only.",
  "target_word": "Ä",
  "topic": "Umlaut Vowels",
  "expected_response_schema": {
    "is_correct": true,
    "confidence": 0.88,
    "coaching_darija": "مزيان بزاف! شفايفك تجمعو مزيان",
    "coaching_phonetic": "A bit more open in the jaw"
  }
}
```

### 5.3 6-Key Round-Robin Load Balancer & Fallback
- To guarantee zero rate-limiting (`429 Too Many Requests`), the backend rotates requests across the 6 preserved Google AI Studio keys in `.env.local`:
  ```typescript
  class GeminiKeyManager {
    private keys: string[] = [KEY_1, KEY_2, KEY_3, KEY_4, KEY_5, KEY_6];
    private currentIndex = 0;

    public getNextKey(): string {
      const key = this.keys[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
      return key;
    }
  }
  ```

---

## 6. MULTIPLAYER NETWORKING & STATE SYNCHRONIZATION

### 6.1 Room & Networking Protocol (WebSockets)
- Room Codes: 4 uppercase letters/digits entered via the Dirham Silver Coin keypad.
- Message Schema (Lightweight JSON):
  ```typescript
  type GameMessage =
    | { type: "ROOM_JOIN"; roomId: string; nickname: string; color: string }
    | { type: "PLAYER_READY"; playerId: string }
    | { type: "START_TURN"; playerId: string; targetPrompt: PromptData }
    | { type: "SUBMIT_ATTEMPT"; playerId: string; audioBase64: string }
    | { type: "EVALUATION_RESULT"; playerId: string; success: boolean; newSips: number }
    | { type: "DRINK_WON"; playerId: string; drinkIndex: number }
    | { type: "SWAP_GLASSES"; nextDrinkIndex: number };
  ```

### 6.2 Acoustic Feedback Protection (Same-Room vs Remote)
- During lobby setup, the host toggles:
  - `CO_LOCATED = true` (Players in the same physical salon/room): Client-to-client voice streaming is **disabled**; only game SFX play.
  - `CO_LOCATED = false` (Remote players): Audio chunks from active attempts are broadcast via WebSockets so friends hear the attempt through their phone speakers.

---

## 7. STATE MACHINE (MATCH LIFECYCLE)

```
[1. LOBBY_ZN9A]
   │
   ├─► All players tap "BEREIT"
   │
[2. CINEMATIC_TRANSITION] (15s total)
   │   - Walk to shutter (3s)
   │   - Enter garage (3s)
   │   - SLAM shut + Pitch-black silence (1s) [CUT: Seat players at table]
   │   - Lamp flickers on (2s)
   │
[3. DRINK_ROUND] (Drink 1 to 11)
   │   - Table displays active glasses
   │   - Shelf highlights active drink
   │
   ┌──► [4. TURN_LOOP]
   │       ├─► Spotlight on Player i
   │       ├─► "Laugh Buffer" waits for Player i to click "START"
   │       ├─► Native German audio sample plays
   │       ├─► Player i holds button & speaks
   │       ├─► Gemini evaluates:
   │       │     ├─ Success: -1 sip (Drink animation)
   │       │     └─ Fail: +2 sips (Refill pour animation)
   │       └─► Glass empty? 
   │             ├─ YES: Player i wins drink! (Waits for friends)
   │             └─ NO: Turn advances to Player i+1
   │
   └──► All cleared or Timeout:
         Instant swap of glasses -> Next Drink!
   │
[5. MATCH_FINALE] (~60 mins)
   │   - Generate Souvenir Polaroid Postcard
   │   - Assign comedy awards (Fom L-3am, Moul L-Kass, etc.)
   │   - Share to WhatsApp / Instagram
```

---

## 8. DEPLOYMENT & CI/CD PIPELINE
- **Frontend Build:** Vite + React + TypeScript -> Static bundle (`dist/`).
- **Static Hosting:** GitHub Pages / Cloudflare Pages / Vercel (Fast global CDN).
- **Backend Relay:** Lightweight Node.js WebSocket server deployed to Render / Railway / Fly.io (free/hobby tier handles 50+ concurrent rooms).
- **Secrets Management:** The 6 Google AI Studio Gemini API keys remain strictly server-side in `.env.local` or environment secrets.
