
// ─── Mock Data ─────────────────────────────────────────────────────────────────
/* const nombres = ["Ana García","Carlos Rodríguez","María López","Javier Martínez","Laura Pérez","Diego Hernández","Valentina Torres","Andrés Gómez","Camila Díaz","Felipe Morales","Isabella Vargas","Sebastián Castro","Daniela Reyes","Miguel Jiménez","Sofía Ruiz","Mateo Sánchez","Lucía Fernández","Gabriel Ramírez","Paula Medina","Tomás Ortega","Elena Muñoz","Ricardo Silva","Paola Guerrero","Nicolás Ramos","Juliana Cruz","Alejandro Ríos","Natalia Mendoza","Roberto Aguilar","Carolina Álvarez","Esteban Suárez"];
const barrios = ["Chapinero","Usaquén","Suba","Kennedy","Fontibón","Engativá","Bosa","Ciudad Bolívar","San Cristóbal","Rafael Uribe","Teusaquillo","Barrios Unidos","La Candelaria","Santa Fe","Los Mártires","Puente Aranda","Tunjuelito","Antonio Nariño","Usme","Sumapaz"];
const planes = ["semanal","quincenal","mensual"];
const statuses = ["activo","activo","activo","activo","pendiente","vencido","cancelado"];
const metodos = ["Nequi","Bancolombia","Daviplata","Transferencia"]; */

function rnd(n){return Math.floor(Math.random()*n);}
function seedRnd(s){let x=Math.sin(s)*10000;return x-Math.floor(x);}

function genClients(n){
  const list=[];
  for(let i=0;i<n;i++){
    const s=seedRnd(i+1);
    const s2=seedRnd(i+500);
    const plan=planes[Math.floor(s*3)];
    const status=statuses[Math.floor(s2*statuses.length)];
    const dias=status==='activo'?Math.floor(s*30):status==='vencido'?-Math.floor(s*10):0;
    const inicio=new Date(2025,Math.floor(s*12),Math.floor(s*28)+1);
    const venc=new Date(inicio);
    venc.setDate(venc.getDate()+(plan==='semanal'?7:plan==='quincenal'?15:30));
    const nombre=nombres[i%nombres.length]+(i>=nombres.length?' '+(Math.floor(i/nombres.length)+2):'');
    const historial=[];
    const nhist=Math.floor(s2*4);
    for(let j=0;j<nhist;j++){
      historial.push({id:`h${i}-${j}`,plan,monto:plan==='semanal'?75000:plan==='quincenal'?150000:285000,metodo:metodos[Math.floor(seedRnd(i*10+j)*4)],fecha:new Date(2025,j*2,15).toISOString().split('T')[0],status:'aprobado'});
    }
    const correo = `${nombre.split(' ')[0].toLowerCase()}.${nombre.split(' ')[1] ? nombre.split(' ')[1].toLowerCase() : ''}${i}@gmail.com`;
    const cedula = `${Math.floor(10000000 + seedRnd(i+300)*900000000)}`;
    const barrio = barrios[i%barrios.length];
    const facturacionElectronica = s > 0.5 ? 'Si' : 'No';
    list.push({
      id:`c${i}`,
      nombre,
      correo,
      cedula,
      telefono:`3${Math.floor(s*9+1)}${String(Math.floor(seedRnd(i+100)*10000000)).padStart(7,'0')}`,
      direccion:`Cra ${Math.floor(s*99)+1} #${Math.floor(s2*99)+1}-${Math.floor(seedRnd(i+200)*99)+1}`,
      barrio,
      facturacionElectronica,
      plan,
      status,
      diasRestantes:dias,
      fechaInicio:inicio.toISOString().split('T')[0],
      fechaVencimiento:venc.toISOString().split('T')[0],
      alergias:Math.floor(s*10)<2?'Mariscos, nueces':null,
      restricciones:Math.floor(s2*10)<2?'Vegetariano':null,
      historialPagos:historial
    });
  }
  return list;
}

