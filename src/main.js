import Chart from 'chart.js/auto';

const MONTHS = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const CH_CLASS = { Email:'email', Voice:'voice', WhatsApp:'whatsapp' };
const PR_CLASS = { Perisai:'perisai', 'E-Meterai':'emeterai' };
const CHART_COLORS = { Email:'#29C3B3', Voice:'#F2A93B', WhatsApp:'#8DA0F2' };
const PRODUK_COLORS = { Perisai:'#29C3B3', 'E-Meterai':'#C792EA' };

let channelRecords = [];
let produkRecords = [];
let editingChannelId = null;
let editingProdukId = null;
const charts = {};

document.getElementById('app').innerHTML = `
<header>
  <div class="titlebar">
    <div>
      <h1>DCC Data Source</h1>
      <div class="sub"><span id="statusDot" class="status-dot"></span><span id="statusText">Memuat data…</span></div>
    </div>
    <div class="sub mono" id="recordCountTop"></div>
  </div>
</header>

<nav class="tabs">
  <button class="tab-btn active" data-view="dashboard">Dashboard</button>
  <button class="tab-btn" data-view="input">Input Data</button>
  <button class="tab-btn" data-view="manage">Kelola Data</button>
</nav>

<main>
  <section id="view-dashboard" class="view active">
    <div class="filters">
      <div class="field"><label>Tahun</label><select id="dashYear"><option value="all">Semua</option></select></div>
    </div>

    <div class="section-label">Per Channel</div>
    <div class="cards" id="summaryCardsChannel"></div>
    <div class="chart-grid">
      <div class="panel"><p class="panel-title">Tren Total Interaksi per Bulan — per Channel</p><div class="chart-wrap tall"><canvas id="chartTrend"></canvas></div></div>
      <div class="panel"><p class="panel-title">AHT &amp; SCR — Voice</p><div class="chart-wrap tall"><canvas id="chartVoice"></canvas></div></div>
      <div class="panel"><p class="panel-title">Breakdown per Channel</p><div class="chart-wrap"><canvas id="chartChannel"></canvas></div></div>
      <div class="panel"><p class="panel-title">Tren Response Time — Email &amp; WhatsApp (menit)</p><div class="chart-wrap"><canvas id="chartResponse"></canvas></div></div>
    </div>

    <div class="section-label">Per Produk</div>
    <div class="cards" id="summaryCardsProduk"></div>
    <div class="chart-grid">
      <div class="panel"><p class="panel-title">Tren Total Interaksi per Bulan — per Produk</p><div class="chart-wrap tall"><canvas id="chartTrendProduk"></canvas></div></div>
      <div class="panel"><p class="panel-title">Breakdown per Produk</p><div class="chart-wrap tall"><canvas id="chartProduk"></canvas></div></div>
    </div>
  </section>

  <section id="view-input" class="view">
    <div class="subtabs">
      <button class="subtab-btn active" data-sub="input" data-target="channel">Per Channel</button>
      <button class="subtab-btn" data-sub="input" data-target="produk">Per Produk</button>
    </div>

    <div class="panel subview active" id="input-channel">
      <p class="panel-title">Input Data per Channel</p>
      <div class="edit-banner" id="editBannerChannel"><span>Mode edit — mengubah data existing</span><button class="btn ghost" type="button" id="cancelEditChannelBtn">Batal edit</button></div>
      <form id="formChannel">
        <div class="form-grid">
          <div class="field"><label for="cBulan">Bulan</label>
            <select id="cBulan" required><option value="">Pilih bulan</option>
              <option value="1">Januari</option><option value="2">Februari</option><option value="3">Maret</option>
              <option value="4">April</option><option value="5">Mei</option><option value="6">Juni</option>
              <option value="7">Juli</option><option value="8">Agustus</option><option value="9">September</option>
              <option value="10">Oktober</option><option value="11">November</option><option value="12">Desember</option>
            </select>
          </div>
          <div class="field"><label for="cTahun">Tahun</label><input type="number" id="cTahun" min="2020" max="2100" placeholder="2026" required></div>
          <div class="field"><label for="cChannel">Channel</label>
            <select id="cChannel" required><option value="">Pilih channel</option><option value="Email">Email</option><option value="Voice">Voice</option><option value="WhatsApp">WhatsApp</option></select>
          </div>
          <div class="field"><label for="cTotal">Total Interaksi</label><input type="number" id="cTotal" min="0" step="1" placeholder="0" required></div>
        </div>
        <div class="cond-fields hidden" id="cFieldsEmailWa">
          <div class="field span2"><label for="cResponse">Response Time rata-rata (menit)</label><input type="number" id="cResponse" min="0" step="0.01" placeholder="0.00"></div>
        </div>
        <div class="cond-fields hidden" id="cFieldsVoice">
          <div class="field"><label for="cAht">AHT (menit)</label><input type="number" id="cAht" min="0" step="0.01" placeholder="0.00"></div>
          <div class="field"><label for="cScr">SCR (%)</label><input type="number" id="cScr" min="0" max="100" step="0.01" placeholder="0.00"></div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn primary" id="submitChannelBtn">Simpan Data</button>
          <button type="button" class="btn ghost" id="resetChannelBtn">Reset Form</button>
        </div>
      </form>
    </div>

    <div class="panel subview" id="input-produk">
      <p class="panel-title">Input Data per Produk</p>
      <div class="edit-banner" id="editBannerProduk"><span>Mode edit — mengubah data existing</span><button class="btn ghost" type="button" id="cancelEditProdukBtn">Batal edit</button></div>
      <form id="formProduk">
        <div class="form-grid">
          <div class="field"><label for="pBulan">Bulan</label>
            <select id="pBulan" required><option value="">Pilih bulan</option>
              <option value="1">Januari</option><option value="2">Februari</option><option value="3">Maret</option>
              <option value="4">April</option><option value="5">Mei</option><option value="6">Juni</option>
              <option value="7">Juli</option><option value="8">Agustus</option><option value="9">September</option>
              <option value="10">Oktober</option><option value="11">November</option><option value="12">Desember</option>
            </select>
          </div>
          <div class="field"><label for="pTahun">Tahun</label><input type="number" id="pTahun" min="2020" max="2100" placeholder="2026" required></div>
          <div class="field"><label for="pProduk">Produk</label>
            <select id="pProduk" required><option value="">Pilih produk</option><option value="Perisai">Perisai</option><option value="E-Meterai">E-Meterai</option></select>
          </div>
          <div class="field"><label for="pTotal">Total Interaksi</label><input type="number" id="pTotal" min="0" step="1" placeholder="0" required></div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn primary" id="submitProdukBtn">Simpan Data</button>
          <button type="button" class="btn ghost" id="resetProdukBtn">Reset Form</button>
        </div>
      </form>
    </div>
  </section>

  <section id="view-manage" class="view">
    <div class="subtabs">
      <button class="subtab-btn active" data-sub="manage" data-target="channel">Per Channel</button>
      <button class="subtab-btn" data-sub="manage" data-target="produk">Per Produk</button>
    </div>

    <div class="panel subview active" id="manage-channel">
      <p class="panel-title">Data per Channel <span class="count-badge" id="manageCountChannel">0 baris</span></p>
      <div class="filters">
        <div class="field"><label>Tahun</label><select id="mgYearChannel"><option value="all">Semua</option></select></div>
        <div class="field"><label>Channel</label><select id="mgChannel"><option value="all">Semua</option><option value="Email">Email</option><option value="Voice">Voice</option><option value="WhatsApp">WhatsApp</option></select></div>
      </div>
      <div class="table-scroll">
        <table><thead><tr><th>Periode</th><th>Channel</th><th>Total Interaksi</th><th>Response (menit)</th><th>AHT (menit)</th><th>SCR (%)</th><th></th></tr></thead><tbody id="tableBodyChannel"></tbody></table>
        <div class="empty-state hidden" id="emptyStateChannel">Belum ada data. Tambahkan lewat tab Input Data → Per Channel.</div>
      </div>
    </div>

    <div class="panel subview" id="manage-produk">
      <p class="panel-title">Data per Produk <span class="count-badge" id="manageCountProduk">0 baris</span></p>
      <div class="filters">
        <div class="field"><label>Tahun</label><select id="mgYearProduk"><option value="all">Semua</option></select></div>
        <div class="field"><label>Produk</label><select id="mgProduk"><option value="all">Semua</option><option value="Perisai">Perisai</option><option value="E-Meterai">E-Meterai</option></select></div>
      </div>
      <div class="table-scroll">
        <table><thead><tr><th>Periode</th><th>Produk</th><th>Total Interaksi</th><th></th></tr></thead><tbody id="tableBodyProduk"></tbody></table>
        <div class="empty-state hidden" id="emptyStateProduk">Belum ada data. Tambahkan lewat tab Input Data → Per Produk.</div>
      </div>
    </div>
  </section>
</main>
<div class="toast" id="toast"></div>
`;

