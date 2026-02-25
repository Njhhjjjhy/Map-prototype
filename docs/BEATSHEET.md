# Beat Sheet — Narrative Motion Spec

Every animation in this app is a **narrative beat** — a moment with emotional intent, not just a technical effect. This document names each beat, describes what the audience should *feel*, and identifies where the rhythm breaks.

This is the spec. All motion work implements against this.

---

## How to Read This

Each beat follows this format:

```
### Beat Name
**Feel:** What the audience should experience emotionally
**Current:** What actually happens today (technical)
**Gap:** What's missing from the narrative (if anything)
```

Beats are grouped into **scenes**. Scenes are grouped into **acts**. The three-act structure maps to the app's three journeys, bookended by prologue and epilogue.

---

## Prologue: The Invitation

*The presenter opens the app. The audience sees a clean white screen. Nothing moves yet. Then, gently, the interface assembles itself — inviting the first click.*

### The Gathering

**Feel:** Anticipation. Elements materialize one by one, as if the presentation is preparing itself for the audience. A sense of care and craftsmanship.

**Current:** Start screen elements fade-up with spring easing, staggered 100-500ms apart (`btnEntrance`, 500ms, spring). Arrow on CTA bounces infinitely (`arrowBounce`, 1.5s loop). All five elements (logo, headline, subtitle, start button, skip button) use identical `slideUp` motion.

**Gap:** All five elements share the same animation — there's no visual hierarchy in the entrance. The logo and headline should feel like they *settle into place* (grounded), while the CTA should feel like it *arrives last and demands attention* (different motion quality). The infinite arrow bounce feels nervous rather than inviting after ~3 seconds.

### The Threshold

**Feel:** Commitment. The old world dissolves and a new one takes its place. This is a one-way door — the audience crosses into the experience.

**Current:** Start screen fades out (350ms, accelerate). App container fades in (500ms, standard). 50ms DOM gap between.

**Gap:** This is a *cut*, not a *transition*. There's no sense of the map world arriving — it just appears behind a dissolving white screen. The audience should feel the space opening up, not just switching. Needs a brief held darkness or a directional wipe to create the feeling of entering.

---

## Act 1: The Land (Journey A)

*The camera descends from the sky. The audience discovers Kumamoto from above — its geography, its water, its natural advantages. This act builds the foundation: the land itself is special.*

### Scene 1: Descent

#### The Approach

**Feel:** Awe. The camera drops from satellite altitude into the landscape. The audience should feel like they're arriving by air — the scale of Kyushu shrinks as detail emerges. This is the cinematic hook.

**Current:** Three-stage Mapbox flight sequence. Stage 1: zoom 6 → 10, pitch 0 → 40 over 2000ms. Stage 2: zoom 10 → 12.5, pitch 40 → 50, bearing to 15 over 1500ms. Stage 3: 300ms hold. Skip button appears at 500ms. Total: ~3.8s.

**Gap:** The two flight stages feel like one continuous move, not distinct beats. Stage 1 should feel like *descent* (vertigo, scale), Stage 2 should feel like *recognition* (oh, this is a real place). The 300ms hold at the end is too short to register as a narrative pause — it needs 500-800ms to let the audience breathe and absorb where they are.

#### The First Word

**Feel:** Grounding. After the dramatic descent, a calm voice appears at the bottom of the screen. The narrator has arrived. The audience now has a guide.

**Current:** Chatbox slides up (250ms, decelerate) immediately after cinematic entry completes. `slideUp` animation with fade.

**Gap:** No breathing room between The Approach and The First Word. The chatbox appears the instant the camera stops. The audience needs 500-800ms of stillness after landing before the narrator speaks — otherwise the descent and the greeting blur into one moment. The guide should feel like it *waited for you to arrive* before speaking.

### Scene 2: Exploration

*The narrator introduces the region. Markers appear on the map. The audience begins to understand the geography.*

#### The Scatter

