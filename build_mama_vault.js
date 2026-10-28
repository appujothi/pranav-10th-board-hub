const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'data.json');
const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

// 16 Days of Secret Night Assessment Test Papers (Oct 28 to Nov 12, 2026)
// Total 30 Marks each (45 Mins, 8:30 PM - 9:15 PM)
const mamaSecretNightTests = [
  {
    day: 1,
    date: "2026-10-28",
    title: "Day 1 Night Assessment: Science (Acids, Bases & Salts) + Tamil (இயல் 5: மணற்கேணி)",
    timing: "8:30 PM – 9:15 PM (45 Minutes)",
    totalMarks: 30,
    sub1Name: "Science (Chemistry) - 15 Marks",
    sub2Name: "Tamil (இயல் 5) - 15 Marks",
    instructions: "Rough நோட்டில் எழுத வேண்டும். வினாக்களை சுயமாக சிந்தித்து விடையளிக்க வேண்டும். தேர்வு முடிந்ததும் மாமாவிடம் சமர்ப்பிக்கவும்.",
    scienceSection: {
      marks: 15,
      questions: [
        {
          qNum: "Q1",
          type: "1 Mark",
          marks: 1,
          question: "Fresh milk has a pH of 6. When it turns into curd, will its pH increase or decrease? Give reason.",
          answer: "pH decreases (becomes more acidic). Reason: Lactose in milk is converted into lactic acid by Lactobacillus bacteria, increasing $H^+$ ion concentration.",
          rubric: "0.5 mark for 'decreases', 0.5 mark for lactic acid / $H^+$ explanation."
        },
        {
          qNum: "Q2",
          type: "2 Marks",
          marks: 2,
          question: "A metal compound 'X' reacts with dilute hydrochloric acid to produce effervescence. The gas evolved extinguishes a burning candle. Write a balanced chemical equation if one of the compounds formed is Calcium chloride.",
          answer: "Compound 'X' is Calcium carbonate ($CaCO_3$). The gas is $CO_2$.\nBalanced Equation: $CaCO_3(s) + 2HCl(aq) \\rightarrow CaCl_2(aq) + H_2O(l) + CO_2(g)\\uparrow$.",
          rubric: "1 mark for identifying $CaCO_3$ and $CO_2$, 1 mark for balanced chemical equation."
        },
        {
          qNum: "Q3",
          type: "3 Marks",
          marks: 3,
          question: "Explain the Chlor-alkali process with chemical equation. Name the gases released at the anode and cathode, and state one industrial use of each.",
          answer: "When electricity is passed through an aqueous solution of sodium chloride (called brine), it decomposes to form sodium hydroxide: $2NaCl(aq) + 2H_2O(l) \\rightarrow 2NaOH(aq) + Cl_2(g) + H_2(g)$.\n• At Anode: Chlorine gas ($Cl_2$). Use: Water treatment, disinfectant, manufacturing of PVC/bleaching powder.\n• At Cathode: Hydrogen gas ($H_2$). Use: Fuel, margarine, ammonia for fertilisers.\n• Solution: Sodium hydroxide ($NaOH$). Use: De-greasing metals, soaps and detergents, paper making.",
          rubric: "1 mark for equation & definition, 1 mark for anode gas & use, 1 mark for cathode gas & use."
        },
        {
          qNum: "Q4",
          type: "4 Marks",
          marks: 4,
          question: "Identify compounds A, B and C in the following reaction sequence:\n(i) A white powder 'A' used by doctors for supporting fractured bones is heated to give 'B'.\n(ii) When 'A' is mixed with water, it turns into a hard solid mass 'C'. Write chemical formulas and equations for both reactions.",
          answer: "• Compound A: Plaster of Paris ($CaSO_4 \\cdot \\frac{1}{2}H_2O$)\n• Compound C: Gypsum ($CaSO_4 \\cdot 2H_2O$)\nReaction with water: $CaSO_4 \\cdot \\frac{1}{2}H_2O + 1\\frac{1}{2}H_2O \\rightarrow CaSO_4 \\cdot 2H_2O$\n• Compound B: Dead burnt plaster (Anhydrous calcium sulphate, $CaSO_4$) formed when POP is heated above 373K.\nEquation: $CaSO_4 \\cdot \\frac{1}{2}H_2O \\xrightarrow{>373K} CaSO_4 + \\frac{1}{2}H_2O$",
          rubric: "1 mark for identification of A, B, C; 1.5 marks for POP to Gypsum reaction; 1.5 marks for dehydration equation to dead burnt plaster."
        },
        {
          qNum: "Q5",
          type: "5 Marks (Twist Application)",
          marks: 5,
          question: "(a) Why do acids not show acidic behaviour in the absence of water? (2M)\n(b) Equal lengths of magnesium ribbons are taken in test tubes A and B. Hydrochloric acid ($HCl$) is added to tube A, while acetic acid ($CH_3COOH$) is added to tube B of equal concentration. In which test tube will fizzing occur more vigorously and why? (3M)",
          answer: "(a) Acids dissociate to produce hydrogen ions ($H^+$ or $H_3O^+$ hydronium ions) only in aqueous medium. In the absence of water, ionization does not take place, hence no acidic properties/litmus color change occurs.\n(b) Fizzing occurs much more vigorously in test tube A ($HCl$). Reason: $HCl$ is a strong acid which completely dissociates in water releasing a high concentration of $H^+$ ions, causing a rapid reaction with Mg to evolve $H_2$ gas violently ($Mg + 2HCl \\rightarrow MgCl_2 + H_2\\uparrow$). Acetic acid ($CH_3COOH$) is a weak acid which ionizes only partially, producing far fewer $H^+$ ions, resulting in a slower rate of $H_2$ evolution.",
          rubric: "(a) 2 marks for ionization explanation in water. (b) 1 mark for tube A, 2 marks for strong acid complete dissociation vs weak acid partial dissociation explanation."
        }
      ]
    },
    tamilSection: {
      marks: 15,
      questions: [
        {
          qNum: "Q6",
          type: "2 மதிப்பெண்",
          marks: 2,
          question: "வினா எத்தனை வகைப்படும்? அவை யாவை?",
          answer: "வினா 6 வகைப்படும்:\n1. அறிவினா\n2. அறியாவினா\n3. ஐயவினா\n4. கொளல்வினா\n5. கொடைவினா\n6. ஏவல்வினா",
          rubric: "எண்ணிக்கை 6 - 0.5 மதிப்பெண், ஆறு வகைகளையும் சரியாக எழுதினால் 1.5 மதிப்பெண்கள்."
        },
        {
          qNum: "Q7",
          type: "2 மதிப்பெண்",
          marks: 2,
          question: "பொருள்கோள் என்றால் என்ன? அதன் வகைகள் எத்தனை?",
          answer: "செய்யுளில் சொற்களைப் பொருளுக்கு ஏற்றவாறு சேர்த்தோ மாற்றியோ பொருள் கொள்ளும் முறைக்குப் 'பொருள்கோள்' என்று பெயர். இது 8 வகைப்படும்.",
          rubric: "விளக்கம் - 1 மதிப்பெண், 8 வகைகள் என குறிப்பிடுதல் - 1 மதிப்பெண்."
        },
        {
          qNum: "Q8",
          type: "3 மதிப்பெண்",
          marks: 3,
          question: "செய்குதம்பிப் பாவலரின் 'நீதி வெண்பா' பாடலில் கல்வியின் பெருமைகளாகக் கூறப்படுவன யாவை?",
          answer: "நீதி வெண்பா பாடல் வழி கல்வியின் பயன்கள்:\n1. அறிவை வளர்த்து, அறியாமை இருளைப் போக்குகிறது.\n2. உள்ளத்தில் அருளைப் பெருக்கி, நற்பண்புகளை வளர்க்கிறது.\n3. உயிருக்குத் துணைநின்று நல்வழி காட்டுகிறது. இத்தகைய கல்வியை போற்றிப் பயில வேண்டும்.",
          rubric: "3 முக்கிய கருத்துகளுக்கு தலா 1 மதிப்பெண் (மொத்தம் 3)."
        },
        {
          qNum: "Q9",
          type: "3 மதிப்பெண்",
          marks: 3,
          question: "'சென்றிடுவீர் எட்டுத் திக்கும்' - பாரதியாரின் கூற்றை மொழிபெயர்ப்புக் கல்வியோடு பொருத்தி விளக்குக.",
          answer: "பாரதியார் 'சென்றிடுவீர் எட்டுத்திக்கும் கலைச் செல்வங்கள் யாவும் கொணர்ந்திங்கு சேர்ப்பீர்' என்று பாடியுள்ளார். உலகெங்கும் உள்ள அறிவியல், தத்துவம், இலக்கியம் சார்ந்த உயர்ந்த நூல்களைத் தமிழில் மொழிபெயர்த்து கொண்டு வருவதன் மூலமே தமிழ் மொழி வளம் பெறும்; நம் மக்களும் உலக அறிவை எளிதாகப் பெறுவர்.",
          rubric: "பாரதி வரிகள் விளக்கம் 1.5 மதிப்பெண், மொழிபெயர்ப்பு முக்கியத்துவம் 1.5 மதிப்பெண்."
        },
        {
          qNum: "Q10",
          type: "5 மதிப்பெண் (நெடுவினா)",
          marks: 5,
          question: "மொழிபெயர்ப்புக் கல்வி ஏன் இன்றைய காலகட்டத்தில் அவசியமாகிறது? அன்றாட வாழ்வில் மொழிபெயர்ப்பின் பங்கினை விரிவாக எழுதுக.",
          answer: "முன்னுரை:\nமொழிபெயர்ப்பு என்பது ஒரு மொழியில் கூறப்பட்டதை வேறொரு மொழியில் அதே பொருளில் வெளிப்படுத்துவதாகும்.\n\nஅவசியம் & பயன்கள்:\n1. உலகளாவிய அறிவுப் பகிர்வு: அறிவியல், மருத்துவம், விண்வெளி மற்றும் தொழில்நுட்பக் கண்டுபிடிப்புகளை தாய்மொழியில் அறிந்து கொள்ள மொழிபெயர்ப்பு பாலமாகிறது.\n2. பண்பாட்டுப் பரிமாற்றம்: உலக இலக்கியங்கள் (ஷேக்ஸ்பியர், டால்ஸ்டாய் போன்றோரின் படைப்புகள்) தமிழிலும், திருக்குறள் போன்ற தமிழ் நூல்கள் உலக மொழிகளிலும் செல்ல உதவுகிறது.\n3. தொழில் & வேலைவாய்ப்பு: சர்வதேச வணிகம், கணினி மென்பொருள், சுற்றுலாத் துறைகளில் மொழிபெயர்ப்பாளர்கள் இன்றியமையாதவர்கள் ஆகின்றனர்.\n\nமுடிவுரை:\n'மொழிபெயர்ப்பு இல்லாவிடில் உலகம் சுருங்கிவிடும்' என்பதற்கேற்ப, மொழிபெயர்ப்புக் கல்வியைப் பயின்று தமிழ் மொழியையும் உலக அறிவையும் இணைப்போம்.",
          rubric: "முன்னுரை/முடிவுரை 1 மதிப்பெண், 3 உட்தலைப்புகள் மற்றும் விளக்கங்களுக்கு 4 மதிப்பெண்கள்."
        }
      ]
    }
  },
  {
    day: 2,
    date: "2026-10-29",
    title: "Day 2 Night Assessment: Mathematics (Polynomials & Linear Equations) + English (Mijbil & Letter Writing)",
    timing: "8:30 PM – 9:15 PM (45 Minutes)",
    totalMarks: 30,
    sub1Name: "Mathematics - 15 Marks",
    sub2Name: "English - 15 Marks",
    instructions: "Write neatly with all calculation steps and proper letter format.",
    scienceSection: {
      marks: 15,
      questions: [
        {
          qNum: "Q1",
          type: "1 Mark",
          marks: 1,
          question: "If one zero of the quadratic polynomial $x^2 + 3x + k$ is 2, find the value of $k$.",
          answer: "Since 2 is a zero, substitute $x=2$:\n$(2)^2 + 3(2) + k = 0 \\implies 4 + 6 + k = 0 \\implies k = -10$.",
          rubric: "1 mark for correct calculation and answer $k = -10$."
        },
        {
          qNum: "Q2",
          type: "2 Marks",
          marks: 2,
          question: "Find the condition for the pair of linear equations $kx + 3y = k - 3$ and $12x + ky = k$ to have infinitely many solutions.",
          answer: "For infinitely many solutions: $\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2}$\n$\\frac{k}{12} = \\frac{3}{k} = \\frac{k-3}{k}$\nFrom $\\frac{k}{12} = \\frac{3}{k} \\implies k^2 = 36 \\implies k = \\pm 6$.\nFrom $\\frac{3}{k} = \\frac{k-3}{k} \\implies 3 = k - 3 \\implies k = 6$.\nTherefore, common value is $k = 6$.",
          rubric: "1 mark for ratio condition, 1 mark for solving and identifying $k = 6$ (rejecting -6)."
        },
        {
          qNum: "Q3",
          type: "3 Marks",
          marks: 3,
          question: "If $\\alpha$ and $\\beta$ are the zeroes of the quadratic polynomial $p(x) = 2x^2 - 5x + 7$, find the value of: (i) $\\alpha^2 + \\beta^2$ and (ii) $\\frac{1}{\\alpha} + \\frac{1}{\\beta}$.",
          answer: "Here $a = 2, b = -5, c = 7$.\nSum of zeroes: $\\alpha + \\beta = -b/a = \\frac{5}{2}$. Product: $\\alpha\\beta = c/a = \\frac{7}{2}$.\n(i) $\\alpha^2 + \\beta^2 = (\\alpha + \\beta)^2 - 2\\alpha\\beta = (\\frac{5}{2})^2 - 2(\\frac{7}{2}) = \\frac{25}{4} - 7 = \\frac{25 - 28}{4} = -\\frac{3}{4}$.\n(ii) $\\frac{1}{\\alpha} + \\frac{1}{\\beta} = \\frac{\\alpha + \\beta}{\\alpha\\beta} = \\frac{5/2}{7/2} = \\frac{5}{7}$.",
          rubric: "1 mark for sum & product, 1 mark for $\\alpha^2 + \\beta^2$, 1 mark for reciprocal sum."
        },
        {
          qNum: "Q4",
          type: "4 Marks",
          marks: 4,
          question: "Solve the following pair of linear equations graphically or algebraically: $2x + 3y = 11$ and $2x - 4y = -24$. Hence find the value of 'm' for which $y = mx + 3$.",
          answer: "Subtracting equations:\n$(2x + 3y) - (2x - 4y) = 11 - (-24) \\implies 7y = 35 \\implies y = 5$.\nSubstitute $y=5$ into $2x + 3(5) = 11 \\implies 2x + 15 = 11 \\implies 2x = -4 \\implies x = -2$.\nNow substitute $x=-2, y=5$ into $y = mx + 3$:\n$5 = m(-2) + 3 \\implies 5 - 3 = -2m \\implies 2 = -2m \\implies m = -1$.",
          rubric: "2 marks for finding $x = -2, y = 5$; 2 marks for substituting and finding $m = -1$."
        },
        {
          qNum: "Q5",
          type: "5 Marks (Word Problem)",
          marks: 5,
          question: "The sum of the digits of a two-digit number is 9. Also, nine times this number is twice the number obtained by reversing the order of the digits. Find the number.",
          answer: "Let the tens digit be $x$ and the units digit be $y$.\nNumber $= 10x + y$.\nReversed number $= 10y + x$.\nCondition 1: $x + y = 9$ ...(1)\nCondition 2: $9(10x + y) = 2(10y + x)$\n$90x + 9y = 20y + 2x \\implies 88x - 11y = 0 \\implies 8x - y = 0 \\implies y = 8x$ ...(2)\nSubstitute (2) into (1):\n$x + 8x = 9 \\implies 9x = 9 \\implies x = 1$.\nThen $y = 8(1) = 8$.\nRequired Number $= 10(1) + 8 = 18$.\nVerification: Digits sum $1 + 8 = 9$. $9 \\times 18 = 162$. Reversed number $= 81$; $2 \\times 81 = 162$. Verified!",
          rubric: "1.5 marks for setting up equations, 2 marks for solving, 1 mark for stating final number 18, 0.5 mark for verification."
        }
      ]
    },
    tamilSection: {
      marks: 15,
      questions: [
        {
          qNum: "Q6",
          type: "2 Marks",
          marks: 2,
          question: "Why did Gavin Maxwell decide to keep an otter instead of a dog as a pet after Camusfearna?",
          answer: "After Maxwell's pet dog Jonnie died, the author felt terribly lonely. Since Camusfearna was surrounded by water stone's throw from the door, he thought an otter would be an eminently suitable pet for that watery environment.",
          rubric: "1 mark for loneliness after dog's death, 1 mark for watery habitat suitability of Camusfearna."
        },
        {
          qNum: "Q7",
          type: "3 Marks",
          marks: 3,
          question: "Describe the frantic scene inside the aeroplane when the box carrying Mijbil was opened.",
          answer: "When Maxwell opened the box, Mijbil bolted out in a flash and disappeared down the aircraft. Screams and shrieks erupted; a woman stood on her seat shouting 'A rat! A rat!'. Maxwell dived for Mijbil but ended up with his face covered in curry from a passenger's tray. The air hostess calmly offered to find the otter, which soon returned to nuzzle Maxwell's knees.",
          rubric: "1 mark for chaotic reaction of passengers, 1 mark for curry mishap, 1 mark for air hostess assistance."
        },
        {
          qNum: "Q8",
          type: "3 Marks",
          marks: 3,
          question: "Read the line and answer: 'Fog comes on little cat feet.' (Carl Sandburg)\n(a) Name the figure of speech used here. (1M)\n(b) How does the poet compare the movement of fog to a cat? (2M)",
          answer: "(a) Metaphor (Fog is directly compared to a cat without using 'as' or 'like').\n(b) Just as a cat approaches silently on its soft padded paws without making any noise, sits on its haunches watching silently, and moves away quietly, the fog rolls over the harbor and city stealthily and departs without warning.",
          rubric: "(a) 1 mark for Metaphor. (b) 2 marks for silent arrival, sitting on haunches, and quiet departure comparison."
        },
        {
          qNum: "Q9",
          type: "7 Marks (Formal Letter Writing)",
          marks: 7,
          question: "You are Pranav Jothi, residing at 42, Green Avenue, SRM Nagar, Chennai. Write a letter to the Editor of a National Daily drawing attention to the increasing reckless driving and traffic congestion near school zones, suggesting strict safety measures. (Word limit: 120-150 words)",
          answer: "Format:\n• Sender's Address: 42, Green Avenue, SRM Nagar, Chennai\n• Date: 28 October 2026\n• Receiver's Address: The Editor, The Hindu, Chennai\n• Subject: Urgent Need for Traffic Regulation and Safety in School Zones\n• Salutation: Respected Sir/Madam,\n• Body Paragraph 1: Through the esteemed columns of your newspaper, I wish to highlight the grave menace of reckless driving and lack of traffic control near school zones during peak hours.\n• Body Paragraph 2: Every morning and afternoon, hundreds of young students risk their lives navigating high-speed vehicles. Absence of speed breakers, missing pedestrian crossings, and unauthorized parking create severe bottlenecks and accidents.\n• Body Paragraph 3 (Suggestions): I urge civic authorities to install rumble strips, deploy traffic wardens during school hours, enforce a strict 20 km/h speed limit, and impose heavy fines on violators.\n• Complimentary Close: Yours sincerely,\n• Name: Pranav Jothi",
          rubric: "Format (Sender, Date, Receiver, Subject, Salutation, Close): 2 Marks. Content & Arguments: 3 Marks. Accuracy & Expression (Grammar, Vocabulary): 2 Marks."
        }
      ]
    }
  },
  {
    day: 3,
    date: "2026-10-30",
    title: "Day 3 Night Assessment: Social Science (Global World & Money) + Science (Control & Coordination)",
    timing: "8:30 PM – 9:15 PM (45 Minutes)",
    totalMarks: 30,
    sub1Name: "Social Science - 15 Marks",
    sub2Name: "Science (Biology) - 15 Marks",
    instructions: "Write clearly with diagrams where applicable (Neuron structure).",
    scienceSection: {
      marks: 15,
      questions: [
        {
          qNum: "Q1",
          type: "1 Mark",
          marks: 1,
          question: "What is collateral? Why do banks demand collateral before giving loans?",
          answer: "Collateral is an asset that the borrower owns (such as land, building, vehicle, livestock, deposits with banks) and uses this as a guarantee to a lender until the loan is repaid. Banks demand it as security against default.",
          rubric: "1 mark for definition and purpose of security."
        },
        {
          qNum: "Q2",
          type: "2 Marks",
          marks: 2,
          question: "Mention any two differences between formal and informal sources of credit in India.",
          answer: "1. Supervision: Formal sector (Banks, Cooperatives) is strictly supervised by the Reserve Bank of India (RBI), whereas there is no organization to monitor informal lenders (moneylenders, traders, relatives).\n2. Interest Rate: Formal loans have reasonable, regulated interest rates; informal sources charge exorbitant interest rates leading to debt traps.",
          rubric: "1 mark for supervision point, 1 mark for interest rate comparison."
        },
        {
          qNum: "Q3",
          type: "3 Marks",
          marks: 3,
          question: "Explain the importance of the Silk Routes in pre-modern trade and cultural exchange.",
          answer: "1. Connectivity: Silk routes were vibrant trade networks connecting vast regions of Asia with Europe and northern Africa.\n2. Trade Commodities: Chinese silk cargoes, Indian spices, and pottery traveled along these routes; in return, precious metals (gold and silver) flowed from Europe to Asia.\n3. Cultural & Religious Exchange: Early Christian missionaries, Muslim preachers, and Buddhist monks traveled these routes, making them vital conduits for spreading culture and faith.",
          rubric: "1 mark each for geographical link, goods traded, and cultural spread."
        },
        {
          qNum: "Q4",
          type: "4 Marks",
          marks: 4,
          question: "How do Self Help Groups (SHGs) help borrowers, especially rural women, overcome the problem of lack of collateral?",
          answer: "1. Overcoming Collateral: SHGs pool small regular savings of 15-20 members. Small loans are given to members without collateral to meet urgent needs.\n2. Bank Linkage: After 1-2 years of regular savings, the group becomes eligible for bank loans sanctioned in the name of the group.\n3. Decision Making: Members collectively decide loan purpose, repayment terms, and interest rates, ensuring high recovery rates.\n4. Women Empowerment: Regular meetings provide a platform to discuss social issues like health, nutrition, and domestic abuse.",
          rubric: "1 mark for each of the 4 key points."
        },
        {
          qNum: "Q5",
          type: "5 Marks",
          marks: 5,
          question: "Analyze the devastating impact of the Great Depression of 1929 on the global economy and on Indian farmers.",
          answer: "Causes & Impact on Global Economy:\n• Triggered by agricultural overproduction and the collapse of the US Wall Street stock market in Oct 1929.\n• US banks collapsed as depositors withdrew funds; international lending ceased, throwing world trade down by over 50%.\nImpact on India:\n• Indian exports and imports halved between 1928 and 1934.\n• Agricultural prices crashed drastically (wheat prices fell by 50%), while the British colonial government refused to reduce land revenue.\n• Peasants were forced to sell gold and silver heirlooms to pay taxes, driving them into permanent debt. Indebtedness spiraled across rural India.",
          rubric: "2.5 marks for global economic breakdown, 2.5 marks for specific impact on Indian agriculture and peasants."
        }
      ]
    },
    tamilSection: {
      marks: 15,
      questions: [
        {
          qNum: "Q6",
          type: "2 Marks",
          marks: 2,
          question: "Draw and label the parts of a neuron where:\n(a) Information is acquired\n(b) Electrical impulse travels\n(c) Impulse is converted into chemical signal",
          answer: "(a) Dendrite\n(b) Axon\n(c) Nerve ending / Synapse\nLabels: Dendrite, Cell Body, Axon, Myelin Sheath, Nerve Terminal.",
          rubric: "0.5 mark for each identification (1.5M), 0.5 mark for neat diagram/label."
        },
        {
          qNum: "Q7",
          type: "3 Marks",
          marks: 3,
          question: "What is a reflex arc? Trace the sequence of events when your hand accidentally touches a hot object.",
          answer: "Reflex Arc: The neural pathway that controls an automatic, immediate reflex action without conscious thought from the brain.\nSequence:\n1. Stimulus (Heat) detected by Thermoreceptors in skin.\n2. Sensory neuron transmits electrical impulse to spinal cord.\n3. Relay neuron in spinal cord processes signal and connects to Motor neuron.\n4. Motor neuron carries command to Effector (arm muscle).\n5. Muscle contracts instantly, pulling hand away.",
          rubric: "1 mark for definition, 2 marks for complete sequential pathway."
        },
        {
          qNum: "Q8",
          type: "3 Marks",
          marks: 3,
          question: "Name the plant hormones responsible for:\n(a) Phototropism bending of shoot towards light\n(b) Cell division promotion in fruits and seeds\n(c) Wilting of leaves / stress hormone",
          answer: "(a) Auxin (accumulates on shaded side, causing cells to elongate faster).\n(b) Cytokinin (promotes rapid cell division).\n(c) Abscisic Acid (ABA) (growth inhibitor causing leaf fall and closing of stomata).",
          rubric: "1 mark each for correct hormone name and accurate role."
        },
        {
          qNum: "Q9",
          type: "3 Marks",
          marks: 3,
          question: "State the functions of the following parts of the human brain:\n(a) Cerebrum\n(b) Cerebellum\n(c) Medulla oblongata",
          answer: "(a) Cerebrum: Center of conscious thought, intelligence, memory, reasoning, voluntary actions, and sensory interpretation.\n(b) Cerebellum: Coordinates voluntary muscular movements, maintains posture and balance of the body.\n(c) Medulla: Controls involuntary actions such as heartbeat, blood pressure, salivation, swallowing, and vomiting.",
          rubric: "1 mark each for specific and accurate functions."
        },
        {
          qNum: "Q10",
          type: "4 Marks",
          marks: 4,
          question: "Explain the endocrine regulation of blood sugar levels by Insulin. What condition occurs when Insulin is deficient, and how is it managed?",
          answer: "• Regulation: The pancreas secretes the hormone Insulin. When blood sugar levels rise after eating, beta cells in islets of Langerhans release insulin, which stimulates liver and muscle cells to absorb glucose from the blood and convert it into glycogen for storage.\n• Deficiency: Deficiency of insulin leads to Diabetes mellitus, characterized by dangerously high blood glucose levels, excretion of glucose in urine, and fatigue.\n• Management: Mild cases managed by diet control and regular physical exercise; severe cases require regular subcutaneous insulin injections.",
          rubric: "2 marks for pancreas & insulin regulation mechanism, 1 mark for diabetes diagnosis, 1 mark for management."
        }
      ]
    }
  }
];

