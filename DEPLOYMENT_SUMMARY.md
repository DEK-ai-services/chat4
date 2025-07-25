# 🚀 LibreChat - Nasazení na Ubuntu Server (167.99.133.236)

## 📋 Přehled

Připravil jsem kompletní konfiguraci pro nasazení LibreChat aplikace na váš Ubuntu server na Digital Ocean.

## 🎯 Možnosti nasazení

### 1. **Rychlé nasazení (Doporučeno)**
```bash
# Na serveru
git clone https://github.com/danny-avila/LibreChat.git
cd LibreChat
chmod +x quick-deploy.sh
./quick-deploy.sh
```

### 2. **Kompletní nasazení s Nginx**
```bash
# Na serveru
git clone https://github.com/danny-avila/LibreChat.git
cd LibreChat
chmod +x deploy.sh
./deploy.sh
```

### 3. **Manuální nasazení**
Postupujte podle `README_DEPLOYMENT.md`

## 📁 Vytvořené soubory

- `docker-compose.production.yml` - Produkční konfigurace s Nginx
- `docker-compose.simple.yml` - Zjednodušená konfigurace bez Nginx
- `nginx.conf` - Nginx konfigurace pro reverse proxy
- `deploy.sh` - Kompletní deployment script
- `quick-deploy.sh` - Rychlý deployment script
- `README_DEPLOYMENT.md` - Detailní návod
- `DEPLOYMENT_SUMMARY.md` - Tento soubor

## 🌐 Přístup k aplikaci

Po úspěšném nasazení bude aplikace dostupná na:
- **http://167.99.133.236:3080**

## 🔧 Konfigurace po nasazení

### 1. Nastavení API klíčů
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
```

### 2. Restart aplikace po přidání API klíčů
```bash
# Pro rychlé nasazení
docker-compose -f docker-compose.yml -f docker-compose.simple.yml restart

# Pro kompletní nasazení
docker-compose -f docker-compose.yml -f docker-compose.production.yml restart
```

## 📊 Monitoring a údržba

### Kontrola stavu
```bash
# Stav služeb
docker-compose -f docker-compose.yml -f docker-compose.simple.yml ps

# Logy
docker-compose -f docker-compose.yml -f docker-compose.simple.yml logs -f

# Využití zdrojů
docker stats
```

### Údržba
```bash
# Restart
docker-compose -f docker-compose.yml -f docker-compose.simple.yml restart

# Aktualizace
docker-compose -f docker-compose.yml -f docker-compose.simple.yml pull
docker-compose -f docker-compose.yml -f docker-compose.simple.yml up -d

# Zastavení
docker-compose -f docker-compose.yml -f docker-compose.simple.yml down
```

## 🔒 Bezpečnost

### Firewall
- SSH (port 22) - povoleno
- HTTP (port 80) - povoleno (pouze s Nginx)
- HTTPS (port 443) - povoleno (pouze s Nginx)
- LibreChat (port 3080) - povoleno

### Doporučení pro produkci
1. **SSL certifikáty** - Nastavte Let's Encrypt
2. **Doména** - Konfigurujte vlastní doménu
3. **Monitoring** - Nastavte monitoring služeb
4. **Zálohování** - Pravidelné zálohování dat
5. **Aktualizace** - Pravidelné aktualizace systému

## 🚨 Řešení problémů

### Aplikace se nespustí
```bash
# Kontrola logů
docker-compose -f docker-compose.yml -f docker-compose.simple.yml logs

# Kontrola portů
sudo netstat -tlnp | grep 3080

# Restart všech služeb
docker-compose -f docker-compose.yml -f docker-compose.simple.yml down
docker-compose -f docker-compose.yml -f docker-compose.simple.yml up -d
```

### Problémy s databází
```bash
# Restart MongoDB
docker-compose -f docker-compose.yml -f docker-compose.simple.yml restart mongodb

# Kontrola MongoDB logů
docker-compose -f docker-compose.yml -f docker-compose.simple.yml logs mongodb
```

### Problémy s MeiliSearch
```bash
# Restart MeiliSearch
docker-compose -f docker-compose.yml -f docker-compose.simple.yml restart meilisearch

# Kontrola MeiliSearch logů
docker-compose -f docker-compose.yml -f docker-compose.simple.yml logs meilisearch
```

## 📞 Podpora

- **Dokumentace:** https://docs.librechat.ai
- **GitHub Issues:** https://github.com/danny-avila/LibreChat/issues
- **Discord:** https://discord.librechat.ai

## 🎉 Shrnutí

✅ **Připraveno pro nasazení:**
- Kompletní Docker konfigurace
- Automatické deployment scripty
- Nginx reverse proxy (volitelně)
- Firewall konfigurace
- Monitoring a údržba

🚀 **Další kroky:**
1. Spusťte `quick-deploy.sh` na serveru
2. Nakonfigurujte API klíče v `.env`
3. Restartujte aplikaci
4. Otestujte na http://167.99.133.236:3080

---

**Poznámka:** Tato konfigurace je optimalizována pro development nasazení. Pro produkční nasazení doporučuji přidat SSL certifikáty a doménu. 