**Feel:** Discovery. Points of interest populate the map — not all at once, but as if the landscape is revealing its secrets one by one. Each marker is a small revelation.

**Current:** Markers added via `addMarkers()` with `markerPop` CSS animation (150ms, decelerate). All markers use identical animation regardless of type or importance. No stagger between markers of the same batch.

**Gap:** Every marker enters with the same 150ms pop regardless of whether it's a major science park or a minor waypoint. No stagger means a batch of 5 markers all pop simultaneously — which reads as "stuff appeared" rather than "the map is revealing things to you." Anchor markers (science park, key corporate sites) should arrive with more weight; supporting markers should ripple outward from them.

#### The Evidence

**Feel:** Credibility. When the audience clicks a marker, detailed information slides in from the right. This isn't just data — it's proof. The panel should feel like opening a dossier.

**Current:** Right panel slides in from right (250ms, decelerate). Panel content gets `slideInRight` with 50ms delay. Panel closes with accelerate easing (150ms).

**Gap:** The panel entrance and content entrance are nearly simultaneous (50ms offset), so they read as one motion. The content should feel like it's *inside* the panel — arriving after the container opens, not with it. A 150-200ms delay would create the sense of the panel opening first, then the content filling it.

#### The Route

**Feel:** Connection. Lines draw themselves across the map, linking locations. The audience sees that these places aren't isolated — they're part of a network.

**Current:** SVG route line with `drawRoute` animation (500ms, decelerate). `stroke-dashoffset` animates from 1000 to 0.

**Gap:** Routes just appear and draw. No marker glow or pulse at the endpoints to show what's being connected. The route should feel like it's *linking two things*, not just drawing a line on the map.

### Scene 3: Departure from Act 1

#### The Farewell

**Feel:** Completion with momentum. Act 1 is done. The narrator wraps up, and the world prepares to shift. The audience should feel satisfied but curious — *what's next?*

**Current:** `transitionToJourneyB()` fires: markers fade out (200ms), chatbox exits (150ms), panel exits (150ms), brief pause (300ms), camera flies to new position (2000ms). Total: ~2.6s.

**Gap:** The departure sequence is improving but still needs refinement. Markers now fade out before UI exits, creating a sense of the map receding first. However, chatbox and panel still exit simultaneously rather than in sequence. The 300ms pause before camera movement is too brief to register as a narrative breath. This seam needs: (1) chatbox departing first, (2) panel following 100ms later, (3) a longer pause (500-800ms) to let the emptiness register, (4) then camera moving to new world.

---

## Act 2: The Momentum (Journey B)

*The government has invested. Companies have committed. Infrastructure is being built. This act builds urgency: powerful forces are already in motion, and the investment opportunity exists because of them.*

### Scene 4: The Power Structure

#### The Chain

**Feel:** Authority cascading downward. Government support flows from national to prefectural to municipal level. Each tier appears below the last, creating a visual hierarchy of commitment. This should feel *deliberate and weighty*.

**Current:** Government chain markers stagger in with 200ms delay between each (`setTimeout(index * 200)`), each using `markerPop` (150ms). Science park appears after 1200ms delay. Total chain: ~1.4s for 6 markers + 1.2s for science park.

**Gap:** The stagger is good — this is one of the few sequences with intentional rhythm. But the `markerPop` animation is the same 150ms pop used for everything else. These markers represent national government decisions; they should arrive with more gravity. And the 1200ms delay before the science park feels arbitrary — it should feel like a *consequence* of the chain, not a separate event.

#### The Coachmark

**Feel:** Invitation to interact. The Future/Present toggle pulses, teaching the audience they can switch views. A gentle nudge, not a demand.

**Current:** `toggleCoachmark` animation: golden ring pulses 3 times over 3.6s (1.2s each). Removed after `animationend` event.

**Gap:** The coachmark pulses independently of the narrative. It should appear after the chain has settled and the audience has a moment to absorb — not while markers are still appearing. Currently it can overlap with marker arrivals.

### Scene 5: Corporate Commitment