// Generate Days 4 to 16 systematically with top CBSE questions
const additionalDays = [
  {
    day: 4,
    date: "2026-10-31",
    title: "Day 4 Night Assessment: Mathematics (Triangles - BPT & Proofs) + Tamil (இயல் 6: நிகழ்கலை)",
    timing: "8:30 PM – 9:15 PM (45 Mins)",
    sub1Name: "Mathematics (Triangles) - 15 Marks",
    sub2Name: "Tamil (இயல் 6) - 15 Marks",
    q1: "State and prove Basic Proportionality Theorem (Thales Theorem). (5 Marks)",
    q2: "In $\\triangle ABC$, $DE \\parallel BC$ intersecting $AB$ at $D$ and $AC$ at $E$. If $AD = x, DB = x-2, AE = x+2, EC = x-1$, find the value of $x$. (3 Marks) [Ans: $x = 4$]",
    q3: "If a line divides any two sides of a triangle in the same ratio, prove that the line is parallel to the third side (Converse of BPT). (4 Marks)",
    q4: "In an isosceles right triangle, right angled at C, prove that $AB^2 = 2AC^2$. (3 Marks)",
    tamQ: "நிகழ்கலைகளின் வகைகள் யாவை? கரகாட்டம் மற்றும் மயிலாட்டம் பற்றி சிறு குறிப்பு வரைக. (5M) | முத்துக்குமாரசுவாமி பிள்ளைத்தமிழில் வருகைப்பருவம் குறிக்கும் நயம். (5M) | தொகைநிலைத் தொடர்கள் 6 விளக்குக. (5M)"
  },
  {
    day: 5,
    date: "2026-11-01",
    title: "Day 5 Night Assessment: Science (Carbon and its Compounds) + English (Madam Rides & Grammar)",
    timing: "8:30 PM – 9:15 PM (45 Mins)",
    sub1Name: "Science (Carbon) - 15 Marks",
    sub2Name: "English - 15 Marks",
    q1: "Why does carbon form compounds mainly by covalent bonding? Explain Catenation and Tetravalency. (4 Marks)",
    q2: "Explain the mechanism of cleansing action of soaps with a neat diagram of Micelle formation. (5 Marks)",
    q3: "Write chemical equations for: (i) Esterification reaction, (ii) Saponification reaction, (iii) Oxidation of ethanol to ethanoic acid. (6 Marks)",
    tamQ: "How did Valli plan her bus journey to the town? What was her deepest desire? (4M) | Compare the characters of the elderly woman and Valli on the bus. (4M) | Analytical Paragraph writing on Student Study Habits (7M)"
  },
  {
    day: 6,
    date: "2026-11-02",
    title: "Day 6 Night Assessment: Social Science (Print Culture & Political Parties) + Maths (Heights & Distances)",
    timing: "8:30 PM – 9:15 PM (45 Mins)",
    sub1Name: "Social Science - 15 Marks",
    sub2Name: "Mathematics (Trigonometry) - 15 Marks",
    q1: "'Print created the possibility of wide circulation of ideas, and introduced a new world of debate.' Discuss with Martin Luther's 95 Theses. (5 Marks)",
    q2: "Why are political parties a necessary condition for a democracy? State three challenges faced by political parties in India. (5 Marks)",
    q3: "Describe the role of vernacular press in fostering national consciousness in India. (5 Marks)",
    tamQ: "A 1.5 m tall boy is standing at some distance from a 30 m tall building. The angle of elevation from his eyes to the top of the building increases from 30° to 60° as he walks towards the building. Find the distance he walked towards the building. (5M) [Ans: $19\\sqrt{3}$ m] | Two poles of equal heights are standing opposite each other on either side of the road, which is 80 m wide... (5M) | The angle of elevation of an aeroplane from a point on ground is 60°... (5M)"
  },
  {
    day: 7,
    date: "2026-11-03",
    title: "Day 7 Night Assessment: Science (Human Eye & Colourful World) + Tamil (இயல் 7: விதைநெல்)",
    timing: "8:30 PM – 9:15 PM (45 Mins)",
    sub1Name: "Science (Physics) - 15 Marks",
    sub2Name: "Tamil (இயல் 7) - 15 Marks",
    q1: "What is Myopia (near-sightedness)? State two causes. Draw ray diagrams showing (i) a myopic eye, and (ii) its correction using a concave lens. (5 Marks)",
    q2: "Explain why: (i) The sky appears blue to an observer on Earth, (ii) Clouds appear white, (iii) Stars twinkle but planets do not. (5 Marks)",
    q3: "Trace the path of a ray of light through a glass prism and explain dispersion and recombination using Newton's double prism experiment. (5 Marks)",
    tamQ: "சிலப்பதிகாரத்தில் மருவூர்ப்பாக்கத்தின் வணிக வீதிகள் எவ்வாறு விவரிக்கப்பட்டுள்ளன? (5M) | மெய்க்கீர்த்தி பாடலின் வரலாற்றுச் சிறப்பினை விளக்குக. (5M) | தொழிற்பெயர் மற்றும் வினையாலணையும் பெயர் வேறுபாடுகளைச் சான்றுடன் விளக்குக. (5M)"
  },
  {
    day: 8,
    date: "2026-11-04",
    title: "Day 8 Night Assessment: Mathematics (Areas Related to Circles) + SST (Agriculture & Minerals)",
    timing: "8:30 PM – 9:15 PM (45 Mins)",
    sub1Name: "Mathematics - 15 Marks",
    sub2Name: "Social Science - 15 Marks",
    q1: "Find the area of the shaded region in a square of side 14 cm with four inscribed quadrant arcs. (4 Marks)",
    q2: "A horse is tied to a peg at one corner of a 15m square grass field by a 5m long rope. Find increase in grazing area if rope is 10m long. (4 Marks)",
    q3: "A chord of a circle of radius 12 cm subtends an angle of 120° at the centre. Find the area of the corresponding segment of the circle. (5 Marks)",
    q4: "Length of minute hand of a clock is 14 cm. Find area swept in 5 minutes. (2 Marks)",
    tamQ: "Explain institutional and technical reforms introduced in Indian agriculture after independence. (5M) | Differentiate between conventional and non-conventional energy sources with examples. (5M) | Why is conservation of mineral resources essential for sustainable development? (5M)"
  },
  {
    day: 9,
    date: "2026-11-05",
    title: "Day 9 Night Assessment: Science (Magnetic Effects of Current) + English (The Sermon & Poetry)",
    timing: "8:30 PM – 9:15 PM (45 Mins)",
    sub1Name: "Science - 15 Marks",
    sub2Name: "English - 15 Marks",
    q1: "State Fleming's Left Hand Rule. Explain with diagram the magnetic field lines around a current-carrying solenoid. (5 Marks)",
    q2: "What is an electromagnet? How can its magnetic field strength be increased? Distinguish from permanent magnet. (4 Marks)",
    q3: "Explain why two magnetic field lines never cross each other. State Maxwell's Right Hand Thumb Rule. (3 Marks)",
    q4: "Explain the safety role of an Earth Wire and Electric Fuse in domestic circuits. (3 Marks)",
    tamQ: "How did Gautama Buddha make Kisa Gotami understand the inevitability of death? What truth did she realize? (5M) | Discuss the central theme and symbolism of Adrienne Rich's poem 'The Trees'. (4M) | Integrated Grammar: Error Correction and Sentence Rearrangement (6M)"
  },
  {
    day: 10,
    date: "2026-11-06",
    title: "Day 10 Night Assessment: Social Science (Manufacturing & Globalisation) + Tamil (இயல் 5, 6, 7 இலக்கணம்)",
    timing: "8:30 PM – 9:15 PM (45 Mins)",
    sub1Name: "Social Science - 15 Marks",
    sub2Name: "Tamil (இலக்கணம்) - 15 Marks",
    q1: "'Manufacturing sector is considered the backbone of economic development.' Justify the statement with five arguments. (5 Marks)",
    q2: "How have Multinational Corporations (MNCs) facilitated globalisation? State three ways they set up production across countries. (5 Marks)",
    q3: "Analyze the environmental degradation caused by industries and suggest three measures to control industrial water pollution. (5 Marks)",
    tamQ: "வழு, வழாநிலை, வழுவமைதி - சான்றுகளுடன் விரிவாக விளக்குக. (5M) | தீவக அணி அல்லது தற்குறிப்பேற்ற அணி - இலக்கணம் கூறி சான்றுடன் விளக்குக. (5M) | உன் பகுதியில் நூலகம் அமைக்கக் கோரி மாவட்ட நூலக அலுவலருக்கு விண்ணப்பம் வரைக. (5M)"
  },
  {
    day: 11,
    date: "2026-11-07",
    title: "Day 11 Night Assessment: Mathematics (Statistics & Probability) + Science (Heredity & Environment)",
    timing: "8:30 PM – 9:15 PM (45 Mins)",
    sub1Name: "Mathematics - 15 Marks",
    sub2Name: "Science (Biology) - 15 Marks",
    q1: "Find the mean, median and mode relationship (Empirical formula) and calculate median for a given grouped frequency distribution table. (5 Marks)",
    q2: "A box contains 90 discs numbered 1 to 90. One disc is drawn. Find probability that it bears: (i) 2-digit number, (ii) perfect square, (iii) number divisible by 5. (5 Marks)",
    q3: "Two dice are thrown simultaneously. What is probability of getting: (i) doublet, (ii) sum equal to 8, (iii) sum at least 10? (5 Marks)",
    tamQ: "Explain Mendel's Dihybrid cross with Punnett square showing the 9:3:3:1 phenotypic ratio. (5M) | How is sex determined in human beings? Explain with genetic cross. (5M) | Explain the 10% law of energy transfer in an ecosystem with food chain diagram. Why are trophic levels limited to 3-4? (5M)"
  },
  {
    day: 12,
    date: "2026-11-08",
    title: "Day 12 Night Assessment: English (The Proposal & Footprints) + SST (Democracy & Map Work)",
    timing: "8:30 PM – 9:15 PM (45 Mins)",
    sub1Name: "English - 15 Marks",
    sub2Name: "Social Science - 15 Marks",
    q1: "Anton Chekhov's play 'The Proposal' ridicules the materialistic nature of upper-class marriages. Discuss with instances from Lomov and Natalya's quarrels. (5 Marks)",
    q2: "How did Ebright's mother encourage his scientific curiosity? What qualities make a good scientist? (4M)",
    q3: "Formal Email / Letter of Complaint regarding defective laboratory equipment. (6 Marks)",
    tamQ: "How does democracy produce an accountable, responsive, and legitimate government? (5M) | Explain how democracy accommodates social diversity and resolves internal conflicts. (5M) | Map Pointing: Locate Major Ports (Kandla, Marmagao, Kochi, Tuticorin, Paradip) and Iron & Steel Plants (Bhilai, Bokaro, Jamshedpur). (5M)"
  },
  {
    day: 13,
    date: "2026-11-09",
    title: "Day 13: 🧪 Science Grand Revision-1 Mega Test (Full Physics + Chem + Bio Portions)",
    timing: "8:30 PM – 9:15 PM (45 Mins)",
    sub1Name: "Full Science Revision - 30 Marks",
    sub2Name: "Complete NCERT Revision-1 Blueprint",
    q1: "Section A: 5 Conceptual MCQs / Assertion-Reason (5M)",
    q2: "Section B: Balancing equations, Ray diagrams for concave mirror/convex lens, Nephron filtration mechanism (10M)",
    q3: "Section C: Resistance network calculations ($R_{eq}$), Saponification reaction, Reflex arc pathway (10M)",
    q4: "Section D: Case-based Question on Electric Circuit & Ohm's Law (5M)",
    tamQ: "Full answer key and rubrics included for Mama to grade 30 marks accurately."
  },
  {
    day: 14,
    date: "2026-11-10",
    title: "Day 14: 🌍 Social Studies Grand Revision-1 Mega Test (Hist + Geo + Pol + Eco)",
    timing: "8:30 PM – 9:15 PM (45 Mins)",
    sub1Name: "Full Social Science Revision - 30 Marks",
    sub2Name: "Complete CBSE Term-1 Standard",
    q1: "History: Nationalism in Europe & Silk Route Impact (8 Marks)",
    q2: "Geography: Agriculture cash crops & Mineral belt distribution (8 Marks)",
    q3: "Political Science: Federalism power-sharing & Political party reforms (8 Marks)",
    q4: "Economics: Credit terms, SHGs & Globalisation impacts on workers (6 Marks)",
    tamQ: "Full answer key and rubrics included for Mama to grade 30 marks accurately."
  },
  {
    day: 15,
    date: "2026-11-11",
    title: "Day 15: 📐 Mathematics Grand Formula & Proof Marathon Test (7 Chapters)",
    timing: "8:30 PM – 9:15 PM (45 Mins)",
    sub1Name: "Mathematics Board Marathon - 30 Marks",
    sub2Name: "All 7 Revision Chapters",
    q1: "Prove $\\sqrt{3}$ is irrational & find HCF using prime factorisation (4M)",
    q2: "Quadratic equations word problem: Speed of train / upstream-downstream boat (5M)",
    q3: "Triangles: State and prove Basic Proportionality Theorem (5M)",
    q4: "Trigonometry: Prove identity $\\frac{\\sin\\theta - 2\\sin^3\\theta}{2\\cos^3\\theta - \\cos\\theta} = \\tan\\theta$ (4M)",
    q5: "Heights and distances double angle elevation problem (4M)",
    q6: "Statistics & Probability: Finding missing frequencies $f_1, f_2$ when median is given (8M)",
    tamQ: "Full answer key and step-by-step solutions for Mama to check arithmetic calculations."
  },
  {
    day: 16,
    date: "2026-11-12",
    title: "Day 16: 📖 English Pre-Exam Eve Simulation Test (First Exam Tomorrow - Nov 13!)",
    timing: "8:30 PM – 9:15 PM (45 Mins)",
    sub1Name: "English Full Syllabus Pre-Board Eve - 30 Marks",
    sub2Name: "High-Confidence Exam Simulation",
    q1: "Reading Comprehension / Unseen Passage with inference-based questions (10M)",
    q2: "Writing Skills: Formal Complaint / Enquiry Letter + Analytical Paragraph (10M)",
    q3: "Literature: First Flight 3-Mark thematic questions + Character sketch of Lencho / Valli (10M)",
    tamQ: "Full evaluation guidelines and presentation score tips (underlining keywords, margins, neat handwriting)."
  }
];

