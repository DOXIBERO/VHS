# YOU'RE RIGHT. I APOLOGIZE. LET'S GO. 🚀

You're using **Antigravity** (Three.js → GitHub Pages, live preview, repo-linked). That changes EVERYTHING. No Unity needed. No downloads. Pure web. Let me build you the **complete 2000-part master prompt architecture**.

---

## ⚠️ HOW TO USE THIS

**You will NOT paste all 2000 parts at once.** You paste **ONE PHASE at a time** (or even 10-20 parts at a time), let Antigravity build it, review the live preview on your GitHub Pages, approve or fix, then paste the next batch.

**The golden rule:**
```
PASTE → AI BUILDS → YOU REVIEW ON GITHUB PAGES → 
"FIX THIS" or "PERFECT, NEXT" → PASTE NEXT BATCH
```

---

# 🗺️ THE COMPLETE 2000-PART ARCHITECTURE MAP

```
PHASE 0: BRAIN & BLUEPRINT .............. Parts 0001–0080  (80 parts)
PHASE 1: ENGINE FOUNDATION .............. Parts 0081–0200  (120 parts)
PHASE 2: PLAYER BEAN MODEL .............. Parts 0201–0240  (40 parts)
PHASE 3: PLAYER ANIMATIONS .............. Parts 0241–0290  (50 parts)
PHASE 4: PHYSICS & WOBBLE ............... Parts 0291–0370  (80 parts)
PHASE 5: INPUT & CONTROLS ............... Parts 0371–0430  (60 parts)
PHASE 6: GERMAN VOCAB DATABASE .......... Parts 0431–0510  (80 parts)
PHASE 7: AUDIO & VOICE SYSTEM ........... Parts 0511–0570  (60 parts)
PHASE 8: 3D TEXT & WORD GATES ........... Parts 0571–0640  (70 parts)
PHASE 9: OBSTACLE PIECES (MODULAR) ...... Parts 0641–0800  (160 parts)
PHASE 10: LEVEL GENERATOR ............... Parts 0801–0880  (80 parts)
PHASE 11: GAME MODES & RULES ............ Parts 0881–0960  (80 parts)
PHASE 12: AI BOT BEANS .................. Parts 0961–1040  (80 parts)
PHASE 13: UI / HUD / MENUS .............. Parts 1041–1140  (100 parts)
PHASE 14: SRS LEARNING ENGINE ........... Parts 1141–1220  (80 parts)
PHASE 15: PROGRESSION & UNLOCKS ......... Parts 1221–1280  (60 parts)
PHASE 16: ENVIRONMENT & MAP ............. Parts 1281–1420  (140 parts)
PHASE 17: PARTICLES & JUICE ............. Parts 1421–1500  (80 parts)
PHASE 18: MOBILE TOUCH CONTROLS ......... Parts 1501–1560  (60 parts)
PHASE 19: PERFORMANCE & OPTIMIZATION .... Parts 1561–1640  (80 parts)
PHASE 20: SAVE SYSTEM & PWA ............. Parts 1641–1700  (60 parts)
PHASE 21: POLISH & FINAL QA ............. Parts 1701–1800  (100 parts)
PHASE 22: GITHUB PAGES DEPLOY & META .... Parts 1801–1850  (50 parts)
PHASE 23: EXPANSION CONTENT ............. Parts 1851–2000  (150 parts)
```

---

# 📋 THE UNIVERSAL PROMPT TEMPLATE

Every single part follows this exact format. Copy this structure:

```
============================================
PART [XXXX/2000] | PHASE [X]: [NAME]
============================================
CONTEXT: [What already exists from previous parts]
DEPENDENCY: [Which part numbers must be done first]
TASK: [ONE single specific task — nothing more]
TECH: [Three.js / Cannon-es / Web Audio API / etc.]
FILES TO CREATE/EDIT: [exact filenames]
ACCEPTANCE CRITERIA:
  ✅ [Specific test 1]
  ✅ [Specific test 2]
OUTPUT: [What should appear on screen / in console]
STOP. Wait for my review before proceeding.
============================================
```

---

# 🧠 PHASE 0: BRAIN & BLUEPRINT (Parts 0001–0080)

*This phase creates ZERO visuals. It builds the entire logical architecture, data structures, and game rules inside the code. Nothing renders yet. This is the skeleton.*

---

**PART 0001/2000 | PHASE 0: BRAIN**
```
CONTEXT: Empty project. Nothing exists yet.
DEPENDENCY: None
TASK: Initialize the project structure. Create the root HTML file (index.html) 
with a full-screen canvas element, basic CSS reset (margin 0, overflow hidden, 
canvas 100vw x 100vh), and a single main.js module script tag. Create an empty 
style.css file. Create a /src folder structure: /src/core, /src/physics, 
/src/player, /src/levels, /src/audio, /src/ui, /src/data, /src/utils.
TECH: HTML5, CSS3, ES Modules
FILES: index.html, style.css, src/core/.gitkeep, src/physics/.gitkeep, 
src/player/.gitkeep, src/levels/.gitkeep, src/audio/.gitkeep, 
src/ui/.gitkeep, src/data/.gitkeep, src/utils/.gitkeep
ACCEPTANCE:
  ✅ GitHub Pages shows a blank black screen (no errors in console)
  ✅ Folder structure visible in repo
  ✅ No 404 errors in browser dev tools
STOP. Wait for review.
```

**PART 0002/2000 | PHASE 0: BRAIN**
```
CONTEXT: Project structure exists with blank HTML canvas.
DEPENDENCY: Part 0001
TASK: Install/import Three.js via CDN (unpkg or jsdelivr) using an importmap 
in index.html. Create src/core/Engine.js as an ES module class that imports 
THREE, creates a WebGLRenderer attached to the canvas, sets pixel ratio to 
window.devicePixelRatio, sets size to window.innerWidth/Height, and adds a 
resize event listener that updates camera aspect and renderer size.
TECH: Three.js r160+, ES Modules, Import Maps
FILES: index.html (edit), src/core/Engine.js (create)
ACCEPTANCE:
  ✅ No console errors
  ✅ Resizing browser window doesn't break anything
  ✅ WebGL context is active (check dev tools)
STOP. Wait for review.
```

**PART 0003/2000 | PHASE 0: BRAIN**
```
CONTEXT: Engine.js creates a Three.js renderer. No scene or camera yet.
DEPENDENCY: Part 0002
TASK: Inside Engine.js, add a THREE.PerspectiveCamera (FOV 60, near 0.1, 
far 1000) positioned at (0, 10, 20) looking at (0, 0, 0). Add a THREE.Scene 
with a neutral gray background color (0x87CEEB sky blue for now). Add the 
render loop using requestAnimationFrame that calls renderer.render(scene, camera).
TECH: Three.js
FILES: src/core/Engine.js (edit)
ACCEPTANCE:
  ✅ GitHub Pages shows a solid sky-blue screen
  ✅ Console logs "Engine initialized" once
STOP. Wait for review.
```

**PART 0004/2000 | PHASE 0: BRAIN**
```
CONTEXT: Scene renders a blue background. No game loop logic yet.
DEPENDENCY: Part 0003
TASK: Create src/core/GameLoop.js — a class that manages a fixed-timestep 
game loop (60fps target). It must separate update(dt) and render() calls. 
Use performance.now() for delta time calculation. Cap delta time at 0.05s 
to prevent physics explosions on tab-switch. Export a start() and stop() method.
TECH: Vanilla JS, performance API
FILES: src/core/GameLoop.js (create), src/core/Engine.js (edit to integrate)
ACCEPTANCE:
  ✅ Console logs FPS every 2 seconds (should show ~60)
  ✅ Tab-switching and returning doesn't cause objects to teleport
STOP. Wait for review.
```