function toast(msg, isErr){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (isErr ? ' err' : '');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=> t.classList.remove('show'), 2600);
}
function setStatus(online, text){
  document.getElementById('statusDot').classList.toggle('offline', !online);
  document.getElementById('statusText').textContent = text;
}
function fmtNum(n, decimals){
  if(n==null || isNaN(n)) return '—';
  return decimals ? Number(n).toLocaleString('id-ID',{minimumFractionDigits:decimals,maximumFractionDigits:decimals}) : Number(n).toLocaleString('id-ID');
}

// ---------- API ----------
async function apiGet(path){
  const res = await fetch(path);
  if(!res.ok) throw new Error('GET ' + path + ' -> ' + res.status);
  return res.json();
}
async function apiSend(path, method, body){
  const res = await fetch(path, { method, headers:{'Content-Type':'application/json'}, body: body ? JSON.stringify(body) : undefined });
  if(!res.ok) throw new Error(method + ' ' + path + ' -> ' + res.status);
  return res.json().catch(()=>({}));
}

async function loadAll(){
  try{
    [channelRecords, produkRecords] = await Promise.all([apiGet('/api/channel'), apiGet('/api/produk')]);
    setStatus(true, 'Tersambung — data tersimpan otomatis');
  } catch(err){
    setStatus(false, 'Gagal memuat data: ' + err.message);
    toast('Gagal memuat data dari server', true);
  }
  renderAll();
}

