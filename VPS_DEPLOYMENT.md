# Deploy VPS

## Server requirements

- Node.js 20+
- npm
- Nginx
- Certbot
- PostgreSQL connection string, either Supabase Postgres or a VPS-hosted Postgres
- Cloudflare R2 bucket with a public custom domain, for example `https://images.example.com`

## Environment

Create a production `.env` from `.env.example` and set real values for:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_URL`
- `VNPAY_RETURN_URL`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL`

Keep Supabase credentials only if another part of the project still needs them. Existing image URLs that point to `*.supabase.co` do not need Supabase keys to render, but the old Supabase bucket must stay public and the files must not be deleted.

## Build and start

```bash
npm ci
npx prisma migrate deploy
npm run build
npm run start
```

For a persistent process, use PM2:

```bash
npm install -g pm2
pm2 start npm --name xdaily -- start
pm2 save
pm2 startup
```

Or systemd:

```ini
[Unit]
Description=XDaily Next.js app
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/xdaily
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## Nginx

```nginx
server {
    server_name example.com www.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable HTTPS:

```bash
certbot --nginx -d example.com -d www.example.com
```

## R2 checklist

- R2 bucket exists and matches `R2_BUCKET_NAME`.
- R2 API token/access key can write to the bucket.
- `R2_PUBLIC_BASE_URL` points to the public custom domain.
- The same domain is allowed in Cloudflare DNS and in the app image allowlist if that allowlist has any rows.
- `*.supabase.co` remains allowed while old images are still stored in Supabase.
