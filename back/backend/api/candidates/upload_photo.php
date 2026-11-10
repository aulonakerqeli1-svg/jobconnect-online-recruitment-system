<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Metoda nuk lejohet.']);
    exit;
}

$user = requireAuth($pdo, ['candidate']);

if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(422);
    echo json_encode(['error' => 'Asnjë foto s\'u ngarkua.']);
    exit;
}

$allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!in_array($_FILES['photo']['type'], $allowedTypes)) {
    http_response_code(422);
    echo json_encode(['error' => 'Lejohen vetëm JPG, PNG ose WEBP.']);
    exit;
}

if ($_FILES['photo']['size'] > 5 * 1024 * 1024) {
    http_response_code(422);
    echo json_encode(['error' => 'Fotoja duhet të jetë nën 2MB.']);
    exit;
}

$uploadsDir = __DIR__ . '/../../uploads/';
$ext = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
$fileName = 'photo_' . $user['id'] . '_' . uniqid() . '.' . $ext;
move_uploaded_file($_FILES['photo']['tmp_name'], $uploadsDir . $fileName);

$photoPath = 'uploads/' . $fileName;

$pdo->prepare("UPDATE candidates SET photo_path = ? WHERE user_id = ?")
    ->execute([$photoPath, $user['id']]);

echo json_encode(['message' => 'Fotoja u ngarkua.', 'photo_path' => $photoPath]);