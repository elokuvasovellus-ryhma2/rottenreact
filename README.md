# Projektin käynnistys & tiimityöohje

## 📦 Esivaatimukset
- [Node.js LTS](https://nodejs.org/) (suositus)
- [Git](https://git-scm.com/)
- (Valinnaisesti) [pnpm](https://pnpm.io/) tai [Yarn](https://yarnpkg.com/)

> Hakemistorakenne:
> ```
> / (repo-juuri)
> ├─ backend/
> │  ├─ .env.example
> └─ frontend/
>    ├─ .env.example
> ```

---

## 🚀 1) Repon kloonaus
```bash
git clone <REPO_URL> your-project
cd your-project
```

## 🔐 2) Ympäristömuuttujat (.env)
Kopioi esimerkkitiedostot .env.example → .env ja täytä arvot.

### UNIX / Git Bash

```bash
# Kopioi koodi
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Windows PowerShell

```powershell
# Kopioi koodi
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```
### 📝 Vinkki:

- Frontend (Vite): kaikki muuttujat on prefiksattava VITE_, esim. VITE_API_URL=http://localhost:4000.
- .gitignore: varmista, että .env-tiedostot ovat gitin ulkopuolella (älä commitoi salaisuuksia).

### Tyypilliset arvot (esimerkkejä):

```env
# Kopioi koodi
# backend/.env
PORT=4000
DATABASE_URL=postgres://user:pass@localhost:5432/app
JWT_SECRET=supersecret

# frontend/.env
VITE_API_URL=http://localhost:4000
```
## 📥 3) Riippuvuuksien asennus

### Backend

```bash
# Kopioi koodi
cd backend
npm install   # tai pnpm install / yarn
```

### Frontend

```bash
# Kopioi koodi
cd ../frontend
npm install   # tai pnpm install / yarn
```
## ▶️ 4) Kehityspalvelinten käynnistys

### Vaihtoehto A: Aja erikseen kahdessa terminaalissa

#### Terminaali 1 — backend

```bash
# Kopioi koodi
cd backend
npm run dev   # esim. http://localhost:4000
```

#### Terminaali 2 — frontend

```bash
# Kopioi koodi
cd frontend
npm run dev   # Vite: http://localhost:5173 (tai 3000 CRA:lla)
```

## 📌 5) GitHub Projects → Scrum Sprint -työskentely

- Projects-välilehti → valitse ajankohtainen Sprint-taulu
- Backlog → valitse issue/kortti, aseta itsesi Assigneeksi ja siirrä In Progress

### Branch tehtävälle (nimeämisesimerkkejä):

```php-template
# Kopioi koodi
feature/<issue-nummero>-lyhyt-kuvaus
fix/<issue-nummero>-bugin-nimi
chore/<issue-nummero>-ylläpito
```

### Komennot:

```bash
# Kopioi koodi
git checkout main
git pull
git checkout -b feature/123-kirjautuminen
```

### Commitoi usein ja viittaa issueen:

```bash
# Kopioi koodi
git add .
git commit -m "feat(login): lisää kirjautumislomake (#123)"
```

### Pushaa vähintään päivittäin:

```bash
# Kopioi koodi
git push -u origin feature/123-kirjautuminen
```

- Avaa PR (draft), linkitä issue ja lisää projektiin
- Päivitä sprinttitaulua päivittäin (In Progress → In Review → Done), lisää kommentit etenemisestä

## 🛠️ 6) Vianetsintä (quick tips)

- Portti varattu? Vaihda .env → PORT, tai käynnistä Vite eri porttiin: `vite --port 5174`.
- API-osoite? Varmista frontend/.env → VITE_API_URL.
- CORS? Lisää backendissä cors() ja salli origin: http://localhost:5173.
- Node-versio? Vite 7 suosii Node ≥ 20.19.0. Tarkista: `node -v`.

## 🎨 7) Tyylikäytännöt (suositus)

- Branchit: tyyppi/numero-kuvaus (esim. feature/123-haku)
- Commit-viestit: Conventional Commits (feat, fix, chore, refactor, docs…)
- PR-kuvaus: Mitä tehty, miten testata, liittyvät issuut/PR:t

## 📝 Pikakomennot

```bash
# Kopioi koodi
# kloonaa
git clone <REPO_URL> && cd <kansio>

# env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# asenna
cd backend && npm i
cd ../frontend && npm i

# käynnistä
# (Terminaali 1)
cd backend && npm run dev
# (Terminaali 2)
cd frontend && npm run dev

# sprintti
git checkout main && git pull
git checkout -b feature/<issue>-<kuvaus>
git add . && git commit -m "feat(...): ..."
git push -u origin feature/<issue>-<kuvaus>  # vähintään päivittäin
```