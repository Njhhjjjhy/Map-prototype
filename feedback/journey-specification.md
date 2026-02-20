# MOHA-MAP: COMPLETE MAP JOURNEY SPECIFICATION

**Implementation-Ready Detail for Map Interactions**  
**Version 1.0 | February 18, 2026**

---

## CRITICAL MAP STATES & LAYER CONFIGURATION

### Map Viewport States
1. **japan overview** (entry context)
2. **kumamoto region** (main operational state)
3. **zone focus** (kikuyo/koshi/ozu drill-down)
4. **property focus** (individual property detail)

### Layer System
- **base layer** (always on): geography, roads, landmarks
- **zones layer**: silicon triangle boundaries (kikuyo/koshi/ozu) with color coding
- **infrastructure layer**: current + future (dashed lines for planned)
- **workforce layer**: university pins, population density heatmap
- **corporate layer**: TSMC/JASM, Sony, TEL with investment data
- **risk layer**: flood zones (blue), narrow roads (red), seismic zones
- **property layer**: real estate opportunities with house icons
- **future state toggle**: shows completed 2030+ infrastructure

---

## MAP JOURNEY FLOW

### ENTRY: Q1 - "LAND ALREADY PRICEY?"

**slide reference point**: resource list showing water/power/strategic location

**map transition trigger**: clicking resource list item

**initial map state**:
- kumamoto regional view
- base + zones layers active
- no properties visible yet

---

### CLICKABLE ELEMENTS WITH INTERACTIONS

#### 1. WATER RESOURCES

**click action**: highlight water-related locations on map

**locations shown**:
- **suntory factory**
  - coordinates: exact from company data
  - connection line to JASM
  - marker type: water droplet icon
  
- **coca-cola facility** (mt. aso watershed area)
  - connection line to groundwater recharge zones
  - marker type: water droplet icon

**right panel evidence**:
- screenshot: TSMC ESG sustainability report (pages showing water commitment)
- screenshot: coca-cola press release on groundwater preservation
- screenshot: suntory factory water quality documentation
- link: TSMC green power/sustainability official page

**chatbox narrative**: "kumamoto sits on world-class underground water aquifer system. TSMC selected this location partly for sustainable water access. suntory and coca-cola operations prove industrial-scale water reliability."

---

#### 2. POWER INFRASTRUCTURE - SOLAR

**click action**: show all solar installations across kyushu

**map behavior**:
- zoom out to kyushu-wide view
- solar farm markers appear (yellow sun icons)
- airline-style connection lines from each solar farm to JASM
- animation: slow, clear line drawing (not current fast zoom)

**right panel evidence**:
- screenshot: METI document showing solar capacity growth chart (2012-2024)
  - chart shows 154kW (2012) → 1,288kW (2024.9)
  - +147kW increase documented
  
- screenshot: kyushu renewable energy capacity report
  - document: https://www.meti.go.jp/shingikai/enecho/denryoku_gas/saisei_kano/smart_power_grid_wg/pdf/001_s01_08.pdf

**locations with coordinates**:
- major solar installations across fukuoka, saga, nagasaki, kumamoto, oita, miyazaki, kagoshima
- each location shows capacity in MW

---

#### 3. POWER INFRASTRUCTURE - WIND

**click action**: show all wind installations across kyushu

**map behavior**:
- zoom maintains kyushu-wide view
- wind farm markers appear (blue wind turbine icons)
- airline-style connection lines from each wind farm to JASM

**right panel evidence**:
- same METI chart showing wind capacity alongside solar
- breakdown of wind vs solar contribution

---

#### 4. POWER INFRASTRUCTURE - NUCLEAR

**click action**: show nuclear power plants

**map behavior**:
- nuclear plant markers appear (distinct nuclear icon)
- airline-style connection lines to JASM
- zoom capability to plant locations

**nuclear facilities shown**:

**genkai nuclear power station**
- coordinates: 33.515° N, 129.836° E
- location: genkai town, higashimatsuura district, saga prefecture, kyushu
- status: operational as stable power source
- click to show location detail

