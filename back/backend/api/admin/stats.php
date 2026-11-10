<?php
// ============================================================
// admin/stats.php — Statistikat e sistemit për administratorin
// E thërret getAdminStats() te adminService.js, për skedën
// "Statistikat" në AdminDashboard.jsx.
// Të gjitha numërimet bëhen KËTU, në databazë, jo në frontend.
// ============================================================

// cors.php        → lejon frontend-in të flasë me këtë API
// db.php          → krijon lidhjen me databazën ($pdo)
// auth_helper.php → sjell funksionin requireAuth
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

// Vetëm administratori (pa token → 401, rol tjetër → 403)
requireAuth($pdo, ['admin']);

// Vetëm lexim, prandaj vetëm GET. Çdo metodë tjetër → 405.
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Metoda nuk lejohet.']);
    exit;
}

// ---------- 1. Shpalljet sipas statusit ----------
// GROUP BY status → një rresht për çdo status, me numrin e shpalljeve.
// FETCH_KEY_PAIR → rezultati bëhet varg "çelës => vlerë":
//   ['pending' => 3, 'approved' => 10, ...]
// query() mjafton, sepse nuk ka të dhëna nga përdoruesi.
$jobStatusCounts = $pdo->query(
    "SELECT status, COUNT(*) AS total FROM job_postings GROUP BY status"
)->fetchAll(PDO::FETCH_KEY_PAIR);

// ---------- 2. Aplikimet sipas statusit ----------
// E njëjta logjikë, për tabelën applications
$appStatusCounts = $pdo->query(
    "SELECT status, COUNT(*) AS total FROM applications GROUP BY status"
)->fetchAll(PDO::FETCH_KEY_PAIR);

// ---------- 3. Totalet ----------
// fetchColumn() → merr vetëm një vlerë (numrin)
// (int) → e kthen në numër, sepse MySQL e kthen si tekst
$totalCandidates = (int) $pdo->query("SELECT COUNT(*) FROM candidates")->fetchColumn();
$totalCompanies = (int) $pdo->query("SELECT COUNT(*) FROM companies")->fetchColumn();
$totalJobs = (int) $pdo->query("SELECT COUNT(*) FROM job_postings")->fetchColumn();
$totalApplications = (int) $pdo->query("SELECT COUNT(*) FROM applications")->fetchColumn();

// ---------- 4. Top 5 departamentet ----------
// Fillon nga job_categories dhe bën LEFT JOIN me shpalljet →
//   edhe departamentet pa asnjë shpallje dalin, me total 0.
// COUNT(jp.id) → numëron vetëm shpalljet reale (jo rreshtat bosh të LEFT JOIN).
// ORDER BY total DESC + LIMIT 5 → 5 departamentet me më shumë shpallje.
$topCategories = $pdo->query(
    "SELECT cat.name, COUNT(jp.id) AS total
     FROM job_categories cat
     LEFT JOIN job_postings jp ON jp.category_id = cat.id
     GROUP BY cat.id, cat.name
     ORDER BY total DESC
     LIMIT 5"
)->fetchAll();

// ---------- 5. Përgjigjja si JSON ----------
// Struktura këtu përputhet saktësisht me atë që lexon AdminDashboard:
//   stats.totals.jobs, stats.jobs_by_status.pending, stats.top_categories...
echo json_encode([
    'totals' => [
        'candidates' => $totalCandidates,
        'companies' => $totalCompanies,
        'jobs' => $totalJobs,
        'applications' => $totalApplications,
    ],
    // ?? 0 → nëse një status nuk ka asnjë shpallje, GROUP BY nuk e kthen fare,
    //   prandaj vendoset 0 që frontend-i të mos marrë "undefined".
    'jobs_by_status' => [
        'pending' => (int) ($jobStatusCounts['pending'] ?? 0),
        'approved' => (int) ($jobStatusCounts['approved'] ?? 0),
        'rejected' => (int) ($jobStatusCounts['rejected'] ?? 0),
        'closed' => (int) ($jobStatusCounts['closed'] ?? 0),
    ],
    'applications_by_status' => [
        'pending' => (int) ($appStatusCounts['pending'] ?? 0),
        'reviewed' => (int) ($appStatusCounts['reviewed'] ?? 0),
        'accepted' => (int) ($appStatusCounts['accepted'] ?? 0),
        'rejected' => (int) ($appStatusCounts['rejected'] ?? 0),
    ],
    // Këtu "total" NUK kthehet me (int), mbetet tekst →
    //   prandaj AdminDashboard përdor parseInt(c.total).
    'top_categories' => $topCategories,
]);