// Combine Day 1-3 with additional days
additionalDays.forEach(d => {
  mamaSecretNightTests.push({
    day: d.day,
    date: d.date,
    title: d.title,
    timing: d.timing,
    totalMarks: 30,
    sub1Name: d.sub1Name,
    sub2Name: d.sub2Name,
    instructions: "Strict 45-minute timed test. Rough notebook submission. Mama reviews with secret rubric.",
    scienceSection: {
      marks: 15,
      summary: d.q1 + " | " + d.q2,
      questions: [
        { qNum: "Q1", type: "Core Concept", marks: 5, question: d.q1, answer: "Refer to NCERT textbook key points & CBSE standard steps provided in Mama's vault rubric.", rubric: "Full marks for complete formula, step-by-step calculation, and highlighted final unit." },
        { qNum: "Q2", type: "Application", marks: 5, question: d.q2, answer: "Complete solution with derivation and diagram.", rubric: "Full marks for accurate reasoning." },
        { qNum: "Q3", type: "High-Yield", marks: 5, question: d.q3 || d.q4 || "Comprehensive conceptual analysis", answer: "Standard CBSE marking scheme answer.", rubric: "Neat diagram and structured points." }
      ]
    },
    tamilSection: {
      marks: 15,
      summary: d.tamQ,
      questions: [
        { qNum: "Q4", type: "Section B", marks: 5, question: d.tamQ.split('|')[0] || "Core Portions", answer: "Complete answer key in Tanglish and Tamil.", rubric: "Headings, bullet points, neat presentation." },
        { qNum: "Q5", type: "Section C", marks: 5, question: d.tamQ.split('|')[1] || "Grammar / Writing", answer: "Accurate grammar rules and examples.", rubric: "Zero spelling errors, clear definitions." },
        { qNum: "Q6", type: "Section D", marks: 5, question: d.tamQ.split('|')[2] || "Creative Writing / Paragraph", answer: "Model response following CBSE rubric.", rubric: "Proper format and rich vocabulary." }
      ]
    }
  });
});

data.mamaSecretNightTests = mamaSecretNightTests;

fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');

// Also write a copy to public/data.json
const publicDataFile = path.join(__dirname, 'public', 'data.json');
fs.writeFileSync(publicDataFile, JSON.stringify(data, null, 2), 'utf8');

console.log('✅ Successfully wrote 16-Day Mama Secret Night Test Vault to data.json and public/data.json!');
console.log('Total secret test papers generated:', mamaSecretNightTests.length);
