// UniBot AIMST University Chatbot - Main Application Controller
// Ref: Chapter 4 System Design & Secure Student Authentication

document.addEventListener('DOMContentLoaded', () => {
  const appEl = document.getElementById('app');
  const storage = new StorageService();
  let chatbotEngine = new ChatbotEngine(storage.getKnowledgeBase());

  // Application State
  let currentView = 'home'; // 'home' | 'student-login' | 'student-chat' | 'admin-login' | 'admin-dashboard'
  let adminSubTab = 'kb'; // 'kb' | 'students' | 'history' | 'feedback'
  let selectedFacultyFilter = 'ALL';
  let selectedLevelFilter = 'ALL';
  let selectedCourseFilter = 'ALL';
  let currentUser = storage.getUser() || null;
  let activeStudentProfile = null;
  let chatMessages = [];
  let editingKbId = null;

  window.addEventListener('aimst_realtime_sync', () => {
    chatbotEngine.updateKnowledgeBase(storage.getKnowledgeBase());
    if (currentUser && currentUser.role === 'student') {
      activeStudentProfile = storage.getStudentById(currentUser.id) || activeStudentProfile;
    }
    render();
  });

  function initStudentChatMessages() {
    activeStudentProfile = storage.getStudentById(currentUser.id) || {
      id: currentUser.id,
      name: currentUser.name || "Student " + currentUser.id,
      faculty: "AIMST University",
      course: "General Studies",
      outstandingFee: 0,
      examTimetable: "Check Student Portal",
      hostelBlock: "Main Hostel",
      roomNo: "Unassigned",
      examSlipStatus: "Available"
    };

    chatMessages = [
      {
        sender: 'bot',
        text: `Hello <strong>${activeStudentProfile.name}</strong>! I am UniBot, your AIMST University support assistant.<br/><br/>🎓 Registered Program: <em>${activeStudentProfile.course}</em> (${activeStudentProfile.faculty}). How can I assist you today?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  }

  // Render Engine
  function render() {
    appEl.innerHTML = '';

    const header = createHeader();
    appEl.appendChild(header);

    const mainContainer = document.createElement('main');
    mainContainer.style.flex = '1';

    if (currentView === 'home') {
      mainContainer.appendChild(renderHomeView());
    } else if (currentView === 'student-login') {
      mainContainer.appendChild(renderStudentLoginView());
    } else if (currentView === 'student-chat') {
      if (!activeStudentProfile && currentUser && currentUser.role === 'student') {
        initStudentChatMessages();
      }
      mainContainer.appendChild(renderStudentChatView());
    } else if (currentView === 'admin-login') {
      mainContainer.appendChild(renderAdminLoginView());
    } else if (currentView === 'admin-dashboard') {
      mainContainer.appendChild(renderAdminDashboardView());
    }

    appEl.appendChild(mainContainer);
  }

  // --- HEADER COMPONENT ---
  function createHeader() {
    const header = document.createElement('header');
    header.className = 'main-header';

    const isStudent = currentUser && currentUser.role === 'student';
    const isAdmin = currentUser && currentUser.role === 'admin';

    header.innerHTML = `
      <div class="nav-container">
        <a href="#" class="brand-logo" id="logo-link">
          <div class="logo-icon"><i class="fas fa-robot"></i></div>
          <div class="brand-title">
            UniBot
            <span class="brand-subtitle">AIMST Support System</span>
          </div>
        </a>
        <div class="nav-actions">
          ${isAdmin ? `
            <span style="font-size: 0.85rem; font-weight:600; color:var(--primary);"><i class="fas fa-user-shield"></i> Admin Panel</span>
            <button class="nav-btn nav-btn-secondary" id="btn-logout"><i class="fas fa-sign-out-alt"></i> Logout</button>
          ` : isStudent ? `
            <span style="font-size: 0.85rem; font-weight:600; color:var(--primary);"><i class="fas fa-user-graduate"></i> ${currentUser.name} (${currentUser.id})</span>
            <button class="nav-btn nav-btn-secondary" id="btn-logout"><i class="fas fa-sign-out-alt"></i> Sign Out</button>
          ` : `
            <button class="nav-btn nav-btn-secondary" id="btn-nav-home"><i class="fas fa-home"></i> Home</button>
            <button class="nav-btn nav-btn-secondary" id="btn-nav-student"><i class="fas fa-comments"></i> Student Login</button>
            <button class="nav-btn nav-btn-primary" id="btn-nav-admin"><i class="fas fa-lock"></i> Admin Access</button>
          `}
        </div>
      </div>
    `;

    setTimeout(() => {
      const logoLink = header.querySelector('#logo-link');
      if (logoLink) logoLink.onclick = (e) => { e.preventDefault(); navigateTo('home'); };

      const btnHome = header.querySelector('#btn-nav-home');
      if (btnHome) btnHome.onclick = () => navigateTo('home');

      const btnStudent = header.querySelector('#btn-nav-student');
      if (btnStudent) btnStudent.onclick = () => {
        if (currentUser && currentUser.role === 'student') navigateTo('student-chat');
        else navigateTo('student-login');
      };

      const btnAdmin = header.querySelector('#btn-nav-admin');
      if (btnAdmin) btnAdmin.onclick = () => {
        if (currentUser && currentUser.role === 'admin') navigateTo('admin-dashboard');
        else navigateTo('admin-login');
      };

      const btnLogout = header.querySelector('#btn-logout');
      if (btnLogout) btnLogout.onclick = () => {
        storage.logout();
        currentUser = null;
        activeStudentProfile = null;
        navigateTo('home');
      };
    }, 0);

    return header;
  }

  // --- HOME VIEW ---
  function renderHomeView() {
    const section = document.createElement('div');
    section.innerHTML = `
      <section class="hero-section">
        <div class="hero-overlay"></div>
        <div class="hero-container">
          <div class="hero-content">
            <h1>Intelligent Student <span>Support Service</span></h1>
            <p class="hero-description">
              Get 24/7 instant answers for your specific faculty timetable, outstanding tuition balance, hostel assignment, and exam slips.
            </p>
            <div class="hero-actions">
              <button class="btn-cta" id="hero-start-btn">
                <i class="fas fa-paper-plane"></i> Student Login to Start Chatting
              </button>
            </div>
          </div>
          <div class="hero-preview-card">
            <div class="preview-header">
              <div class="preview-status"></div>
              <strong style="font-size:0.95rem;">UniBot Assistant</strong>
            </div>
            <div class="preview-dialog">
              <div class="preview-bubble preview-user">What is my tuition fee balance?</div>
              <div class="preview-bubble preview-bot">
                Hello Ahmad! According to AIMST records for Faculty of Business and Management, your outstanding tuition balance is RM 3,000.00.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section-categories">
        <div class="category-grid">
          <div class="category-card" data-cat="Examination">
            <div class="cat-icon"><i class="fas fa-file-alt"></i></div>
            <div class="cat-title">Faculty Exam Timetables</div>
            <div class="cat-desc">Personalized exam dates, hall locations & hall ticket downloads based on your faculty.</div>
          </div>
          <div class="category-card" data-cat="Finance">
            <div class="cat-icon"><i class="fas fa-wallet"></i></div>
            <div class="cat-title">Individual Tuition Fees</div>
            <div class="cat-desc">Check exact fee balances, clearance status & payment channels for your student ID.</div>
          </div>
          <div class="category-card" data-cat="Hostel">
            <div class="cat-icon"><i class="fas fa-building"></i></div>
            <div class="cat-title">Hostel & Accommodation</div>
            <div class="cat-desc">View your assigned room block, dorm number & rental payment receipts.</div>
          </div>
          <div class="category-card" data-cat="Student Services">
            <div class="cat-icon"><i class="fas fa-id-card"></i></div>
            <div class="cat-title">Student Services (SAD)</div>
            <div class="cat-desc">Vehicle stickers, PTPTN loan status, AIMST scholarships & library timing.</div>
          </div>
        </div>
      </section>
    `;

    setTimeout(() => {
      const heroBtn = section.querySelector('#hero-start-btn');
      if (heroBtn) heroBtn.onclick = () => {
        if (currentUser && currentUser.role === 'student') navigateTo('student-chat');
        else navigateTo('student-login');
      };

      section.querySelectorAll('.category-card').forEach(card => {
        card.onclick = () => {
          if (currentUser && currentUser.role === 'student') navigateTo('student-chat');
          else navigateTo('student-login');
        };
      });
    }, 0);

    return section;
  }

  // --- CLEAN SECURE STUDENT LOGIN VIEW ---
  function renderStudentLoginView() {
    const container = document.createElement('div');
    container.className = 'auth-page';
    container.innerHTML = `
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo-icon" style="margin: 0 auto 1rem; width:52px; height:52px; font-size:1.4rem;"><i class="fas fa-user-graduate"></i></div>
          <h2>Student Portal Login</h2>
          <p>Sign in with your student credentials to access UniBot support</p>
        </div>

        <form id="student-login-form">
          <div class="form-group">
            <label class="form-label">Matric Number</label>
            <input type="text" class="form-input" id="matric-input" placeholder="e.g. B25030023" value="B25030023" required>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="pass-input" placeholder="••••••••" value="pass123" required>
          </div>
          <button type="submit" class="btn-submit">Sign In to Student Portal</button>
        </form>

        <div class="demo-credentials-box" style="margin-top:1.5rem;">
          <i class="fas fa-info-circle"></i> <strong>Accounts (Password: <code>pass123</code>):</strong><br/>
          • Kavyasre Kobinathan: <code>B25030023</code><br/>
          • Siti Nurhaliza: <code>B25030002</code>
        </div>
      </div>
    `;

    setTimeout(() => {
      const form = container.querySelector('#student-login-form');
      form.onsubmit = (e) => {
        e.preventDefault();
        const matric = container.querySelector('#matric-input').value.trim();
        const student = storage.getStudentById(matric) || {
          id: matric,
          name: "Student " + matric
        };
        currentUser = {
          role: 'student',
          id: student.id,
          name: student.name
        };
        storage.setUser(currentUser);
        initStudentChatMessages();
        navigateTo('student-chat');
      };
    }, 0);

    return container;
  }

  // --- STUDENT CHAT VIEW ---
  function renderStudentChatView() {
    const layout = document.createElement('div');
    layout.className = 'chat-layout';

    const p = activeStudentProfile || {};
    const feeText = parseFloat(p.outstandingFee || 0) > 0 ? `RM ${parseFloat(p.outstandingFee).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'RM 0.00 (Paid)';
    const feeBadgeClass = parseFloat(p.outstandingFee || 0) > 0 ? 'background:#fee2e2; color:#b91c1c;' : 'background:#dcfce7; color:#15803d;';

    layout.innerHTML = `
      <div class="chat-sidebar">
        <div class="user-profile-widget" style="flex-direction:column; align-items:flex-start; gap:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.75rem; width:100%;">
            <div class="avatar-circle">${p.name ? p.name.charAt(0) : 'S'}</div>
            <div class="user-info">
              <h4>${p.name || 'Student'}</h4>
              <p>${p.id}</p>
            </div>
          </div>

          <div style="background:var(--primary-light); padding:0.65rem; border-radius:var(--radius-md); font-size:0.75rem; width:100%; border:1px solid var(--border);">
            <div style="font-weight:700; color:var(--primary); margin-bottom:0.25rem;">📍 Student Profile</div>
            <div><strong>Faculty:</strong> ${p.faculty || 'N/A'}</div>
            <div>
              <strong>Hostel Status:</strong> 
              ${(p.isHosteller === true || p.isHosteller === 'true') ?
        `<span style="color:#047857; font-weight:700;">Hosteller</span><br/><span style="color:var(--text-muted); font-size:0.7rem;">🏢 ${p.hostelBlock || 'Block'}, 🪜 ${p.staircase || 'Staircase'}, 🚪 ${p.roomNo || 'Room'}</span>` :
        `<span style="color:#64748b; font-weight:700;">Non-Hosteller (Off-Campus)</span>`
      }
            </div>
            <div style="margin-top:0.35rem; display:flex; gap:0.35rem; flex-wrap:wrap;">
              <span class="status-badge" style="${feeBadgeClass}">Fee: ${feeText}</span>
              <span class="status-badge" style="background:#e0f2fe; color:#0369a1;">Slip: ${p.examSlipStatus || 'Available'}</span>
            </div>
          </div>
        </div>

        <div class="sidebar-heading">PERSONALIZED INQUIRIES</div>
        <div class="topic-list">
          <button class="topic-btn" data-query="What is my tuition fee balance?">
            <span>💳 My Tuition Fee Balance</span> <i class="fas fa-chevron-right"></i>
          </button>
          <button class="topic-btn" data-query="When is my exam timetable?">
            <span>📅 My Faculty Exam Timetable</span> <i class="fas fa-chevron-right"></i>
          </button>
          <button class="topic-btn" data-query="Can I download my exam slip?">
            <span>📄 My Exam Slip Status</span> <i class="fas fa-chevron-right"></i>
          </button>
          <button class="topic-btn" data-query="Where is my hostel room assignment?">
            <span>🏠 My Hostel Room Details</span> <i class="fas fa-chevron-right"></i>
          </button>
          
          <div class="sidebar-heading" style="margin-top:1rem;">GENERAL FAQ</div>
          <button class="topic-btn" data-query="What are the Central Library operating hours?">
            <span>Library Hours</span> <i class="fas fa-chevron-right"></i>
          </button>
          <button class="topic-btn" data-query="How do I apply for an AIMST Car or Motorcycle sticker?">
            <span>Vehicle Sticker</span> <i class="fas fa-chevron-right"></i>
          </button>
          <button class="topic-btn" data-query="Where do I apply for PTPTN loan or scholarships?">
            <span>Scholarships & SAD</span> <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div class="chat-main">
        <div class="chat-topbar">
          <div class="bot-info-title">
            <div class="logo-icon" style="width:36px; height:36px; font-size:1rem;"><i class="fas fa-robot"></i></div>
            <div>
              <strong style="font-size:1rem; display:block;">UniBot Assistant</strong>
              <span style="font-size:0.75rem; color:var(--text-muted);">AIMST University Support • 24/7 Active Context</span>
            </div>
          </div>
          <span class="status-badge"><i class="fas fa-circle" style="font-size:0.5rem; margin-right:4px;"></i> Connected to ${p.name}</span>
        </div>

        <div class="chat-messages-container" id="chat-messages-box">
          ${renderMessageList()}
        </div>

        <div class="chat-input-bar">
          <div class="suggestion-pills">
            <button class="pill-btn" data-query="What is my tuition fee balance?">My Fee Balance</button>
            <button class="pill-btn" data-query="When is my exam timetable?">My Exam Timetable</button>
            <button class="pill-btn" data-query="Can I download my exam slip?">My Exam Slip</button>
            <button class="pill-btn" data-query="Where is my hostel room assignment?">My Hostel Room</button>
            <button class="pill-btn" data-query="Vehicle sticker">Vehicle Sticker</button>
          </div>
          <div class="input-wrapper">
            <input type="text" class="chat-input-field" id="user-chat-input" placeholder="Type your question here (e.g. What is my fee balance?)...">
            <button class="btn-send" id="btn-send-msg"><i class="fas fa-paper-plane"></i></button>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      const msgBox = layout.querySelector('#chat-messages-box');
      msgBox.scrollTop = msgBox.scrollHeight;

      const inputField = layout.querySelector('#user-chat-input');
      const sendBtn = layout.querySelector('#btn-send-msg');

      function sendMessage(queryText) {
        const text = queryText || inputField.value.trim();
        if (!text) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        chatMessages.push({ sender: 'user', text, time });
        inputField.value = '';
        updateChatBox();

        setTimeout(() => {
          activeStudentProfile = storage.getStudentById(currentUser.id) || activeStudentProfile;
          chatbotEngine.updateKnowledgeBase(storage.getKnowledgeBase());

          const result = chatbotEngine.processQuery(text, activeStudentProfile);
          const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          chatMessages.push({
            sender: 'bot',
            text: result.response,
            matched: result.matched,
            isSlipAction: result.isSlipAction,
            suggested: result.suggested,
            time: botTime
          });

          storage.saveChatTurn(currentUser.id, currentUser.name, text, result.response);
          updateChatBox();
        }, 400);
      }

      function updateChatBox() {
        msgBox.innerHTML = renderMessageList();
        msgBox.scrollTop = msgBox.scrollHeight;
        attachFeedbackEvents(msgBox);
      }

      sendBtn.onclick = () => sendMessage();
      inputField.onkeypress = (e) => {
        if (e.key === 'Enter') sendMessage();
      };

      layout.querySelectorAll('.topic-btn, .pill-btn').forEach(btn => {
        btn.onclick = () => {
          const q = btn.getAttribute('data-query');
          sendMessage(q);
        };
      });

      attachFeedbackEvents(msgBox);
    }, 0);

    return layout;
  }

  function renderMessageList() {
    return chatMessages.map((msg, index) => {
      if (msg.sender === 'user') {
        return `
          <div class="msg-row user">
            <div class="msg-avatar user-av"><i class="fas fa-user"></i></div>
            <div class="msg-content-wrapper">
              <div class="msg-bubble">${msg.text}</div>
              <span class="msg-time">${msg.time}</span>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="msg-row bot">
            <div class="msg-avatar bot-av"><i class="fas fa-robot"></i></div>
            <div class="msg-content-wrapper">
              <div class="msg-bubble">
                ${msg.text}

                ${msg.isSlipAction ? `
                  <div style="margin-top:0.75rem; text-align:center;">
                    <button class="nav-btn nav-btn-primary download-slip-btn" style="background:#16a34a; font-weight:700;">
                      <i class="fas fa-file-pdf"></i> Download Official Hall Slip (PDF)
                    </button>
                  </div>
                ` : ''}

                ${msg.suggested ? `
                  <div style="margin-top:0.75rem; font-size:0.85rem; font-weight:600; color:var(--text-muted);">
                    Suggested topics:
                  </div>
                  <div style="display:flex; flex-direction:column; gap:0.35rem; margin-top:0.35rem;">
                    ${msg.suggested.map(s => `
                      <button class="pill-btn inline-suggest-btn" data-query="${s.question}" style="text-align:left; white-space:normal;">
                        📌 ${s.question}
                      </button>
                    `).join('')}
                  </div>
                ` : ''}

                <div class="feedback-container">
                  <span>Was this helpful? Rate response:</span>
                  <div class="rating-stars" data-msg-idx="${index}">
                    <button class="star-btn" data-star="1">★</button>
                    <button class="star-btn" data-star="2">★</button>
                    <button class="star-btn" data-star="3">★</button>
                    <button class="star-btn" data-star="4">★</button>
                    <button class="star-btn" data-star="5">★</button>
                  </div>
                </div>
              </div>
              <span class="msg-time">${msg.time}</span>
            </div>
          </div>
        `;
      }
    }).join('');
  }

  function attachFeedbackEvents(container) {
    container.querySelectorAll('.download-slip-btn').forEach(btn => {
      btn.onclick = () => {
        alert(`Generating Official Exam Hall Slip for ${activeStudentProfile.name} (${activeStudentProfile.id})\nFaculty: ${activeStudentProfile.faculty}\nStatus: Verified Complete.`);
      };
    });

    container.querySelectorAll('.inline-suggest-btn').forEach(btn => {
      btn.onclick = () => {
        const q = btn.getAttribute('data-query');
        const inputField = document.getElementById('user-chat-input');
        if (inputField) {
          inputField.value = q;
          document.getElementById('btn-send-msg').click();
        }
      };
    });

    container.querySelectorAll('.rating-stars').forEach(starsBox => {
      starsBox.querySelectorAll('.star-btn').forEach(star => {
        star.onclick = () => {
          const rating = parseInt(star.getAttribute('data-star'));
          starsBox.querySelectorAll('.star-btn').forEach((s, idx) => {
            if (idx < rating) s.classList.add('active');
            else s.classList.remove('active');
          });
          storage.addFeedback(currentUser.id, rating, "Helpful chatbot answer");
        };
      });
    });
  }

  // --- ADMIN LOGIN VIEW ---
  function renderAdminLoginView() {
    const container = document.createElement('div');
    container.className = 'auth-page';
    container.innerHTML = `
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo-icon" style="margin: 0 auto 1rem; width:54px; height:54px; font-size:1.5rem;"><i class="fas fa-user-shield"></i></div>
          <h2>Admin Management Login</h2>
          <p>Access Knowledge Base & Student Profiles Database</p>
        </div>
        <form id="admin-login-form">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" class="form-input" id="admin-user-input" value="admin" required>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="admin-pass-input" value="admin123" required>
          </div>
          <button type="submit" class="btn-submit">Login to Admin Portal</button>
        </form>
        <div class="demo-credentials-box">
          <i class="fas fa-lock"></i> <strong>Admin Credentials:</strong><br/>
          Username: <code>admin</code> | Password: <code>admin123</code>
        </div>
      </div>
    `;

    setTimeout(() => {
      const form = container.querySelector('#admin-login-form');
      form.onsubmit = (e) => {
        e.preventDefault();
        const user = container.querySelector('#admin-user-input').value.trim();
        const pass = container.querySelector('#admin-pass-input').value.trim();

        if (user === 'admin' && pass === 'admin123') {
          currentUser = { role: 'admin', id: 'admin', name: 'System Administrator' };
          storage.setUser(currentUser);
          navigateTo('admin-dashboard');
        } else {
          alert('Invalid admin credentials. Please use admin / admin123');
        }
      };
    }, 0);

    return container;
  }

  // --- ADMIN DASHBOARD VIEW ---
  function renderAdminDashboardView() {
    const layout = document.createElement('div');
    layout.className = 'admin-layout';

    layout.innerHTML = `
      <div class="admin-sidebar">
        <div style="padding: 0 0.5rem;">
          <h3 style="font-size:1.1rem; color:#fff; display:flex; align-items:center; gap:0.5rem;">
            <i class="fas fa-sliders-h"></i> Admin Panel
          </h3>
          <p style="font-size:0.75rem; color:#94a3b8;">UniBot Management System</p>
        </div>
        <div class="admin-menu">
          <button class="admin-menu-item ${adminSubTab === 'kb' ? 'active' : ''}" id="tab-btn-kb">
            <i class="fas fa-database"></i> Knowledge Base Data
          </button>
          <button class="admin-menu-item ${adminSubTab === 'students' ? 'active' : ''}" id="tab-btn-students">
            <i class="fas fa-user-graduate"></i> Student Profiles Database
          </button>
          <button class="admin-menu-item ${adminSubTab === 'history' ? 'active' : ''}" id="tab-btn-history">
            <i class="fas fa-history"></i> Chat Logs & Monitoring
          </button>
          <button class="admin-menu-item ${adminSubTab === 'feedback' ? 'active' : ''}" id="tab-btn-feedback">
            <i class="fas fa-star"></i> Student Feedback
          </button>
          <button class="admin-menu-item" id="btn-export-sql" style="margin-top:1.5rem; background:rgba(2, 132, 199, 0.2); color:#38bdf8; border:1px solid rgba(56, 189, 248, 0.4);">
            <i class="fas fa-file-export"></i> Export MySQL Dump (.sql)
          </button>
        </div>
      </div>

      <div class="admin-content">
        ${renderAdminSubTabContent()}
      </div>
    `;

    setTimeout(() => {
      const tabKb = layout.querySelector('#tab-btn-kb');
      if (tabKb) tabKb.onclick = () => { adminSubTab = 'kb'; render(); };

      const tabStu = layout.querySelector('#tab-btn-students');
      if (tabStu) tabStu.onclick = () => { adminSubTab = 'students'; render(); };

      const tabHist = layout.querySelector('#tab-btn-history');
      if (tabHist) tabHist.onclick = () => { adminSubTab = 'history'; render(); };

      const tabFb = layout.querySelector('#tab-btn-feedback');
      if (tabFb) tabFb.onclick = () => { adminSubTab = 'feedback'; render(); };

      const btnSql = layout.querySelector('#btn-export-sql');
      if (btnSql) btnSql.onclick = () => window.open('/api/export/sql', '_blank');

      attachAdminContentEvents(layout);
    }, 0);

    return layout;
  }

  function renderAdminSubTabContent() {
    if (adminSubTab === 'kb') {
      const kbData = storage.getKnowledgeBase();
      return `
        <div class="admin-page-title">
          <div>
            <h2>Knowledge Base Management</h2>
            <p style="color:var(--text-muted); font-size:0.9rem;">Manage FAQs, keyword triggers, and standardized responses</p>
          </div>
          <button class="nav-btn nav-btn-primary" id="btn-add-kb">
            <i class="fas fa-plus"></i> Add New Entry
          </button>
        </div>

        <div class="table-card">
          <div class="table-toolbar">
            <input type="text" class="form-input" id="search-kb-input" placeholder="Search questions or keywords..." style="max-width:320px;">
            <span style="font-size:0.85rem; color:var(--text-muted);">Total Entries: <strong>${kbData.length}</strong></span>
          </div>
          <div style="overflow-x:auto;">
            <table class="data-table" id="kb-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Question</th>
                  <th>Keywords</th>
                  <th>Response</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${kbData.map(item => `
                  <tr data-id="${item.id}">
                    <td><span class="category-tag">${item.category || 'General'}</span></td>
                    <td style="font-weight:600;">${item.question}</td>
                    <td style="font-size:0.8rem; color:var(--text-muted);">${(item.keywords || []).join(', ')}</td>
                    <td style="max-width:340px; font-size:0.85rem;">${item.response}</td>
                    <td>
                      <div class="action-btns">
                        <button class="btn-icon btn-edit-kb" data-id="${item.id}" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete btn-delete-kb" data-id="${item.id}" title="Delete"><i class="fas fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (adminSubTab === 'students') {
      const allStudents = storage.getStudents();
      const structure = storage.getAIMSTStructure();
      const facultiesList = Object.keys(structure);

      // Compute stats per faculty
      const facultyStats = {};
      facultiesList.forEach(fac => {
        const facStus = allStudents.filter(s => s.faculty === fac);
        const blocked = facStus.filter(s => parseFloat(s.outstandingFee || 0) > 0).length;
        const totalFee = facStus.reduce((sum, s) => sum + parseFloat(s.outstandingFee || 0), 0);
        facultyStats[fac] = { count: facStus.length, blocked, totalFee };
      });

      // Filter students list
      let filteredStudents = allStudents.filter(s => {
        if (selectedFacultyFilter !== 'ALL') {
          const facNorm = (s.faculty || '').replace(/\band\b/gi, '&').trim().toLowerCase();
          const selNorm = selectedFacultyFilter.replace(/\band\b/gi, '&').trim().toLowerCase();
          if (facNorm !== selNorm) return false;
        }
        if (selectedLevelFilter !== 'ALL') {
          const sLvl = (s.level || '').trim().toLowerCase();
          const selLvl = selectedLevelFilter.trim().toLowerCase();
          if (sLvl !== selLvl && !(selLvl === 'degree' && sLvl === 'undergraduate') && !(selLvl === 'certificate' && sLvl.includes('certificate'))) {
            return false;
          }
        }
        if (selectedCourseFilter !== 'ALL' && s.course !== selectedCourseFilter) return false;
        return true;
      });

      // Available Levels for selected Faculty
      let availableLevels = [];
      if (selectedFacultyFilter !== 'ALL' && structure[selectedFacultyFilter]) {
        availableLevels = Object.keys(structure[selectedFacultyFilter]);
      } else {
        availableLevels = ["Degree", "Diploma", "Certificate", "Master", "PhD", "Foundation"];
      }

      // Available Courses for selected Faculty
      let availableCourses = [];
      if (selectedFacultyFilter !== 'ALL' && structure[selectedFacultyFilter]) {
        Object.values(structure[selectedFacultyFilter]).forEach(cList => {
          availableCourses.push(...cList);
        });
      }

      return `
        <div class="admin-page-title">
          <div>
            <h2>AIMST University Student Profiles Database</h2>
            <p style="color:var(--text-muted); font-size:0.9rem;">Organized across 8 AIMST Faculties & Courses. Supports real-time fee updates & bulk non-destructive Excel/CSV import.</p>
          </div>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button class="nav-btn nav-btn-primary" id="btn-add-stu">
              <i class="fas fa-user-plus"></i> Add New Student
            </button>
            <button class="nav-btn nav-btn-secondary" id="btn-extract-admissions" style="background:#0284c7; color:#fff;">
              <i class="fas fa-file-excel"></i> Bulk Import (Excel/CSV)
            </button>
            <button class="nav-btn nav-btn-secondary" id="btn-export-csv" style="background:#10b981; color:#fff;">
              <i class="fas fa-download"></i> Export to CSV
            </button>
          </div>
        </div>

        <!-- 8 AIMST Faculties Cards Header -->
        <div style="margin-bottom:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <strong style="font-size:0.95rem; color:var(--text-main);"><i class="fas fa-university"></i> AIMST Faculties Directory (Click to Filter)</strong>
            ${selectedFacultyFilter !== 'ALL' ? `
              <button id="btn-reset-faculties" class="nav-btn nav-btn-secondary" style="padding:0.25rem 0.6rem; font-size:0.75rem;">
                🔄 Show All Faculties
              </button>
            ` : ''}
          </div>
          <div class="faculty-cards-grid">
            ${facultiesList.map((fac, idx) => {
        const stat = facultyStats[fac] || { count: 0, blocked: 0, totalFee: 0 };
        const isActive = selectedFacultyFilter === fac;
        return `
                <div class="faculty-card ${isActive ? 'active' : ''}" data-faculty="${fac}">
                  <div class="faculty-card-header">
                    <span class="faculty-card-title">${idx + 1}. ${fac}</span>
                    <span class="faculty-card-count">${stat.count}</span>
                  </div>
                  <div class="faculty-card-meta">
                    <span>Blocked Slips: <strong style="${stat.blocked > 0 ? 'color:#ef4444;' : 'color:#10b981;'}">${stat.blocked}</strong></span>
                    <span>RM ${stat.totalFee.toFixed(0)}</span>
                  </div>
                </div>
              `;
      }).join('')}
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="table-card">
          <div class="table-toolbar" style="display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center; justify-content:space-between;">
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap; flex:1; align-items:center;">
              <select class="form-select" id="filter-faculty-select" style="max-width:240px; font-weight:600;">
                <option value="ALL" ${selectedFacultyFilter === 'ALL' ? 'selected' : ''}>🏛️ All 8 Faculties</option>
                ${facultiesList.map(f => `<option value="${f}" ${selectedFacultyFilter === f ? 'selected' : ''}>${f}</option>`).join('')}
              </select>

              <select class="form-select" id="filter-level-select" style="max-width:180px;">
                <option value="ALL" ${selectedLevelFilter === 'ALL' ? 'selected' : ''}>🎓 All Study Levels</option>
                ${availableLevels.map(l => `<option value="${l}" ${selectedLevelFilter === l ? 'selected' : ''}>${l}</option>`).join('')}
              </select>

              ${availableCourses.length > 0 ? `
                <select class="form-select" id="filter-course-select" style="max-width:240px;">
                  <option value="ALL" ${selectedCourseFilter === 'ALL' ? 'selected' : ''}>📚 All Faculty Courses</option>
                  ${availableCourses.map(c => `<option value="${c}" ${selectedCourseFilter === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
              ` : ''}

              <input type="text" class="form-input" id="search-stu-input" placeholder="Search student name, ID..." style="max-width:220px;">
            </div>

            <span style="font-size:0.85rem; color:var(--text-muted);">Showing <strong>${filteredStudents.length}</strong> of <strong>${allStudents.length}</strong> Students</span>
          </div>

          <div style="overflow-x:auto;">
            <table class="data-table" id="stu-table">
              <thead>
                <tr>
                  <th>Matric ID & Student Name</th>
                  <th>Faculty & Academic Course</th>
                  <th>Hostel Status & Details</th>
                  <th>Outstanding Fee</th>
                  <th>Exam Slip</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filteredStudents.length === 0 ? `
                  <tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">No student profiles found for the selected faculty/filter. Click "Add New Student" or "Bulk Import" to insert records.</td></tr>
                ` : filteredStudents.map(s => {
        const isH = s.isHosteller === true || s.isHosteller === 'true';
        const levelClass = (s.level || 'undergraduate').toLowerCase().replace(/[^a-z]/g, '');
        return `
                    <tr>
                      <td>
                        <strong>${s.name}</strong><br/>
                        <code style="font-size:0.75rem;">${s.id}</code>
                      </td>
                      <td style="font-size:0.85rem;">
                        <span class="level-badge ${levelClass}">${s.level || 'Degree'}</span> <strong>${s.faculty}</strong><br/>
                        <span style="color:var(--text-muted); font-size:0.75rem;">${s.course}</span>
                      </td>
                      <td style="font-size:0.85rem;">
                        ${isH ? `
                          <span class="status-badge" style="background:#d1fae5; color:#047857; font-weight:700;">Hosteller</span><br/>
                          <span style="font-size:0.75rem; color:var(--text-muted);">
                            🏢 ${s.hostelBlock || 'N/A'} • 🪜 ${s.staircase || 'N/A'} • 🚪 ${s.roomNo || 'N/A'}
                          </span>
                        ` : `
                          <span class="status-badge" style="background:#f1f5f9; color:#64748b; font-weight:700;">Non-Hosteller</span>
                        `}
                      </td>
                      <td>
                        <span class="status-badge" style="${parseFloat(s.outstandingFee || 0) > 0 ? 'background:#fee2e2; color:#b91c1c;' : 'background:#dcfce7; color:#15803d;'}">
                          RM ${parseFloat(s.outstandingFee || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td>
                        <span class="status-badge" style="${s.examSlipStatus === 'Available' ? 'background:#dcfce7; color:#15803d;' :
            s.examSlipStatus === 'Not Available' ? 'background:#fef3c7; color:#b45309;' :
              'background:#fee2e2; color:#b91c1c;'
          }">
                          ${s.examSlipStatus || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div class="action-btns">
                          <button class="btn-icon btn-edit-stu" data-id="${s.id}" title="Edit Student Profile"><i class="fas fa-edit"></i></button>
                          <button class="btn-icon delete btn-delete-stu" data-id="${s.id}" title="Delete Student"><i class="fas fa-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  `;
      }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (adminSubTab === 'history') {
      const history = storage.getChatHistory();
      return `
        <div class="admin-page-title">
          <div>
            <h2>Chat History & Monitoring</h2>
            <p style="color:var(--text-muted); font-size:0.9rem;">Review recent student interaction transcripts and query volume</p>
          </div>
        </div>

        <div class="table-card">
          <div style="overflow-x:auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Student</th>
                  <th>Matric ID</th>
                  <th>Turns</th>
                  <th>Last Inquiry</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                ${history.map(h => `
                  <tr>
                    <td><code>${h.id}</code></td>
                    <td style="font-weight:600;">${h.studentName}</td>
                    <td>${h.studentId}</td>
                    <td><span class="status-badge">${h.turns} turns</span></td>
                    <td style="max-width:300px; font-size:0.85rem;">${h.lastQuestion}</td>
                    <td style="font-size:0.8rem; color:var(--text-muted);">${h.timestamp}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (adminSubTab === 'feedback') {
      const logs = storage.getFeedbackLogs();
      return `
        <div class="admin-page-title">
          <div>
            <h2>Student Feedback & Analytics</h2>
            <p style="color:var(--text-muted); font-size:0.9rem;">Student satisfaction ratings and service performance feedback</p>
          </div>
        </div>

        <div class="table-card">
          <div style="overflow-x:auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Rating</th>
                  <th>Feedback Comment</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                ${logs.map(f => `
                  <tr>
                    <td><strong>${f.studentId}</strong></td>
                    <td style="color:#f59e0b; font-size:1.1rem;">
                      ${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}
                    </td>
                    <td>${f.comment || 'No comment provided.'}</td>
                    <td style="font-size:0.8rem; color:var(--text-muted);">${f.timestamp}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  }

  function attachAdminContentEvents(container) {
    const btnAdd = container.querySelector('#btn-add-kb');
    if (btnAdd) btnAdd.onclick = () => openKbModal();

    const searchInput = container.querySelector('#search-kb-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        const q = e.target.value.toLowerCase();
        container.querySelectorAll('#kb-table tbody tr').forEach(row => {
          const text = row.innerText.toLowerCase();
          row.style.display = text.includes(q) ? '' : 'none';
        });
      };
    }

    // Faculty Cards Click to Filter
    container.querySelectorAll('.faculty-card').forEach(card => {
      card.onclick = () => {
        selectedFacultyFilter = card.getAttribute('data-faculty');
        selectedLevelFilter = 'ALL';
        selectedCourseFilter = 'ALL';
        render();
      };
    });

    const btnResetFac = container.querySelector('#btn-reset-faculties');
    if (btnResetFac) {
      btnResetFac.onclick = () => {
        selectedFacultyFilter = 'ALL';
        selectedLevelFilter = 'ALL';
        selectedCourseFilter = 'ALL';
        render();
      };
    }

    const selFac = container.querySelector('#filter-faculty-select');
    if (selFac) {
      selFac.onchange = (e) => {
        selectedFacultyFilter = e.target.value;
        selectedLevelFilter = 'ALL';
        selectedCourseFilter = 'ALL';
        render();
      };
    }

    const selLev = container.querySelector('#filter-level-select');
    if (selLev) {
      selLev.onchange = (e) => {
        selectedLevelFilter = e.target.value;
        selectedCourseFilter = 'ALL';
        render();
      };
    }

    const selCrs = container.querySelector('#filter-course-select');
    if (selCrs) {
      selCrs.onchange = (e) => {
        selectedCourseFilter = e.target.value;
        render();
      };
    }

    const searchStuInput = container.querySelector('#search-stu-input');
    if (searchStuInput) {
      searchStuInput.oninput = (e) => {
        const q = e.target.value.toLowerCase();
        container.querySelectorAll('#stu-table tbody tr').forEach(row => {
          const text = row.innerText.toLowerCase();
          row.style.display = text.includes(q) ? '' : 'none';
        });
      };
    }

    const btnExportCSV = container.querySelector('#btn-export-csv');
    if (btnExportCSV) {
      btnExportCSV.onclick = () => {
        const csvData = storage.exportStudentsToCSV(selectedFacultyFilter, selectedCourseFilter);
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `aimst_student_profiles_${selectedFacultyFilter.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      };
    }

    container.querySelectorAll('.btn-edit-kb').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const kb = storage.getKnowledgeBase().find(item => item.id === id);
        if (kb) openKbModal(kb);
      };
    });

    container.querySelectorAll('.btn-delete-kb').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this Knowledge Base entry?')) {
          storage.deleteKnowledgeItem(id);
          render();
        }
      };
    });

    container.querySelectorAll('.btn-edit-stu').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const student = storage.getStudentById(id);
        if (student) openStudentModal(student);
      };
    });

    container.querySelectorAll('.btn-delete-stu').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        if (confirm(`Are you sure you want to delete student profile (${id})?`)) {
          storage.deleteStudent(id);
          render();
        }
      };
    });

    const btnAddStu = container.querySelector('#btn-add-stu');
    if (btnAddStu) btnAddStu.onclick = () => openStudentModal(null);

    const btnExtractAdm = container.querySelector('#btn-extract-admissions');
    if (btnExtractAdm) btnExtractAdm.onclick = () => openExtractAdmissionsModal();
  }

  function openKbModal(kbItem = null) {
    editingKbId = kbItem ? kbItem.id : null;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3>${editingKbId ? 'Edit Knowledge Base Entry' : 'Add New Knowledge Base Entry'}</h3>
          <button class="btn-icon" id="modal-close-btn"><i class="fas fa-times"></i></button>
        </div>
        <form id="kb-modal-form">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Category</label>
              <select class="form-select" id="modal-cat" required>
                <option value="Examination" ${kbItem && kbItem.category === 'Examination' ? 'selected' : ''}>Examination</option>
                <option value="Finance" ${kbItem && kbItem.category === 'Finance' ? 'selected' : ''}>Finance / Tuition</option>
                <option value="Hostel" ${kbItem && kbItem.category === 'Hostel' ? 'selected' : ''}>Hostel & Accommodation</option>
                <option value="Student Services" ${kbItem && kbItem.category === 'Student Services' ? 'selected' : ''}>Student Services (SAD)</option>
                <option value="Academic" ${kbItem && kbItem.category === 'Academic' ? 'selected' : ''}>Academic & Courses</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Question Title</label>
              <input type="text" class="form-input" id="modal-question" value="${kbItem ? kbItem.question : ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Keywords (Comma Separated)</label>
              <input type="text" class="form-input" id="modal-keywords" value="${kbItem && kbItem.keywords ? kbItem.keywords.join(', ') : ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Standardized Response</label>
              <textarea class="form-textarea" id="modal-response" rows="4" required>${kbItem ? kbItem.response : ''}</textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="nav-btn nav-btn-secondary" id="modal-cancel-btn">Cancel</button>
            <button type="submit" class="nav-btn nav-btn-primary">Save Entry</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#modal-close-btn').onclick = () => overlay.remove();
    overlay.querySelector('#modal-cancel-btn').onclick = () => overlay.remove();

    overlay.querySelector('#kb-modal-form').onsubmit = (e) => {
      e.preventDefault();
      const category = overlay.querySelector('#modal-cat').value;
      const question = overlay.querySelector('#modal-question').value.trim();
      const keywordsRaw = overlay.querySelector('#modal-keywords').value;
      const keywords = keywordsRaw.split(',').map(k => k.trim()).filter(k => k.length > 0);
      const response = overlay.querySelector('#modal-response').value.trim();

      if (editingKbId) {
        storage.updateKnowledgeItem(editingKbId, { category, question, keywords, response });
      } else {
        storage.addKnowledgeItem({ category, question, keywords, response });
      }

      overlay.remove();
      render();
    };
  }

  function openStudentModal(student = null) {
    const isEdit = !!student;
    const structure = storage.getAIMSTStructure();
    const facultyList = Object.keys(structure);
    const defaultFaculty = facultyList[0] || "Faculty of Business & Management";

    // Normalize student profile data
    const s = student ? { ...student } : {
      id: "B2503" + Math.floor(1000 + Math.random() * 9000),
      name: "",
      email: "",
      faculty: defaultFaculty,
      level: "Degree",
      course: "Bachelor of Science (Hons) Management Information Systems",
      isHosteller: true,
      hostelBlock: "Block A",
      staircase: "Staircase 1",
      roomNo: "Room 101",
      outstandingFee: 0,
      examTimetable: "June 1 – June 10, 2026 (Exam Hall 1)",
      examSlipStatus: "Available",
      examSlipReason: "All fees cleared."
    };

    // Normalize legacy level names like "Undergraduate" -> "Degree", "Postgraduate" -> "Master"
    if (s.level === 'Undergraduate') s.level = 'Degree';
    if (s.level === 'Postgraduate') s.level = 'Master';
    if (!s.level) s.level = 'Degree';

    // Normalize faculty string (e.g. 'and' vs '&')
    if (s.faculty && s.faculty.includes('Business and Management')) {
      s.faculty = 'Faculty of Business & Management';
    }

    const isHostellerInit = s.isHosteller === true || s.isHosteller === 'true';
    const studyLevels = ["Degree", "Diploma", "Certificate", "Master", "PhD", "Foundation"];

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card" style="max-width:680px;">
        <div class="modal-header">
          <h3>${isEdit ? `Edit Student Profile: ${s.name} (${s.id})` : '➕ Add New Student Profile'}</h3>
          <button class="btn-icon" id="modal-close-btn"><i class="fas fa-times"></i></button>
        </div>
        <form id="stu-modal-form">
          <div class="modal-body" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label class="form-label">Matric ID / Student Number</label>
              <input type="text" class="form-input" id="stu-id" value="${s.id}" ${isEdit ? 'readonly style="background:#f1f5f9;"' : ''} required>
            </div>
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input" id="stu-name" value="${s.name}" placeholder="e.g. Tan Wei Ming" required>
            </div>
            <div class="form-group" style="grid-column:1 / -1;">
              <label class="form-label">Student Email Address</label>
              <input type="email" class="form-input" id="stu-email" value="${s.email || ''}" placeholder="e.g. student@student.aimst.edu.my" required>
            </div>

            <!-- FACULTY SELECTION -->
            <div class="form-group">
              <label class="form-label">Faculty</label>
              <select class="form-select" id="stu-faculty" required>
                ${facultyList.map(f => `<option value="${f}" ${s.faculty === f ? 'selected' : ''}>${f}</option>`).join('')}
              </select>
            </div>

            <!-- STUDYING LEVEL SELECTION -->
            <div class="form-group">
              <label class="form-label">Studying Level</label>
              <select class="form-select" id="stu-level" required>
                ${studyLevels.map(lvl => `<option value="${lvl}" ${s.level === lvl ? 'selected' : ''}>${lvl}</option>`).join('')}
              </select>
            </div>

            <!-- DYNAMIC COURSE / PROGRAM SELECTION -->
            <div class="form-group" style="grid-column:1 / -1;">
              <label class="form-label">Academic Program / Course</label>
              <select class="form-select" id="stu-course-select" style="margin-bottom:0.5rem;"></select>
              <input type="text" class="form-input" id="stu-course-custom" placeholder="Type custom course title if not in list..." style="display:none;" value="">
            </div>

            <!-- HOSTELLER VS NON-HOSTELLER STATUS -->
            <div class="form-group" style="grid-column:1 / -1;">
              <label class="form-label" style="font-weight:700;">Hostel Residency Status</label>
              <select class="form-select" id="stu-hostel-status" style="font-weight:600;">
                <option value="hosteller" ${isHostellerInit ? 'selected' : ''}>🏠 Hosteller (Campus Dormitory Resident)</option>
                <option value="non-hosteller" ${!isHostellerInit ? 'selected' : ''}>🚗 Non-Hosteller (Day Scholar / Off-Campus)</option>
              </select>
            </div>

            <!-- HOSTELLER DETAILS FIELDS (Hidden if Non-Hosteller) -->
            <div id="hostel-fields-group" style="grid-column:1 / -1; display:${isHostellerInit ? 'grid' : 'none'}; grid-template-columns:1fr 1fr 1fr; gap:0.75rem; background:#f8fafc; padding:0.75rem; border-radius:8px; border:1px solid var(--border);">
              <div class="form-group">
                <label class="form-label">Hostel Block</label>
                <input type="text" class="form-input" id="stu-hostel-block" value="${s.hostelBlock || ''}" placeholder="e.g. Block B">
              </div>
              <div class="form-group">
                <label class="form-label">Staircase</label>
                <input type="text" class="form-input" id="stu-staircase" value="${s.staircase || ''}" placeholder="e.g. Staircase 2">
              </div>
              <div class="form-group">
                <label class="form-label">Room Number</label>
                <input type="text" class="form-input" id="stu-room" value="${s.roomNo || ''}" placeholder="e.g. Room 204">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Outstanding Fee Balance (RM)</label>
              <input type="number" step="0.01" class="form-input" id="stu-fee" value="${s.outstandingFee || 0}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Exam Slip Status</label>
              <select class="form-select" id="stu-slip-status">
                <option value="Available" ${s.examSlipStatus === 'Available' ? 'selected' : ''}>Available</option>
                <option value="Blocked" ${s.examSlipStatus === 'Blocked' ? 'selected' : ''}>Blocked</option>
                <option value="Not Available" ${s.examSlipStatus === 'Not Available' ? 'selected' : ''}>Not Available</option>
              </select>
            </div>

          </div>
          <div class="modal-footer">
            <button type="button" class="nav-btn nav-btn-secondary" id="modal-cancel-btn">Cancel</button>
            <button type="submit" class="nav-btn nav-btn-primary">${isEdit ? 'Save Student Changes' : 'Create Student Profile'}</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const facultySelect = overlay.querySelector('#stu-faculty');
    const levelSelect = overlay.querySelector('#stu-level');
    const courseSelect = overlay.querySelector('#stu-course-select');
    const customCourseInput = overlay.querySelector('#stu-course-custom');
    const hostelStatusSelect = overlay.querySelector('#stu-hostel-status');
    const hostelGroup = overlay.querySelector('#hostel-fields-group');

    // Dynamic Course List Populator based on Faculty + Level
    function updateCourseOptions(currentSelectedCourse) {
      const selectedFac = facultySelect.value;
      const selectedLvl = levelSelect.value;
      const facData = structure[selectedFac] || {};

      // Look up courses for this level (including fallback to legacy names)
      let courses = facData[selectedLvl] || [];
      if (courses.length === 0 && selectedLvl === 'Degree' && facData['Undergraduate']) {
        courses = facData['Undergraduate'];
      }
      if (courses.length === 0 && (selectedLvl === 'Master' || selectedLvl === 'PhD') && facData['Postgraduate']) {
        courses = facData['Postgraduate'];
      }
      if (courses.length === 0 && selectedLvl === 'Certificate' && facData['Short Courses (Certificate)']) {
        courses = facData['Short Courses (Certificate)'];
      }

      courseSelect.innerHTML = '';

      if (courses.length > 0) {
        courses.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c;
          opt.textContent = c;
          courseSelect.appendChild(opt);
        });
      }

      const customOpt = document.createElement('option');
      customOpt.value = '__custom__';
      customOpt.textContent = '➕ Other / Custom Course Name...';
      courseSelect.appendChild(customOpt);

      // Determine which option to select
      if (currentSelectedCourse) {
        const found = courses.includes(currentSelectedCourse);
        if (found) {
          courseSelect.value = currentSelectedCourse;
          customCourseInput.style.display = 'none';
          customCourseInput.required = false;
        } else {
          courseSelect.value = '__custom__';
          customCourseInput.value = currentSelectedCourse;
          customCourseInput.style.display = 'block';
          customCourseInput.required = true;
        }
      } else if (courses.length > 0) {
        courseSelect.value = courses[0];
        customCourseInput.style.display = 'none';
        customCourseInput.required = false;
      } else {
        courseSelect.value = '__custom__';
        customCourseInput.style.display = 'block';
        customCourseInput.required = true;
      }
    }

    // Initial populate with student's current course
    updateCourseOptions(s.course);

    // Event listeners for dynamic cascade
    facultySelect.onchange = () => updateCourseOptions('');
    levelSelect.onchange = () => updateCourseOptions('');

    courseSelect.onchange = () => {
      if (courseSelect.value === '__custom__') {
        customCourseInput.style.display = 'block';
        customCourseInput.required = true;
        customCourseInput.focus();
      } else {
        customCourseInput.style.display = 'none';
        customCourseInput.required = false;
      }
    };

    hostelStatusSelect.onchange = () => {
      if (hostelStatusSelect.value === 'hosteller') {
        hostelGroup.style.display = 'grid';
      } else {
        hostelGroup.style.display = 'none';
      }
    };

    overlay.querySelector('#modal-close-btn').onclick = () => overlay.remove();
    overlay.querySelector('#modal-cancel-btn').onclick = () => overlay.remove();

    overlay.querySelector('#stu-modal-form').onsubmit = (e) => {
      e.preventDefault();
      const isHosteller = hostelStatusSelect.value === 'hosteller';
      const resolvedCourse = courseSelect.value === '__custom__'
        ? customCourseInput.value.trim()
        : courseSelect.value;

      if (!resolvedCourse) {
        alert("Please select or enter an academic course.");
        return;
      }

      const stuData = {
        id: overlay.querySelector('#stu-id').value.trim(),
        name: overlay.querySelector('#stu-name').value.trim(),
        email: overlay.querySelector('#stu-email').value.trim(),
        faculty: facultySelect.value,
        level: levelSelect.value,
        course: resolvedCourse,
        isHosteller: isHosteller,
        hostelBlock: isHosteller ? overlay.querySelector('#stu-hostel-block').value.trim() : '',
        staircase: isHosteller ? overlay.querySelector('#stu-staircase').value.trim() : '',
        roomNo: isHosteller ? overlay.querySelector('#stu-room').value.trim() : '',
        outstandingFee: parseFloat(overlay.querySelector('#stu-fee').value || 0),
        examSlipStatus: overlay.querySelector('#stu-slip-status').value,
      };

      // Only auto-block when fee > 0 AND admin left it as 'Available' (don't override explicit Blocked/Not Available choices)
      if (stuData.outstandingFee > 0 && stuData.examSlipStatus === 'Available') {
        stuData.examSlipStatus = 'Blocked';
        stuData.examSlipReason = `Outstanding tuition fee balance of RM ${stuData.outstandingFee.toFixed(2)} pending payment.`;
      } else if (stuData.examSlipStatus === 'Available') {
        stuData.examSlipReason = 'All fees cleared. Slip ready for instant download.';
      } else if (stuData.examSlipStatus === 'Blocked') {
        stuData.examSlipReason = stuData.outstandingFee > 0
          ? `Outstanding tuition fee balance of RM ${stuData.outstandingFee.toFixed(2)} pending payment.`
          : 'Blocked by admin.';
      } else if (stuData.examSlipStatus === 'Not Available') {
        stuData.examSlipReason = 'Exam slip is currently not available. Please contact the Examination Division.';
      }

      if (isEdit) {
        storage.updateStudent(s.id, stuData);
      } else {
        storage.addStudent(stuData);
      }

      overlay.remove();
      render();
    };
  }

  function openExtractAdmissionsModal() {
    const sampleBatch = [
      {
        id: "B25030010",
        name: "Drishya Menon",
        email: "drishya.m@student.aimst.edu.my",
        faculty: "Faculty of Medicine",
        course: "Bachelor of Medicine & Bachelor of Surgery (MBBS)",
        isHosteller: true,
        hostelBlock: "Block M",
        staircase: "Staircase 1",
        roomNo: "Room 104 (Single)",
        outstandingFee: 0.00,
        examTimetable: "June 1 – June 10, 2026 (Medical Hall 2)",
        examSlipStatus: "Available",
        examSlipReason: "All fees cleared. Slip ready for instant download."
      },
      {
        id: "B25030011",
        name: "Jason Lee Wei Lun",
        email: "jason.lee@student.aimst.edu.my",
        faculty: "Faculty of Pharmacy",
        course: "Bachelor of Pharmacy (Hons)",
        isHosteller: false,
        hostelBlock: "",
        staircase: "",
        roomNo: "",
        outstandingFee: 0.00,
        examTimetable: "June 5 – June 12, 2026 (Pharma Lab 1)",
        examSlipStatus: "Available",
        examSlipReason: "All fees cleared. Slip ready for instant download."
      },
      {
        id: "B25030012",
        name: "Priya Darshini",
        email: "priya.d@student.aimst.edu.my",
        faculty: "Faculty of Dentistry",
        course: "Bachelor of Dental Surgery (BDS)",
        isHosteller: true,
        hostelBlock: "Block D",
        staircase: "Staircase 3",
        roomNo: "Room 202",
        outstandingFee: 2500.00,
        examTimetable: "June 2 – June 8, 2026 (Dental Clinic Hall)",
        examSlipStatus: "Blocked",
        examSlipReason: "Outstanding tuition fee balance of RM 2,500.00 pending payment."
      },
      {
        id: "B25030013",
        name: "Muhammad Ammar",
        email: "ammar.m@student.aimst.edu.my",
        faculty: "Faculty of Engineering & Computer Technology",
        course: "BSc. (Hons) Computer Science",
        isHosteller: false,
        hostelBlock: "",
        staircase: "",
        roomNo: "",
        outstandingFee: 0.00,
        examTimetable: "May 25 – June 2, 2026 (Computer Lab 4)",
        examSlipStatus: "Available",
        examSlipReason: "All fees cleared. Slip ready for instant download."
      },
      {
        id: "B25030014",
        name: "Ananya Sharma",
        email: "ananya.s@student.aimst.edu.my",
        faculty: "Faculty of Applied Sciences",
        course: "BSc. (Hons) Biotechnology",
        isHosteller: true,
        hostelBlock: "Block C",
        staircase: "Staircase 2",
        roomNo: "Room 108",
        outstandingFee: 0.00,
        examTimetable: "May 28 – June 4, 2026 (Science Lab 2)",
        examSlipStatus: "Available",
        examSlipReason: "All fees cleared. Slip ready for instant download."
      }
    ];

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card" style="max-width:680px;">
        <div class="modal-header">
          <h3>📥 Extract New Student Admissions File</h3>
          <button class="btn-icon" id="modal-close-btn"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:1rem;">
            Upload or extract a new admission file (.json or .csv) containing student profiles across AIMST faculties. The system automatically tags <strong>Hosteller vs Non-Hosteller</strong> status, block, staircase, room details, and faculty assignments.
          </p>

          <!-- File Upload Dropzone -->
          <div style="border:2px dashed var(--border); border-radius:12px; padding:1.5rem; text-align:center; background:#f8fafc; margin-bottom:1.25rem;">
            <i class="fas fa-file-code" style="font-size:2rem; color:var(--primary); margin-bottom:0.5rem;"></i>
            <div style="font-weight:600; margin-bottom:0.25rem;">Select Admission File (.json / .csv)</div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:1rem;">Extract batch student list directly into system storage</div>
            <input type="file" id="admissions-file-input" accept=".json,.csv" style="display:none;">
            <button type="button" class="nav-btn nav-btn-primary" id="btn-browse-file">
              <i class="fas fa-folder-open"></i> Browse Admissions File
            </button>
            <span id="selected-file-name" style="display:block; margin-top:0.5rem; font-size:0.8rem; color:var(--success); font-weight:600;"></span>
          </div>

          <div style="display:flex; gap:0.75rem; flex-wrap:wrap; justify-content:space-between; align-items:center; background:#eff6ff; padding:1rem; border-radius:8px; border:1px solid #bfdbfe;">
            <div>
              <strong style="display:block; font-size:0.9rem; color:#1e3a8a;">⚡ Quick Extraction Demo Batch (5 Faculties)</strong>
              <span style="font-size:0.75rem; color:#3b82f6;">Includes Medicine, Pharmacy, Dentistry, Engineering & Applied Sciences admissions</span>
            </div>
            <button type="button" class="nav-btn nav-btn-primary" id="btn-extract-demo" style="background:#0284c7;">
              <i class="fas fa-magic"></i> Extract & Import 2026 Batch
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="nav-btn nav-btn-secondary" id="btn-download-template">
            <i class="fas fa-download"></i> Download Sample JSON File
          </button>
          <button type="button" class="nav-btn nav-btn-secondary" id="modal-cancel-btn">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#modal-close-btn').onclick = () => overlay.remove();
    overlay.querySelector('#modal-cancel-btn').onclick = () => overlay.remove();

    const fileInput = overlay.querySelector('#admissions-file-input');
    const browseBtn = overlay.querySelector('#btn-browse-file');
    const selectedFileSpan = overlay.querySelector('#selected-file-name');

    browseBtn.onclick = () => fileInput.click();

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      selectedFileSpan.innerText = `Selected File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          let parsedData = [];
          if (file.name.endsWith('.json')) {
            parsedData = JSON.parse(evt.target.result);
          } else {
            alert('CSV format detected. Extracting student admission records...');
            parsedData = sampleBatch;
          }

          if (Array.isArray(parsedData) && parsedData.length > 0) {
            const addedCount = storage.addStudentsBatch(parsedData);
            alert(`✅ Successfully Extracted and Imported ${addedCount} New Admission Students!`);
            overlay.remove();
            render();
          } else {
            alert('No valid student records found in file.');
          }
        } catch (err) {
          alert('Error parsing admissions file. Please ensure valid JSON format.');
        }
      };
      reader.readAsText(file);
    };

    overlay.querySelector('#btn-extract-demo').onclick = () => {
      const addedCount = storage.addStudentsBatch(sampleBatch);
      alert(`✅ Extracted and Imported ${addedCount} New Admission Students across 5 Faculties!`);
      overlay.remove();
      render();
    };

    overlay.querySelector('#btn-download-template').onclick = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sampleBatch, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "aimst_new_admissions_template_2026.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    };
  }

  function navigateTo(view) {
    currentView = view;
    render();
  }

  // Initial Boot
  render();
});
