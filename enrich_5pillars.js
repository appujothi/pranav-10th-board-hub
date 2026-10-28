const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'data.json');
const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

// Update Today & Tomorrow to Oct 28 (Day 1)
data.revisionSplitter.today = {
  date: "2026-10-28",
  dayIndex: 1,
  status: "Active Revision Day 1",
  pair: "Science + Tamil",
  sub1Name: "Science: Ch 2 Acids, Bases & Salts (15 Marks)",
  sub2Name: "Tamil: இயல் 5 மணற்கேணி (15 Marks)",
  nightTestTiming: "8:30 PM – 9:15 PM (30 Marks)",
  message: "இன்று முதல் நாள் ரிவிஷன்! வேதியியலில் Acids & Bases மற்றும் தமிழில் இயல் 5 படித்து இரவு 8:30 மணிக்கு தேர்வு எழுத தயாராகுங்கள்."
};

data.revisionSplitter.tomorrow = {
  date: "2026-10-29",
  dayIndex: 2,
  pair: "Mathematics + English",
  sub1Name: "Maths: Ch 2 Polynomials & Ch 3 Linear Equations",
  sub2Name: "English: Mijbil the Otter & Formal Letters",
  nightTestTiming: "8:30 PM – 9:15 PM (30 Marks)",
  warning: "⚠️ Note: இந்த Sample Questions பயிற்சிக்கு மட்டுமே! இரவு டெஸ்ட்டில் இதே கேள்விகள் வராது, உன் புரிதலை சோதிக்க Twist செய்து கேட்கப்படும்!"
};

