# JobConnect — Sistem për Menaxhimin e Rekrutimit dhe Aplikimeve Online

Platformë web që lidh kompanitë (shpallje pune) me kandidatët (aplikime), me miratim
paraprak nga administratori.

## Struktura e projektit

```
jobconnect/
├── database/
│   └── schema.sql              ← krijon DB + tabelat + admin fillestar
├── backend/                    ← PHP + MySQL (REST API), krejt i ndarë nga frontend
│   ├── config/
│   │   ├── db.php              ← lidhja PDO me MySQL
│   │   ├── cors.php            ← lejon kërkesat nga React (localhost:5173)
│   │   ├── auth_helper.php     ← token bearer + requireAuth()
│   │   └── mailer.php          ← dërgimi i emailit të njoftimit
│   ├── uploads/                ← CV-të e ngarkuara
│   └── api/
│       ├── auth/                register.php, login.php
│       ├── jobs/                 index.php (list+create), show.php, manage.php (update/delete), mine.php
│       ├── applications/         index.php (apply+list), update_status.php
│       ├── categories/           index.php
│       ├── candidates/           profile.php
│       ├── companies/            profile.php
│       └── admin/                jobs.php (aprovim), candidates.php (filtrim), companies.php
└── frontend/                   ← React (Vite) + Tailwind + Axios
    └── src/
        ├── api/axios.js
        ├── services/            authService, jobService, candidateService, companyService, adminService
        ├── pages/                Login, Register, JobsList, JobDetails, PostJob,
        │                         CompanyDashboard, CompanyProfile, MyApplications,
        │                         CandidateProfile, AdminDashboard
        └── App.jsx               routing + navbar sipas rolit
```

## Rolet e sistemit

| Rol | Çfarë bën |
|---|---|
| **candidate** (punëkërkues) | Shikon shpallje të aprovuara, plotëson profil (telefon, numër personal, aftësi, eksperiencë), aplikon me CV, sheh statusin e aplikimeve |
| **company** (kompani) | Krijon shpallje (shkon në pritje aprovimi), sheh aplikantët, ndryshon statusin e aplikimeve (pranon/refuzon), menaxhon profilin e vet |
| **admin** | Miraton/refuzon shpalljet e kompanive, filtron shpalljet sipas departamentit, filtron kandidatët/aplikimet sipas departamentit + kompanisë + statusit |

## Rrjedha e plotë

1. Kompania regjistrohet → krijon shpallje → statusi fillon `pending`
2. Admini hap panelin e vet → filtron sipas departamentit → **Aprovon** ose **Refuzon**
3. Vetëm shpalljet `approved` shfaqen te lista publike e kandidatëve
4. Kandidati regjistrohet → plotëson profilin → aplikon për shpallje `approved`
5. Kompania sheh aplikantët te "Paneli Im" → ndryshon statusin (`pranuar`/`refuzuar`)
6. Sapo statusi bëhet përfundimtar, backend-i i dërgon kandidatit **email automatik**

## Instalimi

### 1. Databaza
Importo `database/schema.sql` në phpMyAdmin (ose `mysql -u root -p < schema.sql`).
Krijon edhe një **admin fillestar**: `admin@jobconnect.com` / `admin123`.

### 2. Backend (XAMPP)
Kopjo folderin `backend/` në `C:\xampp\htdocs\jobconnect\backend`. Nis Apache + MySQL.
Kontrollo `backend/config/db.php` nëse ke user/password tjetër për MySQL.

### 3. Frontend
```powershell
npm create vite@latest jobconnect-frontend -- --template react
cd jobconnect-frontend
npm install
npm install axios react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
Kopjo përmbajtjen e `frontend/src/` mbi `src/` të projektit Vite. Kontrollo
`baseURL` te `src/api/axios.js` nëse folderi yt në `htdocs` ka emër tjetër.
```powershell
npm run dev
```

### 4. Email (opsionale për zhvillim)
`mailer.php` përdor `mail()` e PHP-së, e cila në XAMPP/Windows zakonisht s'dërgon
email realë pa konfigurim SMTP shtesë. Për testim gjatë zhvillimit, kontrollo
`error_log` — funksioni thirret dhe regjistrohet edhe nëse email-i s'shkon fizikisht.
Për email real, zëvendëso me PHPMailer + SMTP (Gmail, Mailtrap, etj.).

## Dokumentimi i API-t (REST)

Të gjitha endpoint-et kthejnë JSON. Endpoint-et e mbrojtura kërkojnë header:
`Authorization: Bearer <token>`

| Metoda | Endpoint | Roli | Përshkrimi |
|---|---|---|---|
| POST | `/auth/register.php` | — | Regjistrim (candidate/company) |
| POST | `/auth/login.php` | — | Kyçje, kthen token |
| GET | `/jobs/index.php` | — | Shpalljet e aprovuara (kërkim/filtër/paginim) |
| GET | `/jobs/show.php?id=` | — | Detajet e një shpalljeje |
| POST | `/jobs/index.php` | company | Krijon shpallje (→ `pending`) |
| PUT/DELETE | `/jobs/manage.php?id=` | company | Përditëson/fshin shpalljen e vet |
| GET | `/jobs/mine.php` | company | Shpalljet e veta (të gjitha statuset) |
| GET | `/categories/index.php` | — | Lista e departamenteve |
| GET/PUT | `/candidates/profile.php` | candidate | Profili i vet (telefon, nr. personal, aftësi...) |
| GET/PUT | `/companies/profile.php` | company | Profili i kompanisë |
| POST | `/applications/index.php` | candidate | Apliko (multipart, me CV) |
| GET | `/applications/index.php` | candidate/company | Aplikimet e veta / aplikantët për një shpallje (`?job_id=`) |
| PUT | `/applications/update_status.php?id=` | company | Ndryshon statusin + dërgon email |
| GET | `/admin/jobs.php` | admin | Shpalljet, filtrim `?status=&category_id=` |
| PUT | `/admin/jobs.php?id=` | admin | Aprovon/Refuzon shpalljen |
| GET | `/admin/candidates.php` | admin | Aplikimet, filtrim `?category_id=&company_id=&status=` |
| GET | `/admin/companies.php` | admin | Lista e kompanive (për dropdown filtri) |

## Siguria (për kapitullin metodologjik)

- Fjalëkalimet: `password_hash()` / `password_verify()` (bcrypt)
- Autentifikimi: token bearer i rastësishëm (64 shifra), i ruajtur në `auth_tokens`, skadon pas 7 ditësh
- Autorizimi me role: `requireAuth($pdo, ['company'])` kontrollohet **në backend** te çdo endpoint i ndjeshëm — jo vetëm në frontend
- SQL: gjithçka me **prepared statements** (PDO), asnjë query e ndërtuar me concatenation direkte të input-it
- CORS i kufizuar vetëm te `localhost:5173`
- Vërtetim CV: lloji i skedarit (PDF/Word) dhe madhësia (max 5MB)

## Zgjerime të mundshme

- Enkriptim shtesë për `personal_number` (të dhënë e ndjeshme)
- PHPMailer + SMTP për email real
- Paginim edhe te paneli i admin-it/kompanisë
- Ngarkim logo kompanie / foto profili
