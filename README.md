# G-RANK

Plataforma competitiva de esports con sistema de ranking MMR para batallas de Pokemon Showdown.

## Requisitos

- Node.js 18+
- MongoDB (local o MongoDB Atlas)
- Cuenta de Gmail para verificación de emails

## Instalación

```bash
git clone https://github.com/Vega8991/G-RANK.git
cd G-RANK
cd backend && npm install
cd ../frontend && npm install
```

## Configuración

Crea un archivo `.env` en la carpeta `backend`:

```env
MONGO_URI=mongodb://localhost:27017/grank
JWT_SECRET=tu_clave_secreta_jwt
JWT_EXPIRE=7d
PORT=5000
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password-de-gmail
EMAIL_FROM=G-Rank <tu-email@gmail.com>
FRONTEND_URL=http://localhost:5173
```

Para obtener el `EMAIL_PASS`:
1. Activa la autenticación de 2 factores en tu cuenta de Google
2. Ve a Cuenta de Google → Seguridad → Contraseñas de aplicaciones
3. Genera una contraseña para "G-Rank" y úsala en el `.env`

## Ejecución

Desde la raíz del proyecto:

```bash
./start.sh
```

O manualmente:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Sistema de Ranking

| Rango | MMR | Victoria | Derrota |
|-------|-----|----------|---------|
| Bronze | 0-499 | +50 | -25 |
| Silver | 500-999 | +40 | -20 |
| Gold | 1000-1499 | +32 | -18 |
| Platinum | 1500-1999 | +30 | -20 |
| Diamond | 2000-2499 | +25 | -25 |
| Master | 2500-2999 | +20 | -25 |
| Elite | 3000+ | +15 | -30 |

## Stack Tecnológico

**Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt, Nodemailer  
**Frontend**: React 19, Vite, React Router, Tailwind CSS, Axios
