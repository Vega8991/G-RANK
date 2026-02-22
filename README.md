# G-RANK

Competitive esports platform with an MMR ranking system for some games matches

## Requirements

- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Gmail account for email verification

## Installation

```bash
git clone https://github.com/Vega8991/G-RANK.git
cd G-RANK
cd backend && npm install
cd ../frontend && npm install
```

## Configuration

Create a `.env` file inside the `backend` folder:

```env
MONGO_URI=mongodb://localhost:27017/grank
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
PORT=5000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=G-Rank <your-email@gmail.com>
FRONTEND_URL=http://localhost:5173
```

To get `EMAIL_PASS`:
1. Enable 2-factor authentication on your Google account
2. Go to Google Account -> Security -> App passwords
3. Generate an app password for "G-Rank" and use it in `.env`

## Run

From the project root:

```bash
./start.sh
```

Or run manually:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Swagger

API Swagger docs are available in `Doc_G-RANK`.

```bash
cd Doc_G-RANK
npm install
npm start
```

With the server running, open:

- Swagger UI: http://localhost:8080/docs
- API base URL: http://localhost:8080

## Ranking System

| Rank | MMR | Win | Loss |
|------|-----|-----|------|
| Bronze | 0-499 | +50 | -25 |
| Silver | 500-999 | +40 | -20 |
| Gold | 1000-1499 | +32 | -18 |
| Platinum | 1500-1999 | +30 | -20 |
| Diamond | 2000-2499 | +25 | -25 |
| Master | 2500-2999 | +20 | -25 |
| Elite | 3000+ | +15 | -30 |

## Tech Stack

**Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt, Nodemailer  
**Frontend**: React 19, Vite, React Router, Tailwind CSS, Axios
