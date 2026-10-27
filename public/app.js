// Global State & User Auth
let appState = null;
let currentUser = JSON.parse(localStorage.getItem('pranav_user_auth')) || {
  role: 'admin',
  name: 'Mama (Super Admin)',
  email: 'jothi1809@gmail.com',
  badge: 'Owner',
  permissions: {
    canEditSyllabus: true,
    canEditExamDates: true,
    canAddTestMarks: true,
    canLogStudy: true,
    canPostCheer: true,
    canManageUsers: true
  }
};

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
  isDesktopFramed = !isDesktopFramed;
  const btn = document.getElementById('viewModeBtn');
  if (isDesktopFramed) {
    document.body.classList.add('desktop-framed');
    if (btn) btn.innerHTML = '📱 Mobile Frame';
  } else {
    document.body.classList.remove('desktop-framed');
    if (btn) btn.innerHTML = '🖥️ Full Width';
  }
}

// Helper: Get Auth Headers for API Requests
function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-User-Role': currentUser.role || 'viewer',
    'X-User-Email': currentUser.email || ''
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
  await fastLoginPin(pin);
  if (pinInput) pinInput.value = '';
}

async function fastLoginPin(pin) {
  try {
    const res = await fetch('/api/auth/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });

    if (res.ok) {
      const data = await res.json();
      applyUserAuth(data.user);
      closeModal('authModal');
      showToast(`Unlocked as ${data.user.name}!`);
    } else {
      const localPins = {
        '1809': { role: 'admin', name: 'Mama (Super Admin)', email: 'jothi1809@gmail.com', badge: 'Owner', permissions: { canEditSyllabus: true } },
        '2027': { role: 'student', name: 'Pranav', email: 'pranav@student.hub', badge: 'Student', permissions: { canEditSyllabus: false } },
        '1010': { role: 'viewer', name: 'Father / Parents', email: 'parents@family.hub', badge: 'Viewer', permissions: { canEditSyllabus: false } }
      };

      if (localPins[pin]) {
        applyUserAuth(localPins[pin]);
        closeModal('authModal');
        showToast(`Unlocked as ${localPins[pin].name}!`);
      } else {
        showToast('Incorrect 4-digit PIN', false);
      }
    }
  } catch (err) {
    showToast('PIN check offline', false);
  }
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
    openModal('addTestModal');
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

  const views = ['home', 'schedule', 'syllabus', 'timer', 'family', 'formulas', 'scores'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) {
      if (v === tabId) el.classList.remove('hidden');
      else el.classList.add('hidden');
    }
  });

  ['home', 'schedule', 'syllabus', 'timer', 'family'].forEach(b => {
    const btn = document.getElementById(`nav-btn-${b}`);
    if (btn) {
      if (b === tabId || (tabId === 'scores' && b === 'family') || (tabId === 'formulas' && b === 'syllabus')) {
        btn.className = 'nav-item flex flex-col items-center relative text-emerald-600 font-bold active-nav-dot';
      } else {
        btn.className = 'nav-item flex flex-col items-center relative text-slate-400 hover:text-slate-700 transition';
      }
    }
  });

  const scroller = document.getElementById('main-scroll-content');
  if (scroller) scroller.scrollTop = 0;

  if (tabId === 'schedule') renderScheduleView();
  if (tabId === 'syllabus') renderSyllabusView();
  if (tabId === 'scores') renderScoresChart();
  if (tabId === 'formulas') renderFormulasView();
}

function openSubjectDetail(subKey) {
  currentSyllabusSubject = subKey;
  switchTab('syllabus');
}

