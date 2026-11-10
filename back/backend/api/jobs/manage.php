<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

$user = requireAuth($pdo, ['company']);
$method = $_SERVER['REQUEST_METHOD'];

$companyStmt = $pdo->prepare("SELECT id FROM companies WHERE user_id = ?");
$companyStmt->execute([$user['id']]);
$company = $companyStmt->fetch();

function getOwnedJob($pdo, $jobId, $companyId) {
    $stmt = $pdo->prepare("SELECT * FROM job_postings WHERE id = ? AND company_id = ?");
    $stmt->execute([$jobId, $companyId]);
    return $stmt->fetch();
}

// ============================================
// PUT /api/jobs/manage.php?id=5
// ============================================
if ($method === 'PUT') {
    $id = $_GET['id'] ?? null;
    $job = $id ? getOwnedJob($pdo, $id, $company['id']) : null;

    if (!$job) {
        http_response_code(404);
        echo json_encode(['error' => 'Shpallja nuk u gjet ose nuk të përket.']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);

    $stmt = $pdo->prepare(
        "UPDATE job_postings SET
            title = ?, description = ?, requirements = ?, location = ?,
            employment_type = ?, salary_min = ?, salary_max = ?, deadline = ?, status = ?
         WHERE id = ?"
    );
    $stmt->execute([
        $data['title'] ?? $job['title'],
        $data['description'] ?? $job['description'],
        $data['requirements'] ?? $job['requirements'],
        $data['location'] ?? $job['location'],
        $data['employment_type'] ?? $job['employment_type'],
        $data['salary_min'] ?? $job['salary_min'],
        $data['salary_max'] ?? $job['salary_max'],
        $data['deadline'] ?? $job['deadline'],
        $data['status'] ?? $job['status'],
        $id,
    ]);

    echo json_encode(['message' => 'Shpallja u përditësua.']);
    exit;
}

// ============================================
// DELETE /api/jobs/manage.php?id=5
// ============================================
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    $job = $id ? getOwnedJob($pdo, $id, $company['id']) : null;

    if (!$job) {
        http_response_code(404);
        echo json_encode(['error' => 'Shpallja nuk u gjet ose nuk të përket.']);
        exit;
    }

    $pdo->prepare("DELETE FROM job_postings WHERE id = ?")->execute([$id]);
    echo json_encode(['message' => 'Shpallja u fshi.']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Metoda nuk lejohet.']);
