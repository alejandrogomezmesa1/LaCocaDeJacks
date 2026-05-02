
// ── FAQ ────────────────────────────────────────────────────────────────────────
const faqs = [
    { q: '¿Cómo funciona el sistema de intercambio de cocas?', a: 'Las "cocas" son envases reutilizables que te entregamos con tu almuerzo. Cuando recibes la coca llena para el día siguiente, entregas la del día anterior limpia y seca. Son dos juegos en rotación para que siempre tengas uno disponible.' },
    { q: '¿Qué pasa si un día no necesito el servicio?', a: 'No se hacen ajustes ni reembolsos por días no utilizados. El plan se contrata por adelantado y no se puede pausar. Si sabes que no necesitarás el servicio ciertos días, te recomendamos el plan semanal.' },
    { q: '¿Puedo elegir el menú cada día?', a: 'El menú es rotativo y fijo para todos. Cada miércoles compartimos el menú de la siguiente semana en el grupo de WhatsApp. Solo aceptamos restricciones principales (no cerdo, no pollo) pero no personalizaciones específicas como "sin cilantro".' },
    { q: '¿A qué hora llega el domiciliario?', a: 'El domiciliario te llama 5 minutos antes de llegar. El horario de entrega es durante la jornada laboral (generalmente entre 11:30am y 1:30pm). El encuentro es en la calle, no subimos a apartamentos u oficinas.' },
    { q: '¿Qué incluye cada almuerzo?', a: 'Cada almuerzo incluye sopa, seco (arroz, proteína y ensalada) y jugo natural. Las proteínas rotan: 3 días cerdo, 1 día res, 1 día pollo semanalmente.' },
    { q: '¿Cómo hago el pago?', a: 'Después de registrarte, te enviamos por WhatsApp los datos para transferencia (Nequi, Bancolombia, Daviplata). Envías el comprobante y validamos tu pago. Para iniciar necesitas pagar el plan + las cocas (total $145.000). Las renovaciones solo incluyen el plan.' },
    { q: '¿Tienen en cuenta alergias alimentarias?', a: 'Sí, las alergias son muy importantes para nosotros. Registra tus alergias en el formulario y las tendremos en cuenta en la preparación. Para tu seguridad, confirmamos contigo antes de cada entrega.' },
    { q: '¿Qué pasa si pierdo o rompo una coca?', a: 'Debes reponer la coca perdida o dañada. El costo es de $35.000 por envase. Puedes conseguirla por tu cuenta siempre que cumpla con los tamaños estándar, o te facilitamos una nueva.' },
    { q: '¿Puedo cambiar de plan?', a: 'Sí, puedes cambiar de plan al finalizar tu período actual. Avísanos con anticipación para coordinar el cambio y el nuevo valor a pagar.' },
    { q: '¿Hay descuentos por contratar varios meses?', a: 'El plan mensual ya incluye un ahorro de $15.000 comparado con contratar 4 semanas separadas. Es nuestro mejor precio.' }
];

const faqList = document.getElementById('faq-list');
faqList.innerHTML = faqs.map((f, i) => `
  <div class="faq-item" id="faq-${i}">
    <button class="faq-trigger" onclick="toggleFaq(${i})">
      <span>${f.q}</span>
      <svg class="faq-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <div class="faq-content" id="faq-content-${i}">
      <p style="color:#4b5563;line-height:1.7;font-size:15px;">${f.a}</p>
    </div>
  </div>
`).join('');

function toggleFaq(i) {
    const item = document.getElementById(`faq-${i}`);
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
}

// ── Plans ──────────────────────────────────────────────────────────────────────
const planData = {
    semanal: { name: 'Semanal', price: 75000, days: 5 },
    quincenal: { name: 'Quincenal', price: 150000, days: 10 },
    mensual: { name: 'Mensual', price: 285000, days: 20 }
};
let currentPlan = 'quincenal';

