# Feedback v2 Implementation Design

**Date:** 2026-02-04
**Source:** Primary user (Henry, CEO) review
**Goal:** Prepare demo for Oakwater with 4-area narrative structure

---

## Overview

Restructure the existing 3-journey app to explicitly present 4 demo areas while keeping the underlying state machine intact. The hybrid approach adds section headers and transitions that map to Henry's requested structure without rewriting journey logic.

### Demo Areas → Journey Mapping

| Demo Area | Journey | Steps |
|-----------|---------|-------|
| 1. Why Kumamoto | A | A1, A2, A3 |
| 2. Government Support | B | B1, B4, B6 |
| 3. Changes in Area | B | B7 |
| 4. Investment Opportunities | C | C1 |

---

## Area 1: Why Kumamoto (Journey A)

### Structure: Two Grouped Pairs

**Pair 1: Natural Resources** (A2)
- Water and Electricity markers with evidence

**Pair 2: Strategic Advantages** (A3)
- Semiconductor infrastructure and strategic location as narrative only

### Step A1: Introduction
- Existing intro, no changes

### Step A2: Natural Resources (Pair 1)

**Water Pillar:**
- Existing Aso Groundwater Basin marker stays
- Add evidence pins:
  - Coca-Cola Bottlers Japan Kumamoto Plant (Minami-ku)
  - Suntory Kyushu Kumamoto Factory (Kashima, Kamimashiki)
- Panel messaging: "Major beverage manufacturers chose Kumamoto for water quality and abundance"

