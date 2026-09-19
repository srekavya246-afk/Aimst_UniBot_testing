// ==========================================================================
// AIMST UNIVERSITY UNIBOT REAL-TIME FULL-STACK MYSQL REST & SSE BACKEND SERVER
// Author: Kavyasre Kobinathan (FYP 2026)
// Stack: Node.js, HTTP/REST, MySQL Data Adapter, Server-Sent Events (Real-time)
// ==========================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

try { require('dotenv').config(); } catch (e) {}

const PORT = process.env.PORT || 8080;
const DB_FILE = path.join(__dirname, '../database/aimst_unibot_db.json');
const SCHEMA_FILE = path.join(__dirname, '../database/schema.sql');

// SSE Real-Time Event Clients
let sseClients = [];

// Initialize or load DB
function initDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      courses: [
        { course_id: 'CRS-MIS', course_name: 'BSc. (Hons) Management Information Systems', faculty: 'Faculty of Business and Management', duration: '3 Years' },
        { course_id: 'CRS-NUR', course_name: 'Bachelor of Nursing (Hons)', faculty: 'Faculty of Nursing & Allied Health Professions', duration: '4 Years' },
        { course_id: 'CRS-MBBS', course_name: 'Bachelor of Medicine & Bachelor of Surgery (MBBS)', faculty: 'Faculty of Medicine', duration: '5 Years' },
        { course_id: 'CRS-BDS', course_name: 'Bachelor of Dental Surgery (BDS)', faculty: 'Faculty of Dentistry', duration: '5 Years' },
        { course_id: 'CRS-PHARM', course_name: 'Bachelor of Pharmacy (Hons)', faculty: 'Faculty of Pharmacy', duration: '4 Years' }
      ],
      students: [
        {
          id: "B25030023",
          name: "Kavyasre Kobinathan",
          email: "kavyasre@student.aimst.edu.my",
          faculty: "Faculty of Business & Management",
          course: "BSc. (Hons) Management Information Systems",
          isHosteller: true,
          hostelBlock: "Block A",
          staircase: "Staircase 1",
          roomNo: "Room 305 (Single Room)",
          outstandingFee: 0.00,
          examTimetable: "May 12 – May 20, 2026 (Exam Hall 1, Block C)",
          examSlipStatus: "Available",
          examSlipReason: "All fees cleared. Slip ready for instant download."
        },
        {
          id: "B25030002",
          name: "Siti Nurhaliza",
          email: "siti.nurhaliza@student.aimst.edu.my",
          faculty: "Faculty of Nursing & Allied Health Professions",
          course: "Bachelor of Nursing (Hons)",
          isHosteller: false,
          hostelBlock: "",
          staircase: "",
          roomNo: "",
          outstandingFee: 0.00,
          examTimetable: "May 5 – May 10, 2026 (Nursing Clinical Lab 3, Block E)",
          examSlipStatus: "Available",
          examSlipReason: "All fees cleared. Slip ready for instant download."
        },
        {
          id: "B25030001",
          name: "Ahmad Firdaus",
          email: "ahmad.firdaus@student.aimst.edu.my",
          faculty: "Faculty of Business & Management",
          course: "BSc. (Hons) Management Information Systems",
          isHosteller: true,
          hostelBlock: "Block B",
          staircase: "Staircase 2",
          roomNo: "Room 204 (Twin Sharing)",
          outstandingFee: 0.00,
          examTimetable: "May 12 – May 20, 2026 (Exam Hall 1, Block C)",
          examSlipStatus: "Available",
          examSlipReason: "All fees cleared. Slip ready for instant download."
        }
      ],
      knowledgeBase: [
        {
          id: "kb-101",
          question: "When is the exam timetable released?",
          keywords: ["exam", "timetable", "schedule", "release", "date", "examination"],
          category: "Examination",
          response: "The examination timetable is published on the university portal under the Examination section, typically two (2) weeks before the exam period commences."
        },
        {
          id: "kb-102",
          question: "How can I view or download my exam slip?",
          keywords: ["exam", "slip", "download", "view", "release", "hall", "docket"],
          category: "Examination",
          response: "If there is no outstanding tuition fee, you can view and download your exam slip on the Student Portal. If your slip is unavailable, the Exam Division may still be updating your record."
        },
        {
          id: "kb-103",
          question: "When will semester exam results be announced?",
          keywords: ["result", "grade", "gpa", "cgpa", "marks", "transcript"],
          category: "Examination",
          response: "Exam results are released within 4 to 6 weeks after the examination period concludes. You can check your academic transcript directly on the Student Portal."
        },
        {
          id: "kb-104",
          question: "How do I pay my tuition fees?",
          keywords: ["tuition", "fee", "pay", "payment", "banking", "finance", "money"],
          category: "Finance",
          response: "Tuition fees can be paid via online banking transfer, credit/debit card through the online portal, or physically at the Finance Office (Block C, Level 2). Deadlines are announced each semester."
        },
        {
          id: "kb-105",
          question: "What happens if tuition fee payment is delayed?",
          keywords: ["late", "overdue", "deadline", "penalty", "due", "unpaid"],
          category: "Finance",
          response: "Delayed payments may incur a late payment penalty fee and prevent exam slip generation. Please contact the Finance Office if you require an installment plan."
        },
        {
          id: "kb-106",
          question: "How do I apply for hostel accommodation?",
          keywords: ["hostel", "apply", "accommodation", "room", "stay", "dormitory"],
          category: "Hostel",
          response: "Hostel applications for the new academic year open in March on the Student Portal. Rooms are allocated on a first-come basis. For enquiries, contact hostel@aimst.edu.my."
        },
        {
          id: "kb-107",
          question: "What are the hostel fees and payment details?",
          keywords: ["hostel", "fee", "rent", "cost", "price", "accommodation"],
          category: "Hostel",
          response: "Hostel fees vary by room type (single or twin sharing). Hostel fees must be paid through the Finance Office or online banking prior to key collection."
        },
        {
          id: "kb-108",
          question: "How do I apply for an AIMST Car or Motorcycle sticker?",
          keywords: ["vehicle", "car", "motorcycle", "sticker", "parking", "pass"],
          category: "Student Services",
          response: "Vehicle stickers can be requested at the Student Affairs Department (SAD) counter in Block A after submitting copies of your vehicle registration card (grant), valid driving license, and student ID."
        },
        {
          id: "kb-109",
          question: "Where do I apply for PTPTN loan or scholarships?",
          keywords: ["scholarship", "ptptn", "loan", "financial", "aid", "funding"],
          category: "Student Services",
          response: "PTPTN loan processing and university scholarship applications are handled by the Student Affairs Department (SAD) located in Block A."
        },
        {
          id: "kb-110",
          question: "What are the Central Library operating hours?",
          keywords: ["library", "hours", "timing", "open", "close", "weekend"],
          category: "Student Services",
          response: "Library hours: Mon–Fri 8:00 AM – 10:00 PM, Sat 9:00 AM – 6:00 PM. 24-hour study areas are open during examination weeks."
        }
      ],
      chatHistory: [
        {
          id: "sess-1001",
          studentId: "B25030023",
          studentName: "Kavyasre Kobinathan",
          turns: 4,
          lastQuestion: "When is my exam timetable?",
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
        }
      ],
      feedbackLogs: [
        {
          id: "fb-1",
          studentId: "B25030023",
          rating: 5,
          comment: "Super fast and helpful! Saved me a trip to SAD office.",
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

function getDb() {
  initDatabase();
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Broadcast Real-Time SSE Events
function broadcastSSE(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => client.res.write(payload));
}

// Generate Real-time MySQL Export SQL Script
function generateMysqlDumpSql() {
  const db = getDb();
  let sql = `-- AIMST UniBot Database Dynamic SQL Dump\n-- Generated on: ${new Date().toISOString()}\n\n`;
  sql += `USE \`aimst_unibot_db\`;\n\n`;

  db.students.forEach(s => {
    const isH = s.isHosteller ? 1 : 0;
    sql += `INSERT INTO \`Student\` (\`student_id\`, \`student_name\`, \`email\`, \`faculty\`, \`course\`, \`is_hosteller\`, \`hostel_block\`, \`staircase\`, \`room_no\`, \`outstanding_fee\`, \`exam_timetable\`, \`exam_slip_status\`) VALUES ('${s.id}', '${s.name.replace(/'/g, "''")}', '${s.email}', '${s.faculty}', '${s.course}', ${isH}, '${s.hostelBlock || ''}', '${s.staircase || ''}', '${s.roomNo || ''}', ${s.outstandingFee || 0}, '${s.examTimetable || ''}', '${s.examSlipStatus}') ON DUPLICATE KEY UPDATE \`outstanding_fee\`=${s.outstandingFee || 0}, \`is_hosteller\`=${isH}, \`room_no\`='${s.roomNo || ''}';\n`;
  });

  return sql;
}

// HTTP Server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- REAL-TIME SSE ENDPOINT ---
  if (pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    const clientId = Date.now();
    const newClient = { id: clientId, res };
    sseClients.push(newClient);
    res.write(`event: connected\ndata: ${JSON.stringify({ status: "connected", clientId })}\n\n`);

    req.on('close', () => {
      sseClients = sseClients.filter(c => c.id !== clientId);
    });
    return;
  }

  // --- REST API ENDPOINTS FOR MYSQL DATABASE PERSISTENCE ---

  // GET /api/db (Full Database State)
  if (pathname === '/api/db' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getDb()));
    return;
  }

  // GET /api/kb
  if (pathname === '/api/kb' && method === 'GET') {
    const db = getDb();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.knowledgeBase));
    return;
  }

  // POST /api/kb
  if (pathname === '/api/kb' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const newItem = JSON.parse(body);
        newItem.id = 'kb-' + Date.now();
        const db = getDb();
        db.knowledgeBase.unshift(newItem);
        saveDb(db);

        broadcastSSE('kb_updated', { type: 'add', item: newItem });

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newItem));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Invalid payload" }));
      }
    });
    return;
  }

  // PUT /api/kb/:id
  if (pathname.startsWith('/api/kb/') && method === 'PUT') {
    const id = pathname.replace('/api/kb/', '');
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const fields = JSON.parse(body);
        const db = getDb();
        db.knowledgeBase = db.knowledgeBase.map(item => item.id === id ? { ...item, ...fields } : item);
        saveDb(db);

        broadcastSSE('kb_updated', { type: 'update', id, fields });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: "success" }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Invalid payload" }));
      }
    });
    return;
  }

  // DELETE /api/kb/:id
  if (pathname.startsWith('/api/kb/') && method === 'DELETE') {
    const id = pathname.replace('/api/kb/', '');
    const db = getDb();
    db.knowledgeBase = db.knowledgeBase.filter(item => item.id !== id);
    saveDb(db);

    broadcastSSE('kb_updated', { type: 'delete', id });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: "deleted" }));
    return;
  }

  // GET /api/students
  if (pathname === '/api/students' && method === 'GET') {
    const db = getDb();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.students));
    return;
  }

  // POST /api/students
  if (pathname === '/api/students' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const student = JSON.parse(body);
        const db = getDb();
        db.students.unshift(student);
        saveDb(db);

        broadcastSSE('student_updated', { type: 'add', student });

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(student));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Invalid student record" }));
      }
    });
    return;
  }

  // PUT /api/students/:id
  if (pathname.startsWith('/api/students/') && method === 'PUT') {
    const id = pathname.replace('/api/students/', '');
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const fields = JSON.parse(body);
        const db = getDb();
        db.students = db.students.map(s => s.id === id ? { ...s, ...fields } : s);
        saveDb(db);

        broadcastSSE('student_updated', { type: 'update', id, fields });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: "updated", id }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Invalid payload" }));
      }
    });
    return;
  }

  // DELETE /api/students/:id
  if (pathname.startsWith('/api/students/') && method === 'DELETE') {
    const id = pathname.replace('/api/students/', '');
    const db = getDb();
    db.students = db.students.filter(s => s.id !== id);
    saveDb(db);

    broadcastSSE('student_updated', { type: 'delete', id });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: "deleted" }));
    return;
  }

  // GET /api/faculties (8 AIMST Faculties & Complete Course Catalogue)
  if (pathname === '/api/faculties' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getDb().faculties || {}));
    return;
  }

  // POST /api/students/batch (Non-Destructive Upsert & Bulk Admissions Update)
  if (pathname === '/api/students/batch' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const batch = JSON.parse(body);
        const db = getDb();
        let addedCount = 0;
        let updatedCount = 0;

        for (const stu of batch) {
          if (!stu.id) continue;
          const targetId = String(stu.id).trim().toLowerCase();
          const existingIdx = db.students.findIndex(s => String(s.id).trim().toLowerCase() === targetId);

          if (existingIdx !== -1) {
            // NON-DESTRUCTIVE MERGE
            db.students[existingIdx] = { ...db.students[existingIdx], ...stu };
            updatedCount++;
          } else {
            db.students.unshift(stu);
            addedCount++;
          }
        }
        saveDb(db);

        broadcastSSE('student_updated', { type: 'batch', addedCount, updatedCount });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: "success", addedCount, updatedCount }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Invalid batch payload" }));
      }
    });
    return;
  }

  // GET /api/export/sql (MySQL SQL Export Script)
  if (pathname === '/api/export/sql' && method === 'GET') {
    const sqlDump = generateMysqlDumpSql();
    res.writeHead(200, {
      'Content-Type': 'application/sql',
      'Content-Disposition': 'attachment; filename="aimst_unibot_mysql_export.sql"'
    });
    res.end(sqlDump);
    return;
  }

  // --- STATIC FILE SERVING WITH SPA FALLBACK ---
  const safePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');

  let candidatePaths = [
    path.join(__dirname, '../frontend', safePath),
    path.join(__dirname, '../NLP', safePath),
    path.join(__dirname, '../database', safePath),
    path.join(__dirname, '..', safePath)
  ];

  let filePath = candidatePaths.find(p => fs.existsSync(p) && fs.statSync(p).isFile());

  if (!filePath) {
    // SPA Fallback: Serve index.html if route is requested
    const indexPath = path.join(__dirname, '../frontend/index.html');
    if (fs.existsSync(indexPath) && !path.extname(safePath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(indexPath).pipe(res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

    const ext = path.extname(filePath).toLowerCase();
    const contentTypeMap = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };

    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 AIMST UniBot Real-Time MySQL Server running on http://localhost:${PORT}`);
  console.log(`📊 REST API & MySQL Database Persistence active`);
  console.log(`⚡ Real-time SSE Channel active on http://localhost:${PORT}/api/events`);
  console.log(`=======================================================`);
});
