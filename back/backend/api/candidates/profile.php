<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

$user = requireAuth($pdo, ['candidate']);
$method = $_SERVER['REQUEST_METHOD'];

// ============================================
// GET /api/candidates/profile.php
// ============================================
if ($method === 'GET') {
    $stmt = $pdo->prepare(
        "SELECT cd.headline, cd.bio, cd.skills, cd.experience, cd.phone,
                cd.personal_number, cd.location, cd.cv_path, cd.photo_path, u.full_name, u.email
         FROM candidates cd
         JOIN users u ON u.id = cd.user_id
         WHERE cd.user_id = ?"
    );
    $stmt->execute([$user['id']]);
    echo json_encode($stmt->fetch());
    exit;
}

// ============================================
// PUT /api/candidates/profile.php
// Përditëson profilin: telefon, numër personal, aftësi, eksperiencë, etj.
// ============================================
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    $stmt = $pdo->prepare(
        "UPDATE candidates SET
            headline = ?, bio = ?, skills = ?, experience = ?,
            phone = ?, personal_number = ?, location = ?
         WHERE user_id = ?"
    );
    $stmt->execute([
        $data['headline'] ?? null,
        $data['bio'] ?? null,
        $data['skills'] ?? null,
        $data['experience'] ?? null,
        $data['phone'] ?? null,
        $data['personal_number'] ?? null,
        $data['location'] ?? null,
        $user['id'],
    ]);

    echo json_encode(['message' => 'Profili u përditësua.']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Metoda nuk lejohet.']);