function selectPlan(id) {
    currentPlan = id;
    ['semanal', 'quincenal', 'mensual'].forEach(p => {
        const el = document.getElementById(`plan-${p}`);
        const btn = document.getElementById(`btn-${p}`);
        if (p === id) {
            el.classList.add('selected');
            btn.className = 'btn btn-orange w-full justify-center';
            btn.style.width = '100%';
            btn.innerHTML = `Seleccionado <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
        } else {
            el.classList.remove('selected');
            btn.className = 'btn btn-gray w-full justify-center';
            btn.style.width = '100%';
            btn.innerHTML = `Seleccionar Plan <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
        }
    });
    const plan = planData[id];
    document.getElementById('selected-plan-price').textContent = `$${plan.price.toLocaleString('es-CO')}`;
    document.getElementById('total-price').textContent = `Total: $${(plan.price + 70000).toLocaleString('es-CO')}`;
}

// ── Wizard ─────────────────────────────────────────────────────────────────────
let wizardStep = 1;
const totalSteps = 4;
let formData = { 
    nombre: '', 
    documento: '',
    facturacion: false,
    telefono: '', 
    email: '',
    tipoEntrega: 'fija', // 'fija' o 'hibrida'
    direccion: '', 
    direccion2: '', // Solo si es hibrida
    diasDireccion: '', // Solo si es hibrida
    barrio: '',
    plan: 'quincenal', 
    alergias: '', 
    restricciones: '',
    tieneCocas: false, // true = ya las tengo, false = desea comprarlas
    comprobanteName: '' 
};

function openWizard(plan) {
    if (plan) { formData.plan = plan; currentPlan = plan; }
    else formData.plan = currentPlan;
    wizardStep = 1;
    document.getElementById('modal-wizard').classList.add('open');
    renderWizard();
}

function closeWizard() {
    document.getElementById('modal-wizard').classList.remove('open');
}

function closeWizardOutside(e) {
    if (e.target === document.getElementById('modal-wizard')) closeWizard();
}

