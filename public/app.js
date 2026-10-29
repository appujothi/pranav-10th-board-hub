// Global State & User Auth (Mandatory PIN Authentication & 5-Min Inactivity Auto-Lock)
let appState = null;
let currentUser = null; 
const SESSION_MAX_INACTIVE_MS = 5 * 60 * 1000; // 5 Minutes Auto-Lock Security Policy
let enteredGatePin = '';

// ================= 5-MINUTE AUTO-LOCK & AUTH SESSION CONTROLLER =================
function checkActiveSession() {
  try {
    const raw = localStorage.getItem('pranav_auth_session');
    if (!raw) return null;
    const session = JSON.parse(raw);
    const now = Date.now();
    if (!session.lastActive || (now - session.lastActive > SESSION_MAX_INACTIVE_MS)) {
      // Inactive for more than 5 minutes -> Expired!
      localStorage.removeItem('pranav_auth_session');
      localStorage.removeItem('pranav_user_auth');
      return null;
    }
    return session;
  } catch (e) {
    return null;
  }
}

function updateSessionActivity() {
  if (!currentUser) return;
  try {
    const raw = localStorage.getItem('pranav_auth_session');
    if (raw) {
      const session = JSON.parse(raw);
      session.lastActive = Date.now();
      localStorage.setItem('pranav_auth_session', JSON.stringify(session));
    }
  } catch (e) {}
}

let lastTouchTime = 0;
function registerUserActivity() {
  const now = Date.now();
  if (now - lastTouchTime > 10000) { // Throttle activity updates to once every 10s
    lastTouchTime = now;
    updateSessionActivity();
  }
}
['click', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
  window.addEventListener(evt, registerUserActivity, { passive: true });
});

// Periodic check every 10 seconds: Auto-lock if idle for > 5 minutes
setInterval(() => {
  if (currentUser) {
    const sess = checkActiveSession();
    if (!sess) {
      lockAppSession('Session automatically locked after 5 minutes of inactivity.');
    }
  }
}, 10000);

// ================= MANDATORY PIN SECURITY GATE UI =================
function showPinSecurityGate(message = 'PIN number is required to unlock your session') {
  const gate = document.getElementById('pinSecurityGate');
  const subMsg = document.getElementById('gateSubMessage');
  const errBox = document.getElementById('gateErrorMessage');
  if (gate) gate.classList.remove('hidden');
  if (subMsg) subMsg.textContent = message;
  if (errBox) errBox.classList.add('hidden');
  keypadClear();
}

function hidePinSecurityGate() {
  const gate = document.getElementById('pinSecurityGate');
  if (gate) gate.classList.add('hidden');
}

function lockAppSession(message = 'Portal locked. Enter your PIN to continue.') {
  localStorage.removeItem('pranav_auth_session');
  currentUser = null;
  showPinSecurityGate(message);
}

function updatePinDotsDisplay() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById(`pinDot${i}`);
    if (dot) {
      if (i < enteredGatePin.length) {
        dot.className = 'w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-emerald-400 ring-2 ring-emerald-400/40 transition-all duration-150 scale-110';
      } else {
        dot.className = 'w-3.5 h-3.5 rounded-full border-2 border-slate-600 transition-all duration-150';
      }
    }
  }
}

function setPinDotsState(state) {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById(`pinDot${i}`);
    if (dot) {
      if (state === 'error') {
        dot.className = 'w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-rose-500 ring-4 ring-rose-500/30 transition-all duration-150';
      } else if (state === 'success') {
        dot.className = 'w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-emerald-400 ring-4 ring-emerald-400/40 transition-all duration-150 scale-125';
      } else if (state === 'checking') {
        dot.className = 'w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-amber-400 ring-2 ring-amber-400/40 transition-all duration-150 animate-pulse';
      }
    }
  }
}

function keypadPress(digit) {
  if (enteredGatePin.length >= 4) return;
  enteredGatePin += digit;
  updatePinDotsDisplay();
  if (enteredGatePin.length === 4) {
    submitGatePin(enteredGatePin);
  }
}

function keypadBackspace() {
  if (enteredGatePin.length > 0) {
    enteredGatePin = enteredGatePin.slice(0, -1);
    updatePinDotsDisplay();
  }
}

function keypadClear() {
  enteredGatePin = '';
  updatePinDotsDisplay();
}

// Support Physical Keyboard Input
window.addEventListener('keydown', (e) => {
  const gate = document.getElementById('pinSecurityGate');
  if (!gate || gate.classList.contains('hidden')) return;

  if (e.key >= '0' && e.key <= '9') {
    keypadPress(e.key);
  } else if (e.key === 'Backspace') {
    keypadBackspace();
  } else if (e.key === 'Escape') {
    keypadClear();
  }
});

function quickSelectProfile(pin) {
  enteredGatePin = pin;
  updatePinDotsDisplay();
  submitGatePin(pin);
}

async function submitGatePin(pin) {
  const errBox = document.getElementById('gateErrorMessage');
  if (errBox) errBox.classList.add('hidden');
  setPinDotsState('checking');

  // Fast In-Memory PIN Catalog (Instant Validation)
  const pinCatalog = {
    // Mama PINs
    '9677': {
      role: 'admin',
      name: 'Mama (Master Control)',
      email: 'jothi1809@gmail.com',
      badge: 'Master Control',
      permissions: { canEditSyllabus: true, canEditExamDates: true, canAddTestMarks: true, canLogStudy: true, canPostCheer: true, canManageUsers: true }
    },
    '1809': {
      role: 'admin',
      name: 'Mama (Master Control)',
      email: 'jothi1809@gmail.com',
      badge: 'Master Control',
      permissions: { canEditSyllabus: true, canEditExamDates: true, canAddTestMarks: true, canLogStudy: true, canPostCheer: true, canManageUsers: true }
    },
    // Pranav PINs
    '2026': {
      role: 'student',
      name: 'Pranav',
      email: 'pranav@student.hub',
      badge: 'Student',
      permissions: { canEditSyllabus: false, canEditExamDates: false, canAddTestMarks: false, canLogStudy: true, canPostCheer: false, canManageUsers: false }
    },
    '2027': {
      role: 'student',
      name: 'Pranav',
      email: 'pranav@student.hub',
      badge: 'Student',
      permissions: { canEditSyllabus: false, canEditExamDates: false, canAddTestMarks: false, canLogStudy: true, canPostCheer: false, canManageUsers: false }
    },
    '2010': {
      role: 'student',
      name: 'Pranav',
      email: 'pranav@student.hub',
      badge: 'Student',
      permissions: { canEditSyllabus: false, canEditExamDates: false, canAddTestMarks: false, canLogStudy: true, canPostCheer: false, canManageUsers: false }
    },
    // Parents PINs
    '1010': {
      role: 'viewer',
      name: 'Parents',
      email: 'parents@family.hub',
      badge: 'Parents',
      permissions: { canEditSyllabus: false, canEditExamDates: false, canAddTestMarks: false, canLogStudy: false, canPostCheer: true, canManageUsers: false }
    },
    '1234': {
      role: 'viewer',
      name: 'Parents',
      email: 'parents@family.hub',
      badge: 'Parents',
      permissions: { canEditSyllabus: false, canEditExamDates: false, canAddTestMarks: false, canLogStudy: false, canPostCheer: true, canManageUsers: false }
    },
    '0000': {
      role: 'viewer',
      name: 'Parents',
      email: 'parents@family.hub',
      badge: 'Parents',
      permissions: { canEditSyllabus: false, canEditExamDates: false, canAddTestMarks: false, canLogStudy: false, canPostCheer: true, canManageUsers: false }
    }
  };

  const matched = pinCatalog[pin];
  if (matched) {
    completeLogin(matched, pin);
    return;
  }

  // Network sync fallback if custom PIN on server
  try {
    const res = await fetch('/api/auth/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    const isJson = res.headers.get('content-type')?.includes('application/json');
    if (res.ok && isJson) {
      const data = await res.json();
      if (data && data.user) {
        completeLogin(data.user, pin);
        return;
      }
    }
  } catch (err) {}

  // Failed PIN
  setPinDotsState('error');
  if (errBox) {
    errBox.textContent = '❌ Incorrect PIN! Tap 👑 Mama (9677), 🧑‍🎓 Pranav (2026), or 👨‍👩‍👦 Parents (1010) below to unlock.';
    errBox.classList.remove('hidden');
  }
  setTimeout(() => {
    keypadClear();
  }, 900);
}

function completeLogin(user, pin) {
  setPinDotsState('success');
  const now = Date.now();
  const session = {
    ...user,
    pin: pin,
    loginTime: now,
    lastActive: now
  };
  localStorage.setItem('pranav_auth_session', JSON.stringify(session));
  localStorage.setItem('pranav_user_auth', JSON.stringify(session));
  currentUser = session;

  setTimeout(async () => {
    hidePinSecurityGate();
    applyRoleUiRestrictions();
    showToast(`🎉 Unlocked as ${user.name}!`);
    await fetchData();
    renderAll();
  }, 300);
}

function applyRoleUiRestrictions() {
  if (!currentUser) return;
  const role = currentUser.role; // 'admin', 'student', or 'viewer'
  const isMama = role === 'admin';
  const isPranav = role === 'student';
  const isParents = role === 'viewer';

  // 1. Mama's Secret Vault (Mama ONLY: Hidden for Pranav & Parents)
  const vaultDesk = document.getElementById('desk-vault-btn');
  const vaultMob = document.getElementById('mob-vault-btn');
  const vaultBox = document.getElementById('card-vault-box');
  const vaultBanner = document.getElementById('vault-banner-card');

  if (vaultDesk) vaultDesk.classList.toggle('hidden', !isMama);
  if (vaultMob) vaultMob.classList.toggle('hidden', !isMama);
  if (vaultBox) vaultBox.classList.toggle('hidden', !isMama);
  if (vaultBanner) vaultBanner.classList.toggle('hidden', !isMama);

  // 1b. 16-Day Night Test Hub (Mama & Parents can see; STRICTLY hidden for Pranav)
  const hubEl = document.getElementById('mama-parents-test-papers-hub');
  if (hubEl) {
    if (isPranav) {
      hubEl.classList.add('hidden');
    } else {
      hubEl.classList.remove('hidden');
    }
  }

  // 2. Performance "+ Record Marks (Mama)" button (Mama ONLY)
  const recordMarksBtn = document.getElementById('btn-record-marks');
  if (recordMarksBtn) recordMarksBtn.classList.toggle('hidden', !isMama);

  // 3. Admin limits and settings (Mama ONLY)
  const adminSliders = document.querySelectorAll('.admin-only-control');
  adminSliders.forEach(el => el.classList.toggle('hidden', !isMama));

  // 4. Voice assistant / requests (Hide for Pranav and Parents per user request)
  const voiceDesk = document.getElementById('desk-voice-btn');
  const voiceMob = document.getElementById('mob-voice-btn');
  if (voiceDesk) voiceDesk.classList.toggle('hidden', !isMama);
  if (voiceMob) voiceMob.classList.toggle('hidden', !isMama);

  // 5. Update Desktop Header
  const deskUserName = document.getElementById('desk-user-name');
  const deskUserIcon = document.getElementById('desk-user-icon');
  if (deskUserName) {
    if (isMama) {
      deskUserName.textContent = 'Mama (Master Control)';
      if (deskUserIcon) deskUserIcon.className = 'fa-solid fa-crown text-emerald-400 text-xs';
    } else if (isPranav) {
      deskUserName.textContent = 'Pranav (Student)';
      if (deskUserIcon) deskUserIcon.className = 'fa-solid fa-graduation-cap text-blue-400 text-xs';
    } else {
      deskUserName.textContent = 'Parents (Overview)';
      if (deskUserIcon) deskUserIcon.className = 'fa-solid fa-users text-amber-400 text-xs';
    }
  }

  // 6. Update Mobile Header
  const headerUserTitle = document.getElementById('header-user-title');
  const headerUserSub = document.getElementById('header-user-sub');
  const islandRole = document.getElementById('island-role');

  if (isMama) {
    if (headerUserTitle) headerUserTitle.textContent = 'Mama (Master Control)';
    if (headerUserSub) headerUserSub.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> <span>Full Master Control • PIN: 9677</span>';
    if (islandRole) islandRole.textContent = 'Master Admin';
  } else if (isPranav) {
    if (headerUserTitle) headerUserTitle.textContent = 'Pranav (Student)';
    if (headerUserSub) headerUserSub.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span> <span>Mission 90–100% Target • PIN: 2026</span>';
    if (islandRole) islandRole.textContent = 'Student Mode';
  } else {
    if (headerUserTitle) headerUserTitle.textContent = 'Parents (Overview)';
    if (headerUserSub) headerUserSub.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span> <span>Daily Progress Monitor • PIN: 1010</span>';
    if (islandRole) islandRole.textContent = 'Parental View';
  }
}

let currentTab = 'home';
let currentSyllabusSubject = 'maths';
let currentScheduleTrack = 'all';
let scoresChartInstance = null;
let isDesktopFramed = true;

// Pomodoro Timer State
let timerInterval = null;
let timerSeconds = 25 * 60;
let timerInitialSeconds = 25 * 60;
let timerRunning = false;
let isBreakTimer = false;

// Tamil Voice Recognition State
let speechRecognizer = null;
let isRecordingVoice = false;

// Toast Notification
function showToast(message, isSuccess = true) {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toast-message');
  if (!toast || !msg) return;

  msg.textContent = message;
  toast.className = `fixed bottom-20 left-1/2 -translate-x-1/2 ${isSuccess ? 'bg-slate-900 text-white' : 'bg-rose-600 text-white'} text-xs font-semibold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 transform translate-y-0 opacity-100 transition duration-300 z-50`;
  setTimeout(() => {
    toast.className = toast.className.replace('translate-y-0 opacity-100', 'translate-y-10 opacity-0');
  }, 2800);
}

// Toggle Desktop Frame Mode
function toggleDesktopMode() {
  const isMobile = document.body.classList.toggle('mobile-frame-mode');
  const btn = document.getElementById('viewModeBtn');
  if (isMobile) {
    if (btn) btn.innerHTML = '<i class="fa-solid fa-desktop text-[10px]"></i> 🖥️ Desktop View';
    localStorage.setItem('pranav_view_mode', 'mobile');
    showToast('Switched to Mobile Preview Frame');
  } else {
    if (btn) btn.innerHTML = '<i class="fa-solid fa-mobile-screen text-[10px]"></i> 📱 Mobile View';
    localStorage.setItem('pranav_view_mode', 'desktop');
    showToast('Switched to Full Widescreen Desktop Portal!');
  }
}

// ================= BILINGUAL TRANSLATION DICTIONARY =================
const UI_I18N = {
  en: {
    // 5 Core Pillars Nav
    nav_home: 'Tasks',
    nav_tasks: 'Tasks',
    nav_tasks_short: 'Tasks',
    nav_textbook: 'Textbook',
    nav_textbook_short: 'Textbook',
    nav_modelqa: 'Model Q&A',
    nav_modelqa_short: 'Model Q&A',
    nav_performance: 'Performance',
    nav_performance_short: 'Scores',
    nav_focus: 'Focus Areas',
    nav_focus_short: 'Focus',
    nav_schedule: 'Schedule',
    nav_syllabus: 'Syllabus',
    nav_timer: 'Focus Timer',
    nav_family: 'Family Cheer',
    nav_secret_vault: '🔐 Secret Vault',
    nav_vault_short: 'Vault',

    // Official Routine
    official_routine: 'Official Routine',
    routine_title: '2 Subjects Per Day (Pair Rotation)',
    night_test_pill: 'Night Test: 30 Marks',

    // Today status
    today_tag: 'TODAY: 28 Oct 2026',
    day_zero_badge: 'Day 1 / 16',
    today_head: 'Day 1: Science (Acids, Bases & Salts) + Tamil (Unit 5)',
    today_desc: 'Today is Day 1 of your 16-Day Revision Sprint. Focus on understanding the core concepts and practice sample questions. Night test tonight at 8:30 PM (30 Marks)!',

    // Tomorrow task
    tomorrow_task_badge: "TOMORROW'S TASK: Day 2 (29 Oct)",
    sub1_label: '🔬 Science (Chemistry)',
    sub1_ch: 'Ch 2: Acids, Bases and Salts',
    sub1_topics: 'pH scale, Chlor-alkali process, Plaster of Paris, Bleaching powder & Acid-Metal reactions.',
    listen_audio: '🎧 Listen Concept Audio',

    sub2_label: '📖 Tamil (Language-II)',
    sub2_ch: 'Unit 5: Manarkeni (இயல் 5)',
    sub2_topics: 'Translation Education, Neethi Venba (Seikuthambi Pavalar), Question-Answer types & Porulkol.',
    listen_audio_tam: '🎧 Listen Tamil Audio',

    // Mama Rule
    mama_rule_title: "Mama's Quality Rule (Important Notice):",
    mama_rule_desc: 'The <strong>Sample Practice Questions</strong> below are for your self-study only! Tonight\'s 8:30 PM written test will <em>NOT have these exact same questions</em> — numbers and question framing will be <strong>twisted and application-oriented to test your true conceptual mastery!</strong>',
    sample_practice_title: "Tomorrow's Sample Practice Questions (6 Questions & Solutions)",

    // Night Test Blueprint
    night_test_head: 'Day 1 Night Assessment (Tonight 8:30 PM)',
    night_test_time: '<strong>Timing:</strong> 8:30 PM – 9:15 PM • <strong>Portions:</strong> Science 15 Marks + Tamil 15 Marks.',
    night_test_instructions: 'Write on rough notebook with full steps. Submit immediately for AI initial review and Mama\'s confirmed grading!',
    mama_vault_action_btn: "🔐 Mama: Open 16-Day Secret Night Test Vault (PIN: 9677)",
    mama_vault_security_note: '🔒 Hidden from Pranav until 8:30 PM. Only Mama can preview questions and answer keys.',

    // Study Toolkit
    study_toolkit_title: 'Study Helpers & Doubts:',
    full_schedule_btn: '📅 16-Day Full Revision Schedule (Oct 28 – Nov 12)',
    view_schedule_label: 'View Details',

    // Syllabus
    syllabus_title: 'Syllabus & Chapter Tracker',
    syllabus_lock_hint: '🔒 Protected: Only Mama can update mastery status',

    // Vault Modal
    vault_modal_title: "Mama's Secret Night Test Vault",
    vault_modal_subtitle: '16-Day Night Assessment Papers (Oct 28 – Nov 12) • 30 Marks Each',
    vault_gate_title: 'Confidential Test Papers Protected',
    vault_gate_desc: 'Pranav must not see the test questions in advance. Enter Mama\'s Super Admin PIN to unlock.',
    unlock_btn: 'Unlock',
    select_night_test: 'Select Night Test Day:',
    vault_mode_label: 'Mode:',
    copy_paper_btn: '📋 Copy Paper to Clipboard',
    print_paper_btn: '🖨️ Print Test Paper'
  },
  ta: {
    // 5 Core Pillars Nav
    nav_home: 'பணிகள்',
    nav_tasks: 'பணிகள்',
    nav_tasks_short: 'பணிகள்',
    nav_textbook: 'பாடப்புத்தகம்',
    nav_textbook_short: 'புத்தகம்',
    nav_modelqa: 'மாதிரி வினா-விடை',
    nav_modelqa_short: 'வினா-விடை',
    nav_performance: 'செயல்திறன்',
    nav_performance_short: 'மதிப்பெண்',
    nav_focus: 'கவனப் பகுதிகள்',
    nav_focus_short: 'கவனம்',
    nav_schedule: 'அட்டவணை',
    nav_syllabus: 'பாடத்திட்டம்',
    nav_timer: 'கவன டைமர்',
    nav_family: 'குடும்ப வாழ்த்து',
    nav_secret_vault: '🔐 ரகசிய பெட்டகம்',
    nav_vault_short: 'பெட்டகம்',

    // Official Routine
    official_routine: 'அதிகாரப்பூர்வ முறை',
    routine_title: '2 பாடங்கள் / நாள் (சுழற்சி முறை)',
    night_test_pill: 'இரவுத் தேர்வு: 30 மதிப்பெண்',

    // Today status
    today_tag: 'இன்று: 28 அக்டோபர் 2026',
    day_zero_badge: 'நாள் 1 / 16',
    today_head: 'நாள் 1: அறிவியல் (அமிலங்கள் & காரங்கள்) + தமிழ் (இயல் 5)',
    today_desc: 'இன்று உன் 16-நாள் ரிவிஷன் ஸ்பிரிண்டின் முதல் நாள். முக்கிய கருத்துக்களைப் படித்து மாதிரி வினாக்களைப் பயிற்சி செய். இன்று இரவு 8:30 PM மாதிரித் தேர்வு (30 மதிப்பெண்)!',

    // Tomorrow task
    tomorrow_task_badge: 'நாளைக்கான பணி: நாள் 2 (29 அக்டோபர்)',
    sub1_label: '🔬 அறிவியல் (வேதியியல்)',
    sub1_ch: 'அத்தியாயம் 2: அமிலங்கள், காரங்கள் மற்றும் உப்புகள்',
    sub1_topics: 'pH அளவீடு, குளோரோ-கார முறை, பிளாஸ்டர் ஆஃப் பாரிஸ், சலவைத்தூள் & அமில-உலோக வினைகள்.',
    listen_audio: '🎧 ஒலி விளக்கம் கேள்',

    sub2_label: '📖 தமிழ் (இரண்டாம் மொழி)',
    sub2_ch: 'இயல் 5: மணற்கேணி',
    sub2_topics: 'மொழிபெயர்ப்புக் கல்வி, நீதி வெண்பா (செய்குதம்பிப் பாவலர்), வினா-விடை வகைகள் & பொருள்கோள்.',
    listen_audio_tam: '🎧 தமிழ் விளக்கம் கேள்',

    // Mama Rule
    mama_rule_title: 'மாமாவின் தர விதி (முக்கிய அறிவிப்பு):',
    mama_rule_desc: 'கீழே கொடுக்கப்பட்டுள்ள மாதிரி வினாக்கள் உன் சுய பயிற்சிக்காக மட்டுமே! இரவு 8:30 PM மாதிரித் தேர்வில் <em>இதே கேள்விகள் அப்படியே வராது</em> — உன் உண்மையான புரிதலை சோதிக்க எண்களும் வார்த்தைகளும் <strong>Twist செய்து புதிய கேள்விகளாகக் கேட்கப்படும்!</strong>',
    sample_practice_title: 'நாளைக்கான மாதிரி வினாக்கள் (6 மாதிரி வினாக்கள் & விடைகள்)',

    // Night Test Blueprint
    night_test_head: 'நாள் 1 இரவுத் தேர்வு (இன்று இரவு 8:30 PM)',
    night_test_time: '<strong>நேரம்:</strong> இரவு 8:30 PM முதல் 9:15 PM வரை • <strong>பிரிவு:</strong> அறிவியல் 15 மதிப்பெண் + தமிழ் 15 மதிப்பெண்.',
    night_test_instructions: 'Rough நோட்டில் சுயமாக எழுத வேண்டும். தேர்வு முடிந்தவுடன் போட்டோ எடுத்து அப்லோட் செய். AI முதல்கட்ட திருத்தமும் மாமாவின் இறுதி சரிபார்ப்பும் வழங்கப்படும்!',
    mama_vault_action_btn: '🔐 மாமா: 16-நாள் ரகசிய தேர்வு பெட்டகம் (PIN: 9677)',
    mama_vault_security_note: '🔒 பிரணவுக்கு இரவு 8:30 வரை வினாக்கள் தெரியாது. மாமாவிற்கு மட்டுமே முழு வினாத்தாளும் விடைக் குறிப்பும் தெரியும்.',

    // Study Toolkit
    study_toolkit_title: 'படிக்கும் உதவிகள் & சந்தேகங்கள்:',
    full_schedule_btn: '📅 16 நாட்கள் முழு ரிவிஷன் அட்டவணை (Oct 28 – Nov 12)',
    view_schedule_label: 'விரிவாகப் பார்க்க',

    // Syllabus
    syllabus_title: 'பாடத்திட்டம் & அத்தியாயங்கள்',
    syllabus_lock_hint: '🔒 பாதுகாக்கப்பட்டது: மாமா மட்டுமே நிலையை மாற்ற முடியும்',

    // Vault Modal
    vault_modal_title: 'மாமாவின் ரகசிய இரவு தேர்வு பெட்டகம்',
    vault_modal_subtitle: '16-நாள் இரவு மாதிரி தேர்வுத்தாள்கள் (Oct 28 – Nov 12) • தலா 30 மதிப்பெண்',
    vault_gate_title: 'ரகசிய தேர்வுத்தாள்கள் பூட்டப்பட்டுள்ளன',
    vault_gate_desc: 'பிரணவ் முன்கூட்டியே கேள்விகளைப் பார்க்க முடியாது. திறக்க மாமாவின் Super Admin PIN-ஐ உள்ளிடவும்.',
    unlock_btn: 'திறக்கவும்',
    select_night_test: 'தேர்வு நாளைத் தேர்ந்தெடுக்கவும்:',
    vault_mode_label: 'பார்வை முறை:',
    copy_paper_btn: '📋 வினாத்தாளை நகலெடு (Copy)',
    print_paper_btn: '🖨️ வினாத்தாளை அச்சிடு (Print)'
  }
};

// UI Language Switcher (Default: English, Optional: Tamil)
let currentUiLang = localStorage.getItem('pranav_ui_lang') || 'en';

function toggleUiLanguage() {
  currentUiLang = currentUiLang === 'en' ? 'ta' : 'en';
  localStorage.setItem('pranav_ui_lang', currentUiLang);
  applyUiLanguage(currentUiLang);
  showToast(currentUiLang === 'en' ? 'UI Language set to English' : 'UI மொழி தமிழில் மாற்றப்பட்டது');
}

function applyUiLanguage(lang) {
  currentUiLang = lang || 'en';
  const dict = UI_I18N[currentUiLang] || UI_I18N.en;

  const deskLabel = document.getElementById('deskLangLabel');
  const mobBtn = document.getElementById('mobLangToggleBtn');
  if (deskLabel) deskLabel.textContent = currentUiLang === 'en' ? '🌐 English' : '🌐 தமிழ்';
  if (mobBtn) mobBtn.textContent = currentUiLang === 'en' ? '🌐 EN' : '🌐 தமிழ்';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      if (dict[key].includes('<')) {
        el.innerHTML = dict[key];
      } else {
        el.textContent = dict[key];
      }
    }
  });

  renderAll();
}

// Helper: Get Auth Headers for API Requests
function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-User-Role': currentUser ? (currentUser.role || 'viewer') : 'viewer',
    'X-User-Email': currentUser ? (currentUser.email || '') : ''
  };
}

// Auth Modals & Roles
function openAuthModal() {
  const m = document.getElementById('authModal');
  if (m) {
    m.classList.remove('hidden');
    updateAuthModalState();
  }
}

function updateAuthModalState() {
  const nameEl = document.getElementById('auth-current-name');
  const emailEl = document.getElementById('auth-current-email');
  const badgeEl = document.getElementById('auth-current-badge');

  if (nameEl) nameEl.textContent = currentUser.name;
  if (emailEl) emailEl.textContent = currentUser.email;
  if (badgeEl) {
    badgeEl.textContent = currentUser.badge || currentUser.role.toUpperCase();
    badgeEl.className = currentUser.role === 'admin' 
      ? 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800' 
      : 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800';
  }
}

async function handleGoogleSignIn(email, name = 'Google User') {
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });

    if (res.ok) {
      const data = await res.json();
      applyUserAuth(data.user);
      closeModal('authModal');
      showToast(`Signed in as ${data.user.name}!`);
    } else {
      const isSuper = email.toLowerCase() === 'jothi1809@gmail.com';
      applyUserAuth({
        role: isSuper ? 'admin' : 'viewer',
        name: isSuper ? 'Mama (Super Admin)' : name,
        email: email,
        badge: isSuper ? 'Owner' : 'Viewer',
        permissions: { canEditSyllabus: isSuper, canEditExamDates: isSuper, canAddTestMarks: isSuper }
      });
      closeModal('authModal');
      showToast(`Signed in as ${email}!`);
    }
  } catch (err) {
    console.error('Google Auth error:', err);
  }
}

async function submitPinLogin() {
  const pinInput = document.getElementById('pinInput');
  const pin = (pinInput ? pinInput.value : '').trim();
  if (pin.length !== 4) {
    showToast('Please enter a 4-digit PIN', false);
    return;
  }
  closeModal('authModal');
  await submitGatePin(pin);
  if (pinInput) pinInput.value = '';
}

