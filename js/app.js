/* ==========================================================================
   MOTOR DE RESERVAS, TARIFAS, CALENDARIO, ANIMACIONES Y ANALÍTICA
   Desarrollado por LeonardLance para Lic. Valeria de la Torre
   Requiere: js/store.js
   ========================================================================== */

const bookingState = {
  type: 'primera',          // primera | seguimiento
  modality: 'virtual',      // virtual | presencial
  focus: 'Valoración General',
  price: VDT.getPrice('virtual', 'primera'),
  selectedYear: 2026,
  selectedMonth: 10,        // 10 = Noviembre (0-indexed)
  selectedDay: 12,
  selectedDateLabel: 'Jueves 12 de Noviembre, 2026',
  selectedTime: '13:00',
  folio: '',
  lastEmail: ''
};

const availableDaysInNov = [3, 5, 6, 10, 12, 13, 17, 19, 20, 24, 26, 27];
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const IS_HEATMAP_PREVIEW = new URLSearchParams(location.search).get('heatmap') === '1';

function dayName(d, y = bookingState.selectedYear, m = bookingState.selectedMonth) {
  return DAY_NAMES[new Date(y, m, d).getDay()];
}

function getBlocked() {
  return VDT.read(VDT.KEYS.blocked, {});
}

/* --------------------------------------------------------------------------
   1. INICIALIZACIÓN
   -------------------------------------------------------------------------- */
function initApp() {
  renderSpecialtiesSection();
  renderCalendarDays();
  renderTimeSlots();
  updateSummary();
  initScrollReveal();
  init3DTiltCards();
  initGoldDustCanvas();
  checkMercadoPagoReturnUrl();
  if (!IS_HEATMAP_PREVIEW) initAnalyticsTracking();

  // Sincronización en tiempo real cuando la nutrióloga edita/oculta especialidades u horarios en otra pestaña o regresa con el navegador
  const syncLiveChanges = () => {
    renderSpecialtiesSection();
    renderCalendarDays();
    renderTimeSlots();
    init3DTiltCards();
  };
  window.addEventListener('storage', syncLiveChanges);
  window.addEventListener('pageshow', syncLiveChanges);
  window.addEventListener('focus', syncLiveChanges);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) syncLiveChanges();
  });
}

function renderSpecialtiesSection() {
  const all = VDT.getSpecialties();
  const list = (all || []).filter(sp => sp.visible !== false);
  const sec = document.getElementById('especialidades');
  const grid = document.getElementById('specialties-grid');
  const navItem = document.getElementById('nav-item-especialidades');
  const navItemMobile = document.getElementById('nav-item-especialidades-mobile');
  const heroBtn = document.getElementById('hero-btn-especialidades');
  const focusSel = document.getElementById('focus-select');

  // Si la nutrióloga no tiene especialidades visibles, se oculta toda la sección y sus enlaces
  if (!list || list.length === 0) {
    if (sec) sec.style.display = 'none';
    if (navItem) navItem.style.display = 'none';
    if (navItemMobile) navItemMobile.style.display = 'none';
    if (heroBtn) heroBtn.style.display = 'none';
    if (focusSel) {
      focusSel.innerHTML = `<option value="Valoración General">Valoración General</option>`;
      bookingState.focus = 'Valoración General';
    }
    return;
  }

  if (sec) sec.style.display = '';
  if (navItem) navItem.style.display = '';
  if (navItemMobile) navItemMobile.style.display = '';
  if (heroBtn) heroBtn.style.display = '';

  if (grid) {
    grid.innerHTML = list.map((sp, idx) => {
      const delayClass = idx % 4 === 1 ? 'delay-1' : idx % 4 === 2 ? 'delay-2' : idx % 4 === 3 ? 'delay-3' : '';
      const safeTitle = (sp.title || '').replace(/'/g, "\\'");
      const spType = sp.type === 'seguimiento' ? 'seguimiento' : 'primera';
      const iconSvg = VDT.getIconSVG(sp.icon || 'loto');
      const cleanTag = (sp.tag || 'Especialidad').replace(/^[^\wÁÉÍÓÚáéíóúÑñ]+\s*/, '');
      return `
        <div class="spec-card tilt-card reveal-up is-visible ${delayClass}">
          <div>
            <span class="pill-tag" style="margin-bottom: 0.8rem; display:inline-flex; align-items:center; gap:0.4rem;">
              ${iconSvg}
              <span>${cleanTag}</span>
            </span>
            <h3 style="font-size: 1.55rem; margin: 0 0 0.5rem;">${sp.title}</h3>
            <p style="font-size: 0.88rem; color: var(--color-sage-dark); margin-bottom: 1.2rem;">
              ${sp.desc || ''}
            </p>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 1rem; border-top: 1px solid rgba(167,114,55,0.18);">
            <span class="spec-price">${sp.priceText || 'Desde $650 MXN'}</span>
            <button type="button" onclick="selectServiceAndScroll('${safeTitle}', '${spType}')" class="btn-outline" style="padding: 0.5rem 1.1rem; font-size: 0.76rem;">
              Elegir y Agendar →
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  if (focusSel) {
    const opts = ['Valoración General', ...list.map(sp => sp.title)];
    focusSel.innerHTML = opts.map(o => `<option value="${o.replace(/"/g, '&quot;')}">${o}</option>`).join('');
  }
}

function checkMercadoPagoReturnUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('pago') === 'aprobado') {
    bookingState.folio = params.get('folio') || bookingState.folio;
    document.getElementById('conf-folio').textContent = bookingState.folio;
    showStep3();
    setTimeout(launchGoldenCelebration, 350);
  }
}

