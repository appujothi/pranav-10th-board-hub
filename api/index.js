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

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';
  const data = getData();

  if (url.includes('/api/data')) {
    return res.status(200).json(data);
  }

  if (url.includes('/api/chapter/status') && req.method === 'POST') {
    const { subjectKey, chapterId, status } = req.body || {};
    if (data.subjects && data.subjects[subjectKey]) {
      const ch = data.subjects[subjectKey].chapters.find(c => c.id === chapterId);
      if (ch) ch.status = status;
    }
    return res.status(200).json({ success: true, status });
  }

  if (url.includes('/api/study-log') && req.method === 'POST') {
    const newLog = { id: 'log-' + Date.now(), ...(req.body || {}), date: new Date().toISOString().slice(0, 10) };
    if (!data.studyLogs) data.studyLogs = [];
    data.studyLogs.unshift(newLog);
    return res.status(200).json({ success: true, log: newLog });
  }

  if (url.includes('/api/family-note') && req.method === 'POST') {
    const newNote = { id: 'fn-' + Date.now(), ...(req.body || {}), timestamp: new Date().toISOString() };
    if (!data.familyNotes) data.familyNotes = [];
    data.familyNotes.unshift(newNote);
    return res.status(200).json({ success: true, note: newNote });
  }

  if (url.includes('/api/test') && req.method === 'POST') {
    const newTest = { id: 't-' + Date.now(), ...(req.body || {}) };
    if (!data.tests) data.tests = [];
    data.tests.unshift(newTest);
    return res.status(200).json({ success: true, test: newTest });
  }

  return res.status(200).json(data);
};
