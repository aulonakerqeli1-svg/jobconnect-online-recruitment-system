<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

$method = $_SERVER['REQUEST_METHOD'];

// ============================================
// POST /api/applications/index.php
// Kandidati aplikon për një shpallje (multipart/form-data me CV)
// Fusha: job_id, cover_letter, cv (file)
// ============================================
if ($method === 'POST') {
    $user = requireAuth($pdo, ['candidate']);

    $candidateStmt = $pdo->prepare("SELECT id FROM candidates WHERE user_id = ?");
    $candidateStmt->execute([$user['id']]);
    $candidate = $candidateStmt->fetch();

    $jobId = $_POST['job_id'] ?? null;
    $coverLetter = $_POST['cover_letter'] ?? null;

    if (!$jobId) {
        http_response_code(422);
        echo json_encode(['error' => 'job_id është i detyrueshëm.']);
        exit;
    }

    // Lejo aplikim vetëm për shpallje të aprovuara nga admini
    $jobStmt = $pdo->prepare("SELECT status FROM job_postings WHERE id = ?");
    $jobStmt->execute([$jobId]);
    $jobRow = $jobStmt->fetch();

    if (!$jobRow || $jobRow['status'] !== 'approved') {
        http_response_code(422);
        echo json_encode(['error' => 'Kjo shpallje nuk është aktive për aplikime.']);
        exit;
    }

    $cvPath = null;

    if (isset($_FILES['cv']) && $_FILES['cv']['error'] === UPLOAD_ERR_OK) {
        $allowedTypes = ['application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

        if (!in_array($_FILES['cv']['type'], $allowedTypes)) {
            http_response_code(422);
            echo json_encode(['error' => 'Lejohen vetëm skedarë PDF ose Word.']);
            exit;
        }
        if ($_FILES['cv']['size'] > 5 * 1024 * 1024) { // 5MB
            http_response_code(422);
            echo json_encode(['error' => 'Skedari duhet të jetë nën 5MB.']);
            exit;
        }

        $uploadsDir = __DIR__ . '/../../uploads/';
        $fileName = uniqid('cv_') . '_' . basename($_FILES['cv']['name']);
        move_uploaded_file($_FILES['cv']['tmp_name'], $uploadsDir . $fileName);
        $cvPath = 'uploads/' . $fileName;
    }

    try {
        $stmt = $pdo->prepare(
            "INSERT INTO applications (job_id, candidate_id, cv_path, cover_letter) VALUES (?, ?, ?, ?)"
        );
        $stmt->execute([$jobId, $candidate['id'], $cvPath, $coverLetter]);

        http_response_code(201);
        echo json_encode(['message' => 'Aplikimi u dërgua me sukses.']);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            http_response_code(409);
            echo json_encode(['error' => 'Ke aplikuar tashmë për këtë pozitë.']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Aplikimi dështoi: ' . $e->getMessage()]);
        }
    }
    exit;
}

// ============================================
// GET /api/applications/index.php
// - candidate: aplikimet e veta -> ?mine=1
// - company:   aplikimet për një shpallje -> ?job_id=5
// ============================================
if ($method === 'GET') {
    $user = requireAuth($pdo, ['candidate', 'company']);

    if ($user['role'] === 'candidate') {
        $candidateStmt = $pdo->prepare("SELECT id FROM candidates WHERE user_id = ?");
        $candidateStmt->execute([$user['id']]);
        $candidate = $candidateStmt->fetch();

        $stmt = $pdo->prepare(
            "SELECT a.*, jp.title AS job_title, c.company_name
             FROM applications a
             JOIN job_postings jp ON jp.id = a.job_id
             JOIN companies c ON c.id = jp.company_id
             WHERE a.candidate_id = ?
             ORDER BY a.applied_at DESC"
        );
        $stmt->execute([$candidate['id']]);
        echo json_encode($stmt->fetchAll());
        exit;
    }

    // role === 'company'
    $jobId = $_GET['job_id'] ?? null;
    if (!$jobId) {
        http_response_code(422);
        echo json_encode(['error' => 'job_id është i detyrueshëm.']);
        exit;
    }

    // Verifiko që shpallja i përket kompanisë së kyçur
    $companyStmt = $pdo->prepare("SELECT id FROM companies WHERE user_id = ?");
    $companyStmt->execute([$user['id']]);
    $company = $companyStmt->fetch();

    $ownStmt = $pdo->prepare("SELECT id FROM job_postings WHERE id = ? AND company_id = ?");
    $ownStmt->execute([$jobId, $company['id']]);
    if (!$ownStmt->fetch()) {
        http_response_code(403);
        echo json_encode(['error' => 'Kjo shpallje nuk të përket.']);
        exit;
    }

    $stmt = $pdo->prepare(
        "SELECT a.*, u.full_name, u.email, cd.headline
         FROM applications a
         JOIN candidates cd ON cd.id = a.candidate_id
         JOIN users u ON u.id = cd.user_id
         WHERE a.job_id = ?
         ORDER BY a.applied_at DESC"
    );
    $stmt->execute([$jobId]);
    echo json_encode($stmt->fetchAll());
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Metoda nuk lejohet.']);