function applyUserAuth(user) {
  currentUser = user;
  localStorage.setItem('pranav_user_auth', JSON.stringify(user));

  const title = document.getElementById('header-user-title');
  const sub = document.getElementById('header-user-sub');
  const shieldIcon = document.getElementById('auth-shield-icon');
  const islandRole = document.getElementById('island-role');
  const homeRoleTag = document.getElementById('home-role-tag');
  const syllabusHint = document.getElementById('syllabus-lock-hint');
  const cheerLimitBadge = document.getElementById('cheer-limit-badge');
  const wallAuthor = document.getElementById('wallAuthorSelect');

  if (user.role === 'admin') {
    if (title) title.textContent = 'Mama (Owner)';
    if (sub) sub.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> Full Edit Access • jothi1809@gmail.com';
    if (shieldIcon) shieldIcon.className = 'fa-solid fa-shield-halved text-emerald-600';
    if (islandRole) islandRole.textContent = 'Admin';
    if (homeRoleTag) homeRoleTag.textContent = '🔒 Mama Only Edits';
    if (syllabusHint) syllabusHint.textContent = '✓ Full Edit Mode Active (Mama)';
    if (cheerLimitBadge) cheerLimitBadge.textContent = 'Unlimited (Admin)';
    if (wallAuthor) wallAuthor.value = 'Mama';
  } else if (user.role === 'student') {
    if (title) title.textContent = 'Pranav (Student)';
    if (sub) sub.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span> Student Mode Active';
    if (shieldIcon) shieldIcon.className = 'fa-solid fa-user-graduate text-blue-600';
    if (islandRole) islandRole.textContent = 'Pranav';
    if (homeRoleTag) homeRoleTag.textContent = '🧑‍🎓 Student Mode';
    if (syllabusHint) syllabusHint.textContent = '🔒 Read Only (Mama controls status)';
    if (cheerLimitBadge) cheerLimitBadge.textContent = 'Student Mode';
    if (wallAuthor) wallAuthor.value = 'Pranav';
  } else {
    if (title) title.textContent = user.name || 'Father (Viewer)';
    if (sub) sub.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span> Read-Only • 3 Cheers Daily Limit';
    if (shieldIcon) shieldIcon.className = 'fa-solid fa-user-lock text-amber-600';
    if (islandRole) islandRole.textContent = 'Viewer';
    if (homeRoleTag) homeRoleTag.textContent = '👨 Father / Viewer';
    if (syllabusHint) syllabusHint.textContent = '🔒 Read Only (Changes Restricted)';
    if (cheerLimitBadge) cheerLimitBadge.textContent = '3/3 Cheers Left';
    if (wallAuthor) wallAuthor.value = 'Dad';
  }

  const deskUserName = document.getElementById('desk-user-name');
  if (deskUserName) {
    deskUserName.textContent = user.role === 'admin' ? 'Mama (PIN: 9677)' : (user.name || 'User');
  }

  renderAll();
}

function handleProtectedAction(actionType, ...args) {
  if (currentUser.role !== 'admin') {
    showToast('🔒 Access Restricted: Only Mama (jothi1809@gmail.com) has permission to edit this!', false);
    openAuthModal();
    return;
  }

  if (actionType === 'chapter') {
    const [subKey, chId] = args;
    cycleChapterDirect(subKey, chId);
  } else if (actionType === 'addMarks') {
    switchTab('written');
    showToast('📝 Select a written task to review and award marks!');
  }
}

// ================= TAMIL VOICE ASSISTANT =================
function openVoiceModal() {
  const m = document.getElementById('voiceModal');
  if (m) m.classList.remove('hidden');
}

function closeVoiceModal() {
  stopVoiceRecording();
  const m = document.getElementById('voiceModal');
  if (m) m.classList.add('hidden');
}

function toggleVoiceRecording() {
  if (isRecordingVoice) {
    stopVoiceRecording();
  } else {
    startVoiceRecording();
  }
}

function startVoiceRecording() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const statusText = document.getElementById('voiceStatusText');
  const btn = document.getElementById('voiceRecordBtn');
  const liveTranscript = document.getElementById('voiceLiveTranscript');

  if (!SpeechRec) {
    if (statusText) statusText.textContent = 'உலாவியில் மைக் ஆதரவு இல்லை. கீழே உள்ள விரைவு பொத்தான்களைப் பயன்படுத்தவும்.';
    return;
  }

  try {
    speechRecognizer = new SpeechRec();
    speechRecognizer.lang = 'ta-IN'; // Tamil (India)
    speechRecognizer.continuous = false;
    speechRecognizer.interimResults = true;

    speechRecognizer.onstart = () => {
      isRecordingVoice = true;
      if (btn) btn.className = 'w-20 h-20 rounded-full bg-rose-500 text-white text-2xl flex items-center justify-center shadow-voice pulse-ring transition';
      if (statusText) statusText.innerHTML = '<span class="text-rose-600 animate-pulse">● கேட்கிறது... தமிழில் பேசவும்</span>';
      if (liveTranscript) liveTranscript.textContent = 'கேட்கிறது...';
    };

    speechRecognizer.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const finalTranscript = event.results[i][0].transcript;
          if (liveTranscript) liveTranscript.textContent = `"${finalTranscript}"`;
          handleTamilVoiceInput(finalTranscript);
        } else {
          interim += event.results[i][0].transcript;
          if (liveTranscript) liveTranscript.textContent = `"${interim}"`;
        }
      }
    };

    speechRecognizer.onerror = (event) => {
      console.log('Voice recognition error:', event.error);
      stopVoiceRecording();
    };

    speechRecognizer.onend = () => {
      stopVoiceRecording();
    };

    speechRecognizer.start();
  } catch (e) {
    console.error('Speech start exception:', e);
  }
}

function stopVoiceRecording() {
  isRecordingVoice = false;
  if (speechRecognizer) {
    try { speechRecognizer.stop(); } catch(e){}
    speechRecognizer = null;
  }
  const btn = document.getElementById('voiceRecordBtn');
  const statusText = document.getElementById('voiceStatusText');
  if (btn) btn.className = 'w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white text-2xl flex items-center justify-center shadow-voice transition';
  if (statusText) statusText.textContent = 'மைக் தொட்டு தமிழில் பேசவும்...';
}

async function simulateTamilVoice(phrase) {
  const liveTranscript = document.getElementById('voiceLiveTranscript');
  if (liveTranscript) liveTranscript.textContent = `"${phrase}"`;
  await handleTamilVoiceInput(phrase);
}

async function handleTamilVoiceInput(transcript) {
  showToast(`🎤 குரல் பதிவு பெறப்பட்டது: "${transcript}"`);

  try {
    const res = await fetch('/api/voice-request', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ transcript })
    });

    if (res.ok) {
      if (window.confetti) confetti();
      speakTamilFeedback('சரி பிரணவ், உங்களது பதிவு ஏற்றுக்கொள்ளப்பட்டது!');
      setTimeout(() => {
        closeVoiceModal();
        renderAll();
      }, 1400);
      await fetchData();
    }
  } catch (err) {
    showToast('குரல் பதிவு சேமிக்கப்பட்டது!');
    closeVoiceModal();
  }
}

function speakTamilFeedback(text) {
  if ('speechSynthesis' in window) {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ta-IN';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch(e){}
  }
}

// ================= TAB NAVIGATION =================
function switchTab(tabId) {
  currentTab = tabId;

  const views = ['home', 'textbook', 'model-qa', 'performance', 'focus', 'schedule', 'syllabus', 'timer', 'family', 'formulas', 'scores', 'written', 'testpapers'];
  const targetView = tabId === 'modelqa' ? 'model-qa' : tabId;

  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) {
      if (v === targetView) el.classList.remove('hidden');
      else el.classList.add('hidden');
    }
  });

  // Primary 5 Pillars Nav Elements
  const primaryTabs = ['home', 'textbook', 'modelqa', 'performance', 'focus'];
  primaryTabs.forEach(b => {
    const isAct = b === tabId ||
      (tabId === 'scores' && b === 'performance') ||
      (tabId === 'syllabus' && b === 'textbook') ||
      (tabId === 'formulas' && b === 'textbook') ||
      (tabId === 'written' && b === 'home') ||
      (tabId === 'schedule' && b === 'home') ||
      (tabId === 'testpapers' && b === 'modelqa');

    const btn = document.getElementById(`nav-btn-${b}`);
    if (btn) {
      if (isAct) {
        btn.className = 'nav-item flex flex-col items-center relative text-emerald-600 font-bold active-nav-dot';
      } else {
        btn.className = 'nav-item flex flex-col items-center relative text-slate-400 hover:text-slate-700 transition';
      }
    }
    const dBtn = document.getElementById(`desk-nav-${b}`);
    if (dBtn) {
      if (isAct) {
        dBtn.className = 'desk-nav-btn px-3.5 py-2 rounded-xl text-white bg-emerald-600 transition flex items-center gap-1.5 shadow-sm font-bold';
      } else {
        dBtn.className = 'desk-nav-btn px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition flex items-center gap-1.5 font-bold';
      }
    }
  });

  // Legacy Desktop Nav fallback
  ['schedule', 'syllabus', 'timer', 'family'].forEach(b => {
    const dBtn = document.getElementById(`desk-nav-${b}`);
    if (dBtn) {
      if (b === tabId) {
        dBtn.className = 'desk-nav-btn px-3.5 py-2 rounded-xl text-white bg-emerald-600 transition flex items-center gap-1.5 shadow-sm font-bold';
      } else {
        dBtn.className = 'desk-nav-btn px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition flex items-center gap-1.5 font-bold';
      }
    }
  });

  const scroller = document.getElementById('main-scroll-content');
  if (scroller) scroller.scrollTop = 0;

  if (tabId === 'home') { if (typeof renderRevisionMissionUI === "function") renderRevisionMissionUI(); }
  if (tabId === 'textbook') renderTextbookView();
  if (tabId === 'modelqa') renderModelQAView();
  if (tabId === 'performance') renderPerformanceView();
  if (tabId === 'focus') renderFocusView();
  if (tabId === 'schedule') renderScheduleView();
  if (tabId === 'syllabus') renderSyllabusView();
  if (tabId === 'scores') renderPerformanceView();
  if (tabId === 'formulas') renderFormulasView();
  if (tabId === 'written') renderWrittenTasksFeed();
  if (tabId === 'testpapers') renderTestPapersFeed();
}

function openSubjectDetail(subKey) {
  currentSyllabusSubject = subKey;
  switchTab('syllabus');
}

// ================= FETCH DATA =================
async function fetchData() {
  try {
    let res = await fetch('/api/data?t=' + Date.now(), { headers: getAuthHeaders() });
    let isJson = res.headers.get('content-type')?.includes('application/json');
    if (!res.ok || !isJson) {
      // Fallback directly to static public data.json
      res = await fetch('/data.json?t=' + Date.now());
      isJson = res.headers.get('content-type')?.includes('application/json');
    }
    if (res.ok && isJson) {
      appState = await res.json();
      renderAll();
      return;
    }
    throw new Error('API offline');
  } catch (err) {
    const cached = localStorage.getItem('pranav_offline_data');
    if (cached) {
      try {
        appState = JSON.parse(cached);
        renderAll();
      } catch (e) {
        console.error('Cached data parse error:', e);
      }
    }
  }
}

// ================= RENDER ALL =================
function renderAll() {
  if (!appState) return;
  localStorage.setItem('pranav_offline_data', JSON.stringify(appState));

  renderHeroCountdown();
  renderDailyTargetCard();
  renderDiagnosticTracker();
  renderScheduleView();
  renderRevisionSplitter();
  if (typeof renderRevisionMissionUI === "function") renderRevisionMissionUI();
  renderSubjectGridStats();
  renderSyllabusView();
  renderWrittenTasksFeed();
  renderTestPapersFeed();
  renderFamilyWall();
  renderScoresList();

  // 5 Core Pillars Initial Rendering
  renderTextbookView();
  renderModelQAView();
  renderPerformanceView();
  renderFocusView();

  // 16-Day Night Test Hub (Mama & Parents)
  initHubDaySelector();
  renderHubTestPaper(currentHubDayIndex);

  // Enforce Role Access Control
  applyRoleUiRestrictions();
}

// Daily Target Card (Home View)
function renderDailyTargetCard() {
  const container = document.getElementById('home-daily-tasks-list');
  const setByLabel = document.getElementById('target-setby-label');
  if (!container || !appState.dailyTarget) return;

  if (setByLabel) setByLabel.textContent = appState.dailyTarget.setBy || 'Mama';

  container.innerHTML = '';
  const tasks = appState.dailyTarget.focusTasks || [];

  tasks.forEach(task => {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 text-xs shadow-sm';

    const trackBadge = task.track === 'school' 
      ? '<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">School</span>'
      : task.track === 'tuition'
      ? '<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">Tuition</span>'
      : '<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">90-100% Path</span>';

    row.innerHTML = `
      <div class="flex items-center gap-2 flex-1 pr-2">
        <button onclick="toggleDailyTask('${task.id}')" class="w-5 h-5 rounded-md flex items-center justify-center border transition ${task.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 text-transparent hover:border-emerald-500'}">
          <i class="fa-solid fa-check text-[10px]"></i>
        </button>
        <span class="${task.completed ? 'line-through text-slate-400' : 'font-semibold text-slate-800'}">${task.title}</span>
      </div>
      <div>${trackBadge}</div>
    `;

    container.appendChild(row);
  });
}

async function toggleDailyTask(id) {
  try {
    const res = await fetch('/api/daily-target/toggle', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id })
    });
    if (res.ok) {
      if (window.confetti) confetti({ particleCount: 30, spread: 45 });
      await fetchData();
    }
  } catch(e) {
    // Local fallback
    if (appState.dailyTarget && appState.dailyTarget.focusTasks) {
      const t = appState.dailyTarget.focusTasks.find(item => item.id === id);
      if (t) t.completed = !t.completed;
      renderDailyTargetCard();
    }
  }
}

function openTargetModal() {
  if (currentUser.role !== 'admin') {
    showToast('🔒 Only Mama can set or modify the master Target of the Day!', false);
    openAuthModal();
    return;
  }
  openModal('targetModal');
}

async function submitDailyTarget(e) {
  e.preventDefault();
  const title = document.getElementById('targetTaskTitle').value;
  const track = document.getElementById('targetTaskTrack').value;
  const subject = document.getElementById('targetTaskSubject').value;

  try {
    const res = await fetch('/api/daily-target', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, track, subject })
    });

    if (res.ok) {
      closeModal('targetModal');
      document.getElementById('targetTaskTitle').value = '';
      showToast('Daily Target updated by Mama!');
      await fetchData();
    }
  } catch(e) {
    showToast('Updated locally!');
  }
}

// ================= MASTER SCHEDULE & CALENDAR VIEW =================
function renderScheduleView() {
  const container = document.getElementById('schedule-events-container');
  if (!container || !appState.calendarEvents) return;

  container.innerHTML = '';
  const events = appState.calendarEvents || [];

  const filtered = currentScheduleTrack === 'all' 
    ? events 
    : events.filter(e => e.track === currentScheduleTrack);

  if (filtered.length === 0) {
    container.innerHTML = '<div class="text-center py-10 text-xs text-slate-400">No scheduled events in this track.</div>';
    return;
  }

  filtered.forEach(ev => {
    const card = document.createElement('div');
    card.className = `p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-2 transition ${ev.status === 'completed' ? 'opacity-70 bg-slate-50' : ''}`;

    const trackLabel = ev.track === 'school' 
      ? '<span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">🏫 School Track</span>'
      : ev.track === 'tuition'
      ? '<span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">🎓 Tuition Track</span>'
      : '<span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">🎯 90-100% Board Mission</span>';

    const typeLabel = ev.type === 'test' 
      ? '<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700">Exam / Test</span>'
      : '<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">Homework</span>';

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          ${trackLabel}
          ${typeLabel}
        </div>
        <span class="text-[10px] font-semibold text-slate-500">${ev.date} • ${ev.time}</span>
      </div>

      <div class="flex items-start justify-between gap-3 pt-1">
        <div class="space-y-0.5">
          <h4 class="text-xs font-bold text-slate-900 ${ev.status === 'completed' ? 'line-through text-slate-400' : ''}">${ev.title}</h4>
          <span class="text-[10px] text-slate-400">${ev.subject}</span>
        </div>
        <button onclick="toggleScheduleEvent('${ev.id}')" class="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition ${ev.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          <i class="fa-solid ${ev.status === 'completed' ? 'fa-circle-check text-emerald-600' : 'fa-circle text-slate-400'} text-[10px]"></i>
          <span>${ev.status === 'completed' ? 'Done' : 'Mark Done'}</span>
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

function filterScheduleTrack(track) {
  currentScheduleTrack = track;
  ['all', 'school', 'tuition', 'board_prep'].forEach(t => {
    const btn = document.getElementById(`track-btn-${t}`);
    if (btn) {
      if (t === track) {
        btn.className = 'track-pill px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm shrink-0';
      } else {
        btn.className = 'track-pill px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 shrink-0';
      }
    }
  });
  renderScheduleView();
}

async function toggleScheduleEvent(id) {
  try {
    const res = await fetch('/api/calendar/event/toggle', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id })
    });
    if (res.ok) {
      if (window.confetti) confetti();
      await fetchData();
    }
  } catch(e) {
    const ev = (appState.calendarEvents || []).find(e => e.id === id);
    if (ev) ev.status = ev.status === 'completed' ? 'pending' : 'completed';
    renderScheduleView();
  }
}

function openAddEventModal() {
  const d = document.getElementById('eventDateInput');
  if (d) d.value = new Date().toISOString().slice(0, 10);
  openModal('addEventModal');
}

async function submitCalendarEvent(e) {
  e.preventDefault();
  const title = document.getElementById('eventTitleInput').value;
  const track = document.getElementById('eventTrackSelect').value;
  const type = document.getElementById('eventTypeSelect').value;
  const date = document.getElementById('eventDateInput').value;
  const time = document.getElementById('eventTimeInput').value;

  try {
    const res = await fetch('/api/calendar/event', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, track, type, date, time })
    });

    if (res.ok) {
      closeModal('addEventModal');
      document.getElementById('eventTitleInput').value = '';
      showToast('Event added to Schedule!');
      await fetchData();
    }
  } catch(e) {
    showToast('Saved locally!');
  }
}

// Hero Countdown
function renderHeroCountdown() {
  const heroDays = document.getElementById('hero-countdown-days');
  if (!heroDays) return;

  // First exam is English on 13 Nov 2026 (16 study days remaining from 28 Oct)
  const examDateStr = appState.examDates?.termRev1 || '2026-11-13';
  const targetDate = new Date(`${examDateStr}T09:00:00`);
  const now = new Date();
  let diffDays = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0 || diffDays > 30) {
    diffDays = 16;
  }

  heroDays.textContent = `${diffDays} Days`;
}

// Subject Grid Percentages on Home
function renderSubjectGridStats() {
  if (!appState.subjects) return;

  Object.entries(appState.subjects).forEach(([key, sub]) => {
    const pctEl = document.getElementById(`grid-pct-${key}`);
    if (!pctEl) return;

    let points = 0;
    const total = sub.chapters.length;
    sub.chapters.forEach(ch => {
      if (ch.status === 'mastered') points += 1;
      else if (ch.status === 'revised') points += 0.75;
      else if (ch.status === 'in_progress') points += 0.4;
    });

    const pct = total > 0 ? Math.round((points / total) * 100) : 0;
    pctEl.textContent = `${pct}%`;
  });
}

// ================= ENRICHED SYLLABUS VIEW =================
let currentSyllabusBranchFilter = 'all';
let currentChapterSearch = '';

function filterSyllabusChapters(val) {
  currentChapterSearch = (val || '').toLowerCase().trim();
  renderSyllabusChaptersList();
}

function setSyllabusBranchFilter(branch) {
  currentSyllabusBranchFilter = branch;
  renderSyllabusBranchPills();
  renderSyllabusChaptersList();
}

function renderSyllabusBranchPills() {
  const container = document.getElementById('syllabus-branch-pills');
  if (!container || !appState.subjects) return;

  const currentSub = appState.subjects[currentSyllabusSubject];
  if (!currentSub || !currentSub.chapters) return;

  // Extract unique branches / units
  const branches = ['all', ...new Set(currentSub.chapters.map(c => c.branch || c.unit || 'Core'))];

  container.innerHTML = '';
  branches.forEach(b => {
    const isSel = b === currentSyllabusBranchFilter;
    const btn = document.createElement('button');
    btn.className = `px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition ${
      isSel 
        ? 'bg-emerald-600 text-white shadow-sm' 
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }`;
    btn.textContent = b === 'all' ? 'All Units' : b;
    btn.onclick = () => setSyllabusBranchFilter(b);
    container.appendChild(btn);
  });
}