function genPayments(n, clients){
  const list=[];
  for(let i=0;i<n;i++){
    const s=seedRnd(i+800);
    const client=clients[i%clients.length];
    list.push({
      id:`p${i}`,
      clienteNombre:client.nombre,
      plan:client.plan,
      monto:client.plan==='semanal'?75000:client.plan==='quincenal'?150000:285000,
      metodo:metodos[Math.floor(s*4)],
      fecha:new Date(2026,2,Math.floor(s*28)+1).toISOString().split('T')[0],
      comprobante:null,
      notas:Math.floor(s*10)<2?'Pago realizado antes de vencimiento':'',
      status:'pendiente'
    });
  }
  return list;
}

const ALL_CLIENTS = genClients(920);
const ALL_PAYMENTS = genPayments(47, ALL_CLIENTS);
let payments = ALL_PAYMENTS.map(p=>({...p}));

// ─── Stats ─────────────────────────────────────────────────────────────────────
function renderStats(){
  const active=ALL_CLIENTS.filter(c=>c.status==='activo').length;
  const avail=1000-active;
  const pending=ALL_CLIENTS.filter(c=>c.status==='pendiente').length;
  const expiring=ALL_CLIENTS.filter(c=>c.status==='activo'&&c.diasRestantes<=5).length;
  const vencidos=ALL_CLIENTS.filter(c=>c.status==='vencido').length;
  const pendPay=payments.filter(p=>p.status==='pendiente');
  const pendIncome=pendPay.reduce((s,p)=>s+p.monto,0);
  const totalIncome=ALL_CLIENTS.filter(c=>c.status==='activo').reduce((s,c)=>{
    const p={semanal:75000,quincenal:150000,mensual:285000};
    return s+p[c.plan];
  },0);
  const sCount=ALL_CLIENTS.filter(c=>c.plan==='semanal'&&c.status==='activo').length;
  const qCount=ALL_CLIENTS.filter(c=>c.plan==='quincenal'&&c.status==='activo').length;
  const mCount=ALL_CLIENTS.filter(c=>c.plan==='mensual'&&c.status==='activo').length;

  const stats=[
    {title:'Cupos Disponibles',value:avail,total:1000,icon:'users',color:'bg-blue-500',desc:`${active} activos de 1000`,urgent:false},
    {title:'Validaciones Pendientes',value:pendPay.length,icon:'clock',color:'bg-yellow-500',desc:`$${pendIncome.toLocaleString('es-CO')} por validar`,urgent:pendPay.length>10},
    {title:'Vencen en 5 días',value:expiring,icon:'alert',color:'bg-orange-500',desc:'Requieren renovación pronto',urgent:expiring>0},
    {title:'Clientes Vencidos',value:vencidos,icon:'alert',color:'bg-red-500',desc:'Requieren atención inmediata',urgent:vencidos>0},
    {title:'Ingresos Activos',value:`$${(totalIncome/1000000).toFixed(1)}M`,icon:'dollar',color:'bg-green-500',desc:'Valor total de planes activos',urgent:false},
    {title:'Planes por Tipo',value:'',icon:'package',color:'bg-purple-500',desc:`S:${sCount} Q:${qCount} M:${mCount}`,urgent:false},
  ];

  const icons={
    users:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    clock:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    alert:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    dollar:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    package:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  };

  const grid=document.getElementById('stats-grid');
  grid.innerHTML=stats.map(s=>`
    <div class="card p-4 ${s.urgent?'urgent-card':''}">
      <div class="flex items-center justify-between mb-2">
        <div class="text-xs font-medium text-gray-600">${s.title}</div>
        <div class="stat-icon ${s.color}">${icons[s.icon]}</div>
      </div>
      <div class="text-2xl font-bold mb-1">${s.value}${s.total?`<span class="text-sm text-gray-400 ml-1">/ ${s.total}</span>`:''}
      </div>
      <div class="text-xs text-gray-500">${s.desc}</div>
    </div>
  `).join('');
}

// ─── Payments ──────────────────────────────────────────────────────────────────
let selectedPaymentIds = new Set();
let currentPaymentIndex = 0;

function getFilteredPayments(){
  const q=(document.getElementById('payment-search')?.value||'').toLowerCase();
  const method=document.getElementById('payment-method')?.value||'';
  const sort=document.getElementById('payment-sort')?.value||'fecha';
  let list=payments.filter(p=>p.status==='pendiente');
  if(q) list=list.filter(p=>p.clienteNombre.toLowerCase().includes(q)||p.plan.includes(q));
  if(method) list=list.filter(p=>p.metodo===method);
  if(sort==='fecha') list.sort((a,b)=>new Date(b.fecha)-new Date(a.fecha));
  if(sort==='monto') list.sort((a,b)=>b.monto-a.monto);
  if(sort==='nombre') list.sort((a,b)=>a.clienteNombre.localeCompare(b.clienteNombre));
  return list;
}

