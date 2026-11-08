/* ==========================================================================
   LÓGICA DE RESERVAS, VALIDACIÓN DE PAGO, CALENDARIO, CORREOS Y ANIMACIONES
   Desarrollado por LeonardLance para Lic. Valeria de la Torre
   ========================================================================== */

const bookingState = {
  serviceName: 'Consulta de Valoración Nutricional Hormonal',
  price: 850,
  modality: 'Online (Videollamada Google Meet)',
  selectedDay: 12,
  selectedDateLabel: 'Jueves 12 de Noviembre, 2026',
  selectedTime: '11:00 AM',
  folio: 'VT-8492',
  bookedSlotsByDay: {
    5: ['09:30 AM', '04:00 PM'],
    12: ['09:30 AM', '05:30 PM'],
    13: ['11:00 AM'],
    19: ['12:30 PM']
  }
};

const availableDaysInNov = [3, 5, 6, 10, 12, 13, 17, 19, 20, 24, 26, 27];
const dayNamesMap = {
  2: 'Lunes', 3: 'Martes', 4: 'Miércoles', 5: 'Jueves', 6: 'Viernes', 7: 'Sábado',
  9: 'Lunes', 10: 'Martes', 11: 'Miércoles', 12: 'Jueves', 13: 'Viernes', 14: 'Sábado',
  16: 'Lunes', 17: 'Martes', 18: 'Miércoles', 19: 'Jueves', 20: 'Viernes', 21: 'Sábado',
  23: 'Lunes', 24: 'Martes', 25: 'Miércoles', 26: 'Jueves', 27: 'Viernes', 28: 'Sábado'
};

const standardHours = ['09:30 AM', '11:00 AM', '12:30 PM', '04:00 PM', '05:30 PM', '06:30 PM'];

/* --------------------------------------------------------------------------
   1. INICIALIZACIÓN DE CALENDARIO Y ANIMACIONES ÚNICAS
   -------------------------------------------------------------------------- */
function syncFromAdminStorage() {
  const storedBlocked = localStorage.getItem('valeria_blocked_slots');
  if (storedBlocked) {
    try {
      bookingState.bookedSlotsByDay = JSON.parse(storedBlocked);
    } catch (e) {}
  } else {
    localStorage.setItem('valeria_blocked_slots', JSON.stringify(bookingState.bookedSlotsByDay));
  }
}

function initApp() {
  syncFromAdminStorage();
  renderCalendarDays();
  renderTimeSlots();
  updateSummary();
  initScrollReveal();
  init3DTiltCards();
  initGoldDustCanvas();
}

/* --------------------------------------------------------------------------
   2. ANIMACIÓN DE PARTÍCULAS DE POLVO DORADO EN EL HERO (#gold-dust-canvas)
   -------------------------------------------------------------------------- */
function initGoldDustCanvas() {
  const canvas = document.getElementById('gold-dust-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0;
  let mouseX = -1000, mouseY = -1000;

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

  const palette = [
    'rgba(222, 176, 116, 0.55)', // Dorado Champán
    'rgba(167, 114, 55, 0.45)',  // Bronce Dorado
    'rgba(166, 180, 155, 0.45)', // Verde Salvia Claro
    'rgba(235, 190, 124, 0.65)'  // Luz Dorada
  ];

  const particles = Array.from({ length: 46 }, () => ({
    x: Math.random() * (width || 1200),
    y: Math.random() * (height || 650),
    r: 1.4 + Math.random() * 2.8,
    vx: (Math.random() - 0.5) * 0.35,
    vy: -0.2 - Math.random() * 0.4,
    alphaPhase: Math.random() * Math.PI * 2,
    color: palette[Math.floor(Math.random() * palette.length)]
  }));

  function animateDust() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.alphaPhase += 0.025;
      p.x += p.vx;
      p.y += p.vy;

      // Sutil repulsión magnética al acercar el cursor
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 110 && dist > 0) {
        p.x += (dx / dist) * 0.7;
        p.y += (dy / dist) * 0.7;
      }

      if (p.y < -10) p.y = height + 10;
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      const twinkle = 0.55 + 0.45 * Math.sin(p.alphaPhase);
      ctx.save();
      ctx.globalAlpha = twinkle;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = '#DEB074';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(animateDust);
  }
  animateDust();
}