**PART 0005/2000 | PHASE 0: BRAIN**
```
CONTEXT: Game loop runs at 60fps with fixed timestep.
DEPENDENCY: Part 0004
TASK: Create src/core/GameState.js — a finite state machine class with these 
states: BOOT, MENU, LOADING, COUNTDOWN, PLAYING, ROUND_END, GAME_OVER, 
RESULTS. Each state has onEnter(), onUpdate(dt), onExit() methods. Only one 
state active at a time. Add transition(newState) method that calls onExit 
on old state and onEnter on new state. Start in BOOT state.
TECH: Vanilla JS (State Pattern)
FILES: src/core/GameState.js (create)
ACCEPTANCE:
  ✅ Console logs "State: BOOT" on load
  ✅ Calling gameState.transition('MENU') logs "Exiting BOOT" then "Entering MENU"
  ✅ Invalid state transitions throw an error
STOP. Wait for review.
```

**PART 0006/2000 | PHASE 0: BRAIN**
```
CONTEXT: State machine exists with 8 states.
DEPENDENCY: Part 0005
TASK: Create src/core/EventBus.js — a simple publish/subscribe event system. 
Methods: on(event, callback), off(event, callback), emit(event, data). 
This will be the nervous system of the entire game. All systems communicate 
through this, never through direct imports of each other.
TECH: Vanilla JS (Observer Pattern)
FILES: src/core/EventBus.js (create)
ACCEPTANCE:
  ✅ EventBus.emit('test', {value: 42}) triggers a listener that logs 42
  ✅ EventBus.off() successfully removes a listener
  ✅ Multiple listeners on same event all fire
STOP. Wait for review.
```

**PART 0007/2000 | PHASE 0: BRAIN**
```
CONTEXT: EventBus, GameState, GameLoop, Engine all exist independently.
DEPENDENCY: Parts 0001-0006
TASK: Create src/core/Game.js — the master orchestrator class. It instantiates 
Engine, GameLoop, GameState, and EventBus. It wires them together: GameLoop 
calls GameState.update(dt) every frame. GameLoop calls Engine.render() every 
frame. GameState transitions emit events through EventBus. This is the SINGLE 
entry point of the entire application.
TECH: Vanilla JS (Facade Pattern)
FILES: src/core/Game.js (create), src/main.js (create as entry point)
ACCEPTANCE:
  ✅ Opening the page creates one Game instance
  ✅ Game loop runs, state machine is in BOOT, renderer shows blue sky
  ✅ Console: "Game initialized | State: BOOT | FPS: 60"
STOP. Wait for review.
```

**PART 0008/2000 | PHASE 0: BRAIN**
```
CONTEXT: Master Game orchestrator runs. Blue sky visible.
DEPENDENCY: Part 0007
TASK: Create src/data/VocabularyDB.js — the complete A0 German word database 
as a JSON-like JS object. Structure: array of objects, each with { id, german, 
english, category, difficulty, audioFile, imageEmoji }. Start with the first 
20 words across 4 categories: COLORS (rot, blau, grün, gelb, weiß, schwarz), 
NUMBERS (eins, zwei, drei, vier, fünf), DIRECTIONS (links, rechts, oben, 
unten), ACTIONS (springen, laufen, stoppen). Each word has difficulty 1.
TECH: Vanilla JS (Data Structure)
FILES: src/data/VocabularyDB.js (create)
ACCEPTANCE:
  ✅ VocabularyDB.getWordsByCategory('COLORS') returns 6 words
  ✅ VocabularyDB.getWordById('rot') returns {german:'rot', english:'red', ...}
  ✅ VocabularyDB.getRandomWords(5) returns 5 random unique words
STOP. Wait for review.
```

**PART 0009/2000 | PHASE 0: BRAIN**
```
CONTEXT: 20 A0 words exist in database.
DEPENDENCY: Part 0008
TASK: Expand VocabularyDB.js to 50 words. Add categories: FOOD (Apfel, Brot, 
Wasser, Kaffee, Döner, Käse, Ei, Milch), BODY (Kopf, Hand, Fuß, Auge, Ohr), 
ANIMALS (Hund, Katze, Vogel, Fisch, Maus), OBJECTS (Tisch, Stuhl, Tür, 
Fenster, Buch, Auto, Ball). All difficulty 1. Add a method getWordsByDifficulty(level).
TECH: Vanilla JS
FILES: src/data/VocabularyDB.js (edit)
ACCEPTANCE:
  ✅ Total word count = 50
  ✅ 8 categories exist
  ✅ getWordsByDifficulty(1) returns all 50
STOP. Wait for review.
```

**PART 0010/2000 | PHASE 0: BRAIN**
```
CONTEXT: 50 A0 words in database.
DEPENDENCY: Part 0009
TASK: Expand VocabularyDB.js to the full 100 A0 words. Add categories: 
CLOTHING (Hut, Schuh, Hose, Jacke, Kleid), WEATHER (Sonne, Regen, Schnee, 
Wind, Wolke), PLACES (Haus, Schule, Park, Straße, Laden, Späti, U-Bahn), 
TIME (Tag, Nacht, Morgen, Abend, Uhr, Stunde), ADJECTIVES (groß, klein, 
schnell, langsam, heiß, kalt, neu, alt, gut, schlecht), GREETINGS (Hallo, 
Tschüss, Danke, Bitte, Ja, Nein, Entschuldigung). Add difficulty levels 1-3 
based on word length and phonetic complexity.
TECH: Vanilla JS
FILES: src/data/VocabularyDB.js (edit)
ACCEPTANCE:
  ✅ Total word count = 100
  ✅ 14 categories
  ✅ Difficulty 1: ~40 words, Difficulty 2: ~35 words, Difficulty 3: ~25 words
  ✅ No duplicate IDs
STOP. Wait for review.
```

**PART 0011/2000 | PHASE 0: BRAIN**
```
CONTEXT: Full 100-word A0 database complete.
DEPENDENCY: Part 0010
TASK: Create src/data/SRSEngine.js — a Spaced Repetition System based on the 
SM-2 algorithm. Each word has: { easeFactor: 2.5, interval: 0, repetitions: 0, 
nextReview: Date, lastSeen: Date }. Methods: recordAnswer(wordId, quality) 
where quality is 0-5 (0=complete fail, 5=perfect). After each answer, 
recalculate interval and easeFactor per SM-2 formula. Method getDueWords(count) 
returns words most urgently needing review.
TECH: Vanilla JS (SM-2 Algorithm)
FILES: src/data/SRSEngine.js (create)
ACCEPTANCE:
  ✅ recordAnswer('rot', 5) increases interval to 1 day
  ✅ recordAnswer('rot', 0) resets interval to 0 and lowers easeFactor
  ✅ getDueWords(5) returns words sorted by urgency
  ✅ First-time words have interval 0 (always due)
STOP. Wait for review.
```

**PART 0012/2000 | PHASE 0: BRAIN**
```
CONTEXT: SRS engine calculates review intervals.
DEPENDENCY: Part 0011
TASK: Create src/data/PlayerProfile.js — stores player learning data. 
Structure: { totalWordsLearned, currentStreak, longestStreak, wordsMastered 
(array of wordIds with interval > 7 days), sessionHistory (array of 
{date, wordsReviewed, accuracy}), settings (language, audioVolume, 
sensitivity) }. Methods: completeWord(wordId), breakStreak(), 
incrementStreak(), getSessionStats().
TECH: Vanilla JS
FILES: src/data/PlayerProfile.js (create)
ACCEPTANCE:
  ✅ completeWord('rot') adds to wordsMastered after 7+ day interval
  ✅ breakStreak() resets currentStreak to 0
  ✅ getSessionStats() returns accuracy percentage
STOP. Wait for review.
```

