<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';
require_once __DIR__ . '/../../config/mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Metoda nuk lejohet.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$fullName = trim($data['full_name'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$role = $data['role'] ?? 'candidate'; // 'candidate' ose 'company'

if (!$fullName || !$email || !$password) {
    http_response_code(422);
    echo json_encode(['error' => 'Të gjitha fushat janë të detyrueshme.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['error' => 'Email-i nuk është valid.']);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(422);
    echo json_encode(['error' => 'Fjalëkalimi duhet të ketë të paktën 6 karaktere.']);
    exit;
}

if (!preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
    http_response_code(422);
    echo json_encode(['error' => 'Fjalëkalimi duhet të ketë të paktën një shkronjë dhe një numër.']);
    exit;
}

if (!in_array($role, ['candidate', 'company'])) {
    $role = 'candidate';
}

// Kontrollo nëse email-i ekziston tashmë
$check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$check->execute([$email]);
if ($check->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Ky email është regjistruar tashmë.']);
    exit;
}

$pdo->beginTransaction();

try {
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $pdo->prepare(
        "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)"
    );
    $stmt->execute([$fullName, $email, $passwordHash, $role]);
    $userId = $pdo->lastInsertId();

    // Krijo profilin përkatës automatikisht
    if ($role === 'company') {
        $pdo->prepare("INSERT INTO companies (user_id, company_name) VALUES (?, ?)")
            ->execute([$userId, $fullName]);
    } else {
        $pdo->prepare("INSERT INTO candidates (user_id) VALUES (?)")
            ->execute([$userId]);
    }

    $pdo->commit();

    $token = createAuthToken($pdo, $userId);

    // Dërgo email mirëseardhjeje (jo kritik — s'e ndalon regjistrimin nëse dështon)
    sendWelcomeEmail($email, $fullName, $role);

    http_response_code(201);
    echo json_encode([
        'message' => 'Regjistrimi u krye me sukses.',
        'token' => $token,
        'user' => ['id' => $userId, 'full_name' => $fullName, 'email' => $email, 'role' => $role],
    ]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Regjistrimi dështoi: ' . $e->getMessage()]);
}
