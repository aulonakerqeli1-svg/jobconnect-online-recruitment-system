<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';

// GET /api/categories/index.php
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Metoda nuk lejohet.']);
    exit;
}

$stmt = $pdo->query("SELECT id, name FROM job_categories ORDER BY name ASC");
echo json_encode($stmt->fetchAll());
