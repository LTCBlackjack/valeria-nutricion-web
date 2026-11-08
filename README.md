# Sitio Web & Sistema de Reservas con Pago — Lic. Valeria de la Torre
**Nutrición Hormonal Femenina** · *Equilibrio · Bienestar · Energía*  
**Desarrollado por:** LeonardLance

---

## 1. Arquitectura del Proyecto (Neubox + Mercado Pago)

* **Alojamiento Web (Hosting):** **Neubox** (cPanel con PHP 8+, MySQL y Correo Corporativo con AutoSSL `HTTPS`).
* **Pasarela de Pagos:** **Mercado Pago (Checkout Pro)** de Mercado Libre.
* **Regla Principal de Negocio:**  
  El horario elegido por el paciente **únicamente se bloquea en el calendario y envía los correos de confirmación (al paciente y a la nutrióloga) cuando Mercado Pago notifica que el pago fue aprobado (`approved`)**.

---

## 2. Estructura de Carpetas del Repositorio

```text
valeria-nutricion/
├── index.html                        # Vista Pública del Paciente (Landing Page + Calendario + Pago)
├── nutriologa-panel.html             # Vista Exclusiva de la Nutrióloga (Dashboard de Citas y Horarios)
├── guia-de-estilos.html              # Manual de Identidad Digital y Paleta de Colores
├── propuesta-requerimientos-cliente.html # Propuesta Técnica y Cronograma (2 Meses)
├── css/
│   └── theme.css                     # Variables CSS de la paleta oficial y componentes
├── js/
│   └── app.js                        # Motor de calendario, animaciones únicas y sincronización
├── api/                              # Backend nativo en PHP para cPanel de Neubox
│   ├── config.example.php            # Plantilla de conexión a MySQL, Mercado Pago y Correos
│   ├── crear-preferencia-mp.php      # Genera link de cobro en Mercado Pago Checkout Pro
│   └── webhook-mercadopago.php       # Recibe pago aprobado -> bloquea agenda -> envía 2 correos
├── database/
│   └── schema.sql                    # Tablas MySQL (`reservas` y `horarios_bloqueados`) para phpMyAdmin
└── assets/
    ├── logo/                         # Logotipos vectorizados (.SVG) y alta resolución (.PNG)
    └── vistas/                       # Capturas de las 5 vistas del sistema
```

---

## 3. Guía Rápida para Subir a Neubox (cPanel)

1. Entra al **cPanel de Neubox** -> **Bases de Datos MySQL** y crea una base de datos y su usuario.
2. Abre **phpMyAdmin** en cPanel e importa el archivo [`database/schema.sql`](database/schema.sql).
3. En la carpeta `api/`, duplica `config.example.php` como **`config.local.php`** y coloca tus datos de MySQL y tu **Access Token de Mercado Pago**.
4. Sube los archivos a la carpeta **`public_html`** de tu cPanel (o conéctalo mediante **Git Version Control** de cPanel desde tu repositorio de GitHub).