// 1. TEXTBOOKS DATABASE (Organized by Subject with PDF Paths & Summary Notes)
data.textbooks = {
  science: {
    title: "Class 10 Science (NCERT)",
    code: "086",
    coverIcon: "🔬",
    chapters: [
      { id: "s1", name: "Ch 1: Chemical Reactions and Equations", pdf: "/textbooks/science/jesc101.pdf", ncertCode: "jesc101", pages: 16, onlineUrl: "https://ncert.nic.in/textbook.php?jesc1=1-13" },
      { id: "s2", name: "Ch 2: Acids, Bases and Salts", pdf: "/textbooks/science/jesc102.pdf", ncertCode: "jesc102", pages: 19, isToday: true, isRevision1: true, onlineUrl: "https://ncert.nic.in/textbook.php?jesc1=2-13" },
      { id: "s3", name: "Ch 3: Metals and Non-metals", pdf: "/textbooks/science/jesc103.pdf", ncertCode: "jesc103", pages: 18, onlineUrl: "https://ncert.nic.in/textbook.php?jesc1=3-13" },
      { id: "s4", name: "Ch 4: Carbon and its Compounds", pdf: "/textbooks/science/jesc104.pdf", ncertCode: "jesc104", pages: 20, isRevision1: true, onlineUrl: "https://ncert.nic.in/textbook.php?jesc1=4-13" },
      { id: "s5", name: "Ch 5: Life Processes", pdf: "/textbooks/science/jesc105.pdf", ncertCode: "jesc105", pages: 22, onlineUrl: "https://ncert.nic.in/textbook.php?jesc1=5-13" },
      { id: "s6", name: "Ch 6: Control and Coordination", pdf: "/textbooks/science/jesc106.pdf", ncertCode: "jesc106", pages: 16, isRevision1: true, onlineUrl: "https://ncert.nic.in/textbook.php?jesc1=6-13" },
      { id: "s7", name: "Ch 7: How do Organisms Reproduce?", pdf: "/textbooks/science/jesc107.pdf", ncertCode: "jesc107", pages: 18, onlineUrl: "https://ncert.nic.in/textbook.php?jesc1=7-13" },
      { id: "s8", name: "Ch 8: Heredity and Evolution", pdf: "/textbooks/science/jesc108.pdf", ncertCode: "jesc108", pages: 15, isRevision1: true, onlineUrl: "https://ncert.nic.in/textbook.php?jesc1=8-13" },
      { id: "s9", name: "Ch 9: Light - Reflection and Refraction", pdf: "/textbooks/science/jesc109.pdf", ncertCode: "jesc109", pages: 24, onlineUrl: "https://ncert.nic.in/textbook.php?jesc1=9-13" },
      { id: "s10", name: "Ch 10: Human Eye and Colourful World", pdf: "/textbooks/science/jesc110.pdf", ncertCode: "jesc110", pages: 14, isRevision1: true, onlineUrl: "https://ncert.nic.in/textbook.php?jesc1=10-13" },
      { id: "s11", name: "Ch 11: Electricity", pdf: "/textbooks/science/jesc111.pdf", ncertCode: "jesc111", pages: 22, onlineUrl: "https://ncert.nic.in/textbook.php?jesc1=11-13" },
      { id: "s12", name: "Ch 12: Magnetic Effects of Electric Current", pdf: "/textbooks/science/jesc112.pdf", ncertCode: "jesc112", pages: 16, isRevision1: true, onlineUrl: "https://ncert.nic.in/textbook.php?jesc1=12-13" },
      { id: "s13", name: "Ch 13: Our Environment", pdf: "/textbooks/science/jesc113.pdf", ncertCode: "jesc113", pages: 12, isRevision1: true, onlineUrl: "https://ncert.nic.in/textbook.php?jesc1=13-13" }
    ]
  },
  maths: {
    title: "Class 10 Mathematics (NCERT)",
    code: "041",
    coverIcon: "📐",
    chapters: [
      { id: "m1", name: "Ch 1: Real Numbers", pdf: "/textbooks/maths/jemh101.pdf", ncertCode: "jemh101", pages: 14, onlineUrl: "https://ncert.nic.in/textbook.php?jemh1=1-14" },
      { id: "m2", name: "Ch 2: Polynomials", pdf: "/textbooks/maths/jemh102.pdf", ncertCode: "jemh102", pages: 16, isRevision1: true, isTomorrow: true, onlineUrl: "https://ncert.nic.in/textbook.php?jemh1=2-14" },
      { id: "m3", name: "Ch 3: Pair of Linear Equations in Two Variables", pdf: "/textbooks/maths/jemh103.pdf", ncertCode: "jemh103", pages: 24, isRevision1: true, isTomorrow: true, onlineUrl: "https://ncert.nic.in/textbook.php?jemh1=3-14" },
      { id: "m4", name: "Ch 4: Quadratic Equations", pdf: "/textbooks/maths/jemh104.pdf", ncertCode: "jemh104", pages: 18, onlineUrl: "https://ncert.nic.in/textbook.php?jemh1=4-14" },
      { id: "m5", name: "Ch 5: Arithmetic Progressions", pdf: "/textbooks/maths/jemh105.pdf", ncertCode: "jemh105", pages: 22, onlineUrl: "https://ncert.nic.in/textbook.php?jemh1=5-14" },
      { id: "m6", name: "Ch 6: Triangles", pdf: "/textbooks/maths/jemh106.pdf", ncertCode: "jemh106", pages: 26, isRevision1: true, onlineUrl: "https://ncert.nic.in/textbook.php?jemh1=6-14" },
      { id: "m7", name: "Ch 7: Coordinate Geometry", pdf: "/textbooks/maths/jemh107.pdf", ncertCode: "jemh107", pages: 18, onlineUrl: "https://ncert.nic.in/textbook.php?jemh1=7-14" },
      { id: "m8", name: "Ch 8: Introduction to Trigonometry", pdf: "/textbooks/maths/jemh108.pdf", ncertCode: "jemh108", pages: 18, onlineUrl: "https://ncert.nic.in/textbook.php?jemh1=8-14" },
      { id: "m9", name: "Ch 9: Some Applications of Trigonometry", pdf: "/textbooks/maths/jemh109.pdf", ncertCode: "jemh109", pages: 14, isRevision1: true, onlineUrl: "https://ncert.nic.in/textbook.php?jemh1=9-14" },
      { id: "m10", name: "Ch 10: Circles", pdf: "/textbooks/maths/jemh110.pdf", ncertCode: "jemh110", pages: 16, onlineUrl: "https://ncert.nic.in/textbook.php?jemh1=10-14" },
      { id: "m11", name: "Ch 11: Areas Related to Circles", pdf: "/textbooks/maths/jemh111.pdf", ncertCode: "jemh111", pages: 14, isRevision1: true, onlineUrl: "https://ncert.nic.in/textbook.php?jemh1=11-14" },
      { id: "m12", name: "Ch 12: Surface Areas and Volumes", pdf: "/textbooks/maths/jemh112.pdf", ncertCode: "jemh112", pages: 18, onlineUrl: "https://ncert.nic.in/textbook.php?jemh1=12-14" },
      { id: "m13", name: "Ch 13: Statistics", pdf: "/textbooks/maths/jemh113.pdf", ncertCode: "jemh113", pages: 22, isRevision1: true, onlineUrl: "https://ncert.nic.in/textbook.php?jemh1=13-14" },
      { id: "m14", name: "Ch 14: Probability", pdf: "/textbooks/maths/jemh114.pdf", ncertCode: "jemh114", pages: 16, isRevision1: true, onlineUrl: "https://ncert.nic.in/textbook.php?jemh1=14-14" }
    ]
  },
  social_science: {
    title: "Class 10 Social Science",
    code: "087",
    coverIcon: "🌍",
    chapters: [
      { id: "sst1", name: "History Ch 1: The Rise of Nationalism in Europe", pdf: "/textbooks/India and the Contemporary World - II/jess101.pdf", branch: "History", isRevision1: true },
      { id: "sst2", name: "History Ch 2: Nationalism in India", pdf: "/textbooks/India and the Contemporary World - II/jess102.pdf", branch: "History" },
      { id: "sst3", name: "History Ch 3: The Making of a Global World", pdf: "/textbooks/India and the Contemporary World - II/jess103.pdf", branch: "History", isRevision1: true },
      { id: "sst5", name: "History Ch 5: Print Culture and Modern World", pdf: "/textbooks/India and the Contemporary World - II/jess105.pdf", branch: "History", isRevision1: true },
      { id: "sst8", name: "Geography Ch 4: Agriculture", pdf: "/textbooks/social science/jess204.pdf", branch: "Geography", isRevision1: true },
      { id: "sst9", name: "Geography Ch 5: Minerals and Energy Resources", pdf: "/textbooks/social science/jess205.pdf", branch: "Geography", isRevision1: true },
      { id: "sst10", name: "Geography Ch 6: Manufacturing Industries", pdf: "/textbooks/social science/jess206.pdf", branch: "Geography", isRevision1: true },
      { id: "sst13", name: "Political Science Ch 2: Federalism", pdf: "/textbooks/social science Democratic Politics-II/jess402.pdf", branch: "Pol. Science" },
      { id: "sst15", name: "Political Science Ch 4: Political Parties", pdf: "/textbooks/social science Democratic Politics-II/jess404.pdf", branch: "Pol. Science", isRevision1: true },
      { id: "sst16", name: "Political Science Ch 5: Outcomes of Democracy", pdf: "/textbooks/social science Democratic Politics-II/jess405.pdf", branch: "Pol. Science", isRevision1: true },
      { id: "sst19", name: "Economics Ch 3: Money and Credit", pdf: "/textbooks/social science economics/jess303.pdf", branch: "Economics", isRevision1: true },
      { id: "sst20", name: "Economics Ch 4: Globalisation and Indian Economy", pdf: "/textbooks/social science economics/jess304.pdf", branch: "Economics", isRevision1: true }
    ]
  },
  english: {
    title: "Class 10 English (Language & Literature)",
    code: "184",
    coverIcon: "📖",
    chapters: [
      { id: "eng1", name: "A Letter to God & Dust of Snow / Fire and Ice", pdf: "/textbooks/english/jeff101.pdf", unit: "First Flight" },
      { id: "eng2", name: "Nelson Mandela: Long Walk to Freedom", pdf: "/textbooks/english/jeff102.pdf", unit: "First Flight" },
      { id: "eng6", name: "Mijbil the Otter & Fog", pdf: "/textbooks/english/jeff106.pdf", unit: "First Flight", isRevision1: true, isTomorrow: true },
      { id: "eng7", name: "Madam Rides the Bus & The Trees", pdf: "/textbooks/english/jeff107.pdf", unit: "First Flight", isRevision1: true },
      { id: "eng8", name: "The Sermon at Benares & For Anne Gregory", pdf: "/textbooks/english/jeff108.pdf", unit: "First Flight", isRevision1: true },
      { id: "eng9", name: "The Proposal (Play by Anton Chekhov)", pdf: "/textbooks/english/jeff109.pdf", unit: "First Flight", isRevision1: true },
      { id: "eng14", name: "The Making of a Scientist (Robert W. Peterson)", pdf: "/textbooks/english 2/jefp106.pdf", unit: "Footprints", isRevision1: true },
      { id: "eng15", name: "The Necklace (Guy de Maupassant)", pdf: "/textbooks/english 2/jefp107.pdf", unit: "Footprints", isRevision1: true },
      { id: "eng17", name: "The Book That Saved the Earth", pdf: "/textbooks/english 2/jefp109.pdf", unit: "Footprints", isRevision1: true }
    ]
  },
  tamil: {
    title: "பத்தாம் வகுப்பு தமிழ் (Tamil Language-II)",
    code: "006",
    coverIcon: "🪶",
    fullBookPdf: "/textbooks/tamil.pdf",
    chapters: [
      { id: "tam1", name: "இயல் 1: அமுதூற்று (அன்னை மொழியே, உரைநடையின் அணிநலன்கள்)", unit: "இயல் 1" },
      { id: "tam2", name: "இயல் 2: உயிரின் ஓசை (காற்றே வா, முல்லைப்பாட்டு)", unit: "இயல் 2" },
      { id: "tam3", name: "இயல் 3: கூட்டாஞ்சோறு (விருந்து போற்றுதும், காசி காண்டம்)", unit: "இயல் 3" },
      { id: "tam4", name: "இயல் 4: நான்காம் தமிழ் (செயற்கை நுண்ணறிவு, பெருமாள் திருமொழி)", unit: "இயல் 4" },
      { id: "tam5", name: "இயல் 5: மணற்கேணி (மொழிபெயர்ப்புக் கல்வி, நீதி வெண்பா, வினா-விடை வகைகள் & பொருள்கோள்)", unit: "இயல் 5", isToday: true, isRevision1: true },
      { id: "tam6", name: "இயல் 6: நிகழ்கலை (முத்துக்குமாரசுவாமி பிள்ளைத்தமிழ், கம்பராமாயணம், பாய்ச்சல்)", unit: "இயல் 6", isRevision1: true },
      { id: "tam7", name: "இயல் 7: விதைநெல் (சிற்றகல் ஒளி, ஏர் புதிதா?, மெய்க்கீர்த்தி, சிலப்பதிகாரம்)", unit: "இயல் 7", isRevision1: true }
    ]
  },
  ai: {
    title: "Artificial Intelligence (Skill Subject 417)",
    code: "417",
    coverIcon: "🤖",
    fullBookPdf: "/textbooks/ai.pdf",
    chapters: [
      { id: "ai1", name: "Part A: Employability Skills (Communication & Self Management)", unit: "Employability" },
      { id: "ai2", name: "Part B: Introduction to AI & AI Project Cycle", unit: "Subject Specific", isRevision1: true },
      { id: "ai3", name: "Part B: Computer Vision & Natural Language Processing (NLP)", unit: "Subject Specific", isRevision1: true },
      { id: "ai4", name: "Part B: Evaluation Metrics (Confusion Matrix, Precision, Recall, F1 Score)", unit: "Subject Specific", isRevision1: true }
    ]
  }
};

