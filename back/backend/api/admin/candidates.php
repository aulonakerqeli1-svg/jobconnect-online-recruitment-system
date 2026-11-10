<?php
// ============================================================
// admin/candidates.php — Lista e aplikimeve për administratorin
// E thërret AdminDashboard.jsx te skeda "Kandidatët",
// përmes getCandidatesForAdmin() te adminService.js.
// ============================================================

// cors.php       → lejon frontend-in (localhost:5173) të flasë me këtë API
// db.php         → krijon lidhjen me databazën ($pdo)
// auth_helper.php → sjell funksionin requireAuth
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

// Vetëm administratori ka qasje.
// Pa token kthen 401; me token kandidati ose kompanie kthen 403.
requireAuth($pdo, ['admin']);

// ============================================
// GET /api/admin/candidates.php?category_id=&company_id=&status=
// Sheh të gjithë kandidatët që kanë aplikuar, filtruar sipas
// departamentit (kategorisë së punës), kompanisë, dhe/ose statusit të aplikimit
// ============================================

// Ky endpoint vetëm lexon të dhëna, prandaj lejohet vetëm GET.
// Çdo metodë tjetër (POST, PUT, DELETE) merr 405 "Metoda nuk lejohet".
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Metoda nuk lejohet.']);
    exit;
}

// Lexon filtrat nga adresa (?category_id=3&company_id=1&status=pending).
// ?? '' → nëse filtri nuk dërgohet, merr tekst bosh (pra "pa filtër").
$categoryId = $_GET['category_id'] ?? '';
$companyId = $_GET['company_id'] ?? '';
$status = $_GET['status'] ?? '';

// Ndërtimi dinamik i kushteve WHERE.
// '1=1' është gjithmonë i vërtetë: shërben si pikënisje, që të mund të
// shtohen kushtet e tjera me AND pa u shqetësuar cili është i pari.
$where = ['1=1'];
$params = []; // vlerat që zëvendësojnë ? (prepared statement)

// Çdo filtër shtohet VETËM nëse është zgjedhur.
// Vlera nuk futet direkt në SQL, por si ? te $params → mbrojtje nga SQL injection.
if ($categoryId !== '') {
    $where[] = 'jp.category_id = ?';   // departamenti i shpalljes
    $params[] = $categoryId;
}
if ($companyId !== '') {
    $where[] = 'jp.company_id = ?';    // kompania që e ka publikuar shpalljen
    $params[] = $companyId;
}
if ($status !== '') {
    $where[] = 'a.status = ?';         // statusi i aplikimit (pending, accepted...)
    $params[] = $status;
}

// Pyetja kryesore: bashkon 6 tabela që për çdo aplikim të dalin
// kandidati, pozita, kompania dhe departamenti në një rresht.
//   a   = applications   → aplikimi (id, statusi, data)
//   cd  = candidates     → profili i kandidatit (telefoni, headline)
//   u   = users          → emri dhe email-i i kandidatit
//   jp  = job_postings   → shpallja ku aplikoi
//   c   = companies      → kompania e shpalljes
//   cat = job_categories → departamenti
// LEFT JOIN te kategoritë → shpallja shfaqet edhe nëse s'ka kategori
//   (category_name del null, dhe frontend-i shfaq "—").
// implode(' AND ', $where) → bashkon kushtet, p.sh.
//   "1=1 AND jp.category_id = ? AND a.status = ?"
// ORDER BY applied_at DESC → aplikimet më të reja dalin të parat.
$sql = "SELECT a.id AS application_id, a.status, a.applied_at,
               u.full_name, u.email, cd.phone, cd.headline,
               jp.title AS job_title, c.company_name, cat.name AS category_name
        FROM applications a
        JOIN candidates cd ON cd.id = a.candidate_id
        JOIN users u ON u.id = cd.user_id
        JOIN job_postings jp ON jp.id = a.job_id
        JOIN companies c ON c.id = jp.company_id
        LEFT JOIN job_categories cat ON cat.id = jp.category_id
        WHERE " . implode(' AND ', $where) . "
        ORDER BY a.applied_at DESC";

// prepare + execute → vlerat e $params zënë vendin e ?-ve në mënyrë të sigurt
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
// Kthen listën si JSON te frontend-i
echo json_encode($stmt->fetchAll());