/* --------------------------------------------------------------------------
   2. ANALÍTICA DE INTERACCIÓN (MAPA DE CALOR + TIEMPO POR SECCIÓN)
   En producción se envía a /api/tracking.php; aquí se guarda en localStorage.
   -------------------------------------------------------------------------- */
function initAnalyticsTracking() {
  const data = VDT.read(VDT.KEYS.analytics, { sessions: 0, sections: {}, clicks: [], elements: {} });
  data.sessions = (data.sessions || 0) + 1;
  data.docHeight = document.documentElement.scrollHeight;
  VDT.write(VDT.KEYS.analytics, data);

  const save = (mutator) => {
    const d = VDT.read(VDT.KEYS.analytics, data);
    mutator(d);
    if (d.clicks.length > 3000) d.clicks = d.clicks.slice(-3000);
    VDT.write(VDT.KEYS.analytics, d);
  };

  // Clics con posición relativa a la página
  document.addEventListener('click', (e) => {
    const docW = document.documentElement.scrollWidth;
    const docH = document.documentElement.scrollHeight;
    const sectionEl = e.target.closest('section[id], nav');
    const actionable = e.target.closest('a, button, select, input, summary, .cal-day, .time-slot, .spec-card, .price-card');
    let label = actionable
      ? (actionable.getAttribute('data-track') || actionable.textContent || actionable.tagName).trim().replace(/\s+/g, ' ').slice(0, 42)
      : 'Área sin acción';
    if (actionable && actionable.classList.contains('cal-day')) label = 'Selección de día';
    if (actionable && actionable.classList.contains('time-slot')) label = 'Selección de horario';

    save(d => {
      d.docHeight = docH;
      d.clicks.push({
        xPct: +(e.pageX / docW).toFixed(4),
        yPct: +(e.pageY / docH).toFixed(4),
        section: sectionEl ? (sectionEl.id || 'menu') : 'otro',
        el: label,
        t: Date.now()
      });
      d.elements[label] = (d.elements[label] || 0) + 1;
    });
  }, { capture: true });

  // Tiempo de permanencia por sección
  const visibleSince = {};
  const flushSection = (id) => {
    if (!visibleSince[id]) return;
    const elapsed = Date.now() - visibleSince[id];
    delete visibleSince[id];
    if (elapsed < 400) return;
    save(d => {
      d.sections[id] = d.sections[id] || { views: 0, ms: 0 };
      d.sections[id].ms += elapsed;
    });
  };

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      if (entry.isIntersecting) {
        visibleSince[id] = Date.now();
        save(d => {
          d.sections[id] = d.sections[id] || { views: 0, ms: 0 };
          d.sections[id].views += 1;
        });
      } else {
        flushSection(id);
      }
    });
  }, { threshold: 0.35 });

  document.querySelectorAll('section[id]').forEach(s => obs.observe(s));
  const flushAll = () => Object.keys(visibleSince).forEach(flushSection);
  window.addEventListener('pagehide', flushAll);
  document.addEventListener('visibilitychange', () => { if (document.hidden) flushAll(); });
}

