/* Phase3 frontend script
   - loads expenses from backend with filters
   - add / edit / delete via API (modal center)
   - filter bar calls backend
   - charts update after each change
*/

const API = {
  list: (params='') => fetch('/api/expenses' + params).then(r=>{
    if(!r.ok) throw new Error('Failed to fetch'); return r.json();
  }),
  add: (body) => fetch('/api/add', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)}).then(r=>r.json()),
  edit: (id, body) => fetch(`/api/edit/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)}).then(r=>r.json()),
  del: (id) => fetch(`/api/delete/${id}`, { method:'DELETE' }).then(r=>r.json())
};

let charts = { line:null, bar:null, pie:null };
let CATS = new Set();

document.addEventListener('DOMContentLoaded', () => {
  // UI refs
  const chk = document.getElementById('themeToggle');
  const body = document.body;
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const underline = document.querySelector('.tab-underline');
  const openAdd = document.getElementById('openAdd');
  const modal = document.getElementById('modal');
  const modalForm = document.getElementById('modalForm');
  const modalTitle = document.getElementById('modalTitle');
  const modalCategory = document.getElementById('modalCategory');
  const modalAmount = document.getElementById('modalAmount');
  const modalDate = document.getElementById('modalDate');
  const modalNote = document.getElementById('modalNote');
  const saveBtn = document.getElementById('saveBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  const filterCategory = document.getElementById('filterCategory');
  const filterStart = document.getElementById('filterStart');
  const filterEnd = document.getElementById('filterEnd');
  const filterMin = document.getElementById('filterMin');
  const filterMax = document.getElementById('filterMax');
  const filterQ = document.getElementById('filterQ');
  const applyFilters = document.getElementById('applyFilters');
  const clearFilters = document.getElementById('clearFilters');

  let editingId = null;

  // theme default: dark
  const saved = localStorage.getItem('sx_theme');
  if(saved === 'light'){
    body.classList.add('light');
    chk.checked = false;
  } else {
    body.classList.remove('light');
    chk.checked = true;
  }
  chk.addEventListener('change', () => {
    if(chk.checked){ body.classList.remove('light'); localStorage.setItem('sx_theme','dark'); }
    else { body.classList.add('light'); localStorage.setItem('sx_theme','light'); }
    rebuildCharts(); // recolor
  });

  // tab logic underline
  function positionUnderline(){
    const active = document.querySelector('.tab.active');
    if(!active){ underline.style.width = '0px'; return; }
    const rect = active.getBoundingClientRect();
    const pRect = active.parentElement.getBoundingClientRect();
    underline.style.left = (rect.left - pRect.left) + 'px';
    underline.style.width = rect.width + 'px';
    underline.style.background = getComputedStyle(document.body).getPropertyValue('--accent').trim();
  }
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    positionUnderline();
    const which = t.dataset.chart;
    document.getElementById('lineCard').style.display = (which === 'line') ? 'block' : 'none';
    document.getElementById('barCard').style.display  = (which === 'bar') ? 'block' : 'none';
    document.getElementById('pieCard').style.display  = (which === 'pie') ? 'block' : 'none';
  }));
  setTimeout(positionUnderline, 120);

  // modal open
  openAdd.addEventListener('click', () => {
    editingId = null;
    modalTitle.textContent = 'Add Expense';
    modalCategory.value = '';
    modalAmount.value = '';
    modalDate.value = new Date().toISOString().slice(0,10);
    modalNote.value = '';
    showModal(true);
  });
  cancelBtn.addEventListener('click', () => showModal(false));
  function showModal(s){ if(s){ modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); } else { modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); } }

  // Save (add or edit)
  saveBtn.addEventListener('click', async () => {
    const cat = (modalCategory.value || '').trim();
    const amt = parseFloat(modalAmount.value);
    const date = modalDate.value;
    const note = (modalNote.value || '').trim();
    if(!cat || !date || isNaN(amt)){
      modalAmount.animate([{ boxShadow:'0 0 0 rgba(0,0,0,0)' }, { boxShadow:'0 0 10px rgba(255,100,100,0.18)' }], { duration: 360 });
      return;
    }
    const payload = { category: cat, amount: Number(amt), note: note, date: date };
    try {
      if(editingId){
        await API.edit(editingId, payload);
      } else {
        await API.add(payload);
      }
      await reloadAndRender();
      showModal(false);
    } catch(err){
      console.error(err);
      alert('Failed to save. See console.');
    }
  });

  // filters apply / clear
  applyFilters.addEventListener('click', () => reloadAndRender());
  clearFilters.addEventListener('click', () => { filterCategory.value='All'; filterStart.value=''; filterEnd.value=''; filterMin.value=''; filterMax.value=''; filterQ.value=''; reloadAndRender(); });

  // render table & handlers
  async function renderTable(items){
    const tbody = document.querySelector('#expensesTable tbody');
    if(!items || items.length === 0){
      tbody.innerHTML = '<tr><td colspan="5" class="muted">No expenses yet</td></tr>';
      document.getElementById('totalAmount').textContent = '₹0.00';
      return;
    }
    tbody.innerHTML = items.map(it => `
      <tr data-id="${it.id}">
        <td>${escapeHtml(it.category)}</td>
        <td>₹${Number(it.amount).toFixed(2)}</td>
        <td>${escapeHtml(it.date)}</td>
        <td>${escapeHtml(it.note || '')}</td>
        <td>
          <button class="btn edit" data-id="${it.id}">✏️</button>
          <button class="btn btn-del" data-id="${it.id}">🗑️</button>
        </td>
      </tr>
    `).join('');
    document.getElementById('totalAmount').textContent = '₹' + items.reduce((s,i)=>s + Number(i.amount), 0).toFixed(2);

    // attach delete/edit
    document.querySelectorAll('.btn-del').forEach(b=> b.onclick = async () => {
      const id = b.dataset.id;
      if(!confirm('Delete this expense?')) return;
      await API.del(id);
      // fade out row
      const row = document.querySelector(`tr[data-id="${id}"]`);
      if(row){ row.style.transition='opacity 260ms, transform 260ms'; row.style.opacity='0'; row.style.transform='translateX(20px)'; setTimeout(()=> reloadAndRender(), 260); }
      else reloadAndRender();
    });

    document.querySelectorAll('.btn.edit').forEach(b=> b.onclick = async () => {
      const id = b.dataset.id;
      const all = await API.list();
      const item = all.find(x => x.id == id);
      if(!item) return;
      editingId = id;
      modalTitle.textContent = 'Edit Expense';
      modalCategory.value = item.category;
      modalAmount.value = item.amount;
      modalDate.value = item.date;
      modalNote.value = item.note || '';
      showModal(true);
    });
  }

  // charts rebuild
  function rebuildChartsFrom(items){
    const daily = {};
    items.forEach(i => daily[i.date] = (daily[i.date]||0) + Number(i.amount));
    const dates = Object.keys(daily).sort();
    const dAmounts = dates.map(d=>daily[d]);

    const byCat = {};
    items.forEach(i => byCat[i.category] = (byCat[i.category]||0) + Number(i.amount));
    const cats = Object.keys(byCat);
    const catVals = cats.map(c=>byCat[c]);

    const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim();
    const accent2 = getComputedStyle(document.body).getPropertyValue('--accent-2').trim();
    const textColor = getComputedStyle(document.body).getPropertyValue('--text').trim();

    if(charts.line) charts.line.destroy();
    if(charts.bar) charts.bar.destroy();
    if(charts.pie) charts.pie.destroy();

    // line
    const ctxL = document.getElementById('lineChart').getContext('2d');
    charts.line = new Chart(ctxL, {
      type:'line',
      data:{ labels: dates, datasets:[{ label:'Daily', data: dAmounts, borderColor:accent, backgroundColor: accent + '33', tension:0.3, fill:true, pointRadius:2 }]},
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ x:{ ticks:{ color:textColor } }, y:{ ticks:{ color:textColor }, beginAtZero:true } }, animation:{duration:700} }
    });

    // bar
    const ctxB = document.getElementById('barChart').getContext('2d');
    charts.bar = new Chart(ctxB, {
      type:'bar',
      data:{ labels: cats, datasets:[{ data: catVals, backgroundColor: accent2 + 'CC', borderRadius:6 }]},
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ x:{ ticks:{ color:textColor } }, y:{ ticks:{ color:textColor }, beginAtZero:true } }, animation:{duration:700} }
    });

    // pie
    const ctxP = document.getElementById('pieChart').getContext('2d');
    const palette = ['#5BC0BE','#6FFFE9','#F4D35E','#EE964B','#F95738','#3A506B','#FF9EB5','#FCBAD3'];
    charts.pie = new Chart(ctxP, {
      type:'pie',
      data:{ labels: cats, datasets:[{ data: catVals, backgroundColor: cats.map((_,i)=>palette[i%palette.length]), borderColor:'rgba(255,255,255,0.06)', borderWidth:1 }]},
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom', labels:{color:textColor}}}, animation:{duration:800} }
    });
  }

  // populate category selects from server data
  async function populateCategoryFilter(){
    const all = await API.list();
    CATS = new Set(all.map(i=>i.category));
    const arr = ['All', ...Array.from(CATS)];
    filterCategory.innerHTML = arr.map(a=>`<option value="${a}">${a}</option>`).join('');
    document.getElementById('modalCats').innerHTML = Array.from(CATS).map(c=>`<option value="${c}"></option>`).join('');
  }

  // reload with filters from UI (calls backend)
  async function reloadAndRender(){
    const catVal = filterCategory.value || 'All';
    const start = filterStart.value ? `&start=${filterStart.value}` : '';
    const end = filterEnd.value ? `&end=${filterEnd.value}` : '';
    const min = filterMin.value ? `&min=${encodeURIComponent(filterMin.value)}` : '';
    const max = filterMax.value ? `&max=${encodeURIComponent(filterMax.value)}` : '';
    const q = filterQ.value ? `&q=${encodeURIComponent(filterQ.value)}` : '';
    const cat = (catVal && catVal !== 'All') ? `&category=${encodeURIComponent(catVal)}` : '';
    const params = `?${[cat, start, end, min, max, q].filter(Boolean).map(p=>p.replace(/^\&/,'')).join('&')}`;
    try {
      const items = await API.list(params);
      await populateCategoryFilter();
      renderTable(items);
      rebuildChartsFrom(items);
    } catch(err){
      console.error('Reload failed', err);
    }
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

  // initial load
  (async ()=> {
    await reloadAndRender();
    // only show line initially
    document.querySelectorAll('.tab').forEach(n=>n.classList.remove('active'));
    document.querySelector('.tab[data-chart="line"]').classList.add('active');
    document.getElementById('lineCard').style.display = 'block';
    document.getElementById('barCard').style.display  = 'none';
    document.getElementById('pieCard').style.display  = 'none';
    setTimeout(positionUnderline, 120);
  })();

  // expose for debugging
  window._reload = reloadAndRender;
  window._api = API;

});
