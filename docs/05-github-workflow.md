
````md
# Git/GitHub Workflow (Solo) — EnkiTattoo

Bu repo’da tek kişi çalışıyorum. Hedef: `main` her zaman stabil kalsın, geliştirmeler branch’lerde yapılsın.

## 0) Altın Kurallar
- `main` = her zaman çalışır / stabil.
- Yeni iş = yeni branch.
- Secrets (.env) asla commit edilmez.
- Büyük değişiklikleri küçük commit’lere böl.

## 1) Güne Başlama Rutini (Her seferinde)
```bash
git switch main
git pull --rebase
git status -sb
````

Beklenen çıktı: `## main...origin/main` (başka satır olmamalı)

## 2) Yeni İşe Başlama (Branch Aç)

Branch isim standardı:

* Özellik: `feat/<kisa-isim>`
* Hata düzeltme: `fix/<kisa-isim>`
* Doküman: `docs/<kisa-isim>`
* Refactor: `refactor/<kisa-isim>`

```bash
git switch main
git pull --rebase
git switch -c feat/<kisa-isim>
```

## 3) Çalışırken Commit Atma

Sık ve küçük commit iyidir.

```bash
git add -A
git commit -m "feat: <kisa-aciklama>"
```

Örnek mesajlar:

* `feat: add v1 gallery filters`
* `fix: correct mobile header spacing`
* `docs: add deploy notes`

## 4) Branch’i GitHub’a Gönderme (Push)

```bash
git push -u origin feat/<kisa-isim>
```

## 5) Main’e Alma (Merge) — Solo En Güvenli Yol

### Yöntem A (Terminal, Fast-forward only)

Bu yöntem merge commit oluşturmaz; main’i direkt ileri sarar (en temiz).

```bash
git switch main
git pull --rebase

# ff-only: main ilerlediyse ve fast-forward mümkün değilse merge etmez, hata verir (güvenli)
git merge --ff-only feat/<kisa-isim>

git push
```

### Yöntem B (GitHub PR ile)

İstersen PR açıp ordan merge edebilirsin (daha görsel):

```bash
gh pr create --base main --head feat/<kisa-isim> --fill
gh pr merge --merge --delete-branch
```

## 6) Branch Temizliği (İş Bitince)

Merge sonrası branch’i sil:

```bash
git branch -d feat/<kisa-isim>
git push origin --delete feat/<kisa-isim>
```

## 7) “Yanlışlıkla main’de çalıştım” Kurtarma (Stash’siz)

### Senaryo 1: Henüz push yapmadın

1. Mevcut halinle yeni branch oluştur:

```bash
git switch -c feat/<kurtarma-ismi>
```

2. Main’i geri al:

```bash
git switch main
git reset --hard origin/main
```

3. Devam: işi feat branch’te sürdür.

### Senaryo 2: main’e push yaptın

Bu durumda güvenli yol `revert`:

```bash
git switch main
git pull --rebase
git revert <commit-hash>
git push
```

## 8) Repo Hijyen Checklist

Aşağıdakiler git’e girmemeli:

* `node_modules/`
* `.next/`, `out/`, `dist/`, `build/`
* `.env`, `.env.local` (sadece `.env.example` commit edilir)

Kontrol:

```bash
git ls-files node_modules .next out dist build
git status -sb
```

## 9) Hızlı Kontrol Komutları

```bash
git status -sb
git log --oneline --decorate --graph --max-count=20
git remote -v
```

## 10) “Benim stabil çalışma şeklim” (Özet)

* `main` → pull → temiz kontrol
* `feat/...` branch aç
* küçük commit’ler
* push
* main’e `--ff-only` merge
* branch sil

````

---

## Dokümanı repo’ya ekleme (3 komut)
Sen dosyayı kaydedince şunu çalıştır:

