// AIMST University Storage Service & Real-Time MySQL Database Adapter
// Manages real-time REST API sync, Server-Sent Events (SSE), and Database Persistence

class StorageService {
  constructor() {
    this.KB_KEY = 'unibot_knowledge_base';
    this.STUDENTS_KEY = 'unibot_student_profiles';
    this.HISTORY_KEY = 'unibot_chat_history';
    this.FEEDBACK_KEY = 'unibot_feedback_logs';
    this.AUTH_KEY = 'unibot_current_user';
    this.init();
    this.initRealtimeSSE();
  }

  init() {
    if (!localStorage.getItem(this.KB_KEY)) {
      if (typeof INITIAL_KNOWLEDGE_BASE !== 'undefined') {
        localStorage.setItem(this.KB_KEY, JSON.stringify(INITIAL_KNOWLEDGE_BASE));
      } else {
        localStorage.setItem(this.KB_KEY, JSON.stringify([]));
      }
    }
    if (!localStorage.getItem(this.STUDENTS_KEY)) {
      if (typeof INITIAL_STUDENT_PROFILES !== 'undefined') {
        localStorage.setItem(this.STUDENTS_KEY, JSON.stringify(INITIAL_STUDENT_PROFILES));
      } else {
        localStorage.setItem(this.STUDENTS_KEY, JSON.stringify([]));
      }
    } else {
      // Auto-migrate to ensure B25030023 (Kavyasre Kobinathan) is present and primary
      try {
        let currentStus = JSON.parse(localStorage.getItem(this.STUDENTS_KEY)) || [];
        const hasKavya = currentStus.some(s => s.id === 'B25030023');
        if (!hasKavya && typeof INITIAL_STUDENT_PROFILES !== 'undefined') {
          localStorage.setItem(this.STUDENTS_KEY, JSON.stringify(INITIAL_STUDENT_PROFILES));
        }
      } catch (e) {}
    }
    if (!localStorage.getItem(this.HISTORY_KEY)) {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify([
        {
          id: "sess-1001",
          studentId: "B25030023",
          studentName: "Kavyasre Kobinathan",
          turns: 4,
          lastQuestion: "When is my exam timetable?",
          timestamp: "2026-08-10 09:30"
        }
      ]));
    }
    if (!localStorage.getItem(this.FEEDBACK_KEY)) {
      localStorage.setItem(this.FEEDBACK_KEY, JSON.stringify([
        {
          id: "fb-1",
          studentId: "B25030023",
          rating: 5,
          comment: "Super fast and helpful! Saved me a trip to SAD office.",
          timestamp: "2026-08-10 09:32"
        }
      ]));
    }