**PART 0013/2000 | PHASE 0: BRAIN**
```
CONTEXT: Player profile tracks learning progress.
DEPENDENCY: Part 0012
TASK: Create src/data/RoundConfig.js — defines the structure of a game round. 
Properties: { roundId, mode ('race'|'survival'|'team'), duration (seconds), 
wordPool (array of wordIds), obstacleSequence (array of obstacle type strings), 
difficulty (1-3), playerCount, botCount }. Create 5 preset round configs: 
Round 1 (colors, 60s, easy), Round 2 (numbers, 90s, easy), Round 3 (directions, 
90s, medium), Round 4 (mixed, 120s, medium), Round 5 (all, 120s, hard).
TECH: Vanilla JS
FILES: src/data/RoundConfig.js (create)
ACCEPTANCE:
  ✅ RoundConfig.getRound(1) returns a valid config object
  ✅ Round 1 wordPool contains only color words
  ✅ Round 5 wordPool contains words from all categories
STOP. Wait for review.
```

**PART 0014/2000 | PHASE 0: BRAIN**
```
CONTEXT: Round configs define game structure.
DEPENDENCY: Part 0013
TASK: Create src/data/ObstacleRegistry.js — a registry of all obstacle types 
the game will support. Each entry: { type, name, difficulty, spaceRequired 
(width, length, height), wordInteraction (boolean), physicsType ('static'|
'dynamic'|'moving'), description }. Register these 15 types: DOOR_GATE, 
MOVING_PLATFORM, SWINGING_HAMMER, SLIME_ZONE, CONVEYOR_BELT, BUMPER, 
TRAMPOLINE, ICE_FLOOR, LAVA_FLOOR, SPINNING_LOG, FALLING_BLOCKS, 
WIND_TUNNEL, WORD_BRIDGE, COLOR_SORT, COUNTING_ZONE.
TECH: Vanilla JS (Registry Pattern)
FILES: src/data/ObstacleRegistry.js (create)
ACCEPTANCE:
  ✅ ObstacleRegistry.getAll() returns 15 types
  ✅ ObstacleRegistry.getByDifficulty(1) returns only easy obstacles
  ✅ DOOR_GATE has wordInteraction: true
  ✅ BUMPER has wordInteraction: false
STOP. Wait for review.
```

**PART 0015/2000 | PHASE 0: BRAIN**
```
CONTEXT: 15 obstacle types registered.
DEPENDENCY: Part 0014
TASK: Create src/data/LevelTemplates.js — pre-designed level layouts using 
obstacle sequences. Each template: { templateId, name, theme, segments 
(array of {obstacleType, position, rotation, config}) }. Create 3 templates: 
"Kreuzberg Colors" (4 door gates with color words), "Späti Numbers" (counting 
zones + conveyors), "U-Bahn Directions" (left/right doors + moving platforms).
TECH: Vanilla JS
FILES: src/data/LevelTemplates.js (create)
ACCEPTANCE:
  ✅ LevelTemplates.getTemplate('kreuzberg-colors') returns valid segment array
  ✅ Each segment has obstacleType that exists in ObstacleRegistry
  ✅ Templates are visually describable from the data alone
STOP. Wait for review.
```

**PART 0016-0020/2000 | PHASE 0: BRAIN**
```
CONTEXT: All data structures exist.
DEPENDENCY: Parts 0008-0015
TASK: Create src/data/GameRules.js — the central rules engine. Define:
- SCORING: correct word gate = +100pts, wrong gate = -50pts + 2s stun, 
  finish first = +500pts, survival bonus = +10pts/second alive
- ELIMINATION: soft elimination (respawn after 3s with -200pts penalty, 
  NOT permanent death)
- WIN CONDITIONS: Race = first to finish. Survival = last bean standing. 
  Team = team with most points.
- ROUND FLOW: 10s countdown → 60-120s gameplay → 10s results → next round
- STREAK BONUSES: 3 correct in a row = 2x multiplier, 5 correct = 3x
TECH: Vanilla JS
FILES: src/data/GameRules.js (create)
ACCEPTANCE:
  ✅ GameRules.calculateScore('correct_gate', {streak: 3}) returns 200
  ✅ GameRules.calculateScore('wrong_gate') returns -50
  ✅ GameRules.getEliminationType() returns 'soft'
  ✅ All win conditions are defined and testable
STOP. Wait for review.
```

**PART 0021-0030/2000 | PHASE 0: BRAIN**
```
CONTEXT: Game rules defined.
DEPENDENCY: Parts 0005-0020
TASK: Create src/core/SaveSystem.js — localStorage persistence layer. 
Auto-saves PlayerProfile, SRSEngine state, and settings every 30 seconds 
and on state transitions. Methods: save(), load(), reset(), exportJSON(), 
importJSON(). Handle corrupted data gracefully (fallback to defaults). 
Add version number to save data for future migration support.
TECH: Vanilla JS, localStorage API
FILES: src/core/SaveSystem.js (create)
ACCEPTANCE:
  ✅ save() writes to localStorage, load() reads it back identically
  ✅ Corrupted localStorage doesn't crash the game (falls back to defaults)
  ✅ exportJSON() returns a downloadable string
  ✅ Save version is "1.0.0"
STOP. Wait for review.
```

**PART 0031-0040/2000 | PHASE 0: BRAIN**
```
CONTEXT: Save system works.
DEPENDENCY: Parts 0006-0030
TASK: Wire all data systems into the EventBus. Create src/core/DataManager.js 
that initializes VocabularyDB, SRSEngine, PlayerProfile, RoundConfig, 
ObstacleRegistry, LevelTemplates, GameRules, and SaveSystem in the correct 
order. Emit 'data:ready' event when all systems loaded. Listen for 
'game:roundEnd' to trigger SRS updates. Listen for 'player:answer' to 
record in profile. This is the data backbone.
TECH: Vanilla JS
FILES: src/core/DataManager.js (create), src/core/Game.js (edit to include)
ACCEPTANCE:
  ✅ On boot, console shows "DataManager: All 8 systems initialized"
  ✅ EventBus 'data:ready' fires after initialization
  ✅ Simulated 'player:answer' event updates SRS and Profile
STOP. Wait for review.
```

**PART 0041-0060/2000 | PHASE 0: BRAIN**
```
CONTEXT: Data backbone complete and wired.
DEPENDENCY: All previous parts
TASK: Create the complete AI Bot behavior system in src/player/BotBrain.js. 
Each bot has: { name, skillLevel (0.0-1.0), vocabularyKnowledge (array of 
known wordIds), reactionTime (ms), wobbleIntensity, aggression }. 
Decision loop: every 500ms, bot evaluates nearest word gate → checks if 
it "knows" the word (based on skillLevel probability) → if yes, runs to 
correct door → if no, follows random other bot or guesses. Bots can make 
mistakes intentionally based on skillLevel. Create 10 preset bot 
personalities (e.g., "Hans" skill 0.9, "Fritz" skill 0.3, "Greta" skill 0.7).
TECH: Vanilla JS (Behavior Tree simplified)
FILES: src/player/BotBrain.js (create), src/data/BotPresets.js (create)
ACCEPTANCE:
  ✅ BotBrain.decide(wordGate, knownWords) returns 'correct' or 'wrong' 
     based on probability
  ✅ 10 bot presets with unique names and skill levels
  ✅ A skill 0.9 bot answers correctly ~90% of the time in simulation
  ✅ A skill 0.2 bot answers correctly ~20% of the time
STOP. Wait for review.
```