function renderPayments(){
  const list=getFilteredPayments();
  const container=document.getElementById('payments-container');
  const badge=document.getElementById('pending-badge');
  if(badge) badge.textContent=`${list.length} pendientes`;
  const bc=document.getElementById('badge-count');
  if(bc) bc.textContent=list.length;

  updateBulkUI();

  if(list.length===0){
    container.innerHTML=`
      <div class="text-center py-12">
        <svg class="mx-auto mb-4 text-green-500" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <h3 class="font-semibold text-gray-800 mb-1">Todo validado</h3>
        <p class="text-gray-600">No hay pagos pendientes por validar</p>
      </div>`;
    return;
  }

  const selectAllChecked=selectedPaymentIds.size===list.length&&list.length>0;
  container.innerHTML=`
    <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border mb-3">
      <input type="checkbox" ${selectAllChecked?'checked':''} onchange="toggleSelectAll()" />
      <span class="text-sm font-medium">Seleccionar todos (${list.length})</span>
    </div>
    ${list.map((p,i)=>`
      <div class="payment-row ${selectedPaymentIds.has(p.id)?'selected':''}" id="prow-${p.id}">
        <div class="flex items-start gap-4">
          <input type="checkbox" class="mt-1" ${selectedPaymentIds.has(p.id)?'checked':''} onchange="togglePayment('${p.id}')" />
          <div class="flex-1 grid md:grid-cols-12 gap-4 items-center cursor-pointer" onclick="openPayment(${i})">
            <div class="md:col-span-3">
              <div class="flex items-center gap-2 mb-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span class="font-semibold text-sm">${p.clienteNombre}</span>
              </div>
              <span class="badge badge-blue" style="font-size:11px;">${p.plan}</span>
            </div>
            <div class="md:col-span-2">
              <span class="text-green-600 font-semibold text-sm">$${p.monto.toLocaleString('es-CO')}</span>
            </div>
            <div class="md:col-span-2 text-sm text-gray-600">${p.metodo}</div>
            <div class="md:col-span-2 text-sm text-gray-600">${formatDate(p.fecha,'short')}</div>
            <div class="md:col-span-1"></div>
            <div class="md:col-span-2 flex gap-2" onclick="event.stopPropagation()">
              <button class="btn btn-sm" onclick="openPayment(${i})" title="Ver">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button class="btn btn-sm btn-green" onclick="validatePayment('${p.id}','aprobado')" title="Aprobar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </button>
              <button class="btn btn-sm btn-red" onclick="validatePayment('${p.id}','rechazado')" title="Rechazar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('')}
  `;
}

function validatePayment(id, status){
  const p=payments.find(x=>x.id===id);
  if(!p) return;
  p.status=status;
  selectedPaymentIds.delete(id);
  showToast(status==='aprobado'?`Pago aprobado: ${p.clienteNombre}`:`Pago rechazado: ${p.clienteNombre}`, status==='aprobado'?'green':'red');
  renderPayments();
  renderStats();
}

function bulkAction(status){
  if(selectedPaymentIds.size===0) return;
  const count=selectedPaymentIds.size;
  selectedPaymentIds.forEach(id=>{ const p=payments.find(x=>x.id===id); if(p) p.status=status; });
  selectedPaymentIds=new Set();
  showToast(status==='aprobado'?`${count} pagos aprobados`:` ${count} pagos rechazados`, status==='aprobado'?'green':'red');
  renderPayments();
  renderStats();
}

function togglePayment(id){
  if(selectedPaymentIds.has(id)) selectedPaymentIds.delete(id);
  else selectedPaymentIds.add(id);
  updateBulkUI();
  const row=document.getElementById(`prow-${id}`);
  if(row) row.classList.toggle('selected', selectedPaymentIds.has(id));
}

function toggleSelectAll(){
  const list=getFilteredPayments();
  if(selectedPaymentIds.size===list.length) selectedPaymentIds=new Set();
  else list.forEach(p=>selectedPaymentIds.add(p.id));
  renderPayments();
}

function updateBulkUI(){
  const n=selectedPaymentIds.size;
  const ba=document.getElementById('bulk-actions');
  const sl=document.getElementById('selected-count-label');
  if(ba){ ba.classList.toggle('hidden',n===0); ba.style.display=n>0?'flex':'none'; }
  if(sl){ sl.classList.toggle('hidden',n===0); sl.textContent=`${n} seleccionados`; }
  const al=document.getElementById('approve-bulk-label');
  const rl=document.getElementById('reject-bulk-label');
  if(al) al.textContent=`Aprobar ${n}`;
  if(rl) rl.textContent=`Rechazar ${n}`;
}

// ─── Payment Modal ──────────────────────────────────────────────────────────────
function openPayment(index){
  const list=getFilteredPayments();
  if(index<0||index>=list.length) return;
  currentPaymentIndex=index;
  const p=list[index];
  document.getElementById('pay-nav-label').textContent=`${index+1} / ${list.length}`;
  document.getElementById('pay-prev').disabled=index===0;
  document.getElementById('pay-next').disabled=index===list.length-1;

  document.getElementById('modal-payment-content').innerHTML=`
    <div class="space-y-4">
      <h3 class="font-semibold">Comprobante de Pago</h3>
      <div class="border rounded-lg flex items-center justify-center bg-gray-100" style="min-height:200px;">
        <div class="text-center text-gray-400 p-8">
          <svg class="mx-auto mb-2" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <div class="text-sm">Imagen del comprobante</div>
        </div>
      </div>
    </div>
    <div class="space-y-4">
      <h3 class="font-semibold">Información del Pago</h3>
      <div class="bg-gray-50 p-4 rounded-lg space-y-3">
        <div>
          <div class="text-xs text-gray-500">Cliente</div>
          <div class="font-semibold text-lg">${p.clienteNombre}</div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <div class="text-xs text-gray-500">Monto</div>
            <div class="font-semibold text-green-600 text-xl">$${p.monto.toLocaleString('es-CO')}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Método</div>
            <div class="font-semibold">${p.metodo}</div>
          </div>
        </div>
        <div>
          <div class="text-xs text-gray-500">Plan</div>
          <div class="font-semibold">${p.plan}</div>
        </div>
        <div>
          <div class="text-xs text-gray-500">Fecha</div>
          <div class="font-semibold">${formatDate(p.fecha,'long')}</div>
        </div>
        ${p.notas?`<div><div class="text-xs text-gray-500">Notas</div><div class="text-sm">${p.notas}</div></div>`:''}
      </div>
      <div class="space-y-2 pt-4 border-t">
        <button class="btn btn-green w-full justify-center py-3 text-base" style="width:100%" onclick="quickApprove('${p.id}')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Aprobar y Continuar
        </button>
        <div class="grid grid-cols-2 gap-2">
          <button class="btn justify-center" style="border-color:#16a34a;color:#16a34a;" onclick="validatePaymentModal('${p.id}','aprobado')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Solo Aprobar
          </button>
          <button class="btn btn-red justify-center" onclick="validatePaymentModal('${p.id}','rechazado')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            Rechazar
          </button>
        </div>
      </div>
      <div class="text-sm p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="font-semibold text-blue-900 mb-2">Atajos de Teclado:</div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div><kbd>←</kbd> <kbd>→</kbd> Navegar</div>
          <div><kbd>A</kbd> Aprobar y continuar</div>
          <div><kbd>R</kbd> Rechazar</div>
          <div><kbd>ESC</kbd> Cerrar</div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('modal-payment').classList.add('open');
}

