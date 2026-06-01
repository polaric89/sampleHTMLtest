(() => {
  const { customer } = window.ccPortal;
  const f = customer?.fields || customer || {};

  const container = document.getElementById('cc-custom-container');

  const val = v => (v && v !== '0' && v !== '0.00' && v !== '') ? v : null;

  const money = n => n != null && n !== ''
    ? '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })
    : null;

  const fields = [
    { label: 'Email',       value: val(f.email) },
    { label: 'Phone',       value: val(f.phone) },
    { label: 'Status',      value: val(f.stage) },
    { label: 'Currency',    value: f.currency === '1' ? 'USD' : val(f.currency) },
    { label: 'Balance',     value: money(f.balance) },
    { label: 'Overdue',     value: money(f.overduebalance) },
    { label: 'Sales Rep',   value: val(f.salesrepname || f.salesrep) },
    { label: 'Customer ID', value: customer?.id },
  ];

  container.innerHTML = `
    <style>
      #cc-customer-card { font-family: inherit; max-width: 600px; }
      #cc-customer-card .card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
      #cc-customer-card h2 { font-size: 18px; font-weight: 600; margin: 0 0 20px; color: #1a1a2e; }
      #cc-customer-card .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      #cc-customer-card .field { display: flex; flex-direction: column; gap: 4px; }
      #cc-customer-card .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #80868b; font-weight: 500; }
      #cc-customer-card .val { font-size: 14px; color: #202124; font-weight: 500; }
      #cc-customer-card .val.empty { color: #bdbdbd; font-weight: 400; font-style: italic; }
    </style>
    <div id="cc-customer-card">
      <div class="card">
        <h2>${val(f.companyname || f.entityid) || 'Customer'}</h2>
        <div class="grid">
          ${fields.map(({ label, value }) => `
            <div class="field">
              <span class="lbl">${label}</span>
              <span class="val ${!value ? 'empty' : ''}">${value || 'Not set'}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
})();
