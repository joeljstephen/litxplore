# 🚀 LitXplore Simple Deployment

Deploy your LitXplore backend in **one command**!

## Prerequisites

- VPS with Ubuntu 20.04+
- Domain `api.litxplore.win` pointing to your VPS
- Your API keys ready

## 🎯 One-Command Deployment

1. **Upload files to your VPS:**

```bash
# On your local machine
scp -r . your-user@your-vps-ip:~/litxplore/
```

2. **SSH into your VPS and run:**

```bash
ssh your-user@your-vps-ip
cd ~/litxplore
chmod +x deploy.sh
./deploy.sh
```

3. **Done!** 🎉

The script will ask for:

- Your email (for SSL certificates)
- Database URL
- OpenAI API key
- Gemini API key
- Clerk secret key

That's it! Your API will be live at `https://api.litxplore.win`

## 📱 Frontend Setup

Update your Vercel environment variables:

```
NEXT_PUBLIC_API_URL=https://api.litxplore.win
NEXT_PUBLIC_API_BASE_URL=https://api.litxplore.win/api/v1
```

## 🛠️ Management Commands

```bash
# View logs
docker-compose logs -f

# Restart everything
docker-compose restart

# Stop everything
docker-compose down

# Update deployment
git pull  # if using git
docker-compose build
docker-compose up -d
```

## 🔍 Monitoring

- **API**: https://api.litxplore.win/health
- **Dashboard**: http://your-server-ip:8080

## 🆘 Troubleshooting

**If something goes wrong:**

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
- **SSL issues**: Can take 5-10 minutes for certificates
- **CORS issues**: Check your frontend domain is `litxplore.vercel.app`

That's it! No complex configurations, no multiple files to manage. Just one command and you're deployed! 🚀