function validatePaymentModal(id, status){
  validatePayment(id, status);
  document.getElementById('modal-payment').classList.remove('open');
}

function quickApprove(id){
  validatePayment(id, 'aprobado');
  const list=getFilteredPayments();
  if(currentPaymentIndex<list.length){
    openPayment(currentPaymentIndex);
  } else if(list.length>0){
    openPayment(list.length-1);
  } else {
    document.getElementById('modal-payment').classList.remove('open');
  }
}

function navigatePayment(dir){
  const list=getFilteredPayments();
  const next=currentPaymentIndex+dir;
  if(next>=0&&next<list.length) openPayment(next);
}

function closePaymentModal(e){
  if(e.target===document.getElementById('modal-payment')) document.getElementById('modal-payment').classList.remove('open');
}

// ─── Keyboard shortcuts ──────────────────────────────────────────────────────
document.addEventListener('keydown',e=>{
  const modal=document.getElementById('modal-payment');
  if(!modal.classList.contains('open')) return;
  if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement) return;
  const list=getFilteredPayments();
  const p=list[currentPaymentIndex];
  switch(e.key){
    case 'ArrowLeft': e.preventDefault(); navigatePayment(-1); break;
    case 'ArrowRight': e.preventDefault(); navigatePayment(1); break;
    case 'a': case 'A': e.preventDefault(); if(p) quickApprove(p.id); break;
    case 'r': case 'R': e.preventDefault(); if(p) validatePaymentModal(p.id,'rechazado'); break;
    case 'Escape': e.preventDefault(); modal.classList.remove('open'); break;
  }
});