#### The Logos

**Feel:** Weight of evidence. Major companies have committed to this region. Each logo/marker represents billions in investment. The audience should feel the cumulative weight of corporate backing.

**Current:** Corporate markers use same `markerPop` as everything else. Panel auto-reveals after 2500ms delay (`buttonDelay`).

**Gap:** Same animation for Toyota/Sony as for a water resource marker. These should feel heavier, more significant. The auto-reveal delay (2500ms) is a fixed timer, not tied to narrative rhythm — it fires whether the audience is ready or not.

### Scene 6: Infrastructure

#### The Roads

**Feel:** Progress being made visible. Planned and in-construction roads fade into existence on the map, like a blueprint overlaying reality. The audience sees that the future is already being built.

**Current:** Infrastructure roads fade in via dual animation: Mapbox `line-opacity-transition` (300ms) + CSS `roadFadeIn` (350ms). Roads appear as teal dashed polylines.

**Gap:** All roads appear simultaneously. For a sequence about *progress*, they should appear sequentially — perhaps from the center outward, or from completed to planned. The simultaneous appearance says "here are some roads" instead of "look how much is being built."

#### The Road Detail

**Feel:** Specificity. When clicked, a road's full story appears — budget, timeline, impact on commute time. This transforms abstract lines into concrete plans.

**Current:** Road click → panel opens with headline metric, stats grid, description. Standard panel `slideInRight` animation.

**Gap:** The headline metric (commute time saved) should arrive with emphasis — it's the emotional hook of the road detail. Currently it enters with everything else as undifferentiated content.

### Scene 7: Departure from Act 2

#### The Handoff

**Feel:** Building to climax. Act 2 has established that governments, corporations, and infrastructure are all converging. Now the audience is ready to see the actual investment opportunity. This transition should feel like *approaching the destination*.

**Current:** Same transition pattern as Act 1 departure: markers fade out (200ms), chatbox exits (150ms), panel exits (150ms), brief pause (300ms), More Harvest branding screen appears (1200ms total), camera flight (2000ms).

**Gap:** Similar choreography issues as The Farewell, but the More Harvest branding screen (headline + subtitle staggered fade-up) now appears without the spinner-based loading feel. The branding screen functions as a title card but still feels slightly disconnected from the departure. The UI elements still exit simultaneously rather than sequentially. Needs: (1) sequential UI departure, (2) longer pause before branding screen, (3) branding screen to feel like an intentional act break rather than a transition screen.

---

## Act 3: The Payoff (Journey C)

*This is what it's all been building toward. Real properties. Real numbers. Real investment returns. The camera drops to street level and the audience can almost walk through the buildings.*

### Scene 8: The Corridor

#### The Elevation

**Feel:** Arrival at destination. The camera tilts into 3D perspective, revealing the investment corridor from a perspective that says "this is where the opportunity lives." The shift from 2D overview to 3D immersion should feel like stepping closer.

**Current:** Camera tilts to corridor view via `elevateToCorridorView()` — Mapbox flight with pitch change, ~2000ms.

**Gap:** The shift to 3D is just a camera move. There's no visual cue that the narrative has changed register — from macro (government, infrastructure) to micro (individual properties). A brief moment of stillness at the new perspective would let the audience register: "we're somewhere different now."

#### The Properties

**Feel:** Opportunity laid out. Property markers appear along the corridor. Each one is a potential investment. The audience should feel that they're looking at a curated selection, not a random scatter.

**Current:** Property markers added with `markerPop` (150ms each). All appear at once.

**Gap:** Same as The Scatter. No stagger, no differentiation. Properties should emerge along the corridor in spatial order — near to far, or by investment tier — so the audience reads them as a *sequence of options*, not a cluster.

### Scene 9: The Reveal

*The audience clicks a property. The camera dives to street level. The building fills the frame.*

#### The Dive

**Feel:** Intimacy. The camera plunges from corridor overview to street level, as if the audience is walking up to the front door. This is the most dramatic camera move in the app — it should feel thrilling and precise.

