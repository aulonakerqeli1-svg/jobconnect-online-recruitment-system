<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

// POST /api/auth/logout.php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Metoda nuk lejohet.']);
    exit;
}

$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    // Fshi token-in nga DB — e bën të pavlefshëm menjëherë, jo vetëm në browser
    $pdo->prepare("DELETE FROM auth_tokens WHERE token = ?")->execute([$matches[1]]);
}

echo json_encode(['message' => 'U çkyçe me sukses.']);