// ─── Clients ───────────────────────────────────────────────────────────────────
let clientPage=0;
let clientPageSize=25;
let clientSort={key:'nombre',dir:1};

function getFilteredClients(){
  const q=(document.getElementById('client-search')?.value||'').toLowerCase();
  const st=document.getElementById('client-status')?.value||'';
  const pl=document.getElementById('client-plan')?.value||'';
  let list=ALL_CLIENTS.filter(c=>{
    if(st&&c.status!==st) return false;
    if(pl&&c.plan!==pl) return false;
    if(q&&!c.nombre.toLowerCase().includes(q)&&!c.telefono.includes(q)&&!c.direccion.toLowerCase().includes(q)) return false;
    return true;
  });
  const k=clientSort.key;
  list.sort((a,b)=>{
    let va=a[k],vb=b[k];
    if(typeof va==='string') return va.localeCompare(vb)*clientSort.dir;
    return (va-vb)*clientSort.dir;
  });
  return list;
}

function sortClients(key){
  if(clientSort.key===key) clientSort.dir*=-1;
  else { clientSort.key=key; clientSort.dir=1; }
  clientPage=0;
  renderClients();
}

function renderClients(){
  const list=getFilteredClients();
  const total=list.length;
  const pages=Math.ceil(total/clientPageSize)||1;
  if(clientPage>=pages) clientPage=pages-1;
  const start=clientPage*clientPageSize;
  const end=Math.min(start+clientPageSize,total);
  const page=list.slice(start,end);

  document.getElementById('clients-total').textContent=total;
  document.getElementById('clients-count').textContent=`(${ALL_CLIENTS.length})`;
  document.getElementById('pagination-info').textContent=`Mostrando ${start+1} a ${end} de ${total} clientes`;
  document.getElementById('page-label').textContent=`Página ${clientPage+1} de ${pages}`;

  const statusBadge={
    activo:'badge-green',pendiente:'badge-yellow',vencido:'badge-red',cancelado:'badge-gray'
  };
  const planLabel={semanal:'Semanal',quincenal:'Quincenal',mensual:'Mensual'};

  const tbody=document.getElementById('clients-tbody');
  tbody.innerHTML=page.map(c=>`
    <tr class="border-t">
      <td class="px-4 py-3">
        <div class="font-medium text-sm">${c.nombre}</div>
        <div class="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.46 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.37 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.37a16 16 0 0 0 6.72 6.72l1.74-1.74a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 23 16.92z"/></svg>
          ${c.telefono}
        </div>
        ${c.alergias||c.restricciones?`<div class="text-xs text-yellow-600 mt-0.5">⚠ ${c.alergias?'Alergias':'Restricciones'}</div>`:''}
      </td>
      <td class="px-4 py-3"><span class="badge ${statusBadge[c.status]||'badge-gray'}">${c.status.toUpperCase()}</span></td>
      <td class="px-4 py-3"><span class="badge badge-outline">${planLabel[c.plan]||c.plan}</span></td>
      <td class="px-4 py-3 font-semibold text-sm ${c.diasRestantes<=0?'text-red-600':c.diasRestantes<=5?'text-yellow-600':'text-green-600'}">${c.diasRestantes>0?c.diasRestantes+'d':'Vencido'}</td>
      <td class="px-4 py-3 text-sm">${formatDate(c.fechaVencimiento,'medium')}</td>
      <td class="px-4 py-3 text-sm text-gray-600" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${c.direccion}">${c.direccion}</td>
      <td class="px-4 py-3">
        <button class="btn btn-sm" onclick="openClientModal('${c.id}')">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Ver
        </button>
      </td>
    </tr>
  `).join('');
}

