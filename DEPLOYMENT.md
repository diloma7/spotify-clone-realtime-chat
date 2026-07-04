# Deployment

## Development

Use Docker Compose for the local development stack:

```bash
docker compose up --build
```

This starts:

- `frontend` on `http://localhost:5173`
- `nginx` on `http://localhost:8080`
- `backend` behind nginx
- `redis` for cache and rate limiting

The frontend should use:

```env
VITE_API_URL=http://localhost:8080
```

## Production-Style Local Run

Use the production compose file when you want to test the static frontend image
and production backend image locally:

```bash
docker compose -f docker-compose.prod.yml up --build
```

The production frontend nginx serves the React build and proxies:

- `/api/*` to the backend
- `/socket.io/*` to the backend
- `/health` to the backend health endpoint

For same-origin production hosting, leave `VITE_API_URL` empty at build time.
Set `CLIENT_URLS` to the public frontend origin, for example:

```env
CLIENT_URLS=https://your-domain.com
```

## Production Checklist

- Use production Clerk keys and Cloudinary credentials.
- Store secrets in your host's secret manager, not in committed files.
- Set `NODE_ENV=production`.
- Set `CLIENT_URLS` to the exact public frontend origin.
- Use managed MongoDB and managed Redis for a real deployment.
- Put TLS/HTTPS in front of the public nginx endpoint.
