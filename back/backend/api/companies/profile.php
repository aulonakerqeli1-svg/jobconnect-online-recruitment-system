<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

$user = requireAuth($pdo, ['company']);
$method = $_SERVER['REQUEST_METHOD'];

// ============================================
// GET /api/companies/profile.php
// ============================================
if ($method === 'GET') {
    $stmt = $pdo->prepare(
        "SELECT c.company_name, c.description, c.website, c.location, c.industry, c.logo_path,
                u.full_name, u.email, u.phone
         FROM companies c
         JOIN users u ON u.id = c.user_id
         WHERE c.user_id = ?"
    );
    $stmt->execute([$user['id']]);
    echo json_encode($stmt->fetch());
    exit;
}

// ============================================
// PUT /api/companies/profile.php
// ============================================
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    $companyName = trim($data['company_name'] ?? '');
    if (!$companyName) {
        http_response_code(422);
        echo json_encode(['error' => 'Emri i kompanisë është i detyrueshëm.']);
        exit;
    }

    $stmt = $pdo->prepare(
        "UPDATE companies SET
            company_name = ?, description = ?, website = ?, location = ?, industry = ?
         WHERE user_id = ?"
    );
    $stmt->execute([
        $companyName,
        $data['description'] ?? null,
        $data['website'] ?? null,
        $data['location'] ?? null,
        $data['industry'] ?? null,
        $user['id'],
    ]);

    echo json_encode(['message' => 'Profili i kompanisë u përditësua.']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Metoda nuk lejohet.']);
