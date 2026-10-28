const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'data.json');
const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

// Deep chapter metadata for SRM Revision 1 and CBSE Board
const chapterEnrichment = {
  // SCIENCE
  's1': {
    weightage: 'Board Weightage: 4 - 6 Marks',
    keyConcepts: [
      'Balancing Chemical Equations (Mass Conservation)',
      'Types: Combination, Decomposition, Displacement, Double Displacement',
      'Precipitation and Neutralization Reactions',
      'Oxidation, Reduction, Redox reactions with Oxidizing/Reducing agents',
      'Corrosion and Rancidity prevention techniques (Antioxidants, Nitrogen flushing)'
    ],
    formulas: 'General: Reactants $\\rightarrow$ Products; $2H_2 + O_2 \\rightarrow 2H_2O$; $Fe + CuSO_4 \\rightarrow FeSO_4 + Cu$',
    sampleQuestions: [
      { q: 'Why is respiration considered an exothermic reaction?', a: 'During digestion, food is broken down into glucose. Glucose combines with oxygen in cells releasing ATP energy: $C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + \\text{Energy}$.' },
      { q: 'Identify the substance oxidized and reduced in: $CuO + H_2 \\rightarrow Cu + H_2O$.', a: '$H_2$ is oxidized to $H_2O$ (gain of O). $CuO$ is reduced to $Cu$ (loss of O). $CuO$ is oxidizing agent, $H_2$ is reducing agent.' }
    ]
  },
  's2': {
    weightage: 'Board Weightage: 6 - 8 Marks (🔥 SRM Rev-1 Focus)',
    keyConcepts: [
      'Chemical properties of Acids and Bases (Reaction with Metals, Carbonates)',
      'Acid/Base dissociation in water ($H_3O^+$ vs $OH^-$ ions)',
      'pH Scale, universal indicators, and importance in daily life (tooth decay, soil, digestive system)',
      'Salts preparation: Bleaching Powder ($CaOCl_2$), Baking Soda ($NaHCO_3$), Washing Soda ($Na_2CO_3 \\cdot 10H_2O$)',
      'Plaster of Paris ($CaSO_4 \\cdot \\frac{1}{2}H_2O$) and Gypsum ($CaSO_4 \\cdot 2H_2O$)'
    ],
    formulas: '$\\text{pH} = -\\log[H^+]$; $2NaCl + 2H_2O \\rightarrow 2NaOH + Cl_2 + H_2$; $Ca(OH)_2 + Cl_2 \\rightarrow CaOCl_2 + H_2O$',
    sampleQuestions: [
      { q: 'Why does dry HCl gas not turn dry litmus paper blue to red?', a: 'HCl shows acidic behaviour only in the presence of water where it dissociates into $H^+$ / $H_3O^+$ ions. Dry gas has no ions.' },
      { q: 'Give chemical formula and two uses of Baking Soda.', a: 'Sodium hydrogen carbonate ($NaHCO_3$). Uses: 1. In baking powder for making cakes spongy. 2. In soda-acid fire extinguishers / antacid.' }
    ]
  },
  's3': {
    weightage: 'Board Weightage: 8 - 10 Marks',
    keyConcepts: [
      'Physical & Chemical properties of Metals and Non-metals',
      'Reactivity Series & Displacement reactions',
      'Formation and properties of Ionic Compounds (High melting point, conductivity in molten/solution state)',
      'Extraction of metals: Roasting of sulphide ores vs Calcination of carbonate ores',
      'Electrolytic refining of Copper and prevention of Corrosion (Galvanisation, Alloying)'
    ],
    formulas: 'Roasting: $2ZnS + 3O_2 \\rightarrow 2ZnO + 2SO_2$; Calcination: $ZnCO_3 \\xrightarrow{\\Delta} ZnO + CO_2$',
    sampleQuestions: [
      { q: 'Why do ionic compounds have high melting points?', a: 'Strong electrostatic forces of attraction between oppositely charged ions require huge thermal energy to break.' }
    ]
  },
  's4': {
    weightage: 'Board Weightage: 6 - 8 Marks (🔥 SRM Rev-1 Focus)',
    keyConcepts: [
      'Covalent bonding in Carbon (Tetravalency and Catenation)',
      'Allotropes of Carbon: Diamond, Graphite, Fullerenes (C-60)',
      'Saturated (Alkanes) vs Unsaturated (Alkenes, Alkynes) Hydrocarbons',
      'Functional groups (Alcohol, Aldehyde, Ketone, Carboxylic acid) and IUPAC nomenclature',
      'Chemical properties: Combustion, Oxidation, Addition, Substitution',
      'Ethanol & Ethanoic Acid; Soaps and Detergents (Micelle formation)'
    ],
    formulas: 'Alkanes: $C_nH_{2n+2}$; Alkenes: $C_nH_{2n}$; Alkynes: $C_nH_{2n-2}$; Ester: $CH_3COOH + C_2H_5OH \\rightarrow CH_3COOC_2H_5 + H_2O$',
    sampleQuestions: [
      { q: 'Explain why soaps form scum with hard water while detergents do not.', a: 'Hard water contains $Ca^{2+}$ and $Mg^{2+}$ ions which react with soap molecules to form an insoluble precipitate called scum. Detergents are sodium salts of sulphonic acids and do not form insoluble precipitates.' }
    ]
  },
  's5': {
    weightage: 'Board Weightage: 9 - 11 Marks',
    keyConcepts: [
      'Autotrophic Nutrition: Photosynthesis light and dark reactions, Stomata mechanism',
      'Heterotrophic Nutrition: Human digestive system (Enzymes: Pepsin, Amylase, Trypsin, Lipase)',
      'Respiration: Aerobic (Mitochondria) vs Anaerobic (Yeast fermentation & Muscle cramps lactic acid)',
      'Transportation: Human Heart structure, Double circulation, Xylem (water) vs Phloem (translocation)',
      'Excretion: Structure and functioning of Nephron in Kidneys (Filtration, Selective reabsorption, Tubular secretion)'
    ],
    formulas: 'Glucose $\\rightarrow$ Pyruvate ($3C$) $\\rightarrow$ $CO_2 + H_2O + 38\\text{ ATP}$ (Aerobic) OR $\\text{Lactic acid} + 2\\text{ ATP}$ (Anaerobic)',
    sampleQuestions: [
      { q: 'What is the role of bile juice in digestion?', a: 'Bile juice (from liver) makes the acidic chyme alkaline for pancreatic enzymes and emulsifies large fat globules into small micelles.' }
    ]
  },
  's6': {
    weightage: 'Board Weightage: 6 - 8 Marks (🔥 SRM Rev-1 Focus)',
    keyConcepts: [
      'Neuron structure, electrical impulse generation, and synapse neurotransmitters',
      'Reflex arc components and reflex pathway through spinal cord',
      'Human Brain parts: Forebrain (Cerebrum), Midbrain, Hindbrain (Cerebellum, Pons, Medulla)',
      'Plant movements: Tropic (directional: Phototropism, Geotropism) vs Nastic (Touch-me-not)',
      'Plant hormones: Auxins, Gibberellins, Cytokinins, Abscisic acid (ABA)',
      'Endocrine glands: Pituitary (GH), Thyroid (Thyroxine), Pancreas (Insulin), Adrenal (Adrenaline)'
    ],
    formulas: 'Synapse: Electrical impulse $\\rightarrow$ Neurotransmitter chemicals $\\rightarrow$ Dendrite electrical impulse',
    sampleQuestions: [
      { q: 'Why is the use of iodised salt advisable?', a: 'Iodine is essential for thyroid gland to produce Thyroxine hormone which regulates carbohydrate, protein, and fat metabolism. Deficiency causes Goitre (swollen neck).' }
    ]
  },
  's7': {
    weightage: 'Board Weightage: 6 - 8 Marks',
    keyConcepts: [
      'Asexual reproduction: Binary fission (Amoeba), Budding (Hydra), Spore formation (Rhizopus), Regeneration',
      'Vegetative propagation advantages (Grafting, Layering, Tissue culture)',
      'Sexual reproduction in flowering plants: Stamen, Carpel, Pollination, Double Fertilization',
      'Human reproductive system (Male: Testes, Vas deferens; Female: Ovaries, Oviduct/Fallopian tube, Uterus)',
      'Menstrual cycle, Contraceptive methods (Barrier, Chemical, Surgical), and Reproductive health'
    ],
    formulas: 'Pollen tube germination: Stigma $\\rightarrow$ Style $\\rightarrow$ Ovary $\\rightarrow$ Ovule micropyle',
    sampleQuestions: [
      { q: 'What happens when egg is not fertilized?', a: 'The thick and spongy uterine lining prepared to receive zygote is slowly broken down and comes out through vagina as blood and mucus (Menstruation).' }
    ]
  },
  's8': {
    weightage: 'Board Weightage: 4 - 6 Marks',
    keyConcepts: [
      'Heredity and Variation in organisms',
      'Mendel experiments: Monohybrid cross ($3:1$ phenotype, $1:2:1$ genotype)',
      'Dihybrid cross ($9:3:3:1$ independent assortment ratio)',
      'Law of Segregation and Law of Independent Assortment',
      'Sex determination in human beings ($XX$ female vs $XY$ male; 50% probability)'
    ],
    formulas: 'Monohybrid: $Tt \\times Tt \\rightarrow 1 TT : 2 Tt : 1 tt$; Dihybrid: $9\\text{ Round Yellow} : 3\\text{ Round Green} : 3\\text{ Wrinkled Yellow} : 1\\text{ Wrinkled Green}$',
    sampleQuestions: [
      { q: 'Why is the father considered responsible for the sex of the child?', a: 'Mother only provides $X$ chromosome. Father produces 50% $X$-sperm and 50% $Y$-sperm. Fertilization by $X$ results in girl ($XX$), by $Y$ results in boy ($XY$).' }
    ]
  },
  's9': {
    weightage: 'Board Weightage: 8 - 10 Marks',
    keyConcepts: [
      'Laws of Reflection and Mirror Formula ($\\frac{1}{f} = \\frac{1}{v} + \\frac{1}{u}$)',
      'Ray diagrams for Concave and Convex Mirrors (Magnification $m = -v/u = h\'/h$)',
      'Refraction of Light and Snell\'s Law ($\\frac{\\sin i}{\\sin r} = \\text{constant} = n_{21}$)',
      'Lens Formula ($\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}$) and ray diagrams for Convex/Concave lenses',
      'Power of a Lens ($P = \\frac{1}{f\\text{ (in metres)}}$ in Dioptres)'
    ],
    formulas: '$\\frac{1}{v} + \\frac{1}{u} = \\frac{1}{f}$; $\\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}$; $P = \\frac{1}{f\\text{ (m)}}$',
    sampleQuestions: [
      { q: 'A convex lens forms a real, inverted image at 50 cm. Where is the object placed if image is same size as object?', a: 'When $v = +50\\text{ cm}$ and image is same size, object is at $2F_1$. So $2f = 50\\text{ cm} \\implies f = 25\\text{ cm} = 0.25\\text{ m}$. Object distance $u = -50\\text{ cm}$. Power $P = +1/0.25 = +4\\text{ D}$.' }
    ]
  },
  's10': {
    weightage: 'Board Weightage: 5 - 7 Marks (🔥 SRM Rev-1 Focus)',
    keyConcepts: [
      'Structure of human eye and accommodation power of ciliary muscles',
      'Defects of vision: Myopia (concave lens), Hypermetropia (convex lens), Presbyopia (bifocal lens)',
      'Refraction through a triangular glass prism and Angle of Deviation',
      'Dispersion of white light by prism and Rainbow formation (Dispersion, Internal reflection, Refraction)',
      'Atmospheric Refraction: Twinkling of stars, Advanced sunrise (2 min) and Delayed sunset (2 min)',
      'Scattering of light (Tyndall Effect): Blue sky color, Red sky at sunrise and sunset'
    ],
    formulas: 'Power correction: $P = 1/f$; Myopia $f = -d$ (far point); Hypermetropia $\\frac{1}{f} = \\frac{1}{d} - \\frac{1}{D}$',
    sampleQuestions: [
      { q: 'Why do stars twinkle while planets do not?', a: 'Stars are point sources far away; light passes through turbulent atmospheric layers of varying refractive index, fluctuating light reaching eyes. Planets are closer, acting as extended sources of multiple point lights that average out fluctuations.' }
    ]
  },
  's11': {
    weightage: 'Board Weightage: 7 - 9 Marks',
    keyConcepts: [
      'Electric Current ($I = Q/t$) and Potential Difference ($V = W/Q$)',
      'Ohm\'s Law ($V = IR$) and verification graph',
      'Factors affecting resistance ($R = \\rho \\frac{l}{A}$); Resistivity and Temperature dependence',
      'Resistors in Series ($R_s = R_1 + R_2 + R_3$) and Parallel ($\\frac{1}{R_p} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}$)',
      'Joule\'s Heating Effect ($H = I^2Rt = VIt = \\frac{V^2}{R}t$)',
      'Electric Power ($P = VI = I^2R = \\frac{V^2}{R}$) and Commercial unit ($1\\text{ kWh} = 3.6 \\times 10^6\\text{ J}$)'
    ],
    formulas: '$V = IR$; $R = \\rho \\frac{l}{A}$; $H = I^2Rt$; $1\\text{ unit} = 1\\text{ kWh} = 3.6 \\times 10^6\\text{ J}$',
    sampleQuestions: [
      { q: 'Why is tungsten used almost exclusively for filament of electric lamps?', a: 'High melting point ($3380^\\circ\\text{C}$) and high resistivity prevents melting at incandescence.' }
    ]
  },
  's12': {
    weightage: 'Board Weightage: 6 - 8 Marks (🔥 SRM Rev-1 Focus)',
    keyConcepts: [
      'Magnetic field and field line properties (Closed loops, never intersect)',
      'Magnetic field due to current-carrying straight wire, circular loop, and Solenoid',
      'Right-Hand Thumb Rule and Maxwell\'s Corkscrew Rule',
      'Force on a current-carrying conductor in a magnetic field: Fleming\'s Left-Hand Rule',
      'Domestic Electric Circuits: Earth wire safety, Fuse wire, Short circuit, and Overloading prevention'
    ],
    formulas: 'Fleming\'s Left Hand Rule: Thumb = Motion/Force, Forefinger = Magnetic Field, Centre finger = Current',
    sampleQuestions: [
      { q: 'What is the function of an earth wire in metallic appliances?', a: 'It provides a low-resistance conducting path for leakage current to flow safely into the ground, protecting the user from severe electric shocks.' }
    ]
  },
  's13': {
    weightage: 'Board Weightage: 4 - 5 Marks',
    keyConcepts: [
      'Ecosystem components: Biotic (Producers, Consumers, Decomposers) and Abiotic',
      'Food chain, Food web, and Trophic levels',
      '10% Law of Energy transfer (Lindeman\'s Rule)',
      'Biological Biomagnification of pesticides/DDT',
      'Ozone layer depletion (CFCs role) and Montreal Protocol',
      'Garbage management: Biodegradable vs Non-biodegradable waste'
    ],
    formulas: '10% Law: If producers have $10,000\\text{ J}$, primary consumers get $1,000\\text{ J}$, secondary get $100\\text{ J}$, tertiary get $10\\text{ J}$',
    sampleQuestions: [
      { q: 'Why are food chains usually limited to 3 or 4 trophic levels?', a: 'Only 10% of energy is transferred to next level; after 4 levels, energy remaining is too minute to sustain further organism populations.' }
    ]
  },

  // MATHEMATICS
  'm1': {
    weightage: 'Board Weightage: 6 Marks',
    keyConcepts: [
      'Fundamental Theorem of Arithmetic (Unique Prime Factorisation)',
      'Finding HCF and LCM using prime factorisation: $\\text{HCF} \\times \\text{LCM} = a \\times b$',
      'Proof of irrationality: $\\sqrt{2}, \\sqrt{3}, \\sqrt{5}$ and $3 + 2\\sqrt{5}$ using contradiction'
    ],
    formulas: '$\\text{HCF}(a, b) \\times \\text{LCM}(a, b) = a \\times b$',
    sampleQuestions: [
      { q: 'Given that HCF(306, 657) = 9, find LCM(306, 657).', a: '$\\text{LCM} = \\frac{306 \\times 657}{9} = 34 \\times 657 = 22338$.' }
    ]
  },
  'm2': {
    weightage: 'Board Weightage: 4 - 6 Marks (🔥 SRM Rev-1 Focus)',
    keyConcepts: [
      'Geometrical meaning of zeroes of a polynomial (number of x-axis intersections)',
      'Relationship between zeroes and coefficients of quadratic: $\\alpha + \\beta = -b/a, \\alpha\\beta = c/a$',
      'Forming quadratic polynomial: $k[x^2 - (\\alpha + \\beta)x + \\alpha\\beta]$',
      'Evaluating symmetric expressions: $\\alpha^2 + \\beta^2, \\frac{1}{\\alpha} + \\frac{1}{\\beta}, \\alpha^3 + \\beta^3$'
    ],
    formulas: '$\\alpha + \\beta = -\\frac{b}{a}$; $\\alpha\\beta = \\frac{c}{a}$; $p(x) = x^2 - (\\text{Sum})x + (\\text{Product})$',
    sampleQuestions: [
      { q: 'If $\\alpha, \\beta$ are zeroes of $x^2 - p(x+1) - c$, show that $(\\alpha+1)(\\beta+1) = 1-c$.', a: '$x^2 - px - (p+c) = 0$. $\\alpha+\\beta = p, \\alpha\\beta = -(p+c)$. $(\\alpha+1)(\\beta+1) = \\alpha\\beta + \\alpha + \\beta + 1 = -(p+c) + p + 1 = 1 - c$.' }
    ]
  },
  'm3': {
    weightage: 'Board Weightage: 6 - 8 Marks (🔥 SRM Rev-1 Focus)',
    keyConcepts: [
      'Graphical method and consistency conditions (Unique, Infinite, No solution)',
      'Algebraic methods: Substitution Method and Elimination Method',
      'Applications: Upstream-downstream boat speeds, fraction problems, age problems, fixed & per km taxi charges'
    ],
    formulas: 'Unique: $\\frac{a_1}{a_2} \\neq \\frac{b_1}{b_2}$; Infinite: $\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2}$; Parallel/No sol: $\\frac{a_1}{a_2} = \\frac{b_1}{b_2} \\neq \\frac{c_1}{c_2}$',
    sampleQuestions: [
      { q: 'A boat goes 30 km upstream and 44 km downstream in 10 hours... Find boat and stream speed.', a: 'Let speed in still water $= x\\text{ km/h}$, stream $= y\\text{ km/h}$. $\\frac{30}{x-y} + \\frac{44}{x+y} = 10$. Solving gives $x = 8\\text{ km/h}, y = 3\\text{ km/h}$.' }
    ]
  },
  'm6': {
    weightage: 'Board Weightage: 8 - 10 Marks (🔥 SRM Rev-1 Focus)',
    keyConcepts: [
      'Basic Proportionality Theorem (BPT / Thales Theorem) statement and complete proof',
      'Converse of BPT statement and application',
      'Criteria for Similarity of Triangles (AAA, SSS, SAS)',
      'Application of similarity in heights, shadows, and intersecting diagonals of trapezium'
    ],
    formulas: 'If $DE \\parallel BC$ in $\\triangle ABC$, then $\\frac{AD}{DB} = \\frac{AE}{EC}$',
    sampleQuestions: [
      { q: 'Diagonals of trapezium ABCD with $AB \\parallel DC$ intersect at O. Show $\\frac{AO}{BO} = \\frac{CO}{DO}$.', a: 'Draw line through O parallel to AB and use BPT on $\\triangle ABD$ and $\\triangle ADC$.' }
    ]
  },
  'm9': {
    weightage: 'Board Weightage: 6 - 8 Marks (🔥 SRM Rev-1 Focus)',
    keyConcepts: [
      'Angle of elevation and Angle of depression definitions with line of sight',
      'Right triangle trigonometry ratios: $\\sin\\theta = \\frac{O}{H}, \\cos\\theta = \\frac{A}{H}, \\tan\\theta = \\frac{O}{A}$',
      'Values for $30^\\circ, 45^\\circ, 60^\\circ$',
      'Multi-angle elevation problems: Shadow elongation, Cloud reflection in lake, Two towers opposite a road'
    ],
    formulas: '$\\tan 30^\\circ = \\frac{1}{\\sqrt{3}}, \\tan 45^\\circ = 1, \\tan 60^\\circ = \\sqrt{3}$',
    sampleQuestions: [
      { q: 'From top of 7m high building, angle of elevation of cable tower top is 60° and depression of foot is 45°. Find height of tower.', a: 'In bottom triangle $\\tan 45^\\circ = 7/x \\implies x = 7\\text{ m}$. In top triangle $\\tan 60^\\circ = h/7 \\implies h = 7\\sqrt{3}$. Total height $= 7(1+\\sqrt{3})\\text{ m}$.' }
    ]
  },
  'm11': {
    weightage: 'Board Weightage: 5 - 6 Marks (🔥 SRM Rev-1 Focus)',
    keyConcepts: [
      'Perimeter and Area of a Circle review ($\\pi = 22/7$)',
      'Area of Sector of angle $\\theta$: $\\frac{\\theta}{360} \\times \\pi r^2$',
      'Length of an Arc of angle $\\theta$: $\\frac{\\theta}{360} \\times 2\\pi r$',
      'Area of Segment = Area of Sector - Area of corresponding triangle',
      'Combination of plane figures (Quadrants in square, round table covers)'
    ],
    formulas: '$\\text{Sector} = \\frac{\\theta}{360}\\pi r^2$; $\\text{Arc} = \\frac{\\theta}{360} 2\\pi r$; $\\triangle = \\frac{1}{2}r^2\\sin\\theta$',
    sampleQuestions: [
      { q: 'Find area of sector of a circle with radius 6 cm if angle of sector is 60°.', a: '$\\text{Area} = \\frac{60}{360} \\times \\frac{22}{7} \\times 6 \\times 6 = \\frac{132}{7} = 18.86\\text{ cm}^2$.' }
    ]
  }
};

// Merge enrichments into subjects
Object.entries(data.subjects).forEach(([subKey, sub]) => {
  if (sub.chapters) {
    sub.chapters.forEach(ch => {
      const enrich = chapterEnrichment[ch.id];
      if (enrich) {
        ch.examWeightage = enrich.weightage;
        ch.keyConcepts = enrich.keyConcepts;
        ch.formulas = enrich.formulas;
        ch.sampleQuestions = enrich.sampleQuestions;
      } else {
        ch.examWeightage = ch.examWeightage || 'Board Weightage: 4 - 6 Marks';
        ch.keyConcepts = ch.keyConcepts || [
          'Detailed NCERT core chapter concepts and summary notes',
          'Key definitions, standard equations, and terminology',
          'Board-standard practice questions and solutions'
        ];
        ch.sampleQuestions = ch.sampleQuestions || [
          { q: `Explain the fundamental concept of ${ch.name}.`, a: `Refer to NCERT textbook explanations and notes in the Easy Learn tab.` }
        ];
      }
    });
  }
});

fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
fs.writeFileSync(path.join(__dirname, 'public', 'data.json'), JSON.stringify(data, null, 2), 'utf8');

console.log('✅ Successfully enriched all chapters across data.json and public/data.json!');