    // Try sync with Backend Database REST API
    this.syncFromBackend();
  }

  async syncFromBackend() {
    try {
      const res = await fetch('/api/db');
      if (res.ok) {
        const data = await res.json();
        if (data.students) localStorage.setItem(this.STUDENTS_KEY, JSON.stringify(data.students));
        if (data.knowledgeBase) localStorage.setItem(this.KB_KEY, JSON.stringify(data.knowledgeBase));
        if (data.chatHistory) localStorage.setItem(this.HISTORY_KEY, JSON.stringify(data.chatHistory));
        if (data.feedbackLogs) localStorage.setItem(this.FEEDBACK_KEY, JSON.stringify(data.feedbackLogs));
      }
    } catch (e) {
      console.log('Backend REST API sync offline, using persistent Storage DB.');
    }
  }

  // --- REAL-TIME SERVER-SENT EVENTS (SSE) STREAM ---
  initRealtimeSSE() {
    if (typeof EventSource !== 'undefined') {
      try {
        const evtSource = new EventSource('/api/events');

        evtSource.addEventListener('student_updated', async () => {
          await this.syncFromBackend();
          window.dispatchEvent(new CustomEvent('aimst_realtime_sync'));
        });

        evtSource.addEventListener('kb_updated', async () => {
          await this.syncFromBackend();
          window.dispatchEvent(new CustomEvent('aimst_realtime_sync'));
        });
      } catch (e) {
        console.log('SSE Stream notice:', e);
      }
    }
  }

  // --- STUDENT PROFILES ---
  getStudents() {
    try {
      return JSON.parse(localStorage.getItem(this.STUDENTS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  getStudentById(id) {
    const students = this.getStudents();
    return students.find(s => s.id.toLowerCase() === (id || '').toLowerCase()) || null;
  }

  async updateStudent(id, updatedFields) {
    let students = this.getStudents();
    students = students.map(s => s.id === id ? { ...s, ...updatedFields } : s);
    localStorage.setItem(this.STUDENTS_KEY, JSON.stringify(students));

    try {
      await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
    } catch (e) { }
  }

  async addStudent(studentData) {
    const students = this.getStudents();
    students.unshift(studentData);
    localStorage.setItem(this.STUDENTS_KEY, JSON.stringify(students));

    try {
      await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
    } catch (e) { }
  }

  async deleteStudent(id) {
    let students = this.getStudents();
    students = students.filter(s => s.id !== id);
    localStorage.setItem(this.STUDENTS_KEY, JSON.stringify(students));

    try {
      await fetch(`/api/students/${id}`, { method: 'DELETE' });
    } catch (e) { }
  }

  getAIMSTStructure() {
    if (typeof AIMST_FACULTIES_AND_COURSES !== 'undefined') {
      return AIMST_FACULTIES_AND_COURSES;
    }
    return {};
  }

  async addStudentsBatch(newStudentsList) {
    let existing = this.getStudents();
    let countAdded = 0;
    let countUpdated = 0;

    for (const incoming of newStudentsList) {
      if (!incoming.id) continue;
      const targetId = String(incoming.id).trim().toLowerCase();
      const existingIdx = existing.findIndex(s => String(s.id).trim().toLowerCase() === targetId);

      // Clean outstanding fee
      const fee = incoming.outstandingFee !== undefined ? parseFloat(incoming.outstandingFee) : undefined;

      if (existingIdx !== -1) {
        // NON-DESTRUCTIVE MERGE: Retain non-specified existing fields
        const curr = existing[existingIdx];
        const updated = { ...curr, ...incoming };

        // Auto rule for fee & exam slip
        if (fee !== undefined) {
          updated.outstandingFee = fee;
          if (fee > 0) {
            updated.examSlipStatus = 'Blocked';
            updated.examSlipReason = `Outstanding tuition fee balance of RM ${fee.toFixed(2)} pending payment.`;
          } else {
            updated.examSlipStatus = 'Available';
            updated.examSlipReason = 'All fees cleared. Slip ready for instant download.';
          }
        }

        existing[existingIdx] = updated;
        countUpdated++;
      } else {
        // Insert New Student
        const newStu = {
          id: incoming.id,
          name: incoming.name || 'New Student',
          email: incoming.email || `${incoming.id.toLowerCase()}@student.aimst.edu.my`,
          faculty: incoming.faculty || 'Faculty of Business & Management',
          level: incoming.level || 'Degree',
          course: incoming.course || 'General Studies',
          isHosteller: incoming.isHosteller !== undefined ? incoming.isHosteller : false,
          hostelBlock: incoming.hostelBlock || '',
          staircase: incoming.staircase || '',
          roomNo: incoming.roomNo || '',
          outstandingFee: fee !== undefined ? fee : 0.00,
          examSlipStatus: (fee || 0) > 0 ? 'Blocked' : 'Available',
          examSlipReason: (fee || 0) > 0 ? `Outstanding tuition fee balance of RM ${(fee || 0).toFixed(2)} pending payment.` : 'All fees cleared. Slip ready for instant download.'
        };
        existing.unshift(newStu);
        countAdded++;
      }
    }

    localStorage.setItem(this.STUDENTS_KEY, JSON.stringify(existing));

    try {
      await fetch('/api/students/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudentsList)
      });
    } catch (e) { }

    return { countAdded, countUpdated };
  }

  exportStudentsToCSV(facultyFilter = 'ALL', courseFilter = 'ALL') {
    let students = this.getStudents();
    if (facultyFilter && facultyFilter !== 'ALL') {
      students = students.filter(s => s.faculty === facultyFilter);
    }
    if (courseFilter && courseFilter !== 'ALL') {
      students = students.filter(s => s.course === courseFilter);
    }

    const headers = [
      "student_id", "student_name", "email", "faculty", "level", "course",
      "is_hosteller", "hostel_block", "staircase", "room_no",
      "outstanding_fee", "exam_slip_status", "exam_slip_reason"
    ];

    const rows = students.map(s => [
      `"${s.id || ''}"`,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${s.email || ''}"`,
      `"${(s.faculty || '').replace(/"/g, '""')}"`,
      `"${(s.level || '').replace(/"/g, '""')}"`,
      `"${(s.course || '').replace(/"/g, '""')}"`,
      s.isHosteller ? "true" : "false",
      `"${s.hostelBlock || ''}"`,
      `"${s.staircase || ''}"`,
      `"${s.roomNo || ''}"`,
      (parseFloat(s.outstandingFee) || 0).toFixed(2),
      `"${s.examSlipStatus || 'Available'}"`,
      `"${(s.examSlipReason || '').replace(/"/g, '""')}"`
    ].join(","));

    return [headers.join(","), ...rows].join("\n");
  }

  // --- KNOWLEDGE BASE ---
  getKnowledgeBase() {
    try {
      return JSON.parse(localStorage.getItem(this.KB_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  saveKnowledgeBase(kb) {
    localStorage.setItem(this.KB_KEY, JSON.stringify(kb));
  }

  async addKnowledgeItem(item) {
    const kb = this.getKnowledgeBase();
    item.id = item.id || 'kb-' + Date.now();
    kb.unshift(item);
    this.saveKnowledgeBase(kb);

    try {
      await fetch('/api/kb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
    } catch (e) { }
  }

  async updateKnowledgeItem(id, updatedFields) {
    let kb = this.getKnowledgeBase();
    kb = kb.map(item => item.id === id ? { ...item, ...updatedFields } : item);
    this.saveKnowledgeBase(kb);

    try {
      await fetch(`/api/kb/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
    } catch (e) { }
  }

  async deleteKnowledgeItem(id) {
    let kb = this.getKnowledgeBase();
    kb = kb.filter(item => item.id !== id);
    this.saveKnowledgeBase(kb);

    try {
      await fetch(`/api/kb/${id}`, { method: 'DELETE' });
    } catch (e) { }
  }

  // --- CHAT HISTORY ---
  getChatHistory() {
    try {
      return JSON.parse(localStorage.getItem(this.HISTORY_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  saveChatTurn(studentId, studentName, userMsg, botResp) {
    let history = this.getChatHistory();
    let session = history.find(h => h.studentId === studentId);

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (session) {
      session.turns = (session.turns || 1) + 1;
      session.lastQuestion = userMsg;
      session.timestamp = timestamp;
    } else {
      session = {
        id: 'sess-' + Date.now(),
        studentId,
        studentName,
        turns: 1,
        lastQuestion: userMsg,
        timestamp
      };
      history.unshift(session);
    }
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
  }

  // --- FEEDBACK LOGS ---
  getFeedbackLogs() {
    try {
      return JSON.parse(localStorage.getItem(this.FEEDBACK_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  saveFeedback(studentId, rating, comment) {
    let logs = this.getFeedbackLogs();
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    logs.unshift({
      id: 'fb-' + Date.now(),
      studentId,
      rating,
      comment,
      timestamp
    });
    localStorage.setItem(this.FEEDBACK_KEY, JSON.stringify(logs));
  }

  // --- AUTHENTICATION ---
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(this.AUTH_KEY)) || null;
    } catch (e) {
      return null;
    }
  }

  setUser(user) {
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
  }

  logout() {
    localStorage.removeItem(this.AUTH_KEY);
  }
}
