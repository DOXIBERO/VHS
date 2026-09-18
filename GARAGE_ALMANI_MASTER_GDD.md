# 🚪 GARAGE ALMANI (كاراج ألماني)
## The Definitive Master Game Design Document (GDD)
### *A Viral, Mobile-First, Turn-Based Multiplayer German A0 Party Game*

---

## 1. EXECUTIVE SUMMARY & CORE VISION
- **Title:** GARAGE ALMANI (كاراج ألماني)
- **Genre:** Turn-based Social Party Game / Inverted Drinking Game / Language Learning (Level A0)
- **Target Platform:** Mobile Browser (Responsive WebGL / Three.js / PWA on iOS & Android)
- **Target Audience:** Friends, party groups, language learners, Moroccan and Arab youth wanting to conquer German in a hysterical, pressure-free social setting.
- **Match Duration:** ~45 to 60 minutes per session (focusing on 1–2 drinks per night across an 11-drink master curriculum).
- **Player Count:** 1 to 8 players. (1 player plays against an adaptive Bot; 2 to 8 play together).
- **Core Hook:** Friends gather in an aluminum Moroccan garage around an old café wooden table sitting on red wedding tent chairs. To learn German, you don't take quizzes—you drink! Getting an answer right lets your bean character take a massive gulp from their glass. Getting it wrong causes a pitcher to aggressively refill your glass! Your real face is mapped onto the bean with giant eyes and a giant contorting mouth.

---

## 2. THE LOBBY & ONBOARDING (ZN9A - الزنقة)

### 2.1 The Visual & Audio Atmosphere
- Authentic Moroccan alleyway at blue hour (evening light, warm streetlamps, cracked ochre walls, distant scooter sounds).
- Corrugated aluminum garage door (*rideau de fer*) at the end of the alley, padlocked and rusted.
- Blue Moroccan enamel street plaque (*Plaka d Zn9a*) mounted on the wall next to the garage.

### 2.2 Character Assignment (The Paint Lottery)
- Players enter their nickname.
- Random absurd color instantly assigned with funny tags:
  - *Rotten Pistachio*
  - *Sunburned Flamingo*
  - *Grandma's Couch Beige*
  - *Tax Return Grey*
  - *Existential Purple*
- Each player receives a unique constellation icon for accessibility.

### 2.3 Room Creation & Joining (The Silver Dirham Keypad)
- **Host:** Taps "Create Room" -> generates a 4-letter/digit room code.
- **Guests:** Tap the blue street plaque (*Plaka d Zn9a*).
  - Camera smoothly zooms in on the blue plaque.
  - A custom numeric keypad appears styled as **embossed silver Moroccan Dirham coins**!
  - Tapping keys produces crisp metallic coin-clinking sound effects.

### 2.4 The READY System & Seamless Blackout Cut
- Players tap the physical "BEREIT / واجد" button.
- Their bean sits cross-legged facing the garage door.
- When all are ready:
  1. All UI elements smoothly dissolve like sugar into tea.
  2. Beans stand up and auto-walk into the garage as the heavy aluminum shutter rattles upward.
  3. Camera follows inside, orbits 180° to face the door from within.
  4. The shutter **SLAMS** shut with a loud metal boom.
  5. **1 full second of pure pitch-black silence.** (The cut!).
  6. The old yellow incandescent tungsten bulb hanging on a long dangling wire flickers on.
  7. **The Reveal:** The blackout cut instantly placed them sitting around the round wooden café table on red wedding tent chairs with their glasses in front of them!

---

## 3. THE 3D SCENE & ENVIRONMENT

- **Room:** Corrugated aluminum industrial garage.
- **Lighting:** A single warm yellow incandescent lightbulb hanging on a long black dangling wire from the ceiling, casting soft swaying shadows.
- **Table:** Classic circular Moroccan café table made of aged dark wood with worn texture.
- **Chairs:** Traditional Moroccan wedding/event tent chairs (*krasa d khzana*) with gold tubular frames and red foam cushions (*ponge mghelef btoub 7mr*).
  - Number of chairs dynamically equals player count (from 1 to 8), distributed evenly around the circular table.
- **Wall Props:**
  - Retro circular café wall clock (used for time-telling challenges).
  - Tear-away Moroccan daily calendar (*Roznama*) on the wall (used for date and month challenges).
  - A wooden wall shelf displaying the 11 glasses representing course progress.