// 2. MODEL QUESTIONS & ANSWERS (Categorized with CBSE Step-by-Step Rubrics)
data.modelQA = [
  {
    id: "mqa-s1",
    subject: "Science",
    chapter: "Acids, Bases and Salts",
    marks: 3,
    type: "Short Answer",
    question: "A compound 'X' of sodium is used as an antacid in medicine. Name 'X' and write its chemical formula. What happens when it is heated strongly? Write the balanced chemical equation.",
    answer: "1. Compound 'X' is Sodium Hydrogen Carbonate (or Sodium Bicarbonate), chemical formula: $NaHCO_3$.\n2. When heated strongly, it decomposes into sodium carbonate, water, and carbon dioxide gas.\nBalanced Equation:\n$$2NaHCO_3(s) \\xrightarrow{\\Delta} Na_2CO_3(s) + H_2O(l) + CO_2(g)\\uparrow$$",
    rubric: "• Name and Formula: 1 Mark\n• Explanation of heating: 1 Mark\n• Balanced Chemical Equation: 1 Mark"
  },
  {
    id: "mqa-s2",
    subject: "Science",
    chapter: "Acids, Bases and Salts",
    marks: 5,
    type: "Long Answer / Application",
    question: "(a) What is the Chlor-alkali process? Why is it called so? (2M)\n(b) Write balanced chemical equations for the process. (1M)\n(c) Name the products formed at anode and cathode, and write one use of each. (2M)",
    answer: "(a) When electricity is passed through an aqueous solution of sodium chloride (called brine), it decomposes to form sodium hydroxide. It is called the chlor-alkali process because of the products formed: 'chlor' for chlorine and 'alkali' for sodium hydroxide.\n\n(b) Balanced Equation:\n$$2NaCl(aq) + 2H_2O(l) \\xrightarrow{\\text{Electricity}} 2NaOH(aq) + Cl_2(g)\\uparrow + H_2(g)\\uparrow$$\n\n(c) Products & Uses:\n• At Anode: Chlorine gas ($Cl_2$). Use: Disinfectant for water, manufacturing PVC, bleaching powder.\n• At Cathode: Hydrogen gas ($H_2$). Use: Fuel, margarine, ammonia for fertilisers.\n• In Solution: Sodium hydroxide ($NaOH$). Use: De-greasing metals, soaps and detergents.",
    rubric: "• Definition & Reason for name: 2 Marks\n• Balanced chemical equation: 1 Mark\n• Anode product & use: 1 Mark\n• Cathode product & use: 1 Mark"
  },
  {
    id: "mqa-m1",
    subject: "Mathematics",
    chapter: "Triangles",
    marks: 5,
    type: "Board Theorem Proof",
    question: "State and prove Basic Proportionality Theorem (Thales Theorem).",
    answer: "Statement:\nIf a line is drawn parallel to one side of a triangle to intersect the other two sides in distinct points, then the other two sides are divided in the same ratio.\n\nGiven: $\\triangle ABC$ where a line parallel to side $BC$ intersects $AB$ at $D$ and $AC$ at $E$.\nTo Prove: $\\frac{AD}{DB} = \\frac{AE}{EC}$.\nConstruction: Join $BE$ and $CD$. Draw $DM \\perp AC$ and $EN \\perp AB$.\n\nProof:\n$\\text{Area}(\\triangle ADE) = \\frac{1}{2} \\times \\text{base} \\times \\text{height} = \\frac{1}{2} \\times AD \\times EN$\n$\\text{Area}(\\triangle BDE) = \\frac{1}{2} \\times DB \\times EN$\n$$\\frac{\\text{Area}(\\triangle ADE)}{\\text{Area}(\\triangle BDE)} = \\frac{\\frac{1}{2} \\times AD \\times EN}{\\frac{1}{2} \\times DB \\times EN} = \\frac{AD}{DB} \\quad \\text{--- (1)}$$\nSimilarly, taking $AE$ as base with height $DM$:\n$$\\frac{\\text{Area}(\\triangle ADE)}{\\text{Area}(\\triangle CDE)} = \\frac{\\frac{1}{2} \\times AE \\times DM}{\\frac{1}{2} \\times EC \\times DM} = \\frac{AE}{EC} \\quad \\text{--- (2)}$$\nNote that $\\triangle BDE$ and $\\triangle CDE$ are on the same base $DE$ and between the same parallels $BC$ and $DE$:\n$$\\text{Area}(\\triangle BDE) = \\text{Area}(\\triangle CDE) \\quad \\text{--- (3)}$$\nFrom (1), (2), and (3):\n$$\\frac{AD}{DB} = \\frac{AE}{EC}$$\nHence proved!",
    rubric: "• Accurate statement & Given/To Prove: 1 Mark\n• Construction & labelled diagram: 1 Mark\n• Ratio equations (1) and (2): 2 Marks\n• Area equality between parallels & conclusion: 1 Mark"
  },
  {
    id: "mqa-m2",
    subject: "Mathematics",
    chapter: "Polynomials",
    marks: 3,
    type: "Short Answer",
    question: "Find a quadratic polynomial whose zeroes are $3 + \\sqrt{5}$ and $3 - \\sqrt{5}$.",
    answer: "Let the zeroes be $\\alpha = 3 + \\sqrt{5}$ and $\\beta = 3 - \\sqrt{5}$.\n\n1. Sum of zeroes:\n$$\\alpha + \\beta = (3 + \\sqrt{5}) + (3 - \\sqrt{5}) = 6$$\n\n2. Product of zeroes:\n$$\\alpha\\beta = (3 + \\sqrt{5})(3 - \\sqrt{5}) = (3)^2 - (\\sqrt{5})^2 = 9 - 5 = 4$$\n\n3. General Quadratic Polynomial:\n$$p(x) = k[x^2 - (\\alpha + \\beta)x + \\alpha\\beta]$$\nFor $k = 1$:\n$$p(x) = x^2 - 6x + 4$$",
    rubric: "• Sum of zeroes: 1 Mark\n• Product of zeroes ($a^2 - b^2$ step): 1 Mark\n• Final polynomial $x^2 - 6x + 4$: 1 Mark"
  },
  {
    id: "mqa-sst1",
    subject: "Social Science",
    chapter: "Money and Credit",
    marks: 5,
    type: "Long Answer",
    question: "Why is credit a crucial element in economic development? Mention any four reasons why formal sources of credit need to be expanded in India.",
    answer: "Why Credit is Crucial:\nCredit allows farmers to buy seeds and fertilisers, entrepreneurs to set up industries, and families to construct houses, creating employment and generating income.\n\nReasons to Expand Formal Sources of Credit:\n1. Eliminate Exploitation: Informal lenders charge exorbitant interest rates (up to 36%-60% per year) which push borrowers into endless debt-traps.\n2. Affordable Loans for Poor: Cheap and affordable credit through banks and cooperatives increases income and enables investment in profitable ventures.\n3. RBI Supervision: The Reserve Bank of India ensures that banks give loans not just to profit-making businesses, but also to small cultivators, cottage industries, and small borrowers.\n4. Equity & Inclusive Growth: Reducing dependence on informal moneylenders leads to balanced regional development and poverty reduction.",
    rubric: "• Importance of credit in economy: 1 Mark\n• 4 distinct valid reasons for formal sector expansion: 4 Marks (1 mark each)"
  },
  {
    id: "mqa-tam1",
    subject: "Tamil",
    chapter: "இயல் 5: மணற்கேணி",
    marks: 5,
    type: "இலக்கண விளக்கம்",
    question: "வினா மற்றும் விடை எத்தனை வகைப்படும்? சான்றுகளுடன் வகைப்படுத்தி விளக்குக.",
    answer: "I. வினா 6 வகைப்படும்:\n1. அறிவினா: தான் விடை அறிந்திருந்தும் பிறரின் அறிவை அறியக் கேட்பது (எ.கா: 'இப்பாடலின் ஆசிரியர் யார்?' என ஆசிரியர் மாணவரிடம் கேட்பது).\n2. அறியாவினா: தான் அறியாத ஒன்றை அறிந்து கொள்ளக் கேட்பது (எ.கா: 'இப்பாடலின் பொருள் யாது?' என மாணவர் ஆசிரியரிடம் கேட்பது).\n3. ஐயவினா: தன் ஐயத்தைப் போக்கிக் கொள்ளக் கேட்பது (எ.கா: 'அங்கு கிடப்பது பாம்பா? கயிறா?').\n4. கொளல்வினா: தான் ஒரு பொருளை வாங்கிக் கொள்ளும் பொருட்டுக் கேட்பது (எ.கா: 'பருப்பு உள்ளதா? என வணிகரிடம் கேட்பது).\n5. கொடைவினா: இல்லாதவருக்கு கொடுக்கும் பொருட்டுக் கேட்பது (எ.கா: 'உன்னிடம் சீருடை இல்லையோ? என வழங்குவதற்காகக் கேட்பது).\n6. ஏவல்வினா: ஒரு செயலைச் செய்யும்படி ஏவுவது (எ.கா: 'வீட்டில் தக்காளி இல்லை; கடைக்குச் செல்கிறாயா?').\n\nII. விடை 8 வகைப்படும்:\nசுட்டு விடை, நேர் விடை, எதிர்மறை விடை, ஏவல் விடை, வினாவெதிர் வினாதல் விடை, உற்றது உரைத்தல் விடை, உறுவது கூறல் விடை, இனமொழி விடை.",
    rubric: "• வினா 6 வகைகள் சான்றுகளுடன்: 3 மதிப்பெண்கள்\n• விடை 8 வகைகள் தொகுப்பு: 2 மதிப்பெண்கள்"
  }
];

