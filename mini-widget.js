// Mini timestamp widget logic extracted to external script (CSP-safe)
(() => {
  const dtInput = document.getElementById('dt');
  const msInput = document.getElementById('ms');
  const msOutput = document.getElementById('msOutput');
  const humanOutput = document.getElementById('humanOutput');

  function formatDate(date) {
    if (isNaN(date.getTime())) return null;
    const pad = (n, w = 2) => String(n).padStart(w, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
  }

  function convertToMs() {
    const value = dtInput.value;
    if (!value) {
      msOutput.textContent = '请先选择时间（本地时区）。';
      return;
    }
    const d = new Date(value);
    if (isNaN(d.getTime())) {
      msOutput.textContent = '无效时间，无法转换。';
      return;
    }
    msOutput.textContent = `${d.getTime()} (ms)`;
  }

  function convertToHuman() {
    const raw = msInput.value.trim();
    const clean = raw.replace(/\D/g, '');
    if (!/^\d{13}$/.test(clean)) {
      humanOutput.textContent = '请输入13位毫秒时间戳。';
      return;
    }
    const ms = Number(clean);
    const d = new Date(ms);
    if (isNaN(d.getTime())) {
      humanOutput.textContent = '时间戳无效。';
      return;
    }
    const formatted = formatDate(d);
    humanOutput.innerHTML = `${formatted}<br><span class="small">ISO: ${d.toISOString()}</span>`;
  }

  dtInput.addEventListener('change', convertToMs);
  dtInput.addEventListener('input', convertToMs);

  document.getElementById('now').addEventListener('click', () => {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    dtInput.value = local;
    convertToMs();
  });

  document.getElementById('convertToHuman').addEventListener('click', convertToHuman);
  document.getElementById('fillSample').addEventListener('click', () => {
    msInput.value = '1760514008027';
    convertToHuman();
  });
})();
