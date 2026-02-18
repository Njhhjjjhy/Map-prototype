/**
 * Mock data for Kumamoto Investment Presentation
 * All data is placeholder for demonstration purposes
 */

/**
 * Step-to-stage lookup: flat, one-directional mapping.
 * Each fine-grained step ID maps to a stage number that determines
 * the inspector panel tab set and card manifest.
 */
const STAGE_MAP = {
    'A0': 1,           // Opening question
    'A1': 2,           // Natural advantages
    'A2': 2,           // Utility infrastructure
    'A3': 3,           // Talent pipeline, universities
    'B1': 4,           // Science park, government support
    // Stage 5: card manifest order matches map pin-drop animation sequence.
    // If pin-drop order changes in app.js stepB4(), update manifest order to match.
    'B4': 5,           // Corporate investment markers
    'B6': 6,           // Future zones, silicon triangle
    'B7': 7,           // Risk areas, infrastructure roads
    'C1': 8,           // Real estate thesis
    'complete': 9      // Property detail, financials
};

/**
 * Tab sets and labels per inspector stage.
 * Stages 1-2 use map + chatbox. Stage 1 also has an evidence panel.
 */
const STAGE_TABS = {
    1: { label: 'The core question', tabs: ['Evidence'] },
    3: { label: 'Talent pipeline', tabs: ['Overview'] },
    4: { label: 'Infrastructure', tabs: ['Plans', 'Timeline', 'Sources'] },
    5: { label: 'Corporate investment', tabs: ['Investment', 'Timeline', 'Press'] },
    6: { label: 'Silicon triangle', tabs: ['Profile', 'Metrics', 'Sources'] },
    7: { label: 'Risk assessment', tabs: ['Assessment', 'History', 'Mitigation'] },
    8: { label: 'Real estate', tabs: ['Demand', 'Yields', 'Properties'] },
    9: { label: 'Property detail', tabs: ['Overview', 'Financials', 'Evidence'] }
};