**sendai nuclear power station**
- coordinates: 31.8336° N, 130.1894° E
- location: satsumasendai city, kagoshima prefecture, kyushu
- status: operational
- click to show location detail

**right panel evidence**:
- screenshot: kyushu electric power grid nuclear component documentation
- evidence text: "九州電力系統中仍有核能機組作為穩定電源的一部分"

**chatbox narrative**: "semiconductor manufacturing requires stable, green baseload power. kyushu's combination of renewables (solar/wind) plus nuclear provides the reliability TSMC demands for 24/7 fab operations."

---

#### 5. SEWAGE & MUNICIPAL INFRASTRUCTURE

**click action**: show sewage system planning

**right panel evidence**:
- screenshot: kumamoto seimicon tokutei koshu gesuid document
  - PDF: https://www.pref.kumamoto.jp/uploaded/attachment/275073.pdf
  - shows public sewage infrastructure for semiconductor district

- screenshot: fukuhara (koshi city) & haramizu (kikuyo town) sewage plan
  - PDF page 2: https://www.pref.kumamoto.jp/uploaded/attachment/275070.pdf

**chatbox narrative**: "rapid semiconductor industry + population influx directly impacts water/drainage/sewage treatment demand. 'specified public sewage' infrastructure projects are critical conditions for continued fab zone expansion."

---

#### 6. SILICON ISLAND KYUSHU HERITAGE

**click action**: show kyushu semiconductor historical context

**right panel evidence**:
- screenshot: bank of japan (BoJ) fukuoka branch report
  - shows kyushu historically called "silicon island"
  - IC production: ~40% of domestic share
  - semiconductor manufacturing equipment: ~20% of domestic share
  - japan leads globally in semiconductor materials & equipment
  - document: https://www3.boj.or.jp/fukuoka/topics/topics202303.pdf

- screenshot: kyushu semiconductor company map showing historical presence
  - mitsubishi electric, rohm, SUMCO, toshiba, sony locations across kyushu
  - red dots: semiconductor factories
  - blue squares: materials/semiconductor manufacturing equipment companies

**right panel includes image**: kyushu prefecture map with all semiconductor-related companies marked

**chatbox narrative**: "kyushu isn't new to semiconductors—it's a revival. the 'silicon island' heritage means existing supplier base, trained workforce, and tested infrastructure. TSMC is betting on proven ground."

---

#### 7. STRATEGIC POSITION (ASIA GEOPOLITICS)

**click action**: show airline-route style map

**right panel shows image**: east asia map highlighting kyushu position relative to taiwan, korea, shanghai

**evidence content**:
- "九州位於日本西南側，天然更貼近東亞主要半導體與電子產業鏈（台灣的晶圓代工、韓國的記憶體、華東的終端與供應鏈腹地）"
- geographic advantage for semiconductor supply chain logistics

**chatbox narrative**: "kyushu's southwest position makes it naturally closer to taiwan's foundries, korea's memory, and east china's end-user markets than tokyo or osaka. it's a strategic logistics hub for asian semiconductor ecosystem."

---

### TRANSITION POINT: BACK TO SLIDES

**trigger**: "airline map route is cue for switch back to slides" (per image annotation)

**slide sequence covered** (map not shown):
- Q2: "what if TSMC kumamoto plan changes?"
  - slide: TSMC & japan cooperation agreement
  - slide: japan semiconductor revival
  
**then transition back to map for next section**

---

### Q3: "CAN PROPERTIES RENT OUT?"

**slide reference point**: kumamoto semiconductor science park / airport concept slide

**map transition trigger**: talent pipeline slide presentation

**map state**:
- kumamoto regional view
- infrastructure layer activates (current + future)
- development timeline overlay

---

## INFRASTRUCTURE & DEVELOPMENT TIMELINE

**"pipeline slide is the cue to switch to map"** (per image annotation)

### CLICKABLE DEVELOPMENT TIMELINE

**click action**: reveal government zone planning layer

**right panel shows**: development timeline graphic

---

### INTERACTIVE ZONES ON MAP

#### 1. KUMAMOTO SCIENCE PARK