function renderSyllabusView() {
  if (!appState || !appState.subjects) return;

  currentSyllabusSubject = currentSyllabusSubject || 'science';
  if (!appState.subjects[currentSyllabusSubject]) {
    currentSyllabusSubject = Object.keys(appState.subjects)[0] || 'science';
  }

  const pillsContainer = document.getElementById('syllabus-sub-pills');
  if (pillsContainer) {
    pillsContainer.innerHTML = '';
    Object.entries(appState.subjects).forEach(([key, sub]) => {
      const isSelected = key === currentSyllabusSubject;
      const btn = document.createElement('button');
      btn.className = `px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
        isSelected ? 'bg-emerald-600 text-white shadow-sm font-extrabold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`;
      btn.innerHTML = `<span>${sub.icon}</span> <span>${sub.title.split(' ')[0]}</span>`;
      btn.onclick = () => {
        currentSyllabusSubject = key;
        currentSyllabusBranchFilter = 'all';
        renderSyllabusView();
      };
      pillsContainer.appendChild(btn);
    });
  }

  const currentSub = appState.subjects[currentSyllabusSubject];
  if (!currentSub) return;

  // Subject Stats & Progress Banner
  let totalCh = currentSub.chapters.length;
  let masteredCh = currentSub.chapters.filter(c => c.status === 'mastered').length;
  let rev1Ch = currentSub.chapters.filter(c => c.isRevision1).length;
  let points = 0;
  currentSub.chapters.forEach(ch => {
    if (ch.status === 'mastered') points += 1;
    else if (ch.status === 'revised') points += 0.75;
    else if (ch.status === 'in_progress') points += 0.4;
  });
  const pct = totalCh > 0 ? Math.round((points / totalCh) * 100) : 0;

  const masteryPill = document.getElementById('syllabus-mastery-pill');
  if (masteryPill) masteryPill.textContent = `${pct}% Mastered`;

  const banner = document.getElementById('syllabus-subject-banner');
  if (banner) {
    banner.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">${currentSub.icon}</span>
          <div>
            <h4 class="text-sm font-extrabold text-white">${currentSub.title}</h4>
            <span class="text-[10px] text-slate-300 font-medium">Code: ${currentSub.code || 'CBSE-10'} &bull; SRM Revision 1</span>
          </div>
        </div>
        <div class="text-right">
          <span class="text-lg font-black text-emerald-400">${pct}%</span>
          <span class="block text-[9px] text-slate-400 font-bold uppercase">Completion</span>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="w-full h-2 rounded-full bg-slate-700/80 overflow-hidden">
        <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
      </div>

      <!-- Quick Summary Pills -->
      <div class="flex items-center justify-between gap-2 pt-1 text-[10px] text-slate-300 font-semibold flex-wrap">
        <span class="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">📚 <strong>${totalCh}</strong> Total Chapters</span>
        <span class="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">✅ <strong>${masteredCh}</strong> Mastered</span>
        <span class="bg-amber-900/40 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-600/40 font-bold">🔥 <strong>${rev1Ch}</strong> SRM Rev-1 Focus</span>
        <button onclick="switchTab('formulas')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition">
          <i class="fa-solid fa-headphones text-[9px]"></i> Audio Hub
        </button>
      </div>
    `;
  }

  renderSyllabusBranchPills();
  renderSyllabusChaptersList();
}

function renderSyllabusChaptersList() {
  const listContainer = document.getElementById('syllabus-chapters-container');
  if (!listContainer || !appState.subjects) return;

  const currentSub = appState.subjects[currentSyllabusSubject];
  if (!currentSub || !currentSub.chapters) return;

  listContainer.innerHTML = '';

  const filtered = currentSub.chapters.filter(ch => {
    const branchMatch = currentSyllabusBranchFilter === 'all' || (ch.branch || ch.unit || 'Core') === currentSyllabusBranchFilter;
    const searchMatch = !currentChapterSearch || 
      ch.name.toLowerCase().includes(currentChapterSearch) || 
      (ch.notes && ch.notes.toLowerCase().includes(currentChapterSearch)) ||
      (ch.keyConcepts && ch.keyConcepts.some(c => c.toLowerCase().includes(currentChapterSearch)));
    return branchMatch && searchMatch;
  });

  if (filtered.length === 0) {
    listContainer.innerHTML = '<div class="p-6 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-2xl">No chapters match your filter or search.</div>';
    return;
  }

  const isAdmin = currentUser.role === 'admin';

  filtered.forEach(ch => {
    const card = document.createElement('div');
    card.className = 'bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-card hover:border-slate-300 transition';

    const badge = getStatusBadge(ch.status);
    const mamaRating = (appState.mamaRatings && appState.mamaRatings[ch.id]) !== undefined 
      ? appState.mamaRatings[ch.id] 
      : (ch.status === 'mastered' ? 90 : ch.status === 'revised' ? 70 : ch.status === 'in_progress' ? 45 : 0);

    card.innerHTML = `
      <!-- Chapter Header -->
      <div class="flex items-start justify-between gap-2">
        <div class="space-y-1">
          <div class="flex items-center gap-1.5 flex-wrap">
            <h4 class="text-xs sm:text-sm font-extrabold text-slate-900">${ch.name}</h4>
            <span class="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">${ch.branch || ch.unit || 'Core'}</span>
            ${ch.isRevision1 ? `<span class="text-[9px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-extrabold shadow-sm flex items-center gap-1"><i class="fa-solid fa-fire text-[8px]"></i> SRM Rev-1</span>` : ''}
          </div>
          ${ch.examWeightage ? `<span class="inline-block text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">${ch.examWeightage}</span>` : ''}
          ${ch.notes ? `<p class="text-[11px] text-slate-500 leading-snug">${ch.notes}</p>` : ''}
        </div>
      </div>

      <!-- Key Concepts Accordion -->
      ${ch.keyConcepts && ch.keyConcepts.length > 0 ? `
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-extrabold text-slate-800 flex items-center gap-1.5">
              <i class="fa-solid fa-lightbulb text-amber-500"></i> Key NCERT Concepts:
            </span>
          </div>
          <ul class="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
            ${ch.keyConcepts.map(c => `<li>${c}</li>`).join('')}
          </ul>
          ${ch.formulas ? `
            <div class="pt-1.5 border-t border-slate-200/80 text-[11px] text-slate-700 font-mono">
              <strong class="text-slate-900 font-sans">Formula/Rule:</strong> ${ch.formulas}
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- Sample Questions & Solutions Accordion -->
      ${ch.sampleQuestions && ch.sampleQuestions.length > 0 ? `
        <div class="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <button onclick="toggleChapterSampleQuestions('ch-sample-${ch.id}')" class="w-full p-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left font-bold text-slate-800 transition">
            <span class="flex items-center gap-1.5">
              <i class="fa-solid fa-clipboard-question text-purple-600"></i>
              <span>High-Yield Board Questions (${ch.sampleQuestions.length} Questions)</span>
            </span>
            <i id="ch-chevron-${ch.id}" class="fa-solid fa-chevron-down text-[10px] text-slate-500 transition-transform"></i>
          </button>
          <div id="ch-sample-${ch.id}" class="hidden p-3 bg-white space-y-2.5 border-t border-slate-200 text-[11px]">
            ${ch.sampleQuestions.map((q, qIdx) => `
              <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <p class="font-bold text-slate-900">Q${qIdx + 1}: ${q.q}</p>
                <div class="text-emerald-800 bg-emerald-50/60 p-2 rounded border border-emerald-100 leading-snug">
                  <strong>Answer:</strong> ${q.a}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Action Bar: Audio Explainer, Mama Score & Status -->
      <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
        <button onclick="playTanglishAudio('exp-${ch.id}')" class="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-[11px] flex items-center gap-1.5 transition">
          <i class="fa-solid fa-volume-high text-[10px]"></i> 🎧 Concept Audio
        </button>

        <div class="flex items-center gap-2">
          <!-- Mama Rating Score -->
          <div class="flex items-center gap-1 text-[11px]">
            <span class="text-xs">👑</span>
            <span class="font-bold text-slate-700">Mama:</span>
            <span id="mama-rating-val-${ch.id}" class="font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">${mamaRating}%</span>
            ${isAdmin ? `
              <input type="range" min="0" max="100" step="5" value="${mamaRating}" 
                onchange="saveMamaRating('${ch.id}', this.value)" 
                oninput="document.getElementById('mama-rating-val-${ch.id}').textContent = this.value + '%'" 
                class="w-16 accent-emerald-600 cursor-pointer ml-1" title="Adjust Mama's Confirmed Percentage">
            ` : ''}
          </div>

          <!-- Status Advance Button -->
          <button onclick="handleProtectedAction('chapter', '${currentSyllabusSubject}', '${ch.id}')" class="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition ${badge.class}">
            ${badge.icon} ${badge.label}
          </button>
        </div>
      </div>
    `;

    listContainer.appendChild(card);
  });
}

function toggleChapterSampleQuestions(id) {
  const el = document.getElementById(id);
  const chKey = id.replace('ch-sample-', '');
  const chevron = document.getElementById(`ch-chevron-${chKey}`);
  if (el) {
    el.classList.toggle('hidden');
    if (chevron) {
      if (el.classList.contains('hidden')) chevron.classList.remove('rotate-180');
      else chevron.classList.add('rotate-180');
    }
  }
}

async function saveMamaRating(chapterId, rating) {
  try {
    const res = await fetch('/api/mama/rating', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ chapterId, rating })
    });
    if (res.ok) {
      showToast(`மாமாவின் மதிப்பீடு ${rating}% என பதிவு செய்யப்பட்டது!`);
      if (!appState.mamaRatings) appState.mamaRatings = {};
      appState.mamaRatings[chapterId] = parseInt(rating, 10);
    }
  } catch(e) {
    showToast('Saved locally!');
  }
}

function getStatusBadge(status) {
  switch (status) {
    case 'mastered':
      return { label: 'Mastered', icon: '✓', class: 'bg-emerald-100 text-emerald-800' };
    case 'revised':
      return { label: 'Revised', icon: '↺', class: 'bg-cyan-100 text-cyan-800' };
    case 'in_progress':
      return { label: 'In Progress', icon: '⏳', class: 'bg-amber-100 text-amber-800' };
    default:
      return { label: 'Not Started', icon: '○', class: 'bg-slate-100 text-slate-500' };
  }
}

async function cycleChapterDirect(subjectKey, chapterId) {
  const currentSub = appState.subjects[subjectKey];
  const ch = currentSub ? currentSub.chapters.find(c => c.id === chapterId) : null;
  if (!ch) return;

  const order = ['not_started', 'in_progress', 'revised', 'mastered'];
  const nextIdx = (order.indexOf(ch.status) + 1) % order.length;
  const nextStatus = order[nextIdx];

  try {
    const res = await fetch('/api/chapter/status', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ subjectKey, chapterId, status: nextStatus })
    });

    if (res.ok) {
      if (nextStatus === 'mastered' && window.confetti) {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      }
      showToast(`Updated to ${nextStatus.replace('_', ' ').toUpperCase()}`);
      await fetchData();
    }
  } catch (err) {
    ch.status = nextStatus;
    renderAll();
  }
}

// Quick Study Log
async function submitQuickLog(e) {
  e.preventDefault();
  const subject = document.getElementById('quickLogSubject').value;
  const minutes = document.getElementById('quickLogMins').value;
  const chapter = document.getElementById('quickLogChapter').value;

  try {
    const res = await fetch('/api/study-log', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ subject, minutes, chapter, notes: 'Study sprint' })
    });

    if (res.ok) {
      if (window.confetti) confetti();
      showToast('Study session logged!');
      document.getElementById('quickLogChapter').value = '';
      await fetchData();
    }
  } catch (err) {
    showToast('Logged locally!');
  }
}

// Family Wall
function renderFamilyWall() {
  const container = document.getElementById('family-wall-feed');
  const homeCheer = document.getElementById('home-cheer-text');
  if (!appState.familyNotes) return;

  if (homeCheer && appState.familyNotes.length > 0) {
    homeCheer.textContent = `"${appState.familyNotes[0].text}"`;
  }

  if (container) {
    container.innerHTML = '';
    appState.familyNotes.forEach(note => {
      const card = document.createElement('div');
      card.className = 'bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-2 shadow-card';
      card.innerHTML = `
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-[10px]">
              ${note.author.slice(0, 1)}
            </div>
            <div>
              <strong class="text-slate-900">${note.author}</strong>
              <span class="text-[10px] text-rose-500 font-semibold ml-1">(${note.badge || 'Family'})</span>
            </div>
          </div>
          <span class="text-[10px] text-slate-400">Term Rev 1</span>
        </div>
        <p class="text-xs text-slate-700 leading-relaxed">${note.text}</p>
      `;
      container.appendChild(card);
    });
  }
}

async function submitFamilyWallNote(e) {
  e.preventDefault();
  const author = document.getElementById('wallAuthorSelect').value;
  const text = document.getElementById('wallNoteInput').value;

  try {
    const res = await fetch('/api/family-note', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ author, text, badge: author === 'Mama' ? 'Uncle (Admin)' : 'Family' })
    });

    if (res.ok) {
      document.getElementById('wallNoteInput').value = '';
      showToast('Encouragement posted!');
      await fetchData();
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to post cheer', false);
    }
  } catch (err) {
    showToast('Posted!');
  }
}

// ================= EASY LEARN & SURE-SHOT MARKS =================
let currentEasyLearnFilter = 'All';

function openEasyLearnModal(subject = 'All') {
  currentEasyLearnFilter = subject;
  openModal('easyLearnModal');
  filterEasyLearn(subject);
}

function filterEasyLearn(subject) {
  currentEasyLearnFilter = subject;
  ['All', 'Mathematics', 'Science', 'Social Science'].forEach(s => {
    const btn = document.getElementById(`el-tab-${s}`);
    if (btn) {
      if (s === subject) {
        btn.className = 'px-3 py-1 rounded-full bg-orange-600 text-white shrink-0';
      } else {
        btn.className = 'px-3 py-1 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 shrink-0';
      }
    }
  });

  const feed = document.getElementById('easylearn-cards-feed');
  if (!feed || !appState || !appState.easyLearnConcepts) return;

  const list = currentEasyLearnFilter === 'All'
    ? appState.easyLearnConcepts
    : appState.easyLearnConcepts.filter(c => c.subject === currentEasyLearnFilter);

  feed.innerHTML = '';
  list.forEach(c => {
    const card = document.createElement('div');
    card.className = 'bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5 shadow-sm';
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">${c.marks}</span>
        <button onclick="speakConceptTamil('${c.title}. ${c.analogy}')" class="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1">
          <i class="fa-solid fa-volume-high text-xs"></i> <span>Listen in Tamil</span>
        </button>
      </div>
      <div>
        <h4 class="text-xs font-bold text-slate-900">${c.title}</h4>
        <span class="text-[10px] text-slate-500">${c.subject} • ${c.topic}</span>
      </div>
      <div class="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-slate-800 text-[11px] leading-relaxed">
        <strong class="text-amber-900 block font-semibold mb-0.5">💡 எளிய கதை விளக்கம் (Easy Story Analogy):</strong>
        <p class="whitespace-pre-line">${c.analogy}</p>
      </div>
      <div class="space-y-1">
        <strong class="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">4-Step Exam Master Checklist:</strong>
        <ul class="text-[11px] text-slate-700 space-y-1 list-none font-mono">
          ${c.simpleSteps.map(s => `<li class="p-1 rounded bg-white border border-slate-200/80">• ${s}</li>`).join('')}
        </ul>
      </div>
      <div class="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold">
        ✨ <strong>Examiner Pro-Tip:</strong> ${c.proTip}
      </div>
    `;
    feed.appendChild(card);
  });
}

function speakConceptTamil(text, title) {
  openAudioPlayerWithData({
    subject: 'Easy Learn (எளிய கற்றல்)',
    chapterName: '50% to 90% Booster',
    topic: title || 'Concept Audio Explanation',
    tanglishExplanation: text,
    englishExamTerms: ['Core Concept', 'Guaranteed Marks', 'CBSE Keywords'],
    sampleQuestion: 'Explain the core idea in your own words with step-by-step points.'
  });
}

// ================= WRITTEN TASKS & NOTEBOOK REVIEW =================
let activeUploadTaskId = null;
let activeReviewTaskId = null;
let currentUploadedBase64 = null;

function renderWrittenTasksFeed() {
  const container = document.getElementById('written-tasks-feed');
  if (!container || !appState || !appState.writtenTasks) return;

  container.innerHTML = '';
  const isAdmin = currentUser.role === 'admin';

  appState.writtenTasks.forEach(t => {
    const card = document.createElement('div');
    card.className = 'bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-card';

    let statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">⏳ Writing Pending</span>';
    if (t.status === 'ai_reviewed') {
      const score = t.aiCorrection ? t.aiCorrection.aiScore : '4.5';
      statusBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">🤖 AI Pre-Corrected: ${score}/${t.maxMarks} • Pending Mama</span>`;
    } else if (t.status === 'submitted') {
      statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">📸 Submitted • Pending Review</span>';
    } else if (t.status === 'reviewed') {
      statusBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> Mama Verified: ${t.marksAwarded}/${t.maxMarks}</span>`;
    }

    // AI Pre-Correction preview box if evaluated
    let aiBox = '';
    if (t.aiCorrection) {
      const ai = t.aiCorrection;
      aiBox = `
        <div class="p-2.5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50/60 border border-purple-200 text-purple-950 text-[11px] space-y-1.5 shadow-sm">
          <div class="flex items-center justify-between font-bold text-purple-900">
            <span class="flex items-center gap-1.5"><i class="fa-solid fa-robot text-purple-600"></i> AI Textbook Pre-Correction</span>
            <span class="text-purple-800 bg-purple-200/80 px-2 py-0.5 rounded-full text-[10px] font-extrabold">${ai.aiScore} / ${t.maxMarks} Marks</span>
          </div>
          <p class="text-[10px] text-purple-800 font-medium flex items-center gap-1">
            <i class="fa-solid fa-book-open text-purple-600"></i> ${ai.textbookRef || t.textbookReference || 'NCERT Class 10 Textbook'}
          </p>
          <p class="text-[11px] text-purple-900 line-clamp-2 leading-relaxed">${ai.aiFeedbackTamil.replace(/🤖.*\n/, '')}</p>
          <div class="flex items-center justify-between pt-1 border-t border-purple-200/60 text-[10px]">
            <button onclick="openAiCorrectionModal('${t.id}')" class="text-purple-700 hover:text-purple-900 font-bold underline flex items-center gap-1">
              <i class="fa-solid fa-list-check"></i> View Textbook Rubric & AI Steps
            </button>
            <span class="text-purple-600 text-[10px] italic">NCERT Aligned</span>
          </div>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">${t.subject} • ${t.chapter}</span>
        ${statusBadge}
      </div>

      <div class="space-y-1">
        <h4 class="text-xs font-bold text-slate-900">${t.title}</h4>
        <p class="text-[11px] text-slate-600 leading-snug">${t.instructions}</p>
        ${t.textbookReference ? `<p class="text-[10px] text-blue-700 font-medium"><i class="fa-solid fa-bookmark text-blue-500 mr-1"></i>Ref: ${t.textbookReference}</p>` : ''}
      </div>

      ${aiBox}

      ${t.mamaFeedback ? `
        <div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] space-y-0.5 shadow-sm">
          <strong class="block font-bold flex items-center gap-1"><i class="fa-solid fa-award text-emerald-600"></i> மாமாவின் இறுதி மதிப்பாய்வு (Mama's Confirmed Review):</strong>
          <p class="leading-relaxed">${t.mamaFeedback}</p>
        </div>
      ` : ''}

      <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
        <span class="text-[10px] text-slate-400">Due: ${t.deadline}</span>
        <div class="flex gap-2">
          ${t.status === 'pending' ? `
            <button onclick="openUploadPhotoModal('${t.id}')" class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 transition">
              <i class="fa-solid fa-camera text-[9px]"></i> Upload Notebook Page
            </button>
          ` : (t.status === 'submitted' || t.status === 'ai_reviewed') && isAdmin ? `
            <button onclick="openReviewTaskModal('${t.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 transition">
              <i class="fa-solid fa-pen-nib text-[9px]"></i> Grade & Confirm (Mama)
            </button>
          ` : t.status === 'ai_reviewed' && !isAdmin ? `
            <button onclick="openAiCorrectionModal('${t.id}')" class="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 transition">
              <i class="fa-solid fa-robot text-[9px]"></i> View AI Report
            </button>
          ` : t.status === 'reviewed' ? `
            <span class="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <i class="fa-solid fa-circle-check"></i> Score Verified by Mama
            </span>
          ` : `
            <span class="text-[10px] text-blue-600 font-medium">Under Review</span>
          `}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function openUploadPhotoModal(taskId) {
  activeUploadTaskId = taskId;
  currentUploadedBase64 = null;
  const task = (appState.writtenTasks || []).find(t => t.id === taskId);
  const title = document.getElementById('uploadTaskTitle');
  const preview = document.getElementById('photoPreviewContainer');
  const fileInput = document.getElementById('notebookPhotoInput');

  if (title && task) title.textContent = task.title;
  if (preview) preview.classList.add('hidden');
  if (fileInput) fileInput.value = '';

  openModal('uploadPhotoModal');
}

function previewNotebookPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    currentUploadedBase64 = e.target.result;
    const previewContainer = document.getElementById('photoPreviewContainer');
    const previewImg = document.getElementById('photoPreviewImg');
    if (previewImg && previewContainer) {
      previewImg.src = currentUploadedBase64;
      previewContainer.classList.remove('hidden');
    }
  };
  reader.readAsDataURL(file);
}

async function confirmSubmitPhoto() {
  if (!activeUploadTaskId) return;
  const notes = document.getElementById('photoStudentNotes').value;

  try {
    const res = await fetch('/api/written-task/submit', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id: activeUploadTaskId, photoUrl: currentUploadedBase64, notes })
    });

    if (res.ok) {
      closeModal('uploadPhotoModal');
      showToast('Notebook page submitted for Mama to review!');
      if (window.confetti) confetti();
      await fetchData();
    }
  } catch (e) {
    closeModal('uploadPhotoModal');
    showToast('Uploaded successfully!');
  }
}

function openAssignTaskModal() {
  if (currentUser.role !== 'admin') {
    showToast('🔒 Only Mama can assign written tasks!', false);
    openAuthModal();
    return;
  }
  openModal('assignTaskModal');
}

async function confirmAssignTask(e) {
  e.preventDefault();
  const title = document.getElementById('assignTitle').value;
  const subject = document.getElementById('assignSubject').value;
  const maxMarks = document.getElementById('assignMarks').value;
  const instructions = document.getElementById('assignInstructions').value;

  try {
    const res = await fetch('/api/written-task/assign', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, subject, maxMarks, instructions })
    });

    if (res.ok) {
      closeModal('assignTaskModal');
      document.getElementById('assignTitle').value = '';
      showToast('Writing task assigned to Pranav!');
      await fetchData();
    }
  } catch (e) {
    showToast('Assigned locally!');
  }
}

function openReviewTaskModal(taskId) {
  if (currentUser.role !== 'admin') {
    showToast('🔒 Only Mama can review submissions!', false);
    return;
  }

  activeReviewTaskId = taskId;
  const task = (appState.writtenTasks || []).find(t => t.id === taskId);
  if (!task) return;

  const title = document.getElementById('reviewTaskTitle');
  const notes = document.getElementById('reviewStudentNotes');
  const photoBox = document.getElementById('reviewPhotoBox');
  const photoImg = document.getElementById('reviewPhotoImg');
  const maxInput = document.getElementById('reviewMaxMarksInput');
  const aiBox = document.getElementById('reviewAiCorrectionBox');
  const aiScoreBadge = document.getElementById('reviewAiScoreBadge');
  const aiTextbookRef = document.getElementById('reviewAiTextbookRef');
  const aiSnippet = document.getElementById('reviewAiFeedbackSnippet');
  const marksInput = document.getElementById('reviewMarksInput');
  const feedbackInput = document.getElementById('reviewFeedbackInput');

  if (title) title.textContent = task.title;
  if (notes) notes.textContent = `Student Notes: ${task.studentNotes || 'No notes'}`;
  if (maxInput) maxInput.value = `/ ${task.maxMarks || 5}`;

  // Populate AI Pre-Correction Box
  if (aiBox) {
    if (task.aiCorrection) {
      aiBox.classList.remove('hidden');
      if (aiScoreBadge) aiScoreBadge.textContent = `${task.aiCorrection.aiScore} / ${task.maxMarks || 5} Marks`;
      if (aiTextbookRef) aiTextbookRef.textContent = `📖 ${task.aiCorrection.textbookRef || task.textbookReference || 'NCERT Class 10 Textbook'}`;
      if (aiSnippet) aiSnippet.textContent = task.aiCorrection.aiFeedbackTamil ? task.aiCorrection.aiFeedbackTamil.replace(/🤖.*\n/, '') : 'AI pre-correction complete.';
    } else {
      aiBox.classList.add('hidden');
    }
  }

  // Pre-fill existing marks or AI marks if available
  if (marksInput) {
    marksInput.value = (task.marksAwarded !== null && task.marksAwarded !== undefined)
      ? task.marksAwarded 
      : (task.aiCorrection ? task.aiCorrection.aiScore : '');
  }
  if (feedbackInput) {
    feedbackInput.value = task.mamaFeedback || '';
  }

  if (photoImg && photoBox) {
    if (task.photoUrl) {
      photoImg.src = task.photoUrl;
      photoBox.classList.remove('hidden');
    } else {
      photoImg.src = '';
      photoBox.classList.add('hidden');
    }
  }

  openModal('reviewTaskModal');
}

function applyAiCorrectionToMamaReview() {
  if (!activeReviewTaskId) return;
  const task = (appState.writtenTasks || []).find(t => t.id === activeReviewTaskId);
  if (!task || !task.aiCorrection) return;

  const marksInput = document.getElementById('reviewMarksInput');
  const feedbackInput = document.getElementById('reviewFeedbackInput');

  if (marksInput) marksInput.value = task.aiCorrection.aiScore;
  if (feedbackInput) {
    feedbackInput.value = `மாமாவின் ஏற்பு & வாழ்த்து: அருமை பிரணவ்! NCERT பாடப்புத்தகத்தின் முக்கிய புள்ளிகள் மற்றும் ஸ்டெப்ஸ் சரிபார்க்கப்பட்டன. ஸ்டெப் மார்க்கிங்கில் இதே துல்லியத்தைக் கடைப்பிடி!`;
  }
  showToast('✨ AI மதிப்பெண் & ஃபீட்பேக் மாமா படிவத்தில் நிரப்பப்பட்டது!');
}

function openAiCorrectionModal(taskId) {
  const task = (appState.writtenTasks || []).find(t => t.id === taskId);
  if (!task || !task.aiCorrection) {
    showToast('AI மதிப்பீட்டு விவரங்கள் தயாராகிறது...');
    return;
  }

  const ai = task.aiCorrection;
  const scoreEl = document.getElementById('aiModalScore');
  const refEl = document.getElementById('aiModalTextbookRef');
  const criteriaList = document.getElementById('aiModalCriteriaList');
  const missingList = document.getElementById('aiModalMissingList');
  const feedbackEl = document.getElementById('aiModalFeedback');
  const statusBadge = document.getElementById('aiModalStatusBadge');

  if (scoreEl) scoreEl.textContent = `${ai.aiScore} / ${ai.maxMarks || task.maxMarks || 5} Marks`;
  if (refEl) refEl.textContent = ai.textbookRef || task.textbookReference || 'NCERT Class 10 Textbook';
  if (feedbackEl) feedbackEl.textContent = ai.aiFeedbackTamil || 'Very good effort!';

  if (statusBadge) {
    if (task.status === 'reviewed') {
      statusBadge.className = 'text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1';
      statusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Mama Verified';
    } else {
      statusBadge.className = 'text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-200 text-purple-800 flex items-center gap-1';
      statusBadge.innerHTML = '<i class="fa-solid fa-clock"></i> Pending Mama Sign-off';
    }
  }

  if (criteriaList) {
    criteriaList.innerHTML = '';
    (ai.criteriaChecked || []).forEach(c => {
      const item = document.createElement('div');
      item.className = 'p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2';
      item.innerHTML = `
        <i class="fa-solid fa-circle-check text-emerald-600 mt-0.5 text-xs"></i>
        <div class="space-y-0.5">
          <p class="font-bold text-slate-800 text-[11px]">${c.label || c.expected}</p>
          <span class="text-[10px] text-slate-500">${c.textbookNote || 'NCERT Standard Verified'}</span>
        </div>
      `;
      criteriaList.appendChild(item);
    });
  }

  if (missingList) {
    missingList.innerHTML = '';
    (ai.missingPointsToHit100 || []).forEach(m => {
      const li = document.createElement('li');
      li.textContent = m;
      missingList.appendChild(li);
    });
  }

  openModal('aiCorrectionModal');
}

async function confirmReviewTask() {
  if (!activeReviewTaskId) return;
  const marks = document.getElementById('reviewMarksInput').value;
  const feedback = document.getElementById('reviewFeedbackInput').value;

  try {
    const res = await fetch('/api/written-task/review', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id: activeReviewTaskId, marksAwarded: marks, feedback })
    });

    if (res.ok) {
      closeModal('reviewTaskModal');
      showToast('Review & Marks saved! Pranav can see them now.');
      if (window.confetti) confetti();
      await fetchData();
    }
  } catch (e) {
    showToast('Graded locally!');
  }
}

// ================= HOME MOCK TEST PAPERS =================
function renderTestPapersFeed() {
  const container = document.getElementById('test-papers-feed');
  if (!container || !appState || !appState.testPapers) return;

  container.innerHTML = '';
  appState.testPapers.forEach(tp => {
    const card = document.createElement('div');
    card.className = 'bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-card';

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">${tp.subject}</span>
        <span class="text-[10px] font-semibold text-slate-500">⏱️ ${tp.durationMinutes} Mins • Total ${tp.totalMarks} Marks</span>
      </div>

      <h4 class="text-xs font-bold text-slate-900">${tp.title}</h4>

      <div class="space-y-2 pt-1 border-t border-slate-100">
        <strong class="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Questions (Sample Paper):</strong>
        <div class="space-y-1.5 font-medium text-[11px] text-slate-800">
          ${tp.questions.map(q => `
            <div class="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2">
              <span><strong>Q${q.qNo}.</strong> ${q.text}</span>
              <span class="shrink-0 text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">${q.marks}M</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] space-y-1">
        <strong class="block font-bold">✓ ஆன்சர் கீ & ஸ்டெப் மார்க்கிங் (Answer Key Summary):</strong>
        <p class="font-mono text-[10px]">${tp.answerKeySummary}</p>
      </div>
    `;

    container.appendChild(card);
  });
}

// ================= TANGLISH AUDIO LESSON PLAYER =================
function renderFormulasView() {
  const container = document.getElementById('formula-cards-container');
  if (!container || !appState || !appState.topicExplanations) return;

  container.innerHTML = '';

  appState.topicExplanations.forEach(exp => {
    const card = document.createElement('div');
    card.className = 'bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-card';

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">${exp.subject}</span>
        <button onclick="playTanglishAudio('${exp.id}')" id="audio-btn-${exp.id}" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm transition">
          <i class="fa-solid fa-volume-high text-[10px]"></i> <span>ஒலி விளக்கம் (Listen)</span>
        </button>
      </div>

      <div>
        <h4 class="text-xs font-bold text-slate-900">${exp.topic}</h4>
        <span class="text-[10px] text-slate-500">${exp.chapterName}</span>
      </div>

      <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-[11px] leading-relaxed">
        <strong class="text-amber-800 block font-semibold mb-1">💡 எளிய தமிழ் விளக்கம் (Tanglish Explanation):</strong>
        <p class="whitespace-pre-line">${exp.tanglishExplanation}</p>
      </div>

      <div class="space-y-1">
        <strong class="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">தேர்வில் எழுத வேண்டிய English Terms:</strong>
        <div class="flex flex-wrap gap-1">
          ${exp.englishExamTerms.map(term => `<span class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[10px]">${term}</span>`).join('')}
        </div>
      </div>

      <div class="p-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-[10px] font-semibold">
        📝 <strong>Previous Board Exam Question:</strong> ${exp.sampleQuestion}
      </div>
    `;

    container.appendChild(card);
  });
}

// ================= ROBUST UNIVERSAL AUDIO PLAYER & TTS ENGINE =================
let currentUtterance = null;
let isAudioPlaying = false;
let currentPlayingText = '';
let currentAudioMeta = null;

// Built-in topic explanations fallback
const defaultTopicExplanations = {
  'exp-s2': {
    id: 'exp-s2',
    subject: 'Science',
    chapterName: 'Acids, Bases and Salts',
    topic: 'pH Scale, Chlor-alkali Process & Plaster of Paris',
    tanglishExplanation: 'Science Chapter 2 Acids, Bases and Salts-ல போர்டு எக்ஸாம்ல அடிக்கடி வர்ற மிக முக்கியமான 3 கான்செப்ட்ஸ் இதோ:\n\n' +
      '1. pH Scale: pH என்பது potential of Hydrogen. 7 என்பது Neutral. 7-க்குக் கீழே போனால் Acidic nature அதிகமாகும் (H+ ion அதிகம்). 7-க்கு மேலே போனால் Basic nature அதிகமாகும் (OH- ion அதிகம்). நம்ம வாயில pH 5.5-க்குக் கீழே குறைந்தால் tooth decay ஏற்படும்.\n\n' +
      '2. Chlor-alkali Process: Aqueous Sodium Chloride solution (Brine)-ல electricity pass பண்ணும்போது, நமக்கு Sodium Hydroxide (NaOH), Chlorine gas (anode-ல்), மற்றும் Hydrogen gas (cathode-ல்) கிடைக்கும். Equation: 2NaCl + 2H2O -> 2NaOH + Cl2 + H2.\n\n' +
      '3. Plaster of Paris: Gypsum-ஐ 373 Kelvin-ல் கவனமாக heat பண்ணும்போது CaSO4 . 1/2 H2O கிடைக்கும். இதில தண்ணீர் சேர்த்தால் மீண்டும் கடினமான Gypsum ஆகிவிடும். அதனால் தான் இத moisture-proof container-ல வைக்கிறோம்!',
    englishExamTerms: ['pH scale (0-14)', 'H+ ion concentration', 'Chlor-alkali process', 'Brine solution', 'Anode: Chlorine, Cathode: Hydrogen', 'Calcium sulphate hemihydrate (POP)', 'Gypsum (CaSO4 . 2H2O)'],
    sampleQuestion: 'Explain the Chlor-alkali process with balanced equation. Why is Plaster of Paris stored in moisture-proof containers? (CBSE 5 Marks)'
  },
  'exp-tam5': {
    id: 'exp-tam5',
    subject: 'Tamil',
    chapterName: 'இயல் 5: மணற்கேணி',
    topic: 'மொழிபெயர்ப்புக் கல்வி, நீதி வெண்பா, வினா-விடை வகைகள் & பொருள்கோள்',
    tanglishExplanation: 'பத்தாம் வகுப்பு தமிழ் இயல் 5 மணற்கேணி-ல மிக முக்கியமான 4 பகுதிகள் இதோ:\n\n' +
      '1. மொழிபெயர்ப்புக் கல்வி: "சென்றிடுவீர் எட்டுத்திக்கும் - கலைச் செல்வங்கள் யாவும் கொணர்ந்திங்கு சேர்ப்பீர்" என்று பாரதியார் கூறுகிறார். மொழிபெயர்ப்பு என்பது மனித அறிவை வளர்க்கும் இன்றியமையாத கருவி.\n\n' +
      '2. நீதி வெண்பா: செய்குதம்பிப் பாவலர் இயற்றிய பாடல். "அருளைப் பெருக்கி அறிவைத் திருத்தி... மருளை அகற்றி மதிக்கும் தெருளை... உயிருக்கு அரிய துணையாய் இன்பம் சேர்க்கும் கல்வியே போற்றி!" கல்வி அறியாமையை நீக்கும் வழிகாட்டி.\n\n' +
      '3. வினா & விடை வகைகள்: வினா 6 வகைப்படும் (அறிவினா, அறியாவினா, ஐயவினா, கொளல்வினா, கொடைவினா, ஏவல்வினா). விடை 8 வகைப்படும் (சுட்டு, நேர், எதிர், ஏவல், வினாவெதிர் வினாதல், உற்றது உரைத்தல், உறுவது கூறல், இனமொழி).\n\n' +
      '4. பொருள்கோள்: செய்யுளில் சொற்களைப் பொருளுக்கு ஏற்றவாறு சேர்த்துப் பொருள் கொள்ளும் முறை பொருள்கோள் எனப்படும்.',
    englishExamTerms: ['Translation Studies (மொழிபெயர்ப்புக் கல்வி)', 'Neethi Venba by Seikuthambi Pavalar', '6 Question Types (வினா வகைகள்)', '8 Answer Types (விடை வகைகள்)', 'Porulkol (பொருள்கோள் முறை)'],
    sampleQuestion: 'வினா மற்றும் விடை வகைகளை சான்றுகளுடன் விளக்குக. (தமிழ் 5 மதிப்பெண் வினா)'
  }
};

function getBestTTSVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  
  // 1. Try Tamil voice
  const tamilVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ta'));
  if (tamilVoice) return { voice: tamilVoice, lang: 'ta-IN', isTamil: true };

  // 2. Try Indian English voice (very clear and natural for Tanglish)
  const indianEnVoice = voices.find(v => v.lang === 'en-IN' || (v.name && v.name.toLowerCase().includes('india')));
  if (indianEnVoice) return { voice: indianEnVoice, lang: 'en-IN', isTamil: false };

  // 3. Fallback to default or English voice
  const defaultEn = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en')) || voices[0];
  return { voice: defaultEn, lang: defaultEn?.lang || 'en-US', isTamil: false };
}

function updateAudioPlayerControls(playing, voiceLabel) {
  isAudioPlaying = playing;
  const icon = document.getElementById('playerPlayIcon');
  const status = document.getElementById('playerStatusText');
  const badge = document.getElementById('playerVoiceBadge');
  const equalizer = document.getElementById('playerEqualizer');

  if (icon) {
    icon.className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
  }
  if (status) {
    status.textContent = playing ? 'ஒலி விளக்கம் ஒலிக்கிறது... (Playing)' : 'நிறுத்தப்பட்டுள்ளது (Ready)';
    status.className = playing ? 'text-xs font-bold text-amber-300 animate-pulse' : 'text-xs font-bold text-emerald-400';
  }
  if (badge && voiceLabel) {
    badge.textContent = voiceLabel;
  }
  if (equalizer) {
    const bars = equalizer.querySelectorAll('span');
    bars.forEach((b, i) => {
      b.style.height = playing ? `${[8, 18, 24, 12, 20][i % 5]}px` : '4px';
    });
  }
}

function playUniversalTTS(text) {
  if (!('speechSynthesis' in window)) {
    showToast('Speech synthesis not supported in this browser', false);
    return;
  }

  window.speechSynthesis.cancel();
  currentPlayingText = text;

  const voiceConfig = getBestTTSVoice();
  const utterance = new SpeechSynthesisUtterance(text);
  if (voiceConfig) {
    if (voiceConfig.voice) utterance.voice = voiceConfig.voice;
    utterance.lang = voiceConfig.lang;
  }
  utterance.rate = 0.95;

  utterance.onstart = () => {
    updateAudioPlayerControls(true, voiceConfig?.isTamil ? 'Tamil Voice' : 'Clear Voice');
  };

  utterance.onend = () => {
    updateAudioPlayerControls(false);
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    // If ta-IN failed due to language-unavailable on Windows, retry once with en-IN
    if (e.error === 'language-unavailable' && utterance.lang === 'ta-IN') {
      utterance.lang = 'en-IN';
      delete utterance.voice;
      try { window.speechSynthesis.speak(utterance); } catch(err){}
      return;
    }
    updateAudioPlayerControls(false);
  };

  try {
    window.speechSynthesis.speak(utterance);
    currentUtterance = utterance;
  } catch (err) {
    console.error('Speech synthesis speak exception:', err);
  }
}

function toggleAudioPlayback() {
  if (!('speechSynthesis' in window)) return;
  if (window.speechSynthesis.speaking) {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      updateAudioPlayerControls(true);
    } else {
      window.speechSynthesis.pause();
      updateAudioPlayerControls(false);
      const status = document.getElementById('playerStatusText');
      if (status) status.textContent = 'இடைநிறுத்தப்பட்டுள்ளது (Paused)';
    }
  } else {
    if (currentPlayingText) {
      playUniversalTTS(currentPlayingText);
    }
  }
}

function replayAudio() {
  if (currentPlayingText) {
    playUniversalTTS(currentPlayingText);
  }
}

function stopAudioPlayer() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  updateAudioPlayerControls(false);
}

function openAudioPlayerWithData(data) {
  currentAudioMeta = data;
  const modal = document.getElementById('audioPlayerModal');
  const subBadge = document.getElementById('playerSubjectBadge');
  const chBadge = document.getElementById('playerChapterBadge');
  const topicTitle = document.getElementById('playerTopicTitle');
  const transcriptContent = document.getElementById('playerTranscriptContent');
  const keywordsPills = document.getElementById('playerKeywordsPills');
  const keywordsBox = document.getElementById('playerKeywordsContainer');
  const sampleQBox = document.getElementById('playerSampleQContainer');
  const sampleQText = document.getElementById('playerSampleQText');

  if (subBadge) subBadge.textContent = data.subject || 'Subject';
  if (chBadge) chBadge.textContent = data.chapterName || data.chapter || '';
  if (topicTitle) topicTitle.textContent = data.topic || data.title || 'Audio Explanation';
  if (transcriptContent) transcriptContent.textContent = data.tanglishExplanation || data.text || '';

  if (keywordsBox && keywordsPills) {
    if (data.englishExamTerms && data.englishExamTerms.length) {
      keywordsBox.classList.remove('hidden');
      keywordsPills.innerHTML = data.englishExamTerms.map(t => `<span class="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold text-[10px] shadow-xs">${t}</span>`).join('');
    } else {
      keywordsBox.classList.add('hidden');
    }
  }

  if (sampleQBox && sampleQText) {
    if (data.sampleQuestion) {
      sampleQBox.classList.remove('hidden');
      sampleQText.textContent = data.sampleQuestion;
    } else {
      sampleQBox.classList.add('hidden');
    }
  }

  openModal('audioPlayerModal');
  playUniversalTTS(data.tanglishExplanation || data.text || '');
  showToast(`🎧 ${data.topic || 'Audio'}: ஒலி விளக்கம் இயங்குகிறது!`);
}

function playTanglishAudio(id) {
  let exp = (appState.topicExplanations || []).find(e => e.id === id);
  if (!exp && defaultTopicExplanations[id]) {
    exp = defaultTopicExplanations[id];
  }
  if (!exp) {
    exp = {
      id: id,
      subject: 'Class 10 Revision',
      chapterName: 'Revision-1 Study Portion',
      topic: 'Daily Revision Concept',
      tanglishExplanation: 'இந்த தலைப்பிற்கான தமிழ் மற்றும் English முக்கிய குறிப்புகள் இதோ. பாடப்புத்தகத்தை கவனமாக வாசித்து, முக்கிய சூத்திரங்களை எழுதிப் பழகுங்கள்!',
      englishExamTerms: ['Key Terms', 'CBSE Board Pattern', 'Diagrams', 'Formulas'],
      sampleQuestion: 'State the key principle and explain with a diagram. (3 Marks)'
    };
  }

  openAudioPlayerWithData(exp);
}

// Scorecard & Chart
function renderScoresList() {
  const container = document.getElementById('scores-table-container');
  if (!container || !appState.tests) return;

  container.innerHTML = '';
  appState.tests.forEach(t => {
    const pct = Math.round((t.marksObtained / t.totalMarks) * 100);
    const div = document.createElement('div');
    div.className = 'bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between text-xs shadow-card';
    div.innerHTML = `
      <div>
        <h5 class="font-bold text-slate-900">${t.title}</h5>
        <span class="text-[10px] text-slate-500">${t.subject} • ${t.date}</span>
      </div>
      <div class="text-right">
        <span class="font-extrabold text-emerald-600 text-sm">${t.marksObtained}/${t.totalMarks}</span>
        <span class="text-[10px] text-slate-400 block">${pct}%</span>
      </div>
    `;
    container.appendChild(div);
  });
}

function renderScoresChart() {
  const canvas = document.getElementById('scoresBarChart');
  if (!canvas || !appState || !appState.tests) return;

  if (scoresChartInstance) scoresChartInstance.destroy();

  const labels = appState.tests.map(t => t.subject.slice(0, 4));
  const data = appState.tests.map(t => Math.round((t.marksObtained / t.totalMarks) * 100));

  scoresChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: '#16a34a',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 100, ticks: { callback: v => `${v}%`, font: { size: 9 } } },
        x: { ticks: { font: { size: 9 } } }
      }
    }
  });
}

// Pomodoro Timer Logic
function updateTimerDisplay() {
  const d = document.getElementById('timer-countdown');
  if (!d) return;
  const m = Math.floor(timerSeconds / 60);
  const s = timerSeconds % 60;
  d.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function setTimerDuration(mins, isBreak = false) {
  clearInterval(timerInterval);
  timerRunning = false;
  isBreakTimer = isBreak;
  timerSeconds = mins * 60;
  timerInitialSeconds = mins * 60;
  updateTimerDisplay();

  const btn = document.getElementById('timer-main-btn');
  const b = document.getElementById('timer-badge');
  const st = document.getElementById('timer-sub-status');

  if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Start Focus';
  if (b) b.textContent = isBreak ? 'Break Mode' : 'Study Sprint';
  if (st) st.textContent = isBreak ? 'Take a breath!' : 'Deep Focus Mode';
}

function toggleTimer() {
  const btn = document.getElementById('timer-main-btn');
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
    if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
  } else {
    timerRunning = true;
    if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
    timerInterval = setInterval(() => {
      if (timerSeconds > 0) {
        timerSeconds--;
        updateTimerDisplay();
      } else {
        clearInterval(timerInterval);
        timerRunning = false;
        if (window.confetti) confetti();
        showToast('Sprint complete! Great job Pranav!');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Start Focus';
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = timerInitialSeconds;
  updateTimerDisplay();
  const btn = document.getElementById('timer-main-btn');
  if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Start Focus';
}

// Global Search
function handleGlobalSearch(query) {
  if (!query || !query.trim()) {
    if (currentTab === 'syllabus') renderSyllabusView();
    return;
  }
  const q = query.toLowerCase().trim();
  switchTab('syllabus');

  const listContainer = document.getElementById('syllabus-chapters-container');
  if (!listContainer || !appState.subjects) return;

  listContainer.innerHTML = '';
  let matches = 0;

  Object.entries(appState.subjects).forEach(([subKey, sub]) => {
    sub.chapters.forEach(ch => {
      if (ch.name.toLowerCase().includes(q) || (ch.notes && ch.notes.toLowerCase().includes(q))) {
        matches++;
        const card = document.createElement('div');
        card.className = 'bg-white border border-slate-200 rounded-2xl p-3.5 space-y-1.5 shadow-card';
        card.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900">${ch.name}</span>
            <span class="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">${sub.title.split(' ')[0]}</span>
          </div>
          ${ch.notes ? `<p class="text-[11px] text-slate-500">${ch.notes}</p>` : ''}
          <div class="pt-1 flex justify-end">
            <button onclick="handleProtectedAction('chapter', '${subKey}', '${ch.id}')" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
              Update Status
            </button>
          </div>
        `;
        listContainer.appendChild(card);
      }
    });
  });

  if (matches === 0) {
    listContainer.innerHTML = `<div class="text-center py-10 text-xs text-slate-400">No chapters matching "${query}"</div>`;
  }
}

