// Global State
let appState = null;
let currentRole = localStorage.getItem('pranav_app_role') || 'pranav';
let currentTab = 'home';
let currentSyllabusSubject = 'maths';
let scoresChartInstance = null;
let isDesktopFramed = true;

// Pomodoro Timer
let timerInterval = null;
let timerSeconds = 25 * 60;
let timerInitialSeconds = 25 * 60;
let timerRunning = false;
let isBreakTimer = false;

// Toast Helper
function showToast(message, isSuccess = true) {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toast-message');
  if (!toast || !msg) return;

  msg.textContent = message;
  toast.className = `fixed bottom-20 left-1/2 -translate-x-1/2 ${isSuccess ? 'bg-slate-900 text-white' : 'bg-rose-600 text-white'} text-xs font-semibold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 transform translate-y-0 opacity-100 transition duration-300 z-50`;
  setTimeout(() => {
    toast.className = toast.className.replace('translate-y-0 opacity-100', 'translate-y-10 opacity-0');
  }, 2600);
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

// Role Management
function openRoleModal() {
  const m = document.getElementById('roleModal');
  if (m) m.classList.remove('hidden');
}

function chooseRole(role) {
  currentRole = role;
  localStorage.setItem('pranav_app_role', role);
  closeModal('roleModal');

  const title = document.getElementById('header-user-title');
  const sub = document.getElementById('header-user-sub');
  const wallAuthor = document.getElementById('wallAuthorSelect');

  if (role === 'pranav') {
    if (title) title.textContent = 'Pranav • Class 10th';
    if (sub) sub.textContent = 'Mission Board 2027 • 95%+ Target';
    if (wallAuthor) wallAuthor.value = 'Pranav';
  } else if (role === 'mama') {
    if (title) title.textContent = 'Mama (Uncle) • Mentor View';
    if (sub) sub.textContent = 'Tracking Pranav’s 10th Prep';
    if (wallAuthor) wallAuthor.value = 'Mama';
  } else if (role === 'parents') {
    if (title) title.textContent = 'Mom & Dad • Family View';
    if (sub) sub.textContent = 'Cheering Pranav On!';
    if (wallAuthor) wallAuthor.value = 'Mom & Dad';
  }

  showToast(`Switched view to ${role.toUpperCase()}`);
}

// Tab Navigation
function switchTab(tabId) {
  currentTab = tabId;

  // Views to toggle
  const views = ['home', 'syllabus', 'timer', 'family', 'formulas', 'scores'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) {
      if (v === tabId) el.classList.remove('hidden');
      else el.classList.add('hidden');
    }
  });

  // Nav buttons active state
  ['home', 'syllabus', 'timer', 'family'].forEach(b => {
    const btn = document.getElementById(`nav-btn-${b}`);
    if (btn) {
      if (b === tabId || (tabId === 'scores' && b === 'family') || (tabId === 'formulas' && b === 'syllabus')) {
        btn.className = 'nav-item flex flex-col items-center relative text-emerald-600 font-bold active-nav-dot';
      } else {
        btn.className = 'nav-item flex flex-col items-center relative text-slate-400 hover:text-slate-700 transition';
      }
    }
  });

  // Scroll to top
  const scroller = document.getElementById('main-scroll-content');
  if (scroller) scroller.scrollTop = 0;

  if (tabId === 'scores') renderScoresChart();
  if (tabId === 'syllabus') renderSyllabusView();
  if (tabId === 'formulas') renderFormulasView();
}

function openSubjectDetail(subKey) {
  currentSyllabusSubject = subKey;
  switchTab('syllabus');
}

// Fetch Data
async function fetchData() {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('API offline');
    appState = await res.json();
    renderAll();
  } catch (err) {
    console.log('Local/fallback data mode');
    // If running static or offline, load from localStorage if available
    const cached = localStorage.getItem('pranav_offline_data');
    if (cached) {
      appState = JSON.parse(cached);
      renderAll();
    }
  }
}

// Render All
function renderAll() {
  if (!appState) return;

  // Cache locally
  localStorage.setItem('pranav_offline_data', JSON.stringify(appState));

  renderHeroCountdown();
  renderSubjectGridStats();
  renderSyllabusView();
  renderFamilyWall();
  renderScoresList();
}

// Hero Countdown
function renderHeroCountdown() {
  const heroDays = document.getElementById('hero-countdown-days');
  if (!heroDays || !appState.examDates) return;

  const targetDate = new Date(appState.examDates.termRev1 || '2026-11-16');
  const now = new Date();
  const diffDays = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    heroDays.textContent = `${diffDays} Days`;
  } else {
    heroDays.textContent = 'Today!';
  }
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

  // 1. Subject Filter Pills
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

  // 2. Chapters List
  const listContainer = document.getElementById('syllabus-chapters-container');
  if (!listContainer) return;

  const currentSub = appState.subjects[currentSyllabusSubject];
  if (!currentSub) return;

  listContainer.innerHTML = '';

  currentSub.chapters.forEach(ch => {
    const card = document.createElement('div');
    card.className = 'bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-2 shadow-card';

    const badge = getStatusBadge(ch.status);

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
        <span class="text-[10px] text-slate-400 font-medium">Click to advance status:</span>
        <button onclick="cycleChapterDirect('${currentSyllabusSubject}', '${ch.id}')" class="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition ${badge.class}">
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

// Cycle Chapter Status
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
      headers: { 'Content-Type': 'application/json' },
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
    // Fallback local update
    ch.status = nextStatus;
    renderAll();
    showToast(`Updated to ${nextStatus.toUpperCase()}`);
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, minutes, chapter, notes: 'Self Study sprint' })
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, text, badge: author === 'Mama' ? 'Uncle' : 'Family' })
    });

    if (res.ok) {
      document.getElementById('wallNoteInput').value = '';
      showToast('Encouragement posted!');
      await fetchData();
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
        <div>• D > 0 (2 distinct real roots) | D = 0 (equal roots)</div>
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
        <div>• Heating Law: H = I²Rt</div>
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-card">
      <h4 class="font-bold text-amber-700 text-xs flex items-center gap-1.5">
        🌍 Social Science: Important Dates
      </h4>
      <div class="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-700 space-y-1">
        <div>• <strong>1919:</strong> Rowlatt Act & Jallianwala Bagh (13 April)</div>
        <div>• <strong>1920–22:</strong> Non-Cooperation Movement</div>
        <div>• <strong>1930:</strong> Dandi March & Civil Disobedience</div>
        <div>• <strong>1931:</strong> Gandhi-Irwin Pact</div>
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
            <button onclick="cycleChapterDirect('${subKey}', '${ch.id}')" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
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
  chooseRole(currentRole);
  fetchData();
  updateTimerDisplay();

  // Polling every 5 seconds for live family sync
  setInterval(fetchData, 5000);
});