// ---------- tabs ----------
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('view-'+btn.dataset.view).classList.add('active');
  });
});
document.querySelectorAll('.subtab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const group = btn.dataset.sub;
    document.querySelectorAll('.subtab-btn[data-sub="'+group+'"]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const scopeId = group === 'input' ? ['input-channel','input-produk'] : ['manage-channel','manage-produk'];
    scopeId.forEach(id=> document.getElementById(id).classList.remove('active'));
    document.getElementById(group+'-'+btn.dataset.target).classList.add('active');
  });
});

// ---------- conditional fields ----------
const cChannel = document.getElementById('cChannel');
cChannel.addEventListener('change', updateChannelConditionalFields);
function updateChannelConditionalFields(){
  const val = cChannel.value;
  document.getElementById('cFieldsEmailWa').classList.toggle('hidden', !(val==='Email'||val==='WhatsApp'));
  document.getElementById('cFieldsVoice').classList.toggle('hidden', val!=='Voice');
}

// ---------- CHANNEL form ----------
document.getElementById('formChannel').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const bulan = parseInt(document.getElementById('cBulan').value,10);
  const tahun = parseInt(document.getElementById('cTahun').value,10);
  const channel = document.getElementById('cChannel').value;
  const totalInteraksi = parseFloat(document.getElementById('cTotal').value);
  if(!bulan || !tahun || !channel || isNaN(totalInteraksi)){ toast('Lengkapi semua field wajib', true); return; }
  const payload = { bulan, tahun, channel, totalInteraksi };
  if(channel==='Email' || channel==='WhatsApp'){
    const rt = document.getElementById('cResponse').value;
    payload.responseTime = rt==='' ? null : parseFloat(rt);
    payload.aht = null; payload.scr = null;
  } else {
    const aht = document.getElementById('cAht').value;
    const scr = document.getElementById('cScr').value;
    payload.aht = aht==='' ? null : parseFloat(aht);
    payload.scr = scr==='' ? null : parseFloat(scr);
    payload.responseTime = null;
  }
  const btn = document.getElementById('submitChannelBtn');
  btn.disabled = true;
  try{
    if(editingChannelId){
      await apiSend('/api/channel/'+editingChannelId, 'PUT', payload);
      toast('Data channel berhasil diperbarui');
    } else {
      await apiSend('/api/channel', 'POST', payload);
      toast('Data channel berhasil disimpan');
    }
    exitEditChannel();
    e.target.reset();
    updateChannelConditionalFields();
    await loadAll();
  } catch(err){ toast('Gagal menyimpan: ' + err.message, true); }
  finally{ btn.disabled = false; }
});
document.getElementById('resetChannelBtn').addEventListener('click', ()=>{
  document.getElementById('formChannel').reset(); updateChannelConditionalFields(); exitEditChannel();
});
document.getElementById('cancelEditChannelBtn').addEventListener('click', ()=>{
  document.getElementById('formChannel').reset(); updateChannelConditionalFields(); exitEditChannel();
});
function enterEditChannel(rec){
  editingChannelId = rec.id;
  document.getElementById('cBulan').value = rec.bulan;
  document.getElementById('cTahun').value = rec.tahun;
  document.getElementById('cChannel').value = rec.channel;
  document.getElementById('cTotal').value = rec.totalInteraksi;
  updateChannelConditionalFields();
  document.getElementById('cResponse').value = rec.responseTime ?? '';
  document.getElementById('cAht').value = rec.aht ?? '';
  document.getElementById('cScr').value = rec.scr ?? '';
  document.getElementById('editBannerChannel').classList.add('show');
  document.getElementById('submitChannelBtn').textContent = 'Update Data';
  goToInputTab('channel');
}
function exitEditChannel(){
  editingChannelId = null;
  document.getElementById('editBannerChannel').classList.remove('show');
  document.getElementById('submitChannelBtn').textContent = 'Simpan Data';
}
async function deleteChannelRecord(id){
  if(!confirm('Hapus data ini? Tindakan tidak bisa dibatalkan.')) return;
  try{
    await apiSend('/api/channel/'+id, 'DELETE');
    toast('Data dihapus');
    if(editingChannelId===id) exitEditChannel();
    await loadAll();
  } catch(err){ toast('Gagal menghapus: ' + err.message, true); }
}