function goToPage(dir){
  const list=getFilteredClients();
  const pages=Math.ceil(list.length/clientPageSize)||1;
  if(dir==='first') clientPage=0;
  else if(dir==='prev') clientPage=Math.max(0,clientPage-1);
  else if(dir==='next') clientPage=Math.min(pages-1,clientPage+1);
  else if(dir==='last') clientPage=pages-1;
  renderClients();
}

function changePageSize(){
  clientPageSize=parseInt(document.getElementById('page-size').value);
  clientPage=0;
  renderClients();
}

// ─── Client Modal ──────────────────────────────────────────────────────────────
function openClientModal(id){
  const c=ALL_CLIENTS.find(x=>x.id===id);
  if(!c) return;
  const statusCls={activo:'badge-green',pendiente:'badge-yellow',vencido:'badge-red',cancelado:'badge-gray'};
  const planLabel={semanal:'Semanal (5 días)',quincenal:'Quincenal (10 días)',mensual:'Mensual (20 días)'};
  const planPrice={semanal:75000,quincenal:150000,mensual:285000};

  document.getElementById('modal-client-content').innerHTML=`
    <div class="space-y-5">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-xl font-bold mb-2">${c.nombre}</h2>
          <div class="flex gap-2 flex-wrap">
            <span class="badge ${statusCls[c.status]||'badge-gray'}">${c.status.toUpperCase()}</span>
            <span class="badge badge-outline">${planLabel[c.plan]||c.plan}</span>
          </div>
        </div>
        ${c.diasRestantes<=5&&c.status==='activo'?`
          <div class="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-center">
            <svg class="mx-auto mb-1 text-yellow-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div class="text-xs font-semibold text-yellow-800">${c.diasRestantes} días restantes</div>
          </div>`:''
        }
      </div>
      <hr/>
      <!-- Contacto e Identificación -->
      <div>
        <h3 class="font-semibold mb-2 flex items-center gap-2 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.46 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.37 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.37a16 16 0 0 0 6.72 6.72l1.74-1.74a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 23 16.92z"/></svg>
          Información Personal
        </h3>
        <div class="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm mb-4">
          <div>
            <div class="text-xs text-gray-500 mb-0.5">Cédula</div>
            <div class="font-medium">${c.cedula}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-0.5">Correo Electrónico</div>
            <a href="mailto:${c.correo}" class="font-medium text-blue-600 hover:underline">${c.correo}</a>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-0.5">Teléfono (Celular)</div>
            <a href="https://wa.me/57${c.telefono}" target="_blank" class="font-medium text-green-600 hover:underline">${c.telefono}</a>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-0.5">Facturación Electrónica</div>
            <div class="font-medium">${c.facturacionElectronica}</div>
          </div>
        </div>
        <h3 class="font-semibold mb-2 flex items-center gap-2 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Información de Entrega
        </h3>
        <div class="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm">
          <div>
            <div class="text-xs text-gray-500 mb-0.5">Dirección</div>
            <div class="font-medium">${c.direccion}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-0.5">Barrio/Sector</div>
            <div class="font-medium">${c.barrio}</div>
          </div>
        </div>
      </div>
      <!-- Plan -->
      <div>
        <h3 class="font-semibold mb-2 text-sm">Plan Actual</h3>
        <div class="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg text-sm">
          <div><div class="text-xs text-gray-500">Tipo</div><div class="font-medium">${planLabel[c.plan]||c.plan}</div></div>
          <div><div class="text-xs text-gray-500">Valor</div><div class="font-medium text-green-600">$${planPrice[c.plan].toLocaleString('es-CO')} COP</div></div>
          <div><div class="text-xs text-gray-500">Días Rest.</div><div class="font-medium ${c.diasRestantes<=5?'text-red-600':''}">${c.diasRestantes>0?c.diasRestantes+' días':'Vencido'}</div></div>
        </div>
      </div>
      <!-- Fechas -->
      <div>
        <h3 class="font-semibold mb-2 text-sm">Fechas del Servicio</h3>
        <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm">
          <div><div class="text-xs text-gray-500">Inicio</div><div class="font-medium">${formatDate(c.fechaInicio,'long')}</div></div>
          <div><div class="text-xs text-gray-500">Vencimiento</div><div class="font-medium ${c.diasRestantes<=0?'text-red-600':''}">${formatDate(c.fechaVencimiento,'long')}</div></div>
        </div>
      </div>
      <!-- Alergias -->
      ${c.alergias||c.restricciones?`
        <div>
          <h3 class="font-semibold mb-2 text-sm">Restricciones Alimentarias</h3>
          <div class="space-y-2">
            ${c.alergias?`<div class="bg-red-50 border-2 border-red-300 p-3 rounded-lg text-sm"><div class="font-semibold text-red-800 mb-1">⚠️ ALERGIAS (IMPORTANTE)</div><div class="text-red-900">${c.alergias}</div></div>`:''}
            ${c.restricciones?`<div class="bg-yellow-50 border border-yellow-300 p-3 rounded-lg text-sm"><div class="font-semibold text-yellow-800 mb-1">Restricciones</div><div class="text-yellow-900">${c.restricciones}</div></div>`:''}
          </div>
        </div>`:''}
      <!-- Historial pagos -->
      <div>
        <h3 class="font-semibold mb-2 text-sm">Historial de Pagos</h3>
        ${c.historialPagos.length===0?`
          <div class="bg-gray-50 p-6 rounded-lg text-center text-gray-500 text-sm">
            <svg class="mx-auto mb-2 text-gray-300" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            No hay pagos registrados
          </div>`:
          c.historialPagos.map(p=>`
            <div class="bg-gray-50 border rounded-lg p-3 mb-2 text-sm">
              <div class="flex justify-between mb-2">
                <div class="font-medium">${p.plan}</div>
                <span class="badge ${p.status==='aprobado'?'badge-green':'badge-yellow'}">${p.status}</span>
              </div>
              <div class="grid grid-cols-3 gap-2 text-xs text-gray-600">
                <div><div class="text-gray-400">Monto</div><div class="font-medium text-green-600">$${p.monto.toLocaleString('es-CO')}</div></div>
                <div><div class="text-gray-400">Método</div><div>${p.metodo}</div></div>
                <div><div class="text-gray-400">Fecha</div><div>${formatDate(p.fecha,'short')}</div></div>
              </div>
            </div>`).join('')
        }
      </div>
    </div>
  `;
  document.getElementById('modal-client').classList.add('open');
}