**Current:** `forwardReveal()`: Mapbox flight from corridor to zoom 18, pitch 65, calculated bearing, 2500ms. Followed by gentle 15-degree orbit over 2500ms with quadratic ease-out. Total: ~5s.

**Gap:** This is one of the strongest sequences in the app. The two-phase structure (dive + orbit) creates genuine cinematic feeling. Minor gap: no brief hold between the dive and the orbit — the camera should *arrive* and *pause* before starting to drift, giving the audience a moment to take in the building.

#### The Exterior

**Feel:** First impression. The building's exterior photo fills a transition overlay. The audience evaluates the property at a glance.

**Current:** `#transition-overlay` fades in over 800ms (decelerate). Image crossfade between photos is 800ms (standard). Entry is asymmetric with exit (350ms accelerate).

**Gap:** The slow entry (800ms) is good — it feels deliberate. But the overlay appears over the map, creating a jarring visual conflict. The audience's eye is simultaneously processing the 3D map orbit and the photo overlay. One should complete before the other begins.

#### The Interior

**Feel:** Exploration. The audience moves through the property — bedroom, kitchen, view from the balcony. Each photo should feel like stepping into the next room.

**Current:** Photo crossfade within overlay (800ms, standard). Thumbnail navigation along bottom. Prev/next buttons with hover scale (1.05×).

**Gap:** All photo transitions are identical crossfades. A room-to-room progression should have subtle directional movement (left-to-right for next, right-to-left for previous) to create spatial continuity.

#### The Return

**Feel:** Pulling back to the bigger picture. The audience has seen the property; now they return to the corridor to consider others. This should feel like stepping back out the door — orderly, not jarring.

**Current:** `reverseReveal()`: Camera flies back to corridor view over 1500ms with smooth ease-in-out. Faster than forward (1500ms vs 2500ms).

**Gap:** The asymmetric timing is correct (returns should be faster than approaches). But there's no transition out of the property overlay — the overlay presumably closes and the camera simultaneously moves, creating competing motions. The overlay should close first (150ms), then the camera should pull back.

### Scene 10: The Close

#### The Conversation

**Feel:** Openness. The journey is complete. The audience can now ask questions freely. The AI chat appears like a trusted advisor ready to discuss what they've seen.

**Current:** AI chat slides up (250ms, decelerate). Suggestion chips visible. Typing indicator with bouncing dots (1.4s loop, staggered). Messages appear with `messageSlide` (150-250ms).

**Gap:** The AI chat appears immediately after journey completion with no pause to reflect on what was just experienced. The audience needs a "landing" moment — 500-800ms of stillness with the map visible, before the chat interface appears, to create the feeling of: "the journey is complete, now let's talk."

#### The Summary

**Feel:** Confidence. The audience can download a summary, restart a journey, or schedule a consultation. These CTAs should feel final and assured — not pushy.

**Current:** CTAs use `buttonEntrance` (250ms, decelerate with 150ms delay). `attentionPulse` available but subtle (2s loop on `box-shadow`).

**Gap:** The CTA delay (150ms) is too short to be perceived as intentional sequencing. It should wait until the first chat message has appeared and been readable for at least 500ms before the CTAs emerge — creating the feeling of "here's what you can do next" rather than "here are buttons."

---

## Ambient Layer (Missing Entirely)

### The Heartbeat

**Feel:** Life. Between interactions, the map should feel alive — not frozen. Subtle drift, gentle marker breathing, an occasional shimmer. The audience should never feel like they're looking at a screenshot.

**Current:** Nothing. The map is completely static between interactions. Markers don't move. No camera drift. No ambient animation.

**Gap:** This is missing entirely. Needs:
- Gentle camera drift (very slow bearing rotation, ~0.5 degrees over 10 seconds)
- Active marker pulse (subtle scale oscillation on the currently relevant marker)
- Map atmosphere (time-of-day lighting shift via Mapbox style, if supported)

