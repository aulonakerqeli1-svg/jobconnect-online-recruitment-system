<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';
require_once __DIR__ . '/../../config/mailer.php';

// PUT /api/applications/update_status.php?id=3   body: { "status": "accepted" }
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Metoda nuk lejohet.']);
    exit;
}

$user = requireAuth($pdo, ['company']);

$id = $_GET['id'] ?? null;
$data = json_decode(file_get_contents('php://input'), true);
$status = $data['status'] ?? null;

$allowedStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];

if (!$id || !in_array($status, $allowedStatuses)) {
    http_response_code(422);
    echo json_encode(['error' => 'ID ose statusi i pavlefshëm.']);
    exit;
}

// Verifiko pronësinë + merr të dhënat për email (kandidati, shpallja, kompania)
$stmt = $pdo->prepare(
    "SELECT a.id, u.email, u.full_name, jp.title AS job_title, c.company_name
     FROM applications a
     JOIN job_postings jp ON jp.id = a.job_id
     JOIN companies c ON c.id = jp.company_id
     JOIN candidates cd ON cd.id = a.candidate_id
     JOIN users u ON u.id = cd.user_id
     WHERE a.id = ? AND c.user_id = ?"
);
$stmt->execute([$id, $user['id']]);
$application = $stmt->fetch();

if (!$application) {
    http_response_code(403);
    echo json_encode(['error' => 'Ky aplikim nuk të përket.']);
    exit;
}

$pdo->prepare("UPDATE applications SET status = ? WHERE id = ?")->execute([$status, $id]);

// Dërgo email njoftimi vetëm kur statusi bëhet përfundimtar (pranuar/refuzuar)
if (in_array($status, ['accepted', 'rejected'])) {
    sendApplicationStatusEmail(
        $application['email'],
        $application['full_name'],
        $application['job_title'],
        $application['company_name'],
        $status
    );
}

echo json_encode(['message' => 'Statusi u përditësua.']);
