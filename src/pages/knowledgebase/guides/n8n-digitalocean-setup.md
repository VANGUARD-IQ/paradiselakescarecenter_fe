# How to Create and Host an n8n Server with DigitalOcean

## Overview
This guide will walk you through setting up your own n8n automation server on DigitalOcean, giving you a powerful self-hosted automation platform for your business workflows.

## What is n8n?
n8n is a powerful workflow automation tool that allows you to connect different services and automate tasks without coding. It's like Zapier or Make, but self-hosted, giving you full control over your data and no monthly automation limits.

## Prerequisites
- DigitalOcean account (get $200 free credit with referral link)
- Basic understanding of server management
- Domain name (optional but recommended)

## Step 1: Create a DigitalOcean Droplet

### 1.1 Login to DigitalOcean
Navigate to [DigitalOcean](https://www.digitalocean.com) and sign in to your account.

### 1.2 Create New Droplet
1. Click **"Create"** → **"Droplets"**
2. Choose your configuration:

### 1.3 Recommended Configuration
Based on the setup shown:
- **Image**: Docker on Ubuntu 22.04 (from Marketplace)
- **Plan**: Basic
- **CPU**: 1 Intel vCPU
- **Memory**: 2 GB RAM (minimum for n8n)
- **Storage**: 70 GB Disk
- **Region**: SYD1 (Sydney) or closest to your location
- **Cost**: ~$24.95/month

### 1.4 Authentication
- Choose **SSH Keys** (recommended) or Password
- Add your SSH key or create a strong password

### 1.5 Finalize
- **Hostname**: `n8n-server`
- **Project**: Create or select existing project
- Click **"Create Droplet"**

## Step 2: Initial Server Setup

### 2.1 Connect to Your Droplet
```bash
ssh root@170.64.213.234
# Replace with your droplet's IP address
```

### 2.2 Update System
```bash
apt update && apt upgrade -y
```

### 2.3 Create Non-Root User (Optional but Recommended)
```bash
adduser n8n
usermod -aG sudo n8n
su - n8n
```

## Step 3: Install n8n with Docker

### 3.1 Create Docker Compose File
```bash
mkdir ~/n8n-docker
cd ~/n8n-docker
nano docker-compose.yml
```

### 3.2 Docker Compose Configuration
```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=yourStrongPassword123!
      - N8N_HOST=n8n.yourdomain.com
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://n8n.yourdomain.com/
      - N8N_ENCRYPTION_KEY=your-encryption-key-here
    volumes:
      - ./n8n_data:/home/node/.n8n
      - ./local_files:/files
    networks:
      - n8n-network

  postgres:
    image: postgres:13
    container_name: n8n-postgres
    restart: always
    environment:
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=n8nPassword123!
      - POSTGRES_DB=n8n
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
    networks:
      - n8n-network

networks:
  n8n-network:
    driver: bridge
```

### 3.3 Update n8n Environment for PostgreSQL
Add these environment variables to the n8n service:
```yaml
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=n8nPassword123!
```

### 3.4 Start n8n
```bash
docker-compose up -d
```

### 3.5 Check Status
```bash
docker-compose ps
docker-compose logs -f n8n
```

## Step 4: Configure Nginx Reverse Proxy (Recommended)

### 4.1 Install Nginx
```bash
apt install nginx -y
```

### 4.2 Create Nginx Configuration
```bash
nano /etc/nginx/sites-available/n8n
```

### 4.3 Nginx Configuration
```nginx
server {
    listen 80;
    server_name n8n.yourdomain.com;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;
        proxy_buffering off;
        proxy_redirect off;
    }
}
```

### 4.4 Enable Site
```bash
ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## Step 5: Secure with SSL Certificate

### 5.1 Install Certbot
```bash
apt install certbot python3-certbot-nginx -y
```

### 5.2 Obtain Certificate
```bash
certbot --nginx -d n8n.yourdomain.com
```

### 5.3 Auto-Renewal
```bash
systemctl enable certbot.timer
```

## Step 6: Configure Firewall

### 6.1 Setup UFW
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

## Step 7: Access n8n

### 7.1 Navigate to Your n8n Instance
- Open browser: `https://n8n.yourdomain.com` or `http://YOUR_IP:5678`
- Login with credentials set in docker-compose.yml

### 7.2 Initial Setup
1. Create your account
2. Complete the setup wizard
3. Start building workflows!

## Step 8: Maintenance & Monitoring

### 8.1 View Logs
```bash
docker-compose logs -f n8n
```

### 8.2 Restart Services
```bash
docker-compose restart
```

### 8.3 Update n8n
```bash
docker-compose pull
docker-compose up -d
```

### 8.4 Backup Data
```bash
# Backup n8n data
tar -czf n8n-backup-$(date +%Y%m%d).tar.gz n8n_data/

# Backup PostgreSQL
docker exec n8n-postgres pg_dump -U n8n n8n > n8n-db-backup-$(date +%Y%m%d).sql
```

## Step 9: Performance Optimization

### 9.1 Increase Swap (for 2GB RAM Droplets)
```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### 9.2 Docker Memory Limits
Add to docker-compose.yml:
```yaml
    deploy:
      resources:
        limits:
          memory: 1.5G
```

## Troubleshooting

### Common Issues

#### 1. Cannot Access n8n
- Check firewall: `ufw status`
- Check Docker: `docker-compose ps`
- Check logs: `docker-compose logs n8n`

#### 2. Memory Issues
- Monitor usage: `htop` or `free -h`
- Consider upgrading droplet
- Add swap space

#### 3. SSL Certificate Issues
- Verify DNS: `nslookup n8n.yourdomain.com`
- Check Nginx: `nginx -t`
- Renew certificate: `certbot renew --dry-run`

## Cost Optimization

### DigitalOcean Pricing (as shown)
- **Current Setup**: $24.95/month
- **Bandwidth**: Included
- **Backups**: +20% of droplet cost (optional)
- **Snapshots**: $0.06 per GB per month

### Cost-Saving Tips
1. Use Reserved IPs (free when assigned)
2. Enable automatic backups for critical data
3. Use DigitalOcean Spaces for workflow backups
4. Monitor resource usage and scale accordingly

## Security Best Practices

1. **Change Default Passwords**: Always use strong, unique passwords
2. **Enable 2FA**: On both DigitalOcean and n8n
3. **Regular Updates**: Keep system and Docker images updated
4. **Firewall Rules**: Only open necessary ports
5. **SSH Keys**: Use SSH keys instead of passwords
6. **Monitoring**: Set up monitoring alerts
7. **Backups**: Regular automated backups

## Advanced Configuration

### Environment Variables
```bash
# Performance
N8N_EXECUTIONS_PROCESS=main
N8N_MAX_EXECUTION_DURATION=1h

# Security
N8N_SECURE_COOKIE=true
N8N_SESSION_DURATION=168h

# Features
N8N_TEMPLATES_ENABLED=true
N8N_COMMUNITY_PACKAGES_ENABLED=true
```

## Useful Resources

### Official Documentation
- [n8n Documentation](https://docs.n8n.io/)
- [DigitalOcean n8n Tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-n8n)

### AI Assistance
- [Claude AI](https://claude.ai) - Get help with specific n8n workflows or troubleshooting
- Ask: "How do I set up n8n webhook triggers?" or "Help me debug my n8n Docker installation"

### Community Resources
- [n8n Community Forum](https://community.n8n.io/)
- [n8n Templates](https://n8n.io/workflows)
- [DigitalOcean Community](https://www.digitalocean.com/community)

## Integration Ideas for Your Business

### Common n8n Workflows
1. **Lead Management**: Capture leads from forms → Add to CRM → Send welcome email
2. **Invoice Automation**: Generate invoice → Send to client → Update accounting system
3. **Social Media**: Schedule posts → Cross-post content → Track engagement
4. **Data Sync**: Sync between databases → Transform data → Generate reports
5. **Alert System**: Monitor services → Send notifications → Create tickets

### Tom Miller Services Integration
- Connect to your billing system
- Automate client onboarding
- Sync with project management
- Automated SMS campaigns via Cellcast
- Email automation via Postmark

## Next Steps

1. ✅ Set up your n8n server
2. 📚 Explore n8n documentation
3. 🔧 Create your first workflow
4. 🔗 Connect your business tools
5. 🚀 Automate repetitive tasks
6. 📊 Monitor and optimize

## Support & Help

### Need Assistance?
1. Check the [troubleshooting section](#troubleshooting)
2. Visit [n8n Community Forum](https://community.n8n.io/)
3. Use [Claude AI](https://claude.ai) for specific questions
4. Contact Tom Miller Services support

---

**Created**: August 2025  
**Author**: Tom Miller Services Knowledge Base  
**Category**: Internal Company Training  
**Difficulty**: Intermediate  
**Time Required**: 1-2 hours  
**Cost**: ~$25/month (DigitalOcean hosting)