**click behavior**: highlight entire cluster boundary

**map visual**: large boundary zone encompassing JASM core area

**zone designation**: "semiconductor cluster area / kochi municipal industrial park / kikuyo town-operated industrial park"
- center area: "semicontechno park adjacent area core" (JASM, sony, tokyo electron kyushu concentration)
- distributed model: multiple development sites integrated as "distributed version"

**right panel evidence**:
- screenshot: kumamoto prefecture science park master plan
- link: pref.kumamoto.jp documentation

---

#### 2. GOVERNMENT ZONE PLAN

**click behavior**: show complete zone overlay with all planned industrial areas

**zones shown on map**:
- koshi city commercial/industrial zone
- kikuyo town rezoned development district
- ozu town commercial zone
- kyokushi kawabe business/industrial zone

**right panel evidence**:
- screenshot: "multiple industrial sites (koshi city, kikuyo commercial zone, ozu commercial zone, etc.) will launch phased development and subdivision over coming years"
- source: pref.kumamoto.jp

**map annotation**: each zone shows phased activation timeline

---

#### 3. KIKUYO LONG-TERM PLAN

**"R" badge marker on map** (per images)

**click behavior**:
- zoom to kikuyo cluster area
- highlight 70-hectare haramizu station land development zone
- show "new station" location between mitsuriki-haramizu stations

**right panel evidence**:
- screenshot: JR kyushu document mentioning kikuyo town promoting new station between mitsuriki-haramizu
- screenshot: 70-hectare haramizu station vicinity land readjustment project
- screenshot: kikuyo town tender document specifying three-zone concept:
  - nigiwai (bustling activity)
  - chi no shuseki (knowledge accumulation)
  - shokuju kinsetsu (work-live proximity)
- facility introduction: residential, apartments, hotels, university campus

**vision plan content**:
- mitsui fudosan + JR kyushu selected as "future vision implementation" business partners
- long-term city-level project, not single housing development
- international support: kikuyo town established foreign consultation counter
  - fixed schedule chinese + english interpretation support
  - tuesday/thursday: chinese & english
  - monday/wednesday/friday: english
- source: town.kikuyo.lg.jp

---

#### 4. OZU LONG-TERM PLAN

**"R" badge marker on map**

**click behavior**:
- zoom to ozu cluster area
- highlight ozu development zones

**right panel evidence**:
- screenshot: ozu town vision plan
- shows ozu role as "gateway / office & logistics support" in silicon triangle

---

## FUTURE OUTLOOK TOGGLE

**"click future switch"** (per image annotation)

**button/toggle action**: switches entire map to 2030+ completed state

### Future State Visualization Shows:

#### science park cluster expansion
- completed semiconductor park boundaries
- all industrial sites operational
- expanded zones visible

#### grand airport concept new urban zone
- kumamoto airport expansion highlighted
- new urban development area shown

#### road extension completions
- all planned road segments now solid lines (not dashed)
- completed highway connections shown
- "10-minute ring road" semiconductor corridor highlighted

#### new stations and airport access
- new rail stations marked and operational
- airport access rail line shown as completed
- enhanced connectivity visible

**right panel evidence**:
- screenshot: government future outlook documentation showing:
  - science park cluster expansion zones
  - grand airport concept urban development
  - road extension highlights
  - new station and airport access infrastructure
  
**narrative content**: "under science park and grand airport plan, this is comprehensive long-term urbanization plan. short-term rental targeting semiconductor industry-related tenants. mid-long term: drives regional growth, creates entry for other industries, drives employment and population growth."

---

## INFRASTRUCTURE ELEMENTS (EACH CLICKABLE)

### 1. GRAND AIRPORT

**marker on map**: kumamoto airport

**click behavior**: highlight airport area

**right panel evidence**:
- grand airport concept documentation

---

### 2. AIRPORT ACCESS

**"R" badge marker**

**click behavior**:
- highlight area on map
- show planned access routes

**right panel evidence**:
- screenshot: airport access infrastructure evidence document
- note: "highlight the area + screen shot of the evidence"

---

