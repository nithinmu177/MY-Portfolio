# Nithin Portfolio

This project is a React + Vite frontend with a custom Node/Express backend for the contact form.

## Features

- Single-page portfolio built with React
- Express API for contact submissions
- Server-side validation with `zod`
- JSON file storage for saved submissions
- SMTP email notifications with `nodemailer`

## Run locally

1. Copy `.env.example` to `.env` in the frontend folder if you want to override the backend URL
2. Start the backend from `..\backend`
3. Start the frontend:

```bash
npm run dev
```

Frontend: `http://localhost:5173`
Backend base URL: `http://localhost:3001`

## Production

Build the frontend:

```bash
npm run build
```

Start the Express server:

```bash
npm start
```

The Express server in `../backend` will serve the built frontend from `dist/` when it exists.

If the frontend and backend are deployed together, leave `VITE_API_BASE_URL` empty so requests use the same domain.

For GitHub Pages, set `VITE_API_BASE_URL` to your deployed backend URL and use the workflow in `../.github/workflows/deploy-pages.yml`.