```bash
git add docs/05-github-workflow.md
git commit -m "docs: add solo git workflow"
git push
````

Tamam brom. Hiç yorum yapmadan, **aynı dokümanın devamı** olacak şekilde “2. parça” içeriği aşağıda. Bunu **`docs/05-github-workflow.md` dosyasının en altına** aynen yapıştır.

````md
---

# 11) Stash / Restore / Clean / Reset Politikası (Bu repoda YASAK)

Bu projede **stash** ve **restore** kullanmıyoruz.
Sebep: acemiyken en çok “kaybolan değişiklik / yanlış dosya geri alma / yanlış branch karışması” buradan çıkıyor.

## Yasaklanan komutlar
Aşağıdaki komutları **kullanma**:

- `git stash` / `git stash -u` / `git stash pop`
- `git restore ...`
- `git clean -fd` (çok tehlikeli — geri dönüş yok)
- `git reset --hard` (ancak “acil ve bilinçli” durumda, aşağıdaki kontrol listesiyle)

> Not: Eğer bir yerde bu komutlar önerildiyse, bu repoda geçerli değil.

---

# 12) “Main’de yanlışlıkla çalıştım” — Stash’siz, Restore’suz kurtarma

Amaç: değişiklikleri kaybetmeden doğru branch’e taşımak.

## Senaryo A — Henüz commit atmadın (en kolay)
1) **Şu an neredeysen**, yeni branch aç:
```bash
git switch -c feat/<kurtarma-ismi>
````

2. Devam et, commit’le:

```bash
git add -A
git commit -m "feat: <kisa-aciklama>"
git push -u origin feat/<kurtarma-ismi>
```

3. Sonra main’e dön:

```bash
git switch main
git pull --rebase
```

Bu kadar. Değişiklikler branch’e taşınmış olur.

---

## Senaryo B — Main’de commit attın ama push yapmadın

Bu durumda iki güvenli seçenek var:

### Seçenek 1: Commit’i yeni branch’e taşı (branch oluştur)

```bash
git switch -c feat/<kurtarma-ismi>
```

Bu komut, mevcut commit’lerle birlikte branch’i oluşturur.

Sonra main’i geri al:

```bash
git switch main
git pull --rebase
```

> Eğer main üzerinde fazladan commit görünüyorsa ve henüz push edilmediyse, main’i geri almak için ileride “rebase/reset” gerekebilir; bu noktada tek başına ilerlemiyorsan bile dikkatli ol. En güvenlisi: bu senaryoda main’e dokunma, PR/merge ile ilerle.

---

## Senaryo C — Main’e push yaptın (en güvenli: revert)

Main’e giden bir commit’i geri almak için **revert** kullan:

```bash
git switch main
git pull --rebase
git revert <commit-hash>
git push
```

Bu, geçmişi bozmaz ve güvenlidir.

---

# 13) “Bir dosyayı git’ten çıkaracağım ama diskten silmeyeceğim”

Örnek: yanlışlıkla takip edilen `.env` gibi dosyalar.

```bash
git rm --cached <dosya>
git commit -m "chore: stop tracking <dosya>"
git push
```

---

# 14) .gitignore Yönetimi — Sabit Kurallar

## Repo’da olması gereken:

* `.env.example` (değerler boş)
* `next-env.d.ts` (Next.js types)

## Repo’da olmaması gereken:

* `.env`, `.env.local`
* `node_modules/`
* `.next/`, `out/`, `dist/`, `build/`
* `coverage/`, `.turbo/`, `.vercel/`

Kontrol:

```bash
git ls-files node_modules .next out dist build coverage .turbo .vercel
```

Beklenen: hiçbir şey dönmemeli.

---

# 15) Merge Stratejisi (Solo) — Tek doğru yol

Bu repo’da merge standardı:

* İş branch’te biter
* main’e **fast-forward only** alınır

```bash
git switch main
git pull --rebase
git merge --ff-only feat/<kisa-isim>
git push
```

Eğer `--ff-only` hata verirse:

* main ile branch ayrışmış demektir
* **merge etme**
* çözüm: branch’i main’in üstüne yeniden alıp düzeltmek gerekir (bu noktada dikkatli ilerlenir)

---

# 16) GitHub’da stabilite ayarları (opsiyonel ama önerilir)

GitHub Repo → Settings → Branches → Branch protection rules:

Önerilen kurallar (solo bile olsa iyi):

* “Require a pull request before merging” (isteğe bağlı)
* “Require status checks” (CI varsa)
* “Restrict who can push to matching branches” (main’i kilitler)

Ama şart değil. Solo çalışmada bile main’i yanlışlıkla bozmayı engeller.

---

# 17) Gün Sonu Rutini (Repo’yu stabil bırak)

```bash
git status -sb
git log --oneline --decorate --graph --max-count=10
```

Beklenen:

* Çalışıyorsan: branch’te ol, değişiklikler commitli olsun
* Bittiysen: main’e merge edilmiş, push edilmiş, branch silinmiş olsun

````

İstersen şimdi sıradaki 3 komutu da tek paket vereyim (workflow dosyasını ekleyip pushlamak için):

```bash
git add docs/05-github-workflow.md
git commit -m "docs: add solo git workflow (no stash/restore policy)"
git push
````