/* --------------------------------------------------------------------------
   3. INCLINACIÓN 3D MAGNÉTICA + LUZ DORADA EN TARJETAS (.tilt-card)
   -------------------------------------------------------------------------- */
function init3DTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Posición del foco de luz dorado CSS
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // Inclinación suave en 3D
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4.5;
      const rotateY = ((x - centerX) / centerX) * 4.5;

      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

/* --------------------------------------------------------------------------
   4. SCROLL-REVEAL EDITORIAL E INTERACCIÓN DE NAVBAR
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const navbar = document.getElementById('main-navbar');
  window.addEventListener('scroll', () => {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 25);
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.14 });

  document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   5. EXPLOSIÓN DE DESTELLOS DORADOS Y VERDES AL CONFIRMAR PAGO
   -------------------------------------------------------------------------- */
function launchGoldenCelebration() {
  const canvas = document.getElementById('celebration-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.parentElement.offsetWidth;
  const h = canvas.height = canvas.parentElement.offsetHeight;

  const colors = ['#A77237', '#DEB074', '#EBBE7C', '#3D5540', '#A6B49B', '#253B2E'];
  const sparks = Array.from({ length: 75 }, () => ({
    x: w / 2,
    y: h * 0.32,
    vx: (Math.random() - 0.5) * 12,
    vy: (Math.random() - 0.85) * 10,
    size: 4 + Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: 1,
    rot: Math.random() * Math.PI
  }));

  let frame = 0;
  function drawSparks() {
    ctx.clearRect(0, 0, w, h);
    sparks.forEach(s => {
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.22; // Gravedad suave
      s.alpha -= 0.014;
      s.rot += 0.08;

      if (s.alpha > 0) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rot);
        ctx.fillStyle = s.color;
        ctx.fillRect(-s.size / 2, -s.size / 2, s.size, s.size * 0.65);
        ctx.restore();
      }
    });
    frame++;
    if (frame < 85) {
      requestAnimationFrame(drawSparks);
    } else {
      ctx.clearRect(0, 0, w, h);
    }
  }
  drawSparks();
}

/* --------------------------------------------------------------------------
   6. MOTOR DE CALENDARIO Y FLUJO DE RESERVAS
   -------------------------------------------------------------------------- */
