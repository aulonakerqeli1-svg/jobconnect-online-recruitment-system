<?php
// ============================================================
// admin/companies.php — Lista e kompanive për administratorin
// Përdoret vetëm për të mbushur filtrin "Të gjitha kompanitë"
// te skeda "Kandidatët" në AdminDashboard.jsx,
// përmes getCompaniesForAdmin() te adminService.js.
// ============================================================

// cors.php        → lejon frontend-in të flasë me këtë API
// db.php          → krijon lidhjen me databazën ($pdo)
// auth_helper.php → sjell funksionin requireAuth
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

// Vetëm administratori ka qasje (pa token → 401, rol tjetër → 403)
requireAuth($pdo, ['admin']);

// Vetëm lexim, prandaj lejohet vetëm GET. Çdo metodë tjetër → 405.
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Metoda nuk lejohet.']);
    exit;
}

// Merr vetëm dy kolona: id (vlera e filtrit) dhe company_name (teksti që sheh admini).
// ORDER BY company_name ASC → kompanitë renditen sipas alfabetit (A → Z).
// query() në vend të prepare() → nuk ka asnjë vlerë nga përdoruesi,
//   prandaj nuk ka rrezik SQL injection.
$stmt = $pdo->query("SELECT id, company_name FROM companies ORDER BY company_name ASC");
// Kthen listën si JSON, p.sh. [{"id":1,"company_name":"ABC"}, ...]
echo json_encode($stmt->fetchAll());