/* --------------------------------------------------------------------------
   3. POLVO DORADO EN EL HERO
   -------------------------------------------------------------------------- */
function initGoldDustCanvas() {
  const canvas = document.getElementById('gold-dust-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, mouseX = -1000, mouseY = -1000;

  function resize() {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  canvas.parentElement.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  const palette = ['rgba(222,176,116,0.55)', 'rgba(167,114,55,0.45)', 'rgba(166,180,155,0.45)', 'rgba(235,190,124,0.65)'];
  const particles = Array.from({ length: 46 }, () => ({
    x: Math.random() * (width || 1200), y: Math.random() * (height || 650),
    r: 1.4 + Math.random() * 2.8, vx: (Math.random() - 0.5) * 0.35, vy: -0.2 - Math.random() * 0.4,
    phase: Math.random() * Math.PI * 2, color: palette[Math.floor(Math.random() * palette.length)]
  }));

  (function loop() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.phase += 0.025; p.x += p.vx; p.y += p.vy;
      const dx = p.x - mouseX, dy = p.y - mouseY, dist = Math.hypot(dx, dy);
      if (dist < 110 && dist > 0) { p.x += (dx / dist) * 0.7; p.y += (dy / dist) * 0.7; }
      if (p.y < -10) p.y = height + 10;
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      ctx.save();
      ctx.globalAlpha = 0.55 + 0.45 * Math.sin(p.phase);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = '#DEB074';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(loop);
  })();
}

/* --------------------------------------------------------------------------
   4. TARJETAS 3D + SCROLL REVEAL
   -------------------------------------------------------------------------- */
function init3DTiltCards() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
      const rx = ((y - rect.height / 2) / (rect.height / 2)) * -4.5;
      const ry = ((x - rect.width / 2) / (rect.width / 2)) * 4.5;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
}

function initScrollReveal() {
  const navbar = document.getElementById('main-navbar');
  window.addEventListener('scroll', () => navbar && navbar.classList.toggle('scrolled', window.scrollY > 25));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('is-visible'));
  }, { threshold: 0.14 });
  document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   5. CELEBRACIÓN DORADA AL CONFIRMAR PAGO
   -------------------------------------------------------------------------- */
function launchGoldenCelebration() {
  const canvas = document.getElementById('celebration-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.parentElement.offsetWidth;
  const h = canvas.height = canvas.parentElement.offsetHeight;
  const colors = ['#A77237', '#DEB074', '#EBBE7C', '#3D5540', '#A6B49B', '#253B2E'];
  const sparks = Array.from({ length: 75 }, () => ({
    x: w / 2, y: h * 0.25, vx: (Math.random() - 0.5) * 12, vy: (Math.random() - 0.85) * 10,
    size: 4 + Math.random() * 5, color: colors[Math.floor(Math.random() * colors.length)], alpha: 1, rot: Math.random() * Math.PI
  }));
  let frame = 0;
  (function draw() {
    ctx.clearRect(0, 0, w, h);
    sparks.forEach(s => {
      s.x += s.vx; s.y += s.vy; s.vy += 0.22; s.alpha -= 0.014; s.rot += 0.08;
      if (s.alpha > 0) {
        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rot);
        ctx.fillStyle = s.color;
        ctx.fillRect(-s.size / 2, -s.size / 2, s.size, s.size * 0.65);
        ctx.restore();
      }
    });
    if (++frame < 85) requestAnimationFrame(draw); else ctx.clearRect(0, 0, w, h);
  })();
}

/* --------------------------------------------------------------------------
   6. CALENDARIO Y HORARIOS (13:00 – 21:00, sesiones de 1 hora, Multi-Mes)
   -------------------------------------------------------------------------- */
function changePublicMonth(delta) {
  let y = bookingState.selectedYear;
  let m = bookingState.selectedMonth + delta;
  if (m > 11) { m = 0; y += 1; }
  if (m < 0)  { m = 11; y -= 1; }
  // No permitir retroceder antes de Noviembre 2026
  if (y < 2026 || (y === 2026 && m < 10)) return;
  bookingState.selectedYear = y;
  bookingState.selectedMonth = m;
  const avail = VDT.getAvailableDaysForMonth(y, m);
  bookingState.selectedDay = avail[0] || 1;
  bookingState.selectedDateLabel = VDT.formatFullDate(y, m, bookingState.selectedDay);
  renderCalendarDays();
  renderTimeSlots();
  updateSummary();
}