// 3. PERFORMANCE 4-QUADRANT SCORECARD (Overall, School, Tuition, Home)
data.performanceScorecard = {
  overall: {
    aggregatePercentage: 86.4,
    totalTestsTaken: 24,
    syllabusMasteryPct: 88,
    statusText: "On Track for 90%+ in Board Exams",
    summary: "School tests and home night consistency are strong. Tuition algebra proofs need quick polish."
  },
  school: {
    institution: "SRM Public School (Grade X)",
    target: "95% in Revision-1 (Starting Nov 13)",
    tests: [
      { id: "sch-1", title: "Quarterly Exam", subject: "Tamil", marks: 88, total: 100, pct: 88, date: "2026-09-20", badge: "School Quarterly" },
      { id: "sch-2", title: "Quarterly Exam", subject: "English", marks: 74, total: 80, pct: 92.5, date: "2026-09-22", badge: "School Quarterly" },
      { id: "sch-3", title: "Quarterly Exam", subject: "Science", marks: 73, total: 80, pct: 91.2, date: "2026-09-24", badge: "School Quarterly" },
      { id: "sch-4", title: "Quarterly Exam", subject: "Mathematics", marks: 71, total: 80, pct: 88.7, date: "2026-09-26", badge: "School Quarterly" },
      { id: "sch-5", title: "Quarterly Exam", subject: "Social Science", marks: 70, total: 80, pct: 87.5, date: "2026-09-28", badge: "School Quarterly" },
      { id: "sch-6", title: "Quarterly Exam", subject: "Artificial Intelligence", marks: 46, total: 50, pct: 92.0, date: "2026-09-30", badge: "School Quarterly" }
    ],
    averagePct: 89.9
  },
  tution: {
    center: "Maths & Science Special Coaching",
    target: "Zero Silly Errors in Proofs & Numericals",
    tests: [
      { id: "tut-1", title: "Sunday Weekly Test", subject: "Mathematics (Triangles BPT)", marks: 21, total: 25, pct: 84.0, date: "2026-10-18", tutorRemark: "Statement wording had minor omissions; construction steps were neat." },
      { id: "tut-2", title: "Sunday Weekly Test", subject: "Science (Chemistry Ch 1 & 2)", marks: 23, total: 25, pct: 92.0, date: "2026-10-25", tutorRemark: "Balanced equations well; remembered pH values." },
      { id: "tut-3", title: "Mid-Week Mock", subject: "Social Science (Nationalism Europe)", marks: 19, total: 25, pct: 76.0, date: "2026-10-21", tutorRemark: "Review Balkan issue and Italian unification dates." }
    ],
    averagePct: 84.0
  },
  home: {
    reviewer: "Mama's Daily Assessments",
    target: "30/30 in Night Tests & Written Presentation",
    tests: [
      { id: "hm-1", title: "Diagnostic Module Test", subject: "Science + Tamil", marks: 27, total: 30, pct: 90.0, date: "2026-10-27", mamaRemark: "Good grasp of concepts. Keep handwriting legible under time limit." },
      { id: "hm-2", title: "Night Assessment Day 1", subject: "Science (Acids) + Tamil (Unit 5)", marks: 30, total: 30, pct: 100.0, date: "2026-10-28", isTonight: true, mamaRemark: "Tonight's Test Paper locked in Mama's Secret Vault (8:30 PM)." }
    ],
    averagePct: 95.0
  }
};

