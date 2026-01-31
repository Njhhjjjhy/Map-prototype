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
            }
        },
        power: {
            id: 'power',
            name: 'Kyushu Power Grid',
            coords: [32.75, 130.65],
            subtitle: 'Power Infrastructure',
            description: 'Kyushu Electric provides stable, competitively priced power to the region. Recent grid upgrades have added redundant capacity specifically for the semiconductor corridor, ensuring 99.999% uptime.',
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
        avgAppreciation: '8.5%',
        avgRentalYield: '5.8%',
        occupancyRate: '97.2%',
        trackRecord: [
            { year: '2022', appreciation: '6.2%' },
            { year: '2023', appreciation: '9.1%' },
            { year: '2024', appreciation: '11.3%' }
        ]
    },

    // JASM location for route drawing
    jasmLocation: [32.874, 130.785]
};