---

## Narrative Gaps Summary

### 1. No Breathing Room

Every transition chains directly into the next action. The five critical seams where pauses are needed:

| Seam | After | Before | Needed Pause |
|------|-------|--------|-------------|
| Post-Descent | Camera settles | First chatbox | 500-800ms |
| Post-Chain | Gov chain complete | Coachmark pulse | 300-500ms |
| Act Transitions | Old content exits | Transition screen | 300ms |
| Post-Elevation | Corridor view arrives | Property markers | 500ms |
| Post-Journey | Last step completes | AI chat appears | 500-800ms |

### 2. No Exit Choreography

Current exit pattern: everything disappears simultaneously or instantly. Needed: sequential departure (markers fade → chatbox exits → pause → camera moves).

### 3. Undifferentiated Entrances

`markerPop` (150ms) and `slideUp` (250ms) are used for every context. The system needs at least 4 entrance variants:

| Variant | For | Feel |
|---------|-----|------|
| **Anchor Drop** | Major landmarks (science park, corporate HQ) | Heavy, deliberate, slightly slower (300ms) |
| **Ripple** | Supporting markers appearing around an anchor | Quick, outward cascade from anchor point |
| **Emerge** | Properties in corridor view | Gentle rise from ground plane, sequential |
| **Snap** | UI elements (chatbox, panels) | Current slideUp/slideInRight — these are fine |

### 4. No Ambient Life

The map has zero motion between interactions. Three ambient layers needed:

| Layer | Motion | Intensity |
|-------|--------|-----------|
| Camera drift | Bearing rotation ~0.5deg/10s | Barely perceptible |
| Marker pulse | Scale 1.0 → 1.05 → 1.0 on active marker | Subtle, 3s loop |
| Route shimmer | Slight opacity wave along route lines | Very subtle, 4s loop |

### 5. Scene Transitions Cut Instead of Choreograph

Current: Old scene vanishes → spinner → new scene appears.
Needed: Old scene recedes → breath → new scene arrives.

The spinner-based transition screen should be replaced with a simpler fade-to-map hold — the map itself should be the transition, with the camera moving through empty space between acts.

---

## Beat Sequence Reference (Quick View)

```
PROLOGUE
  1. The Gathering ........... Start screen elements assemble
  2. The Threshold ........... Cross into the map world

ACT 1: THE LAND
  Scene 1: Descent
    3. The Approach .......... Camera descends from sky
    4. The First Word ........ Narrator appears (chatbox)
  Scene 2: Exploration
    5. The Scatter ........... Markers populate the map
    6. The Evidence .......... Detail panel opens
    7. The Route ............. Connection lines draw
  Scene 3: Departure
    8. The Farewell .......... Act 1 world recedes

ACT 2: THE MOMENTUM
  Scene 4: The Power Structure
    9. The Chain ............. Government tiers cascade
   10. The Coachmark ......... Toggle teaches interaction
  Scene 5: Corporate Commitment
   11. The Logos ............. Company markers land
  Scene 6: Infrastructure
   12. The Roads ............. Infrastructure fades in
   13. The Road Detail ....... Clicked road reveals stats
  Scene 7: Departure
   14. The Handoff ........... Act 2 yields to Act 3

ACT 3: THE PAYOFF
  Scene 8: The Corridor
   15. The Elevation ......... Camera tilts to 3D
   16. The Properties ........ Investment markers emerge
  Scene 9: The Reveal
   17. The Dive .............. Camera plunges to street
   18. The Exterior .......... Building photo appears
   19. The Interior .......... Room-by-room exploration
   20. The Return ............ Pull back to corridor
  Scene 10: The Close
   21. The Conversation ...... AI chat appears
   22. The Summary ........... Final CTAs emerge

AMBIENT (continuous)
   23. The Heartbeat ......... Map breathes between beats
```

---

*This beat sheet is the narrative contract. Every animation change should reference a beat by name and justify how it serves the feel described here.*
