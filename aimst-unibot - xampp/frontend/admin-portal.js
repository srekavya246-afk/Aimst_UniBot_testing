/* ==========================================================================
   AIMST UniBot Support System - Admin Portal Logic
   ========================================================================== */

function renderAdminPortal() {
  renderAdminStats();
  renderKnowledgeBaseTable();
  renderStudentProfilesTable();
  renderChatLogsTable();
  renderFeedbackAnalytics();
}

function renderAdminStats() {
  const engine = window.uniBotEngine;
  document.getElementById('statTotalQueries').innerText = engine.chatLogs.length;

  // Calculate average rating
  if (engine.feedbackList.length > 0) {
    const sum = engine.feedbackList.reduce((acc, curr) => acc + curr.stars, 0);
    const avg = (sum / engine.feedbackList.length).toFixed(1);
    document.getElementById('statSatisfaction').innerText = avg + " / 5.0";
  } else {
    document.getElementById('statSatisfaction').innerText = "4.9 / 5.0";
  }

  // Count blocked slips
  let blockedCount = 0;
  Object.values(engine.students).forEach(s => {
    if (s.tuitionBalance > 0) blockedCount++;
  });
  document.getElementById('statBlockedSlips').innerText = blockedCount;
  document.getElementById('statActiveStudents').innerText = Object.keys(engine.students).length;
}

/* 1. Knowledge Base CRUD */
function renderKnowledgeBaseTable() {
  const kbList = window.uniBotEngine.knowledgeBase;
  const tbody = document.getElementById('kbTableBody');
  if (!tbody) return;

  tbody.innerHTML = kbList.map(item => `
    <tr>
      <td><code>${item.id}</code></td>
      <td><span class="category-badge">${item.category}</span></td>
      <td>${item.keywords.map(k => `<span class="suggestion-pill" style="font-size:0.75rem; padding:0.15rem 0.4rem;">${k}</span>`).join(' ')}</td>
      <td><small>${item.responseTemplate}</small></td>
      <td>
        <button class="btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.75rem;" onclick="deleteKBItem('${item.id}')">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

function openAddKBModal() {
  document.getElementById('addKbModal').classList.add('open');
}

function closeAddKBModal() {
  document.getElementById('addKbModal').classList.remove('open');
}

function submitNewKBItem(event) {
  event.preventDefault();
  const category = document.getElementById('kbCategoryInput').value;
  const keywordsStr = document.getElementById('kbKeywordsInput').value;
  const content = document.getElementById('kbContentInput').value;

  const newId = "kb-custom-" + Date.now();
  const keywordsArr = keywordsStr.split(',').map(k => k.trim()).filter(k => k.length > 0);

  window.uniBotEngine.knowledgeBase.push({
    id: newId,
    category: category,
    keywords: keywordsArr,
    responseTemplate: "custom_faq",
    customContent: content
  });

  window.uniBotEngine.saveState();
  closeAddKBModal();
  renderKnowledgeBaseTable();
  alert("✅ New Knowledge Base entry added successfully!");
}

function deleteKBItem(id) {
  if (confirm("Are you sure you want to delete this FAQ entry?")) {
    window.uniBotEngine.knowledgeBase = window.uniBotEngine.knowledgeBase.filter(item => item.id !== id);
    window.uniBotEngine.saveState();
    renderKnowledgeBaseTable();
  }
}

/* 2. Student Profiles Database & Live Fee Balance Override */
function renderStudentProfilesTable() {
  const students = window.uniBotEngine.students;
  const tbody = document.getElementById('studentTableBody');
  if (!tbody) return;

  tbody.innerHTML = Object.values(students).map(st => {
    const isBlocked = st.tuitionBalance > 0;
    const badge = isBlocked 
      ? `<span class="status-badge blocked">BLOCKED (RM ${st.tuitionBalance.toLocaleString('en-US', {minimumFractionDigits:2})})</span>` 
      : `<span class="status-badge unlocked">UNLOCKED (RM 0.00)</span>`;

    return `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <img src="${st.avatar}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
            <strong>${st.name}</strong>
          </div>
        </td>
        <td><code>${st.matric}</code></td>
        <td><small>${st.faculty}</small></td>
        <td>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <strong>RM ${st.tuitionBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}</strong>
            <button class="btn-gold" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="openEditBalanceModal('${st.matric}')">
              ✏️ Edit Fee
            </button>
          </div>
        </td>
        <td>${st.hostel}</td>
        <td>${badge}</td>
      </tr>
    `;
  }).join('');
}

function openEditBalanceModal(matric) {
  const student = window.uniBotEngine.getStudent(matric);
  if (!student) return;

  document.getElementById('editMatricInput').value = student.matric;
  document.getElementById('editStudentName').innerText = student.name + " (" + student.matric + ")";
  document.getElementById('editBalanceInput').value = student.tuitionBalance;
  document.getElementById('editBalanceModal').classList.add('open');
}

function closeEditBalanceModal() {
  document.getElementById('editBalanceModal').classList.remove('open');
}

function submitBalanceUpdate(event) {
  event.preventDefault();
  const matric = document.getElementById('editMatricInput').value;
  const newBal = parseFloat(document.getElementById('editBalanceInput').value);

  window.uniBotEngine.updateStudentBalance(matric, newBal);
  closeEditBalanceModal();
  renderAdminPortal();

  // Dispatch global custom event for live student view update!
  window.dispatchEvent(new CustomEvent('aimst_balance_updated', { detail: { matric, newBal } }));

  alert(`✅ Fee Balance for ${matric} updated to RM ${newBal.toLocaleString('en-US', {minimumFractionDigits: 2})}!\nIf student is currently asking about Exam Slips, their status is now dynamically updated.`);
}

/* 3. Chat History & Transcript Logs */
function renderChatLogsTable() {
  const logs = window.uniBotEngine.chatLogs;
  const tbody = document.getElementById('chatLogsTableBody');
  if (!tbody) return;

  if (logs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No chat transcripts recorded yet. Ask UniBot a question to generate logs!</td></tr>`;
    return;
  }

  tbody.innerHTML = logs.slice().reverse().map(log => `
    <tr>
      <td><small>${log.timestamp}</small></td>
      <td><code>${log.matric}</code></td>
      <td>${window.uniBotEngine.escapeHTML(log.query)}</td>
      <td><span class="status-badge unlocked" style="font-size:0.7rem;">PROCESSED</span></td>
    </tr>
  `).join('');
}