const AppData = {
    // Map center and zoom settings
    mapConfig: {
        center: [32.8, 130.75], // Kumamoto Prefecture center
        initialZoom: 10,
        resourceZoom: 12,
        propertyZoom: 14
    },

    // Journey A: Opening Question (Step A0)
    openingQuestion: {
        title: 'The core question',
        question: 'Why is Japan\'s government spending ¥10 trillion in Kumamoto?',
        supportingDocs: [
            {
                id: 'meti-plan',
                title: 'Certified semiconductor production facility plan',
                source: 'meti.go.jp',
                type: 'government'
            },
            {
                id: 'reuters-tsmc',
                title: 'Tokyo pledges $4.9B for TSMC Japan expansion',
                source: 'reuters.com',
                type: 'news'
            },
            {
                id: 'nippon-data',
                title: 'Japan making major investments in semiconductor industry',
                source: 'nippon.com',
                type: 'data'
            }
        ]
    },

    // Journey A: Why Kumamoto? - Resources
    resources: {
        water: {
            id: 'water',
            name: 'Aso Groundwater Basin',
            coords: [32.88, 130.90],
            subtitle: 'Natural water resources',
            description: 'Kumamoto sits atop one of Japan\'s largest groundwater basins, fed by Mount Aso\'s volcanic soil. This pristine water supply is critical for semiconductor manufacturing, which requires enormous quantities of ultrapure water.',
            stats: [
                { value: '1.8B', label: 'Cubic meters annual capacity' },
                { value: '99.99%', label: 'Natural purity level' },
                { value: '¥0', label: 'Water acquisition cost' },
                { value: '60%', label: 'Lower than Tokyo rates' }
            ],
            evidence: {
                title: 'Kumamoto water resources report',
                type: 'pdf',
                description: 'Official government report on groundwater sustainability and industrial allocation'
            },
            // Evidence markers proving water quality
            evidenceMarkers: [
                {
                    id: 'coca-cola',
                    name: 'Coca-Cola Bottlers Japan',
                    coords: [32.74, 130.72],
                    subtitle: 'Kumamoto plant',
                    description: 'Major beverage manufacturer chose Kumamoto for exceptional water quality and abundance. The plant produces beverages for the entire Kyushu region.',
                    stats: [
                        { value: '1987', label: 'Established' },
                        { value: 'Minami-ku', label: 'Location' },
                        { value: '500+', label: 'Employees' },
                        { value: 'Kyushu', label: 'Distribution' }
                    ]
                },
                {
                    id: 'suntory',
                    name: 'Suntory Kyushu Kumamoto Factory',
                    coords: [32.82, 130.85],
                    subtitle: 'Premium beverage production',
                    description: 'Suntory selected Kashima, Kamimashiki for its pristine groundwater. The facility produces premium beverages requiring the highest water purity standards.',
                    stats: [
                        { value: '1991', label: 'Established' },
                        { value: 'Kashima', label: 'Location' },
                        { value: 'Premium', label: 'Product grade' },
                        { value: '100%', label: 'Local water' }
                    ]
                }
            ]
        },
        power: {
            id: 'power',
            name: 'Kyushu Power Grid',
            coords: [32.75, 130.65],
            subtitle: 'Power infrastructure',
            description: 'Kyushu Electric provides stable, competitively priced power to the region. The diverse energy mix ensures grid stability critical for semiconductor manufacturing.',
            stats: [
                { value: '2.4GW', label: 'Available industrial capacity' },
                { value: '99.999%', label: 'Grid reliability' },
                { value: '¥12/kWh', label: 'Industrial rate' },
                { value: '15%', label: 'Renewable mix' }
            ],
            evidence: {
                title: 'Kyushu Electric infrastructure plan',
                type: 'pdf',
                description: 'Investment roadmap for semiconductor corridor power infrastructure'
            },
            // NEW: Energy mix breakdown (shown in panel, not on map)
            energyMix: {
                description: 'Kyushu leads Japan in energy diversity, providing the stable power semiconductor fabs require.',
                sources: [
                    { type: 'Solar', examples: 'Kagoshima 24.7 MW, Fukuoka 22.9 MW, Nagasaki 10 MW', icon: 'sun' },
                    { type: 'Wind', examples: 'Miyazaki 65.55 MW, Saga/Nagasaki 27.2 MW, Goto offshore', icon: 'wind' },
                    { type: 'Nuclear', examples: 'Genkai (Saga), Sendai (Kagoshima)', icon: 'atom' }
                ]
            }
        }
    },

    // Kyushu-wide Energy Infrastructure (for combined utility step)
    kyushuEnergy: {
        solar: [
            { id: 'solar-kagoshima', name: 'Kagoshima Solar Installations', coords: [31.56, 130.55], capacity: '24.7 MW', prefecture: 'Kagoshima' },
            { id: 'solar-fukuoka', name: 'Fukuoka Solar Installations', coords: [33.59, 130.40], capacity: '22.9 MW', prefecture: 'Fukuoka' },
            { id: 'solar-nagasaki', name: 'Nagasaki Solar Installations', coords: [32.75, 129.87], capacity: '10 MW', prefecture: 'Nagasaki' }
        ],
        wind: [
            { id: 'wind-miyazaki', name: 'Miyazaki Wind Farm', coords: [31.91, 131.42], capacity: '65.55 MW', prefecture: 'Miyazaki' },
            { id: 'wind-saga', name: 'Saga-Nagasaki Wind Farm', coords: [33.25, 129.95], capacity: '27.2 MW', prefecture: 'Saga/Nagasaki' },
            { id: 'wind-goto', name: 'Goto Offshore Wind', coords: [32.70, 128.85], capacity: 'Offshore', prefecture: 'Nagasaki' }
        ],
        nuclear: [
            { id: 'nuclear-genkai', name: 'Genkai Nuclear Power Station', coords: [33.515, 129.836], capacity: '3.47 GW', prefecture: 'Saga' },
            { id: 'nuclear-sendai', name: 'Sendai Nuclear Power Station', coords: [31.8336, 130.1894], capacity: '1.78 GW', prefecture: 'Kagoshima' }
        ]
    },

    // Journey A: Talent Pipeline (Kyushu-wide scope)
    talentPipeline: {
        description: 'The Kyushu Semiconductor Human Resources Development Alliance, led by METI, coordinates talent cultivation across the region to ensure a steady pipeline of semiconductor engineers and technicians.',
        government: {
            id: 'meti',
            name: 'Ministry of Economy, Trade and Industry',
            role: 'Leads the Kyushu Semiconductor Human Resources Development Alliance',
            goals: 'Strengthen talent cultivation and supply chain stability'
        },
        institutions: [
            {
                id: 'kyutech',
                name: 'Kyutech',
                fullName: 'Kyushu Institute of Technology',
                city: 'Kitakyushu',
                coords: [33.88, 130.84],
                color: '#e74c3c',
                role: 'Established cross-departmental semiconductor human resources center',
                details: [
                    { label: 'Annual graduates', value: '300+' },
                    { label: 'Program scope', value: 'Cross-departmental' },
                    { label: 'Core strength', value: 'Research' }
                ]
            },
            {
                id: 'kyushu-university',
                name: 'Kyushu University',
                fullName: 'Kyushu University',
                city: 'Fukuoka',
                coords: [33.60, 130.42],
                color: '#8e44ad',
                role: 'Established adult semiconductor retraining center',
                details: [
                    { label: 'Annual intake', value: '500+' },
                    { label: 'Target audience', value: 'Working adults' },
                    { label: 'University rank', value: 'Top 5 in Japan' }
                ]
            },
            {
                id: 'oita-university',
                name: 'Oita University',
                fullName: 'Oita University',
                city: 'Oita',
                coords: [33.23, 131.60],
                color: '#2980b9',
                role: 'Established semiconductor core talent retraining center for working professionals',
                details: [
                    { label: 'Program focus', value: 'Core talent development' },
                    { label: 'Target audience', value: 'Working professionals' },
                    { label: 'Partnership model', value: 'Industry-led' }
                ]
            },
            {
                id: 'kumamoto-university',
                name: 'Kumamoto University',
                fullName: 'Kumamoto University',
                city: 'Kumamoto',
                coords: [32.81, 130.73],
                color: '#27ae60',
                role: 'Partnered with JASM (TSMC) on semiconductor research center as industry-academia collaboration',
                details: [
                    { label: 'Industry partner', value: 'JASM (TSMC)' },
                    { label: 'Researchers', value: '400+' },
                    { label: 'Model', value: 'Industry-academia' }
                ]
            },
            {
                id: 'prefectural-kumamoto',
                name: 'Prefectural University of Kumamoto',
                fullName: 'Prefectural University of Kumamoto',
                city: 'Kumamoto',
                coords: [32.83, 130.76],
                color: '#f39c12',
                role: 'Since 2023, all first-year science and engineering students required to take semiconductor introductory courses taught by industry experts',
                details: [
                    { label: 'Mandate start', value: '2023' },
                    { label: 'Scope', value: 'All first-year students' },
                    { label: 'Instructors', value: 'Industry experts' }
                ]
            }
        ]
    },

    // Journey B: Infrastructure - Science Park
    sciencePark: {
        center: [32.87, 130.78],
        radius: 15000, // meters
        name: 'Kumamoto Science Park Corridor',
        subtitle: 'Government development zone',
        description: 'The Kumamoto Prefectural Government has designated this area as a special semiconductor development zone, offering tax incentives, streamlined permitting, and infrastructure investments totaling ¥4.8 trillion.',
        stats: [
            { value: '¥4.8T', label: 'Government investment' },
            { value: '2040', label: 'Completion target' },
            { value: '50,000', label: 'Projected new jobs' },
            { value: '12', label: 'Major facilities planned' }
        ],
        evidence: {
            title: 'Kumamoto Science Park master plan',
            type: 'pdf',
            description: 'Official development roadmap and zoning documentation'
        }
    },

    // Journey B: Government Commitment Chain
    governmentChain: {
        intro: 'Every level of government is aligned behind this corridor.',
        levels: [
            {
                id: 'national',
                name: 'Japan National Government',
                coords: [32.87, 130.70],
                subtitle: 'Strategic semiconductor policy',
                type: 'commitment',
                description: 'The Japanese government designated semiconductors as critical infrastructure, committing ¥10 billion to support domestic chip production in Kumamoto.',
                stats: [
                    { value: '¥10B', label: 'Direct commitment' },
                    { value: '2021', label: 'Policy announced' },
                    { value: 'Critical', label: 'Infrastructure status' },
                    { value: '50%', label: 'JASM subsidy' }
                ]
            },
            {
                id: 'prefecture',
                name: 'Kumamoto Prefecture',
                coords: [32.79, 130.74],
                subtitle: 'Regional coordination',
                type: 'commitment',
                description: 'Kumamoto Prefecture allocated additional funds and streamlined permitting for semiconductor-related development across the region.',
                stats: [
                    { value: '¥480B', label: 'Infrastructure budget' },
                    { value: '12', label: 'Priority projects' },
                    { value: '30%', label: 'Permit time reduction' },
                    { value: '2040', label: 'Master plan horizon' }
                ]
            },
            {
                id: 'kikuyo-city',
                name: 'Kikuyo Town',
                coords: [32.88, 130.83],
                subtitle: 'Local development plan',
                type: 'commitment',
                description: 'Kikuyo approved rezoning for 2,500 housing units and commercial centers to support semiconductor worker families.',
                stats: [
                    { value: '2,500', label: 'Housing units' },
                    { value: '¥180B', label: 'Infrastructure' },
                    { value: '2028', label: 'Phase 1 complete' },
                    { value: '+45%', label: 'Population target' }
                ]
            },
            {
                id: 'ozu-city',
                name: 'Ozu Town',
                coords: [32.86, 130.87],
                subtitle: 'Industrial expansion',
                type: 'commitment',
                description: 'Ozu designated 120 hectares for industrial and logistics use, supporting the semiconductor supply chain.',
                stats: [
                    { value: '120ha', label: 'Industrial land' },
                    { value: '¥95B', label: 'Investment' },
                    { value: '2027', label: 'Phase 1' },
                    { value: '3,000', label: 'Jobs projected' }
                ]
            },
            {
                id: 'grand-airport',
                name: 'Grand Airport Concept',
                coords: [32.84, 130.86],
                subtitle: 'Future connectivity vision',
                type: 'concept',
                description: 'Long-term vision to expand Kumamoto Airport into a major cargo hub serving the semiconductor corridor with direct routes to Asia.',
                stats: [
                    { value: '2035', label: 'Target completion' },
                    { value: '+200%', label: 'Cargo capacity' },
                    { value: '8', label: 'New Asia routes' },
                    { value: '¥320B', label: 'Projected investment' }
                ]
            }
        ]
    },

    // Journey B: Government Tiers (3-tier visual hierarchy)
    governmentTiers: [
        {
            id: 'central',
            tier: 'Central Government',
            tierLabel: 'National Policy',
            color: '#007aff',
            name: 'Japan National Government',
            coords: [32.87, 130.70],
            description: 'The Japanese government designated semiconductors as critical infrastructure, committing ¥10 billion to support domestic chip production in Kumamoto.',
            commitment: '¥10B',
            commitmentLabel: 'Direct Investment',
            stats: [
                { value: '¥10B', label: 'Direct commitment' },
                { value: '2021', label: 'Policy announced' },
                { value: 'Critical', label: 'Infrastructure status' },
                { value: '50%', label: 'JASM subsidy' }
            ]
        },
        {
            id: 'prefectural',
            tier: 'Prefectural Government',
            tierLabel: 'Regional Coordination',
            color: '#34c759',
            name: 'Kumamoto Prefecture',
            coords: [32.79, 130.74],
            description: 'Kumamoto Prefecture allocated additional funds and streamlined permitting for semiconductor-related development across the region.',
            commitment: '¥480B',
            commitmentLabel: 'Infrastructure Budget',
            stats: [
                { value: '¥480B', label: 'Infrastructure budget' },
                { value: '12', label: 'Priority projects' },
                { value: '30%', label: 'Permit time reduction' },
                { value: '2040', label: 'Master plan horizon' }
            ]
        },
        {
            id: 'local',
            tier: 'Local Government',
            tierLabel: 'Implementation',
            color: '#ff9500',
            name: 'Local Municipalities',
            coords: [32.87, 130.85],
            description: 'Three key local initiatives directly supporting the semiconductor corridor workforce and infrastructure.',
            commitment: '¥595B',
            commitmentLabel: 'Combined Investment',
            stats: [
                { value: '¥595B', label: 'Combined investment' },
                { value: '3', label: 'Key initiatives' },
                { value: '2028', label: 'Phase 1 targets' },
                { value: '5,500+', label: 'Housing + jobs' }
            ],
            subItems: [
                {
                    id: 'kikuyo-city',
                    name: 'Kikuyo Town',
                    subtitle: 'Residential and commercial',
                    coords: [32.88, 130.83],
                    commitment: '¥180B',
                    description: 'Kikuyo approved rezoning for 2,500 housing units and commercial centers to support semiconductor worker families.',
                    stats: [
                        { value: '2,500', label: 'Housing units' },
                        { value: '¥180B', label: 'Infrastructure' },
                        { value: '2028', label: 'Phase 1 complete' },
                        { value: '+45%', label: 'Population target' }
                    ]
                },
                {
                    id: 'ozu-city',
                    name: 'Ozu Town',
                    subtitle: 'Industrial expansion',
                    coords: [32.86, 130.87],
                    commitment: '¥95B',
                    description: 'Ozu designated 120 hectares for industrial and logistics use, supporting the semiconductor supply chain.',
                    stats: [
                        { value: '120ha', label: 'Industrial land' },
                        { value: '¥95B', label: 'Investment' },
                        { value: '2027', label: 'Phase 1' },
                        { value: '3,000', label: 'Jobs projected' }
                    ]
                },
                {
                    id: 'grand-airport',
                    name: 'Grand Airport Concept',
                    subtitle: 'Future connectivity',
                    coords: [32.84, 130.86],
                    commitment: '¥320B',
                    description: 'Long-term vision to expand Kumamoto Airport into a major cargo hub serving the semiconductor corridor with direct routes to Asia.',
                    stats: [
                        { value: '2035', label: 'Target completion' },
                        { value: '+200%', label: 'Cargo capacity' },
                        { value: '8', label: 'New Asia routes' },
                        { value: '¥320B', label: 'Projected investment' }
                    ]
                }
            ]
        }
    ],

    // Journey B: Infrastructure - Companies
    companies: [
        {
            id: 'jasm',
            name: 'JASM (TSMC Japan)',
            coords: [32.874, 130.785],
            subtitle: 'Semiconductor manufacturing',
            description: 'Joint venture between TSMC, Sony, and Denso. Japan\'s most advanced semiconductor fab, producing chips for automotive and industrial applications.',
            stats: [
                { value: '¥1.2T', label: 'Total investment' },
                { value: '3,400', label: 'Direct employees' },
                { value: '2024', label: 'Phase 1 operational' },
                { value: '22nm', label: 'Process node' }
            ],
            evidence: {
                title: 'JASM press release',
                type: 'pdf',
                description: 'Official announcement of Phase 2 expansion'
            }
        },
        {
            id: 'sony',
            name: 'Sony Semiconductor',
            coords: [32.90, 130.82],
            subtitle: 'Image sensor production',
            description: 'Sony\'s flagship image sensor facility supplies Apple, Samsung, and global smartphone manufacturers. Recent expansion doubled production capacity.',
            stats: [
                { value: '¥850B', label: 'Expansion investment' },
                { value: '4,200', label: 'Employees' },
                { value: '50%', label: 'Global CMOS share' },
                { value: '2026', label: 'Expansion complete' }
            ],
            evidence: {
                title: 'Sony Kumamoto expansion',
                type: 'pdf',
                description: 'Facility expansion and hiring announcement'
            }
        },
        {
            id: 'tokyo-electron',
            name: 'Tokyo Electron',
            coords: [32.85, 130.73],
            subtitle: 'Equipment manufacturing',
            description: 'World\'s third-largest semiconductor equipment manufacturer. New Kumamoto facility will produce next-generation chip-making tools.',
            stats: [
                { value: '¥320B', label: 'Investment' },
                { value: '1,200', label: 'Projected jobs' },
                { value: '2025', label: 'Opening' },
                { value: '#3', label: 'Global equipment rank' }
            ],
            evidence: {
                title: 'Tokyo Electron announcement',
                type: 'pdf',
                description: 'New facility press release'
            }
        },
        {
            id: 'mitsubishi',
            name: 'Mitsubishi Electric',
            coords: [32.82, 130.80],
            subtitle: 'Power semiconductors',
            description: 'Major expansion of power semiconductor production for electric vehicles and renewable energy systems.',
            stats: [
                { value: '¥260B', label: 'Investment' },
                { value: '800', label: 'New jobs' },
                { value: '2025', label: 'Completion' },
                { value: '40%', label: 'Capacity increase' }
            ],
            evidence: {
                title: 'Mitsubishi power semiconductor plan',
                type: 'pdf',
                description: 'EV market expansion strategy'
            }
        },
        {
            id: 'sumco',
            name: 'SUMCO',
            coords: [32.93, 130.70],
            subtitle: 'Silicon wafer manufacturing',
            description: 'One of the world\'s largest silicon wafer manufacturers. SUMCO\'s Kyushu facilities produce high-purity wafers essential for advanced semiconductor fabrication.',
            stats: [
                { value: '¥180B', label: 'Investment' },
                { value: '1,500', label: 'Employees' },
                { value: '30%', label: 'Global wafer share' },
                { value: '2026', label: 'Expansion complete' }
            ],
            evidence: {
                title: 'SUMCO Kyushu expansion',
                type: 'pdf',
                description: 'Wafer production capacity expansion plan'
            }
        },
        {
            id: 'kyocera',
            name: 'Kyocera',
            coords: [32.91, 130.88],
            subtitle: 'Ceramic packages & components',
            description: 'Kyocera manufactures ceramic packages and electronic components critical to semiconductor assembly. Their Kyushu operations serve the entire Asia-Pacific market.',
            stats: [
                { value: '¥95B', label: 'Investment' },
                { value: '2,800', label: 'Employees' },
                { value: 'IC packages', label: 'Core product' },
                { value: 'Asia-Pacific', label: 'Market served' }
            ],
            evidence: {
                title: 'Kyocera component expansion',
                type: 'pdf',
                description: 'Regional manufacturing strategy'
            }
        },
        {
            id: 'rohm-apollo',
            name: 'Rohm Apollo',
            coords: [32.89, 130.76],
            subtitle: 'Analog & power semiconductors',
            description: 'Rohm Apollo Semiconductor produces analog ICs and power devices in Kumamoto. Expanding capacity to meet growing EV and industrial automation demand.',
            stats: [
                { value: '¥120B', label: 'Investment' },
                { value: '1,100', label: 'Employees' },
                { value: 'SiC power', label: 'Key technology' },
                { value: '+60%', label: 'Capacity expansion' }
            ],
            evidence: {
                title: 'Rohm Apollo SiC expansion',
                type: 'pdf',
                description: 'Silicon carbide power device production plan'
            }
        }
    ],

    // Journey B: Future Development Zones
    futureZones: [
        {
            id: 'kikuyo',
            name: 'Kikuyo Development Zone',
            coords: [32.88, 130.83],
            radius: 5000,
            color: '#5856D6',
            strokeColor: '#5856D6',
            subtitle: 'Residential & commercial',
            description: 'Kikuyo Town has approved rezoning for mixed-use development adjacent to the Science Park. New housing, retail, and support services for semiconductor workers.',
            stats: [
                { value: '2,500', label: 'Housing units planned' },
                { value: '¥180B', label: 'Infrastructure budget' },
                { value: '2028', label: 'Phase 1 complete' },
                { value: '15min', label: 'To JASM' }
            ],
            evidence: {
                title: 'Kikuyo Town development plan',
                type: 'pdf',
                description: 'Official rezoning and infrastructure roadmap'
            }
        },
        {
            id: 'ozu',
            name: 'Ozu Industrial Expansion',
            coords: [32.86, 130.87],
            radius: 4000,
            color: '#30B0C7',
            strokeColor: '#30B0C7',
            subtitle: 'Industrial & logistics',
            description: 'Ozu Town is developing new industrial parcels and logistics facilities to support the semiconductor supply chain.',
            stats: [
                { value: '120ha', label: 'Industrial land' },
                { value: '¥95B', label: 'Investment' },
                { value: '2027', label: 'Available' },
                { value: '3,000', label: 'Jobs projected' }
            ],
            evidence: {
                title: 'Ozu industrial zone plan',
                type: 'pdf',
                description: 'Industrial development documentation'
            }
        }
    ],

    // Journey B: Investment Zones (spatial framework for property evaluation)
    investmentZones: [
        {
            id: 'central-city',
            name: 'Central city',
            coords: [32.80, 130.71],
            radius: 4000,
            color: 'rgba(251, 185, 49, 0.15)',
            strokeColor: 'rgba(251, 185, 49, 0.4)'
        },
        {
            id: 'middle-zone',
            name: 'Middle zone',
            coords: [32.83, 130.77],
            radius: 3500,
            color: 'rgba(255, 149, 0, 0.15)',
            strokeColor: 'rgba(255, 149, 0, 0.4)'
        },
        {
            id: 'tsmc-area',
            name: 'TSMC area',
            coords: [32.87, 130.82],
            radius: 4500,
            color: 'rgba(0, 122, 255, 0.15)',
            strokeColor: 'rgba(0, 122, 255, 0.4)'
        }
    ],

    // GKTK Fund Vehicle
    gktk: {
        name: 'GKTK Fund',
        fullName: 'Greater Kumamoto Technology Corridor Fund',
        fundSize: '¥2.5B',
        fundSizeNote: 'Target AUM',
        strategy: 'Real estate investment in the semiconductor corridor',
        vintage: '2025',
        stats: [
            { value: '¥2.5B', label: 'Fund size' },
            { value: '2025', label: 'Vintage' },
            { value: '5-7yr', label: 'Hold period' },
            { value: '12-18%', label: 'Target IRR' }
        ]
    },

    // Journey C: Investment Properties
    properties: [
        {
            id: 'prop-1',
            name: 'Kikuyo Residence A',
            coords: [32.8755, 130.8195],
            subtitle: 'New construction',
            address: '969-1 Haramizu, Kikuyo-machi, Kikuchi-gun',
            distanceToJasm: '8.2 km',
            driveTime: '12 min',
            type: 'Single Family Residence',
            zone: 'Kikuyo Development Zone',
            image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
            exteriorImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
            interiorImages: [
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'
            ],
            description: 'Modern 3-bedroom residence in the heart of the development zone. Walking distance to new commercial center.',
            basicStats: [
                { value: '12 min', label: 'Drive to JASM' },
                { value: '8.2 km', label: 'Distance' },
                { value: '2024', label: 'Built' },
                { value: '125 m²', label: 'Floor area' }
            ],
            truthEngine: [
                {
                    title: 'Kikuyo Station expansion',
                    description: 'New train station with direct line to Kumamoto City center. Completion 2026.',
                    impact: '+15% projected value increase'
                },
                {
                    title: 'International school',
                    description: 'English-language school announced for TSMC engineer families.',
                    impact: '+8% rental premium for international tenants'
                },
                {
                    title: 'JASM Phase 2',
                    description: 'Second fab under construction, adding 3,000 more employees.',
                    impact: '+25% rental demand by 2027'
                }
            ],
            financials: {
                acquisitionCost: 48500000,
                scenarios: {
                    bear: {
                        appreciation: 0.03,
                        rentalYield: 0.045,
                        sellingPrice: 52800000,
                        annualRent: 2182500,
                        taxes: 1200000,
                        netProfit: 2882500
                    },
                    average: {
                        appreciation: 0.08,
                        rentalYield: 0.055,
                        sellingPrice: 62200000,
                        annualRent: 2667500,
                        taxes: 2500000,
                        netProfit: 11367500
                    },
                    bull: {
                        appreciation: 0.15,
                        rentalYield: 0.065,
                        sellingPrice: 72500000,
                        annualRent: 3152500,
                        taxes: 4200000,
                        netProfit: 19847500
                    }
                }
            },
            rentalReport: {
                title: 'Property rental analysis',
                type: 'pdf',
                description: 'Detailed rental market analysis from property manager',
                date: '2025-01',
                viewed: false
            },
            // Inspector panel data gaps filled below
            recommendation: 'pursue',
            decisionMetrics: [
                { label: 'Proximity to JASM', value: '8.2 km (top 10%)' },
                { label: 'Projected yield', value: '5.5% net (avg scenario)' },
                { label: 'Demand catalyst', value: 'JASM Phase 2 (+3,000 workers)' }
            ],
            thumbnail: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=60',
            brokerMetrics: {
                rentalHigh: 240000,
                rentalAvg: 222000,
                rentalLow: 182000,
                projectedGrowth: 0.08,
                areaAverage: 195000
            },
            costBreakdown: {
                hardCosts: 42000000,
                acquisitionFees: 2425000,
                fitOut: 1800000,
                stampDuty: 1455000,
                legalFees: 820000
            },
            rentalProjections: {
                bear: { monthlyRent: 182000, managementFee: 18200, vacancyRate: 0.08, annualNetIncome: 1810000 },
                average: { monthlyRent: 222000, managementFee: 22200, vacancyRate: 0.05, annualNetIncome: 2280000 },
                bull: { monthlyRent: 263000, managementFee: 26300, vacancyRate: 0.03, annualNetIncome: 2760000 }
            },
            commuteShifts: {
                shift2am: '8 min',
                shift8am: '18 min',
                shiftMidnight: '10 min'
            }
        },
        {
            id: 'prop-2',
            name: 'Ozu Heights Unit B',
            coords: [32.8735, 130.8225],
            subtitle: 'Apartment investment',
            address: '717 Haramizu, Kikuyo, Kikuchi District',
            distanceToJasm: '10.5 km',
            driveTime: '15 min',
            type: 'Apartment',
            zone: 'Ozu Industrial Expansion',
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
            exteriorImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
            interiorImages: [
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
                'https://images.unsplash.com/photo-1560185127-6a62b8a7d6c8?w=800&q=80'
            ],
            description: 'High-demand apartment in growing residential area. Strong rental history with semiconductor industry tenants.',
            basicStats: [
                { value: '15 min', label: 'Drive to JASM' },
                { value: '10.5 km', label: 'Distance' },
                { value: '2022', label: 'Built' },
                { value: '78 m²', label: 'Floor area' }
            ],
            truthEngine: [
                {
                    title: 'Highway extension',
                    description: 'Route 57 bypass reduces commute to JASM by 5 minutes.',
                    impact: '+12% value from improved access'
                },
                {
                    title: 'Commercial development',
                    description: 'New shopping center approved 500m from property.',
                    impact: '+6% neighborhood desirability'
                },
                {
                    title: 'Tokyo Electron opening',
                    description: 'New facility 4km away, 1,200 new employees seeking housing.',
                    impact: '+30% rental inquiry rate'
                }
            ],
            financials: {
                acquisitionCost: 32000000,
                scenarios: {
                    bear: {
                        appreciation: 0.02,
                        rentalYield: 0.05,
                        sellingPrice: 34500000,
                        annualRent: 1600000,
                        taxes: 720000,
                        netProfit: 2380000
                    },
                    average: {
                        appreciation: 0.07,
                        rentalYield: 0.06,
                        sellingPrice: 41200000,
                        annualRent: 1920000,
                        taxes: 1650000,
                        netProfit: 7550000
                    },
                    bull: {
                        appreciation: 0.12,
                        rentalYield: 0.07,
                        sellingPrice: 48000000,
                        annualRent: 2240000,
                        taxes: 2880000,
                        netProfit: 13120000
                    }
                }
            },
            rentalReport: {
                title: 'Property rental analysis',
                type: 'pdf',
                description: 'Detailed rental market analysis from property manager',
                date: '2025-02',
                viewed: false
            },
            recommendation: 'pursue',
            decisionMetrics: [
                { label: 'Rental demand', value: 'High (Tokyo Electron + JASM)' },
                { label: 'Projected yield', value: '6.0% net (avg scenario)' },
                { label: 'Infrastructure', value: 'Route 57 bypass (-5 min commute)' }
            ],
            thumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=60',
            brokerMetrics: {
                rentalHigh: 187000,
                rentalAvg: 160000,
                rentalLow: 133000,
                projectedGrowth: 0.07,
                areaAverage: 148000
            },
            costBreakdown: {
                hardCosts: 27500000,
                acquisitionFees: 1600000,
                fitOut: 1200000,
                stampDuty: 960000,
                legalFees: 740000
            },
            rentalProjections: {
                bear: { monthlyRent: 133000, managementFee: 13300, vacancyRate: 0.10, annualNetIncome: 1294000 },
                average: { monthlyRent: 160000, managementFee: 16000, vacancyRate: 0.06, annualNetIncome: 1625000 },
                bull: { monthlyRent: 187000, managementFee: 18700, vacancyRate: 0.03, annualNetIncome: 1960000 }
            },
            commuteShifts: {
                shift2am: '10 min',
                shift8am: '25 min',
                shiftMidnight: '12 min'
            }
        }
    ],

    // Area Statistics (for Journey C conclusion)
    areaStats: {
        avgAppreciation: '+8.5%',
        avgRentalYield: '+5.8%',
        occupancyRate: '97.2%',
        trackRecord: [
            { year: '2022', appreciation: '+6.2%' },
            { year: '2023', appreciation: '+9.1%' },
            { year: '2024', appreciation: '+11.3%' }
        ]
    },

    // JASM location for route drawing
    jasmLocation: [32.874, 130.785],

    // Journey A: Airline Routes (Strategic Location)
    airlineRoutes: {
        origin: {
            name: 'Aso Kumamoto Airport',
            coords: [32.8373, 130.8551],
            code: 'KMJ'
        },
        destinations: [
            {
                id: 'seoul-incheon',
                name: 'Seoul Incheon',
                coords: [37.4602, 126.4407],
                code: 'ICN',
                country: 'South Korea',
                region: 'Korea',
                status: 'active',
                flightTime: '1h 30m',
                airlines: ['Asiana Airlines', 'Jin Air'],
                frequency: '7 flights/week',
                significance: 'Samsung memory division HQ link',
                description: 'Direct service to Seoul\'s primary international airport.',
                semiconductorLink: { company: 'Samsung', role: 'Memory Division HQ', color: '#34c759' }
            },
            {
                id: 'busan-gimhae',
                name: 'Busan Gimhae',
                coords: [35.1796, 128.9382],
                code: 'PUS',
                country: 'South Korea',
                region: 'Korea',
                status: 'active',
                flightTime: '1h 15m',
                airlines: ['Jin Air'],
                frequency: '3 flights/week',
                significance: 'TBD',
                description: 'Direct service to South Korea\'s second-largest city.'
            },
            {
                id: 'shanghai-pudong',
                name: 'Shanghai Pudong',
                coords: [31.1443, 121.8083],
                code: 'PVG',
                country: 'China',
                region: 'China',
                status: 'suspended',
                flightTime: '2h 00m',
                airlines: ['TBD'],
                frequency: 'Suspended',
                significance: 'Manufacturing partner access',
                description: 'Service currently suspended.'
            },
            {
                id: 'taiwan-taoyuan',
                name: 'Taiwan Taoyuan',
                coords: [25.0797, 121.2342],
                code: 'TPE',
                country: 'Taiwan',
                region: 'Taiwan',
                status: 'active',
                flightTime: '2h 30m',
                airlines: ['TBD'],
                frequency: 'TBD',
                significance: 'TSMC headquarters connection',
                description: 'Direct service to Taiwan\'s main international gateway.',
                semiconductorLink: { company: 'TSMC', role: 'Global Headquarters', color: '#007aff' }
            },
            {
                id: 'tainan',
                name: 'Tainan Airport',
                coords: [22.9504, 120.2057],
                code: 'TNN',
                country: 'Taiwan',
                region: 'Taiwan',
                status: 'active',
                flightTime: 'TBD',
                airlines: ['TBD'],
                frequency: 'TBD',
                significance: 'TSMC Fab 18 access',
                description: 'Direct service to southern Taiwan semiconductor hub.'
            },
            {
                id: 'kaohsiung',
                name: 'Kaohsiung International',
                coords: [22.5771, 120.3500],
                code: 'KHH',
                country: 'Taiwan',
                region: 'Taiwan',
                status: 'active',
                flightTime: '2h 15m',
                airlines: ['TBD'],
                frequency: 'TBD',
                significance: 'Southern Taiwan industrial access',
                description: 'Direct service to Taiwan\'s second-largest city.'
            },
            {
                id: 'hong-kong',
                name: 'Hong Kong International',
                coords: [22.3080, 113.9185],
                code: 'HKG',
                country: 'Hong Kong',
                region: 'Hong Kong',
                status: 'suspended',
                flightTime: '3h 00m',
                airlines: ['TBD'],
                frequency: 'Suspended',
                significance: 'Financial hub connection',
                description: 'Service currently suspended.'
            }
        ]
    },

    // Journey B: Infrastructure Roads
    infrastructureRoads: [
        {
            id: 'route-57-bypass',
            name: 'Route 57 Bypass',
            coords: [
                [32.82, 130.68],
                [32.84, 130.72],
                [32.86, 130.76],
                [32.874, 130.785]
            ],
            status: 'Under Construction',
            completionDate: '2026',
            budget: '¥86B',
            length: '14.2 km',
            driveToJasm: '12 min',
            commuteImpact: '-8 min',
            description: 'New arterial bypass connecting western Kumamoto directly to the Science Park corridor, reducing congestion on existing routes and providing faster access for JASM workers.',
            documentLink: '#'
        },
        {
            id: 'kikuyo-connector',
            name: 'Kikuyo East Connector',
            coords: [
                [32.90, 130.82],
                [32.89, 130.80],
                [32.874, 130.785]
            ],
            status: 'Approved',
            completionDate: '2027',
            budget: '¥42B',
            length: '6.8 km',
            driveToJasm: '8 min',
            commuteImpact: '-5 min',
            description: 'Direct connector linking Kikuyo residential areas to JASM and Sony facilities, designed to handle increased traffic from new housing developments.',
            documentLink: '#'
        },
        {
            id: 'ozu-industrial-road',
            name: 'Ozu Industrial Access Road',
            coords: [
                [32.86, 130.87],
                [32.87, 130.84],
                [32.874, 130.785]
            ],
            status: 'Planning',
            completionDate: '2028',
            budget: '¥58B',
            length: '9.4 km',
            driveToJasm: '14 min',
            commuteImpact: '-6 min',
            description: 'Heavy-duty industrial road connecting the Ozu logistics zone to the semiconductor corridor, designed for supply chain transport and worker commutes.',
            documentLink: '#'
        }
    ],

    // Journey B: Infrastructure Stations (B7)
    infrastructureStation: {
        id: 'kikuyo-station',
        name: 'Kikuyo Station',
        coords: [32.88, 130.81],
        subtitle: 'New rail connection',
        status: 'Under Construction',
        completionDate: '2026',
        description: 'New JR Hohi Line station providing direct rail access from Kumamoto City to the Science Park corridor. Reduces commute time for semiconductor workers.',
        stats: [
            { value: '18 min', label: 'To Kumamoto City' },
            { value: '8 min', label: 'To JASM' },
            { value: '15 min', label: 'Train frequency' },
            { value: '8,000', label: 'Daily passengers est.' }
        ],
        commuteImpact: 'Rail option',
        documentLink: '#'
    },

    haramizuStation: {
        id: 'haramizu-station',
        name: 'Haramizu Station Area',
        coords: [32.8698, 130.8230],
        subtitle: 'New development hub',
        status: 'Under Development',
        description: 'Haramizu Station area is being developed as a new urban core with 70ha of mixed-use land. Three development zones planned. Mitsui Fudosan and JR Kyushu selected as development partners.',
        stats: [
            { value: '70ha', label: 'Development area' },
            { value: '3 zones', label: 'Mixed-use plan' },
            { value: 'Mitsui + JR', label: 'Development partners' },
            { value: '2028', label: 'Phase 1 target' }
        ],
        zones: [
            { name: 'Vibrancy', description: 'Station-front retail, F&B, international-friendly services' },
            { name: 'Knowledge cluster', description: 'R&D offices, co-working, university satellite' },
            { name: 'Live-Work', description: 'Mid-high density condos, serviced apartments for engineers' }
        ],
        commuteImpact: 'New urban core',
        documentLink: '#'
    },

    // Evidence Groups - Hierarchical evidence with multiple sub-items
    evidenceGroups: {
        'energy-infrastructure': {
            id: 'energy-infrastructure',
            title: 'Energy infrastructure',
            icon: 'zap',
            items: [
                {
                    id: 'solar-power',
                    title: 'Solar power capacity',
                    type: 'pdf',
                    date: '2024-09',
                    viewed: false,
                    description: 'Kyushu leads Japan in solar energy adoption with extensive photovoltaic installations across the region, providing stable renewable power to the semiconductor corridor.',
                    coords: [32.95, 130.55],
                    stats: [
                        { value: '2.4GW', label: 'Installed capacity' },
                        { value: '+18%', label: 'YoY growth' },
                        { value: '12%', label: 'Grid contribution' },
                        { value: '¥8/kWh', label: 'Generation cost' }
                    ]
                },
                {
                    id: 'wind-power',
                    title: 'Wind energy network',
                    type: 'pdf',
                    date: '2024-08',
                    viewed: false,
                    description: 'Offshore and onshore wind installations along the Kyushu coast provide complementary renewable energy, particularly during peak demand periods.',
                    coords: [32.68, 130.42],
                    stats: [
                        { value: '890MW', label: 'Total capacity' },
                        { value: '34%', label: 'Capacity factor' },
                        { value: '2027', label: 'Offshore expansion' },
                        { value: '3x', label: 'Planned growth' }
                    ]
                },
                {
                    id: 'nuclear-kyushu',
                    title: 'Kyushu nuclear (Sendai)',
                    type: 'pdf',
                    date: '2024-06',
                    viewed: false,
                    description: 'Sendai Nuclear Power Plant provides baseload electricity for the region, ensuring stable power supply for high-demand semiconductor manufacturing.',
                    coords: null,
                    stats: [
                        { value: '1.78GW', label: 'Generation capacity' },
                        { value: '99.97%', label: 'Reliability rate' },
                        { value: '24/7', label: 'Baseload operation' },
                        { value: '¥11/kWh', label: 'Cost to grid' }
                    ]
                }
            ]
        },
        'transportation-network': {
            id: 'transportation-network',
            title: 'Transportation network',
            icon: 'route',
            items: [
                {
                    id: 'planned-roads',
                    title: 'Planned road extensions',
                    type: 'pdf',
                    date: '2025-01',
                    viewed: false,
                    description: 'Route 57 bypass and new arterial roads will reduce commute times and improve logistics access to the semiconductor corridor.',
                    coords: [32.84, 130.76],
                    stats: [
                        { value: '42km', label: 'New road length' },
                        { value: '-25%', label: 'Commute reduction' },
                        { value: '2026', label: 'Completion' },
                        { value: '¥86B', label: 'Investment' }
                    ]
                },
                {
                    id: 'railway-expansion',
                    title: 'Railway expansion',
                    type: 'pdf',
                    date: '2024-11',
                    viewed: false,
                    description: 'New Kikuyo Station and expanded JR Hohi Line service will provide direct rail access for semiconductor workers commuting from Kumamoto City.',
                    coords: [32.88, 130.81],
                    stats: [
                        { value: '2026', label: 'Station opening' },
                        { value: '18min', label: 'To Kumamoto City' },
                        { value: '15min', label: 'Headway frequency' },
                        { value: '8,000', label: 'Daily passengers est.' }
                    ]
                },
                {
                    id: 'airport-access',
                    title: 'Kumamoto Airport access',
                    type: 'web',
                    date: '2025-02',
                    viewed: false,
                    description: 'Aso Kumamoto Airport provides international cargo and passenger connections, with new routes planned to support semiconductor industry logistics.',
                    coords: [32.84, 130.86],
                    stats: [
                        { value: '25min', label: 'To Science Park' },
                        { value: '12', label: 'International routes' },
                        { value: '+40%', label: 'Cargo capacity expansion' },
                        { value: '2025', label: 'Terminal upgrade' }
                    ]
                }
            ]
        },
        'government-zones': {
            id: 'government-zones',
            title: 'Government zones',
            icon: 'landmark',
            items: [
                {
                    id: 'science-park-plan',
                    title: 'Kumamoto Science Park',
                    type: 'pdf',
                    date: '2024-03',
                    viewed: false,
                    description: 'The flagship development zone designated by Kumamoto Prefecture for semiconductor and advanced technology industries.',
                    coords: [32.87, 130.78],
                    stats: [
                        { value: '¥4.8T', label: 'Total investment' },
                        { value: '2040', label: 'Master plan horizon' },
                        { value: '50,000', label: 'Jobs target' },
                        { value: '12', label: 'Major facilities' }
                    ]
                },
                {
                    id: 'kikuyo-plan',
                    title: 'Kikuyo long-term plan',
                    type: 'pdf',
                    date: '2024-07',
                    viewed: false,
                    description: 'Kikuyo Town\'s comprehensive development plan integrating residential, commercial, and infrastructure growth to support the semiconductor workforce.',
                    coords: [32.88, 130.83],
                    stats: [
                        { value: '2,500', label: 'Housing units' },
                        { value: '¥180B', label: 'Infrastructure' },
                        { value: '2028', label: 'Phase 1' },
                        { value: '+45%', label: 'Population growth' }
                    ]
                },
                {
                    id: 'ozu-plan',
                    title: 'Ozu long-term plan',
                    type: 'pdf',
                    date: '2024-05',
                    viewed: false,
                    description: 'Ozu Town\'s industrial expansion plan focused on logistics, supply chain support, and secondary manufacturing facilities.',
                    coords: [32.86, 130.87],
                    stats: [
                        { value: '120ha', label: 'Industrial land' },
                        { value: '¥95B', label: 'Investment' },
                        { value: '2027', label: 'Phase 1' },
                        { value: '3,000', label: 'Jobs projected' }
                    ]
                }
            ]
        },
        'education-pipeline': {
            id: 'education-pipeline',
            title: 'Education pipeline',
            icon: 'graduation-cap',
            items: [
                {
                    id: 'university-programs',
                    title: 'University programs',
                    type: 'pdf',
                    date: '2024-10',
                    viewed: false,
                    description: 'Kumamoto University has launched dedicated semiconductor engineering programs in partnership with TSMC and Sony to train the next generation of chip engineers.',
                    coords: [32.81, 130.73],
                    stats: [
                        { value: '500', label: 'Annual graduates' },
                        { value: '4', label: 'Partner companies' },
                        { value: '95%', label: 'Employment rate' },
                        { value: '¥2.8B', label: 'Research funding' }
                    ]
                },
                {
                    id: 'training-centers',
                    title: 'Training centers',
                    type: 'web',
                    date: '2025-01',
                    viewed: false,
                    description: 'TSMC-sponsored vocational training centers provide rapid upskilling for technicians and manufacturing specialists entering the semiconductor industry.',
                    coords: [32.86, 130.79],
                    stats: [
                        { value: '2,000', label: 'Annual trainees' },
                        { value: '6mo', label: 'Program duration' },
                        { value: '¥4.5M', label: 'Starting salary' },
                        { value: '98%', label: 'Placement rate' }
                    ]
                },
                {
                    id: 'graduate-numbers',
                    title: 'Graduate employment',
                    type: 'pdf',
                    date: '2024-12',
                    viewed: false,
                    description: 'Regional employment statistics showing semiconductor industry hiring trends and salary growth across Kumamoto Prefecture.',
                    coords: null,
                    stats: [
                        { value: '8,200', label: 'Industry hires 2024' },
                        { value: '+34%', label: 'YoY growth' },
                        { value: '¥6.2M', label: 'Avg. salary' },
                        { value: '#1', label: 'Regional employer' }
                    ]
                }
            ]
        }
    },

    // ================================
    // DATA LAYERS - Mock data for toggleable map layers
    // ================================
    dataLayers: {
        sciencePark: {
            name: 'Science Park',
            description: 'Kumamoto Prefectural Government designated semiconductor development zone with tax incentives, streamlined permitting, and infrastructure investments.',
            stats: [
                { value: '¥4.8T', label: 'Government investment' },
                { value: '2040', label: 'Completion target' },
                { value: '50,000', label: 'Projected new jobs' }
            ]
        },
        companies: {
            name: 'Corporate sites',
            description: 'Major semiconductor manufacturers operating within the Kumamoto corridor.',
            stats: [
                { value: '5', label: 'Major fabs' },
                { value: '9,600+', label: 'Direct employees' },
                { value: '¥3.2T', label: 'Combined investment' }
            ]
        },
        properties: {
            name: 'Properties',
            description: 'Investment properties in the semiconductor corridor development zone.',
            stats: [
                { value: '+9.1%', label: 'Avg appreciation' },
                { value: '5.5%', label: 'Rental yield' },
                { value: '96%', label: 'Occupancy' }
            ]
        },
        trafficFlow: {
            name: 'Traffic flow',
            description: 'Real-time and historical traffic patterns across the Kumamoto semiconductor corridor.',
            markers: [
                { id: 'traffic-1', coords: [32.87, 130.80], name: 'Route 57 Junction', congestion: 'Moderate', peakHours: '7:30-9:00, 17:00-18:30', avgSpeed: '45 km/h' },
                { id: 'traffic-2', coords: [32.88, 130.76], name: 'JASM Access Road', congestion: 'Heavy (peak)', peakHours: '8:00-9:30, 18:00-19:00', avgSpeed: '32 km/h' },
                { id: 'traffic-3', coords: [32.84, 130.82], name: 'Kikuyo Bypass', congestion: 'Light', peakHours: '8:00-9:00', avgSpeed: '58 km/h' }
            ],
            routes: [
                {
                    id: 'route-57-main',
                    name: 'Route 57 Main',
                    path: [[130.75, 32.85], [130.78, 32.86], [130.80, 32.87], [130.83, 32.88]],
                    level: 'high',
                    color: '#ef4444'
                },
                {
                    id: 'jasm-access',
                    name: 'JASM Access Road',
                    path: [[130.76, 32.88], [130.77, 32.87], [130.785, 32.874]],
                    level: 'high',
                    color: '#ef4444'
                },
                {
                    id: 'kikuyo-bypass',
                    name: 'Kikuyo Bypass',
                    path: [[130.80, 32.83], [130.82, 32.84], [130.84, 32.845], [130.86, 32.85]],
                    level: 'medium',
                    color: '#f97316'
                },
                {
                    id: 'local-roads-north',
                    name: 'Local roads north',
                    path: [[130.78, 32.89], [130.80, 32.895], [130.82, 32.90]],
                    level: 'low',
                    color: '#fbbf24'
                },
                {
                    id: 'local-roads-south',
                    name: 'Local roads south',
                    path: [[130.77, 32.82], [130.79, 32.825], [130.81, 32.83]],
                    level: 'low',
                    color: '#fbbf24'
                }
            ],
            stats: [
                { value: '23%', label: 'Increase since 2023' },
                { value: '78%', label: 'Work commuters' },
                { value: '2026', label: 'Bypass completion' }
            ]
        },
        railCommute: {
            name: 'Rail commute',
            description: 'JR Kyushu rail network serving the semiconductor corridor workforce.',
            markers: [
                { id: 'rail-1', coords: [32.79, 130.69], name: 'Kumamoto Station', type: 'Major Hub', toJasm: '28 min', frequency: '10 min' },
                { id: 'rail-2', coords: [32.88, 130.81], name: 'Kikuyo Station (Planned)', type: 'New Station', toJasm: '8 min', frequency: '15 min', opening: '2026' },
                { id: 'rail-3', coords: [32.84, 130.75], name: 'Suizenji Station', type: 'Transfer Hub', toJasm: '22 min', frequency: '12 min' }
            ],
            routes: [
                {
                    id: 'jr-hohi-line',
                    name: 'JR Hohi Line',
                    path: [[130.69, 32.79], [130.72, 32.81], [130.75, 32.84], [130.78, 32.87], [130.81, 32.88]],
                    color: '#8b5cf6',
                    type: 'main'
                },
                {
                    id: 'jr-kagoshima-line',
                    name: 'JR Kagoshima Line',
                    path: [[130.69, 32.79], [130.70, 32.77], [130.71, 32.75]],
                    color: '#a78bfa',
                    type: 'secondary'
                },
                {
                    id: 'planned-extension',
                    name: 'Planned Extension to Science Park',
                    path: [[130.81, 32.88], [130.82, 32.885], [130.83, 32.89]],
                    color: '#c4b5fd',
                    type: 'planned'
                }
            ],
            stats: [
                { value: '12,000', label: 'Daily commuters' },
                { value: '28 min', label: 'Avg. to JASM' },
                { value: '2026', label: 'Kikuyo Station' }
            ]
        },
        electricity: {
            name: 'Electricity usage',
            description: 'Regional power consumption and capacity for industrial operations.',
            markers: [
                { id: 'elec-1', coords: [32.87, 130.78], name: 'Science Park Grid', consumption: '1.8 GW', capacity: '2.4 GW', utilization: '75%' },
                { id: 'elec-2', coords: [32.90, 130.82], name: 'Sony Substation', consumption: '450 MW', capacity: '600 MW', utilization: '75%' },
                { id: 'elec-3', coords: [32.85, 130.73], name: 'Tokyo Electron Hub', consumption: '280 MW', capacity: '400 MW', utilization: '70%' }
            ],
            stats: [
                { value: '2.4 GW', label: 'Grid capacity' },
                { value: '99.99%', label: 'Uptime' },
                { value: '¥12/kWh', label: 'Industrial rate' }
            ]
        },
        employment: {
            name: 'Employment',
            description: 'Semiconductor industry employment statistics and hiring trends.',
            markers: [
                { id: 'emp-1', coords: [32.874, 130.785], name: 'JASM', employees: '3,400', growth: '+850 (2025)', avgSalary: '¥6.8M' },
                { id: 'emp-2', coords: [32.90, 130.82], name: 'Sony Semiconductor', employees: '4,200', growth: '+600 (2025)', avgSalary: '¥6.2M' },
                { id: 'emp-3', coords: [32.85, 130.73], name: 'Tokyo Electron', employees: '1,200', growth: '+400 (2025)', avgSalary: '¥7.1M' },
                { id: 'emp-4', coords: [32.82, 130.80], name: 'Mitsubishi Electric', employees: '800', growth: '+200 (2025)', avgSalary: '¥5.9M' }
            ],
            stats: [
                { value: '9,600+', label: 'Direct jobs' },
                { value: '+34%', label: 'YoY growth' },
                { value: '¥6.5M', label: 'Avg. salary' }
            ]
        },
        infrastructure: {
            name: 'Infrastructure plan',
            description: 'Planned and in-progress infrastructure development projects.',
            markers: [
                { id: 'infra-1', coords: [32.88, 130.78], name: 'New water treatment', status: 'Under Construction', completion: '2025', budget: '¥28B' },
                { id: 'infra-2', coords: [32.86, 130.84], name: 'Logistics hub', status: 'Planned', completion: '2027', budget: '¥45B' },
                { id: 'infra-3', coords: [32.84, 130.72], name: 'Data center complex', status: 'Under Construction', completion: '2026', budget: '¥120B' }
            ],
            stats: [
                { value: '¥4.8T', label: 'Total investment' },
                { value: '12', label: 'Major projects' },
                { value: '2040', label: 'Completion target' }
            ]
        },
        realEstate: {
            name: 'Real estate',
            description: 'Property market trends and investment activity in the corridor.',
            markers: [
                { id: 're-1', coords: [32.88, 130.82], name: 'Kikuyo Residential Zone', trend: '+12% YoY', avgPrice: '¥48M', inventory: 'Low' },
                { id: 're-2', coords: [32.85, 130.86], name: 'Ozu Development Area', trend: '+8% YoY', avgPrice: '¥32M', inventory: 'Medium' },
                { id: 're-3', coords: [32.82, 130.78], name: 'Mashiki Township', trend: '+6% YoY', avgPrice: '¥28M', inventory: 'High' }
            ],
            stats: [
                { value: '+9.1%', label: 'Avg. appreciation' },
                { value: '5.5%', label: 'Rental yield' },
                { value: '96%', label: 'Occupancy rate' }
            ]
        },
        riskyArea: {
            name: 'Risky area',
            description: 'Flood zones, seismic risk areas, and natural hazard information.',
            markers: [
                { id: 'risk-1', coords: [32.78, 130.72], name: 'Shirakawa Flood Zone', risk: 'Moderate', type: 'Flood', mitigation: 'Levee upgrade 2025' },
                { id: 'risk-2', coords: [32.92, 130.88], name: 'Volcanic Proximity', risk: 'Low', type: 'Volcanic', mitigation: '30km from Aso caldera' },
                { id: 'risk-3', coords: [32.80, 130.65], name: 'Liquefaction Zone', risk: 'Moderate', type: 'Seismic', mitigation: 'Building code compliance' }
            ],
            stats: [
                { value: 'Low', label: 'Overall risk rating' },
                { value: '2016', label: 'Last major event' },
                { value: '¥86B', label: 'Mitigation investment' }
            ]
        },
        baseMap: {
            name: 'Base map',
            description: 'Standard geographic reference markers and points of interest.',
            markers: [
                { id: 'base-1', coords: [32.79, 130.69], name: 'Kumamoto City Center', type: 'City', population: '740,000' },
                { id: 'base-2', coords: [32.84, 130.86], name: 'Kumamoto Airport', type: 'Airport', routes: '12 international' },
                { id: 'base-3', coords: [32.8842, 131.1040], name: 'Mount Aso', type: 'Landmark', elevation: '1,592m' }
            ],
            stats: [
                { value: '740,000', label: 'City population' },
                { value: '1.78M', label: 'Prefecture pop.' },
                { value: '#15', label: 'Japan metro rank' }
            ]
        }
    },

    // Demand projections for stage 8 real estate thesis
    demandProjections: {
        rentalDemandForecast: [
            { year: '2024', units: 1200, growth: '+18%', driver: 'JASM Phase 1 operational' },
            { year: '2025', units: 1850, growth: '+54%', driver: 'Sony expansion + Tokyo Electron opening' },
            { year: '2026', units: 2400, growth: '+30%', driver: 'JASM Phase 2 construction workforce' },
            { year: '2027', units: 3100, growth: '+29%', driver: 'Full corridor operational' },
            { year: '2028', units: 3600, growth: '+16%', driver: 'Stabilization at capacity' }
        ],
        inventoryConstraints: 'Current housing stock serves 65% of projected demand. New construction permits lag behind workforce arrival by 12-18 months, creating sustained rental pressure through 2027.',
        seasonalNotes: 'Semiconductor shift work creates year-round demand with no seasonal dip. April hiring cycles cause 15-20% rental inquiry spikes.'
    }
};