### 3. NEW RAILWAY

**"R" badge marker - "New Railway on"** (per image)

**click behavior**:
- highlight railway corridor on map
- show new rail line routing

**right panel evidence**:
- screenshot: new railway construction plan
- kumamoto prefecture 2025 june announcement: "route narrowing results after alignment review"
- subsequent steps: project cost calculation, demand forecast, cost-benefit (B/C) analysis, revenue feasibility
- source: kumamoto prefecture documentation

**specific route details**:
- connects higo-ozu → new kumamoto airport access road area
- part of "airport-industrial-residential integrated urban corridor"
- "10-minute ring" concept: airport (global gateway) — industrial park (JASM/science park) — main residential zones maintained at ~10-minute drive intervals

**right panel includes images**:
- cost structure chart (transport construction cost structure)
- kumamoto city community transit penetration map
- source links: city.kumamoto.jp infrastructure documentation

---

### 4. ROAD EXTENSION

**"R" badge marker**

**click behavior**:
- highlight road expansion zones on map
- show completed vs planned segments

**right panel evidence**:
- screenshot: road extension construction plan
- note: "highlight the area + screen shot of the evidence"

---

## EDUCATION PIPELINE

**"pipeline slide is the cue to switch to map"** (per image)

### UNIVERSITIES

**click behavior**: show all kyushu universities with connection lines to JASM

**visual treatment**:
- university pins across kyushu
- airline-style connection lines converging on JASM logo at kumamoto
- simplified visualization (not excessive controls)

**universities shown**: major kyushu institutions feeding semiconductor talent

**right panel shows image**: semiconductor talent cultivation ecosystem diagram showing:
- kyutech (kyushu institute of technology): semiconductor value creation human resources center
- kumamoto university: launched semiconductor-focused information major & course "modern society and semiconductors"
- prefectural university of kumamoto: semiconductor core human resources reskilling center for working adults
- established "semiconductor co-creation research hub" with JASM

**evidence note**: "since 2023, all first-year science & engineering students take semiconductor introduction classes taught by local industry guests"

---

### TRAINING CENTERS

**click behavior**: show training center locations

**right panel evidence**:
- screenshot: semiconductor training center documentation
- "show evidence"

---

### EMPLOYMENT DATA

**click behavior**: show employment centers on map

**right panel evidence**:
- screenshot: employment data visualization showing TEL salary increase
- text: "半導體人才競爭已反映在薪酬：公開報導指出 TEL 將新進員工起薪提高約 40%（2024 年起）。Bloomberg.com"
- english: "semiconductor talent competition reflected in compensation: public reports indicate TEL raised starting salaries for new employees by approximately 40% (starting 2024)"

---

### INTERNATIONAL EDUCATION

**right panel evidence content**:

**kumamoto international school expansion**:
- school relocated and expanded facilities with kumamoto prefecture & corporate support
- elementary section specifically expanded to accommodate TSMC employee children

**kumamoto city internationalization promotion vision**:
- PDF: city.kumamoto.jp documentation
- public school support system: kumamoto city board of education deployed japanese language support & translation staff for taiwanese children at public schools
- indicates migrants not limited to international schools—integrating into local school districts signals "long-term settlement"

---

## Q4: "STILL APPRECIATION POTENTIAL?"

**slide reference point**: JASM investment situation + TSMC power efficiency + kyushu financial group outlook

**map interaction**: continues on map with corporate investment layer activation

---

## CORPORATE INVESTMENT LAYER

### CLICKABLE CORPORATE PINS

**map behavior**:
- corporate pins drop in sequence across map
- each pin clickable for detail

**pin locations & data**:

**TSMC/JASM**:
- primary marker at kikuyo location
- click reveals:
  - investment amounts by phase
  - timeline: JASM 1, JASM 2
  - employment projections

**SONY locations**:
- multiple sony semiconductor sites across kyushu marked
- connection to JASM shown

**TOKYO ELECTRON KYUSHU**:
- equipment supplier location marked

**supply chain companies**:
- "three major ecosystem builders" table shown in right panel

