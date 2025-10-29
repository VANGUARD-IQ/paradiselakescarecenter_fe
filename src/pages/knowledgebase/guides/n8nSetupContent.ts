export const n8nSetupContent = `# How to Create and Host an n8n Server with DigitalOcean

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
- **Hostname**: \`n8n-server\`
- **Project**: Create or select existing project
- Click **"Create Droplet"**

## Step 2: Initial Server Setup

### 2.1 Connect to Your Droplet
\`\`\`bash
ssh root@170.64.213.234
# Replace with your droplet's IP address
\`\`\`

### 2.2 Update System
\`\`\`bash
apt update && apt upgrade -y
\`\`\`

### 2.3 Create n8n User
\`\`\`bash
adduser n8n
usermod -aG sudo n8n
su - n8n
\`\`\`

## Step 3: Install n8n with Docker

### 3.1 Create Docker Compose File
\`\`\`bash
mkdir ~/n8n
cd ~/n8n
nano docker-compose.yml
\`\`\`

### 3.2 Docker Compose Configuration
Add the following configuration:

\`\`\`yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=n8n.yourdomain.com
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your-secure-password
      - N8N_ENCRYPTION_KEY=your-encryption-key
      - WEBHOOK_URL=https://n8n.yourdomain.com/
    volumes:
      - ./n8n_data:/home/node/.n8n
      - ./local_files:/files
    networks:
      - n8n-network

networks:
  n8n-network:
    driver: bridge
\`\`\`

### 3.3 Generate Encryption Key
\`\`\`bash
openssl rand -base64 32
# Save this key - you'll need it for the N8N_ENCRYPTION_KEY
\`\`\`

### 3.4 Start n8n
\`\`\`bash
docker-compose up -d
\`\`\`

## Step 4: Configure Nginx Reverse Proxy

### 4.1 Install Nginx
\`\`\`bash
sudo apt install nginx -y
\`\`\`

### 4.2 Create Nginx Configuration
\`\`\`bash
sudo nano /etc/nginx/sites-available/n8n
\`\`\`

Add the following configuration:

\`\`\`nginx
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
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # WebSocket support
        proxy_buffering off;
        proxy_set_header Accept-Encoding gzip;
    }
}
\`\`\`

### 4.3 Enable the Site
\`\`\`bash
sudo ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

## Step 5: Secure with SSL Certificate

### 5.1 Install Certbot
\`\`\`bash
sudo apt install certbot python3-certbot-nginx -y
\`\`\`

### 5.2 Obtain SSL Certificate
\`\`\`bash
sudo certbot --nginx -d n8n.yourdomain.com
\`\`\`

Follow the prompts:
- Enter your email address
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended)

## Step 6: Configure Firewall

### 6.1 Setup UFW Firewall
\`\`\`bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
\`\`\`

## Step 7: Access Your n8n Instance

### 7.1 Navigate to Your Domain
Open your browser and go to:
\`\`\`
https://n8n.yourdomain.com
\`\`\`

### 7.2 Login Credentials
Use the credentials you set in the Docker Compose file:
- **Username**: admin
- **Password**: your-secure-password

## Step 8: Post-Installation Setup

### 8.1 Create Admin Account
On first login, you'll be prompted to create your admin account with:
- Email address
- Password
- First and last name

### 8.2 Configure SMTP (Optional)
For email notifications, configure SMTP in the n8n settings:
1. Go to **Settings** → **Email**
2. Add your SMTP configuration
3. Test the connection

## Advanced Configuration

### Database Setup (Recommended for Production)
For production use, it's recommended to use PostgreSQL instead of SQLite:

\`\`\`yaml
# Add to docker-compose.yml
  postgres:
    image: postgres:13
    container_name: n8n-postgres
    restart: always
    environment:
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=n8n
      - POSTGRES_DB=n8n
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
    networks:
      - n8n-network

# Update n8n service environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=n8n
\`\`\`

### Backup Strategy
Create automated backups:

\`\`\`bash
# Create backup script
nano ~/backup-n8n.sh
\`\`\`

Add:
\`\`\`bash
#!/bin/bash
tar -czf ~/backups/n8n-backup-$(date +%Y%m%d).tar.gz ~/n8n/n8n_data
# Keep only last 7 days of backups
find ~/backups -name "n8n-backup-*.tar.gz" -mtime +7 -delete
\`\`\`

\`\`\`bash
# Make executable and add to cron
chmod +x ~/backup-n8n.sh
crontab -e
# Add: 0 2 * * * /home/n8n/backup-n8n.sh
\`\`\`

## Troubleshooting

### Common Issues

1. **Port 5678 already in use**
   \`\`\`bash
   sudo lsof -i :5678
   # Kill the process or change the port in docker-compose.yml
   \`\`\`

2. **Container not starting**
   \`\`\`bash
   docker-compose logs -f
   # Check for error messages
   \`\`\`

3. **SSL Certificate Issues**
   \`\`\`bash
   sudo certbot renew --dry-run
   # Test certificate renewal
   \`\`\`

## Monitoring

### Check Container Status
\`\`\`bash
docker ps
docker-compose logs -f n8n
\`\`\`

### Monitor Resource Usage
\`\`\`bash
docker stats n8n
htop
\`\`\`

## Maintenance

### Update n8n
\`\`\`bash
cd ~/n8n
docker-compose pull
docker-compose down
docker-compose up -d
\`\`\`

### Renew SSL Certificate
Certbot automatically renews certificates. To manually renew:
\`\`\`bash
sudo certbot renew
\`\`\`

## Security Best Practices

1. **Use Strong Passwords**: Generate secure passwords for all accounts
2. **Enable 2FA**: Configure two-factor authentication in n8n
3. **Regular Updates**: Keep n8n and system packages updated
4. **Firewall Rules**: Only open necessary ports
5. **Backup Regularly**: Automate backups of your workflows and data
6. **Monitor Logs**: Regularly check logs for suspicious activity

## Useful n8n Resources

- [Official Documentation](https://docs.n8n.io/)
- [Community Forum](https://community.n8n.io/)
- [Workflow Templates](https://n8n.io/workflows)
- [Integration List](https://n8n.io/integrations)

## Conclusion

You now have a fully functional n8n automation server running on DigitalOcean! This setup provides:
- ✅ Secure HTTPS access
- ✅ Docker-based deployment for easy updates
- ✅ Nginx reverse proxy
- ✅ SSL certificate with auto-renewal
- ✅ Basic authentication
- ✅ Firewall protection

Start creating workflows to automate your business processes and save hours of manual work!`;