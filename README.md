# 🎯 Reto Diario

> Convierte tus actividades en puntos, tus puntos en recompensas y tus metas en logros compartidos.

PWA gamificada de calendario personal. Gestiona actividades diarias, acumula puntos al completarlas y canjéalos por recompensas personalizadas.

---

## Estructura del proyecto

```
CambioReal/
├── backend/              # API Node.js + Express + MySQL
│   ├── src/
│   │   ├── config/       # Conexión a DB y variables de entorno
│   │   ├── controllers/  # Lógica de cada módulo
│   │   ├── middleware/   # JWT auth
│   │   └── routes/       # Rutas Express
│   ├── .env.example
│   └── package.json
├── frontend/             # PWA instalable (HTML + CSS + JS puro)
│   ├── css/
│   ├── js/
│   ├── assets/icons/
│   ├── index.html
│   ├── manifest.json
│   └── sw.js             # Service Worker
└── database/
    └── schema.sql        # Esquema MySQL completo
```

---

## Requisitos previos

- Node.js 18+
- MySQL 8+ (o MariaDB 10.6+)
- XAMPP / cualquier servidor web estático para el frontend

---

## Configuración inicial

### 1. Base de datos

```bash
# En tu cliente MySQL o phpMyAdmin, importa:
database/schema.sql
```

Esto crea la base de datos `reto_diario` y todas las tablas.

### 2. Backend

```bash
cd backend

# Copia el archivo de entorno
copy .env.example .env
# Edita .env con tus credenciales MySQL y un JWT_SECRET seguro

# Instala dependencias
npm install

# Inicia en modo desarrollo (hot-reload)
npm run dev
```

El servidor estará disponible en `http://localhost:4000`.

### 3. Frontend

Abre `frontend/index.html` con cualquier servidor estático.

Con XAMPP: coloca el proyecto en `htdocs/CambioReal/` y visita `http://localhost/CambioReal/frontend/`.

Para producción, puedes servir `frontend/` con nginx/Apache apuntando la raíz a esa carpeta.

---

## API Endpoints (V1)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Crear cuenta |
| POST | `/api/auth/login` | — | Iniciar sesión |
| GET | `/api/activities?from=&to=` | ✅ | Listar actividades |
| POST | `/api/activities` | ✅ | Crear actividad |
| PATCH | `/api/activities/:id/complete` | ✅ | Marcar como completada |
| PUT | `/api/activities/:id` | ✅ | Editar actividad |
| DELETE | `/api/activities/:id` | ✅ | Eliminar actividad |
| GET | `/api/points/balance` | ✅ | Consultar puntos |
| GET | `/api/points/history` | ✅ | Historial de puntos |
| GET | `/api/rewards` | ✅ | Listar recompensas |
| POST | `/api/rewards` | ✅ | Crear recompensa |
| POST | `/api/rewards/:id/redeem` | ✅ | Canjear recompensa |
| DELETE | `/api/rewards/:id` | ✅ | Desactivar recompensa |
| GET | `/api/profile` | ✅ | Perfil + puntos + racha |
| GET | `/api/health` | — | Estado del servidor |

---

## Reglas de negocio

| Regla | Detalle |
|-------|---------|
| Puntos por dificultad | Fácil 5 · Normal 10 · Importante 20 · Difícil 50 |
| Estados de actividad | pending · completed · expired · cancelled |
| Sin doble completado | Una actividad no puede completarse dos veces |
| Canje con balance suficiente | Solo si `balance >= points_required` |

---

## Roadmap

### V1 (actual) — Personal
- [x] Registro e inicio de sesión
- [x] Crear y completar actividades
- [x] Calendario personal
- [x] Sistema de puntos
- [x] Recompensas personales
- [x] Perfil y racha
- [x] PWA instalable

### V2 — Equipos
- [ ] Crear equipos y agregar integrantes
- [ ] Actividades compartidas
- [ ] Puntos grupales
- [ ] Metas de equipo
- [ ] Ranking entre integrantes

### V3 — Social
- [ ] Comentarios en actividades
- [ ] Logros y medallas
- [ ] Estadísticas avanzadas
- [ ] Invitaciones por WhatsApp
- [ ] Sincronización Google Calendar

---

## Instalar como PWA

1. Abre la app en Chrome (móvil o escritorio).
2. Menú → **"Agregar a pantalla de inicio"** (Android) o **"Instalar aplicación"** (Chrome).
3. La app aparece en tu pantalla de inicio y funciona sin Play Store ni App Store.
