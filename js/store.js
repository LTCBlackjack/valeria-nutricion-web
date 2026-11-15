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
     Incluye las preguntas 6 a 75 de "VAL NUTRICIÓN · Historia clínica inicial · 30 días para ti"
     con soporte para campos condicionales (dependsOn) que se habilitan según la respuesta previa.
     ---------------------------------------------------------------------- */
  isQuestionEnabled(qq, answers) {
    if (!qq || !qq.dependsOn || !qq.dependsOn.id) return true;
    const dep = qq.dependsOn;
    const rawVal = answers ? answers[dep.id] : undefined;
    const val = (rawVal && typeof rawVal === 'object' && !Array.isArray(rawVal) && rawVal.value !== undefined)
      ? rawVal.value
      : rawVal;

    if (val === undefined || val === null || val === '') return false;
    if (Array.isArray(val) && val.length === 0) return false;

    const target = dep.value || 'Sí';
    const mode = dep.mode || 'equals';

    if (mode === 'equals') {
      return Array.isArray(val) ? val.includes(target) : String(val) === String(target);
    }
    if (mode === 'starts_with') {
      return Array.isArray(val)
        ? val.some(x => String(x).startsWith(target))
        : String(val).startsWith(target);
    }
    if (mode === 'not_equals') {
      return Array.isArray(val) ? !val.includes(target) : String(val) !== String(target);
    }
    if (mode === 'not_only') {
      if (Array.isArray(val)) {
        return val.some(x => x !== target);
      }
      return String(val) !== String(target);
    }
    return true;
  },

  formatAnswer(val) {
    if (val === undefined || val === null || val === '') return 'Sin responder';
    if (Array.isArray(val)) return val.length ? val.join(', ') : 'Sin responder';
    if (typeof val === 'object') {
      return Object.entries(val).map(([k, v]) => `${k}: ${v}`).join(' | ') || 'Sin responder';
    }
    return String(val);
  },

  defaultQuestionnaire() {
    const FREQ_COLS = [
      'Nunca o casi nunca',
      '1–2 veces/semana',
      '3–4 veces/semana',
      '5–6 días por semana',
      '1 vez al día',
      '2 o más veces al día'
    ];
    return {
      schemaVersion: 3,
      title: 'VAL NUTRICIÓN · Historia clínica inicial · 30 días para ti',
      intro: '¡Bienvenida a VAL NUTRICIÓN! Antes de nuestra primera consulta, me gustaría conocer un poco más sobre ti, tu salud, tus hábitos alimentarios y los cambios que has experimentado. Tus respuestas me ayudarán a preparar una valoración nutricional individualizada. Tiempo estimado: 12–18 minutos.',
      updatedAt: new Date().toISOString(),
      questions: [
        // SECCIÓN 1 (desde pregunta 6)
        {
          id: 'q6',
          section: 'Sección 1. Ocupación y rutina diaria',
          sectionIntro: 'Cuéntame brevemente sobre tu actividad laboral y tus horarios habituales.',
          type: 'textarea',
          required: true,
          label: '¿A qué te dedicas actualmente y cómo es, en general, tu horario de trabajo?',
          options: []
        },

        // SECCIÓN 2. Motivo de consulta y objetivos
        {
          id: 'q7',
          section: 'Sección 2. Motivo de consulta y objetivos',
          sectionIntro: 'Me gustaría conocer qué te ha motivado a buscar acompañamiento nutricional y qué cambios deseas conseguir durante nuestro programa.',
          type: 'textarea',
          required: true,
          label: '¿Cuál es el principal motivo por el que has decidido acudir a consulta nutricional?',
          options: []
        },
        {
          id: 'q8',
          type: 'multiple',
          required: true,
          label: '¿Qué cambios has notado en tu salud o bienestar durante los últimos meses?',
          note: 'Puedes seleccionar más de una opción.',
          options: [
            'Cambios en mi peso o composición corporal',
            'Cansancio o falta de energía',
            'Cambios en mi sueño',
            'Cambios en mi ciclo menstrual',
            'Cambios en mi estado de ánimo',
            'Problemas digestivos',
            'Cambios en mi apetito o hambre',
            'Dolores musculares o articulares',
            'No he notado cambios importantes',
            'Otro'
          ]
        },
        {
          id: 'q9',
          type: 'textarea',
          required: true,
          label: '¿Qué te gustaría conseguir durante nuestros 30 días de acompañamiento?',
          options: []
        },
        {
          id: 'q10',
          type: 'textarea',
          required: false,
          label: '¿Qué es lo que más te ha dificultado alcanzar tus objetivos de salud y alimentación anteriormente?',
          options: []
        },

        // SECCIÓN 3. Antecedentes médicos y salud actual
        {
          id: 'q11',
          section: 'Sección 3. Antecedentes médicos y salud actual',
          sectionIntro: 'La siguiente información me ayudará a conocer tu estado de salud, identificar posibles necesidades nutricionales y preparar un acompañamiento adaptado a ti.',
          type: 'multiple',
          required: true,
          label: '¿Tienes alguna enfermedad o condición médica diagnosticada por un profesional de la salud?',
          note: 'Selecciona todas las opciones que correspondan.',
          options: [
            'Hipotiroidismo',
            'Hipertiroidismo',
            'Diabetes mellitus',
            'Prediabetes o resistencia a la insulina',
            'Hipertensión arterial',
            'Colesterol o triglicéridos elevados',
            'Síndrome de ovario poliquístico (SOP)',
            'Endometriosis',
            'Enfermedad renal',
            'Enfermedad hepática',
            'Enfermedad cardiovascular',
            'Enfermedad gastrointestinal',
            'Otra enfermedad autoinmune',
            'Osteopenia u osteoporosis',
            'Anemia o deficiencia de hierro',
            'Otra condición médica',
            'Ninguna de las anteriores'
          ]
        },
        {
          id: 'q12',
          type: 'textarea',
          required: false,
          label: 'Si seleccionaste alguna condición médica, ¿desde cuándo la tienes diagnosticada y qué tratamiento recibes actualmente?',
          dependsOn: { id: 'q11', mode: 'not_only', value: 'Ninguna de las anteriores', hint: 'Se habilita al seleccionar alguna condición médica en la pregunta anterior' },
          options: []
        },
        {
          id: 'q13',
          type: 'yesno',
          required: true,
          label: '¿Tomas actualmente algún medicamento?',
          options: ['Sí', 'No']
        },
        {
          id: 'q14',
          type: 'textarea',
          required: false,
          label: 'Si tomas medicamentos, indica su nombre, dosis, horario y motivo de uso.',
          dependsOn: { id: 'q13', mode: 'equals', value: 'Sí', hint: 'Se habilita al responder "Sí" en ¿Tomas actualmente algún medicamento?' },
          options: []
        },
        {
          id: 'q15',
          type: 'yesno',
          required: true,
          label: '¿Consumes actualmente suplementos alimenticios, vitaminas, minerales o productos herbales?',
          options: ['Sí', 'No']
        },
        {
          id: 'q16',
          type: 'textarea',
          required: false,
          label: 'Si consumes suplementos, indica cuáles, en qué cantidad y con qué frecuencia.',
          dependsOn: { id: 'q15', mode: 'equals', value: 'Sí', hint: 'Se habilita al responder "Sí" en ¿Consumes actualmente suplementos?' },
          options: []
        },
        {
          id: 'q17',
          type: 'textarea',
          required: true,
          label: '¿Tienes alguna alergia o intolerancia alimentaria diagnosticada o algún alimento que sospeches que te causa molestias?',
          note: 'Indica qué alimento y qué reacción o molestia presentas. Si no tienes ninguna, escribe "Ninguna".',
          options: []
        },
        {
          id: 'q18',
          type: 'single',
          required: true,
          label: '¿Cuentas con estudios de laboratorio recientes?',
          options: [
            'Sí, realizados en los últimos 6 meses',
            'Sí, pero tienen más de 6 meses',
            'No cuento con estudios recientes',
            'No lo recuerdo'
          ]
        },
        {
          id: 'q19',
          type: 'textarea',
          required: false,
          label: 'Si cuentas con estudios recientes, ¿cuáles te realizaron y aproximadamente de qué fecha son?',
          dependsOn: { id: 'q18', mode: 'starts_with', value: 'Sí', hint: 'Se habilita al responder "Sí" en ¿Cuentas con estudios de laboratorio recientes?' },
          options: []
        },
        {
          id: 'q20',
          type: 'yesno',
          required: true,
          label: '¿Actualmente recibes atención o seguimiento por algún médico o profesional de la salud por alguna condición específica?',
          options: ['Sí', 'No']
        },
        {
          id: 'q21',
          type: 'textarea',
          required: false,
          label: 'Si respondiste sí, ¿con qué especialista o profesional y por qué motivo?',
          dependsOn: { id: 'q20', mode: 'equals', value: 'Sí', hint: 'Se habilita al responder "Sí" en seguimiento médico actual' },
          options: []
        },

        // SECCIÓN 4. Salud hormonal y ginecológica
        {
          id: 'q22',
          section: 'Sección 4. Salud hormonal y ginecológica',
          sectionIntro: 'Las siguientes preguntas nos ayudarán a conocer tu salud hormonal, tus antecedentes ginecológicos y los cambios que has experimentado en tu ciclo menstrual. Si alguna pregunta no aplica a tu situación o no conoces la respuesta, puedes indicarlo.',
          type: 'text',
          required: true,
          label: '¿A qué edad tuviste tu primera menstruación? Si no lo recuerdas con exactitud, puedes indicar una edad aproximada.',
          options: []
        },
        {
          id: 'q23',
          type: 'single',
          required: true,
          label: '¿Actualmente tienes menstruaciones?',
          options: [
            'Sí, regularmente',
            'Sí, pero mis ciclos son irregulares',
            'No he menstruado en los últimos 3 meses',
            'No he menstruado en los últimos 12 meses',
            'No tengo menstruaciones debido a una cirugía o tratamiento médico',
            'No tengo menstruaciones por embarazo o lactancia',
            'Otra situación'
          ]
        },
        {
          id: 'q24',
          type: 'date',
          required: false,
          label: '¿Cuándo fue el primer día de tu última menstruación?',
          options: []
        },
        {
          id: 'q25',
          type: 'single',
          required: true,
          label: 'Cuando tienes menstruaciones, ¿aproximadamente cada cuántos días comienza un nuevo periodo?',
          options: [
            'Menos de 21 días',
            'Entre 21 y 35 días',
            'Más de 35 días',
            'Mis ciclos son muy variables',
            'Actualmente no menstruo',
            'No lo recuerdo'
          ]
        },
        {
          id: 'q26',
          type: 'single',
          required: true,
          label: '¿Cuántos días suele durar tu sangrado menstrual?',
          options: [
            '1 a 2 días',
            '3 a 5 días',
            '6 a 7 días',
            'Más de 7 días',
            'La duración es muy variable',
            'Actualmente no menstruo',
            'No lo recuerdo'
          ]
        },
        {
          id: 'q27',
          type: 'multiple',
          required: false,
          label: '¿Has notado alguno de los siguientes cambios en tu menstruación durante el último año?',
          options: [
            'Mis ciclos se han vuelto más cortos',
            'Mis ciclos se han vuelto más largos',
            'He tenido meses sin menstruar',
            'Mi sangrado es más abundante',
            'Mi sangrado es más ligero',
            'He presentado sangrado entre menstruaciones',
            'He presentado sangrado después de las relaciones sexuales',
            'He presentado sangrado después de 12 meses sin menstruar',
            'No he notado cambios',
            'Otro'
          ]
        },
        {
          id: 'q28',
          type: 'multiple',
          required: true,
          label: '¿Alguna vez un médico te ha diagnosticado alguna de las siguientes condiciones ginecológicas?',
          options: [
            'Síndrome de ovario poliquístico (SOP)',
            'Endometriosis',
            'Miomas uterinos',
            'Adenomiosis',
            'Insuficiencia ovárica primaria (IOP)',
            'Menopausia',
            'Otra condición ginecológica',
            'No tengo diagnósticos ginecológicos conocidos',
            'No lo sé'
          ]
        },
        {
          id: 'q29',
          type: 'single',
          required: true,
          label: '¿Has estado embarazada alguna vez?',
          options: ['Sí', 'No', 'Prefiero hablarlo en consulta']
        },
        {
          id: 'q30',
          type: 'textarea',
          required: false,
          label: 'Si has estado embarazada, ¿cuántos embarazos y partos has tenido? Si lo consideras relevante, menciona alguna complicación importante.',
          dependsOn: { id: 'q29', mode: 'equals', value: 'Sí', hint: 'Se habilita al responder "Sí" en ¿Has estado embarazada alguna vez?' },
          options: []
        },
        {
          id: 'q31',
          type: 'multiple',
          required: true,
          label: '¿Actualmente utilizas algún método anticonceptivo?',
          options: [
            'Anticonceptivos orales',
            'Dispositivo intrauterino hormonal (DIU)',
            'Dispositivo intrauterino de cobre',
            'Implante anticonceptivo',
            'Inyección, parche o anillo hormonal',
            'Preservativo',
            'Método anticonceptivo permanente',
            'No utilizo anticonceptivos',
            'Otro'
          ]
        },
        {
          id: 'q32',
          type: 'single',
          required: false,
          label: '¿Actualmente utilizas algún tratamiento hormonal indicado por un médico?',
          options: ['Sí', 'No', 'No estoy segura']
        },
        {
          id: 'q33',
          type: 'textarea',
          required: false,
          label: 'Si utilizas algún tratamiento hormonal, indica el nombre del medicamento, la dosis y desde cuándo lo utilizas.',
          dependsOn: { id: 'q32', mode: 'equals', value: 'Sí', hint: 'Se habilita al responder "Sí" en tratamiento hormonal actual' },
          options: []
        },
        {
          id: 'q34',
          type: 'multiple',
          required: false,
          label: 'Durante los últimos 3 meses, ¿has presentado alguno de los siguientes síntomas o cambios?',
          options: [
            'Bochornos o sensación repentina de calor',
            'Sudoración nocturna',
            'Dificultad para conciliar el sueño',
            'Despertares frecuentes',
            'Cansancio o falta de energía',
            'Cambios en el estado de ánimo o irritabilidad',
            'Dificultad para concentrarme o problemas de memoria',
            'Resequedad vaginal',
            'Molestias durante las relaciones sexuales',
            'Disminución del deseo sexual',
            'Dolores musculares o articulares',
            'Dolores de cabeza',
            'Palpitaciones',
            'Ninguno de los anteriores',
            'Otro'
          ]
        },
        {
          id: 'q35',
          type: 'single',
          required: false,
          label: '¿Con qué frecuencia experimentas bochornos o sudoración nocturna?',
          options: [
            'Nunca',
            'Menos de una vez por semana',
            'Entre 1 y 3 días por semana',
            'Entre 4 y 6 días por semana',
            'Todos los días',
            'Varias veces al día'
          ]
        },
        {
          id: 'q36',
          type: 'scale',
          min: 0,
          max: 10,
          minLabel: '0 = No me afectan',
          maxLabel: '10 = Me afectan muchísimo',
          required: false,
          label: 'En general, ¿cuánto afectan estos síntomas tu vida cotidiana?',
          options: []
        },
        {
          id: 'q37',
          type: 'single',
          required: false,
          label: '¿Desde cuándo comenzaste a notar estos síntomas?',
          options: [
            'Hace menos de 3 meses',
            'Entre 3 y 6 meses',
            'Entre 6 meses y 1 año',
            'Hace más de 1 año',
            'No recuerdo con exactitud',
            'No he presentado síntomas'
          ]
        },
        {
          id: 'q38',
          type: 'multiple',
          required: false,
          label: '¿Has consultado con algún profesional de la salud por estos síntomas?',
          options: [
            'Sí, con ginecología',
            'Sí, con endocrinología',
            'Sí, con medicina general u otra especialidad',
            'No he consultado',
            'No he presentado síntomas'
          ]
        },
        {
          id: 'q39',
          type: 'textarea',
          required: false,
          label: '¿Hay algún síntoma o cambio en tu salud que te preocupe especialmente y que te gustaría que abordáramos durante nuestra consulta?',
          options: []
        },

        // SECCIÓN 5. Alimentación y hábitos nutricionales
        {
          id: 'q40',
          section: 'Sección 5. Alimentación y hábitos nutricionales',
          sectionIntro: 'Cuéntame cómo es tu alimentación habitual. No necesitas modificar lo que comes antes de responder. Esta información me ayudará a conocer tus hábitos y preparar recomendaciones adaptadas a tus necesidades, preferencias y estilo de vida.',
          type: 'single',
          required: true,
          label: '¿Cuántas comidas realizas habitualmente al día?',
          options: [
            '1 comida',
            '2 comidas',
            '3 comidas',
            '4 comidas',
            '5 o más comidas',
            'Varía mucho de un día a otro'
          ]
        },
        {
          id: 'q41',
          type: 'textarea',
          required: true,
          label: '¿A qué hora acostumbras realizar tus comidas principales?',
          note: 'Indica aproximadamente a qué hora desayunas, comes y cenas. Si realizas colaciones, incluye también sus horarios.',
          options: []
        },
        {
          id: 'q42',
          type: 'textarea',
          required: true,
          label: 'Describe qué comiste y bebiste ayer, desde que despertaste hasta que te acostaste.',
          note: 'Incluye desayuno, comida, cena, colaciones, bebidas y cantidades aproximadas. Si puedes, menciona los horarios y cómo se prepararon los alimentos.',
          options: []
        },
        {
          id: 'q43',
          type: 'grid',
          required: true,
          label: '¿Con qué frecuencia consumes los siguientes alimentos?',
          rows: [
            'Frutas',
            'Verduras',
            'Leguminosas (frijoles, lentejas, garbanzos)',
            'Huevo',
            'Pescado y mariscos',
            'Carnes, pollo y otras aves',
            'Leche, yogur y quesos',
            'Cereales integrales (avena, arroz integral, pan integral)',
            'Nueces y semillas',
            'Dulces, postres y pan dulce',
            'Bebidas azucaradas',
            'Aguacate y aceite de oliva',
            'Productos de soya (tofu, edamame, bebida de soya)'
          ],
          columns: FREQ_COLS,
          options: FREQ_COLS
        },
        {
          id: 'q44',
          type: 'single',
          required: false,
          label: '¿Cuánta agua natural bebes aproximadamente al día?',
          options: [
            'Menos de 500 ml',
            'Entre 500 ml y 1 litro',
            'Entre 1 y 1.5 litros',
            'Entre 1.5 y 2 litros',
            'Entre 2 y 3 litros',
            'Más de 3 litros',
            'No lo sé'
          ]
        },
        {
          id: 'q45',
          type: 'multiple',
          required: false,
          label: '¿Quién se encarga habitualmente de preparar tus alimentos?',
          options: [
            'Yo preparo mis alimentos',
            'Mi pareja',
            'Otro familiar',
            'Personal de apoyo en casa',
            'Compro comida preparada',
            'Como principalmente fuera de casa',
            'Otro'
          ]
        },
        {
          id: 'q46',
          type: 'scale',
          min: 1,
          max: 5,
          minLabel: '1 = Muy difícil',
          maxLabel: '5 = Muy fácil',
          required: false,
          label: '¿Qué tan fácil o difícil te resulta organizar y preparar tus comidas durante la semana?',
          options: []
        },
        {
          id: 'q47',
          type: 'single',
          required: true,
          label: '¿Tu alimentación suele cambiar de manera importante durante fines de semana o días de descanso?',
          options: [
            'No, suele ser similar',
            'Sí, como en horarios diferentes',
            'Sí, suelo comer más fuera de casa',
            'Sí, cambia bastante lo que como',
            'Varía dependiendo de la semana'
          ]
        },
        {
          id: 'q48',
          type: 'textarea',
          required: false,
          label: 'Si quieres, cuéntame brevemente qué suele cambiar.',
          dependsOn: { id: 'q47', mode: 'not_equals', value: 'No, suele ser similar', hint: 'Se habilita cuando tu alimentación cambia en fines de semana o días de descanso' },
          options: []
        },

        // SECCIÓN 6. Relación con la alimentación
        {
          id: 'q49',
          section: 'Sección 6. Relación con la alimentación',
          sectionIntro: 'La alimentación no depende únicamente de qué comemos. Estas preguntas me ayudarán a conocer mejor tu hambre, saciedad, experiencias previas y relación con los alimentos.',
          type: 'textarea',
          required: false,
          label: '¿Has realizado anteriormente alguna dieta, plan de alimentación o tratamiento para modificar tu peso o mejorar tu salud? ¿Cómo fue tu experiencia?',
          options: []
        },
        {
          id: 'q50',
          type: 'single',
          required: true,
          label: '¿Sueles llegar a alguna comida con muchísima hambre?',
          options: ['Nunca', 'Rara vez', 'Algunas veces', 'Frecuentemente', 'Casi todos los días']
        },
        {
          id: 'q51',
          type: 'single',
          required: true,
          label: '¿Hay momentos en los que sientes que comes sin tener hambre física?',
          options: ['Nunca', 'Rara vez', 'Algunas veces', 'Frecuentemente', 'Casi todos los días']
        },
        {
          id: 'q52',
          type: 'single',
          required: false,
          label: '¿Has tenido episodios en los que sientes que pierdes el control sobre cuánto comes o que no puedes detenerte?',
          options: ['Nunca', 'Rara vez', 'Algunas veces', 'Frecuentemente', 'Prefiero hablarlo en consulta']
        },
        {
          id: 'q53',
          type: 'single',
          required: false,
          label: '¿Sientes culpa, ansiedad o preocupación después de comer determinados alimentos?',
          options: ['Nunca', 'Rara vez', 'Algunas veces', 'Frecuentemente', 'Prefiero hablarlo en consulta']
        },
        {
          id: 'q54',
          type: 'single',
          required: false,
          label: '¿Te resulta fácil reconocer cuándo tienes hambre y cuándo ya estás satisfecha?',
          options: [
            'Sí, generalmente',
            'A veces',
            'Me cuesta reconocer cuándo tengo hambre',
            'Me cuesta reconocer cuándo estoy satisfecha',
            'Me cuesta reconocer ambas',
            'No estoy segura'
          ]
        },

        // SECCIÓN 7. Sueño, actividad física y estilo de vida
        {
          id: 'q55',
          section: 'Sección 7. Sueño, actividad física y estilo de vida',
          sectionIntro: 'Estos hábitos también forman parte de tu salud. Conocer tu descanso, actividad física y rutina diaria me ayudará a establecer objetivos realistas y adaptados a tu vida.',
          type: 'single',
          required: true,
          label: '¿Cuántas horas duermes aproximadamente cada noche?',
          options: ['Menos de 5', '5–6', '6–7', '7–8', 'Más de 8 horas', 'Varía mucho']
        },
        {
          id: 'q56',
          type: 'scale',
          min: 1,
          max: 5,
          minLabel: '1 = Muy mala',
          maxLabel: '5 = Muy buena',
          required: true,
          label: '¿Cómo calificarías la calidad de tu sueño actualmente?',
          options: []
        },
        {
          id: 'q57',
          type: 'single',
          required: false,
          label: '¿Tu sueño suele interrumpirse durante la noche?',
          options: [
            'No, generalmente duermo de corrido',
            'Sí, una vez por noche',
            'Sí, 2–3 veces por noche',
            'Sí, 4 o más veces por noche',
            'Varía mucho'
          ]
        },
        {
          id: 'q58',
          type: 'multiple',
          required: false,
          label: 'Si tu sueño se interrumpe, ¿cuál suele ser el motivo?',
          dependsOn: { id: 'q57', mode: 'not_equals', value: 'No, generalmente duermo de corrido', hint: 'Se habilita cuando indicas que tu sueño se interrumpe durante la noche' },
          options: [
            'Necesidad de ir al baño',
            'Bochornos o sudoración nocturna',
            'Dificultad para volver a dormir',
            'Dolor o molestias físicas',
            'Ruido, hijos, pareja, mascotas u otras interrupciones',
            'No identifico el motivo',
            'No suelo despertarme durante la noche',
            'Otro'
          ]
        },
        {
          id: 'q59',
          type: 'yesno',
          required: true,
          label: '¿Realizas actualmente ejercicio o actividad física de manera intencional?',
          options: ['Sí', 'No']
        },
        {
          id: 'q60',
          type: 'textarea',
          required: false,
          label: 'Si realizas ejercicio, ¿qué actividad haces, cuántos días por semana y aproximadamente cuánto tiempo por sesión?',
          dependsOn: { id: 'q59', mode: 'equals', value: 'Sí', hint: 'Se habilita al responder "Sí" en ¿Realizas actualmente ejercicio o actividad física?' },
          options: []
        },
        {
          id: 'q61',
          type: 'single',
          required: true,
          label: '¿Realizas ejercicios de fuerza o resistencia muscular?',
          options: ['No', '1 día por semana', '2 días', '3 días', '4 o más días']
        },
        {
          id: 'q62',
          type: 'single',
          required: true,
          label: 'Fuera del ejercicio, ¿cómo describirías tu actividad durante un día habitual?',
          options: [
            'Paso la mayor parte del día sentada',
            'Alterno periodos sentada y en movimiento',
            'Paso buena parte del día caminando o de pie',
            'Mi trabajo o rutina requiere bastante actividad física'
          ]
        },
        {
          id: 'q63',
          type: 'textarea',
          required: false,
          label: '¿Tienes alguna lesión, dolor o limitación física que debamos considerar?',
          options: []
        },
        {
          id: 'q64',
          type: 'scale',
          min: 0,
          max: 10,
          minLabel: '0 = Nada de estrés',
          maxLabel: '10 = Estrés extremadamente alto',
          required: true,
          label: '¿Qué tan alto sientes tu nivel de estrés actualmente?',
          options: []
        },
        {
          id: 'q65',
          type: 'multiple',
          required: false,
          label: '¿Qué situaciones generan actualmente la mayor parte de tu estrés?',
          options: [
            'Trabajo',
            'Responsabilidades familiares',
            'Economía',
            'Salud',
            'Relación de pareja',
            'Cuidado de otras personas',
            'Falta de tiempo',
            'Cambios importantes en mi vida',
            'No identifico una causa principal',
            'Prefiero hablarlo durante la consulta',
            'Otro'
          ]
        },

        // SECCIÓN 8. Preferencias, posibilidades y disposición al cambio
        {
          id: 'q66',
          section: 'Sección 8. Preferencias, posibilidades y disposición al cambio',
          sectionIntro: 'Para que tus recomendaciones sean realmente útiles, necesito conocer un poco más sobre tus gustos, posibilidades y rutina. No buscamos una alimentación perfecta, sino una estrategia que puedas integrar a tu vida.',
          type: 'textarea',
          required: false,
          label: '¿Hay alimentos que no te gustan, que prefieres no consumir o que no forman parte de tu alimentación habitual? ¿Cuáles?',
          options: []
        },
        {
          id: 'q67',
          type: 'textarea',
          required: true,
          label: '¿Qué alimentos o comidas disfrutas especialmente y te gustaría conservar dentro de tu alimentación?',
          options: []
        },
        {
          id: 'q68',
          type: 'single',
          required: false,
          label: '¿Cuánto tiempo tienes normalmente para preparar tus alimentos?',
          options: [
            'Menos de 15 minutos',
            '15–30 minutos',
            '30–60 minutos',
            'Más de una hora',
            'Casi nunca cocino'
          ]
        },
        {
          id: 'q69',
          type: 'single',
          required: true,
          label: '¿Cómo describirías tu presupuesto disponible para alimentación?',
          options: [
            'Necesito mantener mis gastos lo más bajos posible',
            'Tengo un presupuesto moderado',
            'Tengo flexibilidad en mi presupuesto',
            'Prefiero explicarlo durante la consulta'
          ]
        },
        {
          id: 'q70',
          type: 'text',
          required: true,
          label: 'Habitualmente, ¿para cuántas personas compras o preparas alimentos, incluyéndote a ti?',
          options: []
        },
        {
          id: 'q71',
          type: 'multiple',
          required: true,
          label: '¿Qué situaciones dificultan más que mantengas una alimentación como te gustaría?',
          options: [
            'Falta de tiempo',
            'Cansancio',
            'Trabajo',
            'Responsabilidades familiares',
            'Presupuesto',
            'No saber qué preparar',
            'Comer fuera de casa',
            'Antojos',
            'Hambre',
            'Estrés o emociones',
            'Falta de apoyo en casa',
            'Ninguna en particular',
            'Horarios cambiantes o poco predecibles',
            'No tengo acceso fácil a cocina o alimentos preparados en casa',
            'Otro'
          ]
        },
        {
          id: 'q72',
          type: 'textarea',
          required: true,
          label: 'Si tuvieras que elegir UN cambio en tu alimentación o estilo de vida que te gustaría conseguir primero, ¿cuál sería?',
          options: []
        },
        {
          id: 'q73',
          type: 'scale',
          min: 0,
          max: 10,
          minLabel: '0 = No me siento preparada',
          maxLabel: '10 = Me siento completamente preparada',
          required: true,
          label: 'Del 0 al 10, ¿qué tan preparada te sientes actualmente para realizar cambios en tus hábitos?',
          options: []
        },
        {
          id: 'q74',
          type: 'textarea',
          required: false,
          label: '¿Hay algo más sobre ti, tu salud, tu alimentación o tu situación actual que consideres importante que conozca antes de nuestra consulta?',
          options: []
        },
        {
          id: 'q75',
          type: 'textarea',
          required: false,
          label: '¿Qué esperas de mí como tu nutrióloga durante estos 30 días de acompañamiento?',
          options: []
        }
      ]
    };
  },

  getQuestionnaire() {
    let q = this.read(this.KEYS.questionnaire, null);
    if (!q || q.schemaVersion !== 3) {
      q = this.defaultQuestionnaire();
      this.write(this.KEYS.questionnaire, q);
    }
    return q;
  },

  defaultDemoResponses() {
    const defaultGrid = {
      'Frutas': '1 vez al día',
      'Verduras': '1 vez al día',
      'Leguminosas (frijoles, lentejas, garbanzos)': '3–4 veces/semana',
      'Huevo': '5–6 días por semana',
      'Pescado y mariscos': '1–2 veces/semana',
      'Carnes, pollo y otras aves': '3–4 veces/semana',
      'Leche, yogur y quesos': '3–4 veces/semana',
      'Cereales integrales (avena, arroz integral, pan integral)': '5–6 días por semana',
      'Nueces y semillas': '3–4 veces/semana',
      'Dulces, postres y pan dulce': '1–2 veces/semana',
      'Bebidas azucaradas': 'Nunca o casi nunca',
      'Aguacate y aceite de oliva': '1 vez al día',
      'Productos de soya (tofu, edamame, bebida de soya)': 'Nunca o casi nunca'
    };

    return [
      {
        id: 'r1',
        schemaVersion: 3,
        folio: 'VT-8410',
        patientEmail: 'anasofia.mtz@gmail.com',
        patientName: 'Ana Sofía Martínez',
        submittedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        answers: {
          q6: 'Diseñadora UX en modalidad híbrida, horario de 9:00 a 18:30 hrs de lunes a viernes.',
          q7: 'Diagnóstico de SOP hace 2 años, ciclos de 45 días, inflamación abdominal y cansancio por las tardes.',
          q8: ['Cambios en mi peso o composición corporal', 'Cansancio o falta de energía', 'Cambios en mi ciclo menstrual'],
          q9: 'Regular mi ciclo menstrual, mejorar mi energía a media tarde y organizar mis comidas sin ansiedad.',
          q10: 'Dietas muy restrictivas que me daban más antojos por la tarde.',
          q11: ['Prediabetes o resistencia a la insulina', 'Síndrome de ovario poliquístico (SOP)'],
          q12: 'Diagnosticada hace 2 años por ginecología; actualmente con mio-inositol.',
          q13: 'No',
          q14: '',
          q15: 'Sí',
          q16: 'Mio-inositol 2 g cada mañana y Magnesio 300 mg por la noche.',
          q17: 'Intolerancia leve a la lactosa (leche entera me inflama).',
          q18: 'Sí, realizados en los últimos 6 meses',
          q19: 'Perfil hormonal ginecológico, insulina basal, glucosa y curva de tolerancia hace 2 meses.',
          q20: 'Sí',
          q21: 'Ginecología endocrina por seguimiento de SOP.',
          q22: '12 años',
          q23: 'Sí, pero mis ciclos son irregulares',
          q24: '2026-10-08',
          q25: 'Más de 35 días',
          q26: '3 a 5 días',
          q27: ['Mis ciclos se han vuelto más largos'],
          q28: ['Síndrome de ovario poliquístico (SOP)'],
          q29: 'No',
          q30: '',
          q31: ['No utilizo anticonceptivos'],
          q32: 'No',
          q33: '',
          q34: ['Cansancio o falta de energía', 'Cambios en el estado de ánimo o irritabilidad'],
          q35: 'Nunca',
          q36: 6,
          q37: 'Hace más de 1 año',
          q38: ['Sí, con ginecología'],
          q39: 'Los picos de cansancio y antojos dulces después de comer.',
          q40: '3 comidas',
          q41: 'Desayuno 9:30 am, comida 2:30 pm, cena 8:30 pm.',
          q42: 'Desayuno: huevos revueltos con espinaca y 1 rebanada de pan masa madre, café sin azúcar. Comida: pechuga asada con arroz y ensalada. Cena: quesadilla en tortilla de maíz con aguacate.',
          q43: defaultGrid,
          q44: 'Entre 1.5 y 2 litros',
          q45: ['Yo preparo mis alimentos'],
          q46: 3,
          q47: 'Sí, suelo comer más fuera de casa',
          q48: 'Los sábados y domingos suelo desayunar más tarde y cenar fuera.',
          q49: 'Hice dieta cetogénica hace 1 año pero no pude sostenerla.',
          q50: 'Algunas veces',
          q51: 'Algunas veces',
          q52: 'Rara vez',
          q53: 'Algunas veces',
          q54: 'Sí, generalmente',
          q55: '6–7',
          q56: 4,
          q57: 'No, generalmente duermo de corrido',
          q58: [],
          q59: 'Sí',
          q60: 'Pilates reformer y pesas 3 días por semana, 50 minutos por sesión.',
          q61: '3 días',
          q62: 'Paso la mayor parte del día sentada',
          q63: 'Ninguna.',
          q64: 7,
          q65: ['Trabajo', 'Falta de tiempo'],
          q66: 'No me gusta el hígado ni el apio crudo.',
          q67: 'El café por la mañana, aguacate, tortillas de maíz y fruta con yogur griego.',
          q68: '15–30 minutos',
          q69: 'Tengo un presupuesto moderado',
          q70: 'Para 2 personas (mi pareja y yo)',
          q71: ['Falta de tiempo', 'Cansancio', 'Antojos'],
          q72: 'Tener desayunos y cenas prácticas que mantengan estable mi glucosa.',
          q73: 9,
          q74: 'Tengo mis estudios en PDF listos para mostrártelos en la videollamada.',
          q75: 'Un plan realista, claro y acompañamiento para entender mi ciclo.'
        }
      },
      {
        id: 'r2',
        schemaVersion: 3,
        folio: 'VT-8425',
        patientEmail: 'val.hernandez@outlook.com',
        patientName: 'Valeria Hernández Ruiz',
        submittedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        answers: {
          q6: 'Abogada corporativa, horario de oficina de 8:30 a 19:00 hrs.',
          q7: 'Hipotiroidismo subclínico, cansancio matutino y dificultad para bajar porcentaje de grasa.',
          q8: ['Cambios en mi peso o composición corporal', 'Cansancio o falta de energía', 'Problemas digestivos'],
          q9: 'Recuperar mi energía diaria, desinflamarme y optimizar mi nutrición tiroidea.',
          q10: 'Horarios largos de oficina y comer rápido entre reuniones.',
          q11: ['Hipotiroidismo', 'Colesterol o triglicéridos elevados'],
          q12: 'Hipotiroidismo desde hace 3 años, en tratamiento con Levotiroxina.',
          q13: 'Sí',
          q14: 'Levotiroxina 50 mcg en ayunas todos los días (6:30 am).',
          q15: 'Sí',
          q16: 'Vitamina D3 4000 UI diarias y Selenio.',
          q17: 'Ninguna.',
          q18: 'Sí, realizados en los últimos 6 meses',
          q19: 'Perfil tiroideo completo (TSH, T3L, T4L, anticuerpos) y química sanguínea hace 1 mes.',
          q20: 'Sí',
          q21: 'Endocrinólogo cada 6 meses para ajuste de dosis tiroidea.',
          q22: '13 años',
          q23: 'Sí, regularmente',
          q24: '2026-10-22',
          q25: 'Entre 21 y 35 días',
          q26: '3 a 5 días',
          q27: ['No he notado cambios'],
          q28: ['No tengo diagnósticos ginecológicos conocidos'],
          q29: 'Sí',
          q30: '1 embarazo y 1 parto sin complicaciones hace 4 años.',
          q31: ['Dispositivo intrauterino de cobre'],
          q32: 'No',
          q33: '',
          q34: ['Cansancio o falta de energía', 'Dificultad para conciliar el sueño'],
          q35: 'Nunca',
          q36: 7,
          q37: 'Entre 6 meses y 1 año',
          q38: ['Sí, con endocrinología'],
          q39: 'Sentirme agotada desde temprano aunque duerma 7 horas.',
          q40: '3 comidas',
          q41: 'Desayuno 8:00 am, comida 3:00 pm, cena 9:00 pm.',
          q42: 'Desayuno: avena con leche de almendra y plátano. Comida: salmón a la plancha con verduras y quinoa. Cena: ensalada con atún y tostadas horneadas.',
          q43: defaultGrid,
          q44: 'Entre 1 y 1.5 litros',
          q45: ['Yo preparo mis alimentos', 'Compro comida preparada'],
          q46: 2,
          q47: 'Sí, como en horarios diferentes',
          q48: 'En fin de semana cocino en casa con mi familia.',
          q49: 'Planes hipocalóricos tradicionales donde pasaba hambre.',
          q50: 'Frecuentemente',
          q51: 'Rara vez',
          q52: 'Nunca',
          q53: 'Rara vez',
          q54: 'Sí, generalmente',
          q55: '6–7',
          q56: 3,
          q57: 'Sí, una vez por noche',
          q58: ['Necesidad de ir al baño', 'Dificultad para volver a dormir'],
          q59: 'Sí',
          q60: 'Caminata rápida y entrenamiento funcional 2 veces por semana, 45 min.',
          q61: '2 días',
          q62: 'Paso la mayor parte del día sentada',
          q63: 'Ninguna.',
          q64: 8,
          q65: ['Trabajo', 'Responsabilidades familiares', 'Falta de tiempo'],
          q66: 'No consumo picante ni mariscos crudos.',
          q67: 'Salmón, pan integral, frutos rojos y chocolate amargo.',
          q68: '15–30 minutos',
          q69: 'Tengo flexibilidad en mi presupuesto',
          q70: 'Para 3 personas',
          q71: ['Falta de tiempo', 'Trabajo', 'Comer fuera de casa'],
          q72: 'Aprender a armar comidas prácticas para llevar a la oficina.',
          q73: 8,
          q74: 'Tomo la levotiroxina a las 6:30 am y desayuno a las 8:00 am.',
          q75: 'Guía práctica y menús fáciles de adaptar a mi semana laboral.'
        }
      },
      {
        id: 'r3',
        schemaVersion: 3,
        folio: 'VT-8451',
        patientEmail: 'caro.vega@gmail.com',
        patientName: 'Carolina Vega Soto',
        submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        answers: {
          q6: 'Arquitecta independiente, horarios flexibles entre obra y estudio (9:00 a 17:30 hrs).',
          q7: 'Quiero preparar mi cuerpo y reserva nutricional para buscar embarazo en los próximos meses.',
          q8: ['Cambios en mi ciclo menstrual'],
          q9: 'Optimizar mi fertilidad, aprender a comer según las fases de mi ciclo y cubrir micronutrientes clave.',
          q10: 'No sabía qué suplementos ni qué ajustes hacer al dejar anticonceptivos.',
          q11: ['Ninguna de las anteriores'],
          q12: '',
          q13: 'No',
          q14: '',
          q15: 'Sí',
          q16: 'Ácido fólico metilado 400 mcg y Omega 3 diario.',
          q17: 'Alergia a los camarones.',
          q18: 'No cuento con estudios recientes',
          q19: '',
          q20: 'No',
          q21: '',
          q22: '12 años',
          q23: 'Sí, regularmente',
          q24: '2026-10-18',
          q25: 'Entre 21 y 35 días',
          q26: '3 a 5 días',
          q27: ['No he notado cambios'],
          q28: ['No tengo diagnósticos ginecológicos conocidos'],
          q29: 'No',
          q30: '',
          q31: ['No utilizo anticonceptivos'],
          q32: 'No',
          q33: '',
          q34: ['Ninguno de los anteriores'],
          q35: 'Nunca',
          q36: 1,
          q37: 'No he presentado síntomas',
          q38: ['Sí, con ginecología'],
          q39: 'Asegurar que mis niveles de hierro, folato y ovulación estén en óptimas condiciones.',
          q40: '4 comidas',
          q41: 'Desayuno 8:30 am, colación 12:00 pm, comida 3:00 pm, cena 8:30 pm.',
          q42: 'Desayuno: chilaquiles horneados con pollo y huevo. Colación: manzana con almendras. Comida: lentejas con verduras y bistec asado. Cena: pan tostado con requesón y aguacate.',
          q43: defaultGrid,
          q44: 'Entre 2 y 3 litros',
          q45: ['Yo preparo mis alimentos', 'Mi pareja'],
          q46: 4,
          q47: 'No, suele ser similar',
          q48: '',
          q49: 'Nunca he hecho dietas restrictivas, busco nutrición funcional.',
          q50: 'Rara vez',
          q51: 'Rara vez',
          q52: 'Nunca',
          q53: 'Nunca',
          q54: 'Sí, generalmente',
          q55: '7–8',
          q56: 5,
          q57: 'No, generalmente duermo de corrido',
          q58: [],
          q59: 'Sí',
          q60: 'Entrenamiento de fuerza 4 días por semana y yoga 1 día, 1 hora por sesión.',
          q61: '4 o más días',
          q62: 'Alterno periodos sentada y en movimiento',
          q63: 'Ninguna.',
          q64: 4,
          q65: ['Trabajo'],
          q66: 'Camarones (por alergia).',
          q67: 'Lentejas, pescado blanco, aguacate, tortillas de maíz y fruta de temporada.',
          q68: '30–60 minutos',
          q69: 'Tengo flexibilidad en mi presupuesto',
          q70: 'Para 2 personas',
          q71: ['Horarios cambiantes o poco predecibles'],
          q72: 'Estructurar mi alimentación preconcepcional y saber qué laboratorios solicitar.',
          q73: 10,
          q74: 'Suspendí anticonceptivos orales hace 4 meses.',
          q75: 'Acompañamiento cercano y basado en evidencia científica para fertilidad.'
        }
      }
    ];
  },

  /* ----------------------------------------------------------------------
     Datos de demostración (para que el panel no inicie vacío)
     ---------------------------------------------------------------------- */
  seedIfEmpty() {
    this.getQuestionnaire();

    const existingResponses = this.read(this.KEYS.responses, null);
    if (!existingResponses || (existingResponses[0] && existingResponses[0].schemaVersion !== 3)) {
      this.write(this.KEYS.responses, this.defaultDemoResponses());
    }

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

    this.write(this.KEYS.responses, this.defaultDemoResponses());

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
  }
};

VDT.seedIfEmpty();