/* 4. Feedback & Ratings Analytics */
function renderFeedbackAnalytics() {
  const feedbacks = window.uniBotEngine.feedbackList;
  const container = document.getElementById('feedbackListContainer');
  if (!container) return;

  if (feedbacks.length === 0) {
    container.innerHTML = `
      <div class="formatted-card" style="text-align:center;">
        <p style="color:var(--text-muted);">Default Demo Ratings System active. Submitting a 5-star rating in the chat will record live analytics here.</p>
        <div style="font-size:1.5rem; color:var(--accent-gold); margin-top:0.5rem;">⭐⭐⭐⭐⭐ 4.9/5.0</div>
      </div>
    `;
    return;
  }

  container.innerHTML = feedbacks.slice().reverse().map(fb => `
    <div class="formatted-card" style="margin-bottom:0.75rem;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong>Student ${fb.matric}</strong>
        <span style="color:var(--accent-gold); font-size:1.1rem;">${"⭐".repeat(fb.stars)}</span>
      </div>
      <p style="font-size:0.88rem; color:var(--text-muted); margin-top:0.3rem;">"${window.uniBotEngine.escapeHTML(fb.comment || "No comment provided.")}"</p>
      <small style="color:var(--text-dim);">${fb.timestamp}</small>
    </div>
  `).join('');
}

// Switch Admin Portal Sub-Tabs
function switchAdminTab(tabName) {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));

  document.getElementById(`tabBtn-${tabName}`).classList.add('active');
  document.getElementById(`tabContent-${tabName}`).classList.add('active');
}