// ---------- PRODUK form ----------
document.getElementById('formProduk').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const bulan = parseInt(document.getElementById('pBulan').value,10);
  const tahun = parseInt(document.getElementById('pTahun').value,10);
  const produk = document.getElementById('pProduk').value;
  const totalInteraksi = parseFloat(document.getElementById('pTotal').value);
  if(!bulan || !tahun || !produk || isNaN(totalInteraksi)){ toast('Lengkapi semua field wajib', true); return; }
  const payload = { bulan, tahun, produk, totalInteraksi };
  const btn = document.getElementById('submitProdukBtn');
  btn.disabled = true;
  try{
    if(editingProdukId){
      await apiSend('/api/produk/'+editingProdukId, 'PUT', payload);
      toast('Data produk berhasil diperbarui');
    } else {
      await apiSend('/api/produk', 'POST', payload);
      toast('Data produk berhasil disimpan');
    }
    exitEditProduk();
    e.target.reset();
    await loadAll();
  } catch(err){ toast('Gagal menyimpan: ' + err.message, true); }
  finally{ btn.disabled = false; }
});
document.getElementById('resetProdukBtn').addEventListener('click', ()=>{
  document.getElementById('formProduk').reset(); exitEditProduk();
});
document.getElementById('cancelEditProdukBtn').addEventListener('click', ()=>{
  document.getElementById('formProduk').reset(); exitEditProduk();
});
function enterEditProduk(rec){
  editingProdukId = rec.id;
  document.getElementById('pBulan').value = rec.bulan;
  document.getElementById('pTahun').value = rec.tahun;
  document.getElementById('pProduk').value = rec.produk;
  document.getElementById('pTotal').value = rec.totalInteraksi;
  document.getElementById('editBannerProduk').classList.add('show');
  document.getElementById('submitProdukBtn').textContent = 'Update Data';
  goToInputTab('produk');
}
function exitEditProduk(){
  editingProdukId = null;
  document.getElementById('editBannerProduk').classList.remove('show');
  document.getElementById('submitProdukBtn').textContent = 'Simpan Data';
}
async function deleteProdukRecord(id){
  if(!confirm('Hapus data ini? Tindakan tidak bisa dibatalkan.')) return;
  try{
    await apiSend('/api/produk/'+id, 'DELETE');
    toast('Data dihapus');
    if(editingProdukId===id) exitEditProduk();
    await loadAll();
  } catch(err){ toast('Gagal menghapus: ' + err.message, true); }
}

