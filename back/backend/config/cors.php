<?php
// ============================================
// cors.php - Header-at CORS tani vendosen te .htaccess
// (backend/.htaccess), që mbulon edhe kërkesat OPTIONS që
// Apache i trajton vetë pa e thirrur PHP-në.
// Këtu lëmë vetëm përgjigjen për OPTIONS dhe Content-Type,
// që të shmangim header të dyfishtë Access-Control-Allow-Origin.
// ============================================

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