- **Table Surface:** Pristine and uncluttered—ONLY the players' glasses are on the table.
- **Glasses:** Dynamically change their 3D model according to the active drink:
  - *Tee:* Traditional Moroccan tea glass (*Kas d 7yati*).
  - *Kaffee:* Classic small café glass (*Kas nss-nss*).
  - *Wasser:* Heavy faceted glass tumbler with floating ice cubes.
  - *Saft:* Tall juice tumbler with a colorful bent straw.
  - *Limonade:* Vintage ribbed soda glass with gas bubbles.
  - *Festgetränk:* Elegant celebratory goblet.

---

## 4. THE INVERTED DRINKING GAMEPLAY LOOP

### 4.1 Win & Penalty Conditions
- **Progress = Fullness of your glass!**
- Each glass requires **5 correct sips** to be completely emptied.
- **Correct Pronunciation:**
  - Rubbery cartoon arms stretch forward, lift the glass to the face.
  - The rim of the glass covers the mouth area.
  - Liquid tilts down; a cartoon swallowed ball travels down the bean's neck with a loud gulping sound (*"Sssssrrrp... aah!"*).
  - Glass slams back onto the wooden table (*"Clack!"*).
  - Bean wipes mouth with sleeve; 1 sip deducted from glass.
- **Incorrect Pronunciation (The Refill Penalty):**
  - A pitcher/bottle descends from above the camera.
  - Pours aggressively into the player's glass with splashing liquid particles and rising foam.
  - **Penalty: +2 sips refilled!**
  - If the glass is already full: it overflows comically onto the table, but logically remains at 0 progress (glass full).
- **Winning the Round:**
  - The first player to empty their glass wins that drink!
  - They relax, lean back on their red sponge chair, and watch their friends struggle with the remaining sips.

### 4.2 The "Noba" (Turn-Based Spotlight) & The Laugh Buffer
- Only ONE player is active in the hot seat at a time.
- The camera frames a dramatic close-up of the active player's bean and giant contorting mouth.
- **The Laugh Buffer Button:** When the turn passes to a player, **NO countdown starts automatically!**
  - Friends can laugh, joke, and comment on the previous attempt without time pressure.
  - The active player taps **"أنا واجد / START"** when the group settles down.
- **The Challenge Flow:**
  1. A native German audio clip plays clearly through the speakers.
  2. A small "Replay Audio" button is available if background laughter drowned it out.
  3. The player holds the on-screen mic button (like a WhatsApp audio note).
  4. The player pronounces the target German word/sound.
  5. The player releases the button to submit.
  6. Google AI Studio (Gemini) evaluates the audio in milliseconds with intelligent beginner tolerance.
  7. If correct: Sip animation! If wrong: Refill pour!

### 4.3 Mercy Assistance & AFK Protection
- **3-Mistake Mercy:** If a player fails 3 times in a row, Google AI triggers a slow-motion phonetic audio breakdown and a visual lip-shaping guide so the match never deadlocks.
- **AFK / Phone Call Protection:** If a player steps away, their turn is gracefully skipped without kicking them out. Their glass level is preserved, and they resume on their next turn.

---

## 5. CAMERA, FACE MESH & MOBILE OPTIMIZATIONS

- **The Big Face Filter:**
  - Client-side MediaPipe Face Mesh crops the player's eyes separately and mouth separately.
  - Enlarged (2.8x eyes, 3.2x mouth) and mapped directly onto the short bean body.
  - Almost 80% of the bean's visible body is giant blinking eyes and a contorting mouth!
- **Battery & Heat Protection (Crucial Mobile Optimization):**
  - ONLY the active player in the spotlight has their webcam feed actively processed and rendered in high detail.
  - Inactive players' cameras are paused or cached at ultra-low frame rates.
  - Prevents mobile phones from overheating and preserves battery for the full 60-minute match.
- **No-Camera Fallback:**
  - Players without cameras or who deny permissions receive a pre-rendered, funny static cartoon face.

---

## 6. SMART AUDIO ENGINEERING

- **Mode 1: Same Room / Co-located (مجموعين ف صالون واحد):**
  - When a player speaks, their voice is NOT re-broadcast through the phone speakers. This prevents acoustic feedback loops, echoes, and microphone screeching.
