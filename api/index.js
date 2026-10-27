const fs = require('fs');
const path = require('path');

let cachedData = null;

function getData() {
  if (!cachedData) {
    try {
      const raw = fs.readFileSync(path.join(__dirname, '../data.json'), 'utf8');
      cachedData = JSON.parse(raw);
    } catch (e) {
      cachedData = { examDates: { termRev1: "2026-11-16", boardStart: "2027-02-15" }, subjects: {} };
    }
  }
  return cachedData;
}

function isSuperAdmin(req, data) {
  const role = req.headers['x-user-role'];
  const email = (req.headers['x-user-email'] || '').toLowerCase();
  if (role === 'admin') return true;
  if (data.authConfig && data.authConfig.superAdmins) {
    return data.authConfig.superAdmins.map(e => e.toLowerCase()).includes(email);
  }
  return false;
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Role, X-User-Email');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';
  const data = getData();

  // 1. PIN Login
  if (url.includes('/auth/pin') && req.method === 'POST') {
    const pin = (req.body && req.body.pin || '').trim();
    const match = data.authConfig && data.authConfig.pins ? data.authConfig.pins[pin] : null;
    if (match) {
      const perms = data.authConfig.rolePermissions[match.role] || {};
      return res.status(200).json({
        success: true,
        user: { role: match.role, name: match.name, email: match.email, badge: match.badge, permissions: perms }
      });
    }
    return res.status(401).json({ error: 'Invalid 4-digit PIN' });
  }

  // 2. Google Login
  if (url.includes('/auth/google') && req.method === 'POST') {
    const email = (req.body && req.body.email || '').toLowerCase().trim();
    const name = req.body && req.body.name || 'Google User';
    const isSuper = (data.authConfig.superAdmins || []).map(e => e.toLowerCase()).includes(email);
    const role = isSuper ? 'admin' : 'viewer';
    const perms = data.authConfig.rolePermissions[role] || {};

    return res.status(200).json({
      success: true,
      user: {
        role,
        name: isSuper ? `${name} (Mama / Owner)` : name,
        email,
        badge: isSuper ? 'Super Admin' : 'Viewer',
        permissions: perms
      }
    });
  }

  // 3. Edit Syllabus (Admin Only)
  if (url.includes('/chapter/status') && req.method === 'POST') {
    if (!isSuperAdmin(req, data)) {
      return res.status(403).json({ error: 'Permission Denied: Only Mama can edit syllabus!' });
    }
    const { subjectKey, chapterId, status } = req.body || {};
    if (data.subjects && data.subjects[subjectKey]) {
      const ch = data.subjects[subjectKey].chapters.find(c => c.id === chapterId);
      if (ch) ch.status = status;
    }
    return res.status(200).json({ success: true, status });
  }

  // 4. Family Note (rate limited for viewers)
  if (url.includes('/family-note') && req.method === 'POST') {
    const role = req.headers['x-user-role'];
    if (role === 'viewer') {
      const fatherLimits = data.authConfig?.usageLimits?.father;
      if (fatherLimits && fatherLimits.dailyCheers >= fatherLimits.maxDailyCheers) {
        return res.status(429).json({ error: `Daily limit reached! Viewers can post max ${fatherLimits.maxDailyCheers} cheers per day.` });
      }
      if (fatherLimits) fatherLimits.dailyCheers++;
    }
    const newNote = { id: 'fn-' + Date.now(), ...(req.body || {}), timestamp: new Date().toISOString() };
    if (!data.familyNotes) data.familyNotes = [];
    data.familyNotes.unshift(newNote);
    return res.status(200).json({ success: true, note: newNote });
  }

  // 5. Study Log
  if (url.includes('/study-log') && req.method === 'POST') {
    const newLog = { id: 'log-' + Date.now(), ...(req.body || {}), date: new Date().toISOString().slice(0, 10) };
    if (!data.studyLogs) data.studyLogs = [];
    data.studyLogs.unshift(newLog);
    return res.status(200).json({ success: true, log: newLog });
  }

  // 6. Test Marks (Admin Only)
  if (url.includes('/test') && req.method === 'POST') {
    if (!isSuperAdmin(req, data)) {
      return res.status(403).json({ error: 'Permission Denied: Only Mama can record exam marks!' });
    }
    const newTest = { id: 't-' + Date.now(), ...(req.body || {}) };
    if (!data.tests) data.tests = [];
    data.tests.unshift(newTest);
    return res.status(200).json({ success: true, test: newTest });
  }

  // 7. Calendar Event Toggle & Add
  if (url.includes('/calendar/event/toggle') && req.method === 'POST') {
    const ev = (data.calendarEvents || []).find(e => e.id === (req.body && req.body.id));
    if (ev) ev.status = ev.status === 'completed' ? 'pending' : 'completed';
    return res.status(200).json({ success: true, event: ev });
  }

  if (url.includes('/calendar/event') && req.method === 'POST') {
    const newEvent = { id: 'cal-' + Date.now(), ...(req.body || {}), status: 'pending' };
    if (!data.calendarEvents) data.calendarEvents = [];
    data.calendarEvents.push(newEvent);
    return res.status(200).json({ success: true, event: newEvent });
  }

  // 8. Daily Target Toggle & Add (Super Admin Protected)
  if (url.includes('/daily-target/toggle') && req.method === 'POST') {
    if (data.dailyTarget && data.dailyTarget.focusTasks) {
      const t = data.dailyTarget.focusTasks.find(item => item.id === (req.body && req.body.id));
      if (t) t.completed = !t.completed;
    }
    return res.status(200).json({ success: true });
  }

  if (url.includes('/daily-target') && req.method === 'POST') {
    if (!isSuperAdmin(req, data)) {
      return res.status(403).json({ error: 'Permission Denied: Only Mama can set the daily target' });
    }
    const newTask = { id: 'dt-' + Date.now(), ...(req.body || {}), completed: false };
    if (!data.dailyTarget) data.dailyTarget = { focusTasks: [] };
    if (!data.dailyTarget.focusTasks) data.dailyTarget.focusTasks = [];
    data.dailyTarget.focusTasks.push(newTask);
    return res.status(200).json({ success: true, target: data.dailyTarget });
  }

  // 9. Tamil Voice Request
  if (url.includes('/voice-request') && req.method === 'POST') {
    const transcript = (req.body && req.body.transcript || '').trim();
    const voiceEntry = {
      id: 'vr-' + Date.now(),
      timestamp: new Date().toISOString(),
      transcriptTamil: transcript,
      action: 'Processed Tamil voice request',
      status: 'applied'
    };
    if (!data.voiceRequests) data.voiceRequests = [];
    data.voiceRequests.unshift(voiceEntry);
    return res.status(200).json({ success: true, voiceEntry });
  }

  // 10. Mama Mastery Rating Slider
  if (url.includes('/mama/rating') && req.method === 'POST') {
    if (!isSuperAdmin(req, data)) {
      return res.status(403).json({ error: 'Super Admin access required' });
    }
    const { chapterId, rating } = req.body || {};
    if (!data.mamaRatings) data.mamaRatings = {};
    if (chapterId) data.mamaRatings[chapterId] = parseInt(rating, 10);
    return res.status(200).json({ success: true, mamaRatings: data.mamaRatings });
  }

  // 11. Written Task Submit (Student)
  if (url.includes('/written-task/submit') && req.method === 'POST') {
    const { id, photoUrl, notes } = req.body || {};
    const task = (data.writtenTasks || []).find(t => t.id === id);
    if (task) {
      task.status = 'submitted';
      if (photoUrl) task.photoUrl = photoUrl;
      if (notes) task.studentNotes = notes;
      return res.status(200).json({ success: true, task });
    }
    return res.status(404).json({ error: 'Task not found' });
  }

  // 12. Written Task Review & Marks (Mama Super Admin)
  if (url.includes('/written-task/review') && req.method === 'POST') {
    if (!isSuperAdmin(req, data)) {
      return res.status(403).json({ error: 'Super Admin access required' });
    }
    const { id, marksAwarded, feedback } = req.body || {};
    const task = (data.writtenTasks || []).find(t => t.id === id);
    if (task) {
      task.status = 'reviewed';
      task.marksAwarded = parseFloat(marksAwarded);
      task.mamaFeedback = feedback || 'Well done!';
      return res.status(200).json({ success: true, task });
    }
    return res.status(404).json({ error: 'Task not found' });
  }

  // Default: Return complete data object
  return res.status(200).json(data);
};
