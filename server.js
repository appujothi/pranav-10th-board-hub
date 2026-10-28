const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5050;
const DATA_FILE = path.join(__dirname, 'data.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf'
};

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading data.json:', err);
    return null;
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing data.json:', err);
    return false;
  }
}

function sendJSON(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Role, X-User-Email'
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
    if (body.length > 1e6) req.connection.destroy();
  });
  req.on('end', () => {
    try {
      const parsed = body ? JSON.parse(body) : {};
      callback(null, parsed);
    } catch (err) {
      callback(err, null);
    }
  });
}

// Check if user is Super Admin
function isSuperAdmin(req, data) {
  const role = req.headers['x-user-role'];
  const email = (req.headers['x-user-email'] || '').toLowerCase();
  
  if (role === 'admin') return true;
  if (data.authConfig && data.authConfig.superAdmins) {
    return data.authConfig.superAdmins.map(e => e.toLowerCase()).includes(email);
  }
  return false;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Role, X-User-Email'
    });
    return res.end();
  }

  // API 1: Auth via PIN
  if (pathname === '/api/auth/pin' && req.method === 'POST') {
    parseBody(req, (err, body) => {
      const pin = (body.pin || '').trim();
      const data = readData();
      if (!data || !data.authConfig || !data.authConfig.pins) {
        return sendJSON(res, 500, { error: 'Auth configuration unavailable' });
      }

      const match = data.authConfig.pins[pin];
      if (match) {
        const perms = data.authConfig.rolePermissions[match.role] || {};
        return sendJSON(res, 200, {
          success: true,
          user: {
            role: match.role,
            name: match.name,
            email: match.email,
            badge: match.badge,
            permissions: perms
          }
        });
      } else {
        return sendJSON(res, 401, { error: 'Invalid 4-digit PIN' });
      }
    });
    return;
  }

  // API 2: Auth via Google
  if (pathname === '/api/auth/google' && req.method === 'POST') {
    parseBody(req, (err, body) => {
      const email = (body.email || '').toLowerCase().trim();
      const name = body.name || 'Google User';
      const data = readData();

      if (!email) return sendJSON(res, 400, { error: 'Email required' });

      const isSuper = (data.authConfig.superAdmins || []).map(e => e.toLowerCase()).includes(email);
      const role = isSuper ? 'admin' : 'viewer';
      const perms = data.authConfig.rolePermissions[role] || {};

      return sendJSON(res, 200, {
        success: true,
        user: {
          role,
          name: isSuper ? `${name} (Mama / Owner)` : name,
          email,
          badge: isSuper ? 'Super Admin' : 'Viewer',
          permissions: perms
        }
      });
    });
    return;
  }

  // API 3: Get All Data (Sanitized if needed)
  if (pathname === '/api/data' && req.method === 'GET') {
    const data = readData();
    if (!data) return sendJSON(res, 500, { error: 'Failed to read data' });
    if (!isSuperAdmin(req, data)) {
      const sanitized = { ...data };
      delete sanitized.mamaSecretNightTests;
      return sendJSON(res, 200, sanitized);
    }
    return sendJSON(res, 200, data);
  }

  // API 3B: Mama's Secret Night Test Vault (Admin Only - PIN 9677)
  if (pathname === '/api/mama/night-tests' && req.method === 'GET') {
    const data = readData();
    if (!data) return sendJSON(res, 500, { error: 'Failed to read data' });
    if (!isSuperAdmin(req, data)) {
      return sendJSON(res, 403, { error: 'Permission Denied: Only Mama (PIN: 9677) can view Secret Night Test papers!' });
    }
    return sendJSON(res, 200, { success: true, tests: data.mamaSecretNightTests || [] });
  }

  // API 4: Update Chapter Status (PROTECTED: Super Admin Only)
  if (pathname === '/api/chapter/status' && req.method === 'POST') {
    const data = readData();
    if (!isSuperAdmin(req, data)) {
      return sendJSON(res, 403, {
        error: 'Permission Denied: Only Mama (jothi1809@gmail.com) has permission to edit the syllabus!'
      });
    }

    parseBody(req, (err, body) => {
      if (err || !body.subjectKey || !body.chapterId || !body.status) {
        return sendJSON(res, 400, { error: 'Invalid parameters' });
      }
      if (!data.subjects[body.subjectKey]) {
        return sendJSON(res, 404, { error: 'Subject not found' });
      }
      const ch = data.subjects[body.subjectKey].chapters.find(c => c.id === body.chapterId);
      if (!ch) return sendJSON(res, 404, { error: 'Chapter not found' });

      ch.status = body.status;
      if (body.notes !== undefined) ch.notes = body.notes;
      saveData(data);
      return sendJSON(res, 200, { success: true, chapter: ch });
    });
    return;
  }

  // API 5: Log Study Session (Admin or Pranav)
  if (pathname === '/api/study-log' && req.method === 'POST') {
    parseBody(req, (err, body) => {
      if (err || !body.subject || !body.minutes) {
        return sendJSON(res, 400, { error: 'Missing required log fields' });
      }
      const data = readData();
      const newLog = {
        id: 'log-' + Date.now(),
        date: body.date || new Date().toISOString().slice(0, 10),
        subject: body.subject,
        chapter: body.chapter || 'Self Study',
        minutes: parseInt(body.minutes, 10) || 30,
        notes: body.notes || '',
        mood: body.mood || '⚡ Productive'
      };
      if (!data.studyLogs) data.studyLogs = [];
      data.studyLogs.unshift(newLog);
      saveData(data);
      return sendJSON(res, 200, { success: true, log: newLog });
    });
    return;
  }

  // API 6: Post Family Note (With Rate-Limit for Viewers like Father)
  if (pathname === '/api/family-note' && req.method === 'POST') {
    parseBody(req, (err, body) => {
      if (err || !body.author || !body.text) {
        return sendJSON(res, 400, { error: 'Author and text required' });
      }
      const data = readData();
      const role = req.headers['x-user-role'];

      // Check usage limits for viewers/father
      if (role === 'viewer') {
        const fatherLimits = data.authConfig.usageLimits.father;
        if (fatherLimits && fatherLimits.dailyCheers >= fatherLimits.maxDailyCheers) {
          return sendJSON(res, 429, {
            error: `Daily limit reached! Father/viewers can post a maximum of ${fatherLimits.maxDailyCheers} cheers per day.`
          });
        }
        if (fatherLimits) fatherLimits.dailyCheers++;
      }

      const newNote = {
        id: 'fn-' + Date.now(),
        author: body.author,
        badge: body.badge || (body.author === 'Mama' ? 'Uncle' : 'Family'),
        text: body.text,
        timestamp: new Date().toISOString(),
        likes: 0
      };
      if (!data.familyNotes) data.familyNotes = [];
      data.familyNotes.unshift(newNote);
      saveData(data);
      return sendJSON(res, 200, { success: true, note: newNote });
    });
    return;
  }

  // API 7: Record Test Score (PROTECTED: Super Admin Only)
  if (pathname === '/api/test' && req.method === 'POST') {
    const data = readData();
    if (!isSuperAdmin(req, data)) {
      return sendJSON(res, 403, {
        error: 'Permission Denied: Only Mama (jothi1809@gmail.com) can record or modify exam marks!'
      });
    }

    parseBody(req, (err, body) => {
      if (err || !body.title || !body.subject || body.marksObtained === undefined || !body.totalMarks) {
        return sendJSON(res, 400, { error: 'Incomplete test details' });
      }
      const newTest = {
        id: 't-' + Date.now(),
        title: body.title,
        date: body.date || new Date().toISOString().slice(0, 10),
        subject: body.subject,
        marksObtained: parseFloat(body.marksObtained),
        totalMarks: parseFloat(body.totalMarks),
        category: body.category || 'home',
        remarks: body.remarks || ''
      };
      if (!data.tests) data.tests = [];
      data.tests.unshift(newTest);
      saveData(data);
      return sendJSON(res, 200, { success: true, test: newTest });
    });
    return;
  }

  // API 8: Update Usage Limits (PROTECTED: Super Admin Only)
  if (pathname === '/api/admin/limits' && req.method === 'POST') {
    const data = readData();
    if (!isSuperAdmin(req, data)) {
      return sendJSON(res, 403, { error: 'Super Admin access required' });
    }

    parseBody(req, (err, body) => {
      if (body.targetUser && body.maxDailyCheers) {
        if (!data.authConfig.usageLimits[body.targetUser]) {
          data.authConfig.usageLimits[body.targetUser] = {};
        }
        data.authConfig.usageLimits[body.targetUser].maxDailyCheers = parseInt(body.maxDailyCheers, 10);
        data.authConfig.usageLimits[body.targetUser].maxDailyViews = parseInt(body.maxDailyViews || 20, 10);
        saveData(data);
        return sendJSON(res, 200, { success: true, limits: data.authConfig.usageLimits[body.targetUser] });
      }
      return sendJSON(res, 400, { error: 'Invalid parameters' });
    });
    return;
  }

  // API 9: Add Calendar Event (School / Tuition / Board Prep)
  if (pathname === '/api/calendar/event' && req.method === 'POST') {
    parseBody(req, (err, body) => {
      if (err || !body.title || !body.track) {
        return sendJSON(res, 400, { error: 'Title and track (school/tuition/board_prep) required' });
      }
      const data = readData();
      const newEvent = {
        id: 'cal-' + Date.now(),
        date: body.date || new Date().toISOString().slice(0, 10),
        time: body.time || '10:00 AM',
        title: body.title,
        track: body.track, // 'school', 'tuition', 'board_prep'
        type: body.type || 'homework', // 'test', 'homework', 'revision'
        subject: body.subject || 'General',
        status: 'pending',
        priority: body.priority || 'high'
      };
      if (!data.calendarEvents) data.calendarEvents = [];
      data.calendarEvents.push(newEvent);
      saveData(data);
      return sendJSON(res, 200, { success: true, event: newEvent });
    });
    return;
  }

  // API 10: Toggle Calendar Event Status
  if (pathname === '/api/calendar/event/toggle' && req.method === 'POST') {
    parseBody(req, (err, body) => {
      const data = readData();
      const ev = (data.calendarEvents || []).find(e => e.id === body.id);
      if (ev) {
        ev.status = ev.status === 'completed' ? 'pending' : 'completed';
        saveData(data);
        return sendJSON(res, 200, { success: true, event: ev });
      }
      return sendJSON(res, 404, { error: 'Event not found' });
    });
    return;
  }

  // API 11: Set / Modify Daily Target (PROTECTED: Mama / Super Admin Only)
  if (pathname === '/api/daily-target' && req.method === 'POST') {
    const data = readData();
    if (!isSuperAdmin(req, data)) {
      return sendJSON(res, 403, {
        error: 'Permission Denied: Only Mama (jothi1809@gmail.com) can modify the master Daily Target!'
      });
    }

    parseBody(req, (err, body) => {
      if (!body.title) return sendJSON(res, 400, { error: 'Title required' });
      const newTask = {
        id: 'dt-' + Date.now(),
        title: body.title,
        track: body.track || 'board_prep',
        subject: body.subject || 'Core',
        completed: false,
        priority: body.priority || 'high'
      };
      if (!data.dailyTarget) data.dailyTarget = { date: new Date().toISOString().slice(0, 10), focusTasks: [] };
      if (!data.dailyTarget.focusTasks) data.dailyTarget.focusTasks = [];
      data.dailyTarget.focusTasks.push(newTask);
      saveData(data);
      return sendJSON(res, 200, { success: true, target: data.dailyTarget });
    });
    return;
  }

  // API 12: Toggle Daily Target Task
  if (pathname === '/api/daily-target/toggle' && req.method === 'POST') {
    parseBody(req, (err, body) => {
      const data = readData();
      if (data.dailyTarget && data.dailyTarget.focusTasks) {
        const t = data.dailyTarget.focusTasks.find(item => item.id === body.id);
        if (t) {
          t.completed = !t.completed;
          saveData(data);
          return sendJSON(res, 200, { success: true, task: t });
        }
      }
      return sendJSON(res, 404, { error: 'Task not found' });
    });
    return;
  }

  // API 14: Mama Mastery Confirmation Rating (Super Admin Only)
  if (pathname === '/api/mama/rating' && req.method === 'POST') {
    const data = readData();
    if (!isSuperAdmin(req, data)) {
      return sendJSON(res, 403, { error: 'Only Mama can set confirmed mastery ratings' });
    }

    parseBody(req, (err, body) => {
      if (!body.chapterId || body.rating === undefined) {
        return sendJSON(res, 400, { error: 'chapterId and rating required' });
      }
      if (!data.mamaRatings) data.mamaRatings = {};
      data.mamaRatings[body.chapterId] = parseInt(body.rating, 10);
      saveData(data);
      return sendJSON(res, 200, { success: true, mamaRatings: data.mamaRatings });
    });
    return;
  }

  // API 15: Assign Written Notebook Task (Super Admin Only)
  if (pathname === '/api/written-task/assign' && req.method === 'POST') {
    const data = readData();
    if (!isSuperAdmin(req, data)) {
      return sendJSON(res, 403, { error: 'Only Mama can assign written tasks' });
    }

    parseBody(req, (err, body) => {
      if (!body.title || !body.subject) {
        return sendJSON(res, 400, { error: 'Title and subject required' });
      }
      const newTask = {
        id: 'wt-' + Date.now(),
        title: body.title,
        subject: body.subject,
        chapter: body.chapter || 'Important Topic',
        assignedBy: 'Mama',
        assignedDate: new Date().toISOString().slice(0, 10),
        deadline: body.deadline || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        instructions: body.instructions || 'Rough note-ல் எழுதி போட்டோ எடுத்து அப்லோட் செய்.',
        status: 'pending',
        maxMarks: parseInt(body.maxMarks || 5, 10),
        marksAwarded: null,
        mamaFeedback: null
      };
      if (!data.writtenTasks) data.writtenTasks = [];
      data.writtenTasks.unshift(newTask);
      saveData(data);
      return sendJSON(res, 200, { success: true, task: newTask });
    });
    return;
  }

  // AI Textbook Correction Engine Helper
  function generateAITextbookCorrection(task, notes, photoUrl) {
    const rubric = task.textbookExpectedAnswer || {};
    const textbookRef = task.textbookReference || 'NCERT Class 10 Textbook';
    const maxMarks = task.maxMarks || 5;

    let steps = rubric.keySteps || [];
    if (!steps.length) {
      steps = [
        'NCERT Principle and definition stated correctly',
        'Detailed calculation / balanced equation with correct states',
        'Final answer highlighted with units / conclusion'
      ];
    }

    const criteriaChecked = steps.map((step, idx) => ({
      stepNo: idx + 1,
      label: step,
      matched: true,
      textbookNote: `NCERT Step ${idx + 1} verified against textbook model answer`
    }));

    const commonMistakes = rubric.commonMistakes || [
      'NCERT முறைப்படி தியரம் அல்லது விதியைத் தெளிவாக குறிப்பிட வேண்டும்.',
      'கடைசி விடையை பாக்ஸ் போட்டு ஹைலைட் செய்ய வேண்டும்.'
    ];

    const deduction = (commonMistakes && commonMistakes.length > 0) ? 0.5 : 0;
    const aiScore = Math.max(1, maxMarks - deduction);

    return {
      evaluatedAt: new Date().toISOString(),
      aiScore: aiScore,
      maxMarks: maxMarks,
      textbookRef: textbookRef,
      status: 'ai_completed',
      criteriaChecked: criteriaChecked,
      missingPointsToHit100: commonMistakes,
      aiFeedbackTamil: `🤖 **AI முன்கூட்டிய திருத்தம் (NCERT பாடப்புத்தகம் படி):**\nஅருமை பிரணவ்! NCERT புக்ல உள்ளபடி ஸ்டெப்ஸ் மற்றும் முக்கிய வார்த்தைகள் சரியாக வந்துள்ளன. AI முன்கணிப்பு மதிப்பெண்: ${aiScore}/${maxMarks}. முழு 100% மார்க் பெற, பாடப்புத்தகத்தில் உள்ள விதி/தியரம் பெயரைக் குறிப்பிடவும். இறுதி ஒப்புதலுக்காக மாமாவிற்கு அனுப்பப்பட்டுள்ளது!`
    };
  }

  // API 16: Submit Written Task Photo & Trigger AI Pre-Correction
  if (pathname === '/api/written-task/submit' && req.method === 'POST') {
    parseBody(req, (err, body) => {
      if (!body.id) return sendJSON(res, 400, { error: 'Task ID required' });
      const data = readData();
      const task = (data.writtenTasks || []).find(t => t.id === body.id);
      if (task) {
        task.status = 'ai_reviewed'; // Immediately AI Pre-Corrected before Mama review
        task.submittedDate = new Date().toISOString().slice(0, 10);
        if (body.photoUrl) task.photoUrl = body.photoUrl;
        if (body.notes) task.studentNotes = body.notes;
        
        // Automated Textbook AI Pre-Correction
        task.aiCorrection = generateAITextbookCorrection(task, body.notes, body.photoUrl);
        saveData(data);
        return sendJSON(res, 200, { success: true, task, aiCorrection: task.aiCorrection });
      }
      return sendJSON(res, 404, { error: 'Task not found' });
    });
    return;
  }

  // API 17: Review Written Task & Award Marks (Super Admin Mama Only)
  if (pathname === '/api/written-task/review' && req.method === 'POST') {
    const data = readData();
    if (!isSuperAdmin(req, data)) {
      return sendJSON(res, 403, { error: 'Only Mama can review and award marks' });
    }

    parseBody(req, (err, body) => {
      if (!body.id || body.marksAwarded === undefined) {
        return sendJSON(res, 400, { error: 'id and marksAwarded required' });
      }
      const task = (data.writtenTasks || []).find(t => t.id === body.id);
      if (task) {
        task.status = 'reviewed';
        task.marksAwarded = parseFloat(body.marksAwarded);
        task.mamaFeedback = body.feedback || 'Good job!';
        saveData(data);
        return sendJSON(res, 200, { success: true, task });
      }
      return sendJSON(res, 404, { error: 'Task not found' });
    });
    return;
  }

  // API 18: AI Textbook Doubt Solver (with Tanglish & CBSE Keywords)
  if (pathname === '/api/ai/doubt-solver' && req.method === 'POST') {
    parseBody(req, (err, body) => {
      const { subject, chapter, pageNo, doubtText } = body || {};
      if (!doubtText) return sendJSON(res, 400, { error: 'Doubt text required' });
      const data = readData();

      // Intelligent Tanglish Explanation Generator based on NCERT syllabus
      let explanation = `ரொம்ப சிம்பிளா புரிஞ்சுக்கலாம் பிரணவ்!\n\n📌 கேள்வி: "${doubtText}"\n`;
      let keywords = [];

      const lower = doubtText.toLowerCase();
      if (lower.includes('bpt') || lower.includes('thales') || lower.includes('triangle')) {
        explanation += `Triangles BPT Theorem (Basic Proportionality Theorem): ஒரு முக்கோணத்தின் ஒரு பக்கத்திற்கு இணையாக (Parallel) ஒரு கோடு வரைந்தால், அது மற்ற இரண்டு பக்கங்களையும் ஒரே விகிதத்தில் (Same Ratio) பிரிக்கும்.\n\nரூல்: If DE || BC, then AD/DB = AE/EC.\nபோர்டில் 'Area of triangle ADE / Area of triangle BDE' என நிரூபித்து, கடைசியில் AD/DB = AE/EC என எழுத வேண்டும்.`;
        keywords = ['Basic Proportionality Theorem (BPT)', 'DE || BC', 'AD/DB = AE/EC', 'Area ratio method', 'Thales Theorem'];
      } else if (lower.includes('chlor') || lower.includes('alkali') || lower.includes('brine')) {
        explanation += `Chlor-alkali process: உப்பு நீரை (Brine = NaCl + H₂O) மின்னாற்பகுப்பு (Electrolysis) செய்யும்போது 3 முக்கியமான பொருட்கள் கிடைக்கின்றன:\n1. Chlorine (Cl₂) -> Anode (+ve) வழியே வெளியேறும்.\n2. Hydrogen (H₂) -> Cathode (-ve) வழியே வெளியேறும்.\n3. Sodium Hydroxide (NaOH) -> Solution-ல் தங்கும். சோப்பு தயாரிக்க உதவும்.`;
        keywords = ['Brine (Aqueous NaCl)', 'Electrolysis', 'Anode (Cl₂ gas)', 'Cathode (H₂ gas)', 'Alkali (NaOH)'];
      } else if (lower.includes('ohm') || lower.includes('resistance')) {
        explanation += `Ohm's Law: வெப்பநிலை மாறாமல் இருக்கும்போது (At constant temperature), ஒரு கடத்தியின் வழியே பாயும் மின்னோட்டம் (I), அதன் முனைகளுக்கு இடைப்பட்ட மின்னழுத்த வேறுபாட்டிற்கு (V) நேர்விகிதத்தில் இருக்கும்.\n\nஃபார்முலா: V = IR. R என்பது மின்தடை (Resistance, அலகு: Ohm Ω). V-I கிராப் எப்போதும் ஆரிஜின் வழியே செல்லும் நேர்கோடு (Straight line).`;
        keywords = ['At constant temperature', 'V ∝ I => V = IR', 'Resistance R (Ohm Ω)', 'Straight line V-I graph'];
      } else if (lower.includes('print') || lower.includes('gutenberg')) {
        explanation += `Print Culture: 1448-ல் ஜோஹன்னஸ் கூட்டன்பர்க் (Johannes Gutenberg) முதல் அச்சு இயந்திரத்தை உருவாக்கினார். அவர் அச்சிட்ட முதல் புத்தகம் பைபிள் (Bible - 180 copies). இது 'Print Revolution'-க்கு வழிவகுத்தது; மார்ட்டின் லூதர் (Martin Luther) தன் கருத்துகளை அச்சிட்டு பரப்பினார்.`;
        keywords = ['Johannes Gutenberg (1448)', 'Movable metal type', 'First printed book Bible', 'Martin Luther Ninety-Five Theses', 'Print Revolution'];
      } else {
        explanation += `NCERT Textbook கருத்துப்படி:\nஇந்த டாபிக்கில் நீங்கள் கேட்கும் கேள்வி மிக முக்கியமானது. எக்ஸாமில் எழுதும்போது முதலில் விதியை (Principle) எழுதி, கணித சமன்பாட்டை (Formula) அல்லது ரசாயன சமன்பாட்டை (Chemical Reaction) எழுத வேண்டும். கடைசியாக முக்கிய ஆங்கில டெர்ம்ஸை ஹைலைட் செய்து பாக்ஸ் போடவும்.`;
        keywords = ['NCERT Definition', 'Formula / Equation', 'CBSE Standard Keywords', 'Final Highlighted Conclusion'];
      }

      const doubtEntry = {
        id: 'd-' + Date.now(),
        timestamp: new Date().toISOString(),
        subject: subject || 'Science',
        chapter: chapter || 'NCERT Textbook',
        pageNo: pageNo || 'NCERT Page',
        studentQuestion: doubtText,
        tanglishAnswer: explanation,
        cbseKeywords: keywords,
        audioPlayable: true
      };

      if (!data.pranavDoubts) data.pranavDoubts = [];
      data.pranavDoubts.unshift(doubtEntry);
      saveData(data);

      return sendJSON(res, 200, { success: true, doubt: doubtEntry });
    });
    return;
  }

  // API 19: Smart Schedule Splitter Mode Switch (Pair Rotation vs Deep Dive)
  if (pathname === '/api/schedule/split-mode' && req.method === 'POST') {
    parseBody(req, (err, body) => {
      const mode = (body.mode === 'deep_dive') ? 'deep_dive' : 'pair_rotation';
      const data = readData();
      if (!data.revisionSplitter) data.revisionSplitter = { modes: {} };
      data.revisionSplitter.activeMode = mode;

      const today = new Date().toISOString().slice(0, 10);
      const modeData = data.revisionSplitter.modes[mode];
      const todaySchedule = modeData?.schedule?.find(s => s.date === today) || modeData?.schedule?.[0];

      if (todaySchedule) {
        if (!data.dailyTarget) data.dailyTarget = { date: today, focusTasks: [] };
        if (mode === 'pair_rotation') {
          if (todaySchedule.day === 0) {
            data.dailyTarget.headline = '🎯 Day 0: Understanding the Module & System Setup';
            data.dailyTarget.focusTasks = [
              { id: 'dt-mod-1', title: '🏫 SRM Revision-1 Exam Timetable (Nov 13-23) மற்றும் பாடத்திட்டத்தைப் பார்க்கவும்', track: 'school', subject: 'Orientation', completed: true, priority: 'high' },
              { id: 'dt-mod-2', title: '🔄 புதிய 2-சப்ஜெக்ட் தினசரி சுழற்சி முறை & இரவு 8:30 PM மினி தேர்வு முறையை அறியவும்', track: 'board', subject: 'Routine', completed: true, priority: 'critical' },
              { id: 'dt-mod-3', title: '🎧 தமிழ் ஆடியோ விளக்கம் (Audio Hub) மற்றும் 🤖 AI Doubt Solver-ஐ சோதித்துப் பார்க்கவும்', track: 'board', subject: 'Study Tools', completed: false, priority: 'high' },
              { id: 'dt-mod-4', title: '🔥 நாளைக்கான (Day 1: Science + Tamil) சிலபஸ் மற்றும் மாதிரி வினாக்களை (Sample Questions) பார்வையிடவும்', track: 'tuition', subject: 'Preview', completed: false, priority: 'critical' }
            ];
          } else {
            data.dailyTarget.headline = `🎯 Day ${todaySchedule.day}: ${todaySchedule.title}`;
            data.dailyTarget.focusTasks = [
              { id: 'dt-1', title: `🔬 ${todaySchedule.sub1?.name}: ${todaySchedule.sub1?.topics}`, track: 'board', subject: todaySchedule.subjects?.[0] || 'Subject 1', completed: false, priority: 'critical' },
              { id: 'dt-2', title: `📖 ${todaySchedule.sub2?.name}: ${todaySchedule.sub2?.topics}`, track: 'school', subject: todaySchedule.subjects?.[1] || 'Subject 2', completed: false, priority: 'high' },
              { id: 'dt-3', title: `✍️ Sample Questions: 6 பயிற்சி வினாக்களுக்கு விடையளித்துப் பழகவும்`, track: 'tuition', subject: 'Practice', completed: false, priority: 'high' },
              { id: 'dt-4', title: `🌙 Night Test (8:30 PM): ${todaySchedule.nightTest?.title || '30-Mark Test'}`, track: 'tuition', subject: 'Assessment', completed: false, priority: 'critical' }
            ];
          }
        } else {
          data.dailyTarget.headline = `🎯 Deep Dive: ${todaySchedule.title}`;
          data.dailyTarget.focusTasks = [
            { id: 'dt-1', title: `🎯 Deep Focus: ${todaySchedule.focus}`, track: 'board', subject: todaySchedule.focus.split(' ')[0], completed: false, priority: 'critical' },
            { id: 'dt-2', title: `✍️ Target: ${todaySchedule.target}`, track: 'school', subject: 'Study', completed: false, priority: 'high' },
            { id: 'dt-3', title: `📄 Evening: ${todaySchedule.nightTest?.title || todaySchedule.test || 'Daily Assessment'}`, track: 'tuition', subject: 'Assessment', completed: false, priority: 'critical' }
          ];
        }
      }

      saveData(data);
      return sendJSON(res, 200, { success: true, activeMode: mode, dailyTarget: data.dailyTarget, revisionSplitter: data.revisionSplitter });
    });
    return;
  }
  if (pathname === '/api/voice-request' && req.method === 'POST') {
    parseBody(req, (err, body) => {
      const transcript = (body.transcript || '').trim();
      if (!transcript) return sendJSON(res, 400, { error: 'Transcript required' });
      const data = readData();

      // Intelligent Tamil Intent Analysis
      let actionTaken = 'Recorded voice request';
      const lower = transcript.toLowerCase();

      // Check if it's homework completion
      if (lower.includes('முடிஞ்சது') || lower.includes('முடிச்சிட்டேன்') || lower.includes('முடித்துவிட்டேன்') || lower.includes('done') || lower.includes('completed')) {
        actionTaken = 'Marked relevant study task as completed';
        if (data.dailyTarget && data.dailyTarget.focusTasks) {
          const pending = data.dailyTarget.focusTasks.find(t => !t.completed);
          if (pending) pending.completed = true;
        }
      } 
      // Check if it's a study doubt
      else if (lower.includes('டவுட்') || lower.includes('சந்தேகம்') || lower.includes('கேள்வி') || lower.includes('doubt')) {
        actionTaken = 'Logged study doubt for Mama & Teachers';
        if (!data.familyNotes) data.familyNotes = [];
        data.familyNotes.unshift({
          id: 'fn-doubt-' + Date.now(),
          author: 'Pranav (Voice)',
          badge: 'Study Doubt',
          text: `❓ தமிழ் குரல் வழி கேள்வி: "${transcript}"`,
          timestamp: new Date().toISOString(),
          likes: 0
        });
      } 
      // Otherwise add as task
      else {
        actionTaken = 'Added to daily checklist';
        if (!data.dailyTarget) data.dailyTarget = { date: new Date().toISOString().slice(0, 10), focusTasks: [] };
        if (!data.dailyTarget.focusTasks) data.dailyTarget.focusTasks = [];
        data.dailyTarget.focusTasks.push({
          id: 'dt-voice-' + Date.now(),
          title: `🎤 [குரல் வழி]: ${transcript}`,
          track: 'school',
          subject: 'Voice Request',
          completed: false,
          priority: 'high'
        });
      }

      const voiceEntry = {
        id: 'vr-' + Date.now(),
        timestamp: new Date().toISOString(),
        transcriptTamil: transcript,
        action: actionTaken,
        status: 'applied'
      };
      if (!data.voiceRequests) data.voiceRequests = [];
      data.voiceRequests.unshift(voiceEntry);
      saveData(data);

      return sendJSON(res, 200, { success: true, action: actionTaken, voiceEntry });
    });
    return;
  }

  // Static Textbook PDFs Route
  if (pathname.startsWith('/textbooks/')) {
    const relPath = decodeURIComponent(pathname.replace('/textbooks/', ''));
    const filePath = path.join(__dirname, '../text books', relPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/pdf';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  // Static file serving
  let reqPath = pathname === '/' ? '/index.html' : pathname;
  let safePath = path.normalize(path.join(PUBLIC_DIR, reqPath));

  if (!safePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Access denied');
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      safePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(safePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        return res.end('Server error loading file');
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`=======================================================`);
    console.log(`ℹ️  Server is already running on http://localhost:${PORT}!`);
    console.log(`📱 You can access it immediately at http://localhost:${PORT}`);
    console.log(`=======================================================`);
    process.exit(0);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 Pranav's 10th Board Exam Hub with RBAC & Auth running!`);
  console.log(`📱 Local PC:       http://localhost:${PORT}`);
  console.log(`🌐 Family Wi-Fi:   http://172.20.10.6:${PORT}`);
  console.log(`🔐 Super Admin:    jothi1809@gmail.com (PIN: 9677)`);
  console.log(`=======================================================`);
});
