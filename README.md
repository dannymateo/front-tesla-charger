# Tesla Supercharger Frontend

Interfaz web de **Tesla Supercharger** — red de carga rápida en Medellín. Construida con **Next.js 14**, **NextUI**, **Leaflet** y **Socket.IO**, con diseño inspirado en Tesla.com.

## Requisitos

- Node.js 18+
- API Gateway corriendo en `http://localhost:3000` (ver `../api-tesla-charger`)

## Configuración

```bash
cp .env.local.example .env.local
```

Variables importantes:

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL del gateway (`http://localhost:3000`) |
| `NEXT_PUBLIC_WS_URL` | URL WebSocket (`http://localhost:3000`) |
| `JWT_SECRET` | Debe coincidir con el backend |
| `NEXT_PUBLIC_APP_URL` | URL del front (`http://localhost:3001`) |

Actualiza también en el backend `.env`:

```
PAYPAL_RETURN_URL=http://localhost:3001/payment/success
PAYPAL_CANCEL_URL=http://localhost:3001/payment/cancel
```

## Ejecutar

```bash
npm install
npm run dev
```

Abre [http://localhost:3001](http://localhost:3001)

## Cuentas demo

| Email | Rol | Password |
|-------|-----|----------|
| `admin@tesla.local` | Administrador | `Tesla123!` |
| `driver@tesla.local` | Conductor | `Tesla123!` |
| `maria@tesla.local` | Conductor (deuda pendiente) | `Tesla123!` |
| `blocked@tesla.local` | Conductor (bloqueado) | `Tesla123!` |

## Arquitectura

### Seguridad

- JWT almacenado en cookie **httpOnly** (`tesla_token`)
- **Middleware** protege rutas y redirige según rol (`USER` → `/driver/*`, `ADMIN` → `/admin/*`)
- Proxy BFF en `/api/backend/*` inyecta el token hacia el gateway

### Rutas

**Conductor**
- `/driver/map` — Mapa Leaflet + WebSocket en tiempo real
- `/driver/charging/[sessionId]` — Simulación de carga en vivo
- `/driver/billing` — Facturas + pago PayPal
- `/driver/profile` — Perfil y estado de cuenta

**Administrador**
- `/admin/map` — Mapa con estaciones deshabilitadas, ingresos y toggle
- `/admin/stations` — CRUD de estaciones
- `/admin/users` — Usuarios con deuda vencida
- `/admin/dashboard` — Ingresos del día

### WebSocket

Eventos Socket.IO (`path: /ws`):

- `map.join` / `admin.join` — Suscripción al mapa
- `session.join` — Progreso de carga
- `station.state.changed` — Estado de estaciones
- `session.progress.updated` — Progreso de sesión