// 4. FOCUS AREAS: WHERE HE NEEDS TO CONCENTRATE
data.focusAreas = {
  redAlert: [
    {
      id: "f-red-1",
      subject: "Mathematics",
      topic: "Triangles - BPT Theorem Statement & Similarity Proofs",
      chapterId: "m6",
      urgency: "CRITICAL",
      reason: "Tuition test marks lost on exact wording of theorem statement; Board weightage is 8-10 Marks.",
      actionTip: "Write the theorem statement 3 times in rough notebook with Given, To Prove, Construction and Reason steps.",
      readLink: "/textbooks/maths/jemh106.pdf",
      qaId: "mqa-m1"
    },
    {
      id: "f-red-2",
      subject: "Science",
      topic: "Carbon Compounds - Saponification, Esterification & Micelle",
      chapterId: "s4",
      urgency: "CRITICAL",
      reason: "Chemical reaction equations often mixed up in tests; high-frequency Board 5M question.",
      actionTip: "Memorize ester sweet fragrance test and soap micelle hydrophobic/hydrophilic ends diagram.",
      readLink: "/textbooks/science/jesc104.pdf",
      qaId: "mqa-s1"
    },
    {
      id: "f-red-3",
      subject: "Tamil",
      topic: "இயல் 5: வினா-விடை 8 வகைகள் & பொருள்கோள் 8 வகைகள்",
      chapterId: "tam5",
      urgency: "TODAY'S MISSION",
      reason: "Tonight's 8:30 PM Night Assessment portion. Needs clear distinction between வினாவெதிர் வினாதல் & உற்றது உரைத்தல்.",
      actionTip: "Review the 6 questions in Mama's Sample Question accordion before 8:30 PM.",
      readLink: "/textbooks/tamil.pdf",
      qaId: "mqa-tam1"
    }
  ],
  amberAlert: [
    {
      id: "f-amb-1",
      subject: "Social Science",
      topic: "Map Pointing (Major Ports & Iron-Steel Plants)",
      chapterId: "sst9",
      urgency: "MODERATE",
      reason: "5 Board Marks guaranteed if practiced on blank India map.",
      actionTip: "Locate Kandla, Tuticorin, Marmagao, Bhilai and Bokaro on map outline."
    },
    {
      id: "f-amb-2",
      subject: "Mathematics",
      topic: "Some Applications of Trigonometry (Heights & Distances)",
      chapterId: "m9",
      urgency: "MODERATE",
      reason: "Double angle elevation problems require neat right-triangle sketches.",
      actionTip: "Always label opposite, adjacent, and use tan 30° / tan 60° values."
    }
  ],
  greenStrengths: [
    { subject: "Mathematics", topic: "Real Numbers (Irrationality Proof by Contradiction)", score: "100% Ready" },
    { subject: "Science", topic: "Chemical Reactions & Balancing Equations", score: "95% Ready" },
    { subject: "English", topic: "First Flight Prose & Reading Comprehension", score: "92% Ready" }
  ]
};

fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
fs.writeFileSync(path.join(__dirname, 'public', 'data.json'), JSON.stringify(data, null, 2), 'utf8');

console.log('✅ Successfully enriched 5 Pillars (Task, Textbook, Model Q&A, Performance 4-Quadrant, Focus Areas)!');