**PART 0061-0080/2000 | PHASE 0: BRAIN**
```
CONTEXT: All logic systems complete. No visuals yet.
DEPENDENCY: All previous parts
TASK: Create src/core/DebugPanel.js — an on-screen debug overlay (toggle 
with 'D' key) that shows: current FPS, active game state, player position 
(x,y,z), current round config, SRS due word count, bot count, memory usage. 
Also create src/core/ConsoleLogger.js that color-codes console messages by 
system ([PHYSICS] blue, [AUDIO] green, [GAME] yellow, [ERROR] red).
TECH: Vanilla JS, HTML overlay
FILES: src/core/DebugPanel.js (create), src/core/ConsoleLogger.js (create)
ACCEPTANCE:
  ✅ Pressing 'D' shows/hides a semi-transparent overlay in top-left
  ✅ FPS counter updates every 500ms
  ✅ Console messages are color-coded by system
  ✅ Debug panel shows "State: BOOT" currently
STOP. Wait for review.
```

---

# 🏗️ PHASE 1: ENGINE FOUNDATION (Parts 0081–0200)

*Now we start building the 3D world. Every part adds ONE visible thing.*

**PART 0081/2000 | PHASE 1: ENGINE**
```
CONTEXT: Blue sky renders. All logic systems ready but invisible.
DEPENDENCY: Parts 0001-0080
TASK: Add a ground plane to the scene. Create src/levels/Ground.js — a 
THREE.Mesh with PlaneGeometry(100, 100), MeshStandardMaterial color 0x4a7c59 
(grass green), rotated -90° on X axis, receiving shadows. Add it to the scene.
TECH: Three.js
FILES: src/levels/Ground.js (create), src/core/Engine.js (edit to add ground)
ACCEPTANCE:
  ✅ Green ground plane visible below the camera
  ✅ Sky blue above, green below — looks like a basic outdoor scene
STOP. Wait for review.
```

**PART 0082/2000 | PHASE 1: ENGINE**
```
CONTEXT: Ground plane exists.
DEPENDENCY: Part 0081
TASK: Add lighting. Create src/core/Lighting.js — add THREE.AmbientLight 
(0xffffff, intensity 0.4), THREE.DirectionalLight (0xffffff, intensity 1.0) 
positioned at (10, 20, 10) casting shadows, and THREE.HemisphereLight 
(sky: 0x87CEEB, ground: 0x4a7c59, intensity 0.3). Enable shadow map on renderer 
(PCFSoftShadowMap).
TECH: Three.js
FILES: src/core/Lighting.js (create), src/core/Engine.js (edit)
ACCEPTANCE:
  ✅ Ground has visible shadows and depth
  ✅ Scene looks 3D, not flat
  ✅ No performance drop below 55fps
STOP. Wait for review.
```

**PART 0083-0090/2000 | PHASE 1: ENGINE**
```
CONTEXT: Scene has ground and lighting.
DEPENDENCY: Parts 0081-0082
TASK: Install cannon-es (physics engine) via CDN import map. Create 
src/physics/PhysicsWorld.js — initialize CANNON.World with gravity (0, -9.82, 0). 
Create methods: addBody(body), removeBody(body), step(dt). Sync Three.js 
meshes with Cannon.js bodies each frame (copy position and quaternion). 
Create a physics ground plane (CANNON.Plane) matching the visual ground.
TECH: cannon-es (CDN), Three.js
FILES: src/physics/PhysicsWorld.js (create), index.html (add cannon-es CDN), 
src/core/Engine.js (edit to step physics)
ACCEPTANCE:
  ✅ Physics world steps at 60fps
  ✅ A test sphere dropped from height falls and stops on the ground
  ✅ Visual mesh position matches physics body position
STOP. Wait for review.
```

**PART 0091-0100/2000 | PHASE 1: ENGINE**
```
CONTEXT: Physics world running with gravity.
DEPENDENCY: Parts 0083-0090
TASK: Create src/physics/PhysicsMaterials.js — define CANNON.Materials for: 
BEAN (friction 0.3, restitution 0.6 — bouncy), GROUND (friction 0.5, 
restitution 0.1), ICE (friction 0.02, restitution 0.3), SLIME (friction 0.9, 
restitution 0.0), RUBBER (friction 0.8, restitution 0.9). Create contact 
materials between each pair with appropriate friction/restitution values.
TECH: cannon-es
FILES: src/physics/PhysicsMaterials.js (create), src/physics/PhysicsWorld.js (edit)
ACCEPTANCE:
  ✅ 5 materials defined
  ✅ Contact material between BEAN and ICE has friction < 0.05
  ✅ Contact material between BEAN and RUBBER has restitution > 0.8
STOP. Wait for review.
```

**PART 0101-0120/2000 | PHASE 1: ENGINE**
```
CONTEXT: Physics materials defined.
DEPENDENCY: Parts 0091-0100
TASK: Create src/physics/CollisionManager.js — handles all collision events. 
Listen to CANNON.World 'beginContact' and 'endContact' events. When a bean 
body contacts a gate body, emit 'collision:bean-gate' with {beanId, gateId, 
gateWord} through EventBus. When bean contacts slime, emit 'collision:bean-slime'. 
When bean contacts trampoline, emit 'collision:bean-trampoline' with force 
vector. Tag all physics bodies with userData: {type, id} for identification.
TECH: cannon-es, EventBus
FILES: src/physics/CollisionManager.js (create)
ACCEPTANCE:
  ✅ Two test bodies colliding emit the correct EventBus event
  ✅ Collision data includes both body IDs
  ✅ No memory leaks from event listeners (test with 1000 collisions)
STOP. Wait for review.
```

**PART 0121-0150/2000 | PHASE 1: ENGINE**
```
CONTEXT: Collision system active.
DEPENDENCY: Parts 0101-0120
TASK: Create src/core/CameraController.js — a third-person follow camera. 
Properties: { target (object to follow), offset (0, 8, 12), lerpSpeed (0.05), 
lookAhead (2 units in movement direction) }. The camera smoothly lerps to 
target position + offset every frame. When the bean moves left, camera 
slightly shifts right (and vice versa) for better visibility. Add a "shake" 
method for impacts (decaying random offset over 0.3s).
TECH: Three.js
FILES: src/core/CameraController.js (create), src/core/Engine.js (edit)
ACCEPTANCE:
  ✅ Camera follows a test moving sphere smoothly
  ✅ Camera doesn't snap — smooth lerp interpolation
  ✅ Camera shake works and decays to zero
  ✅ Camera stays above the ground (minimum Y = 2)
STOP. Wait for review.
```

**PART 0151-0180/2000 | PHASE 1: ENGINE**
```
CONTEXT: Camera system works.
DEPENDENCY: Parts 0121-0150
TASK: Create src/core/AssetLoader.js — a centralized loading manager using 
THREE.LoadingManager. Methods: loadGLTF(url), loadTexture(url), loadAudio(url). 
Track loading progress (0-100%). Emit 'loading:progress' and 'loading:complete' 
through EventBus. Add a simple loading screen HTML overlay with a progress bar 
that listens to these events.
TECH: Three.js, GLTFLoader
FILES: src/core/AssetLoader.js (create), index.html (add loading overlay div), 
style.css (loading bar styles)
ACCEPTANCE:
  ✅ Loading overlay shows "Loading... 0%" on boot
  ✅ Progress bar fills as assets load
  ✅ Overlay disappears when 'loading:complete' fires
  ✅ Failed asset loads show error but don't crash
STOP. Wait for review.
```

**PART 0181-0200/2000 | PHASE 1: ENGINE**
```
CONTEXT: Asset loader and loading screen work.
DEPENDENCY: Parts 0151-0180
TASK: Create src/core/ObjectPool.js — a reusable object pool system to avoid 
garbage collection spikes. Generic class ObjectPool<T> with methods: 
acquire() returns an inactive object from pool or creates new one, 
release(obj) deactivates and returns to pool, prewarm(count) creates N 
objects upfront. Use this for: particles, sound effects, bot beans, 
obstacle segments. This is critical for mobile performance.
TECH: Vanilla JS (Object Pool Pattern)
FILES: src/core/ObjectPool.js (create)
ACCEPTANCE:
  ✅ Pool of 10 objects: acquire() 10 times returns same instances
  ✅ release() + acquire() reuses the released object (no new allocation)
  ✅ prewarm(50) creates 50 objects instantly
  ✅ Console shows 0 garbage collection warnings during rapid acquire/release
STOP. Wait for review.
```

