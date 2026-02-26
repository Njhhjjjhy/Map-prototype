# Camera vocabulary

A shared language for describing and controlling camera positions and transitions in the map prototype.

---

## Three core concepts

### 1. Location

A named camera position. Every location has five properties:

| Property | What it controls | Range |
|----------|-----------------|-------|
| lat | North/south position on the globe | ~31.5 to 32.9 for this project |
| lng | East/west position on the globe | ~129.5 to 131.0 for this project |
| zoom | How close or far the camera is | 5 (country view) to 18 (street level) |
| pitch | How tilted the camera is | 0 (flat, looking straight down) to 65 (nearly eye level) |
| bearing | Which compass direction the camera faces | -180 to 180 degrees (0 = north) |

**Zoom reference:**
- 5 = country overview (all of Kyushu visible)
- 8 = regional view (Kumamoto prefecture)
- 11 = city-wide (investment area overview)
- 14 = neighborhood (individual roads visible)
- 18 = street level (buildings, property detail)

**Pitch reference:**
- 0 = flat satellite view
- 20 = slight tilt (overview maps)
- 45 = moderate tilt (default for most scenes)
- 55 = steep tilt (dramatic, shows building heights)
- 65 = maximum, nearly eye level

**Bearing reference:**
- 0 = facing north
- 90 = facing east
- -90 or 270 = facing west
- 180 = facing south

### 2. Transition

How the camera moves from one location to another. Every transition has two properties:

**Duration** - how long the move takes, in seconds. Examples:
- 1 second = quick snap
- 2 seconds = normal pace
- 3 seconds = deliberate, gives time to absorb
- 5 seconds = slow, cinematic sweep

**Feeling** - the character of the movement:

| Feeling | What it does | When to use |
|---------|-------------|-------------|
| Smooth | Even pace throughout, comfortable acceleration and deceleration | Default for most moves |
| Snappy | Quick, punchy, arrives fast | Switching between nearby points, response to user clicks |
| Dramatic | Slow build, sweeping motion, slow settle | Journey transitions, revealing important locations |
| Gentle | Soft start, gradual deceleration, floating quality | Subtle camera repositions, ambient drift |

### 3. Cinematic level

A 1 to 10 scale that dials the overall drama up or down. Affects duration, bearing sweep, and pitch intensity.

| Level | Character | Duration effect |
|-------|-----------|-----------------|
| 1 | Near-instant cut, minimal motion | 0.3x base duration |
| 3 | Quick and functional | 0.6x |
| 5 | Normal, balanced (default) | 1.0x |
| 7 | Cinematic, sweeping | 1.4x |
| 10 | Full production, maximum drama | 2.0x |

Higher cinematic levels also add subtle bearing sweep (the camera rotates slightly during flight) and extra pitch tilt for depth.

---

## Named locations

Current named camera positions in the codebase:

| Name | Description | Zoom | Pitch |
|------|------------|------|-------|
| A0 | Journey A opening, Kumamoto overview | 11.5 | 45 |
| A1 | Resources view | 11.5 | 45 |
| A2_overview | Wide regional pullback | 8.5 | 35 |
| A2_water | Water resources focus | 10 | 45 |
| A2_power | Power infrastructure | 12 | 45 |
| A3_ecosystem | Innovation ecosystem | 11.5 | 50 |
| A3_location | Strategic location (all of Kyushu) | 5 | 20 |
| A3_talent | Talent pool (prefecture view) | 7 | 25 |
| A_to_B | Transition from Journey A to B | 11 | 48 |
| B1 | Journey B opening | 11.5 | 48 |
| B1_sciencePark | Science park focus | 11 | 45 |
| B4 | Corporate presence view | 12 | 52 |
| B6 | Future outlook view | 11.5 | 50 |
| B7 | Infrastructure / transport | 12 | 55 |
| B_to_C | Transition from Journey B to C | 12.5 | 50 |
| corridor | Investment corridor (3D tilt) | 12.5 | 50 |
| complete | Journey complete, neutral overview | 11 | 40 |

---

## How to communicate camera changes

**Changing a location:**
> "Move the A3_ecosystem location closer and tilt it more."

**Describing a new location:**
> "I need a new location looking at the property from the south-east, fairly close, with steep tilt."

**Adjusting a transition:**
> "The transition from A0 to A1 is too fast. Make it smooth and slower."

**Using cinematic level:**
> "Bump Journey A to cinematic level 7."

**Using the debug tool:**
> Drag the map until you find a view you like. Press the copy button. Paste the values and say: "Save this as 'property-closeup'."

---

## Debug tool

A small toggle panel in the top-left corner of the map. Shows live camera values that update as the map moves. Click the copy button to copy current values to your clipboard.

Activate by clicking the wrench icon in the top-left corner of the map.
