<?php
// ============================================
// db.php - Lidhja me databazën (PDO)
// ============================================

$host = 'localhost';
$dbname = 'jobconnect';
$username = 'root';   // ndrysho nëse ke user tjetër në XAMPP
$password = '';        // ndrysho nëse ke fjalëkalim në MySQL

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Lidhja me databazën dështoi: ' . $e->getMessage()]);
    exit;
}