function goToInputTab(target){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelector('.tab-btn[data-view="input"]').classList.add('active');
  document.getElementById('view-input').classList.add('active');
  document.querySelectorAll('.subtab-btn[data-sub="input"]').forEach(b=>b.classList.remove('active'));
  document.querySelector('.subtab-btn[data-sub="input"][data-target="'+target+'"]').classList.add('active');
  document.getElementById('input-channel').classList.remove('active');
  document.getElementById('input-produk').classList.remove('active');
  document.getElementById('input-'+target).classList.add('active');
  window.scrollTo({top:0, behavior:'smooth'});
}

window.__editChannelRec = (id)=>{ const r = channelRecords.find(x=>x.id===id); if(r) enterEditChannel(r); };
window.__deleteChannelRec = (id)=> deleteChannelRecord(id);
window.__editProdukRec = (id)=>{ const r = produkRecords.find(x=>x.id===id); if(r) enterEditProduk(r); };
window.__deleteProdukRec = (id)=> deleteProdukRecord(id);

// ---------- year filter options ----------
function refreshYearOptions(){
  const chYears = [...new Set(channelRecords.map(r=>r.tahun))].sort((a,b)=>b-a);
  const prYears = [...new Set(produkRecords.map(r=>r.tahun))].sort((a,b)=>b-a);
  const allYears = [...new Set([...chYears, ...prYears])].sort((a,b)=>b-a);
  fillYearSelect('dashYear', allYears);
  fillYearSelect('mgYearChannel', chYears);
  fillYearSelect('mgYearProduk', prYears);
}
function fillYearSelect(id, years){
  const sel = document.getElementById(id);
  const current = sel.value;
  sel.innerHTML = '<option value="all">Semua</option>' + years.map(y=>`<option value="${y}">${y}</option>`).join('');
  if(years.includes(parseInt(current,10)) || current==='all') sel.value = current;
}
['dashYear'].forEach(id=> document.getElementById(id).addEventListener('change', renderDashboard));
['mgYearChannel','mgChannel'].forEach(id=> document.getElementById(id).addEventListener('change', renderTableChannel));
['mgYearProduk','mgProduk'].forEach(id=> document.getElementById(id).addEventListener('change', renderTableProduk));

function filterChannel(){
  const year = document.getElementById('mgYearChannel').value;
  const channel = document.getElementById('mgChannel').value;
  return channelRecords.filter(r=> (year==='all'||String(r.tahun)===year) && (channel==='all'||r.channel===channel));
}
function filterProduk(){
  const year = document.getElementById('mgYearProduk').value;
  const produk = document.getElementById('mgProduk').value;
  return produkRecords.filter(r=> (year==='all'||String(r.tahun)===year) && (produk==='all'||r.produk===produk));
}