- **Mode 2: Remote / Online (كل واحد ف داره):**
  - The active player's voice attempt is streamed to all other players' phone speakers so everyone hears how they contorted their voice and can laugh together.
- **Synchronization:**
  - Ultra-lightweight WebSocket state synchronization (`{ action: "sip", player: 2, level: 3 }`).
  - Sips, pours, and reactions are synchronized to the millisecond across all devices.

---

## 7. LEVEL TRANSITIONS & END SCREEN

- **Between-Drink Transition:**
  - Instant cut/swap without sluggish animations. Old glasses vanish, new glasses appear on the table in a split second.
- **Session End Screen (The Souvenir Polaroid):**
  - At the end of the 60-minute session, the game generates a hilarious **Souvenir Polaroid Photo / Postcard** featuring all players' giant webcam faces with funny comedy badges:
    - *Fom L-3am* (Most contorted mouth)
    - *Moul L-Kass L-Fayed* (Most refilled glass)
    - *Charrab L-Garage* (Fastest drinker)
  - One-tap button to screenshot or share directly to WhatsApp and Instagram.

---

## 8. MASTER CURRICULUM: THE 11 DRINKS OF LEVEL A0

The full CEFR A0 curriculum is divided across 11 authentic drinks, tracked on the garage wall shelf:

| Drink # | Drink Name | German Topic & CEFR A0 Pillar | Table / Environment Interaction |
|:---:|---|---|---|
| **1** | **Atay Mch77ar** | The Alphabet & Core Vowel Sounds (A, E, I, O, U) | Traditional tea glass (*Kas d 7yati*) |
| **2** | **Atay b Ne3na3** | Numbers 0 to 20 & Tens to 100 (*Die Zahlen*) | Counting tea glasses & coin values |
| **3** | **Atay b Chiba** | Days of the Week & Parts of the Day (*Wochentage & Tageszeiten*) | Planning the week on the garage board |
| **4** | **Atay Fliyo** | Months, Seasons & Weather (*Monate, Jahreszeiten & Wetter*) | Changing weather sounds through the aluminum shutter |
| **5** | **Qahwa Ka7la** | Telling Time (*Die Uhrzeit: Wie spät ist es?*) | Interactive ticking café wall clock |
| **6** | **Qahwa Nss-Nss** | Today's Date & Calendar (*Das Datum: Welcher Tag ist heute?*) | Tear-away Moroccan wall calendar (*Roznama*) |
| **7** | **Ma Bared b Thelj** | Greetings, Origin, Age & Languages (*Vorstellung & Herkunft*) | Introducing oneself with ice-clinking glass |
| **8** | **3assir Limon** | The 5 W-Questions (*Wer, Was, Wo, Woher, Wie, Wann?*) | Detective interrogation across the table |
| **9** | **3assir Tfa7** | Personal Pronouns & Auxiliary Verbs (*sein* & *haben*) | Declaring possessions & identity |
| **10** | **Monada Ghazya** | The 3 Articles (*der, die, das*) & Table Objects | Bubble-popping object sorting |
| **11** | **Machroub L-I7tifal** | First Complete Sentences & Grand Dialogue (*Der Abschluss*) | Golden goblets clinking in a final celebration toast (*Prost!*) |

---

## 9. ACADEMIC NEXT STEPS

- **Phase 1: Pre-Production:** GDD Completed & Frozen (Current Milestone).
- **Phase 2: Prototyping (Proof of Concept):**
  1. Build minimal 3D test room in Three.js (aluminum walls, round table, wedding chairs, hanging light).
  2. Implement MediaPipe Face Mesh camera crop (eyes + mouth) on mobile.
  3. Test turn-based "Laugh Buffer" button + WhatsApp-style hold-to-talk mic input.
  4. Connect Google AI Studio Gemini API for pronunciation checking.
  5. Verify liquid drain (sip) and refill (pour) animations.
- **Phase 3: Production:** Asset refinement, multiplayer WebSocket sync, sound effects library.
- **Phase 4: QA & Playtesting:** Test on multiple phones across local Wi-Fi.
- **Phase 5: Launch:** Deploy to Web / GitHub Pages / PWA.