**right panel evidence**:
- screenshot: TSMC surrounding infrastructure status map showing:
  1. central fukuoka-oita interchange extension (under major city-prefecture ICT development cooperation agreement, extends center to wash lake IC, new lakeside IC opens, predicted road opens to coast around fiscal 2024)
  2. grand port access extension (TSMC facility front port access (daizu bypass) extension 6km targeted for completion fiscal 2034)
  3. kumamoto airport access rail (under consideration connecting kumamoto station area and airport, under 8km route)
  4. higo-ozu station (new barrier-free station established between minami aso and ozu)

**includes image**: infrastructure development timeline map with numbered markers

---

## Q5: "FUTURE REALLY STABLE?"

**slide reference point**: property investment opportunities

**map state**: kumamoto investment opportunities zone

---

## PROPERTY LAYER ACTIVATION

**"kumamoto investment opportunities zone"** shown on map as large overlay

**right panel shows image**: kumamoto investment zone map with color-coded regions:
- orange/yellow central zone (highest opportunity)
- green zones (good opportunity)
- various labeled industrial/business areas

**map includes labeled zones**:
- semiconductor cluster area
- kumamoto prefecture industrial park (kikuchi city)
- kikuyo town-operated industrial park
- kyokushi kawabe business/industrial zone
- ozu town-operated industrial zone
- kumamoto airport monorail (planned)
- higo-ozu new kumamoto airport access road

---

## SILICON TRIANGLE ZONES DETAIL

**click on zone areas to reveal**:

### KIKUYO ZONE

**role**: "factory core / new urban core"

**characteristics**:
- manufacturing nucleus
- new urban district hosting capacity
- haramizu station—new station area targeted as advanced new urban district integrating residence, commerce, education, research

**mitsui fudosan & JR kyushu partnership**:
- selected for "future vision implementation"
- long-term city-level project

**international infrastructure**:
- foreign consultation counter established
- fixed chinese + english interpretation schedule

**"new station + 70ha zone" as major development driver**:
- JR kyushu document confirms kikuyo town promoting new station between mitsuriki-haramizu
- coordinated with ~70-hectare haramizu station vicinity land readjustment project

**tender concept**: "nigiwai / chi no shuseki / shokuju kinsetsu" three-zone framework
- residential, apartments, hotels, university campus introduction planned

---

### KOSHI ZONE

**role**: "R&D / tools & process innovation"

**characteristics**:
- research and development focus
- equipment chain concentration

---

### OZU ZONE

**role**: "gateway / office & logistics support"

**characteristics**:
- transportation hub
- logistics coordination
- supplier office locations

---

## PROPERTY INVESTMENT FLOW

**four properties minimum shown** (per meeting notes):

**property markers use house icons with labels**:
- "ozu 1" / "ozu sugimizu"
- "kikuyo 1" / "kikuyo kubota"
- "haramizu land"
- fourth property (per script)

**each property has two-step interaction**:

---

## PROPERTY #1: OZU SUGIMIZU LAND

### STEP 1: TRAVEL TIME

**click property marker**: 
- travel line animates from property to TSMC
- label appears: "5 minutes by car" (or actual time per data)
- line style: traffic/travel visualization

### STEP 2: ZOOM & DETAIL

**click again or "view details"**:
- map zooms to property location
- shows local context
- property boundary highlighted

**right panel cards appear** (4 cards vertical):

---

### CARD 1: IMAGES (PROPERTY PHOTOS)

- "images ozu sugimizu land"
- property photos/renderings
- site context images

---

### CARD 2: TRUTH ENGINE

**content structure**:

**basic settings**:
- area: ozu sugimizu station land (family type)
- land: ___ sqm (corner lot/regular shape/road frontage ___m)
- building: wood construction (ZEH/long-life quality housing options) ___ sqm
- layout: 3LDK + study/flex room, dual bathrooms (expat family friendly)

**design strategy**:
- expat family standard spec: large living/dining, dishwasher, floor heating/high insulation, storage, EV charging prep
- construction replicability: standardized facade & modular floor plans, compress construction period & cost volatility

