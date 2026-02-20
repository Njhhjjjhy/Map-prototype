/**
 * Mock data for Kumamoto Investment Presentation
 * All data is placeholder for demonstration purposes
 */

/**
 * Linear 12-step journey definition.
 * Each step is a self-contained map scene.
 * `id` is the canonical identifier used by App.state.currentStep.
 * `cameraKey` references a CAMERA_STEPS entry in map-controller.js.
 * `layers` lists which marker/layer groups to show (all others hidden on step entry).
 * `subItems` defines clickable items within the step (shown in chatbox).
 * `panelTabs` defines the right panel tab set for the step.
 */
const STEPS = [
    {
        id: 'resources',
        index: 1,
        title: 'Resources',
        subtitle: 'Water and power infrastructure',
        cameraKey: 'A0',
        layers: ['resources', 'kyushuEnergy'],
        panelTabs: ['Evidence'],
        subItems: [
            { id: 'water', label: 'Water resources', icon: 'droplet' },
            { id: 'power-solar', label: 'Solar power', icon: 'sun' },
            { id: 'power-wind', label: 'Wind power', icon: 'wind' },
            { id: 'power-nuclear', label: 'Nuclear power', icon: 'atom' }
        ]
    },
    {
        id: 'strategic-location',
        index: 2,
        title: 'Strategic location',
        subtitle: 'Kyushu position in Asia',
        cameraKey: 'A3_location',
        layers: ['airlineRoutes'],
        panelTabs: ['Evidence'],
        subItems: []
    },
    {
        id: 'government-support',
        index: 3,
        title: 'Government support',
        subtitle: 'National to local commitment',
        cameraKey: 'B1',
        layers: ['governmentChain', 'sciencePark', 'investmentZones'],
        panelTabs: ['Support', 'Dashboard'],
        subItems: [
            { id: 'central', label: 'Central government', icon: 'landmark' },
            { id: 'prefectural', label: 'Prefectural government', icon: 'building' },
            { id: 'local', label: 'Local municipalities', icon: 'home' }
        ]
    },
    {
        id: 'corporate-investment',
        index: 4,
        title: 'Corporate investment',
        subtitle: 'Seven major players',
        cameraKey: 'B4',
        layers: ['companies', 'semiconductorNetwork'],
        panelTabs: ['Investment', 'Companies'],
        subItems: []
    },
    {
        id: 'science-park-zones',
        index: 5,
        title: 'Science park and zones',
        subtitle: 'Development clusters and long-term plans',
        cameraKey: 'B1_sciencePark',
        layers: ['sciencePark', 'futureZones', 'governmentChain'],
        panelTabs: ['Plans', 'Zones'],
        subItems: [
            { id: 'science-park', label: 'Kumamoto Science Park', icon: 'flask-conical' },
            { id: 'gov-zones', label: 'Government zone clusters', icon: 'target' },
            { id: 'kikuyo-plan', label: 'Kikuyo long-term plan', icon: 'map-pin' },
            { id: 'ozu-plan', label: 'Ozu long-term plan', icon: 'map-pin' }
        ]
    },
    {
        id: 'transport-access',
        index: 6,
        title: 'Airport, railway, and roads',
        subtitle: 'Transport infrastructure',
        cameraKey: 'B7',
        layers: ['infrastructureRoads'],
        panelTabs: ['Overview', 'Timeline'],
        subItems: [
            { id: 'airport', label: 'Airport access', icon: 'plane' },
            { id: 'railway', label: 'New railway', icon: 'train-front' },
            { id: 'roads', label: 'Future road extensions', icon: 'route' }
        ]
    },
    {
        id: 'education-pipeline',
        index: 7,
        title: 'Education pipeline',
        subtitle: 'Universities, training, and employment',
        cameraKey: 'A3_talent',
        layers: ['talentPipeline'],
        panelTabs: ['Education', 'Employment'],
        subItems: [
            { id: 'universities', label: 'Universities', icon: 'graduation-cap' },
            { id: 'training', label: 'Training centers', icon: 'school' },
            { id: 'employment', label: 'Employment data', icon: 'briefcase' }
        ]
    },
    {
        id: 'future-outlook',
        index: 8,
        title: 'Future outlook',
        subtitle: 'Composite 2030+ vision',
        cameraKey: 'B6',
        layers: ['sciencePark', 'futureZones', 'infrastructureRoads', 'investmentZones'],
        panelTabs: ['Plans', 'Timeline'],
        showTimeToggle: true,
        subItems: []
    },
    {
        id: 'investment-zones',
        index: 9,
        title: 'Investment opportunity zones',
        subtitle: 'Three zones in the silicon triangle',
        cameraKey: 'corridor',
        layers: ['investmentZones'],
        panelTabs: ['Zones', 'Metrics'],
        subItems: [
            { id: 'kikuyo-zone', label: 'Kikuyo zone', icon: 'target' },
            { id: 'koshi-zone', label: 'Koshi zone', icon: 'target' },
            { id: 'ozu-zone', label: 'Ozu zone', icon: 'target' }
        ]
    },
    {
        id: 'properties',
        index: 10,
        title: 'Properties',
        subtitle: 'Investment opportunities',
        cameraKey: 'corridor',
        layers: ['properties', 'route'],
        panelTabs: ['Images', 'Truth Engine', 'Future Outlook', 'Financial'],
        subItems: [
            { id: 'ozu-sugimizu', label: 'Ozu Sugimizu', icon: 'house' },
            { id: 'kikuyo-kubota', label: 'Kikuyo Kubota', icon: 'house' },
            { id: 'haramizu-land', label: 'Haramizu Land', icon: 'house' }
        ]
    },
    {
        id: 'area-changes',
        index: 11,
        title: 'Area changes',
        subtitle: 'Present vs future comparison',
        cameraKey: 'B6',
        layers: ['infrastructureRoads', 'futureZones'],
        panelTabs: ['Overview', 'Evidence'],
        showTimeToggle: true,
        subItems: []
    },
    {
        id: 'final',
        index: 12,
        title: 'Journey complete',
        subtitle: 'Summary and Q&A',
        cameraKey: 'complete',
        layers: ['companies', 'properties', 'investmentZones', 'infrastructureRoads', 'sciencePark'],
        panelTabs: [],
        subItems: []
    }
];

