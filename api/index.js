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

  // PIN Login
  if (url.includes('/api/auth/pin') && req.method === 'POST') {
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

  // Google Login
  if (url.includes('/api/auth/google') && req.method === 'POST') {
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

  // Get Data
  if (url.includes('/api/data')) {
    return res.status(200).json(data);
  }

  // Edit Syllabus (Admin Only)
  if (url.includes('/api/chapter/status') && req.method === 'POST') {
    if (!isSuperAdmin(req, data)) {
      return res.status(403).json({ error: 'Permission Denied: Only Mama (jothi1809@gmail.com) can edit syllabus!' });
    }
    const { subjectKey, chapterId, status } = req.body || {};
    if (data.subjects && data.subjects[subjectKey]) {
      const ch = data.subjects[subjectKey].chapters.find(c => c.id === chapterId);
      if (ch) ch.status = status;
    }
    return res.status(200).json({ success: true, status });
  }

  // Post Family Note (Rate limited for viewers)
  if (url.includes('/api/family-note') && req.method === 'POST') {
    const role = req.headers['x-user-role'];
    if (role === 'viewer') {
      const fatherLimits = data.authConfig.usageLimits.father;
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

  // Study log
  if (url.includes('/api/study-log') && req.method === 'POST') {
    const newLog = { id: 'log-' + Date.now(), ...(req.body || {}), date: new Date().toISOString().slice(0, 10) };
    if (!data.studyLogs) data.studyLogs = [];
    data.studyLogs.unshift(newLog);
    return res.status(200).json({ success: true, log: newLog });
  }

  // Test marks (Admin Only)
  if (url.includes('/api/test') && req.method === 'POST') {
    if (!isSuperAdmin(req, data)) {
      return res.status(403).json({ error: 'Permission Denied: Only Mama can record exam marks!' });
    }
    const newTest = { id: 't-' + Date.now(), ...(req.body || {}) };
    if (!data.tests) data.tests = [];
    data.tests.unshift(newTest);
    return res.status(200).json({ success: true, test: newTest });
  }

  return res.status(200).json(data);
};