function renderCalendarDays() {
  const grid = document.getElementById('calendar-days-grid');
  if (!grid) return;
  const y = bookingState.selectedYear;
  const m = bookingState.selectedMonth;
  const availDays = VDT.getAvailableDaysForMonth(y, m);
  const totalDays = VDT.daysInMonth(y, m);
  const startDow = VDT.firstWeekday(y, m);

  const monthTitleEl = document.getElementById('public-cal-month-title');
  if (monthTitleEl) monthTitleEl.textContent = `${VDT.MONTH_NAMES[m]} ${y}`;

  // Si el día seleccionado ya fue deshabilitado por la nutrióloga, saltar al primer día disponible
  if (availDays.length > 0 && !availDays.includes(bookingState.selectedDay)) {
    bookingState.selectedDay = availDays[0];
  }
  bookingState.selectedDateLabel = VDT.formatFullDate(y, m, bookingState.selectedDay);

  grid.innerHTML = '';
  ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].forEach(h => {
    const div = document.createElement('div');
    div.className = 'cal-day-hdr';
    div.textContent = h;
    grid.appendChild(div);
  });

  // Celdas vacías para alinear el día 1 con su día de la semana real
  for (let e = 0; e < startDow; e++) {
    const empty = document.createElement('div');
    grid.appendChild(empty);
  }

  for (let d = 1; d <= totalDays; d++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    const dayBlockedHours = VDT.getBlockedForDate(y, m, d);
    const allHoursFull = dayBlockedHours.length >= VDT.HOURS.length;
    const isAvail = availDays.includes(d) && !allHoursFull;
    btn.className = 'cal-day' + (!isAvail ? ' disabled' : '') + (bookingState.selectedDay === d && isAvail ? ' selected' : '');
    btn.textContent = d;
    if (isAvail) {
      btn.onclick = () => {
        bookingState.selectedDay = d;
        bookingState.selectedDateLabel = VDT.formatFullDate(y, m, d);
        renderCalendarDays();
        renderTimeSlots();
        updateSummary();
      };
    }
    grid.appendChild(btn);
  }
}

function renderTimeSlots() {
  const container = document.getElementById('time-slots-container');
  const labelEl = document.getElementById('selected-date-label');
  if (!container) return;
  if (labelEl) labelEl.textContent = bookingState.selectedDateLabel.replace(`, ${bookingState.selectedYear}`, '');

  const taken = VDT.getBlockedForDate(bookingState.selectedYear, bookingState.selectedMonth, bookingState.selectedDay);
  if (taken.includes(bookingState.selectedTime)) {
    const free = VDT.HOURS.find(h => !taken.includes(h));
    if (free) bookingState.selectedTime = free;
  }

  container.innerHTML = '';
  VDT.HOURS.forEach(hr => {
    const isTaken = taken.includes(hr);
    const isSelected = bookingState.selectedTime === hr && !isTaken;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'time-slot' + (isTaken ? ' taken' : '') + (isSelected ? ' selected' : '');
    btn.textContent = isTaken ? `${hr} (Ocupado)` : `${VDT.slotLabel(hr)}${isSelected ? ' ✓' : ''}`;
    if (!isTaken) {
      btn.onclick = () => {
        bookingState.selectedTime = hr;
        renderTimeSlots();
        updateSummary();
      };
    }
    container.appendChild(btn);
  });
}

/* --------------------------------------------------------------------------
   7. TIPO DE CONSULTA, MODALIDAD Y TARIFAS
   -------------------------------------------------------------------------- */
function updateServiceSelection() {
  bookingState.type = document.getElementById('service-select').value;
  bookingState.modality = document.getElementById('modality-select').value;
  const focusSel = document.getElementById('focus-select');
  if (focusSel) bookingState.focus = focusSel.value;
  updateSummary();
}