---

# 🫘 PHASE 2: PLAYER BEAN MODEL (Parts 0201–0240)

*Now we build the actual bean character, piece by piece. This is the most 
important visual element. Every part adds one body piece or detail.*

**PART 0201/2000 | PHASE 2: PLAYER MODEL**
```
CONTEXT: 3D scene with ground, lighting, physics, camera. No character yet.
DEPENDENCY: Parts 0081-0200
TASK: Create src/player/BeanBody.js — the main bean torso. Use a 
THREE.CapsuleGeometry (radius 0.5, length 0.8, capSegments 8, radialSegments 16) 
with MeshStandardMaterial in bright yellow (0xFFD700). Position at (0, 1, 0). 
Add a CANNON.Sphere body (radius 0.6) for physics. The bean should sit on 
the ground, not fall through it.
TECH: Three.js, cannon-es
FILES: src/player/BeanBody.js (create)
ACCEPTANCE:
  ✅ Yellow capsule bean visible standing on the green ground
  ✅ Bean doesn't fall through the floor
  ✅ Bean casts a shadow on the ground
STOP. Wait for review.
```

**PART 0202/2000 | PHASE 2: PLAYER MODEL**
```
CONTEXT: Yellow bean torso exists.
DEPENDENCY: Part 0201
TASK: Add the bean's belly bump. Create a slightly larger THREE.SphereGeometry 
(radius 0.55) merged or grouped with the torso, positioned at (0, -0.1, 0.15) 
to create a cute protruding belly. Same yellow material. This gives the bean 
its signature "fat CJ" silhouette from the side view.
TECH: Three.js (Group hierarchy)
FILES: src/player/BeanBody.js (edit)
ACCEPTANCE:
  ✅ Bean looks slightly chubby from the side
  ✅ Belly is subtle, not grotesque — cute proportions
  ✅ Physics body still matches visual (no clipping through floor)
STOP. Wait for review.
```

**PART 0203/2000 | PHASE 2: PLAYER MODEL**
```
CONTEXT: Bean has torso and belly.
DEPENDENCY: Part 0202
TASK: Add the bean's head. Create a THREE.SphereGeometry (radius 0.35) 
positioned at (0, 0.75, 0) — sitting on top of the torso. Same yellow 
material. Group it under the main bean Group so it moves with the body.
TECH: Three.js
FILES: src/player/BeanBody.js (edit)
ACCEPTANCE:
  ✅ Bean now has a round head on top — looks like a snowman/bean hybrid
  ✅ Head moves with body when physics body moves
STOP. Wait for review.
```

**PART 0204/2000 | PHASE 2: PLAYER MODEL**
```
CONTEXT: Bean has head.
DEPENDENCY: Part 0203
TASK: Add eyes. Create two THREE.SphereGeometry (radius 0.08) with white 
material (0xFFFFFF) positioned at (-0.12, 0.8, 0.28) and (0.12, 0.8, 0.28). 
Add two smaller black pupils (radius 0.04, 0x000000) slightly forward on 
each white sphere. The bean should look forward in the +Z direction.
TECH: Three.js
FILES: src/player/BeanBody.js (edit)
ACCEPTANCE:
  ✅ Bean has two cute white eyes with black pupils
  ✅ Eyes face forward (+Z direction)
  ✅ Eyes are proportionally large (cute cartoon style)
STOP. Wait for review.
```

**PART 0205/2000 | PHASE 2: PLAYER MODEL**
```
CONTEXT: Bean has eyes.
DEPENDENCY: Part 0204
TASK: Add a mouth. Create a THREE.TorusGeometry (radius 0.08, tube 0.02, 
8, 16, Math.PI) — a half-circle smile — with black material, positioned at 
(0, 0.68, 0.3), rotated to face forward. The bean should look happy.
TECH: Three.js
FILES: src/player/BeanBody.js (edit)
ACCEPTANCE:
  ✅ Bean has a small smile below the eyes
  ✅ Face looks friendly and cartoon-like
STOP. Wait for review.
```

**PART 0206/2000 | PHASE 2: PLAYER MODEL**
```
CONTEXT: Bean has face.
DEPENDENCY: Part 0205
TASK: Add arms. Create two THREE.CapsuleGeometry (radius 0.12, length 0.4) 
with yellow material. Left arm at (-0.55, 0.2, 0) rotated 30° outward on Z. 
Right arm at (0.55, 0.2, 0) rotated -30° outward on Z. Arms should look 
stubby and round, not long and thin.
TECH: Three.js
FILES: src/player/BeanBody.js (edit)
ACCEPTANCE:
  ✅ Bean has two stubby arms sticking out at angles
  ✅ Arms look like bean arms (short, round, cute)
  ✅ Total bean silhouette is recognizable as a Fall Guys-style character
STOP. Wait for review.
```

**PART 0207/2000 | PHASE 2: PLAYER MODEL**
```
CONTEXT: Bean has arms.
DEPENDENCY: Part 0206
TASK: Add hands. Create two THREE.SphereGeometry (radius 0.13) at the end 
of each arm. Slightly darker yellow (0xE6C200) to distinguish from arms. 
Left hand at (-0.75, 0.0, 0), right hand at (0.75, 0.0, 0).
TECH: Three.js
FILES: src/player/BeanBody.js (edit)
ACCEPTANCE:
  ✅ Bean has round ball hands at the end of each arm
  ✅ Hands are slightly darker than the body
STOP. Wait for review.
```

**PART 0208/2000 | PHASE 2: PLAYER MODEL**
```
CONTEXT: Bean has hands.
DEPENDENCY: Part 0207
TASK: Add legs. Create two THREE.CapsuleGeometry (radius 0.15, length 0.3) 
positioned at (-0.2, -0.65, 0) and (0.2, -0.65, 0). Same yellow material. 
Short and stubby like the arms.
TECH: Three.js
FILES: src/player/BeanBody.js (edit)
ACCEPTANCE:
  ✅ Bean has two short stubby legs
  ✅ Bean stands upright on the legs (not floating)
STOP. Wait for review.
```

**PART 0209/2000 | PHASE 2: PLAYER MODEL**
```
CONTEXT: Bean has legs.
DEPENDENCY: Part 0208
TASK: Add feet/shoes. Create two THREE.BoxGeometry (0.2, 0.12, 0.3) with 
rounded edges (use RoundedBoxGeometry or bevel) in bright red (0xFF3333). 
Position at (-0.2, -0.85, 0.05) and (0.2, -0.85, 0.05). The red shoes 
give the bean personality.
TECH: Three.js
FILES: src/player/BeanBody.js (edit)
ACCEPTANCE:
  ✅ Bean has cute red shoes
  ✅ Shoes touch the ground plane
  ✅ Bean silhouette is now complete: head, body, arms, legs, shoes
STOP. Wait for review.
```

**PART 0210/2000 | PHASE 2: PLAYER MODEL**
```
CONTEXT: Complete bean model assembled.
DEPENDENCY: Part 0209
TASK: Add a Berlin-style accessory — a tiny flat cap (Mütze). Create using 
THREE.CylinderGeometry (radiusTop 0.25, radiusBottom 0.3, height 0.1, 16) 
in dark gray (0x333333), positioned on top of the head at (0, 1.05, 0), 
slightly tilted forward (rotation X: -0.2). Add a small brim using 
THREE.BoxGeometry (0.15, 0.02, 0.15) at the front.
TECH: Three.js
FILES: src/player/BeanBody.js (edit)
ACCEPTANCE:
  ✅ Bean wears a tiny Berlin flat cap
  ✅ Cap is slightly tilted forward — looks casual/cool
  ✅ Cap doesn't clip through the head
STOP. Wait for review.
```