function renderCalendarDays() {
  const grid = document.getElementById('calendar-days-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const headers = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
  headers.forEach(h => {
    const div = document.createElement('div');
    div.className = 'cal-day-hdr';
    div.textContent = h;
    grid.appendChild(div);
  });

  for (let d = 1; d <= 30; d++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    const isAvail = availableDaysInNov.includes(d);
    const isSel = bookingState.selectedDay === d;

    btn.className = 'cal-day' + (!isAvail ? ' disabled' : '') + (isSel ? ' selected' : '');
    btn.textContent = d;

    if (isAvail) {
      btn.onclick = () => {
        bookingState.selectedDay = d;
        const dName = dayNamesMap[d] || 'Día';
        bookingState.selectedDateLabel = `${dName} ${d} de Noviembre, 2026`;
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

  if (labelEl) {
    labelEl.textContent = bookingState.selectedDateLabel.replace(', 2026', '');
  }

  container.innerHTML = '';
  const takenList = bookingState.bookedSlotsByDay[bookingState.selectedDay] || [];

  if (takenList.includes(bookingState.selectedTime)) {
    const firstFree = standardHours.find(h => !takenList.includes(h));
    if (firstFree) bookingState.selectedTime = firstFree;
  }

  standardHours.forEach(hr => {
    const isTaken = takenList.includes(hr);
    const isSelected = bookingState.selectedTime === hr && !isTaken;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'time-slot' + (isTaken ? ' taken' : '') + (isSelected ? ' selected' : '');
    btn.textContent = isTaken ? `${hr} (Ocupado)` : (isSelected ? `${hr} ✓` : hr);

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

function updateServiceSelection() {
  const sel = document.getElementById('service-select');
  if (!sel) return;
  const [name, priceStr] = sel.value.split('|');
  bookingState.serviceName = name;
  bookingState.price = parseInt(priceStr, 10);
  updateSummary();
}

function selectServiceAndScroll(serviceName, price) {
  const sel = document.getElementById('service-select');
  if (sel) {
    for (let i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value.startsWith(serviceName)) {
        sel.selectedIndex = i;
        break;
      }
    }
  }
  bookingState.serviceName = serviceName;
  bookingState.price = price;
  updateSummary();
  document.getElementById('reservar').scrollIntoView({ behavior: 'smooth' });
}

function updateSummary() {
  const modSel = document.getElementById('modality-select');
  if (modSel) bookingState.modality = modSel.value;

  document.getElementById('sum-service').textContent = bookingState.serviceName;
  document.getElementById('sum-modality').textContent = bookingState.modality;
  document.getElementById('sum-datetime').textContent = `${bookingState.selectedDateLabel} · ${bookingState.selectedTime}`;
  document.getElementById('sum-price').textContent = `$${bookingState.price} MXN`;

  // Pulso sutil en la tarjeta de resumen al actualizar
  const sumCard = document.getElementById('summary-card-box');
  if (sumCard) {
    sumCard.style.transform = 'scale(1.015)';
    setTimeout(() => { sumCard.style.transform = 'scale(1)'; }, 180);
  }
}

function setActivePill(stepNum) {
  [1, 2, 3].forEach(n => {
    const el = document.getElementById(`pill-step-${n}`);
    if (el) {
      el.classList.toggle('active', n === stepNum);
    }
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

function processPaymentAndBook(event) {
  event.preventDefault();

  const submitBtn = document.getElementById('pay-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = '✨ Validando Pago y Sincronizando con Calendario...';

  const patientName = document.getElementById('patient-name').value.trim();
  const patientEmail = document.getElementById('patient-email').value.trim();
  const patientPhone = document.getElementById('patient-phone').value.trim();

  setTimeout(() => {
    bookingState.folio = 'VT-' + Math.floor(1000 + Math.random() * 9000);
    if (!bookingState.bookedSlotsByDay[bookingState.selectedDay]) {
      bookingState.bookedSlotsByDay[bookingState.selectedDay] = [];
    }
    if (!bookingState.bookedSlotsByDay[bookingState.selectedDay].includes(bookingState.selectedTime)) {
      bookingState.bookedSlotsByDay[bookingState.selectedDay].push(bookingState.selectedTime);
    }
    localStorage.setItem('valeria_blocked_slots', JSON.stringify(bookingState.bookedSlotsByDay));

    // Guardar en la lista de Reservas Pagadas para que aparezca en el Panel de la Nutrióloga
    let storedBookings = [];
    try {
      storedBookings = JSON.parse(localStorage.getItem('valeria_paid_bookings') || '[]');
    } catch (e) {}
    storedBookings.push({
      folio: bookingState.folio,
      patientName: patientName,
      patientEmail: patientEmail,
      patientPhone: patientPhone,
      serviceName: bookingState.serviceName,
      modality: bookingState.modality,
      day: bookingState.selectedDay,
      dateLabel: bookingState.selectedDateLabel.replace(', 2026', ', 2026'),
      time: bookingState.selectedTime,
      price: bookingState.price
    });
    localStorage.setItem('valeria_paid_bookings', JSON.stringify(storedBookings));

    document.getElementById('conf-folio').textContent = bookingState.folio;
    document.getElementById('mail-patient-to').textContent = patientEmail;
    document.getElementById('mail-patient-name').textContent = patientName;
    document.getElementById('mail-patient-service').textContent = bookingState.serviceName;
    document.getElementById('mail-patient-datetime').textContent = `${bookingState.selectedDateLabel} a las ${bookingState.selectedTime}`;
    document.getElementById('mail-patient-modality').textContent = bookingState.modality;

    document.getElementById('mail-nutri-patient').textContent = `${patientName} (${patientEmail})`;
    document.getElementById('mail-nutri-phone').textContent = patientPhone;
    document.getElementById('mail-nutri-amount').textContent = `$${bookingState.price}.00 MXN (PAGADO - Folio ${bookingState.folio})`;

    const gcalUrl = buildGoogleCalendarUrl(patientName);
    document.getElementById('gcal-link-btn').href = gcalUrl;

    document.getElementById('booking-main-view').style.display = 'none';
    document.getElementById('step-3-panel').style.display = 'block';
    setActivePill(3);

    // Disparar animación de celebración dorada
    launchGoldenCelebration();

    submitBtn.disabled = false;
    submitBtn.textContent = '🔒 Pagar Reserva Ahora y Confirmar en Calendario →';
  }, 850);
}

function parseTime24(timeStr) {
  const [timePart, ampm] = timeStr.split(' ');
  let [hh, mm] = timePart.split(':').map(Number);
  if (ampm === 'PM' && hh < 12) hh += 12;
  if (ampm === 'AM' && hh === 12) hh = 0;
  return { hh, mm };
}

function buildGoogleCalendarUrl(patientName) {
  const { hh, mm } = parseTime24(bookingState.selectedTime);
  const dayPad = String(bookingState.selectedDay).padStart(2, '0');
  const hhStart = String(hh).padStart(2, '0');
  const hhEnd = String(hh + 1).padStart(2, '0');
  const mmPad = String(mm).padStart(2, '0');

  const startISO = `202611${dayPad}T${hhStart}${mmPad}00`;
  const endISO = `202611${dayPad}T${hhEnd}${mmPad}00`;

  const title = encodeURIComponent(`${bookingState.serviceName} - Lic. Valeria de la Torre`);
  const details = encodeURIComponent(
    `Reserva Confirmada y Pagada (${bookingState.folio})\n` +
    `Paciente: ${patientName}\n` +
    `Especialista: Lic. Valeria de la Torre (Nutrición Hormonal Femenina)\n` +
    `Modalidad: ${bookingState.modality}`
  );
  const location = encodeURIComponent(bookingState.modality);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${details}&location=${location}`;
}

function downloadICSFile() {
  const patientName = document.getElementById('patient-name').value.trim() || 'Paciente';
  const { hh, mm } = parseTime24(bookingState.selectedTime);
  const dayPad = String(bookingState.selectedDay).padStart(2, '0');
  const hhStart = String(hh).padStart(2, '0');
  const hhEnd = String(hh + 1).padStart(2, '0');
  const mmPad = String(mm).padStart(2, '0');

  const startISO = `202611${dayPad}T${hhStart}${mmPad}00`;
  const endISO = `202611${dayPad}T${hhEnd}${mmPad}00`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Valeria de la Torre//Nutricion Hormonal Femenina//ES',
    'BEGIN:VEVENT',
    `UID:${bookingState.folio}@valeriadelatorre.com`,
    `DTSTAMP:${startISO}Z`,
    `DTSTART:${startISO}`,
    `DTEND:${endISO}`,
    `SUMMARY:${bookingState.serviceName} - Lic. Valeria de la Torre`,
    `DESCRIPTION:Reserva Pagada (${bookingState.folio}). Paciente: ${patientName}. Modalidad: ${bookingState.modality}`,
    `LOCATION:${bookingState.modality}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Reserva-${bookingState.folio}-Valeria-Nutricion.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function resetBookingFlow() {
  renderTimeSlots();
  goToStep1();
}

document.addEventListener('DOMContentLoaded', initApp);