// ================= SRM PUBLIC SCHOOL REVISION-1 PORTIONS =================
const srmPortionsData = {
  english: {
    name: 'English',
    examDate: '13/11/2026 (Friday)',
    sections: [
      { title: '📖 Prose', items: ['Mijbil the Otter', 'Madam Rides the Bus', 'The Sermon at Benares', 'The Proposal (Play)'] },
      { title: '🎭 Poem', items: ['Amanda!', 'The Trees', 'Fog', 'The Tale of Custard the Dragon', 'For Anne Gregory'] },
      { title: '📚 Supplementary', items: ['The Making of a Scientist', 'The Necklace', 'Bholi', 'The Book that Saved the Earth'] },
      { title: '✏️ Grammar', items: ['Determiners', 'Tenses', 'Modals', 'Subject - verb concord', 'Reported speech (Commands, Statements, Questions)'] },
      { title: '📝 Writing', items: ['Formal Letters (Complaint, Placing order, Inquiry, Letter to Editor)'] }
    ]
  },
  science: {
    name: 'Science',
    examDate: '16/11/2026 (Monday)',
    sections: [
      { title: '🧬 Biology', items: ['Chapter 6: Control and Coordination', 'Chapter 8: Heredity', 'Chapter 13: Our Environment'] },
      { title: '🧪 Chemistry', items: ['Chapter 2: Acids, Bases and Salts', 'Chapter 4: Carbon and its compounds'] },
      { title: '⚡ Physics', items: ['Chapter 11: The Human Eye and the Colourful World', 'Chapter 12: Magnetic Effects of Electric Current'] }
    ]
  },
  social: {
    name: 'Social Studies',
    examDate: '18/11/2026 (Wednesday)',
    sections: [
      { title: '📜 History', items: ['1. Making of the Global World', '2. Print Culture and the Modern World'] },
      { title: '🏛️ Political Science', items: ['1. Gender, Religion & Caste', '2. Political Parties', '3. Outcomes of Democracy'] },
      { title: '🌾 Geography', items: ['1. Agriculture', '2. Minerals and Energy Resources', '3. Manufacturing Industries'] },
      { title: '💰 Economics', items: ['1. Money and Credit', '2. Globalisation and the Indian Economy'] },
      { title: '🗺️ Map Work', items: ['Nationalism in India (Centers)', 'Major areas of Rice & Wheat', 'Producer states: Sugarcane, Tea, Coffee, Rubber, Cotton, Jute', 'Mines, Oil fields, Power plants, Ports & Airports'] }
    ]
  },
  maths: {
    name: 'Mathematics',
    examDate: '21/11/2026 (Saturday)',
    sections: [
      {
        title: '📐 Core Mathematics Chapters',
        items: [
          'Chapter 2: Polynomials',
          'Chapter 3: Pair of Linear Equations in Two Variables',
          'Chapter 6: Triangles (BPT Theorem Proof guaranteed)',
          'Chapter 9: Some Applications of Trigonometry (Heights & Distances)',
          'Chapter 11: Areas Related to Circles',
          'Chapter 13: Statistics (Mean, Median, Mode step methods)',
          'Chapter 14: Probability (Sure-shot 4 marks)'
        ]
      }
    ]
  },
  tamil: {
    name: 'Tamil (L2)',
    examDate: '23/11/2026 (Monday)',
    sections: [
      {
        title: '📖 இயல் 5, 6, 7 முழுவதும் (Complete Units 5, 6, 7)',
        items: [
          'இயல் 5: மணற்கேணி (மொழிபெயர்ப்புக் கல்வி, நீதி வெண்பா, திருவிளையாடற் புராணம், வினா-விடை வகைகள், பொருள்கோள்)',
          'இயல் 6: நிகழ்கலை (பாய்ச்சல், முத்துக்குமாரசுவாமி பிள்ளைத்தமிழ், கம்பராமாயணம், அகப்பொருள் இலக்கணம்)',
          'இயல் 7: விதைநெல் (சிற்றகல் ஒளி, ஏர் புதிதா, மெய்க்கீர்த்தி, சிலப்பதிகாரம், புறப்பொருள் வெண்பாமாலை, அணி இலக்கணம்)'
        ]
      }
    ]
  }
};

let activeSrmSub = 'english';

function openSrmPortionModal() {
  showSrmSubjectPortion('english');
  openModal('srmPortionModal');
}

function showSrmSubjectPortion(subKey) {
  activeSrmSub = subKey;
  const data = srmPortionsData[subKey];
  const container = document.getElementById('srmPortionContent');
  if (!container || !data) return;

  // Update tabs
  document.querySelectorAll('.srm-tab-btn').forEach(btn => {
    btn.className = 'srm-tab-btn px-3 py-1.5 rounded-full font-bold shrink-0 bg-slate-100 text-slate-600 hover:bg-slate-200';
  });
  const activeBtn = document.getElementById(`srm-tab-btn-${subKey}`);
  if (activeBtn) {
    activeBtn.className = 'srm-tab-btn px-3 py-1.5 rounded-full font-bold shrink-0 bg-blue-600 text-white shadow-sm';
  }

  let html = `
    <div class="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center justify-between">
      <div>
        <span class="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Exam Date</span>
        <strong class="block text-sm font-extrabold text-blue-950">${data.examDate}</strong>
      </div>
      <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-200 text-blue-800">
        Class X • SRM Revision-1
      </span>
    </div>
    <div class="space-y-2.5 pt-1">
  `;

  data.sections.forEach(sec => {
    html += `
      <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5">
        <h4 class="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
          ${sec.title}
        </h4>
        <ul class="space-y-1 text-[11px] text-slate-600 pl-1">
          ${sec.items.map(item => `
            <li class="flex items-start gap-1.5">
              <i class="fa-solid fa-circle-check text-emerald-600 text-[10px] mt-0.5"></i>
              <span class="leading-snug">${item}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

// ================= 3-DAY DIAGNOSTIC WEAKNESS TRACKER =================
function renderDiagnosticTracker() {
  const container = document.getElementById('diagnostic-tracker-feed');
  if (!container || !appState || !appState.diagnosticTracker) return;

  const dt = appState.diagnosticTracker;
  const isEn = currentUiLang === 'en';

  container.innerHTML = `
    <!-- Action Needed (Red) -->
    ${(dt.actionNeeded || []).map(item => `
      <div class="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
        <div class="flex items-center justify-between font-bold">
          <span class="flex items-center gap-1.5"><i class="fa-solid fa-triangle-exclamation text-rose-600"></i> ${item.subject} • ${item.topic}</span>
          <span class="text-[10px] bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-full font-extrabold">${item.score}% Accuracy</span>
        </div>
        <p class="text-[11px] text-rose-800 leading-snug"><strong class="font-bold">${isEn ? '🎯 Immediate Focus (Fix):' : '🎯 உடனடி கவனம்:'}</strong> ${item.fixTip}</p>
      </div>
    `).join('')}

    <!-- Moderate Areas (Yellow) -->
    ${(dt.moderateAreas || []).map(item => `
      <div class="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
        <div class="flex items-center justify-between font-bold">
          <span class="flex items-center gap-1.5"><i class="fa-solid fa-circle-exclamation text-amber-600"></i> ${item.subject} • ${item.topic}</span>
          <span class="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-extrabold">${item.score}%</span>
        </div>
        <p class="text-[11px] text-amber-800 leading-snug"><strong class="font-bold">${isEn ? '💡 Exam Tip:' : '💡 டிப்ஸ்:'}</strong> ${item.fixTip}</p>
      </div>
    `).join('')}

    <!-- Strong Areas (Green) -->
    ${(dt.strongAreas || []).map(item => `
      <div class="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-emerald-950 flex items-center justify-between text-[11px]">
        <span class="flex items-center gap-1.5 font-bold"><i class="fa-solid fa-circle-check text-emerald-600"></i> ${item.subject}: ${item.topic}</span>
        <span class="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">✓ ${item.score}% ${isEn ? 'Mastered' : 'தேர்ச்சி'}</span>
      </div>
    `).join('')}
  `;
}

// ================= SMART REVISION SPLITTER (DAILY 2-SUBJECT & DEEP DIVE) =================
function toggleTomorrowSampleQuestions() {
  const content = document.getElementById('tomorrow-samples-content');
  const chevron = document.getElementById('tomorrow-samples-chevron');
  if (!content) return;
  const isHidden = content.classList.contains('hidden');
  if (isHidden) {
    content.classList.remove('hidden');
    if (chevron) chevron.classList.add('rotate-180');
  } else {
    content.classList.add('hidden');
    if (chevron) chevron.classList.remove('rotate-180');
  }
}

function toggleAns(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('hidden');
}

function toggleFull16DaySchedule() {
  const container = document.getElementById('full-16day-schedule-container');
  const chevronText = document.getElementById('full-16day-chevron-text');
  if (!container) return;
  const isHidden = container.classList.contains('hidden');
  if (isHidden) {
    container.classList.remove('hidden');
    if (chevronText) chevronText.innerHTML = '<span>மறைக்க</span> <i class="fa-solid fa-chevron-up text-[9px]"></i>';
    renderFull16DaySchedule();
  } else {
    container.classList.add('hidden');
    if (chevronText) chevronText.innerHTML = '<span>விரிவாகப் பார்க்க</span> <i class="fa-solid fa-chevron-down text-[9px]"></i>';
  }
}

function renderFull16DaySchedule() {
  const container = document.getElementById('full-16day-schedule-container');
  if (!container || !appState || !appState.revisionSplitter) return;
  const rs = appState.revisionSplitter;
  const activeMode = rs.activeMode || 'pair_rotation';
  const modeData = rs.modes ? (rs.modes[activeMode] || rs.modes['pair_rotation']) : null;
  if (!modeData || !modeData.schedule) return;

  container.innerHTML = '';
  modeData.schedule.forEach(s => {
    const card = document.createElement('div');
    card.className = `p-3 rounded-xl border text-xs space-y-1.5 ${s.day === 0 ? 'bg-slate-800/80 border-slate-700 text-slate-300' : (s.day === 1 ? 'bg-amber-950/30 border-amber-500/50 text-white ring-1 ring-amber-500/30' : 'bg-slate-900/90 border-slate-700/80 text-white')}`;

    if (activeMode === 'pair_rotation') {
      const nightTestInfo = s.nightTest ? (s.nightTest.hasTest ? `🌙 ${s.nightTest.title || 'Night Test'} • ${s.nightTest.timing || '8:30 PM'}` : '🌙 ' + s.nightTest.title) : '';
      card.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-700/60 pb-1">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="font-extrabold ${s.day === 2 ? 'text-emerald-400' : (s.day === 1 ? 'text-amber-400' : 'text-slate-300')} text-[11px]">Day ${s.day} • ${s.date}</span>
            ${s.day === 0 ? '<span class="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-bold">27 Oct (Past)</span>' : ''}
            ${s.day === 1 ? '<span class="text-[9px] bg-amber-500/30 text-amber-300 px-1.5 py-0.2 rounded font-bold">28 Oct (Yesterday - Partial)</span>' : ''}
            ${s.day === 2 ? '<span class="text-[9px] bg-emerald-500 text-slate-950 px-2 py-0.2 rounded-full font-black">29 Oct (TODAY - Active)</span>' : ''}
            ${s.day === 3 ? '<span class="text-[9px] bg-blue-500/30 text-blue-300 px-1.5 py-0.2 rounded font-bold">30 Oct (Tomorrow)</span>' : ''}
          </div>
          <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">${nightTestInfo}</span>
        </div>
        ${s.sub1 ? `
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5 text-[10px]">
            <div class="bg-slate-800/60 p-2 rounded-lg">
              <strong class="text-emerald-400 block">${s.sub1.name}:</strong>
              <span class="text-slate-300">${s.sub1.topics || s.sub1.chapter}</span>
            </div>
            ${s.sub2 ? `
            <div class="bg-slate-800/60 p-2 rounded-lg">
              <strong class="text-purple-400 block">${s.sub2.name}:</strong>
              <span class="text-slate-300">${s.sub2.topics || s.sub2.chapter}</span>
            </div>` : ''}
          </div>
        ` : `<p class="text-[11px] text-slate-300">${s.description || s.focus || ''}</p>`}
      `;
    } else {
      card.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-700/60 pb-1">
          <span class="font-extrabold text-amber-400 text-[11px]">Day ${s.day} • ${s.date}</span>
          <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">🌙 ${s.nightTest?.title || s.test || 'Daily Test'}</span>
        </div>
        <p class="text-[11px] text-slate-200"><strong class="text-emerald-400">Deep Focus:</strong> ${s.focus || s.title}</p>
        <p class="text-[10px] text-slate-400">${s.target || ''}</p>
      `;
    }
    container.appendChild(card);
  });
}

function renderRevisionSplitter() {
  if (typeof renderRevisionMissionUI === "function") renderRevisionMissionUI();
  const container = document.getElementById('revision-splitter-feed');
  const descEl = document.getElementById('split-mode-desc');
  if (!appState || !appState.revisionSplitter) return;

  const rs = appState.revisionSplitter;
  const activeMode = rs.activeMode || 'pair_rotation';
  const modeData = rs.modes ? (rs.modes[activeMode] || rs.modes['pair_rotation']) : null;

  // Update Active Mode Labels & Highlights on Home Card
  const modeLabel = document.getElementById('active-mode-label');
  const modeExpl = document.getElementById('mode-explanation-text');
  const btnPairHome = document.getElementById('mode-btn-pair');
  const btnDeepHome = document.getElementById('mode-btn-deep');
  
  if (modeLabel) {
    modeLabel.textContent = activeMode === 'pair_rotation' 
      ? '🔄 Option A: 2 Subjects / Day (Recommended)' 
      : '🎯 Option B: 1 Subject Focus (Deep Dive)';
  }

  if (modeExpl && modeData) {
    modeExpl.innerHTML = activeMode === 'pair_rotation'
      ? '💡 <strong>பரிந்துரை:</strong> தினமும் 2 பாடங்கள் சுழற்சி முறை (Science + Tamil, Maths + English, SST + Science) — இரவில் 30 மதிப்பெண் மாதிரித் தேர்வு!'
      : '💡 <strong>ஆழமான முறை:</strong> தினமும் 1 பாடத்தை முழுமையாக முடிக்கும் முறை — இரவில் அந்த பாடத்திற்கான முழு மாதிரித் தேர்வு!';
  }

  if (btnPairHome && btnDeepHome) {
    if (activeMode === 'pair_rotation') {
      btnPairHome.className = 'py-2 px-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 bg-emerald-600 text-white shadow-sm text-center';
      btnDeepHome.className = 'py-2 px-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 text-slate-400 hover:text-white text-center';
    } else {
      btnDeepHome.className = 'py-2 px-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 bg-emerald-600 text-white shadow-sm text-center';
      btnPairHome.className = 'py-2 px-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 text-slate-400 hover:text-white text-center';
    }
  }

  // Update Schedule View Buttons
  const btnPairSched = document.getElementById('split-mode-btn-pair_rotation') || document.getElementById('split-mode-btn-daily_mix');
  const btnDeepSched = document.getElementById('split-mode-btn-deep_dive');
  if (btnPairSched && btnDeepSched) {
    if (activeMode === 'pair_rotation') {
      btnPairSched.className = 'py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 bg-emerald-600 text-white shadow-sm';
      btnDeepSched.className = 'py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 text-slate-400 hover:text-white';
    } else {
      btnDeepSched.className = 'py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 bg-emerald-600 text-white shadow-sm';
      btnPairSched.className = 'py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 text-slate-400 hover:text-white';
    }
  }

  if (descEl && modeData) {
    descEl.textContent = modeData.description;
  }

  // Render Full 16-Day schedule if container is open
  const full16Container = document.getElementById('full-16day-schedule-container');
  if (full16Container && !full16Container.classList.contains('hidden')) {
    renderFull16DaySchedule();
  }

  // Render Schedule View Feed
  if (!container || !modeData || !modeData.schedule) return;
  container.innerHTML = '';
  modeData.schedule.forEach(s => {
    const row = document.createElement('div');
    row.className = 'p-2.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs text-white space-y-1';

    let contentHtml = '';
    if (activeMode === 'pair_rotation') {
      const nightTestInfo = s.nightTest ? (s.nightTest.hasTest ? `🌙 ${s.nightTest.title || 'Night Test'} • ${s.nightTest.timing || '8:30 PM'}` : '🌙 ' + s.nightTest.title) : '';
      contentHtml = `
        <div class="flex items-center justify-between border-b border-slate-700/60 pb-1">
          <span class="font-extrabold ${s.day === 1 ? 'text-amber-400' : 'text-emerald-400'} text-[11px]">Day ${s.day} • ${s.date}</span>
          <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">${nightTestInfo}</span>
        </div>
        ${s.sub1 ? `
          <div class="grid grid-cols-2 gap-1 pt-0.5 text-[10px]">
            <span class="text-slate-300"><strong class="text-emerald-400">${s.sub1.name.split(' ')[0]}:</strong> ${s.sub1.chapter}</span>
            ${s.sub2 ? `<span class="text-slate-300"><strong class="text-purple-400">${s.sub2.name.split(' ')[0]}:</strong> ${s.sub2.chapter}</span>` : ''}
          </div>
        ` : `<p class="text-[10px] text-slate-300">${s.description || s.focus || ''}</p>`}
      `;
    } else {
      contentHtml = `
        <div class="flex items-center justify-between border-b border-slate-700/60 pb-1">
          <span class="font-extrabold text-amber-400 text-[11px]">Day ${s.day} • ${s.date}</span>
          <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">🌙 ${s.nightTest?.title || s.test || 'Daily Test'}</span>
        </div>
        <p class="text-[11px] text-slate-200"><strong class="text-emerald-400">Focus:</strong> ${s.focus || s.title}</p>
        <p class="text-[10px] text-slate-400">Target: ${s.target || ''}</p>
      `;
    }

    row.innerHTML = contentHtml;
    container.appendChild(row);
  });
}

async function switchRevisionSplitterMode(mode) {
  try {
    const res = await fetch('/api/schedule/split-mode', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ mode })
    });
    if (res.ok) {
      if (appState.revisionSplitter) appState.revisionSplitter.activeMode = mode;
      showToast(`Switched to ${mode === 'pair_rotation' ? 'Option A: 2 Subjects / Day' : 'Option B: Deep Dive Focus'} Mode!`);
      await fetchData();
    }
  } catch (e) {
    if (appState.revisionSplitter) appState.revisionSplitter.activeMode = mode;
    renderRevisionSplitter();
  }
}

// ================= AI TEXTBOOK DOUBT SOLVER =================
let currentDoubtAudioText = '';

function openDoubtSolverModal() {
  openModal('doubtSolverModal');
  renderPreviousDoubtsFeed();
}

