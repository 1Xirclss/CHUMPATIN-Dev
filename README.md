# ⚡ CHUMPATIN XXL · SENIOR SEND-OFF PROMO 2026
### Sistema Integral de Control de Ventas, Liquidación y Entrega de Pulseras en Puerta

Plataforma desarrollada con arquitectura moderna basada en **ProNatural** (Node.js + Express ES Modules, MongoDB Atlas y React + Vite con Tailwind CSS y Recharts).

---

## 🚀 Despliegue en la Nube

### 1. Backend en Render (Web Service)
- **Root Directory:** `Backend`
- **Build Command:** `npm install`
- **Start Command:** `node index.js`
- **Variables de Entorno (Environment Variables):**
  - `DB_URI`: `mongodb://Cris:1234@ac-wp7enmg-shard-00-00.gwcqbvw.mongodb.net:27017,ac-wp7enmg-shard-00-01.gwcqbvw.mongodb.net:27017,ac-wp7enmg-shard-00-02.gwcqbvw.mongodb.net:27017/ChumpatinXXL?ssl=true&replicaSet=atlas-tfx964-shard-0&authSource=admin&appName=BasesDatosCristian`
  - `JWT_SECRET_KEY`: `Marco123`
  - `USER_EMAIL`: `mam270508@gmail.com`
  - `USER_PASSWORD`: `jxvumfclfloqzzgi`
  - `API_KEY_MAILJET`: `tu_api_key_mailjet`
  - `API_SECRET_MAILJET`: `tu_api_secret_mailjet`
  - `MAILJET_FROM_EMAIL`: `mam270508@gmail.com`
  - `FRONTEND_URL`: URL generada por Vercel (ej. `https://chumpatin.vercel.app`)

### 2. Frontend en Vercel
- **Framework Preset:** `Vite`
- **Root Directory:** `Frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Variables de Entorno:**
  - `VITE_API_URL`: URL del backend en Render + `/api` (ej. `https://chumpatin-backend.onrender.com/api`)

---

## 🛠️ Estructura del Proyecto

```text
CHUMPATIN-Dev/
├── Backend/                 # API REST Node.js + Express + Mongoose
│   ├── src/
│   │   ├── controllers/     # Controladores (auth, sales, reports, settings, import)
│   │   ├── middlewares/     # JWT y roles
│   │   ├── models/          # Colecciones MongoDB (attendees, sales, ticket_types, settings, users, wristband_checkins)
│   │   ├── routes/          # Rutas API
│   │   └── utils/           # Servicio dual Mailjet + Nodemailer
│   ├── app.js
│   ├── config.js
│   ├── database.js
│   └── index.js
│
└── Frontend/                # Aplicación Web React + Vite (100% Responsive)
    ├── src/
    │   ├── api/             # Cliente API
    │   ├── components/      # Tablas, Modales, Buscador, Métricas
    │   ├── context/         # AuthContext
    │   ├── pages/           # Dashboard, Ventas, Puerta/Check-in, Ajustes, Login
    │   └── index.css        # Diseño personalizado Dark Mode Club Nocturno
    └── index.html
```

---

## 🔐 Acceso Inicial
- **Usuario Administrador:** `admin@chumpatin.com`
- **Contraseña:** `admin123`
*(O regístrate con tu propio correo desde la pestaña "Registrar Admin" en el login).*
