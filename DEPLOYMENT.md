# Deployment Guide

## Environment Configuration

This project uses environment variables to configure the backend API URL for different environments (development, staging, production).

### Setup for Different Environments

#### 1. Development (Local)
The default `.env` file is already configured for local development:
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_ENV=development
```

#### 2. Staging
Create a `.env.staging` file:
```env
VITE_API_URL=https://api-staging.yourdomain.com/api
VITE_APP_ENV=staging
```

#### 3. Production
Create a `.env.production` file:
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_ENV=production
```

## Building for Production

### Build with Production Environment
```bash
# Build using .env.production
npm run build

# Or explicitly specify mode
npm run build --mode production
```

### Build for Staging
```bash
npm run build --mode staging
```

### Build Output
The built files will be in the `dist/` directory, ready to be deployed to your web server.

## Deployment Steps

### 1. Configure Environment
Before building, make sure your `.env.production` file has the correct backend URL:
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_ENV=production
```

### 2. Build the Application
```bash
npm run build
```

### 3. Deploy to Web Server

#### Option A: Apache/Nginx
1. Copy the contents of `dist/` directory to your web server
2. Configure your web server to serve the `index.html` for all routes (SPA configuration)

**Nginx Configuration Example:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/workflow-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Apache Configuration Example (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### Option B: Static Hosting (Netlify, Vercel, etc.)
1. Connect your Git repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in the hosting platform:
   - `VITE_API_URL=https://api.yourdomain.com/api`
   - `VITE_APP_ENV=production`

## Environment Variables

### Available Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL (including /api) | http://localhost:8000/api |
| `VITE_APP_ENV` | Application environment | development |

### Important Notes

- All environment variables must be prefixed with `VITE_` to be exposed to the frontend
- Environment variables are embedded at **build time**, not runtime
- Changes to `.env` files require rebuilding the application
- Never commit `.env` files with production credentials to Git (use `.env.example` as template)

## Testing the Build Locally

You can test the production build locally before deploying:

```bash
# Build the app
npm run build

# Preview the build
npm run preview
```

This will start a local server serving the production build.

## Troubleshooting

### API URLs not updating
- Make sure you've rebuilt the application after changing environment variables
- Check that your `.env.production` file is in the root directory
- Verify variable names start with `VITE_`

### CORS Errors in Production
- Make sure your Laravel backend allows requests from your production domain
- Update `config/cors.php` in the Laravel project
- Add your production frontend URL to allowed origins

## Backend Configuration

Don't forget to configure the Laravel backend for production:

1. Update `.env` on the backend server
2. Set correct `APP_URL`
3. Configure CORS to allow your frontend domain
4. Set up SSL certificates (recommended for production)

Example Laravel CORS configuration:
```php
// config/cors.php
'allowed_origins' => [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
],
```

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Configure proper CORS settings
- [ ] Set secure environment variables
- [ ] Enable rate limiting on backend
- [ ] Configure proper CSP headers
- [ ] Regular security updates

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_APP_ENV: production
      - name: Deploy to server
        # Add your deployment script here
```

## Support

For issues related to deployment, check:
- Vite documentation: https://vitejs.dev/guide/env-and-mode.html
- Laravel deployment guide: https://laravel.com/docs/deployment