**Electricity Pillar:**
- Existing Kyushu Power Grid marker stays
- Panel shows energy mix details (NO map pins for these — they're across Kyushu, not Kumamoto):
  - Solar: Kagoshima 24.7 MW, Fukuoka 22.9 MW, Nagasaki 10 MW
  - Wind: Miyazaki 65.55 MW, Saga/Nagasaki 27.2 MW, Goto offshore
  - Nuclear: Genkai (Saga), Sendai (Kagoshima)
- Panel messaging: "Diverse energy mix ensures grid stability for semiconductor manufacturing"

**Interaction:** Chatbox introduces resources → markers appear → user clicks to explore at own pace

### Step A3: Strategic Advantages (Pair 2)

**Semiconductor Infrastructure Pillar:**
- Narrative only in chatbox
- Key message: "TSMC chose Kumamoto because the supply chain was already here"
- No map markers (full corporate detail comes in B4)
- Teases Area 2

**Strategic Location Pillar:**
- Narrative only in chatbox
- Key points: proximity to Asia, port access, airport connectivity
- No map markers (keeps symmetry with semiconductor pillar)

**Interaction:** Chatbox presents both pillars as narrative → transition to Journey B

---

## Area 2: Government Support (Journey B: B1, B4, B6)

### Step B1: Government Commitment Chain

**One step with progressive reveals, not multiple sub-steps.**

The commitment chain cascades quickly to build momentum:
```
National ¥10B → Prefecture → City (Kikuyo, Ozu) → Science Park + Grand Airport
```

**Implementation:**
- Chatbox introduces the commitment chain (one message)
- Map shows all markers/zones (staggered animation optional)
- User clicks markers to explore depth at own pace
- Panel updates per marker selection

**Markers/Zones to add:**
- National government commitment indicator
- Kumamoto Prefecture zone/marker
- Kikuyo city development zone
- Ozu city development zone
- Science Park (existing)
- Grand Airport concept marker

**Panel content per level:**
- National: ¥10B commitment, strategic semiconductor policy
- Prefecture: Allocation details, coordination role
- City (Kikuyo): Development plan specifics
- City (Ozu): Development plan specifics
- Science Park: ¥4.8T investment corridor (existing)
- Grand Airport: Future connectivity vision

### Step B4: Corporate Headquarters (unchanged structure)

- JASM, Sony, Tokyo Electron, Mitsubishi markers (existing)
- **New framing:** Chatbox positions these as "result of government commitment"
- Panel content unchanged

### Step B6: Time Toggle (unchanged)

- Present/Future toggle (existing)
- Evidence groups (existing)
- No changes needed

---

## Area 3: Changes in Area (Journey B: B7)

### Step B7: Infrastructure Evidence (expanded)

**Chatbox transition:** Explicit shift from "plans" (Area 2) to "proof" (Area 3)
- Section header: "Changes in Area"
- Messaging: "Government commitment is one thing. Here's what's actually changing on the ground."

**Existing elements:**
- 3 infrastructure road projects with commute impact

**New elements to add:**
- New station marker (rail connectivity proof)
- Infrastructure upgrade markers (1-2 tangible transformation examples)

**Interaction:** Same pattern as current B7
- Chatbox introduces with "Changes in Area" framing
- All elements visible together (roads, station, upgrades)
- User clicks to explore
- Single selection applies (clicking one deselects others)

---

## Area 4: Investment Opportunities (Journey C)

### Step C1: Properties (unchanged structure)

**Existing functionality:**
- 2 properties (Kikuyo Residence A, Ozu Heights Unit B)
- Financial scenarios (Bear/Average/Bull)
- Route lines to JASM
- Portfolio summary

**One enhancement:**
- Chatbox transition explicitly marks Area 4
- Messaging: "You've seen why Kumamoto, the government backing, and the changes underway. Now let's look at the investment opportunities."

### Post-Journey: AI Chat (unchanged)

- Available after C1 completion
- Handles follow-up questions about Kumamoto

---

## Data Additions Required

### New Markers (data.js)

| Marker | Location | Type | Journey/Step |
|--------|----------|------|--------------|
| Coca-Cola Bottlers Japan | Minami-ku, Kumamoto | Evidence | A2 |
| Suntory Kyushu Factory | Kashima, Kamimashiki | Evidence | A2 |
| National Government | Symbolic/Tokyo | Commitment | B1 |
| Kumamoto Prefecture | Prefecture center | Commitment | B1 |
| Kikuyo City | Kikuyo | Commitment | B1 |
| Ozu City | Ozu | Commitment | B1 |
| Grand Airport | Airport area | Commitment | B1 |
| New Station | TBD | Infrastructure | B7 |
| Infrastructure Upgrade 1 | TBD | Infrastructure | B7 |

### Panel Content Updates

| Panel | Updates Needed |
|-------|----------------|
| Water resource | Add Coca-Cola/Suntory as evidence |
| Electricity resource | Add energy mix details (solar/wind/nuclear) |
| Government levels | New panels for each commitment level |
| Station | New panel with connectivity details |
| Infrastructure upgrades | New panels with transformation details |

### Chatbox Content Updates

| Step | Update |
|------|--------|
| A3 | New: Pair 2 strategic narrative |
| A→B transition | Frame shift to "Government Support" |
| B1 | New: Commitment chain introduction |
| B4 intro | Reframe as "result of government commitment" |
| B6→B7 transition | Explicit "plans → proof" shift |
| B7 intro | "Changes in Area" section header |
| B→C transition | Explicit Area 4 introduction |

---

## Implementation Notes

### Interaction Pattern Consistency

All steps follow the same pattern:
```
Chatbox says something → Map shows elements → User clicks → Panel shows detail
```

Steps are defined by chatbox advances, not by user clicks within a step.

### Evidence Level: Key Highlights

For MVP, add real data for key proof points:
- Coca-Cola and Suntory (water evidence)
- 1-2 energy examples in panel text
- Station and 1-2 upgrade markers

Remaining details can be narrative mentions, expanded later.

### No State Machine Changes

The existing journey/step state machine stays intact:
- Journey A: 3 steps (A1, A2, A3)
- Journey B: 4 steps (B1, B4, B6, B7)
- Journey C: 1 step (C1)

Changes are content additions and chatbox reframing, not structural.

---

## Success Criteria

Per Henry's feedback, the demo must:
1. Cover 4 areas in order (Why Kumamoto → Government → Changes → Investment)
2. Show 4 pillars for "Why Kumamoto" with evidence
3. Show full government commitment chain
4. Show tangible infrastructure changes as proof
5. Land on "our units" as the conclusion

This design achieves all five requirements while minimizing implementation risk.
