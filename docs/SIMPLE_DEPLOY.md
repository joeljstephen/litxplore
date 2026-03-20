# LitXplore Simple Deployment

Deploy your LitXplore backend in **one command**.

## Prerequisites

- VPS with Ubuntu 20.04+
- Domain `api.litxplore.win` pointing to your VPS IP
- API keys ready (Gemini, OpenAI, Clerk)
- Neon database URL

## One-Command Deployment

1. **Upload files to your VPS:**

```bash
scp -r . your-user@your-vps-ip:~/litxplore/
```

2. **SSH into your VPS and run:**

```bash
ssh your-user@your-vps-ip
cd ~/litxplore
chmod +x deploy.sh
./deploy.sh
```

3. **Done!**

The script will prompt for:

- Your email (for Let's Encrypt SSL certificates)
- Database URL (Neon PostgreSQL connection string)
- OpenAI API key (for embeddings)
- Gemini API key (for analysis and chat)
- Clerk secret key (for authentication)

The script automatically:

- Installs Docker and Docker Compose
- Configures UFW firewall (SSH, 80, 443) and fail2ban
- Creates `.env` with your credentials
- Sets up Traefik with TLS and CORS
- Builds and starts all containers
- Waits 30s and verifies health check

Your API will be live at `https://api.litxplore.win`

## Frontend Setup

Update your Vercel environment variables:

```
NEXT_PUBLIC_API_URL=https://api.litxplore.win
NEXT_PUBLIC_API_BASE_URL=https://api.litxplore.win/api/v1
```

## Management Commands

```bash
# View logs
docker-compose logs -f

# Restart everything
docker-compose restart

# Stop everything
docker-compose down

# Update deployment (manual)
git pull
docker-compose build
docker-compose up -d
```

Note: After initial setup, updates are automatic via GitHub Actions + Watchtower. Manual builds are only needed for local changes.

## Monitoring

- **API Health**: https://api.litxplore.win/health
- **Traefik Dashboard**: http://your-server-ip:8080

## Troubleshooting

```bash
# Check what's running
docker-compose ps

# View all logs
docker-compose logs

# Restart everything
docker-compose restart
```

**Common issues:**

- **502 errors**: Wait a few minutes for services to fully start
- **SSL issues**: Can take 5-10 minutes for Let's Encrypt certificates
- **CORS issues**: Verify frontend domain matches CORS config in Traefik dynamic config