**PART 0211-0220/2000 | PHASE 2: PLAYER MODEL**
```
CONTEXT: Bean model complete with cap.
DEPENDENCY: Parts 0201-0210
TASK: Create src/player/BeanCustomization.js — a skin/costume system. 
Define 5 color palettes: CLASSIC (yellow body, red shoes), KREUZBERG 
(black body, green shoes, gold chain), SPÄTI (white body, blue shoes, 
apron), U-BAHN (gray body, yellow shoes, stripe), BERGHAIN (all black, 
leather texture). Method applySkin(skinName) changes materials on all 
body parts. Store current skin in PlayerProfile.
TECH: Three.js (Material swapping)
FILES: src/player/BeanCustomization.js (create), src/player/BeanBody.js (edit 
to expose material references)
ACCEPTANCE:
  ✅ applySkin('KREUZBERG') turns bean black with green shoes instantly
  ✅ applySkin('CLASSIC') restores original yellow
  ✅ 5 skins all look distinct and recognizable
  ✅ Skin change doesn't break physics or animations
STOP. Wait for review.
```

**PART 0221-0230/2000 | PHASE 2: PLAYER MODEL**
```
CONTEXT: Skin system works.
DEPENDENCY: Parts 0211-0220
TASK: Add a gold chain accessory for the KREUZBERG skin. Create using 
THREE.TorusGeometry (radius 0.3, tube 0.02, 8, 32) in gold material 
(MeshStandardMaterial color 0xFFD700, metalness 0.9, roughness 0.1). 
Position around the bean's neck at (0, 0.5, 0.1). Add a small pendant 
(THREE.OctahedronGeometry, radius 0.06) hanging from the front.
TECH: Three.js
FILES: src/player/BeanCustomization.js (edit)
ACCEPTANCE:
  ✅ KREUZBERG skin shows a shiny gold chain with pendant
  ✅ Chain sits naturally around the neck area
  ✅ Gold material reflects light (metalness visible)
STOP. Wait for review.
```

**PART 0231-0240/2000 | PHASE 2: PLAYER MODEL**
```
CONTEXT: Bean model and customization complete.
DEPENDENCY: Parts 0221-0230
TASK: Create src/player/BeanFactory.js — uses the ObjectPool system to 
create and recycle bean instances. Method createBean(config) returns a 
bean Group with physics body, applies skin, sets initial position. 
Method destroyBean(bean) removes from scene and physics, returns to pool. 
Prewarm 20 beans for multiplayer rounds.
TECH: Three.js, cannon-es, ObjectPool
FILES: src/player/BeanFactory.js (create)
ACCEPTANCE:
  ✅ createBean() spawns a fully assembled bean at given position
  ✅ destroyBean() removes it cleanly (no memory leaks)
  ✅ Prewarmed beans are created in < 50ms total
  ✅ 20 beans on screen maintain 60fps
STOP. Wait for review.
```

---

# 🎬 PHASE 3: ANIMATIONS (Parts 0241–0290)

*Procedural animations — no keyframe files needed. All math-driven.*

**PART 0241-0250/2000 | PHASE 3: ANIMATIONS**
```
CONTEXT: Bean model exists but is completely static/rigid.
DEPENDENCY: Parts 0201-0240
TASK: Create src/player/BeanAnimator.js — the procedural animation controller. 
Implement an IDLE animation: the bean's body gently bobs up and down 
(Math.sin(time * 2) * 0.05 on Y), the head tilts slightly side to side 
(Math.sin(time * 1.5) * 0.03 on Z), and the arms sway gently 
(Math.sin(time * 1.8) * 0.1 on Z rotation). All animations are additive 
and layered.
TECH: Three.js (Procedural Animation)
FILES: src/player/BeanAnimator.js (create), src/player/BeanBody.js (edit to 
expose limb references)
ACCEPTANCE:
  ✅ Idle bean bobs gently like it's breathing
  ✅ Head tilts subtly — looks alive, not frozen
  ✅ Arms sway slightly — natural resting motion
  ✅ Animation is smooth at 60fps (no jitter)
STOP. Wait for review.
```

**PART 0251-0260/2000 | PHASE 3: ANIMATIONS**
```
CONTEXT: Idle animation works.
DEPENDENCY: Parts 0241-0250
TASK: Add RUN animation. When bean velocity > 0.5: legs alternate forward/
back (Math.sin(time * 10) * 0.5 on X rotation), arms swing opposite to 
legs, body leans forward 15° (rotation X: -0.25), head bobs faster. 
Blend smoothly between IDLE and RUN over 0.2 seconds using lerp.
TECH: Three.js (Animation Blending)
FILES: src/player/BeanAnimator.js (edit)
ACCEPTANCE:
  ✅ Bean legs alternate when moving — looks like running
  ✅ Arms swing opposite to legs (natural gait)
  ✅ Body leans forward when running
  ✅ Smooth transition from idle to run (no snap)
STOP. Wait for review.
```

**PART 0261-0270/2000 | PHASE 3: ANIMATIONS**
```
CONTEXT: Run animation works.
DEPENDENCY: Parts 0251-0260
TASK: Add JUMP and FALL animations. JUMP: legs tuck up (rotation X: 0.8), 
arms raise above head (rotation Z: ±2.5), body squishes vertically 
(scaleY: 0.8, scaleX: 1.2) then stretches (scaleY: 1.2, scaleX: 0.9). 
FALL: arms flail randomly (Math.random() * 0.5 on all axes per frame), 
legs dangle, head looks down (rotation X: 0.3).
TECH: Three.js
FILES: src/player/BeanAnimator.js (edit)
ACCEPTANCE:
  ✅ Jumping bean tucks legs and raises arms
  ✅ Falling bean flails arms comically
  ✅ Squash-and-stretch on jump feels bouncy and satisfying
STOP. Wait for review.
```

**PART 0271-0280/2000 | PHASE 3: ANIMATIONS**
```
CONTEXT: Jump and fall animations work.
DEPENDENCY: Parts 0261-0270
TASK: Add DIVE, STUMBLE, and VICTORY animations. DIVE: bean rotates 90° 
forward (rotation X: -1.5), arms stretch forward, legs straight back — 
horizontal flying pose. STUMBLE: bean tilts 45° to one side, one arm 
flails, legs cross — triggered when hitting an obstacle. VICTORY: bean 
jumps repeatedly, arms pump up and down, head tilts back — triggered on 
round win.
TECH: Three.js
FILES: src/player/BeanAnimator.js (edit)
ACCEPTANCE:
  ✅ Dive looks like a horizontal belly flop
  ✅ Stumble looks like tripping — comedic timing
  ✅ Victory animation is celebratory and bouncy
STOP. Wait for review.
```

**PART 0281-0290/2000 | PHASE 3: ANIMATIONS**
```
CONTEXT: All basic animations exist.
DEPENDENCY: Parts 0271-0280
TASK: Add RAGDOLL mode. When bean is "eliminated" or hit hard: disable 
all procedural animations, switch physics body to full ragdoll (create 
individual CANNON bodies for head, torso, left arm, right arm, left leg, 
right leg connected with CANNON.ConeTwistConstraint). Bean tumbles 
realistically. After 3 seconds, auto-recover: reassemble bean, switch 
back to single physics body, play STUMBLE recovery animation.
TECH: cannon-es (Constraints), Three.js
FILES: src/player/BeanRagdoll.js (create), src/player/BeanAnimator.js (edit)
ACCEPTANCE:
  ✅ Ragdoll bean tumbles realistically when hit
  ✅ Limbs flail independently during ragdoll
  ✅ Auto-recovery after 3 seconds — bean stands back up
  ✅ Transition from ragdoll to standing is smooth, not jarring
STOP. Wait for review.
```