**land strategy**:
- look at "school district + living amenities + commute" three-factor balance
- risk points: fragmented land, site preparation costs, drainage/foundation improvement costs uncertain

---

### CARD 3: FUTURE OUTLOOK

**content**:
- area development plans
- infrastructure timeline affecting property
- zone evolution projections

---

### CARD 4: FINANCIAL PROJECTION

**content structure**:

**estimated returns**:

**A. rental type (BTR)**:
- annual rent ___ → NOI ___ → NOI/TIC ___%
- exit cap conversion to price ___ → IRR ___%

**right panel includes button**: "click to show rental market report from local agency"
- opens rental market comparables from property management company
- images shown: actual rental market reports showing 160,000 yen and 170,000 yen properties with detailed breakdowns

**additional interactions**:
- "click ozu and kubota properties" → transition to next property

---

## PROPERTY #2: KIKUYO KUBOTA

### STEP 1: TRAVEL TIME

**click property marker**:
- travel line to TSMC
- time display (per data)

### STEP 2: ZOOM & DETAIL

**right panel cards**:

---

### CARD 1: IMAGES

- "images kikuyo kubota"
- property visuals

---

### CARD 2: TRUTH ENGINE

**property type**: single-family home (renovation / buy-renovate-rent or buy-renovate-sell)

**basic settings**:
- area: kikuyo kubota or ozu
- property: age ___ years, ___ sqm
- renovation budget: ___ (including water/electrical, insulation, kitchen/bath)

**design strategy (convert to expat standard)**:
- insulation/window upgrades, traffic flow reorganization, kitchen/bath quality, storage, lighting & moisture control
- renovation period target: ___ weeks (control vacancy period)

**land/asset strategy**:
- advantages: property tax & acquisition cost controllable, fast speed, can replicate small multiple properties
- risks: hidden construction issues (leaks, termites, foundation), resale market depth

---

### CARD 3: FUTURE OUTLOOK

- area development affecting kikuyo kubota location

---

### CARD 4: FINANCIAL PROJECTION

**estimated returns (two paths)**:

**renovation + rental**:
- all-in rent ___ / NOI ___ / yield ___%

**renovation + sale**:
- sale price ___ / gross profit margin ___% / period ___ months

---

## PROPERTY #3: HARAMIZU LAND

same two-step interaction pattern with relevant cards

---

## RC APARTMENT BUILDINGS (LATER/OPTIONAL PROPERTIES)

**type**: collective housing / mansion

**basic information**:
- area: hikarinomori / kumamoto station
- site area: ___ sqm (___ tsubo)
- use district / FAR / BCR: ___ / ___% / ___%
- scale: ___ floors above ground, ___ units
- unit types: 1LDK (___%) / 2LDK (___%)

**design strategy**:
- target expats & high-salary managers/engineers: soundproofing, insulation, storage, security, safety, maintenance-free
- property management & parking: parking allocation & management quality directly affects rent ceiling

**land strategy**:
- priority: hikarinomori and kumamoto station 10-minute walking range
- risk points: land price, timing of semiconductor-related population entry, must ensure occupancy rate maintained above 95%

**estimated returns**:
- total investment amount (TIC): land ___ + construction ___ + fees ___ = ___
- annualized gross rental income (GPI): ___
- vacancy & bad debt: ___%
- operating expenses (OPEX): ___% (including property management, repairs, taxes)
- NOI: ___
- stabilized cash yield (NOI / TIC): ___%
- exit assumption: cap rate ___% / exit price ___
- IRR (with financing / without financing): ___% / ___%

---

## OBSERVATION AREAS (NOT IMMEDIATE INVESTMENT)

shown on map with different marker style:

### HIKARINOMORI AREA

**opportunity**: high-spec single-family rental or renovation to "expat standard" (insulation, dishwasher, larger living/dining, etc.)

**trend**: large mall drives living amenities, but "internationalization services" still planning/expanding to respond to international talent inflow needs (bilingual clinics, international kindergartens, living amenities)

---

### KUMAMOTO STATION AREA

**opportunity**: RC mansion apartments & hospitality (business trips, regional management, investors)