function closeClientModal(e){
  if(e.target===document.getElementById('modal-client')) document.getElementById('modal-client').classList.remove('open');
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────
function switchTab(tab, btn){
  document.querySelectorAll('.tab-content').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el=>el.classList.remove('active'));
  document.getElementById('tab-'+tab).classList.add('active');
  btn.classList.add('active');
  if(tab==='clientes') renderClients();
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(str, style){
  if(!str) return '';
  const d=new Date(str+'T12:00:00');
  if(style==='long') return d.toLocaleDateString('es-CO',{year:'numeric',month:'long',day:'numeric'});
  if(style==='medium') return d.toLocaleDateString('es-CO',{month:'short',day:'numeric',year:'numeric'});
  return d.toLocaleDateString('es-CO',{month:'short',day:'numeric'});
}

let toastTimeout;
function showToast(msg, color){
  let t=document.getElementById('toast');
  if(!t){ t=document.createElement('div'); t.id='toast'; t.style.cssText='position:fixed;bottom:24px;right:24px;z-index:999;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:500;color:white;box-shadow:0 4px 12px rgba(0,0,0,.15);transition:opacity .3s;'; document.body.appendChild(t); }
  t.textContent=msg;
  t.style.background=color==='green'?'#16a34a':'#dc2626';
  t.style.opacity='1';
  clearTimeout(toastTimeout);
  toastTimeout=setTimeout(()=>{ t.style.opacity='0'; }, 3000);
}

function exportCSV(type){
  showToast(`📊 Exportando ${type}...`,'green');
}

// ─── Init ──────────────────────────────────────────────────────────────────────
renderStats();
renderPayments();