function selectServiceAndScroll(focus, type = 'primera') {
  bookingState.focus = focus;
  bookingState.type = type;
  const focusSel = document.getElementById('focus-select');
  if (focusSel) focusSel.value = focus;
  document.getElementById('service-select').value = type;
  updateSummary();
  document.getElementById('reservar').scrollIntoView({ behavior: 'smooth' });
}

function selectPlanAndScroll(modality, type) {
  bookingState.modality = modality;
  bookingState.type = type;
  document.getElementById('modality-select').value = modality;
  document.getElementById('service-select').value = type;
  updateSummary();
  document.getElementById('reservar').scrollIntoView({ behavior: 'smooth' });
}

function updateSummary() {
  bookingState.price = VDT.getPrice(bookingState.modality, bookingState.type);

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('sum-service', `${VDT.TYPES[bookingState.type]} · ${bookingState.focus}`);
  set('sum-modality', VDT.MODALITIES[bookingState.modality]);
  set('sum-datetime', `${bookingState.selectedDateLabel} · ${VDT.slotLabel(bookingState.selectedTime)} hrs`);
  set('sum-price', `$${bookingState.price} MXN`);

  const qNote = document.getElementById('sum-questionnaire-note');
  if (qNote) qNote.style.display = bookingState.type === 'primera' ? 'block' : 'none';

  const sumCard = document.getElementById('summary-card-box');
  if (sumCard) {
    sumCard.style.transform = 'scale(1.015)';
    setTimeout(() => { sumCard.style.transform = 'scale(1)'; }, 180);
  }
}

/* --------------------------------------------------------------------------
   8. NAVEGACIÓN ENTRE PASOS
   -------------------------------------------------------------------------- */
function setActivePill(n) {
  [1, 2, 3].forEach(i => {
    const el = document.getElementById(`pill-step-${i}`);
    if (el) el.classList.toggle('active', i === n);
  });
}

function goToStep1() {
  document.getElementById('booking-main-view').style.display = 'grid';
  document.getElementById('step-1-panel').style.display = 'block';
  document.getElementById('step-2-panel').style.display = 'none';
  document.getElementById('step-3-panel').style.display = 'none';
  setActivePill(1);
}

function goToStep2() {
  document.getElementById('booking-main-view').style.display = 'grid';
  document.getElementById('step-1-panel').style.display = 'none';
  document.getElementById('step-2-panel').style.display = 'block';
  document.getElementById('step-3-panel').style.display = 'none';
  setActivePill(2);
}

function showStep3() {
  document.getElementById('booking-main-view').style.display = 'none';
  document.getElementById('step-3-panel').style.display = 'block';
  setActivePill(3);
  document.getElementById('reservar').scrollIntoView({ behavior: 'smooth' });
}

/* --------------------------------------------------------------------------
   9. PAGO (SIMULADO) → BLOQUEO DE AGENDA → CORREOS → CUESTIONARIO
   En producción: api/crear-preferencia-mp.php + api/webhook-mercadopago.php
   -------------------------------------------------------------------------- */