function renderWizard() {
    const pct = Math.round((wizardStep / totalSteps) * 100);
    document.getElementById('step-label').textContent = `Paso ${wizardStep} de ${totalSteps}`;
    document.getElementById('step-pct').textContent = `${pct}% completado`;
    document.getElementById('progress-fill').style.width = `${pct}%`;
    document.getElementById('btn-back').disabled = wizardStep === 1;
    document.getElementById('btn-next').innerHTML = wizardStep === totalSteps
        ? `Confirmar Reserva <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
        : `Siguiente <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;

    // Dots
    const steps = ['Personal', 'Contacto', 'Entrega', 'Confirmación'];
    document.getElementById('dot-container').innerHTML = `<div style="display:flex;justify-content:space-between;width:100%;align-items:center;">${steps.map((s, i) => {
        const n = i + 1;
        const cls = n < wizardStep ? 'done' : n === wizardStep ? 'active' : 'inactive';
        return `<div style="display:flex;flex-direction:column;align-items:center;flex:1;">
      <div class="step-dot ${cls}">${n < wizardStep ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' : n}</div>
      <div style="font-size:11px;margin-top:6px;${n === wizardStep ? 'font-weight:700' : 'color:#9ca3af'}">${s}</div>
    </div>`;
    }).join('')}</div>`;

    // Content
    const c = document.getElementById('wizard-content');
    if (wizardStep === 1) {
        c.innerHTML = `
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;display:flex;align-items:flex-start;gap:12px;margin-bottom:24px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" style="flex-shrink:0;margin-top:2px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <div><h4 style="font-weight:700;margin-bottom:4px;">Información Personal</h4><p style="font-size:13px;color:#6b7280;">Comencemos con tus datos legales y el plan</p></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
        <div>
          <label style="display:block;font-weight:600;margin-bottom:8px;font-size:14px;">Nombre Completo *</label>
          <input type="text" value="${formData.nombre}" placeholder="Ej: María González" style="width:100%;padding:12px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:14px;" oninput="formData.nombre=this.value" />
        </div>
        <div>
          <label style="display:block;font-weight:600;margin-bottom:8px;font-size:14px;">Cédula / Documento *</label>
          <input type="text" value="${formData.documento}" placeholder="Ej: 1017..." style="width:100%;padding:12px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:14px;" oninput="formData.documento=this.value.replace(/\\D/g,'')" />
        </div>
      </div>
      <div style="margin-bottom:20px;">
        <label style="display:block;font-weight:600;margin-bottom:10px;font-size:14px;">Selecciona tu Plan *</label>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
          ${Object.entries(planData).map(([k, p]) => `
            <button onclick="formData.plan='${k}';renderWizard()" style="padding:12px 8px;border-radius:10px;border:2px solid ${formData.plan === k ? '#f97316' : '#e5e7eb'};background:${formData.plan === k ? '#fff7ed' : 'white'};cursor:pointer;transition:all .15s;text-align:left;">
              <div style="font-weight:700;font-size:12px;">${p.name}</div>
              <div style="color:#ea580c;font-weight:800;margin-top:4px;font-size:14px;">$${(p.price / 1000).toFixed(0)}K</div>
            </button>`).join('')}
        </div>
      </div>
      <div style="background:#f9fafb;padding:14px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;">
        <div>
            <div style="font-weight:700;font-size:14px;">¿Requiere Facturación Electrónica?</div>
            <div style="font-size:12px;color:#6b7280;">Te pediremos los datos por WhatsApp</div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" ${formData.facturacion ? 'checked' : ''} class="sr-only peer" onchange="formData.facturacion=this.checked">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
        </label>
      </div>`;
    } else if (wizardStep === 2) {
        c.innerHTML = `
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;display:flex;align-items:flex-start;gap:12px;margin-bottom:24px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" style="flex-shrink:0;margin-top:2px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.69 18a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 3.18 2 2 0 0 1 4.11 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.37a16 16 0 0 0 6.72 6.72l1.74-1.74a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 23 16.92z"/></svg>
        <div><h4 style="font-weight:700;margin-bottom:4px;">Información de Contacto</h4><p style="font-size:13px;color:#6b7280;">Vital para el respaldo de tu información</p></div>
      </div>
      <div style="margin-bottom:20px;">
        <label style="display:block;font-weight:600;margin-bottom:8px;">Correo Electrónico *</label>
        <input type="email" value="${formData.email}" placeholder="ejemplo@correo.com" style="width:100%;padding:14px 16px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:15px;" oninput="formData.email=this.value" />
      </div>
      <div>
        <label style="display:block;font-weight:600;margin-bottom:8px;">Teléfono (WhatsApp) *</label>
        <input id="w-telefono" type="tel" value="${formData.telefono}" placeholder="3001234567" style="width:100%;padding:14px 16px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:15px;" oninput="formData.telefono=this.value.replace(/\\D/g,'').slice(0,10);this.value=formData.telefono;" />
        <p style="margin-top:10px;font-size:13px;color:#6b7280;display:flex;align-items:center;gap:6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Te enviaremos el menú semanal por WhatsApp
        </p>
      </div>`;
    } else if (wizardStep === 3) {
        c.innerHTML = `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;display:flex;align-items:flex-start;gap:12px;margin-bottom:24px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" style="flex-shrink:0;margin-top:2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <div><h4 style="font-weight:700;margin-bottom:4px;">Dirección de Entrega</h4><p style="font-size:13px;color:#6b7280;">Logística específica de entrega</p></div>
      </div>
      
      <div style="margin-bottom:20px;">
        <label style="display:block;font-weight:600;margin-bottom:10px;font-size:14px;">Tipo de Entrega *</label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <button onclick="formData.tipoEntrega='fija';renderWizard()" style="padding:14px;border-radius:12px;border:2px solid ${formData.tipoEntrega === 'fija' ? '#16a34a' : '#e5e7eb'};background:${formData.tipoEntrega === 'fija' ? '#f0fdf4' : 'white'};text-align:left;transition:all .2s;">
            <div style="font-weight:800;font-size:13px;margin-bottom:2px;">Dirección Fija</div>
            <div style="font-size:11px;color:#6b7280;">Un solo lugar siempre</div>
          </button>
          <button onclick="formData.tipoEntrega='hibrida';renderWizard()" style="padding:14px;border-radius:12px;border:2px solid ${formData.tipoEntrega === 'hibrida' ? '#16a34a' : '#e5e7eb'};background:${formData.tipoEntrega === 'hibrida' ? '#f0fdf4' : 'white'};text-align:left;transition:all .2s;">
            <div style="font-weight:800;font-size:13px;margin-bottom:2px;">Dirección Híbrida</div>
            <div style="font-size:11px;color:#6b7280;">Dos lugares según el día</div>
          </button>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:12px;margin-bottom:16px;">
        <div>
          <label style="display:block;font-weight:600;margin-bottom:8px;font-size:14px;">Dirección Completa *</label>
          <input type="text" value="${formData.direccion}" placeholder="Calle 50 #30-20..." style="width:100%;padding:12px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:14px;" oninput="formData.direccion=this.value" />
        </div>
        <div>
          <label style="display:block;font-weight:600;margin-bottom:8px;font-size:14px;">Barrio / Sector *</label>
          <input type="text" value="${formData.barrio}" placeholder="Ej: El Poblado" style="width:100%;padding:12px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:14px;" oninput="formData.barrio=this.value" />
        </div>
      </div>

      ${formData.tipoEntrega === 'hibrida' ? `
      <div style="background:#f9fafb;border:1px dashed #d1d5db;border-radius:12px;padding:16px;margin-bottom:16px;">
        <div style="margin-bottom:12px;">
          <label style="display:block;font-weight:600;margin-bottom:6px;font-size:13px;">Segunda Dirección / Días</label>
          <textarea placeholder="Ej: Martes y Jueves en Cra 43 #10-50, Ed. Coltejer" rows="2" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;" oninput="formData.direccion2=this.value">${formData.direccion2}</textarea>
        </div>
        <p style="font-size:11px;color:#6b7280;">Opcional: Si no estás seguro, puedes informarnos los detalles por WhatsApp.</p>
      </div>` : ''}

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div>
          <label style="font-size:13px;color:#6b7280;margin-bottom:6px;display:block;font-weight:600;">Alergias</label>
          <input value="${formData.alergias}" placeholder="Ej: Mariscos" style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:14px;" oninput="formData.alergias=this.value" />
        </div>
        <div>
          <label style="font-size:13px;color:#6b7280;margin-bottom:6px;display:block;font-weight:600;">Restricciones</label>
          <input value="${formData.restricciones}" placeholder="Ej: No cerdo" style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:14px;" oninput="formData.restricciones=this.value" />
        </div>
      </div>`;
    } else {
        const plan = planData[formData.plan];
        const cocasPrice = formData.tieneCocas ? 0 : 70000;
        const total = plan.price + cocasPrice;
        
        c.innerHTML = `
      <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:16px;display:flex;align-items:flex-start;gap:12px;margin-bottom:20px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9333ea" stroke-width="2" style="flex-shrink:0;margin-top:2px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        <div><h4 style="font-weight:700;margin-bottom:4px;">Confirmación y Pago</h4><p style="font-size:13px;color:#6b7280;">Finaliza tu proceso de reserva</p></div>
      </div>

      <div style="background:#fffbeb;border:1px solid #fef08a;border-radius:14px;padding:16px;margin-bottom:20px;">
        <label style="display:block;font-weight:700;margin-bottom:12px;font-size:14px;">¿Tienes los 2 juegos de cocas exigidos?</label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <button onclick="formData.tieneCocas=true;renderWizard()" style="padding:10px;border-radius:10px;border:2px solid ${formData.tieneCocas ? '#ea580c' : '#e5e7eb'};background:${formData.tieneCocas ? '#fff7ed' : 'white'};transition:all .2s;">
            <div style="font-weight:700;font-size:12px;">Ya los tengo</div>
            <div style="font-size:11px;color:#6b7280;">$0 adicionales</div>
          </button>
          <button onclick="formData.tieneCocas=false;renderWizard()" style="padding:10px;border-radius:10px;border:2px solid ${!formData.tieneCocas ? '#ea580c' : '#e5e7eb'};background:${!formData.tieneCocas ? '#fff7ed' : 'white'};transition:all .2s;">
            <div style="font-weight:700;font-size:12px;">Deseo comprarlos</div>
            <div style="font-size:11px;color:#6b7280;">+$70.000</div>
          </button>
        </div>
      </div>

      <div style="margin-bottom:20px;">
        <label style="display:block;font-weight:700;margin-bottom:10px;font-size:14px;">Subir Comprobante de Pago</label>
        <div style="border:2px dashed #e5e7eb;border-radius:12px;padding:20px;text-align:center;cursor:pointer;position:relative;" onclick="document.getElementById('file-upload').click()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" style="margin:0 auto 8px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <div style="font-size:13px;color:#4b5563;">${formData.comprobanteName || 'Haz clic para adjuntar imagen'}</div>
            <input type="file" id="file-upload" style="display:none" onchange="formData.comprobanteName=this.files[0].name;renderWizard()">
        </div>
      </div>

      <div style="background:linear-gradient(135deg,#fff,#f9fafb);border:2px solid #ea580c;border-radius:14px;padding:20px;box-shadow:0 4px 12px rgba(234,88,12,0.1);">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;">
          <span style="color:#6b7280;">Plan ${plan.name}</span>
          <span style="font-weight:700;">$${plan.price.toLocaleString('es-CO')}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;">
          <span style="color:#6b7280;">Juego de cocas</span>
          <span style="font-weight:700;">${formData.tieneCocas ? '$0' : '$70.000'}</span>
        </div>
        <div style="border-top:1px solid #e5e7eb;padding-top:12px;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:800;font-size:1.1rem;">Total a pagar</span>
          <span style="font-weight:900;font-size:1.2rem;color:#ea580c;">$${total.toLocaleString('es-CO')}</span>
        </div>
      </div>`;
    }
}

function wizardNext() {
    if (wizardStep === 1) {
        if (!formData.nombre.trim()) { showToast('Por favor ingresa tu nombre', 'red'); return; }
        if (!formData.documento.trim()) { showToast('Por favor ingresa tu documento', 'red'); return; }
    }
    if (wizardStep === 2) {
        if (!formData.email.trim() || !formData.email.includes('@')) { showToast('Por favor ingresa un correo válido', 'red'); return; }
        if (formData.telefono.length !== 10) { showToast('Por favor ingresa un teléfono válido de 10 dígitos', 'red'); return; }
    }
    if (wizardStep === 3) {
        if (!formData.direccion.trim()) { showToast('Por favor ingresa tu dirección', 'red'); return; }
        if (!formData.barrio.trim()) { showToast('Por favor ingresa tu barrio/sector', 'red'); return; }
    }
    if (wizardStep < totalSteps) { wizardStep++; renderWizard(); }
    else { wizardSubmit(); }
}

function wizardBack() {
    if (wizardStep > 1) { wizardStep--; renderWizard(); }
}

function wizardSubmit() {
    closeWizard();
    showToast('<div style="display:flex;align-items:center;gap:8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> ¡Reserva exitosa! Te contactaremos por WhatsApp.</div>', 'green');
    formData = { 
        nombre: '', documento: '', facturacion: false, telefono: '', email: '', 
        tipoEntrega: 'fija', direccion: '', direccion2: '', diasDireccion: '', 
        barrio: '', plan: 'quincenal', alergias: '', restricciones: '', 
        tieneCocas: false, comprobanteName: '' 
    };
    wizardStep = 1;
}

// ── Navbar scroll ──────────────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
});

// ── Scroll reveal ──────────────────────────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── Toast ──────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, color = 'green') {
    const t = document.getElementById('toast');
    t.innerHTML = msg;
    t.style.background = color === 'green' ? '#16a34a' : '#dc2626';
    t.style.display = 'block';
    t.style.animation = 'toastIn .3s ease';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.style.display = 'none'; }, 4000);
}

// ── Init ───────────────────────────────────────────────────────────────────────
selectPlan('quincenal');