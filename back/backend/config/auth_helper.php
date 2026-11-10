<?php
// ============================================
// auth_helper.php - Funksione ndihmëse për autentifikim
// ============================================

function generateToken() {
    return bin2hex(random_bytes(32));
}

function createAuthToken($pdo, $userId) {
    $token = generateToken();
    $expiresAt = date('Y-m-d H:i:s', strtotime('+7 days'));

    $stmt = $pdo->prepare("INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, ?)");
    $stmt->execute([$userId, $token, $expiresAt]);

    return $token;
}

// Kthen array me të dhënat e user-it nëse token-i është valid, përndryshe null
function getUserFromToken($pdo) {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        return null;
    }

    $token = $matches[1];

    $stmt = $pdo->prepare(
        "SELECT u.id, u.full_name, u.email, u.role
         FROM auth_tokens t
         JOIN users u ON u.id = t.user_id
         WHERE t.token = ? AND t.expires_at > NOW()"
    );
    $stmt->execute([$token]);

    return $stmt->fetch() ?: null;
}

// Ndalon kërkesën nëse user-i nuk është i kyçur (opsionalisht: kontrollon rolin)
function requireAuth($pdo, $allowedRoles = []) {
    $user = getUserFromToken($pdo);

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Nuk je i autentifikuar. Kyçu përsëri.']);
        exit;
    }

    if (!empty($allowedRoles) && !in_array($user['role'], $allowedRoles)) {
        http_response_code(403);
        echo json_encode(['error' => 'Nuk ke leje për këtë veprim.']);
        exit;
    }

    return $user;
}
