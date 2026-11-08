/**
 * ============================================================================
 * BACKEND DE AUTOMATIZACIÓN DE RESERVAS, PAGOS, CALENDARIO Y CORREOS
 * Proyecto: Lic. Valeria de la Torre — Nutrición Hormonal Femenina
 * Desarrollador: LeonardLance
 * ============================================================================
 * REGLA DE NEGOCIO PRINCIPAL:
 * 1. El cliente inicia su reserva y es enviado a la pasarela de pago (Stripe / MercadoPago).
 * 2. ÚNICAMENTE cuando el Webhook confirma que el pago fue aprobado (paid):
 *    a) Se crea el evento en el Google Calendar de la nutrióloga (con invitación al cliente).
 *    b) Se envía el correo de confirmación al Cliente.
 *    c) Se envía el correo de notificación a la Nutrióloga.
 */

const express = require('express');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const app = express();
app.use(express.json());

const NUTRITIONIST_EMAIL = process.env.NUTRITIONIST_EMAIL || 'valeria.delatorre.nutricion@gmail.com';
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

// 1. Configuración de transporte de Correo (SMTP / Resend / Gmail App Password)
const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// 2. Función para agendar automáticamente en Google Calendar (Invita a Paciente y Nutrióloga)
async function createGoogleCalendarEvent(booking) {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_CREDENTIALS_PATH || './google-service-account.json',
    scopes: ['https://www.googleapis.com/auth/calendar']
  });

  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary: `${booking.serviceName} — ${booking.patientName}`,
    location: booking.modality,
    description: [
      `Reserva Confirmada y Pagada (${booking.folio})`,
      `Paciente: ${booking.patientName}`,
      `Correo: ${booking.patientEmail}`,
      `Teléfono / WhatsApp: ${booking.patientPhone}`,
      `Monto Pagado: $${booking.price} MXN`,
      `Notas: ${booking.notes || 'Sin notas adicionales'}`
    ].join('\n'),
    start: {
      dateTime: booking.startISO, // Ej: '2026-11-12T11:00:00-06:00'
      timeZone: 'America/Mexico_City'
    },
    end: {
      dateTime: booking.endISO,   // Ej: '2026-11-12T12:00:00-06:00'
      timeZone: 'America/Mexico_City'
    },
    attendees: [
      { email: booking.patientEmail, displayName: booking.patientName },
      { email: NUTRITIONIST_EMAIL, displayName: 'Lic. Valeria de la Torre' }
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 60 }
      ]
    }
  };

  const response = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    resource: event,
    sendUpdates: 'all' // Envía la invitación de calendario automáticamente a ambos
  });

  return response.data;
}

// 3. Función para enviar los 2 Correos Electrónicos (Al Cliente y a la Nutrióloga)
async function sendConfirmationEmails(booking) {
  // Correo 1: Para el Paciente
  const patientHtml = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FEFAFA; border: 1px solid #DEB074; border-radius: 16px; padding: 28px; color: #253B2E;">
      <h2 style="color: #A77237; margin-top: 0;">¡Tu Consulta está Confirmada!</h2>
      <p>Hola <strong>${booking.patientName}</strong>,</p>
      <p>Hemos recibido tu pago de <strong>$${booking.price}.00 MXN</strong> (Folio: <strong>${booking.folio}</strong>). Tu horario ha quedado reservado en nuestro calendario:</p>
      <div style="background: #FAF6F0; border-left: 4px solid #3D5540; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>Especialista:</strong> Lic. Valeria de la Torre (Nutrición Hormonal Femenina)</p>
        <p style="margin: 4px 0;"><strong>Consulta:</strong> ${booking.serviceName}</p>
        <p style="margin: 4px 0;"><strong>Fecha y Hora:</strong> ${booking.dateLabel} · ${booking.timeLabel}</p>
        <p style="margin: 4px 0;"><strong>Modalidad:</strong> ${booking.modality}</p>
      </div>
      <p style="font-size: 13px; color: #7C8776;">También hemos enviado una invitación directa a tu Calendario.</p>
    </div>
  `;

  // Correo 2: Para la Nutrióloga (Lic. Valeria de la Torre)
  const nutritionistHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #3D5540; border-radius: 16px; padding: 28px; color: #253B2E;">
      <h2 style="color: #3D5540; margin-top: 0;">🔔 Nueva Reserva Pagada y Agendada</h2>
      <p>Hola <strong>Lic. Valeria</strong>, un paciente ha completado su pago y el sistema ya bloqueó el horario en tu Calendario:</p>
      <ul>
        <li><strong>Folio de Pago:</strong> ${booking.folio} ($${booking.price}.00 MXN - PAGADO)</li>
        <li><strong>Paciente:</strong> ${booking.patientName}</li>
        <li><strong>Correo del Paciente:</strong> ${booking.patientEmail}</li>
        <li><strong>WhatsApp / Teléfono:</strong> ${booking.patientPhone}</li>
        <li><strong>Servicio:</strong> ${booking.serviceName} (${booking.modality})</li>
        <li><strong>Fecha y Horario:</strong> ${booking.dateLabel} a las ${booking.timeLabel}</li>
        <li><strong>Motivo de consulta:</strong> ${booking.notes || 'N/A'}</li>
      </ul>
    </div>
  `;

  await Promise.all([
    mailTransporter.sendMail({
      from: `"Lic. Valeria de la Torre · Nutrición" <${process.env.SMTP_USER}>`,
      to: booking.patientEmail,
      subject: `✅ Confirmación de tu Consulta (${booking.dateLabel}) — Lic. Valeria de la Torre`,
      html: patientHtml
    }),
    mailTransporter.sendMail({
      from: `"Sistema de Reservas Web" <${process.env.SMTP_USER}>`,
      to: NUTRITIONIST_EMAIL,
      subject: `🔔 Nueva Cita Pagada: ${booking.patientName} (${booking.dateLabel} · ${booking.timeLabel})`,
      html: nutritionistHtml
    })
  ]);
}

// 4. Endpoint / Webhook que se ejecuta ÚNICAMENTE cuando el pago es exitoso
app.post('/api/webhook/payment-confirmed', async (req, res) => {
  try {
    const { paymentStatus, booking } = req.body;

    // Regla estricta: si no está pagado, no se agenda ni se envían correos
    if (paymentStatus !== 'paid') {
      return res.status(400).json({
        ok: false,
        message: 'La reserva requiere pago confirmado para agendarse en calendario.'
      });
    }

    const calendarEvent = await createGoogleCalendarEvent(booking);
    await sendConfirmationEmails(booking);

    return res.status(200).json({
      ok: true,
      message: 'Reserva agendada en Google Calendar y correos enviados al cliente y a la nutrióloga.',
      calendarEventId: calendarEvent.id
    });
  } catch (error) {
    console.error('Error al procesar reserva pagada:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de Reservas de Lic. Valeria de la Torre activo en puerto ${PORT}`);
});
