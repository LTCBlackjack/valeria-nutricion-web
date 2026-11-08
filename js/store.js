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
    session: 'vdt_patient_session'
  },

  // Horario de atención: 13:00 a 21:00 hrs, sesiones de 1 hora (última inicia 20:00)
  HOURS: ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],

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
  }
};

VDT.seedIfEmpty();
