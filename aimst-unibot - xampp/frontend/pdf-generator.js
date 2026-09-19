/* ==========================================================================
   AIMST UniBot Support System - Printable Exam Slip Generator
   ========================================================================== */

function openExamSlipModal(matric) {
  const student = window.uniBotEngine.getStudent(matric);
  if (!student) return;

  const modal = document.getElementById('examSlipModal');
  const container = document.getElementById('examSlipContent');

  let courseRows = student.examTimetable.map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>${item.code}</strong></td>
      <td>${item.title}</td>
      <td>${item.date} (${item.time})</td>
      <td>${item.venue}</td>
      <td style="color:#047857; font-weight:bold;">CLEAR / ELIGIBLE</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="exam-slip-document" id="printableExamSlip">
      <div class="slip-header">
        <img src="assets/aimst_logo.png" alt="AIMST Logo" class="slip-header-logo">
        <div class="slip-title-box">
          <h2>AIMST UNIVERSITY</h2>
          <h3>OFFICIAL EXAMINATION HALL ADMISSION SLIP</h3>
          <p style="font-size:0.8rem; color:#64748b;">Academic Year 2025/2026 - Main Examination Session</p>
        </div>
        <div style="text-align:right;">
          <span style="background:#dcfce7; color:#166534; padding:0.25rem 0.6rem; border-radius:4px; font-weight:bold; font-size:0.75rem;">VERIFIED PASS</span>
        </div>
      </div>

      <div class="slip-grid">
        <div class="slip-student-info">
          <table>
            <tr>
              <td style="width:120px; font-weight:bold; color:#475569;">Student Name:</td>
              <td><strong>${student.name}</strong></td>
            </tr>
            <tr>
              <td style="font-weight:bold; color:#475569;">Matric Number:</td>
              <td><code>${student.matric}</code></td>
            </tr>
            <tr>
              <td style="font-weight:bold; color:#475569;">Faculty:</td>
              <td>${student.faculty}</td>
            </tr>
            <tr>
              <td style="font-weight:bold; color:#475569;">Programme:</td>
              <td>${student.program}</td>
            </tr>
            <tr>
              <td style="font-weight:bold; color:#475569;">Assigned Hostel:</td>
              <td>${student.hostel}</td>
            </tr>
            <tr>
              <td style="font-weight:bold; color:#475569;">Fee Status:</td>
              <td><span style="color:#166534; font-weight:bold;">RM 0.00 OUTSTANDING (PAID IN FULL)</span></td>
            </tr>
          </table>
        </div>

        <div>
          <img src="${student.avatar}" alt="Student Photo" class="slip-student-photo">
        </div>
      </div>

      <h4 style="margin-bottom:0.5rem; color:#064e3b; border-bottom:1px solid #cbd5e1; padding-bottom:0.25rem;">REGISTERED EXAMINATION PAPERS</h4>
      
      <table class="slip-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Code</th>
            <th>Subject Name</th>
            <th>Schedule</th>
            <th>Venue</th>
            <th>Eligibility</th>
          </tr>
        </thead>
        <tbody>
          ${courseRows}
        </tbody>
      </table>

      <div class="slip-footer">
        <div>
          <p style="font-size:0.75rem; color:#64748b;">System Verification Signature & Barcode:</p>
          <div class="barcode-placeholder">|||| ||| ||||||| ||| |||| ${student.matric}</div>
          <p style="font-size:0.7rem; color:#94a3b8; margin-top:4px;">Generated automatically via AIMST UniBot Support Engine</p>
        </div>
        <div class="official-stamp">
          AIMST EXAM BOARD<br>OFFICIALLY CLEARED
        </div>
      </div>
    </div>

    <div style="display:flex; justify-content:flex-end; gap:1rem; margin-top:1.5rem;">
      <button class="btn-secondary" onclick="closeExamSlipModal()">Close</button>
      <button class="btn-gold" onclick="printExamSlipDocument()">🖨️ Print / Download PDF Slip</button>
    </div>
  `;

  modal.classList.add('open');
}

function closeExamSlipModal() {
  document.getElementById('examSlipModal').classList.remove('open');
}

function printExamSlipDocument() {
  const printContent = document.getElementById('printableExamSlip').outerHTML;
  const originalBody = document.body.innerHTML;

  const printWindow = window.open('', '', 'height=800,width=900');
  printWindow.document.write('<html><head><title>AIMST Official Hall Slip - ' + (window.currentStudentMatric || 'Slip') + '</title>');
  printWindow.document.write('<style>');
  printWindow.document.write(`
    body { font-family: 'Inter', sans-serif; padding: 20px; color: #1e293b; }
    .exam-slip-document { border: 2px solid #064e3b; padding: 2rem; border-radius: 12px; }
    .slip-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px double #064e3b; padding-bottom: 1rem; margin-bottom: 1.5rem; }
    .slip-header-logo { width: 60px; height: 60px; }
    .slip-title-box { text-align: center; }
    .slip-title-box h2 { color: #064e3b; margin: 0; }
    .slip-title-box h3 { color: #d97706; margin: 5px 0 0 0; }
    .slip-grid { display: grid; grid-template-columns: 1fr 130px; gap: 1rem; margin-bottom: 1rem; }
    .slip-student-info table { width: 100%; border-collapse: collapse; }
    .slip-student-info td { padding: 4px; font-size: 13px; }
    .slip-student-photo { width: 110px; height: 130px; border: 2px solid #064e3b; border-radius: 6px; object-fit: cover; }
    .slip-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .slip-table th, .slip-table td { border: 1px solid #cbd5e1; padding: 8px; font-size: 12px; text-align: left; }
    .slip-table th { background: #f1f5f9; }
    .slip-footer { display: flex; align-items: flex-end; justify-content: space-between; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    .official-stamp { border: 2px dashed #047857; color: #047857; padding: 8px 15px; font-weight: bold; font-size: 12px; transform: rotate(-3deg); }
    .barcode-placeholder { font-family: monospace; font-size: 16px; font-weight: bold; letter-spacing: 4px; }
  `);
  printWindow.document.write('</style></head><body>');
  printWindow.document.write(printContent);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}