**trend**: shinkansen 30-minute to hakata commute/business trip advantage makes it "kyushu-level business support center," suitable for japanese company executive family residence

---

## WHY MOREHARVEST CAN DO THIS

**right panel content**:

**deep local knowledge**:
- analyze japan's macroeconomic development direction & trends
- design for local needs from tenant perspective, create property matching demands
- precisely control costs & optimize design to create differentiated products

**stable returns**:
- portfolio maintains 96% average annual occupancy rate
- flexibly adjust investment portfolio according to market changes

**investor perspective**:
- "spend money on blade edge," control spending from start to ensure competitiveness
- flexible exit mechanism, continue developing new opportunities
- property competitiveness 10-20 years later

**avoidance of landmine zones**:
- narrow roads
- flood zones
- observe market situation provide products matching demand
- utilize 20 years investment development experience create differentiation bringing RC / BTR / renovation flexibility

---

## FINAL STATE: Q&A INTERACTIVE MAP

**"qa is the cue to switch to map"** (per image annotation)

**trigger**: "5 questions vs answers" / qa section

**map state becomes hybrid view showing**:

### All Layers Simultaneously Active:
- all investment zones (colored overlays)
- all property locations (markers with labels)
- infrastructure layers (toggleable)
- government development areas visible
- corporate investment pins
- risk overlays available

**purpose**: interactive dashboard for answering live investor questions during Q&A

**final map should show "mix of both"** (per image annotation):
- business development areas
- property investment opportunities
- infrastructure context
- evidence readily accessible

---

## CRITICAL UX REQUIREMENTS

### HOME BUTTON
- always visible
- resets to kumamoto regional overview
- clears all drill-down layers
- returns zoom to default state

### ANIMATION SPEED
- all zoom/pan animations: slow and clear
- airline-style connection lines: animate smoothly
- avoid current "fast zoom" problem
- allow skip for repeat viewers (henry knows journey)

### EVIDENCE PANEL BEHAVIOR
- PDF screenshots, not placeholders
- each evidence item: main screenshot + optional extra pages
- click link → open full PDF/website
- close and return to map seamlessly

### PROPERTY MARKER STYLING
- house icons (not generic pins)
- labels clearly visible: "ozu 1", "kikuyo 1", "haramizu land"
- use google maps pinpoints where no building exists yet
- travel time lines clearly distinguish from infrastructure lines

### STATE PERSISTENCE
- unclear if map remembers position (open question in spec)
- needs decision on layer memory behavior

---

## EVIDENCE REQUIREMENTS

### PDFs NEEDED (per meeting notes):
1. TSMC/JASM sustainability report (key pages screenshot)
2. government long-term planning PDFs:
   - science park documentation
   - cluster plans
   - transport infrastructure timeline
3. Bloomberg article: TEL salary increase evidence
4. mitsui fudosan documents
5. JR kyushu railway documentation
6. kikuyo/koshi/ozu municipal planning documents
7. rental market reports from property management company

### IMAGES NEEDED:
- property photos/renderings for all 4 properties
- government zone planning maps
- infrastructure timeline graphics
- corporate ecosystem diagrams
- comparative rental market data visualizations

---

## TECHNICAL NOTES

### Layer Behavior by Step (from product spec):
- Step 1: Context only (Japan overview)
- Step 2: Base + zones
- Step 3: Base + zones + infrastructure (current + future)
- Step 4: Base + zones + workforce overlay
- Step 5: Base + zones + corporate pins
- Step 6: Base + zones (emphasized) + corporate pins
- Step 7: Base + zones + risk overlay
- Step 8: Base + zones + property pins
- Step 9: Base + single property pin

### Map Interactions Supported in MVP:
- ✅ zoom
- ✅ pan
- ✅ click property marker (opens detail panel)
- ✅ click infrastructure icons (shows info in right panel)
- ✅ click company pins (shows investment details)
- ✅ click risk areas (shows historical data)
- ❌ user-controlled layer toggles (phase 2)
- ❌ search/filter (phase 2)

---

*End of Specification*
