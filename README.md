# Northstar Market — MERN storefront

A full-stack demo storefront with a React/Vite frontend and Express/Mongoose API. Products and accounts live in MongoDB; the cart and wishlist persist in the browser. Checkout is a simulation and does not collect payment details.

## Structure

```text
mern-store/
├── frontend/                 # React + Vite + CSS
│   └── src/{components,context,services}/
├── backend/                 # Express REST API + Mongoose
│   └── src/{middleware,models,routes,scripts}/
├── .gitignore
└── README.md
```

## Run locally

1. Install Node.js 20+ and create a MongoDB Atlas cluster (or use local MongoDB).
2. Copy `backend/.env.example` to `backend/.env`, set `MONGO_URI` and a long random `JWT_SECRET`. Set `CLIENT_URL=http://localhost:5173`.
3. Copy `frontend/.env.example` to `frontend/.env`. The default API URL is `http://localhost:5000/api`.
4. From this folder run `npm install`, `npm install --prefix backend`, `npm install --prefix frontend`, then `npm run dev`.
5. Seed sample products with `npm run seed --prefix backend`. Open http://localhost:5173.

Signup, customer login, admin login, product listing/details, wishlist, cart, and demo checkout are included. The admin dashboard can add and remove catalog products. API health check: `/api/health`.

## Environment variables

### Backend (`backend/.env`)

| Name | Purpose |
| --- | --- |
| `MONGO_URI` | Atlas connection string, including database name |
| `PORT` | API port (Render supplies this automatically) |
| `JWT_SECRET` | Random secret, at least 32 characters |
| `CLIENT_URL` | Exact deployed Vercel origin, e.g. `https://your-shop.vercel.app` |
| `NODE_ENV` | Set `production` on Render |
| `ADMIN_EMAIL` | Email for the private administrator account |
| `ADMIN_PASSWORD` | Unique admin password (at least 12 characters); never commit or share it |
| `ADMIN_NAME` | Optional administrator display name |

When both `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set, the backend provisions that account with the `admin` role during startup. Admin sign-in is at `/admin/login`; the protected product dashboard is at `/admin`. Public signup cannot create admin accounts.

### Frontend (`frontend/.env`)

`VITE_API_URL` is the API base URL including `/api`, for example `https://your-api.onrender.com/api`. Vite variables are public; never put secrets here.

## GitHub

From the `mern-store` folder:

```bash
git init
git add .
git commit -m "Build MERN storefront"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/YOUR_REPOSITORY.git
git push -u origin main
```

Confirm `.env` files are not staged. `.gitignore` excludes them.

## Deploy API to Render

1. Create a **Web Service** from the GitHub repository.
2. Set **Root Directory** to `mern-store/backend` (or `backend` if this folder is the repository root).
3. Build command: `npm install`; Start command: `npm start`.
4. Add `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (the Vercel origin), `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 12 characters), and `NODE_ENV=production`. Render supplies `PORT`.
5. Deploy and verify `https://YOUR-SERVICE.onrender.com/api/health` returns `{ "status": "ok" }`.

Free Render services may sleep when idle; their first request can take a little longer.

## Deploy frontend to Vercel

1. Import the same GitHub repository into Vercel.
2. Set **Root Directory** to `mern-store/frontend` (or `frontend` if this is the repository root).
3. Framework preset: **Vite**. Build command `npm run build`; output directory `dist`.
4. Set `VITE_API_URL=https://YOUR-SERVICE.onrender.com/api` for Production (and Preview if desired), then deploy.
5. Add the exact Vercel production origin to Render's `CLIENT_URL`, then redeploy the API. For preview deployments, add the preview origin when using it.

`frontend/vercel.json` rewrites frontend-side routes to `index.html`.

## MongoDB Atlas network access

In Atlas, create a database user and add the connection string to Render as `MONGO_URI` (URL-encode special characters in the password). In **Security → Network Access → Add IP Address**, prefer Render's current outbound IP ranges or a private connectivity option available for your plan. If those are unavailable, `0.0.0.0/0` permits connections from any IP and is the common Render workaround; pair it with a strong database password and least-privilege database user. Atlas network rules can take a few minutes to apply.

## API overview

- `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me` (Bearer JWT)
- `GET /api/products`, `GET /api/products/:id`, `GET /api/products?category=...&search=...`
- `GET /api/wishlist`, `POST /api/wishlist/:productId`, `DELETE /api/wishlist/:productId` (JWT)
- `POST /api/checkout` (JWT; validates cart items and returns a simulated order confirmation)

Production notes: use HTTPS, rotate secrets, configure Atlas least privilege, and connect a payment provider plus order persistence before accepting real orders. The demo checkout is not a payment system.
