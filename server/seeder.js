const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CropData = require('./models/CropData');

dotenv.config();

// Comprehensive Disease Knowledge Base
const crops = [
    {
        cropName: 'Tomato',
        diseases: [
            {
                name: 'Early Blight',
                symptoms: [
                    'Dark spots with concentric rings on lower leaves',
                    'Yellowing and wilting of affected leaves',
                    'Small dark sunken lesions on fruit',
                    'Leaves may fall off prematurely'
                ],
                causes: [
                    'Fungus Alternaria solani',
                    'Warm humid weather (24-29°C)',
                    'Overhead watering',
                    'Plant debris in soil',
                    'Poor air circulation'
                ],
                organicTreatment: [
                    'Neem oil spray (5ml per liter of water)',
                    'Baking soda solution (1 tsp per liter)',
                    'Copper-based fungicides',
                    'Remove and destroy infected leaves',
                    'Apply compost tea'
                ],
                chemicalTreatment: [
                    'Mancozeb (2g per liter)',
                    'Chlorothalonil',
                    'Azoxystrobin',
                    'Apply every 7-10 days'
                ],
                prevention: [
                    'Crop rotation (3-year cycle)',
                    'Mulch around plants',
                    'Water at soil level, avoid wetting leaves',
                    'Use resistant varieties',
                    'Maintain proper plant spacing',
                    'Remove plant debris after harvest'
                ],
                imageUrl: '/images/tomato_early_blight.jpg'
            },
            {
                name: 'Late Blight',
                symptoms: [
                    'Greasy brown blotches on leaves',
                    'White mold growth on leaf undersides',
                    'Rapid plant destruction',
                    'Water-soaked lesions on stems',
                    'Fruit develops dark, firm rot'
                ],
                causes: [
                    'Fungus-like organism Phytophthora infestans',
                    'Cool, wet weather (15-20°C)',
                    'High humidity (90%+)',
                    'Prolonged leaf wetness',
                    'Contaminated seed tubers'
                ],
                organicTreatment: [
                    'Remove infected plants immediately',
                    'Copper fungicide spray',
                    'Bordeaux mixture',
                    'Improve air circulation'
                ],
                chemicalTreatment: [
                    'Metalaxyl',
                    'Dimethomorph',
                    'Cymoxanil',
                    'Preventive application required'
                ],
                prevention: [
                    'Use resistant varieties',
                    'Avoid overhead irrigation',
                    'Plant in well-drained soil',
                    'Space plants properly',
                    'Remove volunteer plants',
                    'Monitor weather conditions'
                ],
                imageUrl: '/images/tomato_late_blight.jpg'
            },
            {
                name: 'Mosaic Virus',
                symptoms: [
                    'Mottled yellow and green leaves',
                    'Distorted, curled leaves',
                    'Stunted growth',
                    'Reduced fruit production',
                    'Streaking on stems'
                ],
                causes: [
                    'Tobacco Mosaic Virus (TMV)',
                    'Spread by aphids and whiteflies',
                    'Contaminated tools',
                    'Infected transplants',
                    'Human handling'
                ],
                organicTreatment: [
                    'Remove and destroy infected plants',
                    'Control aphids with neem oil',
                    'Use insecticidal soap',
                    'No cure available'
                ],
                chemicalTreatment: [
                    'Imidacloprid for vector control',
                    'Thiamethoxam for aphids',
                    'Focus on preventing spread'
                ],
                prevention: [
                    'Use virus-free certified seeds',
                    'Control aphid populations',
                    'Sanitize tools regularly',
                    'Remove weeds',
                    'Wash hands before handling plants',
                    'Use resistant varieties'
                ],
                imageUrl: '/images/tomato_mosaic.jpg'
            },
            {
                name: 'Fusarium Wilt',
                symptoms: [
                    'Wilting during day, recovery at night (early stage)',
                    'Yellowing of lower leaves',
                    'Brown vascular tissue in stem',
                    'One-sided wilting',
                    'Plant death'
                ],
                causes: [
                    'Soil-borne fungus Fusarium oxysporum',
                    'Warm soil temperatures (27-32°C)',
                    'Acidic soil pH',
                    'Root damage',
                    'Can persist in soil for years'
                ],
                organicTreatment: [
                    'Remove infected plants',
                    'Solarize soil',
                    'Add lime to increase pH',
                    'Use beneficial microbes'
                ],
                chemicalTreatment: [
                    'Thiophanate-methyl',
                    'Benomyl',
                    'Soil fumigation in severe cases'
                ],
                prevention: [
                    'Use resistant varieties (VF, VFN)',
                    'Maintain soil pH 6.5-7.0',
                    'Practice crop rotation',
                    'Avoid overwatering',
                    'Sterilize equipment',
                    'Use raised beds'
                ],
                imageUrl: '/images/tomato_fusarium_wilt.jpg'
            },
            {
                name: 'Septoria Leaf Spot',
                symptoms: [
                    'Small circular brown spots on leaves',
                    'Dark border with gray center',
                    'Black dots (pycnidia) in spot centers',
                    'Leaves turn yellow and drop',
                    'Starts on lower leaves'
                ],
                causes: [
                    'Fungus Septorialycopersici',
                    'High humidity and rainfall',
                    'Overhead watering',
                    'Crowded plants',
                    'Infected debris'
                ],
                organicTreatment: [
                    'Remove infected leaves',
                    'Apply copper fungicide',
                    'Improve air circulation',
                    'Mulch to prevent soil splash'
                ],
                chemicalTreatment: [
                    'Chlorothalonil',
                    'Mancozeb',
                    'Azoxystrobin'
                ],
                prevention: [
                    'Water at base of plants',
                    'Space plants adequately',
                    'Remove lower leaves',
                    'Clean up debris',
                    'Rotate crops every 3 years'
                ],
                imageUrl: '/images/tomato_septoria.jpg'
            }
        ]
    },
    {
        cropName: 'Potato',
        diseases: [
            {
                name: 'Late Blight',
                symptoms: [
                    'Dark water-soaked lesions on leaves',
                    'White fungal growth on leaf undersides',
                    'Brown lesions on stems',
                    'Tuber rot with reddish-brown discoloration',
                    'Rapid crop destruction'
                ],
                causes: [
                    'Phytophthora infestans',
                    'Cool, moist weather (15-20°C)',
                    'High relative humidity',
                    'Prolonged leaf wetness',
                    'Infected seed potatoes'
                ],
                organicTreatment: [
                    'Copper-based fungicides',
                    'Bordeaux mixture',
                    'Remove infected plants',
                    'Hill up soil around plants'
                ],
                chemicalTreatment: [
                    'Metalaxyl-M',
                    'Cymoxanil + Mancozeb',
                    'Dimethomorph',
                    'Preventive spraying every 7-10 days'
                ],
                prevention: [
                    'Use certified disease-free seed',
                    'Plant resistant varieties',
                    'Destroy cull piles',
                    'Avoid overhead irrigation',
                    'Monitor weather forecasts',
                    'Hill potatoes properly'
                ],
                imageUrl: '/images/potato_late_blight.jpg'
            },
            {
                name: 'Early Blight',
                symptoms: [
                    'Brown spots with concentric rings (target-like)',
                    'Yellowing around spots',
                    'Affects older, lower leaves first',
                    'Sunken brown spots on tubers',
                    'Premature leaf drop'
                ],
                causes: [
                    'Fungus Alternaria solani',
                    'Warm temperatures (24-29°C)',
                    'High humidity',
                    'Nutrient-stressed plants',
                    'Repeated cultivation'
                ],
                organicTreatment: [
                    'Remove infected leaves',
                    'Apply compost for nutrients',
                    'Neem oil spray',
                    'Copper fungicide'
                ],
                chemicalTreatment: [
                    'Mancozeb (2-3g per liter)',
                    'Chlorothalonil',
                    'Azoxystrobin',
                    'Pyraclostrobin'
                ],
                prevention: [
                    'Balanced fertilization',
                    'Avoid water stress',
                    'Wide row spacing',
                    'Destroy crop residue',
                    '3-year crop rotation',
                    'Use disease-free seed'
                ],
                imageUrl: '/images/potato_early_blight.jpg'
            },
            {
                name: 'Bacterial Wilt',
                symptoms: [
                    'Sudden wilting of plants',
                    'Yellowing of foliage',
                    'Slimy bacterial ooze from cut stems',
                    'Brown vascular discoloration',
                    'Tuber rot with eyes oozing bacteria'
                ],
                causes: [
                    'Bacterium Ralstonia solanacearum',
                    'Warm, moist soil',
                    'Contaminated water',
                    'Infected seed tubers',
                    'Soil-borne bacteria'
                ],
                organicTreatment: [
                    'Remove and destroy infected plants',
                    'No effective organic cure',
                    'Improve drainage',
                    'Solarize soil'
                ],
                chemicalTreatment: [
                    'No effective chemical control',
                    'Focus on prevention',
                    'Soil fumigation (before planting)'
                ],
                prevention: [
                    'Use certified disease-free seed',
                    'Avoid planting in infested fields',
                    'Improve soil drainage',
                    'Practice long crop rotation (4+ years)',
                    'Sanitize equipment',
                    'Control water sources'
                ],
                imageUrl: '/images/potato_bacterial_wilt.jpg'
            },
            {
                name: 'Common Scab',
                symptoms: [
                    'Corky, rough lesions on tuber surface',
                    'Circular to irregular scabs',
                    'Raised or pitted lesions',
                    'No effect on foliage',
                    'Reduces marketability'
                ],
                causes: [
                    'Bacteria Streptomyces scabies',
                    'High soil pH (>5.5)',
                    'Dry soil conditions',
                    'High calcium levels',
                    'Fresh manure application'
                ],
                organicTreatment: [
                    'Lower soil pH with sulfur',
                    'Maintain consistent moisture',
                    'Use well-composted manure',
                    'Green manure crops'
                ],
                chemicalTreatment: [
                    'No effective chemical treatment',
                    'Focus on cultural practices'
                ],
                prevention: [
                    'Maintain soil pH 5.0-5.2',
                    'Irrigate regularly during tuber formation',
                    'Use resistant varieties',
                    'Avoid fresh manure',
                    '4-year rotation with non-hosts',
                    'Use certified seed'
                ],
                imageUrl: '/images/potato_common_scab.jpg'
            }
        ]
    },
    {
        cropName: 'Rice',
        diseases: [
            {
                name: 'Blast',
                symptoms: [
                    'Spindle-shaped spots on leaves (gray center, brown margin)',
                    'Diamond-shaped lesions',
                    'Neck rot causing panicle breakage',
                    'Stunted growth',
                    'White to gray lesions on panicles'
                ],
                causes: [
                    'Fungus Pyricularia oryzae (Magnaporthe oryzae)',
                    'Cool temperatures (20-25°C)',
                    'High humidity',
                    'Excessive nitrogen',
                    'Prolonged leaf wetness'
                ],
                organicTreatment: [
                    'Silicon fertilization',
                    'Neem seed kernel extract',
                    'Proper water management',
                    'Remove infected plants'
                ],
                chemicalTreatment: [
                    'Tricyclazole (0.6g/L)',
                    'Kasugamycin',
                    'Carbendazim',
                    'Edifenphos'
                ],
                prevention: [
                    'Use resistant varieties',
                    'Balanced nitrogen application',
                    'Proper plant spacing',
                    'Destroy crop residues',
                    'Treat seeds before planting',
                    'Flood fields when possible'
                ],
                imageUrl: '/images/rice_blast.jpg'
            },
            {
                name: 'Bacterial Leaf Blight',
                symptoms: [
                    'Water-soaked lesions on leaf tips',
                    'Yellowish to white lesions',
                    'Wavy margins on lesions',
                    'Milky bacterial ooze (morning)',
                    'Kresek (wilting of seedlings)'
                ],
                causes: [
                    'Bacterium Xanthomonas oryzae pv. oryzae',
                    'Warm temperatures (25-30°C)',
                    'High humidity',
                    'Mechanical injury',
                    'Contaminated water'
                ],
                organicTreatment: [
                    'Remove infected plants',
                    'Drain and dry field temporarily',
                    'Apply organic fungicides',
                    'Balanced nutrition'
                ],
                chemicalTreatment: [
                    'Copper oxychloride (3g/L)',
                    'Streptocycline',
                    'Plantomycin',
                    'Spray at tillering stage'
                ],
                prevention: [
                    'Use resistant varieties',
                    'Treat seeds with Streptocycline',
                    'Avoid excess nitrogen',
                    'Proper water management',
                    'Remove weeds',
                    'Synchronous planting'
                ],
                imageUrl: '/images/rice_bacterial_blight.jpg'
            },
            {
                name: 'Sheath Blight',
                symptoms: [
                    'Oval greenish-gray lesions on leaf sheaths',
                    'Lesions near water line',
                    'White fungal growth',
                    'Sclerotia (white to brown structures)',
                    'Reduced grain filling'
                ],
                causes: [
                    'Fungus Rhizoctonia solani',
                    'High humidity',
                    'Dense plant canopy',
                    'Excessive nitrogen',
                    'Poor air circulation'
                ],
                organicTreatment: [
                    'Drain field for few days',
                    'Apply Trichoderma',
                    'Pseudomonas fluorescens',
                    'Improve air circulation'
                ],
                chemicalTreatment: [
                    'Validamycin (1ml/L)',
                    'Hexaconazole',
                    'Propiconazole',
                    'Spray at maximum tillering'
                ],
                prevention: [
                    'Avoid excessive nitrogen',
                    'Proper plant spacing',
                    'Drain excess water',
                    'Remove weeds',
                    'Use silicon fertilizers',
                    'Moderately resistant varieties'
                ],
                imageUrl: '/images/rice_sheath_blight.jpg'
            },
            {
                name: 'Brown Spot',
                symptoms: [
                    'Circular brown spots on leaves',
                    'Dark brown margins with gray centers',
                    'Spots on grain (reduces quality)',
                    'Seedling blight',
                    'Stunted growth'
                ],
                causes: [
                    'Fungus Bipolaris oryzae (Helminthosporium oryzae)',
                    'Nutrient deficiency',
                    'Drought stress',
                    'Poor soil fertility',
                    'Infected seeds'
                ],
                organicTreatment: [
                    'Improve soil fertility',
                    'Neem oil spray',
                    'Proper nutrition management',
                    'Seed treatment with Trichoderma'
                ],
                chemicalTreatment: [
                    'Mancozeb (2g/L)',
                    'Edifenphos',
                    'Iprodione',
                    'Seed treatment with Carbendazim'
                ],
                prevention: [
                    'Use healthy seeds',
                    'Balanced fertilization',
                    'Adequate irrigation',
                    'Improve soil health',
                    'Treat seeds before planting',
                    'Use resistant varieties'
                ],
                imageUrl: '/images/rice_brown_spot.jpg'
            },
            {
                name: 'Tungro Disease',
                symptoms: [
                    'Mottled yellow-orange leaves',
                    'Stunted growth',
                    'Reduced tillering',
                    'Delayed flowering',
                    'No grain formation in severe cases'
                ],
                causes: [
                    'Rice Tungro Bacilliform Virus (RTBV) + Rice Tungro Spherical Virus (RTSV)',
                    'Transmitted by green leafhopper',
                    'Peak transmission in warm weather',
                    'Nearby infected fields'
                ],
                organicTreatment: [
                    'Remove infected plants immediately',
                    'Control leafhopper with neem',
                    'Yellow sticky traps',
                    'No cure available'
                ],
                chemicalTreatment: [
                    'Imidacloprid for vector control',
                    'Neonicotinoids',
                    'Pymetrozine',
                    'Focus on preventing spread'
                ],
                prevention: [
                    'Use resistant varieties',
                    'Synchronous planting',
                    'Destroy infected plants',
                    'Observe fallow period',
                    'Control leafhoppers',
                    'Remove stubbles after harvest'
                ],
                imageUrl: '/images/rice_tungro.jpg'
            }
        ]
    },
    {
        cropName: 'Wheat',
        diseases: [
            {
                name: 'Leaf Rust',
                symptoms: [
                    'Orange-brown pustules on leaves',
                    'Pustules in scattered pattern',
                    'Yellowing between pustules',
                    'Premature leaf death',
                    'Reduced grain filling'
                ],
                causes: [
                    'Fungus Puccinia triticina',
                    'Moderate temperatures (15-22°C)',
                    'High humidity',
                    'Dew formation',
                    'Susceptible varieties'
                ],
                organicTreatment: [
                    'Remove infected plant parts',
                    'Sulfur dust application',
                    'Neem oil spray',
                    'Improve air circulation'
                ],
                chemicalTreatment: [
                    'Propiconazole',
                    'Tebuconazole',
                    'Mancozeb',
                    'Apply at first sign'
                ],
                prevention: [
                    'Use resistant varieties',
                    'Timely sowing',
                    'Balanced fertilization',
                    'Remove volunteer wheat',
                    'Crop rotation',
                    'Scout fields regularly'
                ],
                imageUrl: '/images/wheat_leaf_rust.jpg'
            },
            {
                name: 'Powdery Mildew',
                symptoms: [
                    'White powdery patches on leaves',
                    'Covers entire leaf surface',
                    'Yellowing of infected leaves',
                    'Stunted growth',
                    'Reduced grain yield'
                ],
                causes: [
                    'Fungus Blumeria graminis',
                    'Cool, humid conditions',
                    'Dense plant canopy',
                    'Shade',
                    'High nitrogen'
                ],
                organicTreatment: [
                    'Milk spray (1:9 with water)',
                    'Baking soda solution',
                    'Sulfur fungicide',
                    'Neem oil'
                ],
                chemicalTreatment: [
                    'Triadimefon',
                    'Propiconazole',
                    'Sulfur',
                    'Apply preventively'
                ],
                prevention: [
                    'Plant resistant varieties',
                    'Avoid excessive nitrogen',
                    'Proper plant spacing',
                    'Remove infected debris',
                    'Ensure good air flow',
                    'Early sowing'
                ],
                imageUrl: '/images/wheat_powdery_mildew.jpg'
            },
            {
                name: 'Fusarium Head Blight',
                symptoms: [
                    'Bleached spikelets on heads',
                    'Pink-orange fungal growth',
                    'Shriveled kernels',
                    'Reduced grain quality',
                    'Mycotoxin contamination'
                ],
                causes: [
                    'Fungus Fusarium graminearum',
                    'Warm (25-30°C), wet weather during flowering',
                    'High humidity',
                    'Corn and small grain residue',
                    'Susceptible varieties'
                ],
                organicTreatment: [
                    'Remove infected heads',
                    'Deep plowing of residue',
                    'Biological control agents',
                    'Timely harvest'
                ],
                chemicalTreatment: [
                    'Propiconazole',
                    'Tebuconazole + Prothioconazole',
                    'Apply at early flowering',
                    'May reduce severity by 50%'
                ],
                prevention: [
                    'Use moderately resistant varieties',
                    'Crop rotation away from corn',
                    'Plow under crop residue',
                    'Fungicide at flowering',
                    'Avoid late planting',
                    'Good drainage'
                ],
                imageUrl: '/images/wheat_fusarium_head_blight.jpg'
            },
            {
                name: 'Septoria Tritici Blotch',
                symptoms: [
                    'Brown lesions with yellow halos',
                    'Black pycnidia (dots) in lesions',
                    'Starts on lower leaves',
                    'Progresses upward',
                    'Severe leaf blighting'
                ],
                causes: [
                    'Fungus Zymoseptoria tritici',
                    'Cool, wet weather',
                    'Rain splash dispersal',
                    'Infected crop residue',
                    'Continuous wheat cropping'
                ],
                organicTreatment: [
                    'Remove lower infected leaves',
                    'Improve air circulation',
                    'Crop residue management',
                    'Copper fungicides'
                ],
                chemicalTreatment: [
                    'Azoxystrobin',
                    'Epoxiconazole',
                    'Pyraclostrobin',
                    'Apply preventively'
                ],
                prevention: [
                    'Use resistant varieties',
                    'Bury crop residue',
                    'Crop rotation',
                    'Adequate plant spacing',
                    'Balanced nutrition',
                    'Timely fungicide application'
                ],
                imageUrl: '/images/wheat_septoria.jpg'
            },
            {
                name: 'Loose Smut',
                symptoms: [
                    'Infected heads filled with black spores',
                    'Spore masses replace grain',
                    'Frame of head remains',
                    'Early heading',
                    'Entire spike infected'
                ],
                causes: [
                    'Fungus Ustilago tritici',
                    'Seed-borne infection',
                    'Infection during flowering',
                    'Internal infection of kernel'
                ],
                organicTreatment: [
                    'Hot water seed treatment (52°C for 11 min)',
                    'Remove infected plants',
                    'Use clean seed'
                ],
                chemicalTreatment: [
                    'Carboxin seed treatment',
                    'Thiram',
                    'Tebuconazole seed dressing',
                    'Treat before planting'
                ],
                prevention: [
                    'Use certified disease-free seed',
                    'Seed treatment mandatory',
                    'Use resistant varieties',
                    'Rogue out infected plants',
                    'Avoid saving seed from infected fields'
                ],
                imageUrl: '/images/wheat_loose_smut.jpg'
            }
        ]
    },
    {
        cropName: 'Cotton',
        diseases: [
            {
                name: 'Fusarium Wilt',
                symptoms: [
                    'Yellowing of leaves',
                    'Wilting of plants',
                    'Brown vascular discoloration',
                    'One-sided symptoms',
                    'Stunted growth and death'
                ],
                causes: [
                    'Soil-borne fungus Fusarium oxysporum f.sp. vasinfectum',
                    'Warm soil temperatures',
                    'Root damage',
                    'Acidic soils',
                    'Persists in soil for years'
                ],
                organicTreatment: [
                    'Soil solarization',
                    'Add lime to raise pH',
                    'Trichoderma application',
                    'Improve drainage'
                ],
                chemicalTreatment: [
                    'Carbendazim seed treatment',
                    'Thiophanate-methyl',
                    'Soil fumigation (severe cases)',
                    'Limited chemical effectiveness'
                ],
                prevention: [
                    'Use resistant varieties',
                    'Deep summer plowing',
                    'Long crop rotation (3+ years)',
                    'Maintain neutral soil pH',
                    'Avoid waterlogging',
                    'Use clean seed and equipment'
                ],
                imageUrl: '/images/cotton_fusarium_wilt.jpg'
            },
            {
                name: 'Bacterial Blight',
                symptoms: [
                    'Angular leaf spots (water-soaked)',
                    'Black arm (stem lesions)',
                    'Boll rot',
                    'Yellowing around lesions',
                    'Premature boll opening'
                ],
                causes: [
                    'Bacterium Xanthomonas citri pv. malvacearum',
                    'Warm, humid weather',
                    'Rain and wind dispersal',
                    'Contaminated seed',
                    'Wounds from insects/hail'
                ],
                organicTreatment: [
                    'Remove infected plants',
                    'Copper-based sprays',
                    'Improve air circulation',
                    'Reduce plant stress'
                ],
                chemicalTreatment: [
                    'Streptocycline (100 ppm)',
                    'Copper oxychloride',
                    'Kasugamycin',
                    'Spray at first symptoms'
                ],
                prevention: [
                    'Use disease-free certified seed',
                    'Seed treatment with Streptocycline',
                    'Plant resistant varieties',
                    'Crop rotation',
                    'Destroy crop residue',
                    'Avoid overhead irrigation'
                ],
                imageUrl: '/images/cotton_bacterial_blight.jpg'
            },
            {
                name: 'Alternaria Leaf Spot',
                symptoms: [
                    'Circular brown spots with concentric rings',
                    'Target-like appearance',
                    'Premature leaf drop',
                    'Affects older leaves first',
                    'Reduced boll size'
                ],
                causes: [
                    'Fungus Alternaria macrospora',
                    'High humidity',
                    'Temperature 25-30°C',
                    'Nutrient deficiency',
                    'Water stress'
                ],
                organicTreatment: [
                    'Neem oil spray',
                    'Remove infected leaves',
                    'Improve plant nutrition',
                    'Proper irrigation'
                ],
                chemicalTreatment: [
                    'Mancozeb (2.5g/L)',
                    'Chlorothalonil',
                    'Azoxystrobin',
                    'Spray at 15-day intervals'
                ],
                prevention: [
                    'Balanced fertilization',
                    'Avoid water stress',
                    'Adequate plant spacing',
                    'Remove crop debris',
                    'Use resistant varieties if available'
                ],
                imageUrl: '/images/cotton_alternaria.jpg'
            },
            {
                name: 'Cotton Leaf Curl Virus',
                symptoms: [
                    'Upward leaf curling',
                    'Vein thickening',
                    'Dark green veins (vein darkening)',
                    'Stunted growth',
                    'Reduced boll formation',
                    'Leaf distortion'
                ],
                causes: [
                    'Begomovirus transmitted by whitefly (Bemisia tabaci)',
                    'High whitefly populations',
                    'Warm weather',
                    'Nearby infected plants',
                    'No seed transmission'
                ],
                organicTreatment: [
                    'Remove infected plants',
                    'Control whiteflies with neem oil',
                    'Yellow sticky traps',
                    'Encourage natural predators'
                ],
                chemicalTreatment: [
                    'Imidacloprid for whitefly control',
                    'Thiamethoxam',
                    'Spiromesifen',
                    'Foliar sprays at 10-day intervals'
                ],
                prevention: [
                    'Plant virus-tolerant varieties',
                    'Destroy infected plants immediately',
                    'Control whitefly populations',
                    'Avoid late sowing',
                    'Remove alternate hosts',
                    'Use reflective mulches'
                ],
                imageUrl: '/images/cotton_leaf_curl_virus.jpg'
            },
            {
                name: 'Root Rot',
                symptoms: [
                    'Yellowing and wilting',
                    'Dark brown to black roots',
                    'Root decay',
                    'Stunted growth',
                    'Easy uprooting of plants',
                    'Plant death'
                ],
                causes: [
                    'Complex of soil-borne fungi (Rhizoctonia, Pythium, Fusarium)',
                    'Poor drainage',
                    'Overwatering',
                    'Heavy soils',
                    'Cool, wet conditions'
                ],
                organicTreatment: [
                    'Improve soil drainage',
                    'Trichoderma seed treatment',
                    'Reduce irrigation',
                    'Add organic matter'
                ],
                chemicalTreatment: [
                    'Metalaxyl seed treatment',
                    'Carbendazim + Mancozeb',
                    'Captan',
                    'Soil drench with fungicides'
                ],
                prevention: [
                    'Improve field drainage',
                    'Avoid overwatering',
                    'Raised beds in heavy soils',
                    'Crop rotation',
                    'Use treated seed',
                    'Plant in well-drained soil'
                ],
                imageUrl: '/images/cotton_root_rot.jpg'
            }
        ]
    }
];

const seedDatabase = async () => {
    try {
        console.log('Connecting to MongoDB for Seeding...');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('MongoDB Connected for Seeding');

        // Clear existing data
        await CropData.deleteMany();
        console.log('Existing crop data cleared');

        // Insert comprehensive disease data
        await CropData.insertMany(crops);
        console.log('✅ Disease Knowledge Base Seeded Successfully!');
        console.log(`📊 Total Crops: ${crops.length}`);
        console.log(`📚 Total Diseases: ${crops.reduce((sum, crop) => sum + crop.diseases.length, 0)}`);
        console.log('\nCrop Summary:');
        crops.forEach(crop => {
            console.log(`  - ${crop.cropName}: ${crop.diseases.length} diseases`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
module.exports = { crops, seedDatabase };

if (require.main === module) {
    seedDatabase();
}
