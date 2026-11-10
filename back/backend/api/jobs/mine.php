<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

// GET /api/jobs/mine.php
// Kthen shpalljet e kompanisë së kyçur (open + closed), me numrin e aplikimeve për secilën
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Metoda nuk lejohet.']);
    exit;
}

$user = requireAuth($pdo, ['company']);

$companyStmt = $pdo->prepare("SELECT id FROM companies WHERE user_id = ?");
$companyStmt->execute([$user['id']]);
$company = $companyStmt->fetch();

$stmt = $pdo->prepare(
    "SELECT jp.id, jp.title, jp.location, jp.employment_type, jp.status, jp.admin_note, jp.deadline, jp.created_at,
            (SELECT COUNT(*) FROM applications a WHERE a.job_id = jp.id) AS applicants_count
     FROM job_postings jp
     WHERE jp.company_id = ?
     ORDER BY jp.created_at DESC"
);
$stmt->execute([$company['id']]);

echo json_encode($stmt->fetchAll());