---

# ⚙️ PHASE 4: PHYSICS & WOBBLE (Parts 0291–0370)

**PART 0291-0310/2000 | PHASE 4: WOBBLE**
```
CONTEXT: Bean has animations but moves rigidly through space.
DEPENDENCY: Parts 0241-0290
TASK: Create src/physics/WobbleSystem.js — the signature wobbly physics 
layer. Apply a spring-damper system to the bean's visual rotation that 
lags behind the physics body rotation. Parameters: { springStrength: 15, 
damping: 3, maxTilt: 0.4 radians }. When the bean changes direction, the 
visual body leans INTO the turn like a motorcycle, then overshoots and 
wobbles back. When the bean stops suddenly, it wobbles forward and back 
2-3 times before settling. This is the Fall Guys "feel."
TECH: cannon-es, Spring-Damper Math
FILES: src/physics/WobbleSystem.js (create), src/player/BeanBody.js (edit)
ACCEPTANCE:
  ✅ Bean leans into turns (like a motorcycle)
  ✅ Bean wobbles 2-3 times when stopping suddenly
  ✅ Wobble is funny but not nauseating
  ✅ Wobble intensity is configurable (for different surfaces)
STOP. Wait for review.
```

**PART 0311-0340/2000 | PHASE 4: WOBBLE**
```
CONTEXT: Wobble system active.
DEPENDENCY: Parts 0291-0310
TASK: Add surface-specific wobble modifiers. ICE: wobble intensity 3x, 
damping 0.5x (slides everywhere). SLIME: wobble intensity 0.5x, damping 
3x (stuck, heavy). TRAMPOLINE: on contact, apply upward impulse 
(velocity.y = 15) and squash animation. CONVEYOR: add constant lateral 
force to physics body. BUMPER: on contact, apply radial impulse away 
from bumper center (force = 20).
TECH: cannon-es
FILES: src/physics/SurfaceModifiers.js (create), src/physics/CollisionManager.js (edit)
ACCEPTANCE:
  ✅ Bean slides uncontrollably on ice (funny)
  ✅ Bean moves slowly and heavily on slime
  ✅ Bean bounces high on trampoline with squash effect
  ✅ Bean gets pushed by conveyor belt
  ✅ Bean bounces off bumpers like a pinball
STOP. Wait for review.
```

**PART 0341-0370/2000 | PHASE 4: WOBBLE**
```
CONTEXT: Surface physics working.
DEPENDENCY: Parts 0311-0340
TASK: Add bean-to-bean collision physics. When two beans collide: both 
receive a bounce impulse away from each other (force proportional to 
relative velocity), both trigger STUMBLE animation, both get a 0.5s 
wobble intensity boost. Add a "grab" mechanic: if player holds grab 
button near another bean, attach a CANNON.DistanceConstraint between 
them (max distance 1.5). This lets players grab and drag each other.
TECH: cannon-es (Constraints)
FILES: src/physics/BeanCollision.js (create)
ACCEPTANCE:
  ✅ Two beans running into each other bounce off comically
  ✅ Both beans stumble on impact
  ✅ Grab mechanic connects two beans with a visible stretch
  ✅ Releasing grab sends both beans flying apart
STOP. Wait for review.
```

---

# 🎮 PHASE 5: INPUT & CONTROLS (Parts 0371–0430)

**PART 0371-0390/2000 | PHASE 5: INPUT**
```
CONTEXT: Bean has physics and wobble but can't be controlled.
DEPENDENCY: Parts 0291-0370
TASK: Create src/core/InputManager.js — keyboard input handler. Track 
key states (pressed, held, released) for: W/↑ (forward), S/↓ (backward), 
A/← (left), D/→ (right), SPACE (jump), SHIFT (dive), E (grab). Apply 
forces to the bean's physics body based on input: forward force = 8, 
strafe force = 5, jump impulse = 10. Add input smoothing (lerp between 
current and target force over 0.1s) to prevent jerky movement.
TECH: Vanilla JS (KeyboardEvent)
FILES: src/core/InputManager.js (create), src/player/BeanBody.js (edit to 
accept forces)
ACCEPTANCE:
  ✅ WASD moves the bean in 4 directions
  ✅ SPACE makes the bean jump
  ✅ Movement feels smooth, not instant/snappy
  ✅ Bean wobbles naturally when changing direction
STOP. Wait for review.
```

**PART 0391-0410/2000 | PHASE 5: INPUT**
```
CONTEXT: Keyboard controls work.
DEPENDENCY: Parts 0371-0390
TASK: Add mouse/touch look control. The bean faces the direction of the 
mouse cursor (or touch drag direction). Calculate angle from bean position 
to mouse world position using THREE.Raycaster on the ground plane. Smoothly 
rotate bean's Y rotation toward target angle (lerp speed 0.1). The camera 
stays behind the bean relative to this facing direction.
TECH: Three.js (Raycaster), Vanilla JS (MouseEvent/TouchEvent)
FILES: src/core/InputManager.js (edit)
ACCEPTANCE:
  ✅ Bean faces mouse cursor direction
  ✅ Camera orbits behind the bean's facing direction
  ✅ Movement is relative to camera (W = forward in camera view)
  ✅ Smooth rotation, no snapping
STOP. Wait for review.
```

**PART 0411-0430/2000 | PHASE 5: INPUT**
```
CONTEXT: Mouse look and keyboard movement work.
DEPENDENCY: Parts 0391-0410
TASK: Create src/core/TouchControls.js — mobile virtual joystick. Render 
a semi-transparent circle (CSS) in the bottom-left corner. Touch and drag 
inside the circle to control movement direction and speed (distance from 
center = speed). Add a JUMP button (bottom-right, large circle) and a 
DIVE button (above jump, smaller). All touch controls emit the same 
events as keyboard so the rest of the game doesn't know the difference.
TECH: Vanilla JS (TouchEvent), CSS
FILES: src/core/TouchControls.js (create), index.html (add touch UI divs), 
style.css (touch styles)
ACCEPTANCE:
  ✅ Virtual joystick appears on touch devices
  ✅ Dragging joystick moves the bean proportionally
  ✅ Jump and dive buttons work
  ✅ No ghost touches or multi-touch conflicts
  ✅ Desktop shows no touch controls (hidden via media query)
STOP. Wait for review.
```

---

# 🇩🇪 PHASE 6: GERMAN VOCAB SYSTEM (Parts 0431–0510)

**PART 0431-0450/2000 | PHASE 6: VOCAB**
```
CONTEXT: Bean moves and wobbles. No German words in the game yet.
DEPENDENCY: Parts 0371-0430
TASK: Create src/audio/GermanVoice.js — audio playback system for German 
words. Use the Web Speech API (SpeechSynthesis) as a fallback voice 
generator. Method speak(word, speed=0.8, pitch=1.0) speaks a German word 
using a German voice (lang: 'de-DE'). Queue system: if multiple words 
are requested, play them sequentially. Method preload(word) — pre-generate 
the utterance to reduce latency.
TECH: Web Speech API (SpeechSynthesis)
FILES: src/audio/GermanVoice.js (create)
ACCEPTANCE:
  ✅ GermanVoice.speak('rot') audibly says "rot" in German
  ✅ GermanVoice.speak('Entschuldigung') pronounces correctly
  ✅ Words queue properly (no overlapping speech)
  ✅ Works on Chrome mobile (test with user gesture requirement)
STOP. Wait for review.
```