function processPaymentAndBook(event) {
  event.preventDefault();
  const submitBtn = document.getElementById('pay-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Validando pago y sincronizando con calendario...';

  const patientName = document.getElementById('patient-name').value.trim();
  const patientEmail = document.getElementById('patient-email').value.trim().toLowerCase();
  const patientPhone = document.getElementById('patient-phone').value.trim();

  setTimeout(() => {
    const y = bookingState.selectedYear;
    const m = bookingState.selectedMonth;
    const d = bookingState.selectedDay;
    // Revalidar que el horario siga libre (evita doble reserva)
    const dayList = VDT.getBlockedForDate(y, m, d);
    if (dayList.includes(bookingState.selectedTime)) {
      alert('Este horario acaba de ser reservado. Por favor elige otro.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Pagar Reserva Ahora y Confirmar en Calendario →';
      goToStep1();
      renderTimeSlots();
      return;
    }

    bookingState.folio = 'VT-' + Math.floor(1000 + Math.random() * 9000);
    bookingState.lastEmail = patientEmail;

    VDT.toggleBlockedSlotForDate(y, m, d, bookingState.selectedTime);

    const bookings = VDT.read(VDT.KEYS.bookings, []);
    bookings.push({
      folio: bookingState.folio,
      patientName, patientEmail, patientPhone,
      type: bookingState.type, typeLabel: VDT.TYPES[bookingState.type],
      modality: bookingState.modality, modalityLabel: VDT.MODALITIES[bookingState.modality],
      focus: bookingState.focus,
      year: y,
      month: m,
      day: d,
      dateLabel: VDT.formatShortDate(y, m, d),
      time: bookingState.selectedTime,
      price: bookingState.price,
      notes: (document.getElementById('patient-notes') || {}).value || '',
      status: 'pagado',
      createdAt: new Date().toISOString()
    });
    VDT.write(VDT.KEYS.bookings, bookings);

    const when = `${bookingState.selectedDateLabel} · ${VDT.slotLabel(bookingState.selectedTime)} hrs`;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('conf-folio', bookingState.folio);
    set('mail-patient-to', patientEmail);
    set('mail-patient-name', patientName);
    set('mail-patient-service', `${VDT.TYPES[bookingState.type]} (${bookingState.focus})`);
    set('mail-patient-datetime', when);
    set('mail-patient-modality', VDT.MODALITIES[bookingState.modality]);
    set('mail-nutri-patient', `${patientName} (${patientEmail})`);
    set('mail-nutri-phone', patientPhone);
    set('mail-nutri-amount', `$${bookingState.price}.00 MXN (PAGADO · ${bookingState.folio})`);

    document.getElementById('gcal-link-btn').href = buildGoogleCalendarUrl(patientName);

    // Acceso al portal + cuestionario (solo primera consulta)
    const qBox = document.getElementById('questionnaire-cta-box');
    const qLink = document.getElementById('questionnaire-cta-link');
    if (qBox && qLink) {
      qBox.style.display = bookingState.type === 'primera' ? 'flex' : 'none';
      qLink.href = `paciente.html?email=${encodeURIComponent(patientEmail)}&folio=${encodeURIComponent(bookingState.folio)}`;
    }

    showStep3();
    launchGoldenCelebration();
    submitBtn.disabled = false;
    submitBtn.textContent = 'Pagar Reserva Ahora y Confirmar en Calendario →';
  }, 850);
}

function calendarDates() {
  const [hh] = bookingState.selectedTime.split(':').map(Number);
  const yy = String(bookingState.selectedYear);
  const mm = String(bookingState.selectedMonth + 1).padStart(2, '0');
  const dd = String(bookingState.selectedDay).padStart(2, '0');
  return {
    start: `${yy}${mm}${dd}T${String(hh).padStart(2, '0')}0000`,
    end: `${yy}${mm}${dd}T${String(hh + 1).padStart(2, '0')}0000`
  };
}

function buildGoogleCalendarUrl(patientName) {
  const { start, end } = calendarDates();
  const title = encodeURIComponent(`${VDT.TYPES[bookingState.type]} - Lic. Valeria de la Torre`);
  const details = encodeURIComponent(
    `Reserva Confirmada y Pagada (${bookingState.folio})\nPaciente: ${patientName}\nEnfoque: ${bookingState.focus}\nModalidad: ${VDT.MODALITIES[bookingState.modality]}`
  );
  const location = encodeURIComponent(VDT.MODALITIES[bookingState.modality]);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&ctz=America/Mexico_City&details=${details}&location=${location}`;
}

function downloadICSFile() {
  const patientName = document.getElementById('patient-name').value.trim() || 'Paciente';
  const { start, end } = calendarDates();
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Valeria de la Torre//Nutricion Hormonal Femenina//ES',
    'BEGIN:VEVENT',
    `UID:${bookingState.folio}@valeriadelatorre.com`,
    `DTSTAMP:${start}`,
    `DTSTART;TZID=America/Mexico_City:${start}`,
    `DTEND;TZID=America/Mexico_City:${end}`,
    `SUMMARY:${VDT.TYPES[bookingState.type]} - Lic. Valeria de la Torre`,
    `DESCRIPTION:Reserva Pagada (${bookingState.folio}). Paciente: ${patientName}. Modalidad: ${VDT.MODALITIES[bookingState.modality]}`,
    `LOCATION:${VDT.MODALITIES[bookingState.modality]}`,
    'STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Reserva-${bookingState.folio}-Valeria-Nutricion.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function resetBookingFlow() {
  renderTimeSlots();
  goToStep1();
}

document.addEventListener('DOMContentLoaded', initApp);