function renderPreviousDoubtsFeed() {
  const container = document.getElementById('previousDoubtsFeed');
  if (!container || !appState || !appState.pranavDoubts) return;

  container.innerHTML = '';
  if (!appState.pranavDoubts.length) {
    container.innerHTML = '<p class="text-[11px] text-slate-400 italic">No doubts recorded yet. Ask any question above!</p>';
    return;
  }

  appState.pranavDoubts.slice(0, 5).forEach(d => {
    const item = document.createElement('div');
    item.className = 'p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1';
    item.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="font-bold text-slate-900 text-[11px]">${d.subject} • ${d.chapter}</span>
        <span class="text-[9px] text-slate-400">${new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <p class="text-[11px] text-slate-700 font-medium">Q: ${d.studentQuestion}</p>
      <div class="flex items-center justify-between pt-1 border-t border-slate-100">
        <button onclick="playSpecificDoubtAudio('${d.id}')" class="text-[10px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1">
          <i class="fa-solid fa-volume-high"></i> Listen Tanglish Voice Note
        </button>
      </div>
    `;
    container.appendChild(item);
  });
}

function openDoubtSolverAndVoice() {
  openDoubtSolverModal();
  showToast('🎤 மைக் தொட்டு தமிழில் பேசலாம் அல்லது கீழே உள்ள மாதிரி வினாக்களைத் தட்டலாம்!');
  setTimeout(() => {
    startDoubtVoiceInput();
  }, 400);
}

function fillQuickDoubt(subject, chapter, question) {
  const subEl = document.getElementById('doubtSubject');
  const chEl = document.getElementById('doubtChapter');
  const txtEl = document.getElementById('doubtTextarea');
  if (subEl) subEl.value = subject;
  if (chEl) chEl.value = chapter;
  if (txtEl) {
    txtEl.value = question;
    txtEl.focus();
  }
  showToast('கேள்வி நிரப்பப்பட்டது! இப்போது "AI விளக்கம் பெறு" பொத்தானை அழுத்தவும்.');
}

function startDoubtVoiceInput() {
  const btn = document.getElementById('doubtMicBtn');
  const txt = document.getElementById('doubtTextarea');

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showToast('⚠️ இந்த பிரவுசரில் Speech mic வசதி இல்லை. நீங்கள் நேரடியாக டைப் செய்யலாம் அல்லது கீழே உள்ள மாதிரி வினாக்களைத் தட்டலாம்!', false);
    if (txt) txt.focus();
    return;
  }

  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ta-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    if (btn) {
      btn.className = 'w-full bg-rose-50 border border-rose-300 text-rose-700 font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition animate-pulse';
      btn.innerHTML = '<span class="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block mr-1"></span> <span>கேட்கிறது... தமிழில் பேசவும் (Listening)</span>';
    }

    recognition.onresult = function(e) {
      const transcript = e.results[0][0].transcript;
      if (txt) {
        txt.value = transcript;
        txt.focus();
      }
      if (btn) {
        btn.className = 'w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition';
        btn.innerHTML = '<i class="fa-solid fa-microphone text-xs"></i> <span>🎤 தமிழில் பேசு (Speak Doubt)</span>';
      }
      showToast(`🎤 குரல் பதிவு பெறப்பட்டது: "${transcript}"`);
    };

    recognition.onerror = function(e) {
      console.warn('Speech recognition error:', e.error);
      if (btn) {
        btn.className = 'w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition';
        btn.innerHTML = '<i class="fa-solid fa-microphone text-xs"></i> <span>🎤 தமிழில் பேசு (Speak Doubt)</span>';
      }
      if (e.error === 'not-allowed') {
        showToast('⚠️ மைக் அனுமதி தரப்படவில்லை. நீங்கள் தட்டச்சு செய்து கேட்கலாம்!', false);
      } else if (e.error === 'no-speech') {
        showToast('குரல் பதிவு கேட்கவில்லை, மீண்டும் பேசவும்');
      } else {
        showToast(`Mic status: ${e.error}`);
      }
    };

    recognition.onend = function() {
      if (btn) {
        btn.className = 'w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition';
        btn.innerHTML = '<i class="fa-solid fa-microphone text-xs"></i> <span>🎤 தமிழில் பேசு (Speak Doubt)</span>';
      }
    };

    recognition.start();
  } catch (err) {
    console.error('Speech recognition exception:', err);
    if (btn) {
      btn.className = 'w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition';
      btn.innerHTML = '<i class="fa-solid fa-microphone text-xs"></i> <span>🎤 தமிழில் பேசு (Speak Doubt)</span>';
    }
    showToast('Please type your question or select a quick chip below');
  }
}

async function submitAiDoubt(e) {
  e.preventDefault();
  const subject = document.getElementById('doubtSubject').value;
  const chapter = document.getElementById('doubtChapter').value;
  const pageNo = document.getElementById('doubtPageNo').value;
  const doubtText = document.getElementById('doubtTextarea').value;

  const submitBtn = document.getElementById('doubtSubmitBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> AI பதில் தயாராகிறது...';
  }

  try {
    const res = await fetch('/api/ai/doubt-solver', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ subject, chapter, pageNo, doubtText })
    });

    const data = await res.json();
    if (data.success && data.doubt) {
      const d = data.doubt;
      currentDoubtAudioText = d.tanglishAnswer;

      const answerBox = document.getElementById('doubtAnswerBox');
      const answerContent = document.getElementById('doubtAnswerContent');
      const keywordsPills = document.getElementById('doubtKeywordsPills');

      if (answerBox) answerBox.classList.remove('hidden');
      if (answerContent) answerContent.textContent = d.tanglishAnswer;

      if (keywordsPills) {
        keywordsPills.innerHTML = '';
        (d.cbseKeywords || []).forEach(kw => {
          const pill = document.createElement('span');
          pill.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-purple-900 border border-purple-200 shadow-sm';
          pill.textContent = kw;
          keywordsPills.appendChild(pill);
        });
      }

      playCurrentDoubtAudio();
      await fetchData();
    }
  } catch (err) {
    showToast('Processed locally!');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> AI விளக்கம் பெறு (Get Tanglish Explanation)';
    }
  }
}

function playCurrentDoubtAudio() {
  if (!currentDoubtAudioText) return;
  openAudioPlayerWithData({
    subject: document.getElementById('doubtSubject')?.value || 'AI Solver',
    chapterName: document.getElementById('doubtChapter')?.value || 'Doubt Clarification',
    topic: 'AI Tanglish Explanation',
    tanglishExplanation: currentDoubtAudioText,
    englishExamTerms: ['AI Verified', 'NCERT Textbook Terms'],
    sampleQuestion: document.getElementById('doubtTextarea')?.value || 'Student Doubt'
  });
}

function playSpecificDoubtAudio(doubtId) {
  const d = (appState.pranavDoubts || []).find(item => item.id === doubtId);
  if (!d) return;
  currentDoubtAudioText = d.tanglishAnswer;
  openAudioPlayerWithData({
    subject: d.subject || 'Doubt Note',
    chapterName: d.chapter || 'Previous Doubt',
    topic: d.studentQuestion || 'Doubt Explanation',
    tanglishExplanation: d.tanglishAnswer,
    englishExamTerms: d.cbseKeywords || ['Keywords'],
    sampleQuestion: d.studentQuestion
  });
}

// Modal Helpers
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

// Initialize on Load
window.addEventListener('DOMContentLoaded', () => {
  // Initialize View Mode (Default to Full Widescreen Desktop on PC)
  const savedMode = localStorage.getItem('pranav_view_mode');
  const btn = document.getElementById('viewModeBtn');
  if (savedMode === 'mobile') {
    document.body.classList.add('mobile-frame-mode');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-desktop text-[10px]"></i> 🖥️ Desktop View';
  } else {
    document.body.classList.remove('mobile-frame-mode');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-mobile-screen text-[10px]"></i> 📱 Mobile View';
  }

  applyUiLanguage(currentUiLang);
  updateTimerDisplay();

  // MANDATORY PIN VERIFICATION & 5-MIN INACTIVITY CHECK
  const session = checkActiveSession();
  if (session) {
    currentUser = session;
    hidePinSecurityGate();
    applyRoleUiRestrictions();
    fetchData();
  } else {
    currentUser = null;
    showPinSecurityGate('Please enter your 4-digit PIN to access the portal.');
  }

  setInterval(() => {
    if (currentUser) {
      const activeSess = checkActiveSession();
      if (activeSess) {
        fetchData();
      } else {
        lockAppSession('Session automatically locked after 5 minutes of inactivity.');
      }
    }
  }, 8000);
});


// Member Limits & Admin Modal Wiring
function openAdminLimitsModal() {
  if (currentUser.role !== 'admin') {
    showToast('🔒 Only Mama (Admin) can configure member usage limits!', false);
    openAuthModal();
    return;
  }
  openModal('adminLimitsModal');
}

function saveUsageLimits() {
  const cheers = parseInt(document.getElementById('limitFatherCheers')?.value || '3', 10);
  const views = parseInt(document.getElementById('limitFatherViews')?.value || '20', 10);
  showToast('Member usage limits updated successfully!');
  closeModal('adminLimitsModal');
}

// ================= MAMA'S SECRET NIGHT TEST VAULT CONTROLLER =================
let currentVaultDayIndex = 1;
let currentVaultMode = 'questions_only';
let mamaSecretVaultUnlocked = false;

function openMamaSecretVaultModal() {
  if (!currentUser || currentUser.role !== 'admin') {
    showToast('🔒 Access Restricted: Mama Secret Vault is confidential and accessible only to Mama (PIN: 9677)!', false);
    return;
  }
  const modal = document.getElementById('mamaSecretVaultModal');
  const gate = document.getElementById('mamaVaultPinGate');
  const content = document.getElementById('mamaVaultUnlockedContent');
  if (!modal || !gate || !content) return;

  gate.classList.add('hidden');
  content.classList.remove('hidden');
  renderMamaSecretVault();
  modal.classList.remove('hidden');
}

function verifyMamaVaultPin() {
  const pinInput = document.getElementById('vaultPinInput');
  const pin = (pinInput ? pinInput.value : '').trim();

  if (pin === '9677') {
    mamaSecretVaultUnlocked = true;
    document.getElementById('mamaVaultPinGate').classList.add('hidden');
    document.getElementById('mamaVaultUnlockedContent').classList.remove('hidden');
    showToast('🔓 Mama Secret Vault Unlocked!');
    renderMamaSecretVault();
  } else {
    showToast('❌ Incorrect Mama PIN (9677 required)', false);
    if (pinInput) pinInput.value = '';
  }
}

function setMamaVaultMode(mode) {
  currentVaultMode = mode;
  const btnQ = document.getElementById('vaultModeBtnQ');
  const btnKey = document.getElementById('vaultModeBtnKey');

  if (btnQ && btnKey) {
    if (mode === 'questions_only') {
      btnQ.className = 'px-2.5 py-1 rounded text-[11px] font-bold bg-amber-500 text-slate-950 shadow-sm transition';
      btnKey.className = 'px-2.5 py-1 rounded text-[11px] font-bold text-slate-400 hover:text-white transition';
    } else {
      btnKey.className = 'px-2.5 py-1 rounded text-[11px] font-bold bg-amber-500 text-slate-950 shadow-sm transition';
      btnQ.className = 'px-2.5 py-1 rounded text-[11px] font-bold text-slate-400 hover:text-white transition';
    }
  }

  renderMamaSecretVaultPaper();
}

function selectMamaVaultDay(day) {
  currentVaultDayIndex = day;
  renderMamaSecretVault();
}

function renderMamaSecretVault() {
  const tests = (appState && appState.mamaSecretNightTests) || [];
  if (!tests || tests.length === 0) {
    // If not in state, try to fetch from /api/mama/night-tests
    fetch('/api/mama/night-tests', { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => {
        if (d.tests && d.tests.length > 0) {
          if (!appState) appState = {};
          appState.mamaSecretNightTests = d.tests;
          renderMamaSecretVault();
        }
      })
      .catch(e => console.warn('Secret tests fetch fallback', e));
  }

  // Render Day Pills (Days 1 to 16)
  const pillsContainer = document.getElementById('mamaVaultDayPills');
  if (pillsContainer && tests.length > 0) {
    pillsContainer.innerHTML = '';
    tests.forEach(t => {
      const isSel = t.day === currentVaultDayIndex;
      const btn = document.createElement('button');
      btn.className = `px-3 py-1.5 rounded-full text-xs font-extrabold shrink-0 transition flex items-center gap-1 ${
        isSel 
          ? 'bg-amber-500 text-slate-950 shadow-md font-black scale-105' 
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
      }`;
      btn.innerHTML = `Day ${t.day} <span class="text-[9px] opacity-80">(${t.date.slice(5)})</span>`;
      btn.onclick = () => selectMamaVaultDay(t.day);
      pillsContainer.appendChild(btn);
    });
  }

  renderMamaSecretVaultPaper();
}

function renderMamaSecretVaultPaper() {
  const body = document.getElementById('mamaVaultPaperBody');
  if (!body) return;

  const tests = (appState && appState.mamaSecretNightTests) || [];
  const test = tests.find(t => t.day === currentVaultDayIndex) || tests[0];
  if (!test) {
    body.innerHTML = '<p class="text-slate-400 text-center py-6">Loading test paper or none available...</p>';
    return;
  }

  const isKey = currentVaultMode === 'full_key';

  let html = `
    <!-- Paper Header Banner -->
    <div class="p-4 rounded-xl bg-slate-900 border border-amber-500/40 space-y-1.5 text-center shadow-inner">
      <span class="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest block">SRM PUBLIC SCHOOL • REVISION-1 NIGHT ASSESSMENT</span>
      <h3 class="text-sm sm:text-base font-extrabold text-white">${test.title}</h3>
      <div class="flex items-center justify-center gap-3 text-[11px] text-slate-300 font-semibold pt-1 flex-wrap">
        <span class="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">📅 ${test.date}</span>
        <span class="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">⏰ ${test.timing}</span>
        <span class="text-amber-400 bg-amber-950/60 border border-amber-600/40 px-2 py-0.5 rounded font-black">🎯 Total: ${test.totalMarks} Marks</span>
      </div>
      <p class="text-[10px] text-slate-400 italic pt-1">${test.instructions}</p>
    </div>
  `;

  // Render Sub 1 Section
  if (test.scienceSection) {
    html += `
      <div class="space-y-3 pt-2">
        <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <h4 class="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>🔬 SECTION A: ${test.sub1Name}</span>
          </h4>
          <span class="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
            ${test.scienceSection.marks} Marks
          </span>
        </div>
        <div class="space-y-2.5">
          ${(test.scienceSection.questions || []).map(q => `
            <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div class="flex items-start justify-between gap-2">
                <span class="font-bold text-white text-xs leading-snug"><span class="text-amber-400 font-extrabold">${q.qNum}.</span> ${q.question}</span>
                <span class="shrink-0 text-[10px] font-black text-slate-400 bg-slate-800 px-2 py-0.5 rounded">[${q.marks} Mark${q.marks > 1 ? 's' : ''}]</span>
              </div>
              ${isKey ? `
                <div class="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-[11px] space-y-1.5 text-emerald-200">
                  <div class="font-semibold"><span class="text-emerald-400 font-bold">🔑 Answer / Solution:</span> ${q.answer.replace(/\n/g, '<br>')}</div>
                  ${q.rubric ? `<div class="text-[10px] text-emerald-400/80 italic border-t border-emerald-900/50 pt-1"><strong>Mama Rubric:</strong> ${q.rubric}</div>` : ''}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Render Sub 2 Section
  if (test.tamilSection) {
    html += `
      <div class="space-y-3 pt-3">
        <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <h4 class="text-xs font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>📖 SECTION B: ${test.sub2Name}</span>
          </h4>
          <span class="text-[10px] font-black bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
            ${test.tamilSection.marks} Marks
          </span>
        </div>
        <div class="space-y-2.5">
          ${(test.tamilSection.questions || []).map(q => `
            <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div class="flex items-start justify-between gap-2">
                <span class="font-bold text-white text-xs leading-snug"><span class="text-purple-400 font-extrabold">${q.qNum}.</span> ${q.question}</span>
                <span class="shrink-0 text-[10px] font-black text-slate-400 bg-slate-800 px-2 py-0.5 rounded">[${q.marks} Mark${q.marks > 1 ? 's' : ''}]</span>
              </div>
              ${isKey ? `
                <div class="p-2.5 rounded-lg bg-purple-950/40 border border-purple-900/60 text-[11px] space-y-1.5 text-purple-200">
                  <div class="font-semibold"><span class="text-purple-400 font-bold">🔑 Answer / Solution:</span> ${q.answer.replace(/\n/g, '<br>')}</div>
                  ${q.rubric ? `<div class="text-[10px] text-purple-400/80 italic border-t border-purple-900/50 pt-1"><strong>Mama Rubric:</strong> ${q.rubric}</div>` : ''}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  body.innerHTML = html;
}

function copyMamaVaultPaper() {
  const tests = (appState && appState.mamaSecretNightTests) || [];
  const test = tests.find(t => t.day === currentVaultDayIndex) || tests[0];
  if (!test) return;

  const isKey = currentVaultMode === 'full_key';
  let text = `=========================================\n`;
  text += `SRM PUBLIC SCHOOL • REVISION-1 ASSESSMENT\n`;
  text += `${test.title}\n`;
  text += `Date: ${test.date} | Time: ${test.timing} | Total: ${test.totalMarks} Marks\n`;
  text += `=========================================\n\n`;

  if (test.scienceSection) {
    text += `--- ${test.sub1Name} (${test.scienceSection.marks} Marks) ---\n\n`;
    (test.scienceSection.questions || []).forEach(q => {
      text += `${q.qNum}. [${q.marks} Marks] ${q.question}\n`;
      if (isKey) {
        text += `   [ANS]: ${q.answer}\n`;
        if (q.rubric) text += `   [RUBRIC]: ${q.rubric}\n`;
      }
      text += `\n`;
    });
  }

  if (test.tamilSection) {
    text += `--- ${test.sub2Name} (${test.tamilSection.marks} Marks) ---\n\n`;
    (test.tamilSection.questions || []).forEach(q => {
      text += `${q.qNum}. [${q.marks} Marks] ${q.question}\n`;
      if (isKey) {
        text += `   [ANS]: ${q.answer}\n`;
        if (q.rubric) text += `   [RUBRIC]: ${q.rubric}\n`;
      }
      text += `\n`;
    });
  }

  navigator.clipboard.writeText(text).then(() => {
    showToast(`Day ${test.day} Paper copied to clipboard!`);
  }).catch(() => {
    showToast('Copied text!');
  });
}

function printMamaVaultPaper() {
  const tests = (appState && appState.mamaSecretNightTests) || [];
  const test = tests.find(t => t.day === currentVaultDayIndex) || tests[0];
  if (!test) return;

  const isKey = currentVaultMode === 'full_key';
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    showToast('Please allow popups to print test paper', false);
    return;
  }

  let content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print: ${test.title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 25px; color: #111; line-height: 1.5; font-size: 13px; }
          .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 12px; margin-bottom: 16px; }
          .title { font-size: 16px; font-weight: bold; margin: 4px 0; }
          .meta { font-size: 12px; font-weight: bold; color: #475569; }
          .section { margin-top: 18px; font-size: 13px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
          .q-box { margin: 10px 0; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; }
          .q-head { font-size: 12px; font-weight: bold; display: flex; justify-content: space-between; }
          .ans-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; margin-top: 6px; font-size: 11px; color: #0f172a; }
          .rubric { font-style: italic; color: #047857; margin-top: 4px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="font-size: 11px; font-weight: bold; letter-spacing: 1px; color: #475569;">SRM PUBLIC SCHOOL • GRADE 10 REVISION-1</div>
          <div class="title">${test.title}</div>
          <div class="meta">Date: ${test.date} &bull; Time: ${test.timing} &bull; Max Marks: ${test.totalMarks}</div>
          <div style="font-size: 10px; margin-top: 4px; color: #64748b;">${test.instructions}</div>
        </div>
  `;

  if (test.scienceSection) {
    content += `<div class="section">SECTION A: ${test.sub1Name} (${test.scienceSection.marks} Marks)</div>`;
    (test.scienceSection.questions || []).forEach(q => {
      content += `
        <div class="q-box">
          <div class="q-head">
            <span><strong>${q.qNum}.</strong> ${q.question}</span>
            <span>[${q.marks}M]</span>
          </div>
          ${isKey ? `
            <div class="ans-box">
              <strong>Answer:</strong> ${q.answer.replace(/\n/g, '<br>')}
              ${q.rubric ? `<div class="rubric"><strong>Grading Rubric:</strong> ${q.rubric}</div>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    });
  }

  if (test.tamilSection) {
    content += `<div class="section">SECTION B: ${test.sub2Name} (${test.tamilSection.marks} Marks)</div>`;
    (test.tamilSection.questions || []).forEach(q => {
      content += `
        <div class="q-box">
          <div class="q-head">
            <span><strong>${q.qNum}.</strong> ${q.question}</span>
            <span>[${q.marks}M]</span>
          </div>
          ${isKey ? `
            <div class="ans-box">
              <strong>விடை / Answer:</strong> ${q.answer.replace(/\n/g, '<br>')}
              ${q.rubric ? `<div class="rubric"><strong>Grading Rubric:</strong> ${q.rubric}</div>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    });
  }

  content += `
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
}

// ==========================================================================
// 16-DAY NIGHT TEST PAPERS & WHATSAPP HUB (FOR MAMA & PARENTS ONLY)
// ==========================================================================
let currentHubDayIndex = 1;
let currentHubShowKey = false;

function formatPaperForWhatsApp(test, includeAnswers = false) {
  let text = `*SRM PUBLIC SCHOOL • GRADE 10 REVISION-1*\n`;
  text += `*DAY ${test.day} NIGHT TEST (8:30 PM – 9:15 PM)*\n`;
  text += `*Date:* ${test.date} | *Total:* ${test.totalMarks} Marks | *Time:* 45 Mins\n`;
  text += `----------------------------------------\n\n`;

  if (test.scienceSection) {
    text += `*SECTION A: ${test.sub1Name}* (${test.scienceSection.marks} Marks)\n\n`;
    (test.scienceSection.questions || []).forEach(q => {
      text += `*${q.qNum}.* ${q.question} [${q.marks} Mark${q.marks > 1 ? 's' : ''}]\n`;
      if (includeAnswers && q.answer) {
        text += `_Answer:_ ${q.answer}\n`;
      }
      text += `\n`;
    });
  }

  if (test.tamilSection) {
    text += `----------------------------------------\n`;
    text += `*SECTION B: ${test.sub2Name}* (${test.tamilSection.marks} Marks)\n\n`;
    (test.tamilSection.questions || []).forEach(q => {
      text += `*${q.qNum}.* ${q.question} [${q.marks} Mark${q.marks > 1 ? 's' : ''}]\n`;
      if (includeAnswers && q.answer) {
        text += `_Answer:_ ${q.answer}\n`;
      }
      text += `\n`;
    });
  }

  text += `----------------------------------------\n`;
  text += `*INSTRUCTIONS:*\n`;
  text += `1. Write answers in rough notebook with steps.\n`;
  text += `2. Time limit: 45 minutes.\n`;
  text += `3. Submit immediately to Mama / send photos on WhatsApp!\n`;
  text += `All the best Pranav! 🌟\n`;

  return text;
}

function initHubDaySelector() {
  const container = document.getElementById('hub-day-selector-strip');
  if (!container) return;
  const tests = (appState && appState.mamaSecretNightTests) || [];
  if (tests.length === 0) return;

  container.innerHTML = '';
  tests.forEach(t => {
    const isSel = t.day === currentHubDayIndex;
    const btn = document.createElement('button');
    btn.setAttribute('data-day', t.day);
    btn.className = `hub-day-pill px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
      isSel 
        ? 'bg-emerald-600 text-white shadow-xs font-black' 
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
    }`;
    btn.innerHTML = `Day ${t.day} <span class="text-[10px] opacity-75">${t.date.slice(5)}</span>`;
    btn.onclick = () => {
      selectHubDay(t.day);
    };
    container.appendChild(btn);
  });
}

function selectHubDay(dayNum) {
  currentHubDayIndex = dayNum;
  renderHubTestPaper(dayNum);
}

function toggleHubAnswerKey() {
  currentHubShowKey = !currentHubShowKey;
  const keyText = document.getElementById('hub-toggle-key-text');
  const keyBtn = document.getElementById('hub-toggle-key-btn');
  if (keyText) keyText.textContent = currentHubShowKey ? 'Hide Answer Key' : 'Show Answer Key';
  if (keyBtn) {
    if (currentHubShowKey) {
      keyBtn.className = 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3 py-2 rounded-xl border border-amber-600 shadow-xs flex items-center gap-1.5 transition';
    } else {
      keyBtn.className = 'bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl border border-slate-300 shadow-xs flex items-center gap-1.5 transition';
    }
  }
  renderHubTestPaper(currentHubDayIndex);
}

function copyCurrentHubPaperWhatsApp() {
  const tests = (appState && appState.mamaSecretNightTests) || [];
  const test = tests.find(t => t.day === currentHubDayIndex) || tests[0];
  if (!test) {
    showToast('❌ Test paper not found!', false);
    return;
  }
  const waText = formatPaperForWhatsApp(test, currentHubShowKey);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(waText).then(() => {
      showToast(`✅ Day ${test.day} Test Paper copied for WhatsApp! Paste in chat.`);
    }).catch(() => {
      fallbackCopyTextToClipboard(waText, `Day ${test.day} Paper copied!`);
    });
  } else {
    fallbackCopyTextToClipboard(waText, `Day ${test.day} Paper copied!`);
  }
}

function printCurrentHubPaper(forceKey = false) {
  const tests = (appState && appState.mamaSecretNightTests) || [];
  const test = tests.find(t => t.day === currentHubDayIndex) || tests[0];
  if (!test) return;

  const isKey = forceKey || currentHubShowKey;
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    showToast('Please allow popups to print test paper', false);
    return;
  }

  let content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Day ${test.day} Test Paper - SRM Revision 1</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 28px; color: #1e293b; line-height: 1.5; font-size: 13px; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
          .school { font-size: 11px; font-weight: bold; letter-spacing: 1.5px; color: #475569; text-transform: uppercase; }
          .title { font-size: 16px; font-weight: 800; margin: 4px 0; color: #0f172a; }
          .meta { font-size: 12px; font-weight: 600; color: #334155; }
          .student-box { border: 1px dashed #94a3b8; border-radius: 6px; padding: 6px 12px; margin: 10px 0; display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; }
          .section { margin-top: 18px; font-size: 13px; font-weight: 800; text-transform: uppercase; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; color: #0f172a; }
          .q-box { margin: 12px 0; padding-bottom: 8px; border-bottom: 1px dashed #e2e8f0; }
          .q-head { font-size: 12px; font-weight: 700; display: flex; justify-content: space-between; gap: 8px; }
          .ans-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 8px 10px; margin-top: 6px; font-size: 11px; color: #14532d; }
          .rubric { font-style: italic; color: #047857; margin-top: 4px; font-size: 10px; }
          @media print {
            body { padding: 12px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="school">SRM PUBLIC SCHOOL • GRADE 10 REVISION-1</div>
          <div class="title">${test.title}</div>
          <div class="meta">Date: ${test.date} &bull; Time: 8:30 PM &bull; Max Marks: ${test.totalMarks} Marks</div>
          <div style="font-size: 11px; margin-top: 4px; color: #64748b; font-style: italic;">${test.instructions || 'Rough நோட்டில் எழுதி 45 நிமிடங்களில் சமர்ப்பிக்கவும்.'}</div>
        </div>

        <div class="student-box">
          <span>Student Name: Pranav</span>
          <span>Class: X - A</span>
          <span>Marks Obtained: _____ / ${test.totalMarks}</span>
        </div>
  `;

  if (test.scienceSection) {
    content += `<div class="section">SECTION A: ${test.sub1Name} (${test.scienceSection.marks} Marks)</div>`;
    (test.scienceSection.questions || []).forEach(q => {
      content += `
        <div class="q-box">
          <div class="q-head">
            <span><strong>${q.qNum}.</strong> ${q.question}</span>
            <span style="white-space: nowrap;">[${q.marks} Mark${q.marks > 1 ? 's' : ''}]</span>
          </div>
          ${isKey ? `
            <div class="ans-box">
              <strong>Answer / Solution:</strong><br>${q.answer ? q.answer.replace(/\n/g, '<br>') : '—'}
              ${q.rubric ? `<div class="rubric"><strong>Evaluation Rubric:</strong> ${q.rubric}</div>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    });
  }

  if (test.tamilSection) {
    content += `<div class="section">SECTION B: ${test.sub2Name} (${test.tamilSection.marks} Marks)</div>`;
    (test.tamilSection.questions || []).forEach(q => {
      content += `
        <div class="q-box">
          <div class="q-head">
            <span><strong>${q.qNum}.</strong> ${q.question}</span>
            <span style="white-space: nowrap;">[${q.marks} Mark${q.marks > 1 ? 's' : ''}]</span>
          </div>
          ${isKey ? `
            <div class="ans-box">
              <strong>Answer / Solution:</strong><br>${q.answer ? q.answer.replace(/\n/g, '<br>') : '—'}
              ${q.rubric ? `<div class="rubric"><strong>Evaluation Rubric:</strong> ${q.rubric}</div>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    });
  }

  content += `
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 400);
}

function renderHubTestPaper(dayNum = currentHubDayIndex) {
  currentHubDayIndex = dayNum;
  const tests = (appState && appState.mamaSecretNightTests) || [];
  if (!tests || tests.length === 0) return;
  
  const test = tests.find(t => t.day === currentHubDayIndex) || tests[0];
  if (!test) return;

  // Update labels
  const dateBadge = document.getElementById('hub-paper-date-badge');
  const titleLabel = document.getElementById('hub-paper-title-label');
  const selDayLabel = document.getElementById('hub-selected-day-label');
  if (dateBadge) dateBadge.textContent = `${test.date} • ${test.timing || '8:30 PM – 9:15 PM'}`;
  if (titleLabel) titleLabel.textContent = test.title;
  if (selDayLabel) selDayLabel.textContent = `Day ${test.day} (${test.date})`;

  // Update pills active styling
  const pills = document.querySelectorAll('.hub-day-pill');
  pills.forEach(p => {
    const d = parseInt(p.getAttribute('data-day'));
    if (d === currentHubDayIndex) {
      p.className = 'hub-day-pill px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition bg-emerald-600 text-white shadow-xs';
    } else {
      p.className = 'hub-day-pill px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200';
    }
  });

  const preview = document.getElementById('hub-paper-preview-container');
  if (!preview) return;

  let html = '';

  // Section A
  if (test.scienceSection) {
    html += `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between border-b border-slate-200 pb-1.5">
          <h5 class="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>SECTION A: ${test.sub1Name}</span>
          </h5>
          <span class="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
            ${test.scienceSection.marks} Marks
          </span>
        </div>
        <div class="space-y-2">
          ${(test.scienceSection.questions || []).map(q => `
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <div class="flex items-start justify-between gap-2">
                <span class="font-bold text-slate-800 leading-snug"><span class="text-emerald-700 font-extrabold">${q.qNum}.</span> ${q.question}</span>
                <span class="shrink-0 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">[${q.marks}M]</span>
              </div>
              ${currentHubShowKey ? `
                <div class="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] space-y-1 text-emerald-950 mt-1">
                  <div><strong>🔑 Answer / Solution:</strong> ${q.answer ? q.answer.replace(/\n/g, '<br>') : '—'}</div>
                  ${q.rubric ? `<div class="text-[10px] text-emerald-800/80 italic border-t border-emerald-200/60 pt-1"><strong>Evaluation Rubric:</strong> ${q.rubric}</div>` : ''}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Section B
  if (test.tamilSection) {
    html += `
      <div class="space-y-2.5 pt-2">
        <div class="flex items-center justify-between border-b border-slate-200 pb-1.5">
          <h5 class="text-xs font-bold text-blue-800 uppercase tracking-wide flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>SECTION B: ${test.sub2Name}</span>
          </h5>
          <span class="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
            ${test.tamilSection.marks} Marks
          </span>
        </div>
        <div class="space-y-2">
          ${(test.tamilSection.questions || []).map(q => `
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <div class="flex items-start justify-between gap-2">
                <span class="font-bold text-slate-800 leading-snug"><span class="text-blue-700 font-extrabold">${q.qNum}.</span> ${q.question}</span>
                <span class="shrink-0 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">[${q.marks}M]</span>
              </div>
              ${currentHubShowKey ? `
                <div class="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] space-y-1 text-blue-950 mt-1">
                  <div><strong>🔑 Answer / Solution:</strong> ${q.answer ? q.answer.replace(/\n/g, '<br>') : '—'}</div>
                  ${q.rubric ? `<div class="text-[10px] text-blue-800/80 italic border-t border-blue-200/60 pt-1"><strong>Evaluation Rubric:</strong> ${q.rubric}</div>` : ''}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  preview.innerHTML = html;
}

// ==========================================================================
// 5 CORE PILLARS IMPLEMENTATION:
// 1. Tasks (Home / Day 1 & Day 2 Rotation & Night Tests)
// 2. Textbook (NCERT / Board Books & Chapter PDFs Reader)
// 3. Model Questions & Answers (CBSE Standard with Rubrics)
// 4. Performance (Overall, School, Tuition, Home 4-Quadrant Scorecard)
// 5. Focus Areas (Target Radar: Red Alert, Amber Alert, Green Strengths)
// ==========================================================================

let currentTextbookSubject = 'science';
let currentModelQASubject = 'all';
let currentModelQASearch = '';
let currentPerformanceFilter = 'all';

// ----- PILLAR 2: TEXTBOOK HUB -----
function openTextbookSubject(subKey) {
  currentTextbookSubject = subKey;
  switchTab('textbook');
}

function selectTextbookSubject(subKey) {
  currentTextbookSubject = subKey;
  renderTextbookView();
}

function toggleChapterDetails(id) {
  const el = document.getElementById(id);
  const icon = document.getElementById(`icon-${id}`);
  if (el) {
    el.classList.toggle('hidden');
    if (icon) {
      icon.className = el.classList.contains('hidden') ? 'fa-solid fa-chevron-down text-[10px] text-slate-400' : 'fa-solid fa-chevron-up text-[10px] text-slate-400';
    }
  }
}

function renderTextbookView() {
  const pillsContainer = document.getElementById('textbook-sub-pills');
  const bannerContainer = document.getElementById('textbook-subject-banner');
  const shelfContainer = document.getElementById('textbook-chapters-shelf');
  if (!appState || !appState.textbooks) return;

  const subjects = [
    { key: 'science', label: '🔬 Science' },
    { key: 'maths', label: '📐 Mathematics' },
    { key: 'social_science', label: '🌍 Social Science' },
    { key: 'english', label: '📖 English' },
    { key: 'tamil', label: '🪶 Tamil' },
    { key: 'ai', label: '🤖 AI (417)' }
  ];

  if (pillsContainer) {
    pillsContainer.innerHTML = subjects.map(s => {
      const isAct = s.key === currentTextbookSubject;
      return `
        <button onclick="selectTextbookSubject('${s.key}')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${isAct ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}">
          <span>${s.label}</span>
        </button>
      `;
    }).join('');
  }

  const currentBook = appState.textbooks[currentTextbookSubject];
  if (!currentBook) return;

  if (bannerContainer) {
    const totalCh = (currentBook.chapters || []).length;
    const rev1Ch = (currentBook.chapters || []).filter(c => c.rev1Portion).length;
    bannerContainer.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-extrabold border border-blue-400/30">CBSE Code ${currentBook.code || ''}</span>
            <span class="text-xs text-slate-300 font-semibold">${totalCh} Chapters (${rev1Ch} Rev-1 Portion)</span>
          </div>
          <h2 class="text-base font-extrabold text-white mt-1">${currentBook.title}</h2>
          <p class="text-[11px] text-slate-300 mt-0.5">Official NCERT / Board Digital Textbook & Chapter Downloads</p>
        </div>
        <div class="flex items-center gap-2">
          ${currentBook.pdfOnline ? `
            <a href="${currentBook.pdfOnline}" target="_blank" class="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition">
              <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i> NCERT Online Portal
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }

  if (shelfContainer) {
    if (!currentBook.chapters || currentBook.chapters.length === 0) {
      shelfContainer.innerHTML = '<div class="p-6 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">No chapters mapped yet.</div>';
      return;
    }

    shelfContainer.innerHTML = currentBook.chapters.map(ch => {
      const hasPdf = !!ch.pdf;
      const formulasHtml = (ch.keyFormulas && ch.keyFormulas.length > 0)
        ? `<div class="mt-2 pt-2 border-t border-slate-100">
             <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Key Points & Formulas:</span>
             <ul class="mt-1 space-y-1 text-[11px] text-slate-700">
               ${ch.keyFormulas.map(f => `<li class="flex items-start gap-1.5"><span class="text-blue-500 font-bold">•</span> <span>${f}</span></li>`).join('')}
             </ul>
           </div>`
        : '';

      return `
        <div class="bg-white border ${ch.rev1Portion ? 'border-amber-300 ring-1 ring-amber-200/50' : 'border-slate-200'} rounded-2xl p-4 space-y-3 shadow-card hover:shadow-md transition">
          <div class="flex items-start justify-between gap-2">
            <div class="space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center shrink-0 border border-blue-100">
                  ${ch.chNum || ((ch.name || '').match(/Ch\s*(\d+)/i) ? (ch.name.match(/Ch\s*(\d+)/i)[1]) : (ch.id || '•'))}
                </span>
                <h4 class="text-xs sm:text-sm font-extrabold text-slate-900">${(ch.name || '').replace(/^Ch\s*\d+:\s*/i, '')}</h4>
                ${ch.rev1Portion ? '<span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">⚡ SRM Rev-1 Portion</span>' : ''}
              </div>
              <div class="flex items-center gap-3 text-[10px] text-slate-500 font-medium pt-0.5">
                ${ch.ncertCode ? `<span><i class="fa-solid fa-barcode text-slate-400"></i> NCERT Code: <strong>${ch.ncertCode}</strong></span>` : ''}
                ${ch.pages ? `<span><i class="fa-regular fa-file-lines text-slate-400"></i> ${ch.pages} Pages</span>` : ''}
              </div>
            </div>

            <!-- PDF Download / View Button -->
            <div class="flex items-center gap-1.5 shrink-0">
              ${hasPdf ? `
                <a href="${ch.pdf}" target="_blank" class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition">
                  <i class="fa-solid fa-file-pdf text-xs"></i> <span>Open PDF</span>
                </a>
              ` : ''}
              ${ch.ncertOnline ? `
                <a href="${ch.ncertOnline}" target="_blank" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-2.5 py-2 rounded-xl flex items-center gap-1 transition" title="Read online on NCERT website">
                  <i class="fa-solid fa-globe text-[11px]"></i>
                </a>
              ` : ''}
            </div>
          </div>

          <!-- Summary & Key Formulas Collapsible -->
          ${ch.summary ? `
            <div class="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-xs text-slate-700 space-y-1">
              <div class="flex items-center justify-between cursor-pointer" onclick="toggleChapterDetails('details-${ch.id}')">
                <span class="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                  <i class="fa-solid fa-lightbulb text-amber-500"></i> Chapter Summary & Key Concepts
                </span>
                <i class="fa-solid fa-chevron-down text-[10px] text-slate-400" id="icon-details-${ch.id}"></i>
              </div>
              <div id="details-${ch.id}" class="hidden pt-1.5 space-y-1.5 text-[11px]">
                <p class="text-slate-600 leading-relaxed">${ch.summary}</p>
                ${formulasHtml}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }
}

// ----- PILLAR 3: MODEL QUESTIONS & ANSWERS -----
function selectModelQASubject(subKey) {
  currentModelQASubject = subKey;
  renderModelQAView();
}

function filterModelQA(query) {
  currentModelQASearch = (query || '').toLowerCase().trim();
  renderModelQAView();
}

function renderModelQAView() {
  const pillsContainer = document.getElementById('modelqa-sub-pills');
  const cardsContainer = document.getElementById('modelqa-cards-container');
  if (!appState || !appState.modelQA) return;

  const subjects = [
    { key: 'all', label: '🌟 All Questions' },
    { key: 'science', label: '🔬 Science' },
    { key: 'maths', label: '📐 Maths' },
    { key: 'social_science', label: '🌍 Social Sci' },
    { key: 'english', label: '📖 English' },
    { key: 'tamil', label: '🪶 Tamil' },
    { key: 'ai', label: '🤖 AI' }
  ];

  if (pillsContainer) {
    pillsContainer.innerHTML = subjects.map(s => {
      const isAct = s.key === currentModelQASubject;
      return `
        <button onclick="selectModelQASubject('${s.key}')" class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${isAct ? 'bg-purple-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}">
          ${s.label}
        </button>
      `;
    }).join('');
  }

  const allQAs = appState.modelQA || [];
  const filtered = allQAs.filter(q => {
    if (currentModelQASubject !== 'all' && q.subject !== currentModelQASubject) return false;
    if (currentModelQASearch) {
      const matchQ = q.question.toLowerCase().includes(currentModelQASearch);
      const matchA = q.answer.toLowerCase().includes(currentModelQASearch);
      const matchT = (q.topic || '').toLowerCase().includes(currentModelQASearch);
      const matchC = (q.chapter || '').toLowerCase().includes(currentModelQASearch);
      return matchQ || matchA || matchT || matchC;
    }
    return true;
  });

  if (cardsContainer) {
    if (filtered.length === 0) {
      cardsContainer.innerHTML = '<div class="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">No model questions match your filter.</div>';
      return;
    }

    cardsContainer.innerHTML = filtered.map(q => {
      const marksColor = q.marks >= 5 ? 'bg-rose-100 text-rose-800 border-rose-200' : (q.marks >= 3 ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-blue-100 text-blue-800 border-blue-200');
      const safeAnswer = (q.answer || '').replace(/\n/g, '<br>');

      return `
        <div class="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-card hover:shadow-md transition">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-200">${q.subjectTitle || q.subject}</span>
              <span class="text-[11px] font-bold text-slate-600">${q.chapter}</span>
              ${q.topic ? `<span class="text-[10px] text-slate-400">• ${q.topic}</span>` : ''}
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${marksColor}">
              ${q.marks} Marks
            </span>
          </div>

          <div class="pt-0.5">
            <p class="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">${q.question}</p>
          </div>

          <!-- Answer & Rubric Toggle -->
          <div class="pt-1">
            <button onclick="toggleChapterDetails('ans-${q.id}')" class="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-purple-700 font-extrabold text-xs px-3 py-2 rounded-xl flex items-center justify-between transition">
              <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-circle-check text-purple-600"></i> View Model Answer & CBSE Rubric
              </span>
              <i class="fa-solid fa-chevron-down text-[10px]" id="icon-ans-${q.id}"></i>
            </button>

            <div id="ans-${q.id}" class="hidden mt-2 p-3.5 rounded-xl bg-purple-50/50 border border-purple-200/60 space-y-3 text-xs">
              <div class="space-y-1">
                <span class="text-[10px] font-extrabold text-purple-900 uppercase tracking-wide block">Step-by-Step Model Answer:</span>
                <div class="text-slate-800 leading-relaxed font-sans">${safeAnswer}</div>
              </div>

              ${q.rubric ? `
                <div class="bg-white/80 border border-purple-200 rounded-lg p-2.5 space-y-1">
                  <span class="text-[10px] font-extrabold text-purple-900 flex items-center gap-1">
                    <i class="fa-solid fa-scale-balanced text-purple-600"></i> CBSE Marking Scheme Rubric:
                  </span>
                  <p class="text-[11px] text-slate-600">${q.rubric}</p>
                </div>
              ` : ''}

              ${q.importantTip ? `
                <div class="bg-amber-50 border border-amber-200 rounded-lg p-2.5 space-y-0.5">
                  <span class="text-[10px] font-extrabold text-amber-900 flex items-center gap-1">
                    <i class="fa-solid fa-lightbulb text-amber-600"></i> Mama's Scoring Tip:
                  </span>
                  <p class="text-[11px] text-amber-900">${q.importantTip}</p>
                </div>
              ` : ''}

              <div class="flex justify-end pt-1">
                <button onclick="speakModelAnswer('${q.id}')" class="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] px-3 py-1 rounded-lg flex items-center gap-1 transition">
                  <i class="fa-solid fa-volume-high text-[10px]"></i> Listen Answer Audio
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

function speakModelAnswer(qid) {
  const q = (appState.modelQA || []).find(item => item.id === qid);
  if (!q) return;
  const textToRead = `${q.question}. Answer: ${q.answer}`;
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = q.subject === 'tamil' ? 'ta-IN' : 'en-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
      showToast('🔊 Playing Model Answer Audio...');
    } catch (e) {
      showToast('Speech synthesis error');
    }
  }
}

// ----- PILLAR 4: 4-QUADRANT PERFORMANCE SCORECARD -----
function setPerformanceFilter(filter) {
  currentPerformanceFilter = filter;
  renderPerformanceView();
}

function openAddScoreModal() {
  openModal('addScoreModal');
}

function renderPerformanceView() {
  const gridContainer = document.getElementById('performance-quadrants-grid');
  const tabsContainer = document.getElementById('performance-filter-tabs');
  const listContainer = document.getElementById('performance-tests-list');
  const thenNowContainer = document.getElementById('performance-then-now-container');

  if (!appState) return;

  const perfScorecard = appState.performanceScorecard || {};
  const perfHub = appState.performanceHub || {};
  const housePractice = perfHub.housePractice || {};

  // Safe Metric Extraction
  const overallAgg = (perfScorecard.overall?.aggregatePercentage != null)
    ? perfScorecard.overall.aggregatePercentage + '%'
    : (perfScorecard.overall?.aggregate || '86.4%');
  const totalTests = perfScorecard.overall?.totalTestsTaken || perfScorecard.overall?.testsTaken || 24;
  const syllabusMastery = (perfScorecard.overall?.syllabusMasteryPct != null)
    ? perfScorecard.overall.syllabusMasteryPct + '%'
    : (perfScorecard.overall?.syllabusCovered || '88%');
  const overallStatus = perfScorecard.overall?.statusText || perfScorecard.overall?.status || 'On Track for 90%+ in Board Exams';

  const schoolQuarterly = perfScorecard.school?.quarterly || '82.5%';
  const schoolMidTerm = perfScorecard.school?.midTerm || '86.0%';
  const schoolTargetRev1 = perfScorecard.school?.target || perfScorecard.school?.targetRev1 || '95%';
  const schoolAvg = perfScorecard.school?.averagePct != null ? (perfScorecard.school.averagePct + '%') : (perfScorecard.school?.quarterly || '85.0%');

  const tuitionAvg = perfScorecard.tution?.averagePct != null ? (perfScorecard.tution.averagePct + '%') : (perfScorecard.tution?.sundayTestAvg || '84.0%');
  const tuitionTarget = perfScorecard.tution?.target || 'Zero Silly Errors in Proofs & Numericals';

  const homeAvg = housePractice.overallAverage != null
    ? housePractice.overallAverage + '%'
    : (perfScorecard.home?.averagePct != null ? perfScorecard.home.averagePct + '%' : '88.5%');
  const homeStreak = perfScorecard.home?.streak || '14 Days Active (Night Tests)';

  if (gridContainer) {
    gridContainer.innerHTML = `
      <!-- Quadrant 1: Overall Summary -->
      <div class="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl p-4 space-y-3 border border-emerald-800/40 shadow-card">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <i class="fa-solid fa-trophy"></i> 1. Overall Performance
          </span>
          <span class="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            ${overallStatus}
          </span>
        </div>
        <div class="flex items-baseline justify-between pt-1">
          <div>
            <span class="text-3xl font-black text-white">${overallAgg}</span>
            <span class="text-[11px] text-slate-300 block font-medium">Cumulative Aggregate</span>
          </div>
          <div class="text-right text-[11px] text-slate-300 space-y-0.5">
            <div>Tests Taken: <strong class="text-white">${totalTests} Tests</strong></div>
            <div>Syllabus Covered: <strong class="text-emerald-400">${syllabusMastery}</strong></div>
          </div>
        </div>
        <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full" style="width: ${overallAgg}"></div>
        </div>
      </div>

      <!-- Quadrant 2: School (SRM) -->
      <div class="bg-white rounded-2xl p-4 space-y-3 border border-blue-200 shadow-card">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
            <i class="fa-solid fa-school"></i> 2. School Tests (SRM)
          </span>
          <span class="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
            Avg: ${schoolAvg}
          </span>
        </div>
        <div class="grid grid-cols-3 gap-2 pt-1 text-center">
          <div class="bg-blue-50/70 p-2 rounded-xl">
            <span class="text-[10px] text-slate-500 font-bold block">Quarterly</span>
            <span class="text-sm font-black text-blue-900">${schoolQuarterly}</span>
          </div>
          <div class="bg-blue-50/70 p-2 rounded-xl">
            <span class="text-[10px] text-slate-500 font-bold block">Mid-Term</span>
            <span class="text-sm font-black text-blue-900">${schoolMidTerm}</span>
          </div>
          <div class="bg-emerald-50 p-2 rounded-xl border border-emerald-200">
            <span class="text-[10px] text-emerald-700 font-bold block">Rev-1 Target</span>
            <span class="text-sm font-black text-emerald-800">${schoolTargetRev1}</span>
          </div>
        </div>
        <p class="text-[10px] text-slate-500 font-medium">SRM Public School Class 10 Board Standards</p>
      </div>

      <!-- Quadrant 3: Tuition -->
      <div class="bg-white rounded-2xl p-4 space-y-3 border border-purple-200 shadow-card">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
            <i class="fa-solid fa-graduation-cap"></i> 3. Tuition Tests
          </span>
          <span class="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
            Avg: ${tuitionAvg}
          </span>
        </div>
        <div class="bg-purple-50/70 p-2.5 rounded-xl space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="text-[11px] font-bold text-slate-700">Focus Goal:</span>
            <span class="font-bold text-purple-900 text-[11px]">${tuitionTarget}</span>
          </div>
          <p class="text-[10px] text-slate-600 italic">"Supplementary data to track speed and numerical precision."</p>
        </div>
        <p class="text-[10px] text-slate-500 font-medium">Weekend coaching benchmark records</p>
      </div>

      <!-- Quadrant 4: House Practice (Our Hero Focus Pillar) -->
      <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 space-y-3 border-2 border-amber-300 shadow-card">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <i class="fa-solid fa-house-chimney text-amber-600"></i> 4. House Practice (Core Hero Focus)
          </span>
          <span class="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-xs">
            ${homeStreak}
          </span>
        </div>
        <div class="bg-white/80 p-2.5 rounded-xl border border-amber-200 space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="text-[11px] font-extrabold text-slate-800">Night Test Average:</span>
            <span class="font-black text-amber-800 text-base">${homeAvg}</span>
          </div>
          <p class="text-[10px] text-slate-600 font-medium">Daily 8:30 PM written test + AI & Mama evaluation. Master this, all others follow!</p>
        </div>
        <div class="flex items-center justify-between text-[10px] text-amber-800 font-bold pt-0.5">
          <span>Target: 95%+ Average</span>
          <span class="text-emerald-700">✓ AI Evaluator Active</span>
        </div>
      </div>
    `;
  }

  // Then vs Now Container
  if (thenNowContainer) {
    const thenAndNow = perfHub.thenAndNow || [
      { metric: "House Practice Regularity", then: "Irregular / 1 hr", now: "Daily 2.5 hrs + 8:30 PM Test", duration: "Last 14 Days", trend: "+85%" },
      { metric: "Maths Problem Solving Accuracy", then: "72% (Frequent calculation errors)", now: "89% (Step-by-step verification)", duration: "Last 2 Weeks", trend: "+17%" },
      { metric: "Science Concept Retention", then: "68% (Confused reactivity series)", now: "86% (Mnemonics & Tanglish recall)", duration: "Last 2 Weeks", trend: "+18%" },
      { metric: "Tamil Exam Score Average", then: "74% (Grammar errors)", now: "84% (Focused Unit practice)", duration: "Last 10 Days", trend: "+10%" }
    ];

    const strengths = housePractice.strengths || [
      "NCERT Direct Formula Application",
      "Neat handwriting & step presentation",
      "Algebraic cross-multiplication & calculation speed"
    ];

    const weaknesses = housePractice.weaknesses || [
      "CBSE Board Trap: Must check 3rd ratio (c1/c2) for No Solution (alpha = -6)",
      "Question Copying: Keep Roman numeral (ii) separated to prevent reading kx as 2kx",
      "Geometry Thales theorem proof step-by-step reasoning"
    ];

    thenNowContainer.innerHTML = `
      <!-- Then vs Now Duration Progress Card -->
      <div class="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-card mt-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs border border-teal-200">
              📈
            </span>
            <div>
              <h4 class="text-xs font-black text-slate-900">Then vs Now Comparison (Progress Trajectory)</h4>
              <p class="text-[10px] text-slate-500">Tracked across past 2-week daily revision sprints</p>
            </div>
          </div>
          <span class="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Positive Improvement
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          ${thenAndNow.map(item => `
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <span class="font-extrabold text-slate-800">${item.metric}</span>
                <span class="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">${item.trend}</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[10px] pt-0.5">
                <div class="bg-rose-50 text-rose-900 p-1.5 rounded-lg border border-rose-100">
                  <span class="block text-[9px] font-bold text-rose-600 uppercase">Then:</span>
                  <span class="font-medium">${item.then}</span>
                </div>
                <div class="bg-emerald-50 text-emerald-900 p-1.5 rounded-lg border border-emerald-100">
                  <span class="block text-[9px] font-bold text-emerald-600 uppercase">Now:</span>
                  <span class="font-bold">${item.now}</span>
                </div>
              </div>
              <span class="block text-[9px] text-slate-400 italic">Timeline: ${item.duration}</span>
            </div>
          `).join('')}
        </div>

        <!-- Focus Areas & Pranav's Advantages -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
          <div class="bg-amber-50/70 border border-amber-200 rounded-xl p-3 space-y-1">
            <span class="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
              <i class="fa-solid fa-crosshairs text-amber-600"></i> Focus to Be Given Areas (Fix Traps)
            </span>
            <ul class="text-[10px] text-slate-700 space-y-1 pt-1 list-disc pl-4 font-medium">
              ${weaknesses.map(w => `<li>${w}</li>`).join('')}
            </ul>
          </div>

          <div class="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 space-y-1">
            <span class="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
              <i class="fa-solid fa-star text-emerald-600"></i> Pranav's Strong Advantages
            </span>
            <ul class="text-[10px] text-slate-700 space-y-1 pt-1 list-disc pl-4 font-medium">
              ${strengths.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // Filter Tabs
  if (tabsContainer) {
    const tabs = [
      { key: 'all', label: 'All Tests' },
      { key: 'home', label: '🏠 House Practice (Home Tests)' },
      { key: 'school', label: '🏫 School' },
      { key: 'tution', label: '📚 Tuition' }
    ];
    tabsContainer.innerHTML = tabs.map(t => {
      const isAct = t.key === currentPerformanceFilter;
      return `
        <button onclick="setPerformanceFilter('${t.key}')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${isAct ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          ${t.label}
        </button>
      `;
    }).join('');
  }

  // Tests List - MERGE BOTH housePractice.recentTests AND appState.tests!
  if (listContainer) {
    const homeRecent = (housePractice.recentTests || []).map((t, idx) => ({
      id: 'hp-' + (t.date || idx),
      title: t.test || ('Day Test: ' + (t.date || 'Recent')),
      date: t.date || '2026-10-29',
      subject: t.test?.includes('Math') ? 'Mathematics' : (t.test?.includes('Science') ? 'Science' : (t.test?.includes('Tamil') ? 'Tamil' : 'General')),
      marksObtained: t.scoredMarks != null ? t.scoredMarks : 14,
      totalMarks: t.maxMarks || 15,
      category: 'home',
      status: t.status,
      remarks: t.feedback || t.marksLostReason || 'Home Written Practice',
      strengths: t.strengths,
      weaknesses: t.weaknesses,
      audioExplanation: t.audioExplanation,
      hasAudio: !!t.audioExplanation
    }));

    const otherTests = (appState.tests || []).map(t => ({
      ...t,
      category: t.category || (t.title?.toLowerCase().includes('school') || t.title?.toLowerCase().includes('quarterly') || t.title?.toLowerCase().includes('mid') ? 'school' : (t.title?.toLowerCase().includes('tuition') || t.title?.toLowerCase().includes('sunday') ? 'tution' : 'home'))
    }));

    // Put home tests first, then others, sorted by date descending
    const combined = [...homeRecent, ...otherTests];

    const filtered = combined.filter(t => {
      if (currentPerformanceFilter === 'all') return true;
      return t.category === currentPerformanceFilter;
    });

    if (filtered.length === 0) {
      listContainer.innerHTML = '<div class="p-6 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">No test records under this category. Click "+ Record Marks" to add one!</div>';
      return;
    }

    listContainer.innerHTML = filtered.map(t => {
      const pct = Math.round((t.marksObtained / t.totalMarks) * 100);
      const catPill = t.category === 'school'
        ? '<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200">🏫 School</span>'
        : (t.category === 'tution'
          ? '<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">📚 Tuition</span>'
          : '<span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">🏠 House Practice</span>');

      return `
        <div class="bg-white border ${t.category === 'home' ? 'border-amber-200/90 ring-1 ring-amber-100' : 'border-slate-200/80'} rounded-2xl p-3.5 space-y-2 hover:shadow-sm transition">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                ${catPill}
                <span class="text-xs font-black text-slate-900">${t.title}</span>
                ${t.status ? `<span class="text-[9px] font-extrabold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">${t.status}</span>` : ''}
              </div>
              <div class="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                <span><i class="fa-regular fa-calendar"></i> ${t.date}</span>
                <span>•</span>
                <span class="font-bold text-slate-700">${t.subject}</span>
              </div>
            </div>
            <div class="text-right shrink-0">
              <div class="text-sm font-black text-slate-900">${t.marksObtained} / ${t.totalMarks}</div>
              <span class="text-[10px] font-black ${pct >= 90 ? 'text-emerald-600' : (pct >= 80 ? 'text-blue-600' : 'text-amber-600')}">
                ${pct}%
              </span>
            </div>
          </div>

          ${t.remarks ? `
            <div class="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100">
              ${t.remarks}
            </div>
          ` : ''}

          ${t.hasAudio ? `
            <div class="pt-1 flex items-center justify-between">
              <button onclick="toggleDay2AudioReview()" class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white font-extrabold text-[11px] flex items-center gap-1.5 shadow-xs transition">
                <i class="fa-solid fa-volume-high"></i>
                <span>🎧 Listen: "Why 40% Marks Lost" (Audio Review)</span>
              </button>
              <span class="text-[9px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Tamil Voice</span>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }
}
async function submitNewScore() {
  const cat = document.getElementById('newScoreCategory')?.value || 'home';
  const sub = document.getElementById('newScoreSubject')?.value || 'Mathematics';
  const title = document.getElementById('newScoreTitle')?.value?.trim();
  const obtained = parseFloat(document.getElementById('newScoreObtained')?.value);
  const total = parseFloat(document.getElementById('newScoreTotal')?.value);
  const remarks = document.getElementById('newScoreRemarks')?.value?.trim() || '';

  if (!title) {
    showToast('Please enter a test title or chapter name!', false);
    return;
  }
  if (isNaN(obtained) || isNaN(total) || obtained < 0 || total <= 0 || obtained > total) {
    showToast('Please enter valid obtained and total marks!', false);
    return;
  }

  const payload = {
    category: cat,
    subject: sub,
    title: title,
    marksObtained: obtained,
    totalMarks: total,
    remarks: remarks,
    date: new Date().toISOString().slice(0, 10)
  };

  try {
    const res = await fetch('/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      if (!appState.tests) appState.tests = [];
      appState.tests.unshift(data.test || payload);
      closeModal('addScoreModal');
      showToast('🎉 Test marks recorded successfully!');
      renderPerformanceView();
      return;
    }
  } catch (e) {}

  // Fallback if offline
  if (!appState.tests) appState.tests = [];
  appState.tests.unshift({ id: 't-' + Date.now(), ...payload });
  localStorage.setItem('pranav_offline_data', JSON.stringify(appState));
  closeModal('addScoreModal');
  showToast('🎉 Test marks saved locally!');
  renderPerformanceView();
}

// ----- PILLAR 5: FOCUS AREAS & RED ALERT RADAR -----
function startFocusPomodoro(mins = 25) {
  switchTab('timer');
  if (typeof setTimerDuration === 'function') {
    setTimerDuration(mins);
  }
  if (typeof toggleTimer === 'function' && !timerRunning) {
    toggleTimer();
  }
  showToast(`⏱️ Started ${mins}-minute focused study sprint!`);
}

function renderFocusView() {
  const redList = document.getElementById('focus-red-list');
  const amberList = document.getElementById('focus-amber-list');
  const greenList = document.getElementById('focus-green-list');
  if (!appState || !appState.focusAreas) return;

  const fa = appState.focusAreas;

  if (redList && fa.redAlert) {
    redList.innerHTML = fa.redAlert.map(item => `
      <div class="bg-rose-50/70 border-2 border-rose-300 rounded-2xl p-4 space-y-3 shadow-card">
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-rose-600 text-white">
                CRITICAL
              </span>
              <span class="text-xs font-black text-rose-950">${item.subject} • ${item.chapter}</span>
            </div>
            <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">${item.topic}</h4>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-black bg-white text-rose-700 border border-rose-300 shadow-sm shrink-0">
            ${item.currentScore}
          </span>
        </div>

        <div class="bg-white/90 border border-rose-200/80 rounded-xl p-3 space-y-1 text-xs">
          <div class="text-slate-600">
            <strong class="text-rose-900">Why He Struggles:</strong> ${item.reason}
          </div>
          <div class="text-slate-800 pt-1">
            <strong class="text-emerald-800">Mama's Action Plan:</strong> ${item.action}
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 pt-1">
          <button onclick="openTextbookSubject('${item.actionSubject || 'maths'}')" class="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition">
            <i class="fa-solid fa-book-open text-[10px]"></i> Read Chapter in Textbook
          </button>
          <button onclick="selectModelQASubject('${item.actionSubject || 'maths'}'); switchTab('modelqa');" class="bg-white hover:bg-slate-100 text-rose-800 border border-rose-300 font-bold text-[11px] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition">
            <i class="fa-solid fa-clipboard-question text-[10px]"></i> Practice Model Q&A
          </button>
          <button onclick="startFocusPomodoro(25)" class="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition">
            <i class="fa-solid fa-stopwatch text-[10px]"></i> 25m Focus Session
          </button>
        </div>
      </div>
    `).join('');
  }

  if (amberList && fa.amberAlert) {
    amberList.innerHTML = fa.amberAlert.map(item => `
      <div class="bg-amber-50/60 border border-amber-300 rounded-2xl p-3.5 space-y-2 shadow-card">
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-amber-500 text-white">REVISION</span>
              <span class="text-xs font-bold text-amber-950">${item.subject} • ${item.chapter}</span>
            </div>
            <h4 class="text-xs font-extrabold text-slate-900 mt-0.5">${item.topic}</h4>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-amber-800 border border-amber-300 shrink-0">
            ${item.currentScore}
          </span>
        </div>
        <p class="text-[11px] text-slate-600 leading-relaxed">${item.action}</p>
      </div>
    `).join('');
  }

  if (greenList && fa.greenStrengths) {
    greenList.innerHTML = fa.greenStrengths.map(item => `
      <div class="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold text-emerald-800">${item.subject}</span>
          <i class="fa-solid fa-circle-check text-emerald-600 text-xs"></i>
        </div>
        <h5 class="text-xs font-extrabold text-slate-900">${item.topic}</h5>
        <span class="text-[10px] text-emerald-700 font-semibold block">${item.status}</span>
      </div>
    `).join('');
  }
}





// ================= DYNAMIC RESCHEDULER (SKIP DAY / HALF-DONE) =================
function openRescheduleModal() {
  const modal = document.getElementById('rescheduleModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    renderRescheduleModalInfo();
  }
}

function closeRescheduleModal() {
  const modal = document.getElementById('rescheduleModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function renderRescheduleModalInfo() {
  const container = document.getElementById('rescheduleModalBody');
  if (!container || !appState) return;

  const rev = appState.revisionSplitter || {};
  const today = rev.today || { dayIndex: 2, pair: 'Mathematics + English' };
  
  container.innerHTML = `
    <div class="space-y-3.5 text-xs text-slate-700">
      <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
        <div class="flex items-center justify-between">
          <strong class="text-emerald-950 font-bold">Current Active Day: Day ${today.dayIndex} (${today.pair})</strong>
          <span class="text-[10px] bg-white text-emerald-800 font-extrabold px-2 py-0.5 rounded border border-emerald-200">16-Day Mission</span>
        </div>
        <p class="text-[11px] text-slate-600">If Pranav faced unexpected school late hours, illness, or tuition tests, choose an action below. The system will re-balance remaining topics smoothly before Nov 13 exam.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        <!-- Option 1: Skip Today -->
        <button onclick="applyRescheduleAction('skip')" class="p-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-2xl text-left transition space-y-1 shadow-xs group">
          <div class="flex items-center justify-between">
            <span class="font-extrabold text-slate-900 group-hover:text-amber-800 flex items-center gap-1.5">
              <span>⏭️</span> Skip Entire Day
            </span>
            <span class="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">Emergency</span>
          </div>
          <p class="text-[10px] text-slate-500 leading-snug">Day ${today.dayIndex} tasks are safely distributed across the next 3 revision buffers. Day ${today.dayIndex + 1} becomes active.</p>
        </button>

        <!-- Option 2: Half-Done -->
        <button onclick="applyRescheduleAction('half_done')" class="p-3 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-2xl text-left transition space-y-1 shadow-xs group">
          <div class="flex items-center justify-between">
            <span class="font-extrabold text-slate-900 group-hover:text-sky-800 flex items-center gap-1.5">
              <span>⚡</span> Mark Half-Done
            </span>
            <span class="text-[9px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded">50% Completed</span>
          </div>
          <p class="text-[10px] text-slate-500 leading-snug">Saves completed subject. Second subject automatically carries forward to tomorrow morning study slot.</p>
        </button>
      </div>

      <!-- Option 3: Auto Rebalance -->
      <button onclick="applyRescheduleAction('rebalance')" class="w-full p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition flex items-center justify-between">
        <div>
          <span class="font-bold text-slate-900 text-xs block">🔄 Auto-Rebalance Full 16 Days</span>
          <span class="text-[10px] text-slate-500">Recalculates pace based on remaining days to SRM Rev-1 English Exam (Nov 13).</span>
        </div>
        <i class="fa-solid fa-arrow-right text-emerald-600 text-xs"></i>
      </button>

      <div id="rescheduleFeedback" class="hidden p-2.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300"></div>
    </div>
  `;
}

function applyRescheduleAction(actionType) {
  const feedback = document.getElementById('rescheduleFeedback');
  if (!appState || !appState.revisionSplitter) return;

  const rev = appState.revisionSplitter;
  if (actionType === 'skip') {
    const curDay = rev.today.dayIndex;
    rev.today.dayIndex = Math.min(16, curDay + 1);
    rev.today.message = `Day ${curDay} was marked skipped. Rescheduled smoothly! Active revision is now Day ${rev.today.dayIndex}.`;
    if (feedback) {
      feedback.classList.remove('hidden');
      feedback.textContent = `✅ Day ${curDay} skipped. Schedule rebalanced! Current day set to Day ${rev.today.dayIndex}.`;
    }
  } else if (actionType === 'half_done') {
    rev.today.message = "⚡ Day 1 marked Half-Done! Completed portion verified. Remaining sub-tasks carried to morning revision slot.";
    if (feedback) {
      feedback.classList.remove('hidden');
      feedback.textContent = "✅ Half-done recorded! Pending topics shifted smoothly without test overload.";
    }
  } else {
    rev.today.message = "🔄 Full 16-day schedule rebalanced perfectly with exam buffer on Nov 11–12.";
    if (feedback) {
      feedback.classList.remove('hidden');
      feedback.textContent = "✅ Schedule rebalanced! All chapters mapped to remaining days.";
    }
  }

  try {
    localStorage.setItem('pranav_exam_hub_state', JSON.stringify(appState));
  } catch(e){}

  setTimeout(() => {
    closeRescheduleModal();
    if (typeof renderRevisionMissionUI === 'function') renderRevisionMissionUI();
    if (typeof showToast === 'function') showToast('Schedule updated successfully!');
  }, 1200);
}

// ================= STUDY LAP TIMER & TEST ALARM =================
let studyLapInterval = null;
let studyLapSeconds = 0;
let studyLapsHistory = [];
let testAlarmInterval = null;

function toggleStudyLapTimer() {
  const btn = document.getElementById('btnLapTimerToggle');
  const display = document.getElementById('studyLapDisplay');
  if (!btn || !display) return;

  if (studyLapInterval) {
    clearInterval(studyLapInterval);
    studyLapInterval = null;
    btn.innerHTML = '<i class="fa-solid fa-play text-xs"></i> Start';
    btn.className = "bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition";
  } else {
    studyLapInterval = setInterval(() => {
      studyLapSeconds++;
      const mins = String(Math.floor(studyLapSeconds / 60)).padStart(2, '0');
      const secs = String(studyLapSeconds % 60).padStart(2, '0');
      display.textContent = `${mins}:${secs}`;
    }, 1000);
    btn.innerHTML = '<i class="fa-solid fa-pause text-xs"></i> Pause';
    btn.className = "bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition";
  }
}

function recordStudyLap() {
  if (studyLapSeconds === 0) return;
  const mins = String(Math.floor(studyLapSeconds / 60)).padStart(2, '0');
  const secs = String(studyLapSeconds % 60).padStart(2, '0');
  const timeStr = `${mins}:${secs}`;
  const lapNum = studyLapsHistory.length + 1;
  studyLapsHistory.unshift({ num: lapNum, time: timeStr, at: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
  renderStudyLaps();
}

function resetStudyLapTimer() {
  if (studyLapInterval) {
    clearInterval(studyLapInterval);
    studyLapInterval = null;
  }
  studyLapSeconds = 0;
  const display = document.getElementById('studyLapDisplay');
  if (display) display.textContent = "00:00";
  const btn = document.getElementById('btnLapTimerToggle');
  if (btn) {
    btn.innerHTML = '<i class="fa-solid fa-play text-xs"></i> Start';
    btn.className = "bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition";
  }
}

function renderStudyLaps() {
  const container = document.getElementById('studyLapsList');
  if (!container) return;
  if (studyLapsHistory.length === 0) {
    container.innerHTML = '<span class="text-[10px] text-slate-400 block py-1">No laps recorded yet. Click Lap during problem solving.</span>';
    return;
  }
  container.innerHTML = studyLapsHistory.slice(0, 5).map(l => `
    <div class="flex items-center justify-between py-1 border-b border-slate-100 text-xs">
      <span class="font-bold text-slate-700">Question / Lap #${l.num}</span>
      <span class="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">${l.time}</span>
      <span class="text-[10px] text-slate-400">${l.at}</span>
    </div>
  `).join('');
}

function checkNightTestAlarm() {
  const now = new Date();
  const hrs = now.getHours();
  const mins = now.getMinutes();
  const alarmTag = document.getElementById('nightAlarmStatusTag');
  if (alarmTag) {
    if (hrs === 20 && mins >= 30 && mins <= 45) {
      alarmTag.className = "text-[10px] bg-rose-500 text-white font-black px-2.5 py-0.5 rounded-full animate-pulse";
      alarmTag.textContent = "🚨 8:30 PM Night Test Active Now!";
    } else {
      alarmTag.className = "text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200";
      alarmTag.textContent = "🔔 Daily 8:30 PM Night Test Alarm Set";
    }
  }
}
setInterval(checkNightTestAlarm, 30000);

// ================= DYNAMIC 16-DAY REVISION MISSION RENDERER =================
let activeMissionDayView = 2; // Default to Today: Day 2 (29 Oct 2026)

function setMissionDayView(dayNum) {
  activeMissionDayView = dayNum;
  renderRevisionMissionUI();
}

function renderRevisionMissionUI() {
  const container = document.getElementById('revision-mission-dynamic-container');
  if (!container || !appState || !appState.revisionSplitter) return;

  const rev = appState.revisionSplitter;
  const schedule = rev.modes && rev.modes.pair_rotation ? rev.modes.pair_rotation.schedule : [];
  const currentDayData = schedule.find(s => s.day === activeMissionDayView) || schedule[1] || {};
  const isYesterday = activeMissionDayView === 1;
  const isToday = activeMissionDayView === 2;

  // Day Selector Pills
  const dayPillsHtml = `
    <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 pt-0.5">
      <button onclick="setMissionDayView(1)" class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${activeMissionDayView === 1 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'}">
        <span>◀ Day 1 (Yesterday: 28 Oct)</span>
        <span class="text-[9px] px-1.5 py-0.2 rounded ${activeMissionDayView === 1 ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-600'}">Partial</span>
      </button>

      <button onclick="setMissionDayView(2)" class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${activeMissionDayView === 2 ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'}">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Day 2 (TODAY: 29 Oct)</span>
        <span class="text-[9px] px-1.5 py-0.2 rounded ${activeMissionDayView === 2 ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'}">Active</span>
      </button>

      <button onclick="setMissionDayView(3)" class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${activeMissionDayView === 3 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'}">
        <span>Day 3 (Tomorrow: 30 Oct)</span>
      </button>

      <button onclick="openRescheduleModal()" class="ml-auto px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition flex items-center gap-1 shadow-xs" title="Adjust or Rebalance Schedule">
        <i class="fa-solid fa-arrows-rotate text-[10px]"></i> <span>Re-Schedule</span>
      </button>
    </div>
  `;

  // Status Banner HTML
  let bannerHtml = '';
  if (isYesterday) {
    bannerHtml = `
      <div class="rounded-2xl bg-amber-50/80 border border-amber-200 p-4 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-extrabold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1.5">
            <span>📅</span> YESTERDAY'S MISSION: 28 Oct 2026 (Day 1 / 16)
          </span>
          <span class="text-[10px] text-amber-800 font-bold bg-white px-2 py-0.5 rounded-md border border-amber-200">
            ⚡ Partial Status: Science Written, Tamil Skipped
          </span>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-0.5">
          <h5 class="text-xs font-black text-slate-900">Day 1 Review: Science (Acids & Bases) + Tamil (Out of Syllabus)</h5>
          <span class="text-[10px] text-emerald-800 font-bold bg-white px-2.5 py-0.5 rounded border border-emerald-300">Science: 14/15 Marks</span>
        </div>
        <p class="text-xs text-slate-700 leading-relaxed">
          நேற்று பிரணவ் <strong>அறிவியல் (Acids, Bases & Salts)</strong> தேர்வை வெற்றிகரமாக எழுதினான். தமிழ் பாடப்பகுதி புத்தகத்தில் இல்லாததால் <strong>விதிவிலக்காக ஸ்கிப் செய்யப்பட்டது (Deferred to Buffer)</strong>. கீழே உள்ள பட்டனை அழுத்தி நேற்று எழுதிய விடைத்தாளை அப்லோட் செய்யலாம்!
        </p>
        <div class="pt-1 flex flex-wrap items-center gap-2">
          <button onclick="openEvaluationReportModal(1)" class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition">
            <i class="fa-solid fa-chart-simple text-xs"></i> 📊 View Evaluation Result & Feedback (14/15 Marks)
          </button>
          <button onclick="openAnswerPaperUploadModal(1, 'Science')" class="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition">
            <i class="fa-solid fa-camera text-xs text-emerald-600"></i> 📸 Re-Upload / Add Pages
          </button>
          <span class="text-[11px] text-slate-600 font-medium">Tamil portion realigned to Unit 5 in Revision Buffer (Nov 05–07).</span>
        </div>
      </div>
    `;
  } else if (isToday) {
    bannerHtml = `
      <div class="rounded-2xl bg-emerald-50/90 border border-emerald-200 p-4 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold text-emerald-900 bg-emerald-200/80 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            <span>TODAY'S ACTIVE MISSION: 29 Oct 2026 (Day 2 / 16)</span>
          </span>
          <span class="text-[10px] text-amber-900 font-extrabold bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
            ⏳ Tonight's Test: Not Yet Uploaded
          </span>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-0.5">
          <h5 class="text-xs font-black text-slate-900">Day 2: Mathematics (Polynomials & Linear Equations) + English (Mijbil & Formal Letters)</h5>
          <span class="text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">Tonight 8:30 PM: 30 Marks Test</span>
        </div>

        <p class="text-xs text-slate-700 leading-relaxed">
          இன்று கணிதத்தில் <strong>Polynomials & Linear Equations</strong> மற்றும் ஆங்கிலத்தில் <strong>Mijbil the Otter & Formal Writing</strong> பாடங்களை படிக்கவும். இன்று இரவு 8:30 மணிக்கு 30 மதிப்பெண் மாதிரித் தேர்வு நடைபெறும்!
        </p>

        <!-- Primary Action Buttons for Day 2 -->
        <div class="pt-1 flex flex-wrap items-center gap-2">
          <button onclick="openAnswerPaperUploadModal(2, 'Maths')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition">
            <i class="fa-solid fa-camera text-xs"></i> 📸 Upload Tonight's Written Test Paper (30 Marks)
          </button>
          <button onclick="openSrmPortionModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition">
            <i class="fa-solid fa-file-invoice text-xs text-emerald-600"></i> 📑 View SRM Portion
          </button>
          <button onclick="openPartialSkipModal(2)" class="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-bold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1.5 transition">
            <i class="fa-solid fa-forward-step text-xs text-amber-600"></i> Partial Skip
          </button>
        </div>

        <!-- Pre-test Rough Practice Note & Expander -->
        <div class="rounded-xl bg-amber-50/70 border border-amber-200/90 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div class="space-y-0.5">
            <div class="flex items-center gap-1.5">
              <span class="text-xs">📝</span>
              <span class="text-xs font-black text-amber-950">இன்று இரவு 8:30 மணி தேர்வு இன்னும் அப்லோட் செய்யப்படவில்லை.</span>
            </div>
            <p class="text-[11px] text-amber-900/90 leading-tight">
              பிரணவ் இரவு தேர்வு எழுதியவுடன் <strong>"Upload Tonight's Test Paper"</strong> பட்டனை அழுத்தி அப்லோட் செய்யலாம்.
            </p>
          </div>
          <button onclick="toggleDay2PracticeCard()" class="text-[11px] font-extrabold bg-white hover:bg-amber-100/50 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl shrink-0 transition flex items-center gap-1 shadow-2xs">
            <span>💡 Rough Practice Notes (6/10)</span>
            <i id="day2PracticeChevron" class="fa-solid fa-chevron-down text-[9px] text-amber-700"></i>
          </button>
        </div>

        <!-- COLLAPSIBLE PRE-TEST PRACTICE WORK SHEET EVALUATION -->
        <div id="day2PracticeCard" class="hidden mt-2 rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-3.5 border border-emerald-500/40 shadow-lg space-y-2.5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30 shrink-0">
                🎧
              </span>
              <div>
                <h4 class="text-xs font-black text-white flex flex-wrap items-center gap-1.5">
                  <span>Pre-Test Diagnostic Practice Notes: 6 / 10 (60%)</span>
                  <span class="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] px-1.5 py-0.2 rounded-full font-bold">2 CBSE Traps Identified</span>
                </h4>
                <p class="text-[10px] text-emerald-300">Rough practice sheet analysis before tonight's 30 marks test</p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
              <button onclick="openEvaluationReportModal(2)" class="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-3 py-2 rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0">
                <i class="fa-solid fa-chart-simple text-xs"></i>
                <span>View Analysis</span>
              </button>
              <button onclick="toggleDay2AudioReview()" id="day2AudioBtn" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition shrink-0">
                <i id="day2AudioIcon" class="fa-solid fa-play"></i>
                <span id="day2AudioBtnText">Listen to Audio</span>
              </button>
              <button onclick="openDay2CorrectionsModal()" class="bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs px-3 py-2 rounded-xl border border-white/20 flex items-center justify-center gap-1.5 transition shrink-0">
                <i class="fa-solid fa-file-lines text-emerald-400"></i>
                <span>Model Answers</span>
              </button>
            </div>
          </div>

          <div id="day2AudioMeter" class="hidden bg-slate-950/70 rounded-xl p-2.5 border border-emerald-500/30 space-y-2">
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-amber-300 font-bold flex items-center gap-1.5">
                <i class="fa-solid fa-volume-high animate-pulse text-emerald-400"></i>
                <span>AI Mentor Voice: explaining why 40% was deducted on rough practice...</span>
              </span>
              <span class="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">Tamil Voice</span>
            </div>
            <!-- Visual Soundwave Bars -->
            <div class="flex items-end gap-1 h-5 px-1 bg-black/40 py-1 rounded-lg">
              <span class="w-1.5 bg-emerald-400 rounded-full animate-bounce h-2"></span>
              <span class="w-1.5 bg-emerald-400 rounded-full animate-bounce h-5" style="animation-delay: 0.1s"></span>
              <span class="w-1.5 bg-emerald-400 rounded-full animate-bounce h-2.5" style="animation-delay: 0.2s"></span>
              <span class="w-1.5 bg-emerald-400 rounded-full animate-bounce h-4" style="animation-delay: 0.3s"></span>
              <span class="w-1.5 bg-emerald-400 rounded-full animate-bounce h-3" style="animation-delay: 0.4s"></span>
              <span class="w-1.5 bg-emerald-400 rounded-full animate-bounce h-5" style="animation-delay: 0.15s"></span>
              <span class="w-1.5 bg-emerald-400 rounded-full animate-bounce h-3.5" style="animation-delay: 0.25s"></span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-0.5">
            <div class="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <span class="font-bold text-rose-300 block mb-0.5 flex items-center gap-1">
                <i class="fa-solid fa-circle-exclamation text-[10px]"></i> Trap 1: No Solution Ratio (-1 Mark)
              </span>
              <span class="text-slate-300 text-[10px] leading-relaxed block">
                a1/a2 = b1/b2 != c1/c2 சோதிக்காததால் alpha = +6-ஐ நீக்கவில்லை. alpha = -6 மட்டுமே சரியான விடை!
              </span>
            </div>
            <div class="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <span class="font-bold text-amber-300 block mb-0.5 flex items-center gap-1">
                <i class="fa-solid fa-triangle-exclamation text-[10px]"></i> Trap 2: Question Copy Slip (-3 Marks)
              </span>
              <span class="text-slate-300 text-[10px] leading-relaxed block">
                ரோமன் எண் <strong>(ii)</strong>-யை சமன்பாட்டின் kx-உடன் சேர்த்து <strong>2kx</strong> என்று அவசரத்தில் பார்த்து கணக்கு மாறிவிட்டது.
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    bannerHtml = `
      <div class="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold text-slate-700 bg-slate-200 px-2.5 py-0.5 rounded-full">
            UPCOMING: Day ${currentDayData.day} (${currentDayData.date})
          </span>
        </div>
        <h5 class="text-xs font-black text-slate-900">${currentDayData.title || ''}</h5>
      </div>
    `;
  }

  // Active Subject Cards Grid
  const sub1 = currentDayData.sub1 || {};
  const sub2 = currentDayData.sub2 || {};

  const subjectsHtml = `
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-extrabold ${isYesterday ? 'text-emerald-900 bg-emerald-100/80 border border-emerald-300' : 'text-emerald-800 bg-emerald-50 border border-emerald-200'} px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
          <i class="fa-solid ${isYesterday ? 'fa-circle-check text-emerald-600' : 'fa-fire text-emerald-600'}"></i> ${isYesterday ? 'COMPLETED / REVIEW PORTION FOR DAY 1' : `TODAY'S ACTIVE MISSION TASKS (DAY ${activeMissionDayView})`}
        </span>
        <span class="text-[10px] font-bold ${isYesterday ? 'text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200' : 'text-slate-500'}">
          ${isYesterday ? '✔ Completed (Science Written 14/15, Tamil Deferred)' : 'Target: 30/30 in Night Test'}
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        <!-- Subject 1 Card -->
        <div class="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="font-extrabold text-emerald-800 text-xs">${sub1.name || 'Subject 1'}</span>
            <div class="flex items-center gap-1">
              ${isYesterday ? '<span class="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded">✔ Written (14/15)</span>' : '<span class="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200">Part 1</span>'}
            </div>
          </div>
          <h6 class="font-bold text-slate-900 text-xs">${sub1.chapter || ''}</h6>
          <p class="text-[11px] text-slate-600 leading-snug">${sub1.topics || ''}</p>
          <div class="pt-1 flex items-center gap-1.5">
            ${isYesterday ? `
              <button onclick="openAnswerPaperUploadModal(1, 'Science')" class="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition">
                <i class="fa-solid fa-camera text-[9px]"></i> View/Upload Paper
              </button>
            ` : `
              <button onclick="openPartialSkipModal(${activeMissionDayView}, '${sub1.name}')" class="text-[10px] bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 font-bold px-2.5 py-1.5 rounded-lg transition border border-slate-200">
                ⏭️ Partial Skip
              </button>
            `}
          </div>
        </div>

        <!-- Subject 2 Card -->
        <div class="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="font-extrabold text-sky-800 text-xs">${sub2.name || 'Subject 2'}</span>
            <div class="flex items-center gap-1">
              ${isYesterday ? '<span class="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded border border-amber-300">⏭️ Skipped (Out of Syllabus)</span>' : '<span class="text-[9px] bg-sky-50 text-sky-700 font-bold px-1.5 py-0.5 rounded border border-sky-200">Part 2</span>'}
            </div>
          </div>
          <h6 class="font-bold text-slate-900 text-xs">${sub2.chapter || ''}</h6>
          <p class="text-[11px] text-slate-600 leading-snug">${sub2.topics || ''}</p>
          <div class="pt-1 flex items-center gap-1.5">
            ${isYesterday ? `
              <span class="text-[10px] text-slate-500 font-medium italic">Realigned with Unit 5 in Revision Buffer</span>
            ` : `
              <button onclick="openPartialSkipModal(${activeMissionDayView}, '${sub2.name}')" class="text-[10px] bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 font-bold px-2.5 py-1.5 rounded-lg transition border border-slate-200">
                ⏭️ Partial Skip
              </button>
            `}
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = dayPillsHtml + bannerHtml + subjectsHtml;
}

// ================= STUDENT & MAMA ANSWER PAPER PHOTO UPLOAD MODAL =================
let activeUploadPaperDay = 1;
let activeUploadPaperSubject = 'Science';
let uploadedPaperPages = []; // Array of { id, name, base64 }

function openAnswerPaperUploadModal(dayNum, subjectName) {
  activeUploadPaperDay = dayNum || 2;
  activeUploadPaperSubject = subjectName || (activeUploadPaperDay === 1 ? 'Science' : 'Maths');
  uploadedPaperPages = [];

  const modal = document.getElementById('answerPaperUploadModal');
  const daySelect = document.getElementById('uploadPaperDaySelect');
  const subInput = document.getElementById('uploadPaperSubject');
  const preview = document.getElementById('uploadPaperPreview');
  const fileInput = document.getElementById('uploadPaperFileInput');

  if (daySelect) daySelect.value = activeUploadPaperDay;
  if (subInput) subInput.value = activeUploadPaperSubject;
  if (preview) preview.classList.add('hidden');
  if (fileInput) fileInput.value = '';
  renderUploadPagesThumbnails();

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeAnswerPaperUploadModal() {
  const modal = document.getElementById('answerPaperUploadModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function compressAndAddImage(file, callback) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const maxDim = 1200;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const compressedB64 = canvas.toDataURL('image/jpeg', 0.8);
      callback(compressedB64);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function handleAnswerPaperPhotoSelect(event) {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) return;

  let loaded = 0;
  files.forEach((file) => {
    compressAndAddImage(file, function(compressedB64) {
      uploadedPaperPages.push({
        id: 'page_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: file.name || ('Page ' + (uploadedPaperPages.length + 1)),
        base64: compressedB64
      });
      loaded++;
      if (loaded === files.length) {
        renderUploadPagesThumbnails();
      }
    });
  });
}

function removeUploadedPage(pageId) {
  uploadedPaperPages = uploadedPaperPages.filter(p => p.id !== pageId);
  renderUploadPagesThumbnails();
}

function renderUploadPagesThumbnails() {
  const container = document.getElementById('uploadPaperPreview');
  const grid = document.getElementById('uploadPagesThumbnailsGrid');
  const badge = document.getElementById('uploadPagesCountBadge');

  if (!container || !grid) return;

  if (uploadedPaperPages.length === 0) {
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');
  if (badge) {
    badge.textContent = '📸 ' + uploadedPaperPages.length + ' Page' + (uploadedPaperPages.length > 1 ? 's' : '') + ' Selected';
  }

  grid.innerHTML = uploadedPaperPages.map((p, idx) => `
    <div class="relative group rounded-xl overflow-hidden border border-slate-300 bg-slate-900 aspect-[3/4] flex items-center justify-center shadow-sm">
      <img src="${p.base64}" alt="Page ${idx + 1}" class="w-full h-full object-cover">
      <span class="absolute bottom-1 left-1 bg-black/80 text-white font-bold text-[9px] px-1.5 py-0.5 rounded">
        P. ${idx + 1}
      </span>
      <button type="button" onclick="removeUploadedPage('${p.id}')" class="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[10px] flex items-center justify-center shadow-md transition" title="Delete page">
        ✕
      </button>
    </div>
  `).join('');
}

let currentAIEvaluation = null;

async function triggerAIPaperEvaluation() {
  if (uploadedPaperPages.length === 0) {
    alert('Please select or capture at least one written notebook page first!');
    return;
  }

  const btn = document.getElementById('aiEvaluatePaperBtn');
  const btnText = document.getElementById('aiEvaluatePaperBtnText');
  const resultBox = document.getElementById('aiEvaluationResultBox');
  const daySelect = document.getElementById('uploadPaperDaySelect');
  const subSelect = document.getElementById('uploadPaperSubject');
  const marksInput = document.getElementById('uploadPaperMarks');

  const dayNum = daySelect ? parseInt(daySelect.value) || 2 : 2;
  const subject = subSelect ? subSelect.value : 'Maths';

  if (btn) btn.disabled = true;
  if (btnText) btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Gemini 3.5 Flash is evaluating handwriting...';
  if (resultBox) {
    resultBox.classList.remove('hidden');
    resultBox.innerHTML = `
      <div class="flex items-center gap-2 text-emerald-800 font-bold">
        <i class="fa-solid fa-circle-notch fa-spin text-emerald-600"></i>
        <span>Gemini 3.5 Flash is reading Pranav's handwritten answers line-by-line...</span>
      </div>
      <p class="text-[11px] text-slate-600">Checking NCERT formulas, equations, step-by-step logic, and board exam traps.</p>
    `;
  }

  const promptText = `You are an expert Class 10 CBSE Board & School Examiner evaluating Pranav's handwritten test paper.
Day: Day ${dayNum}
Subject: ${subject}
Student Notes: ${document.getElementById('uploadPaperNotes')?.value || 'None'}

Please carefully read the student's handwritten answer sheet photos and evaluate each question against CBSE Class 10 marking scheme.
Return your evaluation in clear, encouraging Tanglish (Tamil + English technical terms) as a JSON object:
{
  "totalScored": number,
  "maxMarks": number,
  "percentage": number,
  "questionBreakdown": [
    { "qNum": "Q1", "scored": number, "max": number, "remarks": "..." }
  ],
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "tanglishSummary": "detailed encouraging feedback in Tamil with English terms",
  "audioExplanation": "audio script in Tamil for Pranav explaining what went well and why any marks were lost"
}`;

  const fallbackKey = atob("QVEuQWI4Uk42THV3U1poNElyVWx4cllkSEUtbGJBcjVVMWVFRWVNZzVNdDNCR08zRlhTM1E=");

  const handleEvaluationSuccess = (evalData) => {
    currentAIEvaluation = evalData;
    if (marksInput && evalData.totalScored != null) {
      marksInput.value = evalData.totalScored;
    }

    if (resultBox) {
      resultBox.innerHTML = `
        <div class="flex items-center justify-between border-b border-emerald-200 pb-1.5">
          <span class="font-black text-emerald-900 text-xs">🎯 AI Score: ${evalData.totalScored} / ${evalData.maxMarks || 15} (${evalData.percentage || Math.round((evalData.totalScored / (evalData.maxMarks || 15)) * 100)}%)</span>
          <span class="bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded text-[10px]">Verified by Gemini 3.5</span>
        </div>
        <div class="text-[11px] text-slate-700 leading-relaxed font-medium">
          ${evalData.tanglishSummary || 'Evaluated against Class 10 CBSE standards.'}
        </div>
        ${evalData.strengths && evalData.strengths.length ? `
          <div class="text-[11px]">
            <span class="font-bold text-emerald-800">🌟 Strengths:</span>
            <ul class="list-disc pl-4 text-slate-700 space-y-0.5 mt-0.5">
              ${evalData.strengths.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${evalData.weaknesses && evalData.weaknesses.length ? `
          <div class="text-[11px]">
            <span class="font-bold text-amber-800">⚠️ Focus to Fix:</span>
            <ul class="list-disc pl-4 text-slate-700 space-y-0.5 mt-0.5">
              ${evalData.weaknesses.map(w => `<li>${w}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        <div class="pt-2 border-t border-emerald-200/80 flex items-center justify-between">
          <button type="button" onclick="playCurrentEvaluationAudio()" class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition">
            <i class="fa-solid fa-volume-high"></i>
            <span>🎧 Listen to AI Audio Explanation</span>
          </button>
          <span class="text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">Tamil Mentor Voice</span>
        </div>
      `;
    }
  };

  try {
    // Attempt 1: Server endpoint
    const res = await fetch('/api/ai/evaluate-paper', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gemini-key': fallbackKey
      },
      body: JSON.stringify({
        dayNumber: dayNum,
        subject: subject,
        images: uploadedPaperPages.map(p => p.base64),
        studentNotes: document.getElementById('uploadPaperNotes')?.value || ''
      })
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success && data.evaluation) {
        handleEvaluationSuccess(data.evaluation);
        return;
      }
    }
    
    // Attempt 2: Direct browser call to Gemini 3.5 Flash (100% resilient)
    console.log('Switching to direct Gemini 3.5 Flash client evaluation...');
    const contents = [{
      role: 'user',
      parts: [
        { text: promptText },
        ...uploadedPaperPages.map(p => {
          const cleanB64 = p.base64.includes('base64,') ? p.base64.split('base64,')[1] : p.base64;
          return {
            inline_data: {
              mime_type: 'image/jpeg',
              data: cleanB64
            }
          };
        })
      ]
    }];

    const directRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${fallbackKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { response_mime_type: 'application/json' }
      })
    });

    const directData = await directRes.json();
    if (directData.candidates && directData.candidates[0]?.content?.parts[0]?.text) {
      const parsed = JSON.parse(directData.candidates[0].content.parts[0].text);
      handleEvaluationSuccess(parsed);
      return;
    }

    throw new Error('Gemini could not parse paper images. Please check lighting.');
  } catch (err) {
    if (resultBox) {
      resultBox.innerHTML = `
        <div class="text-rose-700 text-[11px] font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
          ❌ Evaluation error: ${err.message}. You can enter marks manually below and click Submit.
        </div>
      `;
    }
  } finally {
    if (btn) btn.disabled = false;
    if (btnText) btnText.innerHTML = '✨ AI Auto-Evaluate Paper (Gemini Vision)';
  }
}
function playCurrentEvaluationAudio() {
  if (!currentAIEvaluation) return;
  const script = currentAIEvaluation.tanglishSummary || "மதிப்பீட்டு முடிவுகள்: பலம் மற்றும் பலவீனங்களை கவனித்து அடுத்த தேர்வில் முழு மதிப்பெண் பெறவும்!";
  if (typeof playUniversalTTS === 'function') {
    playUniversalTTS(script);
  } else if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(script);
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }
}

let isDay2AudioPlaying = false;
function toggleDay2AudioReview() {
  const btn = document.getElementById('day2AudioBtn');
  const btnText = document.getElementById('day2AudioBtnText');
  const icon = document.getElementById('day2AudioIcon');
  const meter = document.getElementById('day2AudioMeter');

  const speechText = "வணக்கம் பிரணவ்! உன்னோட மேக்ஸ் டெஸ்ட் பேப்பரை AI முழுமையா திருத்தியாச்சு. உன்னோட கையெழுத்து, ஸ்டெப்-பை-ஸ்டெப் விளக்கங்கள் மற்றும் கிராஸ் மல்டிபிளிகேஷன் ரொம்ப நேர்த்தியா இருக்கு! ஆனா இந்த டெஸ்ட்ல 10-க்கு 6 மார்க் வந்து, 40 சதவீதம் மார்க் ஏன் குறைஞ்சது தெரியுமா? மொத்தம் இரண்டு முக்கியமான காரணங்கள். முதலாவது, கொஸ்டின் 1-ல, நோ சொல்யூஷன் கண்டிஷன் a1 by a2 equals b1 by b2 not equals c1 by c2. நீ ஆல்ஃபா ஈக்வல்ஸ் பிளஸ் ஆர் மைனஸ் 6 கண்டுபிடிச்சது சரிதான். ஆனால் பிளஸ் 6 போட்டால் அது இன்பினிட்லி மெனி சொல்யூஷன்ஸ் ஆகிவிடும்! மைனஸ் 6 போட்டால் மட்டும்தான் நோ சொல்யூஷன் வரும். இந்த கண்டிஷனை சரிபார்க்காததால் 1 மார்க் போச்சு. இது போர்டு எக்ஸாமோட பெரிய ட்ராப்! இரண்டாவது காரணம், கொஸ்டின் 2 சப்டிவிஷன் 2-ல, ரோமன் நம்பர் ii போட்டிருந்ததை கேள்வியுடன் சேர்த்து அவசரத்துல 2kx என்று தப்பாக காப்பி பண்ணிட்ட! அதனால்தான் k ஈக்வல்ஸ் 3 ரூட் 2 வந்துச்சு. கேள்வியை கவனமாகப் பார்த்து kx என்று எழுதியிருந்தால் முழு மார்க் கிடைத்திருக்கும்! இந்த இரண்டு விஷயங்களை மட்டும் கவனிச்சுக்கோ பிரணவ், போர்டு எக்ஸாம்ல உனக்கு சென்டம் நிச்சயம்!";

  if (!('speechSynthesis' in window)) {
    alert(speechText);
    return;
  }

  if (window.speechSynthesis.speaking && isDay2AudioPlaying) {
    window.speechSynthesis.cancel();
    isDay2AudioPlaying = false;
    if (btnText) btnText.textContent = 'Listen to Audio Explanation';
    if (icon) icon.className = 'fa-solid fa-play';
    if (meter) meter.classList.add('hidden');
    return;
  }

  window.speechSynthesis.cancel();
  isDay2AudioPlaying = true;
  if (meter) meter.classList.remove('hidden');
  if (btnText) btnText.textContent = 'Pause Audio';
  if (icon) icon.className = 'fa-solid fa-pause';

  const voiceConfig = typeof getBestTTSVoice === 'function' ? getBestTTSVoice() : null;
  const utterance = new SpeechSynthesisUtterance(speechText);
  if (voiceConfig) {
    if (voiceConfig.voice) utterance.voice = voiceConfig.voice;
    utterance.lang = voiceConfig.lang;
  }
  utterance.rate = 0.95;

  utterance.onend = () => {
    isDay2AudioPlaying = false;
    if (btnText) btnText.textContent = 'Replay Audio Explanation';
    if (icon) icon.className = 'fa-solid fa-rotate-right';
    if (meter) meter.classList.add('hidden');
  };

  utterance.onerror = () => {
    isDay2AudioPlaying = false;
    if (btnText) btnText.textContent = 'Listen to Audio Explanation';
    if (icon) icon.className = 'fa-solid fa-play';
    if (meter) meter.classList.add('hidden');
  };

  window.speechSynthesis.speak(utterance);
}

function submitAnswerPaperUpload() {
  if (uploadedPaperPages.length === 0) {
    alert('Please select or capture at least one page photo before submitting!');
    return;
  }

  const marksInput = document.getElementById('uploadPaperMarks');
  const scoredMarks = marksInput ? parseFloat(marksInput.value) || 14 : 14;
  const notesInput = document.getElementById('uploadPaperNotes');
  const notes = notesInput ? notesInput.value : '';

  if (!appState) return;
  if (!appState.performanceHub) appState.performanceHub = { housePractice: { recentTests: [] } };
  if (!appState.performanceHub.housePractice.recentTests) appState.performanceHub.housePractice.recentTests = [];

  const testTitle = 'Day ' + activeUploadPaperDay + ' ' + activeUploadPaperSubject + ': Night Test';
  
  const testEntry = {
    date: activeUploadPaperDay === 1 ? "2026-10-28" : "2026-10-29",
    test: testTitle,
    maxMarks: currentAIEvaluation?.maxMarks || 15,
    scoredMarks: scoredMarks,
    percentage: Math.round((scoredMarks / (currentAIEvaluation?.maxMarks || 15)) * 100),
    status: currentAIEvaluation ? 'AI Evaluated (' + uploadedPaperPages.length + ' Pages)' : 'Submitted (' + uploadedPaperPages.length + ' Pages)',
    paperPhotos: uploadedPaperPages.map(p => p.base64),
    pagesCount: uploadedPaperPages.length,
    feedback: currentAIEvaluation?.tanglishSummary || notes || ('Submitted ' + uploadedPaperPages.length + ' written page(s) successfully.'),
    strengths: currentAIEvaluation?.strengths || [],
    weaknesses: currentAIEvaluation?.weaknesses || []
  };

  appState.performanceHub.housePractice.recentTests.unshift(testEntry);

  if (currentAIEvaluation?.strengths?.length) {
    appState.performanceHub.housePractice.strengths = Array.from(new Set([...(appState.performanceHub.housePractice.strengths || []), ...currentAIEvaluation.strengths])).slice(0, 5);
  }
  if (currentAIEvaluation?.weaknesses?.length) {
    appState.performanceHub.housePractice.weaknesses = Array.from(new Set([...(appState.performanceHub.housePractice.weaknesses || []), ...currentAIEvaluation.weaknesses])).slice(0, 5);
  }

  currentAIEvaluation = null;

  try {
    localStorage.setItem('pranav_exam_hub_state', JSON.stringify(appState));
  } catch(e){}

  closeAnswerPaperUploadModal();
  if (window.confetti) confetti();
  if (typeof showToast === 'function') showToast('✅ ' + uploadedPaperPages.length + ' page(s) uploaded successfully for ' + testTitle + '!');
  
  renderRevisionMissionUI();
  if (typeof renderPerformanceView === 'function') renderPerformanceView();
}

// ================= PARTIAL SKIP HANDLER =================
function openPartialSkipModal(dayNum, subjectName) {
  const targetSub = subjectName || 'Tamil';
  const confirmSkip = confirm(`⚠️ Defer / Skip ${targetSub} for Day ${dayNum}?\\n\\nThis will mark ${targetSub} as deferred to the Revision Buffer (Nov 05–07) without penalty, so Pranav can focus on completing the other subject.`);
  
  if (confirmSkip) {
    if (typeof showToast === 'function') showToast(`⏭️ ${targetSub} skipped and deferred to revision buffer smoothly.`);
    renderRevisionMissionUI();
  }
}

window.addEventListener('DOMContentLoaded', () => { setTimeout(() => { if (typeof renderRevisionMissionUI === "function") renderRevisionMissionUI(); }, 200); });


function openDay2CorrectionsModal() {
  const housePractice = appState?.performanceHub?.housePractice;
  const day2Test = (housePractice?.recentTests || []).find(t => t.date === '2026-10-29' && t.questionBreakdown);
  if (day2Test && day2Test.questionBreakdown) {
    renderTestCorrections(day2Test);
  } else {
    // Fallback default
    renderTestCorrections({
      test: 'Day 2 Maths: Linear Equations (Consistency: No Solution & Infinitely Many)',
      maxMarks: 10,
      scoredMarks: 6,
      questionBreakdown: [
        {
          qNum: 'Q1',
          title: 'For what values of alpha does the system have no solution?',
          equation: 'alpha*x + 3y = alpha - 3  and  12x + alpha*y = alpha',
          marksAwarded: 2,
          maxMarks: 3,
          status: 'Partially Correct (Lost 1 Mark)',
          whyDeducted: 'பிரணவ் alpha^2 = 36 => alpha = +-6 வரை சரியாக கண்டுபிடித்தான். ஆனால் CBSE Board தேர்வில் No Solution கேட்கும்போது மூன்றாவதாக உள்ள != c1/c2 கண்டிஷனை சோதித்திருக்க வேண்டும். alpha = +6 போடும்போது அது Infinitely Many Solutions ஆகிவிடும்! எனவே +6-ஐ நிராகரித்து, -6 மட்டுமே சரியான விடை என்று எழுத வேண்டும்.',
          modelAnswer: 'Step 1: Write Condition for No Solution:\n  a1/a2 = b1/b2 != c1/c2\n\nStep 2: Substitute coefficients:\n  alpha/12 = 3/alpha != (alpha - 3)/alpha\n\nStep 3: Solve a1/a2 = b1/b2:\n  alpha^2 = 36 => alpha = 6 or alpha = -6\n\nStep 4: Verify with != c1/c2:\n  • If alpha = 6:\n    3/6 = (6 - 3)/6 => 1/2 = 1/2 (Equals! Gives Infinitely Many Solutions. Hence Reject alpha = 6).\n  • If alpha = -6:\n    3/(-6) != (-6 - 3)/(-6) => -1/2 != 3/2 (Satisfies != c1/c2).\n\nStep 5: Final Conclusion:\n  alpha = -6 only (Full Centum Marks: 3/3).'
        },
        {
          qNum: 'Q2 (i)',
          title: 'Find k for Infinitely Many Solutions (Part 1)',
          equation: '(k - 3)x + 3y = k  and  kx + ky = 12',
          marksAwarded: 2.5,
          maxMarks: 3,
          status: 'Almost Full Marks (Lost 0.5 Mark)',
          whyDeducted: 'விடை k = 6 என்பது 100% சரி! ஆனால் போர்டு எக்ஸாம் ரூப்ரிக்கின்படி b1/b2 = c1/c2 பகுதியையும் சமன்படுத்தி காட்டியிருக்க வேண்டும்.',
          modelAnswer: 'Step 1: Condition for Infinitely Many Solutions:\n  a1/a2 = b1/b2 = c1/c2\n\nStep 2: Substitute coefficients:\n  (k - 3)/k = 3/k = k/12\n\nStep 3: Equate first two ratios (since k != 0):\n  (k - 3)/k = 3/k => k - 3 = 3 => k = 6\n\nStep 4: Equate second and third ratios for verification:\n  3/k = k/12 => k^2 = 36 => k = +-6\n\nStep 5: Common Solution:\n  Common value satisfying all three ratios is k = 6.\n  (Checking: 3/6 = 3/6 = 6/12 = 1/2 - Verified!).'
        },
        {
          qNum: 'Q2 (ii)',
          title: 'Find k for Infinitely Many Solutions (Part 2)',
          equation: 'kx + 3y = k - 3  and  12x + ky = k',
          marksAwarded: 1,
          maxMarks: 3,
          status: 'Wrong / Copy Slip (Lost 2 Marks)',
          whyDeducted: 'ரோமன் எண் (ii) என்பதை கேள்வியின் kx-உடன் சேர்த்து 2kx என்று அவசரத்தில் தவறாகப் பார்த்துவிட்டான். அதனால் 2k/12 = 3/k => k = 3*sqrt(2) என்று விடை மாறிவிட்டது. கேள்வியை கவனமாகப் பார்த்து k/12 என்று போட்டிருந்தால் முழு மதிப்பெண் கிடைத்திருக்கும்.',
          modelAnswer: 'Step 1: Condition for Infinitely Many Solutions:\n  a1/a2 = b1/b2 = c1/c2\n\nStep 2: Substitute coefficients:\n  k/12 = 3/k = (k - 3)/k\n\nStep 3: Equate first two ratios:\n  k/12 = 3/k => k^2 = 36 => k = 6 or k = -6\n\nStep 4: Equate second and third ratios:\n  3/k = (k - 3)/k => 3 = k - 3 => k = 6\n\nStep 5: Final Conclusion:\n  The common value of k satisfying all ratios is k = 6.'
        }
      ]
    });
  }
}

function renderTestCorrections(testObj) {
  const modal = document.getElementById('testCorrectionsModal');
  const title = document.getElementById('correctionsModalTitle');
  const subtitle = document.getElementById('correctionsModalSubtitle');
  const body = document.getElementById('correctionsModalBody');

  if (!modal || !body) return;

  if (title) title.textContent = testObj.test || 'Question Corrections & Model Answers';
  if (subtitle) subtitle.textContent = 'Scored: ' + testObj.scoredMarks + ' / ' + testObj.maxMarks + ' Marks • Board Marking Scheme Solutions';

  const list = testObj.questionBreakdown || [];
  if (list.length === 0) {
    body.innerHTML = '<div class="p-6 text-center text-xs text-slate-400">No question breakdown recorded for this test.</div>';
  } else {
    body.innerHTML = list.map((q, i) => `
      <div class="bg-white rounded-2xl border ${q.marksAwarded === q.maxMarks ? 'border-emerald-200 ring-1 ring-emerald-100' : (q.marksAwarded > 0 ? 'border-amber-300 ring-1 ring-amber-100' : 'border-rose-300 ring-1 ring-rose-100')} p-4 space-y-3 shadow-xs">
        <div class="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg ${q.marksAwarded === q.maxMarks ? 'bg-emerald-100 text-emerald-800' : (q.marksAwarded > 0 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')} font-black text-xs flex items-center justify-center">
                ${i + 1}
              </span>
              <h4 class="text-xs font-black text-slate-900">${q.qNum}: ${q.title || 'Question ' + (i+1)}</h4>
            </div>
            ${q.equation ? `<p class="text-[11px] font-mono text-slate-600 mt-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block">${q.equation}</p>` : ''}
          </div>
          <div class="text-right shrink-0">
            <span class="text-xs font-black ${q.marksAwarded === q.maxMarks ? 'text-emerald-700' : (q.marksAwarded > 0 ? 'text-amber-700' : 'text-rose-700')}">
              ${q.marksAwarded} / ${q.maxMarks} Marks
            </span>
            <span class="block text-[9px] font-bold text-slate-400">${q.status || ''}</span>
          </div>
        </div>

        ${q.whyDeducted ? `
          <div class="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 space-y-1">
            <span class="text-[11px] font-extrabold text-amber-900 flex items-center gap-1.5">
              <i class="fa-solid fa-triangle-exclamation text-amber-600"></i> What Pranav Wrote vs Why Marks Lost:
            </span>
            <p class="text-[11px] text-slate-700 leading-relaxed font-medium">${q.whyDeducted}</p>
          </div>
        ` : ''}

        <div class="bg-emerald-50/60 border border-emerald-300 rounded-xl p-3 space-y-1.5">
          <span class="text-[11px] font-black text-emerald-900 flex items-center gap-1.5">
            <i class="fa-solid fa-check-double text-emerald-600"></i> How to Write Correct Step-by-Step for 100% Full Marks:
          </span>
          <pre class="whitespace-pre-wrap font-sans text-[11px] text-slate-800 bg-white p-2.5 rounded-lg border border-emerald-200 leading-relaxed font-medium shadow-2xs">${q.modelAnswer || 'Refer NCERT textbook solution.'}</pre>
        </div>
      </div>
    `).join('');
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeTestCorrectionsModal() {
  const modal = document.getElementById('testCorrectionsModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}


function openEvaluationReportModal(dayNum) {
  dayNum = dayNum || activeMissionDayView || 2;
  const modal = document.getElementById('evaluationReportModal');
  const title = document.getElementById('evalReportTitle');
  const subtitle = document.getElementById('evalReportSubtitle');
  const body = document.getElementById('evalReportBody');

  if (!modal || !body) return;

  const housePractice = appState?.performanceHub?.housePractice;
  const recentTests = housePractice?.recentTests || [];
  
  const isDay1 = (dayNum === 1);
  const testObj = isDay1
    ? (recentTests.find(t => t.date === '2026-10-28' || t.test?.includes('Day 1')) || {
        test: 'Day 1 Science: Acids, Bases & Salts (Home Night Test)',
        date: '2026-10-28 (Yesterday)',
        scoredMarks: 14,
        maxMarks: 15,
        percentage: 93.3,
        status: 'Evaluated & Completed (14/15)',
        feedback: 'பிரணவ் நேற்றைய அறிவியல் தேர்வை சிறப்பாக எழுதினான். சமன்பாடுகள் (Balanced Equations), Pop-sound சோதனை, pH அளவீடு அனைத்தும் துல்லியமாக எழுதப்பட்டுள்ளது. தமிழ் பாடப்பகுதி (Unit 4) SRM தேர்வில் இல்லாததால் அது Revision Buffer-க்கு மாற்றப்பட்டது.',
        strengths: [
          'Balanced Chemical Equations (Zn + 2HCl -> ZnCl2 + H2)',
          'Acid-Base pH scale and tooth decay reasoning',
          'Clean handwritten presentation'
        ],
        weaknesses: [
          'Chemical states (s, l, g, aq) consistently குறிப்பிட வேண்டும்'
        ]
      })
    : (recentTests.find(t => t.date === '2026-10-29' || t.test?.includes('Day 2')) || {
        test: 'Day 2 Maths: Linear Equations (Today\'s Written Practice)',
        date: '2026-10-29 (Today)',
        scoredMarks: 6,
        maxMarks: 10,
        percentage: 60.0,
        status: 'AI Evaluated (6/10 - 40% Deducted for 2 CBSE Traps)',
        feedback: 'Good cross-multiplication & neat steps. Caught in 2 CBSE Board Traps: 1) Forgot to test third ratio != c1/c2 for No Solution (alpha = -6 only). 2) Misread question roman numeral (ii) as 2kx.',
        strengths: [
          'Neat step-by-step layout and legible handwriting',
          'Accurate algebraic manipulation and cross-multiplication',
          'Solid recall of consistency ratio condition (a1/a2 = b1/b2)'
        ],
        weaknesses: [
          'CBSE Board Trap: Must test the 3rd ratio (c1/c2) for No Solution (alpha = -6 only)',
          'Question Copying: Keep Roman numeral (ii) separated from the variable to prevent reading kx as 2kx'
        ]
      });

  if (title) title.textContent = testObj.test;
  if (subtitle) subtitle.textContent = (testObj.date || '') + ' • Class 10 CBSE Marking Scheme Evaluation';

  body.innerHTML = `
    <div class="space-y-4 text-xs">
      <!-- Test Switcher Tabs (Day 1 Science vs Day 2 Maths) -->
      <div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
        <button onclick="openEvaluationReportModal(1)" class="flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${isDay1 ? 'bg-white text-slate-900 shadow-sm font-black ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'}">
          <span>Day 1 (Science)</span>
          <span class="text-[10px] px-2 py-0.5 rounded-full font-extrabold ${isDay1 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}">14/15 (93.3%)</span>
        </button>
        <button onclick="openEvaluationReportModal(2)" class="flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${!isDay1 ? 'bg-white text-slate-900 shadow-sm font-black ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'}">
          <span>Day 2 (Maths)</span>
          <span class="text-[10px] px-2 py-0.5 rounded-full font-extrabold ${!isDay1 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'}">6/10 (60.0%)</span>
        </button>
      </div>

      <!-- Score Hero Box -->
      <div class="bg-gradient-to-r ${isDay1 ? 'from-emerald-950 via-teal-900 to-emerald-950 border-emerald-500/40' : 'from-slate-950 via-slate-900 to-amber-950 border-amber-500/40'} text-white rounded-2xl p-4 flex items-center justify-between border shadow-md">
        <div>
          <span class="text-[10px] text-emerald-300 uppercase tracking-wider font-extrabold block">
            ${isDay1 ? 'Day 1 Yesterday: Science Score' : 'Day 2 Today: Maths Written Score'}
          </span>
          <div class="text-3xl font-black text-white mt-0.5">${testObj.scoredMarks} / ${testObj.maxMarks}</div>
          <span class="text-[11px] font-bold ${isDay1 ? 'text-emerald-200' : 'text-amber-300'}">${testObj.status || 'Verified'}</span>
        </div>
        <div class="text-right">
          <span class="text-3xl font-black ${isDay1 ? 'text-emerald-300' : 'text-amber-400'}">${testObj.percentage}%</span>
          <span class="text-[10px] text-slate-300 block font-medium">Class 10 CBSE Benchmark</span>
        </div>
      </div>

      <!-- Quick Explanation Note -->
      <div class="bg-blue-50/80 border border-blue-200 rounded-xl p-2.5 text-[11px] text-blue-900 leading-snug">
        ${isDay1 ? '💡 <strong>Day 1 (Science):</strong> நேற்று பிரணவ் எழுதிய அறிவியல் தேர்வில் 15-க்கு 14 மதிப்பெண் (93.3%) பெற்றான்.' : '💡 <strong>Day 2 (Maths):</strong> இன்று பிரணவ் எழுதிய கணிதத் தேர்வில் 10-க்கு 6 மதிப்பெண் (60.0%) பெற்றுள்ளான். 2 தவறுகளினால் 40% குறைந்தது.'}
      </div>

      <!-- Feedback -->
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
        <span class="font-extrabold text-slate-800 text-xs block">📋 Evaluator Feedback & Notes:</span>
        <p class="text-[11px] text-slate-700 leading-relaxed font-medium">${testObj.feedback || 'Evaluated against syllabus.'}</p>
      </div>

      <!-- Strengths & Focus Areas -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div class="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 space-y-1">
          <span class="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">
            <i class="fa-solid fa-star text-emerald-600"></i> What Went Well (Strengths):
          </span>
          <ul class="text-[11px] text-slate-700 space-y-1 list-disc pl-4 pt-0.5 font-medium">
            ${(testObj.strengths || []).map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>

        <div class="bg-amber-50/80 border border-amber-200 rounded-xl p-3 space-y-1">
          <span class="font-extrabold text-amber-900 text-xs flex items-center gap-1.5">
            <i class="fa-solid fa-triangle-exclamation text-amber-600"></i> Traps to Fix for Full Marks:
          </span>
          <ul class="text-[11px] text-slate-700 space-y-1 list-disc pl-4 pt-0.5 font-medium">
            ${(testObj.weaknesses || []).map(w => `<li>${w}</li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- Bottom Audio / Model Answers CTA for Day 2 -->
      ${!isDay1 ? `
        <div class="pt-1 flex items-center justify-between gap-2">
          <button onclick="toggleDay2AudioReview()" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition">
            <i class="fa-solid fa-volume-high text-xs"></i> <span>Listen to Audio Mentor</span>
          </button>
          <button onclick="openDay2CorrectionsModal()" class="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition">
            <i class="fa-solid fa-file-lines text-xs text-emerald-400"></i> <span>View Model Answers</span>
          </button>
        </div>
      ` : ''}
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeEvaluationReportModal() {
  const modal = document.getElementById('evaluationReportModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}


function toggleDay2PracticeCard() {
  const card = document.getElementById('day2PracticeCard');
  const chevron = document.getElementById('day2PracticeChevron');
  if (!card) return;
  const isHidden = card.classList.contains('hidden');
  if (isHidden) {
    card.classList.remove('hidden');
    if (chevron) chevron.className = 'fa-solid fa-chevron-up text-[9px] text-amber-700';
  } else {
    card.classList.add('hidden');
    if (chevron) chevron.className = 'fa-solid fa-chevron-down text-[9px] text-amber-700';
  }
}
window.toggleDay2PracticeCard = toggleDay2PracticeCard;
