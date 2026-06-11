/**
 * CustomerCentral Module — Support Hub
 * ======================================
 * Lives in this external repo. Zero changes to CustomerCentral needed.
 *
 * Deploy: Settings → Add Custom Page → GitHub URL → paste raw URL of this file
 *
 * Features:
 *   - View all customer support cases with status + priority
 *   - Click a case to read the full message thread
 *   - Reply to an existing case
 *   - Submit a brand new case with type selection
 *
 * Uses existing Suitelet endpoints (no backend changes):
 *   GET  action=cases&customerid=X
 *   GET  action=case&caseid=X
 *   GET  action=casetypes
 *   POST action=case&customerid=X
 *   POST action=casemessage&caseid=X
 */

(() => {
  const { endpoint, customerId } = window.ccPortal;
  const container = document.getElementById('cc-custom-container');

  // ── Inject styles ─────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #cc-sh * { box-sizing: border-box; margin: 0; padding: 0; font-family: inherit; }
    #cc-sh { color: #202124; }
    #cc-sh .view { display: none; }
    #cc-sh .view.active { display: block; }
    #cc-sh .pg-hdr { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
    #cc-sh .pg-title { font-size: 20px; font-weight: 600; flex: 1; }
    #cc-sh .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; font-family: inherit; transition: opacity 0.15s; }
    #cc-sh .btn:hover { opacity: 0.85; }
    #cc-sh .btn-primary { background: #1a73e8; color: #fff; }
    #cc-sh .btn-ghost   { background: #fff; color: #5f6368; border: 1px solid #e0e0e0; }
    #cc-sh .btn-success { background: #1e7e34; color: #fff; }
    #cc-sh .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    #cc-sh .card { background: #fff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
    #cc-sh .card-head { padding: 14px 20px; border-bottom: 1px solid #f1f3f4; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
    #cc-sh .case-row { display: flex; align-items: flex-start; gap: 14px; padding: 16px 20px; border-bottom: 1px solid #f8f9fa; cursor: pointer; transition: background 0.1s; }
    #cc-sh .case-row:last-child { border-bottom: none; }
    #cc-sh .case-row:hover { background: #f8f9fa; }
    #cc-sh .case-num { font-size: 12px; font-weight: 600; color: #1a73e8; white-space: nowrap; }
    #cc-sh .case-title { font-size: 14px; font-weight: 500; }
    #cc-sh .case-meta { font-size: 12px; color: #80868b; margin-top: 4px; display: flex; gap: 12px; flex-wrap: wrap; }
    #cc-sh .case-arrow { margin-left: auto; color: #bdbdbd; font-size: 18px; align-self: center; }
    #cc-sh .msg-badge { background: #e8f0fe; color: #1557b0; border-radius: 10px; padding: 1px 7px; font-size: 11px; font-weight: 600; }
    #cc-sh .chip { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; }
    #cc-sh .chip-open   { background: #e8f0fe; color: #1557b0; }
    #cc-sh .chip-closed { background: #f1f3f4; color: #5f6368; }
    #cc-sh .chip-hi  { background: #fce8e6; color: #c62828; }
    #cc-sh .chip-med { background: #fff3e0; color: #e65100; }
    #cc-sh .chip-low { background: #e6f4ea; color: #1e7e34; }
    #cc-sh .chip-gray { background: #f1f3f4; color: #5f6368; }
    #cc-sh .thread { display: flex; flex-direction: column; gap: 12px; padding: 20px; }
    #cc-sh .msg { max-width: 72%; padding: 12px 16px; border-radius: 12px; font-size: 13px; line-height: 1.55; }
    #cc-sh .msg.inbound  { background: #f8f9fa; border-bottom-left-radius: 4px; align-self: flex-start; }
    #cc-sh .msg.outbound { background: #e8f0fe; color: #1a1a2e; border-bottom-right-radius: 4px; align-self: flex-end; }
    #cc-sh .msg-author { font-size: 11px; font-weight: 600; margin-bottom: 4px; color: #5f6368; }
    #cc-sh .msg-date   { font-size: 11px; color: #bdbdbd; margin-top: 6px; text-align: right; }
    #cc-sh .reply-box { padding: 16px 20px; border-top: 1px solid #f1f3f4; display: flex; gap: 10px; align-items: flex-end; }
    #cc-sh textarea { flex: 1; border: 1px solid #e0e0e0; border-radius: 8px; padding: 10px 12px; font-size: 13px; font-family: inherit; resize: none; outline: none; min-height: 80px; line-height: 1.5; }
    #cc-sh textarea:focus { border-color: #1a73e8; }
    #cc-sh .form-grid { display: flex; flex-direction: column; gap: 14px; padding: 20px; }
    #cc-sh label { font-size: 12px; font-weight: 600; color: #5f6368; display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px; }
    #cc-sh input[type=text], #cc-sh select, #cc-sh .form-grid textarea { width: 100%; border: 1px solid #e0e0e0; border-radius: 8px; padding: 9px 12px; font-size: 13px; font-family: inherit; outline: none; background: #fff; }
    #cc-sh input[type=text]:focus, #cc-sh select:focus, #cc-sh .form-grid textarea:focus { border-color: #1a73e8; }
    #cc-sh .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media(max-width:600px) { #cc-sh .form-row { grid-template-columns: 1fr; } }
    #cc-sh .form-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 4px; }
    #cc-sh .loading { text-align: center; padding: 48px; color: #80868b; }
    #cc-sh .spinner { display: inline-block; width: 24px; height: 24px; border: 3px solid #e0e0e0; border-top-color: #1a73e8; border-radius: 50%; animation: cc-sh-spin 0.7s linear infinite; }
    @keyframes cc-sh-spin { to { transform: rotate(360deg); } }
    #cc-sh .empty { text-align: center; padding: 40px; color: #80868b; font-size: 13px; }
    #cc-sh .err   { padding: 14px 20px; color: #c62828; font-size: 13px; }
    #cc-sh .toast { position: fixed; bottom: 24px; right: 24px; z-index: 9999; background: #202124; color: #fff; border-radius: 8px; padding: 12px 20px; font-size: 13px; font-family: inherit; box-shadow: 0 4px 12px rgba(0,0,0,0.2); animation: cc-sh-fadein 0.2s ease; }
    @keyframes cc-sh-fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; } }
    #cc-sh .back-btn { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: #1a73e8; cursor: pointer; background: none; border: none; padding: 0; font-family: inherit; margin-bottom: 16px; }
    #cc-sh .back-btn:hover { text-decoration: underline; }
    #cc-sh .detail-meta { display: flex; flex-wrap: wrap; gap: 10px; padding: 14px 20px; border-bottom: 1px solid #f1f3f4; font-size: 12px; color: #5f6368; align-items: center; }
  `;
  document.head.appendChild(style);

  // ── Render skeleton ───────────────────────────────────────────────────────
  container.innerHTML = `
    <div id="cc-sh">
      <div id="cc-sh-list" class="view active">
        <div class="pg-hdr">
          <div class="pg-title">🎧 Support Hub</div>
          <button class="btn btn-primary" onclick="window._ccSh.showNew()">+ New Case</button>
        </div>
        <div class="card">
          <div class="card-head">
            Open Cases
            <span id="cc-sh-count" style="font-size:12px;font-weight:400;color:#80868b;margin-left:4px"></span>
            <button class="btn btn-ghost" style="margin-left:auto;padding:5px 12px;font-size:12px" onclick="window._ccSh.loadCases()">↺ Refresh</button>
          </div>
          <div id="cc-sh-list-body"><div class="loading"><div class="spinner"></div><br/><br/>Loading cases...</div></div>
        </div>
      </div>

      <div id="cc-sh-detail" class="view">
        <button class="back-btn" onclick="window._ccSh.showList()">← Back to cases</button>
        <div class="card">
          <div class="card-head" id="cc-sh-detail-title">Case</div>
          <div class="detail-meta" id="cc-sh-detail-meta"></div>
          <div class="thread" id="cc-sh-thread"><div class="loading"><div class="spinner"></div></div></div>
          <div class="reply-box">
            <textarea id="cc-sh-reply-text" placeholder="Type your reply..." rows="3"></textarea>
            <button class="btn btn-primary" id="cc-sh-reply-btn" onclick="window._ccSh.sendReply()">Send</button>
          </div>
        </div>
      </div>

      <div id="cc-sh-new" class="view">
        <button class="back-btn" onclick="window._ccSh.showList()">← Back to cases</button>
        <div class="card">
          <div class="card-head">📝 Submit New Case</div>
          <div class="form-grid">
            <div>
              <label>Subject *</label>
              <input type="text" id="cc-sh-title" placeholder="Briefly describe the issue" />
            </div>
            <div class="form-row">
              <div>
                <label>Case Type</label>
                <select id="cc-sh-casetype"><option value="">— Select type —</option></select>
              </div>
              <div>
                <label>Contact Email</label>
                <input type="text" id="cc-sh-email" placeholder="your@email.com" />
              </div>
            </div>
            <div>
              <label>Message *</label>
              <textarea id="cc-sh-message" rows="5" placeholder="Describe the issue in detail..."></textarea>
            </div>
            <div class="form-actions">
              <button class="btn btn-ghost" onclick="window._ccSh.showList()">Cancel</button>
              <button class="btn btn-success" id="cc-sh-submit-btn" onclick="window._ccSh.submitCase()">Submit Case</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // ── Helpers ───────────────────────────────────────────────────────────────
  let currentCaseId = null;

  const fmtDate = d => {
    if (!d) return '';
    const [y, m, day] = String(d).slice(0, 10).split('-');
    return `${m}/${day}/${y}`;
  };

  const statusChip = s => {
    const v = (s || '').toLowerCase();
    if (v.includes('closed') || v.includes('resolved'))
      return `<span class="chip chip-closed">${s}</span>`;
    return `<span class="chip chip-open">${s || 'Open'}</span>`;
  };

  const priorityChip = p => {
    const v = (p || '').toLowerCase();
    if (v.includes('high') || v.includes('urgent') || v.includes('critical'))
      return `<span class="chip chip-hi">${p}</span>`;
    if (v.includes('medium') || v.includes('normal'))
      return `<span class="chip chip-med">${p}</span>`;
    if (v.includes('low'))
      return `<span class="chip chip-low">${p}</span>`;
    return p ? `<span class="chip chip-gray">${p}</span>` : '';
  };

  const toast = msg => {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  };

  const show = id => {
    document.querySelectorAll('#cc-sh .view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  };

  // ── Load cases ────────────────────────────────────────────────────────────
  const loadCases = async () => {
    show('cc-sh-list');
    document.getElementById('cc-sh-list-body').innerHTML =
      `<div class="loading"><div class="spinner"></div><br/><br/>Loading cases...</div>`;
    try {
      const res   = await fetch(`${endpoint}&action=cases&customerid=${customerId}`);
      const cases = await res.json();
      document.getElementById('cc-sh-count').textContent = `(${cases.length || 0})`;
      if (!cases.length) {
        document.getElementById('cc-sh-list-body').innerHTML =
          `<div class="empty">No support cases found.<br/>Click <strong>+ New Case</strong> to submit one.</div>`;
        return;
      }
      document.getElementById('cc-sh-list-body').innerHTML = cases.map(c => `
        <div class="case-row" onclick="window._ccSh.openCase(${c.id})">
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px">
              <span class="case-num">#${c.casenumber || c.id}</span>
              ${statusChip(c.status)} ${priorityChip(c.priority)}
            </div>
            <div class="case-title">${c.title || '(No subject)'}</div>
            <div class="case-meta">
              <span>📅 ${fmtDate(c.datecreated)}</span>
              ${c.messagecount > 0 ? `<span class="msg-badge">💬 ${c.messagecount}</span>` : ''}
            </div>
          </div>
          <div class="case-arrow">›</div>
        </div>`).join('');
    } catch (e) {
      document.getElementById('cc-sh-list-body').innerHTML =
        `<div class="err">Failed to load: ${e.message}</div>`;
    }
  };

  // ── Case detail ───────────────────────────────────────────────────────────
  const openCase = async id => {
    currentCaseId = id;
    show('cc-sh-detail');
    document.getElementById('cc-sh-thread').innerHTML =
      `<div class="loading"><div class="spinner"></div></div>`;
    try {
      const res  = await fetch(`${endpoint}&action=case&caseid=${id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      document.getElementById('cc-sh-detail-title').textContent = `#${id} — ${data.title || ''}`;
      document.getElementById('cc-sh-detail-meta').innerHTML =
        `${statusChip(data.status)} ${priorityChip(data.priority)}
         <span>📅 Opened ${fmtDate(data.createddate)}</span>
         ${data.email ? `<span>✉ ${data.email}</span>` : ''}`;
      const msgs = data.messages || [];
      document.getElementById('cc-sh-thread').innerHTML = msgs.length
        ? msgs.map(m => `
            <div class="msg ${m.incoming === 'T' || m.incoming === true ? 'inbound' : 'outbound'}">
              <div class="msg-author">${m.author || 'Support'}</div>
              <div>${(m.message || '').replace(/\n/g, '<br/>')}</div>
              <div class="msg-date">${(m.messagedate || '').slice(0, 16).replace('T', ' ')}</div>
            </div>`).join('')
        : `<div class="empty" style="padding:24px">No messages yet.</div>`;
    } catch (e) {
      document.getElementById('cc-sh-thread').innerHTML =
        `<div class="err">Failed to load: ${e.message}</div>`;
    }
  };

  // ── Reply ─────────────────────────────────────────────────────────────────
  const sendReply = async () => {
    const text = (document.getElementById('cc-sh-reply-text').value || '').trim();
    if (!text) return;
    const btn = document.getElementById('cc-sh-reply-btn');
    btn.disabled = true; btn.textContent = 'Sending...';
    try {
      const res  = await fetch(`${endpoint}&action=casemessage&caseid=${currentCaseId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      document.getElementById('cc-sh-reply-text').value = '';
      toast('✓ Reply sent');
      await openCase(currentCaseId);
    } catch (e) { toast('✗ ' + e.message); }
    finally { btn.disabled = false; btn.textContent = 'Send'; }
  };

  // ── New case ──────────────────────────────────────────────────────────────
  const showNew = async () => {
    show('cc-sh-new');
    try {
      const res  = await fetch(`${endpoint}&action=casetypes`);
      const data = await res.json();
      const sel  = document.getElementById('cc-sh-casetype');
      (data.types || []).forEach(t => {
        const o = document.createElement('option');
        o.value = t.id; o.textContent = t.name; sel.appendChild(o);
      });
    } catch (_) {}
  };

  const submitCase = async () => {
    const title   = (document.getElementById('cc-sh-title').value   || '').trim();
    const message = (document.getElementById('cc-sh-message').value || '').trim();
    if (!title)   { toast('Please enter a subject.'); return; }
    if (!message) { toast('Please enter a message.'); return; }
    const btn = document.getElementById('cc-sh-submit-btn');
    btn.disabled = true; btn.textContent = 'Submitting...';
    try {
      const res  = await fetch(`${endpoint}&action=case&customerid=${customerId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, message,
          email:    (document.getElementById('cc-sh-email').value || '').trim(),
          casetype: document.getElementById('cc-sh-casetype').value || ''
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast('✓ Case submitted');
      ['cc-sh-title', 'cc-sh-email', 'cc-sh-message'].forEach(id => {
        document.getElementById(id).value = '';
      });
      await loadCases();
    } catch (e) { toast('✗ ' + e.message); }
    finally { btn.disabled = false; btn.textContent = 'Submit Case'; }
  };

  // ── Public API ─────────────────────────────────────────────────────────────
  window._ccSh = { loadCases, openCase, sendReply, showNew, submitCase, showList: loadCases };

  loadCases();
})();
