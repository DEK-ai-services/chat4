# 🚀 LibreChat Deployment na Ubuntu Server

Tento návod vás provede nasazením LibreChat aplikace na Ubuntu server na Digital Ocean.

## 📋 Požadavky

- Ubuntu 20.04 nebo novější
- SSH přístup k serveru
- Minimálně 2GB RAM
- Minimálně 20GB volného místa

## 🎯 Rychlé nasazení

### 1. Připojení k serveru
```bash
ssh root@167.99.133.236
```

### 2. Vytvoření uživatele (doporučeno)
```bash
# Vytvořit nového uživatele
adduser librechat
usermod -aG sudo librechat

# Přepnout na nového uživatele
su - librechat
```

### 3. Klonování repozitáře
```bash
git clone https://github.com/danny-avila/LibreChat.git
cd LibreChat
```

### 4. Spuštění deployment scriptu
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🔧 Manuální nasazení

### 1. Instalace Docker a Docker Compose
```bash
# Aktualizace systému
sudo apt update && sudo apt upgrade -y

# Instalace Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Přidání uživatele do docker skupiny
sudo usermod -aG docker $USER

# Instalace Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Konfigurace firewallu
```bash
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3080/tcp
sudo ufw reload
```

### 3. Konfigurace aplikace
```bash
# Kopírování konfiguračního souboru
cp .env.example .env

# Úprava .env pro produkci
sed -i 's/HOST=localhost/HOST=0.0.0.0/' .env
sed -i 's/DOMAIN_CLIENT=.*/DOMAIN_CLIENT=http:\/\/167.99.133.236:3080/' .env
sed -i 's/DOMAIN_SERVER=.*/DOMAIN_SERVER=http:\/\/167.99.133.236:3080/' .env
sed -i 's/NO_INDEX=true/NO_INDEX=false/' .env
sed -i 's/DEBUG_LOGGING=true/DEBUG_LOGGING=false/' .env
```

### 4. Spuštění aplikace
```bash
# Spuštění s produkční konfigurací
docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d
```

## 🔑 Konfigurace API klíčů

Po nasazení je potřeba nakonfigurovat API klíče v `.env` souboru:

```bash
# Editace .env souboru
nano .env
```

Přidejte své API klíče:
```env
# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic (Claude)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google AI
GOOGLE_API_KEY=your_google_api_key_here

# Další endpointy podle potřeby...
```

## 🌐 Přístup k aplikaci

Po úspěšném nasazení bude aplikace dostupná na:
- **http://167.99.133.236:3080**

## 🔧 Údržba

### Zobrazení logů
```bash
./maintenance.sh logs
```

### Restart aplikace
```bash
./maintenance.sh restart
```

### Aktualizace aplikace
```bash
./maintenance.sh update
```

### Zálohování
```bash
./maintenance.sh backup
```

### Obnovení ze zálohy
```bash
./maintenance.sh restore backup_YYYYMMDD_HHMMSS.tar.gz
```

## 🔒 Bezpečnost

### 1. SSL certifikáty (Let's Encrypt)
```bash
# Instalace Certbot
sudo apt install certbot python3-certbot-nginx

# Získání SSL certifikátu (pokud máte doménu)
sudo certbot --nginx -d your-domain.com
```

### 2. Aktualizace nginx.conf pro SSL
Odkomentujte SSL sekci v `nginx.conf` a upravte cesty k certifikátům.

### 3. Pravidelné zálohování
Nastavte cron job pro automatické zálohování:
```bash
# Přidání do crontab
crontab -e

# Přidat řádek pro denní zálohování
0 2 * * * /opt/librechat/maintenance.sh backup
```

## 📊 Monitoring

### Kontrola stavu služeb
```bash
docker-compose -f docker-compose.yml -f docker-compose.production.yml ps
```

### Kontrola využití zdrojů
```bash
docker stats
```

### Kontrola logů
```bash
# Všechny služby
docker-compose -f docker-compose.yml -f docker-compose.production.yml logs

# Konkrétní služba
docker-compose -f docker-compose.yml -f docker-compose.production.yml logs api
```

## 🚨 Řešení problémů

### Aplikace se nespustí
1. Zkontrolujte logy: `./maintenance.sh logs`
2. Ověřte konfiguraci: `docker-compose -f docker-compose.yml -f docker-compose.production.yml config`
3. Zkontrolujte porty: `sudo netstat -tlnp | grep 3080`

### Problémy s databází
```bash
# Restart MongoDB
docker-compose -f docker-compose.yml -f docker-compose.production.yml restart mongodb

# Kontrola MongoDB logů
docker-compose -f docker-compose.yml -f docker-compose.production.yml logs mongodb
```

### Problémy s MeiliSearch
```bash
# Restart MeiliSearch
docker-compose -f docker-compose.yml -f docker-compose.production.yml restart meilisearch

# Kontrola MeiliSearch logů
docker-compose -f docker-compose.yml -f docker-compose.production.yml logs meilisearch
```

## 📞 Podpora

- **Dokumentace:** https://docs.librechat.ai
- **GitHub Issues:** https://github.com/danny-avila/LibreChat/issues
- **Discord:** https://discord.librechat.ai

## 🔄 Aktualizace

Pro aktualizaci na novou verzi:
```bash
cd /opt/librechat
./maintenance.sh update
```

---

**Poznámka:** Tento návod je určen pro development nasazení. Pro produkční nasazení doporučujeme:
- Nastavit SSL certifikáty
- Konfigurovat doménu
- Nastavit monitoring
- Pravidelné zálohování
- Bezpečnostní audit 