// ---------- tables ----------
function renderTableChannel(){
  const rows = filterChannel().slice().sort((a,b)=> b.tahun-a.tahun || b.bulan-a.bulan || (CH_CLASS[a.channel]>CH_CLASS[b.channel]?1:-1));
  document.getElementById('manageCountChannel').textContent = rows.length + ' baris';
  const tbody = document.getElementById('tableBodyChannel');
  const empty = document.getElementById('emptyStateChannel');
  if(rows.length===0){ tbody.innerHTML=''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  tbody.innerHTML = rows.map(r=>`
    <tr>
      <td class="mono">${MONTHS[r.bulan]} ${r.tahun}</td>
      <td><span class="chip ${CH_CLASS[r.channel]}">${r.channel}</span></td>
      <td class="mono">${fmtNum(r.totalInteraksi)}</td>
      <td class="mono">${r.responseTime!=null ? fmtNum(r.responseTime,2) : '—'}</td>
      <td class="mono">${r.aht!=null ? fmtNum(r.aht,2) : '—'}</td>
      <td class="mono">${r.scr!=null ? fmtNum(r.scr,2) : '—'}</td>
      <td><div class="row-actions">
        <button class="icon-btn" onclick="window.__editChannelRec('${r.id}')">Edit</button>
        <button class="icon-btn danger" onclick="window.__deleteChannelRec('${r.id}')">Hapus</button>
      </div></td>
    </tr>`).join('');
}
function renderTableProduk(){
  const rows = filterProduk().slice().sort((a,b)=> b.tahun-a.tahun || b.bulan-a.bulan || a.produk.localeCompare(b.produk));
  document.getElementById('manageCountProduk').textContent = rows.length + ' baris';
  const tbody = document.getElementById('tableBodyProduk');
  const empty = document.getElementById('emptyStateProduk');
  if(rows.length===0){ tbody.innerHTML=''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  tbody.innerHTML = rows.map(r=>`
    <tr>
      <td class="mono">${MONTHS[r.bulan]} ${r.tahun}</td>
      <td><span class="chip ${PR_CLASS[r.produk]}">${r.produk}</span></td>
      <td class="mono">${fmtNum(r.totalInteraksi)}</td>
      <td><div class="row-actions">
        <button class="icon-btn" onclick="window.__editProdukRec('${r.id}')">Edit</button>
        <button class="icon-btn danger" onclick="window.__deleteProdukRec('${r.id}')">Hapus</button>
      </div></td>
    </tr>`).join('');
}

// ---------- dashboard ----------
function renderDashboard(){
  const year = document.getElementById('dashYear').value;
  const chRows = channelRecords.filter(r=> year==='all' || String(r.tahun)===year);
  const prRows = produkRecords.filter(r=> year==='all' || String(r.tahun)===year);
  renderSummaryChannel(chRows);
  renderSummaryProduk(prRows);
  safeRender(()=>renderTrendChart(chRows), 'trend');
  safeRender(()=>renderVoiceChart(chRows), 'voice');
  safeRender(()=>renderChannelChart(chRows), 'channel');
  safeRender(()=>renderResponseChart(chRows), 'response');
  safeRender(()=>renderTrendProdukChart(prRows), 'trendProduk');
  safeRender(()=>renderProdukChart(prRows), 'produk');
}
function safeRender(fn, label){ try{ fn(); } catch(err){ console.error('Chart render error ('+label+'):', err); } }

function renderSummaryChannel(rows){
  const total = rows.reduce((s,r)=>s+(r.totalInteraksi||0),0);
  const byChannel = {Email:0, Voice:0, WhatsApp:0};
  rows.forEach(r=> byChannel[r.channel] = (byChannel[r.channel]||0) + (r.totalInteraksi||0));
  const voiceRows = rows.filter(r=>r.channel==='Voice' && r.aht!=null);
  const avgAht = voiceRows.length ? voiceRows.reduce((s,r)=>s+r.aht,0)/voiceRows.length : null;
  const scrRows = rows.filter(r=>r.channel==='Voice' && r.scr!=null);
  const avgScr = scrRows.length ? scrRows.reduce((s,r)=>s+r.scr,0)/scrRows.length : null;
  const cards = [
    {label:'Total Interaksi (channel)', value: fmtNum(total), cls:''},
    {label:'Email', value: fmtNum(byChannel.Email), cls:'accent-e'},
    {label:'Voice', value: fmtNum(byChannel.Voice), cls:'accent-v'},
    {label:'WhatsApp', value: fmtNum(byChannel.WhatsApp), cls:'accent-w'},
    {label:'Rata-rata AHT', value: avgAht!=null ? fmtNum(avgAht,2)+' mnt' : '—', cls:'accent-v'},
    {label:'Rata-rata SCR', value: avgScr!=null ? fmtNum(avgScr,2)+'%' : '—', cls:'accent-v'},
  ];
  document.getElementById('summaryCardsChannel').innerHTML = cards.map(c=>`<div class="card ${c.cls}"><div class="label">${c.label}</div><div class="value">${c.value}</div></div>`).join('');
}
function renderSummaryProduk(rows){
  const total = rows.reduce((s,r)=>s+(r.totalInteraksi||0),0);
  const byProduk = {Perisai:0, 'E-Meterai':0};
  rows.forEach(r=> byProduk[r.produk] = (byProduk[r.produk]||0) + (r.totalInteraksi||0));
  const cards = [
    {label:'Total Interaksi (produk)', value: fmtNum(total), cls:''},
    {label:'Perisai', value: fmtNum(byProduk.Perisai), cls:'accent-p'},
    {label:'E-Meterai', value: fmtNum(byProduk['E-Meterai']), cls:'accent-p'},
  ];
  document.getElementById('summaryCardsProduk').innerHTML = cards.map(c=>`<div class="card ${c.cls}"><div class="label">${c.label}</div><div class="value">${c.value}</div></div>`).join('');
}

function periodKey(r){ return r.tahun*100 + r.bulan; }
function periodLabel(r){ return MONTHS[r.bulan] + ' ' + r.tahun; }
function sortedPeriods(rows){
  const map = new Map();
  rows.forEach(r=>{ const k=periodKey(r); if(!map.has(k)) map.set(k, periodLabel(r)); });
  return [...map.entries()].sort((a,b)=>a[0]-b[0]);
}
function destroyChart(key){ if(charts[key]){ charts[key].destroy(); delete charts[key]; } }

function renderTrendChart(rows){
  destroyChart('trend');
  const periods = sortedPeriods(rows);
  const channels = ['Email','Voice','WhatsApp'];
  const datasets = channels.map(ch=>({
    label: ch,
    data: periods.map(([k])=> rows.filter(r=>periodKey(r)===k && r.channel===ch).reduce((s,r)=>s+(r.totalInteraksi||0),0)),
    borderColor: CHART_COLORS[ch], backgroundColor: CHART_COLORS[ch], tension:0.3, borderWidth:2, pointRadius:3, fill:false,
  }));
  charts.trend = new Chart(document.getElementById('chartTrend'), { type:'line', data:{ labels: periods.map(p=>p[1]), datasets }, options: baseChartOptions({legend:true}) });
}
function renderVoiceChart(rows){
  destroyChart('voice');
  const voiceRows = rows.filter(r=>r.channel==='Voice');
  const periods = sortedPeriods(voiceRows);
  const ahtData = periods.map(([k])=>{ const items=voiceRows.filter(r=>periodKey(r)===k && r.aht!=null); return items.length ? items.reduce((s,r)=>s+r.aht,0)/items.length : null; });
  const scrData = periods.map(([k])=>{ const items=voiceRows.filter(r=>periodKey(r)===k && r.scr!=null); return items.length ? items.reduce((s,r)=>s+r.scr,0)/items.length : null; });
  charts.voice = new Chart(document.getElementById('chartVoice'), { type:'line', data:{ labels: periods.map(p=>p[1]), datasets:[
    {label:'AHT (menit)', data: ahtData, borderColor:'#F2A93B', backgroundColor:'#F2A93B', yAxisID:'y', tension:0.3, borderWidth:2, pointRadius:3},
    {label:'SCR (%)', data: scrData, borderColor:'#7C93F0', backgroundColor:'#7C93F0', yAxisID:'y1', tension:0.3, borderWidth:2, pointRadius:3},
  ]}, options: baseChartOptions({legend:true, dualAxis:true}) });
}
function renderChannelChart(rows){
  destroyChart('channel');
  const channels = ['Email','Voice','WhatsApp'];
  const data = channels.map(ch=> rows.filter(r=>r.channel===ch).reduce((s,r)=>s+(r.totalInteraksi||0),0));
  charts.channel = new Chart(document.getElementById('chartChannel'), { type:'bar', data:{ labels: channels, datasets:[{ data, backgroundColor: channels.map(c=>CHART_COLORS[c]), borderRadius:4, maxBarThickness:48 }]}, options: baseChartOptions({legend:false}) });
}
function renderResponseChart(rows){
  destroyChart('response');
  const rtRows = rows.filter(r=> (r.channel==='Email'||r.channel==='WhatsApp') && r.responseTime!=null);
  const periods = sortedPeriods(rtRows);
  const emailData = periods.map(([k])=>{ const items=rtRows.filter(r=>periodKey(r)===k && r.channel==='Email'); return items.length ? items.reduce((s,r)=>s+r.responseTime,0)/items.length : null; });
  const waData = periods.map(([k])=>{ const items=rtRows.filter(r=>periodKey(r)===k && r.channel==='WhatsApp'); return items.length ? items.reduce((s,r)=>s+r.responseTime,0)/items.length : null; });
  charts.response = new Chart(document.getElementById('chartResponse'), { type:'line', data:{ labels: periods.map(p=>p[1]), datasets:[
    {label:'Email', data: emailData, borderColor:'#29C3B3', backgroundColor:'#29C3B3', tension:0.3, borderWidth:2, pointRadius:3},
    {label:'WhatsApp', data: waData, borderColor:'#8DA0F2', backgroundColor:'#8DA0F2', tension:0.3, borderWidth:2, pointRadius:3},
  ]}, options: baseChartOptions({legend:true}) });
}
function renderTrendProdukChart(rows){
  destroyChart('trendProduk');
  const periods = sortedPeriods(rows);
  const produkList = ['Perisai','E-Meterai'];
  const datasets = produkList.map(p=>({
    label: p,
    data: periods.map(([k])=> rows.filter(r=>periodKey(r)===k && r.produk===p).reduce((s,r)=>s+(r.totalInteraksi||0),0)),
    borderColor: PRODUK_COLORS[p], backgroundColor: PRODUK_COLORS[p], tension:0.3, borderWidth:2, pointRadius:3, fill:false,
  }));
  charts.trendProduk = new Chart(document.getElementById('chartTrendProduk'), { type:'line', data:{ labels: periods.map(p=>p[1]), datasets }, options: baseChartOptions({legend:true}) });
}
function renderProdukChart(rows){
  destroyChart('produk');
  const produkList = ['Perisai','E-Meterai'];
  const data = produkList.map(p=> rows.filter(r=>r.produk===p).reduce((s,r)=>s+(r.totalInteraksi||0),0));
  charts.produk = new Chart(document.getElementById('chartProduk'), { type:'bar', data:{ labels: produkList, datasets:[{ data, backgroundColor: produkList.map(p=>PRODUK_COLORS[p]), borderRadius:4, maxBarThickness:48 }]}, options: baseChartOptions({legend:false}) });
}
function baseChartOptions(opts){
  opts = opts || {};
  const gridColor = 'rgba(255,255,255,0.06)';
  const tickColor = '#8B94A3';
  const o = {
    responsive:true, maintainAspectRatio:false,
    interaction:{ mode:'index', intersect:false },
    plugins:{
      legend:{ display: !!opts.legend, position:'top', align:'end', labels:{ color:'#E4E8EE', boxWidth:10, boxHeight:10, usePointStyle:true, font:{size:11.5} } },
      tooltip:{ backgroundColor:'#1E2631', borderColor:'#2A3341', borderWidth:1, titleColor:'#E4E8EE', bodyColor:'#C7CDD8', padding:10, titleFont:{size:12}, bodyFont:{size:12} }
    },
    scales:{
      x:{ grid:{ color:gridColor, drawBorder:false }, ticks:{ color:tickColor, font:{size:11} } },
      y:{ grid:{ color:gridColor, drawBorder:false }, ticks:{ color:tickColor, font:{size:11} }, beginAtZero:true }
    }
  };
  if(opts.dualAxis){ o.scales.y1 = { position:'right', grid:{ display:false }, ticks:{ color:tickColor, font:{size:11} }, beginAtZero:true, max:100 }; }
  return o;
}

function renderAll(){
  refreshYearOptions();
  renderTableChannel();
  renderTableProduk();
  renderDashboard();
  document.getElementById('recordCountTop').textContent = (channelRecords.length + produkRecords.length) + ' record tersimpan';
}

updateChannelConditionalFields();
loadAll();
