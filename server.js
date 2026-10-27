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
  '.ico': 'image/x-icon'
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
    return sendJSON(res, 200, data);
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
        totalMarks: parseFloat(body.totalMarks)
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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 Pranav's 10th Board Exam Hub with RBAC & Auth running!`);
  console.log(`📱 Local PC:       http://localhost:${PORT}`);
  console.log(`🌐 Family Wi-Fi:   http://172.20.10.6:${PORT}`);
  console.log(`🔐 Super Admin:    jothi1809@gmail.com (PIN: 1809)`);
  console.log(`=======================================================`);
});
