/* ==========================================================================
   VDT STORE — Capa de datos compartida (prototipo con localStorage)
   Proyecto: Lic. Valeria de la Torre · Desarrollado por LeonardLance
   --------------------------------------------------------------------------
   En producción (Neubox) estas mismas estructuras viven en MySQL y se leen
   vía los endpoints PHP de /api. Aquí se simulan para validar el flujo.
   ========================================================================== */

const VDT = {
  KEYS: {
    bookings: 'vdt_bookings_v2',
    blocked: 'vdt_blocked_v2',
    questionnaire: 'vdt_questionnaire_v1',
    responses: 'vdt_responses_v1',
    analytics: 'vdt_analytics_v1',
    session: 'vdt_patient_session',
    adminAuth: 'vdt_admin_auth_v1',
    adminCreds: 'vdt_admin_creds_v1',
    specialties: 'vdt_specialties_v1',
    availableDays: 'vdt_available_days_v1',
    availByMonth: 'vdt_avail_by_month_v1'
  },

  // Catálogo de iconos vectoriales de marca (Paleta Bronce/Dorado y Verde Bosque)
  BRAND_ICONS: {
    loto: {
      label: 'Flor de Loto (Armonía)',
      svg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5C9.5 6.5 7 9.5 7 13a5 5 0 0 0 10 0c0-3.5-2.5-6.5-5-10.5z"/><path d="M5 12c2.5 0 4.5 1.5 5.5 3.5"/><path d="M19 12c-2.5 0-4.5 1.5-5.5 3.5"/></svg>`
    },
    hoja: {
      label: 'Hoja Botánica (Metabolismo)',
      svg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`
    },
    destello: {
      label: 'Estrella Dorada (Vitalidad)',
      svg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"/></svg>`
    },
    ciclo: {
      label: 'Ciclo Lunar (Salud Cíclica)',
      svg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
    },
    seguimiento: {
      label: 'Ciclo Continuo (Seguimiento)',
      svg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`
    },
    corazon: {
      label: 'Bienestar Integral (Corazón)',
      svg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
    }
  },

  getIconSVG(key) {
    return (this.BRAND_ICONS[key] || this.BRAND_ICONS.loto).svg;
  },

  defaultSpecialties() {
    return [
      {
        id: 'sp1',
        icon: 'hoja',
        tag: 'Equilibrio Metabólico',
        title: 'Síndrome de Ovario Poliquístico (SOP)',
        desc: 'Estrategia nutricional para mejorar la sensibilidad a la insulina, reducir inflamación crónica, acné hormonal y regular la ovulación.',
        priceText: 'Desde $650 MXN',
        type: 'primera',
        visible: true
      },
      {
        id: 'sp2',
        icon: 'destello',
        tag: 'Vitalidad y Tiroides',
        title: 'Salud Tiroidea y Energía',
        desc: 'Abordaje nutricional con micronutrientes clave para hipotiroidismo, tiroiditis de Hashimoto, fatiga persistente y control de peso saludable.',
        priceText: 'Desde $650 MXN',
        type: 'primera',
        visible: true
      },
      {
        id: 'sp3',
        icon: 'ciclo',
        tag: 'Salud Cíclica',
        title: 'Ciclo Menstrual, Endometriosis y Fertilidad',
        desc: 'Alimentación antiinflamatoria sincronizada con las fases de tu ciclo para disminuir cólicos, síndrome premenstrual y preparar la fertilidad.',
        priceText: 'Desde $650 MXN',
        type: 'primera',
        visible: true
      },
      {
        id: 'sp4',
        icon: 'seguimiento',
        tag: 'Seguimiento',
        title: 'Consulta Subsecuente de Control',
        desc: 'Evaluación de avances, ajuste de plan de alimentación, revisión de síntomas hormonales y actualización de objetivos (60 min).',
        priceText: 'Desde $400 MXN',
        type: 'seguimiento',
        visible: true
      }
    ];
  },

  getSpecialties() {
    let s = this.read(this.KEYS.specialties, null);
    if (s === null) {
      s = this.defaultSpecialties();
      this.write(this.KEYS.specialties, s);
    }
    return s.map((item, idx) => ({
      ...item,
      icon: item.icon || (['hoja', 'destello', 'ciclo', 'seguimiento'][idx % 4]),
      tag: (item.tag || '').replace(/^[^\wÁÉÍÓÚáéíóúÑñ]+\s*/, ''),
      visible: item.visible !== false
    }));
  },

  defaultAdminCreds() {
    return {
      email: 'valeria.delatorre.nutricion@gmail.com',
      pass: 'Valeria2026!',
      name: 'Lic. Valeria de la Torre'
    };
  },

  getAdminCreds() {
    let c = this.read(this.KEYS.adminCreds, null);
    if (!c) {
      c = this.defaultAdminCreds();
      this.write(this.KEYS.adminCreds, c);
    }
    return c;
  },

  // Horario de atención: 13:00 a 21:00 hrs, sesiones de 1 hora (última inicia 20:00)
  HOURS: ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],

  MONTH_NAMES: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  MONTH_SHORT: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  DAY_NAMES_FULL: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],

  monthKey(year, month) {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
  },

  dateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  },

  daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  },

  firstWeekday(year, month) {
    return new Date(year, month, 1).getDay();
  },

  formatShortDate(year, month, day) {
    return `${day} ${this.MONTH_SHORT[month]} ${year}`;
  },

  formatFullDate(year, month, day) {
    const dow = this.DAY_NAMES_FULL[new Date(year, month, day).getDay()];
    return `${dow} ${day} de ${this.MONTH_NAMES[month]}, ${year}`;
  },

  defaultAvailableDaysForMonth(year = 2026, month = 10) {
    if (year === 2026 && month === 10) {
      return [3, 5, 6, 10, 12, 13, 17, 19, 20, 24, 26, 27];
    }
    const total = this.daysInMonth(year, month);
    const days = [];
    for (let d = 1; d <= total; d++) {
      const dow = new Date(year, month, d).getDay();
      if (dow === 2 || dow === 4 || dow === 5) days.push(d); // Mar, Jue, Vie por defecto
    }
    return days;
  },

  defaultAvailableDays() {
    return this.defaultAvailableDaysForMonth(2026, 10);
  },

  getAvailableDaysForMonth(year = 2026, month = 10) {
    const mKey = this.monthKey(year, month);
    const map = this.read(this.KEYS.availByMonth, {});
    if (Array.isArray(map[mKey])) {
      return map[mKey].map(Number).sort((a, b) => a - b);
    }
    if (year === 2026 && month === 10) {
      const legacy = this.read(this.KEYS.availableDays, null);
      if (Array.isArray(legacy)) {
        map[mKey] = legacy.map(Number).sort((a, b) => a - b);
        this.write(this.KEYS.availByMonth, map);
        return map[mKey];
      }
    }
    const def = this.defaultAvailableDaysForMonth(year, month);
    map[mKey] = def;
    this.write(this.KEYS.availByMonth, map);
    if (year === 2026 && month === 10) this.write(this.KEYS.availableDays, def);
    return def;
  },

  setAvailableDaysForMonth(year, month, days) {
    const maxD = this.daysInMonth(year, month);
    const clean = Array.from(new Set(days.map(Number))).filter(n => n >= 1 && n <= maxD).sort((a, b) => a - b);
    const mKey = this.monthKey(year, month);
    const map = this.read(this.KEYS.availByMonth, {});
    map[mKey] = clean;
    this.write(this.KEYS.availByMonth, map);
    if (year === 2026 && month === 10) {
      this.write(this.KEYS.availableDays, clean);
    }
    return clean;
  },

  getAvailableDays() {
    return this.getAvailableDaysForMonth(2026, 10);
  },

  setAvailableDays(days) {
    return this.setAvailableDaysForMonth(2026, 10, days);
  },

  getBlockedForDate(year = 2026, month = 10, day = 12) {
    const blocked = this.read(this.KEYS.blocked, {});
    const dKey = this.dateKey(year, month, day);
    const byKey = blocked[dKey] || [];
    const byLegacy = (year === 2026 && month === 10) ? (blocked[day] || []) : [];
    return Array.from(new Set([...byKey, ...byLegacy]));
  },

  toggleBlockedSlotForDate(year, month, day, time) {
    const blocked = this.read(this.KEYS.blocked, {});
    const dKey = this.dateKey(year, month, day);
    const current = this.getBlockedForDate(year, month, day);
    const next = current.includes(time) ? current.filter(t => t !== time) : [...current, time];
    blocked[dKey] = next;
    if (year === 2026 && month === 10) blocked[day] = next;
    this.write(this.KEYS.blocked, blocked);
    return next;
  },

  // Habilita que el paciente pueda elegir un nuevo día/hora en su portal por emergencia de la nutrióloga
  enablePatientReschedule(folio, reason) {
    const bookings = this.read(this.KEYS.bookings, []);
    const blocked = this.read(this.KEYS.blocked, {});
    const target = bookings.find(b => b.folio === folio);
    if (!target) return null;

    const oldYear = Number(target.year || 2026);
    const oldMonth = target.month !== undefined ? Number(target.month) : 10;
    const oldDay = Number(target.day);
    const oldDKey = this.dateKey(oldYear, oldMonth, oldDay);

    if (blocked[oldDKey]) blocked[oldDKey] = blocked[oldDKey].filter(t => t !== target.time);
    if (oldYear === 2026 && oldMonth === 10 && blocked[oldDay]) {
      blocked[oldDay] = blocked[oldDay].filter(t => t !== target.time);
    }
    this.write(this.KEYS.blocked, blocked);

    target.rescheduleAllowed = true;
    target.emergencyReason = reason || 'Ajuste imprevisto en la agenda clínica de la Lic. Valeria de la Torre.';
    target.emergencyNotifiedAt = new Date().toISOString();
    this.write(this.KEYS.bookings, bookings);
    return target;
  },

  // Reprograma una cita (adelantada o pospuesta, mismo mes o meses posteriores)
  rescheduleBooking(folio, newDay, newTime, byWho = 'nutriologa', note = '', newYear = 2026, newMonth = 10) {
    const bookings = this.read(this.KEYS.bookings, []);
    const blocked = this.read(this.KEYS.blocked, {});
    const target = bookings.find(b => b.folio === folio);
    if (!target) return null;

    const oldYear = Number(target.year || 2026);
    const oldMonth = target.month !== undefined ? Number(target.month) : 10;
    const oldDay = Number(target.day);
    const oldTime = target.time;
    const oldDKey = this.dateKey(oldYear, oldMonth, oldDay);

    const nYear = Number(newYear);
    const nMonth = Number(newMonth);
    const nDay = Number(newDay);
    const newDKey = this.dateKey(nYear, nMonth, nDay);

    // 1. Liberar horario anterior
    if (blocked[oldDKey]) blocked[oldDKey] = blocked[oldDKey].filter(t => t !== oldTime);
    if (oldYear === 2026 && oldMonth === 10 && blocked[oldDay]) {
      blocked[oldDay] = blocked[oldDay].filter(t => t !== oldTime);
    }

    // 2. Ocupar nuevo horario
    const curNew = this.getBlockedForDate(nYear, nMonth, nDay);
    if (!curNew.includes(newTime)) curNew.push(newTime);
    blocked[newDKey] = curNew;
    if (nYear === 2026 && nMonth === 10) blocked[nDay] = curNew;
    this.write(this.KEYS.blocked, blocked);

    // 3. Asegurar que el nuevo día esté habilitado en ese mes
    const avail = this.getAvailableDaysForMonth(nYear, nMonth);
    if (!avail.includes(nDay)) {
      avail.push(nDay);
      this.setAvailableDaysForMonth(nYear, nMonth, avail);
    }

    // 4. Actualizar datos de la reserva
    target.previousDateLabel = `${target.dateLabel} (${this.slotLabel(oldTime)})`;
    target.year = nYear;
    target.month = nMonth;
    target.day = nDay;
    target.dateLabel = this.formatShortDate(nYear, nMonth, nDay);
    target.time = newTime;
    target.rescheduleAllowed = false;
    target.rescheduledAt = new Date().toISOString();
    target.rescheduledBy = byWho;
    if (note) target.rescheduleNote = note;

    this.write(this.KEYS.bookings, bookings);
    return target;
  },

  // Tarifas oficiales
  PRICES: {
    virtual:    { primera: 650, seguimiento: 400 },
    presencial: { primera: 750, seguimiento: 750 }
  },

  MODALITIES: {
    virtual: 'Virtual (Videollamada Google Meet)',
    presencial: 'Presencial en Consultorio'
  },

  TYPES: {
    primera: 'Primera Consulta (Valoración Inicial)',
    seguimiento: 'Consulta de Seguimiento'
  },

  getPrice(modality, type) {
    const m = this.PRICES[modality] || this.PRICES.virtual;
    return m[type] ?? m.primera;
  },

  slotLabel(h) {
    const start = parseInt(h.split(':')[0], 10);
    return `${h} – ${String(start + 1).padStart(2, '0')}:00`;
  },

  read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },

  write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  newId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`;
  },

  /* ----------------------------------------------------------------------
     Cuestionario de primera consulta (editable por la nutrióloga)
     Tipos soportados:
       text      → Respuesta abierta corta
       textarea  → Respuesta abierta larga
       single    → Opción múltiple (una respuesta)
       multiple  → Casillas (varias respuestas)
       scale     → Escala 1 a 10
       yesno     → Sí / No
     ---------------------------------------------------------------------- */
  defaultQuestionnaire() {
    return {
      title: 'Cuestionario de Primera Consulta',
      intro: 'Tus respuestas ayudan a la Lic. Valeria a preparar tu valoración antes de la cita. Toma 4 minutos.',
      updatedAt: new Date().toISOString(),
      questions: [
        { id: 'q1', type: 'textarea', required: true, label: '¿Cuál es el motivo principal de tu consulta?', options: [] },
        { id: 'q2', type: 'multiple', required: true, label: '¿Tienes algún diagnóstico hormonal o metabólico?', options: ['SOP', 'Hipotiroidismo', 'Hashimoto', 'Endometriosis', 'Resistencia a la insulina', 'Ninguno / No sé'] },
        { id: 'q3', type: 'single', required: true, label: '¿Cómo describirías tu ciclo menstrual?', options: ['Regular', 'Irregular', 'Ausente', 'Perimenopausia / Menopausia', 'Uso anticonceptivos hormonales'] },
        { id: 'q4', type: 'scale', required: true, label: 'Del 1 al 10, ¿cómo calificarías tu nivel de energía diario?', options: [] },
        { id: 'q5', type: 'single', required: true, label: '¿Cuál es tu objetivo principal?', options: ['Regular mi ciclo', 'Mejorar composición corporal', 'Recuperar energía', 'Fertilidad / Embarazo', 'Mejorar digestión', 'Otro'] },
        { id: 'q6', type: 'yesno', required: true, label: '¿Cuentas con estudios de laboratorio de los últimos 6 meses?', options: [] },
        { id: 'q7', type: 'text', required: false, label: '¿Tomas algún medicamento o suplemento actualmente?', options: [] },
        { id: 'q8', type: 'text', required: false, label: 'Alergias, intolerancias o alimentos que no consumes', options: [] }
      ]
    };
  },

  getQuestionnaire() {
    let q = this.read(this.KEYS.questionnaire, null);
    if (!q) {
      q = this.defaultQuestionnaire();
      this.write(this.KEYS.questionnaire, q);
    }
    return q;
  },

  /* ----------------------------------------------------------------------
     Datos de demostración (para que el panel no inicie vacío)
     ---------------------------------------------------------------------- */
  seedIfEmpty() {
    if (this.read(this.KEYS.bookings, null)) return;

    const mk = (folio, name, email, phone, type, modality, focus, day, time, createdDaysAgo) => ({
      folio, patientName: name, patientEmail: email, patientPhone: phone,
      type, typeLabel: this.TYPES[type],
      modality, modalityLabel: this.MODALITIES[modality],
      focus, day, dateLabel: `${day} Nov 2026`, time,
      price: this.getPrice(modality, type),
      status: 'pagado',
      createdAt: new Date(Date.now() - createdDaysAgo * 86400000).toISOString()
    });

    const bookings = [
      mk('VT-8410', 'Ana Sofía Martínez', 'anasofia.mtz@gmail.com', '+52 55 4829 1034', 'primera', 'virtual', 'SOP y Resistencia a la Insulina', 5, '13:00', 9),
      mk('VT-8425', 'Valeria Hernández Ruiz', 'val.hernandez@outlook.com', '+52 33 1920 4412', 'primera', 'presencial', 'Salud Tiroidea y Energía', 5, '16:00', 8),
      mk('VT-8451', 'Carolina Vega Soto', 'caro.vega@gmail.com', '+52 81 8392 7710', 'primera', 'virtual', 'Ciclo Menstrual y Fertilidad', 12, '14:00', 6),
      mk('VT-8478', 'Ana Sofía Martínez', 'anasofia.mtz@gmail.com', '+52 55 4829 1034', 'seguimiento', 'virtual', 'SOP y Resistencia a la Insulina', 12, '19:00', 3),
      mk('VT-8489', 'Daniela Castillo Mora', 'dcastillo.mora@gmail.com', '+52 55 6723 8911', 'primera', 'presencial', 'Valoración General', 13, '17:00', 2)
    ];
    this.write(this.KEYS.bookings, bookings);

    const blocked = {};
    bookings.forEach(b => {
      blocked[b.day] = blocked[b.day] || [];
      if (!blocked[b.day].includes(b.time)) blocked[b.day].push(b.time);
    });
    this.write(this.KEYS.blocked, blocked);

    this.getQuestionnaire();
    this.write(this.KEYS.responses, [
      {
        id: 'r1', folio: 'VT-8410', patientEmail: 'anasofia.mtz@gmail.com', patientName: 'Ana Sofía Martínez',
        submittedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        answers: { q1: 'Diagnóstico de SOP hace 2 años, ciclos de 45 días y acné.', q2: ['SOP', 'Resistencia a la insulina'], q3: 'Irregular', q4: 4, q5: 'Regular mi ciclo', q6: 'Sí', q7: 'Inositol', q8: 'Lactosa' }
      },
      {
        id: 'r2', folio: 'VT-8425', patientEmail: 'val.hernandez@outlook.com', patientName: 'Valeria Hernández Ruiz',
        submittedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        answers: { q1: 'Cansancio constante y aumento de peso.', q2: ['Hipotiroidismo'], q3: 'Regular', q4: 3, q5: 'Recuperar energía', q6: 'Sí', q7: 'Levotiroxina 50 mcg', q8: '' }
      },
      {
        id: 'r3', folio: 'VT-8451', patientEmail: 'caro.vega@gmail.com', patientName: 'Carolina Vega Soto',
        submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        answers: { q1: 'Quiero preparar mi cuerpo para embarazo.', q2: ['Ninguno / No sé'], q3: 'Uso anticonceptivos hormonales', q4: 7, q5: 'Fertilidad / Embarazo', q6: 'No', q7: '', q8: 'Mariscos' }
      }
    ]);

    this.seedAnalytics();
  },

  seedAnalytics() {
    const sections = {
      inicio:        { views: 412, ms: 412 * 9200 },
      'sobre-mi':    { views: 268, ms: 268 * 7400 },
      especialidades:{ views: 331, ms: 331 * 11800 },
      tarifas:       { views: 296, ms: 296 * 8900 },
      'como-funciona':{ views: 198, ms: 198 * 4100 },
      reservar:      { views: 244, ms: 244 * 21500 },
      testimonios:   { views: 141, ms: 141 * 3600 },
      faq:           { views: 109, ms: 109 * 5200 }
    };
    const zones = [
      { y: 0.012, x: 0.88, n: 60, s: 'inicio', el: 'Agendar Consulta (menú)' },
      { y: 0.075, x: 0.22, n: 95, s: 'inicio', el: 'Agendar y Reservar mi Horario' },
      { y: 0.075, x: 0.4, n: 30, s: 'inicio', el: 'Ver Especialidades' },
      { y: 0.2, x: 0.75, n: 24, s: 'sobre-mi', el: 'Agendar mi Valoración Inicial' },
      { y: 0.33, x: 0.2, n: 52, s: 'especialidades', el: 'Elegir: SOP' },
      { y: 0.33, x: 0.45, n: 38, s: 'especialidades', el: 'Elegir: Tiroides' },
      { y: 0.33, x: 0.7, n: 33, s: 'especialidades', el: 'Elegir: Ciclo y Fertilidad' },
      { y: 0.42, x: 0.35, n: 41, s: 'tarifas', el: 'Tarifa Virtual' },
      { y: 0.42, x: 0.65, n: 27, s: 'tarifas', el: 'Tarifa Presencial' },
      { y: 0.6, x: 0.3, n: 70, s: 'reservar', el: 'Selección de día' },
      { y: 0.64, x: 0.35, n: 66, s: 'reservar', el: 'Selección de horario' },
      { y: 0.68, x: 0.35, n: 48, s: 'reservar', el: 'Continuar al Pago' },
      { y: 0.82, x: 0.5, n: 9, s: 'testimonios', el: 'Testimonios' },
      { y: 0.9, x: 0.5, n: 22, s: 'faq', el: 'Pregunta frecuente' }
    ];
    const clicks = [];
    const elements = {};
    zones.forEach(z => {
      elements[z.el] = (elements[z.el] || 0) + z.n;
      for (let i = 0; i < z.n; i++) {
        clicks.push({
          xPct: Math.min(0.98, Math.max(0.02, z.x + (Math.random() - 0.5) * 0.08)),
          yPct: Math.min(0.99, Math.max(0.005, z.y + (Math.random() - 0.5) * 0.018)),
          section: z.s, el: z.el, demo: true
        });
      }
    });
    this.write(this.KEYS.analytics, { sessions: 412, docHeight: 7800, sections, clicks, elements, demo: true });
  },

  /* ----------------------------------------------------------------------
     Escalado Proporcional Automático para Celular y Pantallas Pequeñas
     Garantiza que toda la barra superior (todas las opciones) y las
     columnas completas se escalen proporcionalmente a la pantalla sin
     ocultarse ni partirse en bloques verticales.
     ---------------------------------------------------------------------- */
  initProportionalMobileScale() {
    const isPatientPortal = location.pathname.includes('paciente.html');
    const designWidth = isPatientPortal ? 920 : 1220;

    const applyScale = () => {
      // Ancho físico disponible de la pantalla o ventana sin zoom
      const screenW = Math.min(
        window.outerWidth || Infinity,
        window.screen?.width || Infinity,
        document.documentElement.clientWidth || window.innerWidth
      );
      const currentInner = window.innerWidth || document.documentElement.clientWidth;

      // Si el navegador ya escaló vía <meta name="viewport" content="width=1220"> (ej. iOS/Android nativo),
      // currentInner ya es >= designWidth y no hace falta aplicar zoom adicional.
      if (currentInner >= designWidth) {
        document.documentElement.style.zoom = '';
        document.body.style.minWidth = designWidth + 'px';
        return;
      }

      // Si estamos en una ventana o vista móvil donde currentInner < designWidth,
      // escalamos proporcionalmente todo el lienzo de 1220px para que encaje exacto en la pantalla.
      const scale = Math.max(0.25, currentInner / designWidth);
      document.body.style.minWidth = designWidth + 'px';
      document.documentElement.style.zoom = scale.toFixed(4);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyScale);
    } else {
      applyScale();
    }
    window.addEventListener('resize', applyScale);
    window.addEventListener('orientationchange', applyScale);
  }
};

VDT.seedIfEmpty();
VDT.initProportionalMobileScale();