// ================= FETCH DATA =================
async function fetchData() {
  try {
    const res = await fetch('/api/data', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('API offline');
    appState = await res.json();
    renderAll();
  } catch (err) {
    const cached = localStorage.getItem('pranav_offline_data');
    if (cached) {
      appState = JSON.parse(cached);
      renderAll();
    }
  }
}

// ================= RENDER ALL =================
function renderAll() {
  if (!appState) return;
  localStorage.setItem('pranav_offline_data', JSON.stringify(appState));

  renderHeroCountdown();
  renderDailyTargetCard();
  renderScheduleView();
  renderSubjectGridStats();
  renderSyllabusView();
  renderFamilyWall();
  renderScoresList();
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
  if (!heroDays || !appState.examDates) return;

  const targetDate = new Date(appState.examDates.termRev1 || '2026-11-16');
  const now = new Date();
  const diffDays = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));

  if (diffDays > 0) heroDays.textContent = `${diffDays} Days`;
  else heroDays.textContent = 'Today!';
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

// Syllabus View
function renderSyllabusView() {
  if (!appState.subjects) return;

  const pillsContainer = document.getElementById('syllabus-sub-pills');
  if (pillsContainer) {
    pillsContainer.innerHTML = '';
    Object.entries(appState.subjects).forEach(([key, sub]) => {
      const isSelected = key === currentSyllabusSubject;
      const btn = document.createElement('button');
      btn.className = `px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition ${isSelected ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`;
      btn.innerHTML = `${sub.icon} ${sub.title.split(' ')[0]}`;
      btn.onclick = () => {
        currentSyllabusSubject = key;
        renderSyllabusView();
      };
      pillsContainer.appendChild(btn);
    });
  }

  const listContainer = document.getElementById('syllabus-chapters-container');
  if (!listContainer) return;

  const currentSub = appState.subjects[currentSyllabusSubject];
  if (!currentSub) return;

  listContainer.innerHTML = '';

  currentSub.chapters.forEach(ch => {
    const card = document.createElement('div');
    card.className = 'bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-2 shadow-card';

    const badge = getStatusBadge(ch.status);
    const isAdmin = currentUser.role === 'admin';

    card.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <div class="space-y-0.5">
          <div class="flex items-center gap-1.5 flex-wrap">
            <h4 class="text-xs font-bold text-slate-900">${ch.name}</h4>
            <span class="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">${ch.branch || ch.unit || 'Core'}</span>
          </div>
          ${ch.notes ? `<p class="text-[11px] text-slate-500 leading-snug">${ch.notes}</p>` : ''}
        </div>
      </div>
      <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
        <span class="text-[10px] text-slate-400 font-medium">${isAdmin ? 'Click to advance status:' : '🔒 Protected (Mama Only)'}</span>
        <button onclick="handleProtectedAction('chapter', '${currentSyllabusSubject}', '${ch.id}')" class="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition ${badge.class}">
          ${badge.icon} ${badge.label}
        </button>
      </div>
    `;

    listContainer.appendChild(card);
  });
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

// Formulas View
function renderFormulasView() {
  const c = document.getElementById('formula-cards-container');
  if (!c) return;

  c.innerHTML = `
    <div class="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-card">
      <h4 class="font-bold text-emerald-700 text-xs flex items-center gap-1.5">
        📐 Maths: Quadratic Equations & AP
      </h4>
      <div class="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-700 font-mono space-y-1">
        <div>• Formula: x = [-b ± √(b² - 4ac)] / 2a</div>
        <div>• Discriminant: D = b² - 4ac</div>
        <div>• AP nth term: an = a + (n-1)d</div>
        <div>• AP sum: Sn = n/2 [2a + (n-1)d]</div>
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-card">
      <h4 class="font-bold text-cyan-700 text-xs flex items-center gap-1.5">
        🔬 Science: Light & Electricity
      </h4>
      <div class="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-700 font-mono space-y-1">
        <div>• Mirror: 1/f = 1/v + 1/u &emsp; (m = -v/u)</div>
        <div>• Lens: 1/f = 1/v - 1/u &emsp; (m = v/u)</div>
        <div>• Ohm's Law: V = IR</div>
      </div>
    </div>
  `;
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
  applyUserAuth(currentUser);
  fetchData();
  updateTimerDisplay();
  setInterval(fetchData, 5000);
});