**PART 0451-0470/2000 | PHASE 6: VOCAB**
```
CONTEXT: German voice system works.
DEPENDENCY: Parts 0431-0450
TASK: Create src/ui/WordDisplay3D.js — renders German words as giant 3D 
text in the game world. Use THREE.TextGeometry or canvas-based text 
sprites (faster). Words appear floating above gates, platforms, and zones. 
Text is LARGE (2m tall), bold, white with black outline, always faces 
camera (billboard). Method showWord(position, word, color, duration).
TECH: Three.js (CanvasTexture for text sprites)
FILES: src/ui/WordDisplay3D.js (create)
ACCEPTANCE:
  ✅ Giant "ROT" text floats in the 3D scene
  ✅ Text always faces the camera (readable from any angle)
  ✅ Text has black outline for readability against any background
  ✅ Text fades out after duration expires
STOP. Wait for review.
```

**PART 0471-0490/2000 | PHASE 6: VOCAB**
```
CONTEXT: 3D text and voice work independently.
DEPENDENCY: Parts 0451-0470
TASK: Create src/levels/WordGate.js — the core learning mechanic. A WordGate 
is a wall with 2-4 doors, each labeled with a German word (3D text above 
each door). An audio cue plays the correct word. Only the correct door 
is passable (physics: other doors are solid walls). When the player runs 
through the correct door: green flash, +100 points, success sound, SRS 
update. Wrong door: red flash, bounce back, -50 points, STUMBLE animation.
TECH: Three.js, cannon-es, EventBus
FILES: src/levels/WordGate.js (create)
ACCEPTANCE:
  ✅ 3 doors appear with "ROT", "BLAU", "GRÜN" above them
  ✅ Audio says "BLAU"
  ✅ Running through BLAU door: green flash, pass through, +100pts
  ✅ Running through ROT door: red flash, bounce back, -50pts
  ✅ SRS records the answer quality
STOP. Wait for review.
```

**PART 0491-0510/2000 | PHASE 6: VOCAB**
```
CONTEXT: Word gates work.
DEPENDENCY: Parts 0471-0490
TASK: Create src/levels/WordZone.js — a floor zone variant. Instead of 
doors, the floor is divided into colored sections, each labeled with a 
German word. The audio cue says a word, and the player must run to the 
correct colored zone before time runs out (5 seconds). Wrong zone: floor 
drops (slime pit). Right zone: floor stays, others drop. This adds 
variety to the learning mechanic.
TECH: Three.js, cannon-es
FILES: src/levels/WordZone.js (create)
ACCEPTANCE:
  ✅ Floor splits into 4 colored zones with word labels
  ✅ Audio says "GELB"
  ✅ Standing on yellow zone when timer ends: safe
  ✅ Standing on wrong zone: floor drops, bean falls into slime
STOP. Wait for review.
```

---

# 🏗️ PHASE 9: OBSTACLE PIECES (Parts 0641–0800)

*This is the largest phase. Each obstacle is 8-12 parts.*

**PART 0641-0652/2000 | PHASE 9: OBSTACLES**
```
CONTEXT: Word gates and zones exist. Need physical obstacles.
DEPENDENCY: Parts 0491-0510
TASK: Create src/obstacles/MovingPlatform.js — a platform that moves 
between two points. Properties: { startPoint, endPoint, speed, width, 
depth }. Visual: THREE.BoxGeometry with striped yellow/black material 
(construction zone aesthetic). Physics: CANNON.Body with kinematic type, 
position updated each frame via lerp between start and end. Bean standing 
on it moves with it.
TECH: Three.js, cannon-es (Kinematic bodies)
FILES: src/obstacles/MovingPlatform.js (create)
ACCEPTANCE:
  ✅ Platform slides back and forth smoothly
  ✅ Bean standing on platform moves with it
  ✅ Bean can jump off the platform mid-movement
  ✅ Platform has visible yellow/black hazard stripes
STOP. Wait for review.
```

**PART 0653-0664/2000 | PHASE 9: OBSTACLES**
```
CONTEXT: Moving platforms work.
DEPENDENCY: Parts 0641-0652
TASK: Create src/obstacles/SwingingHammer.js — a giant pendulum hammer 
that swings across the path. Visual: CANNON.Cylinder (handle) + 
CANNON.Sphere (head) in red material. Physics: CANNON.HingeConstraint 
attached to a fixed point above. Swings with gravity + initial impulse. 
Hitting a bean applies large impulse + triggers ragdoll.
TECH: Three.js, cannon-es (HingeConstraint)
FILES: src/obstacles/SwingingHammer.js (create)
ACCEPTANCE:
  ✅ Giant red hammer swings back and forth like a pendulum
  ✅ Bean hit by hammer goes flying (ragdoll)
  ✅ Timing the swing is possible (consistent period)
  ✅ Hammer looks threatening and comical
STOP. Wait for review.
```

*(Continue this pattern for all 15 obstacle types — each gets 10-12 parts covering: visual mesh, physics body, animation/movement, collision behavior, sound trigger, and integration with WordGate system.)*

---

# 📊 PHASES 10-23: REMAINING MAP

Due to response length, here's the **compressed breakdown** of what each remaining phase builds. **Each part follows the exact same template format above.**

| Phase | Parts | What You Build (Part-by-Part) |
|---|---|---|
| **10: Level Generator** | 0801-0880 | Procedural level assembler, segment connector, difficulty scaler, randomizer seed, checkpoint system, level validation |
| **11: Game Modes** | 0881-0960 | Race mode logic, survival mode timer, team mode scoring, countdown sequence, round transition, final round boss |
| **12: AI Bots** | 0961-1040 | Bot pathfinding, bot wobble physics, bot decision trees, bot personality quirks, bot difficulty scaling, bot reactions to words |
| **13: UI/HUD** | 1041-1140 | Main menu, word bank screen, score HUD, timer, round counter, results screen, settings menu, tutorial overlay |
| **14: SRS Engine** | 1141-1220 | In-game SRS integration, word difficulty adaptation, mistake tracking, review round generator, mastery celebration |
| **15: Progression** | 1221-1280 | XP system, level-up, skin unlocks, achievement badges, daily streak, word mastery certificates |
| **16: Environment** | 1281-1420 | Berlin skybox, Kreuzberg buildings (low-poly), Späti shop model, U-Bahn entrance, Spree river, street lamps, graffiti walls, trees |
| **17: Particles** | 1421-1500 | Confetti burst, slime splash, star collect, speed lines, dust clouds, fireworks, word-correct sparkle, fail poof |
| **18: Mobile** | 1501-1560 | Touch joystick polish, haptic feedback, orientation lock, safe area insets, performance mode toggle |
| **19: Performance** | 1561-1640 | LOD system, frustum culling, texture compression, draw call batching, physics sleep, memory profiling |
| **20: Save/PWA** | 1641-1700 | Service worker, offline mode, manifest.json, install prompt, cloud save sync, data export |
| **21: Polish** | 1701-1800 | Screen shake tuning, animation curve polish, color grading, accessibility (colorblind mode, font size), tutorial flow |
| **22: Deploy** | 1801-1850 | GitHub Actions CI/CD, meta tags, OG image, favicon, analytics, error tracking |
| **23: Expansion** | 1851-2000 | A1 word pack, new themes (Munich, Hamburg), seasonal events, multiplayer lobby, leaderboard, share replays |

---

# 🚀 HOW TO START RIGHT NOW

**Step 1:** Open Antigravity
**Step 2:** Paste **Parts 0001 through 0007** (the engine skeleton)
**Step 3:** Review on GitHub Pages — you should see a blue sky with a green ground
**Step 4:** Say "Perfect, next" or "Fix X"
**Step 5:** Paste **Parts 0008 through 0020** (the data brain)
**Step 6:** Continue in batches of 10-20 parts

**By Part 0250**, you'll have a wobbly bean running around a 3D scene.
**By Part 0510**, you'll have German word gates that teach.
**By Part 0800**, you'll have a full obstacle course game.
**By Part 2000**, you'll have a polished, deployable product.

**You were right. The tools exist. The AI can build it. You just need the blueprint. This is your blueprint.** 🔥
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-19T22:12:27+01:00.
</ADDITIONAL_METADATA>