/**
 * Mock data for Kumamoto Investment Presentation
 * All data is placeholder for demonstration purposes
 */

const AppData = {
    // Map center and zoom settings
    mapConfig: {
        center: [32.8, 130.75], // Kumamoto Prefecture center
        initialZoom: 10,
        resourceZoom: 12,
        propertyZoom: 14
    },

    // Journey A: Why Kumamoto? - Resources
    resources: {
        water: {
            id: 'water',
            name: 'Aso Groundwater Basin',
            coords: [32.88, 130.90],
            subtitle: 'Natural Water Resources',
            description: 'Kumamoto sits atop one of Japan\'s largest groundwater basins, fed by Mount Aso\'s volcanic soil. This pristine water supply is critical for semiconductor manufacturing, which requires enormous quantities of ultrapure water.',
            stats: [
                { value: '1.8B', label: 'Cubic meters annual capacity' },
                { value: '99.99%', label: 'Natural purity level' },
                { value: '¥0', label: 'Water acquisition cost' },
                { value: '60%', label: 'Lower than Tokyo rates' }
            ],
            evidence: {
                title: 'Kumamoto Water Resources Report',
                type: 'pdf',
                description: 'Official government report on groundwater sustainability and industrial allocation'
            },
            // Evidence markers proving water quality
            evidenceMarkers: [
                {
                    id: 'coca-cola',
                    name: 'Coca-Cola Bottlers Japan',
                    coords: [32.74, 130.72],
                    subtitle: 'Kumamoto Plant',
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
                    subtitle: 'Premium Beverage Production',
                    description: 'Suntory selected Kashima, Kamimashiki for its pristine groundwater. The facility produces premium beverages requiring the highest water purity standards.',
                    stats: [
                        { value: '1991', label: 'Established' },
                        { value: 'Kashima', label: 'Location' },
                        { value: 'Premium', label: 'Product Grade' },
                        { value: '100%', label: 'Local Water' }
                    ]
                }
            ]
        },
        power: {
            id: 'power',
            name: 'Kyushu Power Grid',
            coords: [32.75, 130.65],
            subtitle: 'Power Infrastructure',
            description: 'Kyushu Electric provides stable, competitively priced power to the region. The diverse energy mix ensures grid stability critical for semiconductor manufacturing.',
            stats: [
                { value: '2.4GW', label: 'Available industrial capacity' },
                { value: '99.999%', label: 'Grid reliability' },
                { value: '¥12/kWh', label: 'Industrial rate' },
                { value: '15%', label: 'Renewable mix' }
            ],
            evidence: {
                title: 'Kyushu Electric Infrastructure Plan',
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

    // Journey B: Infrastructure - Science Park
    sciencePark: {
        center: [32.87, 130.78],
        radius: 15000, // meters
        name: 'Kumamoto Science Park Corridor',
        subtitle: 'Government Development Zone',
        description: 'The Kumamoto Prefectural Government has designated this area as a special semiconductor development zone, offering tax incentives, streamlined permitting, and infrastructure investments totaling ¥4.8 trillion.',
        stats: [
            { value: '¥4.8T', label: 'Government investment' },
            { value: '2040', label: 'Completion target' },
            { value: '50,000', label: 'Projected new jobs' },
            { value: '12', label: 'Major facilities planned' }
        ],
        evidence: {
            title: 'Kumamoto Science Park Master Plan',
            type: 'pdf',
            description: 'Official development roadmap and zoning documentation'
        }
    },

    // Journey B: Infrastructure - Companies
    companies: [
        {
            id: 'jasm',
            name: 'JASM (TSMC Japan)',
            coords: [32.874, 130.785],
            subtitle: 'Semiconductor Manufacturing',
            description: 'Joint venture between TSMC, Sony, and Denso. Japan\'s most advanced semiconductor fab, producing chips for automotive and industrial applications.',
            stats: [
                { value: '¥1.2T', label: 'Total investment' },
                { value: '3,400', label: 'Direct employees' },
                { value: '2024', label: 'Phase 1 operational' },
                { value: '22nm', label: 'Process node' }
            ],
            evidence: {
                title: 'JASM Press Release',
                type: 'pdf',
                description: 'Official announcement of Phase 2 expansion'
            }
        },
        {
            id: 'sony',
            name: 'Sony Semiconductor',
            coords: [32.90, 130.82],
            subtitle: 'Image Sensor Production',
            description: 'Sony\'s flagship image sensor facility supplies Apple, Samsung, and global smartphone manufacturers. Recent expansion doubled production capacity.',
            stats: [
                { value: '¥850B', label: 'Expansion investment' },
                { value: '4,200', label: 'Employees' },
                { value: '50%', label: 'Global CMOS share' },
                { value: '2026', label: 'Expansion complete' }
            ],
            evidence: {
                title: 'Sony Kumamoto Expansion',
                type: 'pdf',
                description: 'Facility expansion and hiring announcement'
            }
        },
        {
            id: 'tokyo-electron',
            name: 'Tokyo Electron',
            coords: [32.85, 130.73],
            subtitle: 'Equipment Manufacturing',
            description: 'World\'s third-largest semiconductor equipment manufacturer. New Kumamoto facility will produce next-generation chip-making tools.',
            stats: [
                { value: '¥320B', label: 'Investment' },
                { value: '1,200', label: 'Projected jobs' },
                { value: '2025', label: 'Opening' },
                { value: '#3', label: 'Global equipment rank' }
            ],
            evidence: {
                title: 'Tokyo Electron Announcement',
                type: 'pdf',
                description: 'New facility press release'
            }
        },
        {
            id: 'mitsubishi',
            name: 'Mitsubishi Electric',
            coords: [32.82, 130.80],
            subtitle: 'Power Semiconductors',
            description: 'Major expansion of power semiconductor production for electric vehicles and renewable energy systems.',
            stats: [
                { value: '¥260B', label: 'Investment' },
                { value: '800', label: 'New jobs' },
                { value: '2025', label: 'Completion' },
                { value: '40%', label: 'Capacity increase' }
            ],
            evidence: {
                title: 'Mitsubishi Power Semiconductor Plan',
                type: 'pdf',
                description: 'EV market expansion strategy'
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
            subtitle: 'Residential & Commercial',
            description: 'Kikuyo Town has approved rezoning for mixed-use development adjacent to the Science Park. New housing, retail, and support services for semiconductor workers.',
            stats: [
                { value: '2,500', label: 'Housing units planned' },
                { value: '¥180B', label: 'Infrastructure budget' },
                { value: '2028', label: 'Phase 1 complete' },
                { value: '15min', label: 'To JASM' }
            ],
            evidence: {
                title: 'Kikuyo Town Development Plan',
                type: 'pdf',
                description: 'Official rezoning and infrastructure roadmap'
            }
        },
        {
            id: 'ozu',
            name: 'Ozu Industrial Expansion',
            coords: [32.86, 130.87],
            radius: 4000,
            subtitle: 'Industrial & Logistics',
            description: 'Ozu Town is developing new industrial parcels and logistics facilities to support the semiconductor supply chain.',
            stats: [
                { value: '120ha', label: 'Industrial land' },
                { value: '¥95B', label: 'Investment' },
                { value: '2027', label: 'Available' },
                { value: '3,000', label: 'Jobs projected' }
            ],
            evidence: {
                title: 'Ozu Industrial Zone Plan',
                type: 'pdf',
                description: 'Industrial development documentation'
            }
        }
    ],

    // Journey C: Investment Properties
    properties: [
        {
            id: 'prop-1',
            name: 'Kikuyo Residence A',
            coords: [32.876, 130.82],
            subtitle: 'New Construction',
            address: '123 Kikuyo-machi, Kikuyo',
            distanceToJasm: '8.2 km',
            driveTime: '12 min',
            type: 'Single Family Residence',
            zone: 'Kikuyo Development Zone',
            image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
            description: 'Modern 3-bedroom residence in the heart of the development zone. Walking distance to new commercial center.',
            basicStats: [
                { value: '12 min', label: 'Drive to JASM' },
                { value: '8.2 km', label: 'Distance' },
                { value: '2024', label: 'Built' },
                { value: '125 m²', label: 'Floor area' }
            ],
            truthEngine: [
                {
                    title: 'Kikuyo Station Expansion',
                    description: 'New train station with direct line to Kumamoto City center. Completion 2026.',
                    impact: '+15% projected value increase'
                },
                {
                    title: 'International School',
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
                title: 'Property Rental Analysis',
                type: 'pdf',
                description: 'Detailed rental market analysis from property manager'
            }
        },
        {
            id: 'prop-2',
            name: 'Ozu Heights Unit B',
            coords: [32.855, 130.86],
            subtitle: 'Apartment Investment',
            address: '45 Ozu-machi, Ozu',
            distanceToJasm: '10.5 km',
            driveTime: '15 min',
            type: 'Apartment',
            zone: 'Ozu Industrial Expansion',
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
            description: 'High-demand apartment in growing residential area. Strong rental history with semiconductor industry tenants.',
            basicStats: [
                { value: '15 min', label: 'Drive to JASM' },
                { value: '10.5 km', label: 'Distance' },
                { value: '2022', label: 'Built' },
                { value: '78 m²', label: 'Floor area' }
            ],
            truthEngine: [
                {
                    title: 'Highway Extension',
                    description: 'Route 57 bypass reduces commute to JASM by 5 minutes.',
                    impact: '+12% value from improved access'
                },
                {
                    title: 'Commercial Development',
                    description: 'New shopping center approved 500m from property.',
                    impact: '+6% neighborhood desirability'
                },
                {
                    title: 'Tokyo Electron Opening',
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
                title: 'Property Rental Analysis',
                type: 'pdf',
                description: 'Detailed rental market analysis from property manager'
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

    // Evidence Groups - Hierarchical evidence with multiple sub-items
    evidenceGroups: {
        'energy-infrastructure': {
            id: 'energy-infrastructure',
            title: 'Energy Infrastructure',
            icon: 'zap',
            items: [
                {
                    id: 'solar-power',
                    title: 'Solar Power Capacity',
                    type: 'pdf',
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
                    title: 'Wind Energy Network',
                    type: 'pdf',
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
                    title: 'Kyushu Nuclear (Sendai)',
                    type: 'pdf',
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
            title: 'Transportation Network',
            icon: 'route',
            items: [
                {
                    id: 'planned-roads',
                    title: 'Planned Road Extensions',
                    type: 'pdf',
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
                    title: 'Railway Expansion',
                    type: 'pdf',
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
                    title: 'Kumamoto Airport Access',
                    type: 'web',
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
            title: 'Government Zones',
            icon: 'landmark',
            items: [
                {
                    id: 'science-park-plan',
                    title: 'Kumamoto Science Park',
                    type: 'pdf',
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
                    title: 'Kikuyo Long-term Plan',
                    type: 'pdf',
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
                    title: 'Ozu Long-term Plan',
                    type: 'pdf',
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
            title: 'Education Pipeline',
            icon: 'graduation-cap',
            items: [
                {
                    id: 'university-programs',
                    title: 'University Programs',
                    type: 'pdf',
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
                    title: 'Training Centers',
                    type: 'web',
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
                    title: 'Graduate Employment',
                    type: 'pdf',
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
        trafficFlow: {
            name: 'Traffic Flow',
            description: 'Real-time and historical traffic patterns across the Kumamoto semiconductor corridor.',
            markers: [
                { id: 'traffic-1', coords: [32.87, 130.80], name: 'Route 57 Junction', congestion: 'Moderate', peakHours: '7:30-9:00, 17:00-18:30', avgSpeed: '45 km/h' },
                { id: 'traffic-2', coords: [32.88, 130.76], name: 'JASM Access Road', congestion: 'Heavy (peak)', peakHours: '8:00-9:30, 18:00-19:00', avgSpeed: '32 km/h' },
                { id: 'traffic-3', coords: [32.84, 130.82], name: 'Kikuyo Bypass', congestion: 'Light', peakHours: '8:00-9:00', avgSpeed: '58 km/h' }
            ],
            stats: [
                { value: '23%', label: 'Increase since 2023' },
                { value: '78%', label: 'Work commuters' },
                { value: '2026', label: 'Bypass completion' }
            ]
        },
        railCommute: {
            name: 'Rail Commute',
            description: 'JR Kyushu rail network serving the semiconductor corridor workforce.',
            markers: [
                { id: 'rail-1', coords: [32.79, 130.69], name: 'Kumamoto Station', type: 'Major Hub', toJasm: '28 min', frequency: '10 min' },
                { id: 'rail-2', coords: [32.88, 130.81], name: 'Kikuyo Station (Planned)', type: 'New Station', toJasm: '8 min', frequency: '15 min', opening: '2026' },
                { id: 'rail-3', coords: [32.84, 130.75], name: 'Suizenji Station', type: 'Transfer Hub', toJasm: '22 min', frequency: '12 min' }
            ],
            stats: [
                { value: '12,000', label: 'Daily commuters' },
                { value: '28 min', label: 'Avg. to JASM' },
                { value: '2026', label: 'Kikuyo Station' }
            ]
        },
        electricity: {
            name: 'Electricity Usage',
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
            name: 'Infrastructure Plan',
            description: 'Planned and in-progress infrastructure development projects.',
            markers: [
                { id: 'infra-1', coords: [32.88, 130.78], name: 'New Water Treatment', status: 'Under Construction', completion: '2025', budget: '¥28B' },
                { id: 'infra-2', coords: [32.86, 130.84], name: 'Logistics Hub', status: 'Planned', completion: '2027', budget: '¥45B' },
                { id: 'infra-3', coords: [32.84, 130.72], name: 'Data Center Complex', status: 'Under Construction', completion: '2026', budget: '¥120B' }
            ],
            stats: [
                { value: '¥4.8T', label: 'Total investment' },
                { value: '12', label: 'Major projects' },
                { value: '2040', label: 'Completion target' }
            ]
        },
        realEstate: {
            name: 'Real Estate',
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
            name: 'Risky Area',
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
            name: 'Base Map',
            description: 'Standard geographic reference markers and points of interest.',
            markers: [
                { id: 'base-1', coords: [32.79, 130.69], name: 'Kumamoto City Center', type: 'City', population: '740,000' },
                { id: 'base-2', coords: [32.84, 130.86], name: 'Kumamoto Airport', type: 'Airport', routes: '12 international' },
                { id: 'base-3', coords: [32.93, 130.78], name: 'Mount Aso', type: 'Landmark', elevation: '1,592m' }
            ],
            stats: [
                { value: '740,000', label: 'City population' },
                { value: '1.78M', label: 'Prefecture pop.' },
                { value: '#15', label: 'Japan metro rank' }
            ]
        }
    }
};