/**
 * Step-to-index lookup for quick access.
 */
const STEP_MAP = {};
STEPS.forEach(s => { STEP_MAP[s.id] = s.index; });

/**
 * Legacy STAGE_MAP compatibility shim.
 * Maps old step string IDs to new step indices for any code still referencing them.
 * Remove once all references are migrated.
 */
const STAGE_MAP = {
    'Q1_intro': 1, 'Q1_water': 1, 'Q1_power': 1, 'Q1_sewage': 1,
    'Q1_silicon': 1, 'Q1_strategic': 2,
    'Q2_gov': 3, 'Q2_corporate': 4,
    'Q3_timeline': 5, 'Q3_education': 7, 'Q3_future': 8,
    'Q4_zones': 9,
    'Q5_prop1': 10, 'Q5_prop2': 10, 'Q5_prop3': 10, 'Q5_final': 12
};

/**
 * Tab sets per step index (replaces old STAGE_TABS).
 */
const STAGE_TABS = {};
STEPS.forEach(s => {
    STAGE_TABS[s.index] = { label: s.subtitle, tabs: s.panelTabs };
});

const AppData = {
    // Map center and zoom settings
    mapConfig: {
        center: [32.8, 130.75], // Kumamoto Prefecture center
        initialZoom: 10,
        resourceZoom: 12,
        propertyZoom: 14
    },

    // Q1: Why Kumamoto? - Resources
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

    // Q1: Sewage infrastructure
    sewageInfrastructure: {
        id: 'sewage',
        name: 'Public sewage infrastructure',
        coords: [32.87, 130.80],
        subtitle: 'Semiconductor district utilities',
        description: 'Rapid semiconductor industry and population influx impacts water, drainage, and sewage treatment demand. Specified public sewage infrastructure projects are critical for continued fab zone expansion.',
        stats: [
            { value: 'Active', label: 'Project status' },
            { value: 'Kikuyo', label: 'Coverage area' },
            { value: 'Haramizu', label: 'Expansion zone' },
            { value: 'Koshi', label: 'Adjacent coverage' }
        ],
        evidence: {
            title: 'Semiconductor district sewage plan',
            type: 'pdf',
            description: 'Kumamoto specified public sewage infrastructure for semiconductor district',
            image: 'assets/use-case-images/evidence-sewers-utility-systems.webp'
        }
    },

    // Q1: Silicon Island heritage
    siliconIsland: {
        id: 'silicon-island',
        name: 'Silicon Island Kyushu',
        coords: [33.0, 130.7],
        subtitle: 'Semiconductor heritage',
        description: 'Kyushu is historically called Silicon Island. IC production accounts for approximately 40% of domestic share. Semiconductor manufacturing equipment holds approximately 20% of domestic share. Japan leads globally in semiconductor materials and equipment.',
        stats: [
            { value: '~40%', label: 'Domestic IC production share' },
            { value: '~20%', label: 'Equipment share' },
            { value: '6', label: 'Major companies' },
            { value: '1960s', label: 'Heritage start' }
        ],
        companies: [
            { name: 'Mitsubishi Electric', coords: [32.82, 130.80] },
            { name: 'Rohm', coords: [32.89, 130.76] },
            { name: 'SUMCO', coords: [32.93, 130.70] },
            { name: 'Toshiba', coords: [33.25, 130.42] },
            { name: 'Sony', coords: [32.90, 130.82] }
        ],
        evidence: {
            title: 'Bank of Japan Fukuoka branch semiconductor report',
            type: 'pdf',
            description: 'Historical analysis of Kyushu semiconductor industry presence and supply chain depth',
            image: 'assets/use-case-images/evidence-silicon-island.webp'
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

    // Q5: Investment Properties (card-based structure)
    properties: [
        {
            id: 'ozu-sugimizu',
            name: 'Ozu Sugimizu',
            coords: [32.865, 130.870],
            subtitle: 'New construction (BTR)',
            type: 'Build to rent',
            zone: 'Ozu Development Zone',
            distanceToJasm: '5.2 km',
            driveTime: '8 min',

            cards: [
                {
                    type: 'images',
                    data: {
                        exterior: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
                        interior: [
                            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
                            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'
                        ],
                        site: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'
                    }
                },
                {
                    type: 'truth-engine',
                    data: {
                        basicSettings: {
                            area: 'Ozu Sugimizu station land (family type)',
                            land: '180 sqm (corner lot, regular shape, road frontage 12m)',
                            building: 'Wood construction (ZEH/long-life quality housing) 115 sqm',
                            layout: '3LDK + study/flex room, dual bathrooms (expat family friendly)'
                        },
                        designStrategy: {
                            description: 'Expat family standard spec',
                            features: [
                                'Large living/dining',
                                'Dishwasher, floor heating, high insulation',
                                'Ample storage, EV charging prep',
                                'Standardized facade and modular floor plans',
                                'Compressed construction period and cost volatility'
                            ]
                        },
                        landStrategy: {
                            description: 'Three-factor balance: school district + living amenities + commute',
                            risks: [
                                'Fragmented land',
                                'Site preparation costs',
                                'Drainage/foundation improvement costs uncertain'
                            ]
                        }
                    }
                },
                {
                    type: 'future-outlook',
                    data: {
                        description: 'Area development plans affecting Ozu Sugimizu',
                        factors: [
                            { title: 'Ozu industrial expansion', impact: '120ha new logistics and supply chain facilities by 2027' },
                            { title: 'Route 57 bypass', impact: 'Under construction, -8 min commute to JASM by 2026' },
                            { title: 'Science park expansion', impact: 'Government commitment extends development corridor southward' }
                        ]
                    }
                },
                {
                    type: 'financial',
                    data: {
                        strategy: 'BTR (build to rent)',
                        acquisitionCost: 45000000,
                        scenarios: {
                            bear:    { annualRent: 1920000, noi: 1680000, noiTicRatio: 0.037, exitPrice: 48000000, irr: 0.06 },
                            average: { annualRent: 2280000, noi: 2040000, noiTicRatio: 0.045, exitPrice: 55000000, irr: 0.10 },
                            bull:    { annualRent: 2640000, noi: 2400000, noiTicRatio: 0.053, exitPrice: 64000000, irr: 0.14 }
                        },
                        rentalEvidence: {
                            title: 'Local agency rental market report',
                            type: 'pdf',
                            description: 'Rental market comparables showing 160,000-170,000 yen monthly rent',
                            image: 'assets/use-case-images/evidence-property-rent-evaluation.webp'
                        }
                    }
                }
            ]
        },
        {
            id: 'kikuyo-kubota',
            name: 'Kikuyo Kubota',
            coords: [32.880, 130.825],
            subtitle: 'Renovation opportunity',
            type: 'Buy-renovate-rent/sell',
            zone: 'Kikuyo Development Zone',
            distanceToJasm: '6.8 km',
            driveTime: '10 min',

            cards: [
                {
                    type: 'images',
                    data: {
                        exterior: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80',
                        interior: [
                            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
                            'https://images.unsplash.com/photo-1560185127-6a62b8a7d6c8?w=800&q=80'
                        ],
                        site: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&q=80'
                    }
                },
                {
                    type: 'truth-engine',
                    data: {
                        basicSettings: {
                            area: 'Kikuyo Kubota (single-family renovation)',
                            property: '18 years old, 98 sqm',
                            renovationBudget: '6.5M yen (including water/electrical, insulation, kitchen/bath)',
                            renovationPeriod: '8 weeks target (control vacancy period)'
                        },
                        designStrategy: {
                            description: 'Convert to expat standard',
                            features: [
                                'Insulation and window upgrades',
                                'Traffic flow reorganization',
                                'Kitchen and bath quality improvement',
                                'Storage optimization',
                                'Lighting and moisture control'
                            ]
                        },
                        landStrategy: {
                            description: 'Advantages: property tax and acquisition cost controllable, fast turnaround, can replicate across multiple small properties',
                            risks: [
                                'Hidden construction issues (leaks, termites, foundation)',
                                'Resale market depth uncertainty',
                                'Renovation cost overrun risk'
                            ]
                        }
                    }
                },
                {
                    type: 'future-outlook',
                    data: {
                        description: 'Area development plans affecting Kikuyo Kubota',
                        factors: [
                            { title: 'Kikuyo Station expansion', impact: 'New train station with direct Kumamoto City line, completion 2026' },
                            { title: 'International school', impact: 'English-language school for TSMC engineer families, +8% rental premium' },
                            { title: 'JASM Phase 2', impact: 'Second fab adding 3,000 employees, +25% rental demand by 2027' },
                            { title: 'Haramizu 70ha development', impact: 'Adjacent new urban core drives area transformation' }
                        ]
                    }
                },
                {
                    type: 'financial',
                    data: {
                        strategy: 'Renovation: two exit paths',
                        acquisitionCost: 22000000,
                        renovationCost: 6500000,
                        totalInvestment: 28500000,
                        paths: {
                            rental: {
                                label: 'Renovation + rental',
                                monthlyRent: 155000,
                                annualRent: 1860000,
                                noi: 1620000,
                                yield: 0.057
                            },
                            sale: {
                                label: 'Renovation + sale',
                                salePrice: 35000000,
                                grossProfit: 6500000,
                                grossMargin: 0.228,
                                holdPeriod: '6 months'
                            }
                        },
                        rentalEvidence: {
                            title: 'Rental assessment report',
                            type: 'pdf',
                            description: 'Comparable rental properties in Kikuyo area',
                            image: 'assets/use-case-images/evidence-rental-assessment-report.webp'
                        }
                    }
                }
            ]
        },
        {
            id: 'haramizu-land',
            name: 'Haramizu Land',
            coords: [32.8698, 130.8230],
            subtitle: 'Land development',
            type: 'Land acquisition',
            zone: 'Haramizu Station Development Zone',
            distanceToJasm: '4.5 km',
            driveTime: '7 min',

            cards: [
                {
                    type: 'images',
                    data: {
                        exterior: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
                        interior: [],
                        site: 'https://images.unsplash.com/photo-1625722662220-1fbcfe2d7acb?w=800&q=80'
                    }
                },
                {
                    type: 'truth-engine',
                    data: {
                        basicSettings: {
                            area: 'Haramizu Station vicinity (70ha land readjustment project)',
                            land: '320 sqm within the readjustment zone',
                            zoning: 'Residential/commercial mixed-use (post-readjustment)',
                            partners: 'Mitsui Fudosan + JR Kyushu (selected as future vision implementation partners)'
                        },
                        designStrategy: {
                            description: 'Three-zone development concept',
                            features: [
                                'Vibrancy zone: station-front retail, F&B, international-friendly services',
                                'Knowledge cluster: R&D offices, co-working, university satellite campus',
                                'Live-work zone: mid-high density condos, serviced apartments for engineers',
                                'Facility introduction: residential, apartments, hotels, university campus'
                            ]
                        },
                        landStrategy: {
                            description: 'Long-term city-level project, not single housing development. JR Kyushu new station between Mitsuriki and Haramizu creates transport anchor.',
                            risks: [
                                'Land readjustment timeline uncertainty',
                                'Zoning finalization dependent on municipal process',
                                'Higher upfront capital requirement than renovation path'
                            ]
                        }
                    }
                },
                {
                    type: 'future-outlook',
                    data: {
                        description: '70-hectare new urban core with national development partners',
                        factors: [
                            { title: 'New JR station', impact: 'JR Kyushu confirmed new station between Mitsuriki and Haramizu, direct rail to Kumamoto City' },
                            { title: 'Mitsui Fudosan partnership', impact: 'Japan largest developer selected for long-term vision implementation' },
                            { title: 'Foreign consultation counter', impact: 'Kikuyo Town established bilingual support (Chinese/English) for international residents' },
                            { title: 'Science park adjacency', impact: 'Direct proximity to semiconductor cluster drives sustained demand' }
                        ]
                    }
                },
                {
                    type: 'financial',
                    data: {
                        strategy: 'Land acquisition and hold/develop',
                        landAcquisitionCost: 38000000,
                        developmentBudget: 52000000,
                        totalInvestment: 90000000,
                        scenarios: {
                            bear:    { developedValue: 95000000, netProfit: 5000000, irr: 0.04, holdYears: 3 },
                            average: { developedValue: 115000000, netProfit: 25000000, irr: 0.10, holdYears: 3 },
                            bull:    { developedValue: 140000000, netProfit: 50000000, irr: 0.17, holdYears: 3 }
                        },
                        rentalEvidence: {
                            title: 'Real estate investment analysis',
                            type: 'pdf',
                            description: 'Comprehensive land value and development ROI projections',
                            image: 'assets/use-case-images/evidence-real-estate-investment-analysis.webp'
                        }
                    }
                }
            ]
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
                    image: 'assets/use-case-images/evidence-renewable-energy.webp',
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
                    image: 'assets/use-case-images/evidence-renewable-energy.webp',
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
                },
                {
                    id: 'sewage-infrastructure',
                    title: 'Sewage and utility systems',
                    type: 'pdf',
                    date: '2024-10',
                    viewed: false,
                    description: 'Specified public sewage infrastructure projects for the semiconductor district, covering Kikuyo, Haramizu, and Koshi areas.',
                    coords: [32.87, 130.80],
                    image: 'assets/use-case-images/evidence-sewers-utility-systems.webp',
                    stats: [
                        { value: 'Active', label: 'Project status' },
                        { value: 'Kikuyo', label: 'Primary area' },
                        { value: 'Haramizu', label: 'Expansion zone' },
                        { value: 'Koshi', label: 'Adjacent area' }
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
                    image: 'assets/use-case-images/evidence-kumamoto-future-road-network.webp',
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
                    image: 'assets/use-case-images/evidence-new-railway-system.webp',
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
                    image: 'assets/use-case-images/evidence-airport-to-city-railway.webp',
                    stats: [
                        { value: '25min', label: 'To Science Park' },
                        { value: '12', label: 'International routes' },
                        { value: '+40%', label: 'Cargo capacity expansion' },
                        { value: '2025', label: 'Terminal upgrade' }
                    ]
                },
                {
                    id: 'ring-road',
                    title: '10-minute ring road concept',
                    type: 'pdf',
                    date: '2025-01',
                    viewed: false,
                    description: 'Airport-industrial-residential integrated urban corridor maintaining 10-minute drive intervals between key nodes.',
                    coords: [32.85, 130.82],
                    images: [
                        'assets/use-case-images/evidence-10-minute-ring-road-2.webp',
                        'assets/use-case-images/evidence-10-minute-ring-road-3.webp'
                    ],
                    stats: [
                        { value: '10 min', label: 'Max interval' },
                        { value: '3 nodes', label: 'Airport-Industry-Residential' },
                        { value: '2030', label: 'Target' }
                    ]
                },
                {
                    id: 'transport-overview',
                    title: 'Kumamoto transport overview',
                    type: 'pdf',
                    date: '2024-12',
                    viewed: false,
                    description: 'Comprehensive overview of Kumamoto transport infrastructure including road network, rail, and airport access.',
                    coords: null,
                    image: 'assets/use-case-images/evidence-kumamoto-transport-overview.webp',
                    stats: []
                },
                {
                    id: 'traffic-flow',
                    title: 'Regional traffic flow',
                    type: 'pdf',
                    date: '2024-11',
                    viewed: false,
                    description: 'Traffic flow analysis for the Kumamoto semiconductor corridor.',
                    coords: null,
                    image: 'assets/use-case-images/evidence-kumamoto-regional-traffic-flow.webp',
                    stats: []
                },
                {
                    id: 'commuting-context',
                    title: 'Commuting challenges',
                    type: 'pdf',
                    date: '2024-09',
                    viewed: false,
                    description: 'Current commuting challenges in the semiconductor corridor and planned infrastructure improvements.',
                    coords: null,
                    image: 'assets/use-case-images/evidence-commuting-hell.webp',
                    stats: []
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
                    image: 'assets/use-case-images/evidence-science-park.webp',
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
                    image: 'assets/use-case-images/evidence-semiconductor-clusters.webp',
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
                    image: 'assets/use-case-images/evidence-industrial-park-locations.webp',
                    stats: [
                        { value: '120ha', label: 'Industrial land' },
                        { value: '¥95B', label: 'Investment' },
                        { value: '2027', label: 'Phase 1' },
                        { value: '3,000', label: 'Jobs projected' }
                    ]
                },
                {
                    id: 'grand-airport-plan',
                    title: 'Grand airport concept',
                    type: 'pdf',
                    date: '2025-01',
                    viewed: false,
                    description: 'Long-term vision to expand Kumamoto Airport into a major cargo hub with new urban development zone.',
                    coords: [32.84, 130.86],
                    image: 'assets/use-case-images/evidence-new-grand-airport.webp',
                    stats: [
                        { value: '2035', label: 'Target completion' },
                        { value: '+200%', label: 'Cargo capacity' },
                        { value: '8', label: 'New Asia routes' },
                        { value: '¥320B', label: 'Investment' }
                    ]
                },
                {
                    id: 'airport-master-plan',
                    title: 'Airport master plan',
                    type: 'pdf',
                    date: '2025-01',
                    viewed: false,
                    description: 'Detailed master plan for Kumamoto Airport expansion including terminal upgrades and access infrastructure.',
                    coords: [32.84, 130.86],
                    image: 'assets/use-case-images/evidence-airport-master-plan.webp',
                    stats: []
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
                    image: 'assets/use-case-images/vidence-wage-gap-college-graduates.webp',
                    stats: [
                        { value: '8,200', label: 'Industry hires 2024' },
                        { value: '+34%', label: 'YoY growth' },
                        { value: '¥6.2M', label: 'Avg. salary' },
                        { value: '#1', label: 'Regional employer' }
                    ]
                }
            ]
        },
        'semiconductor-ecosystem': {
            id: 'semiconductor-ecosystem',
            title: 'Semiconductor ecosystem',
            icon: 'cpu',
            items: [
                {
                    id: 'silicon-island',
                    title: 'Silicon Island Kyushu heritage',
                    type: 'pdf',
                    date: '2023-03',
                    viewed: false,
                    description: 'Bank of Japan Fukuoka branch report showing Kyushu as Silicon Island with ~40% domestic IC production share.',
                    coords: null,
                    image: 'assets/use-case-images/evidence-silicon-island.webp',
                    stats: [
                        { value: '~40%', label: 'IC production share' },
                        { value: '~20%', label: 'Equipment share' },
                        { value: '#1', label: 'Japan global rank in materials' }
                    ]
                },
                {
                    id: 'existing-semiconductors',
                    title: 'Existing semiconductor presence',
                    type: 'pdf',
                    date: '2024-06',
                    viewed: false,
                    description: 'Map of existing semiconductor companies across Kyushu, including Mitsubishi Electric, Rohm, SUMCO, Toshiba, and Sony.',
                    coords: null,
                    image: 'assets/use-case-images/evidence-existing-semiconductors.webp',
                    stats: []
                },
                {
                    id: 'tsmc-infrastructure',
                    title: 'TSMC infrastructure overview',
                    type: 'pdf',
                    date: '2024-12',
                    viewed: false,
                    description: 'Overview of TSMC surrounding infrastructure including highway extensions, airport access, and rail connections.',
                    coords: null,
                    image: 'assets/use-case-images/evidence-tsmc-infrastructure-overview.webp',
                    stats: []
                },
                {
                    id: 'strategic-location',
                    title: 'Strategic geopolitical position',
                    type: 'pdf',
                    date: '2024-08',
                    viewed: false,
                    description: 'East Asia map highlighting Kyushu position relative to Taiwan, Korea, and Shanghai for semiconductor supply chain logistics.',
                    coords: null,
                    image: 'assets/use-case-images/evidence-strategic-location.webp',
                    stats: []
                }
            ]
        },
        'investment-analysis': {
            id: 'investment-analysis',
            title: 'Investment analysis',
            icon: 'trending-up',
            items: [
                {
                    id: 'demographic-trends',
                    title: 'TSMC area demographic trends',
                    type: 'pdf',
                    date: '2025-01',
                    viewed: false,
                    description: 'Demographic growth trends in the TSMC corridor area, showing population and workforce projections.',
                    coords: null,
                    image: 'assets/use-case-images/evidence-tsmc-area-demographic-trends.webp',
                    stats: []
                },
                {
                    id: 'rental-assessment',
                    title: 'Rental assessment report',
                    type: 'pdf',
                    date: '2025-01',
                    viewed: false,
                    description: 'Detailed rental market assessment for properties in the semiconductor corridor.',
                    coords: null,
                    image: 'assets/use-case-images/evidence-rental-assessment-report.webp',
                    stats: []
                },
                {
                    id: 'rent-evaluation',
                    title: 'Property rent evaluation',
                    type: 'pdf',
                    date: '2025-02',
                    viewed: false,
                    description: 'Comparative rent evaluation showing market rates for corridor properties.',
                    coords: null,
                    image: 'assets/use-case-images/evidence-property-rent-evaluation.webp',
                    stats: []
                },
                {
                    id: 'loan-analysis',
                    title: 'Acquisition loan analysis',
                    type: 'pdf',
                    date: '2025-01',
                    viewed: false,
                    description: 'Financing structure and loan analysis for property acquisitions.',
                    coords: null,
                    image: 'assets/use-case-images/evidence-acquisition-loan-analysis.webp',
                    stats: []
                },
                {
                    id: 'investment-analysis-report',
                    title: 'Real estate investment analysis',
                    type: 'pdf',
                    date: '2025-02',
                    viewed: false,
                    description: 'Comprehensive investment analysis covering ROI projections and risk assessment.',
                    coords: null,
                    image: 'assets/use-case-images/evidence-real-estate-investment-analysis.webp',
                    stats: []
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
