<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';

// GET /api/jobs/show.php?id=5
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Metoda nuk lejohet.']);
    exit;
}

$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(422);
    echo json_encode(['error' => 'ID e shpalljes mungon.']);
    exit;
}

$stmt = $pdo->prepare(
    "SELECT jp.*, c.company_name, c.logo_path, c.website, cat.name AS category_name
     FROM job_postings jp
     JOIN companies c ON c.id = jp.company_id
     LEFT JOIN job_categories cat ON cat.id = jp.category_id
     WHERE jp.id = ?"
);
$stmt->execute([$id]);
$job = $stmt->fetch();

if (!$job) {
    http_response_code(404);
    echo json_encode(['error' => 'Shpallja nuk u gjet.']);
    exit;
}

echo json_encode($job);
