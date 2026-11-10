<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

$method = $_SERVER['REQUEST_METHOD'];

// ============================================
// GET /api/jobs/index.php
// Listim + kërkim + filtrim + paginim
// Parametra: ?search=&category_id=&location=&type=&page=1&limit=10
// ============================================
if ($method === 'GET') {
    $search = trim($_GET['search'] ?? '');
    $categoryId = $_GET['category_id'] ?? '';
    $location = trim($_GET['location'] ?? '');
    $type = $_GET['type'] ?? '';
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(50, max(1, (int)($_GET['limit'] ?? 10)));
    $offset = ($page - 1) * $limit;

    $where = ["jp.status = 'approved'"];
    $params = [];

    if ($search !== '') {
        $where[] = "(jp.title LIKE ? OR jp.description LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    if ($categoryId !== '') {
        $where[] = "jp.category_id = ?";
        $params[] = $categoryId;
    }
    if ($location !== '') {
        $where[] = "jp.location LIKE ?";
        $params[] = "%$location%";
    }
    if ($type !== '') {
        $where[] = "jp.employment_type = ?";
        $params[] = $type;
    }

    $whereSql = implode(' AND ', $where);

    // Numri total (për paginim në frontend)
    $countStmt = $pdo->prepare("SELECT COUNT(*) AS total FROM job_postings jp WHERE $whereSql");
    $countStmt->execute($params);
    $total = $countStmt->fetch()['total'];

    $sql = "SELECT jp.id, jp.title, jp.location, jp.employment_type, jp.salary_min, jp.salary_max,
                   jp.deadline, jp.created_at, c.company_name, c.logo_path, cat.name AS category_name
            FROM job_postings jp
            JOIN companies c ON c.id = jp.company_id
            LEFT JOIN job_categories cat ON cat.id = jp.category_id
            WHERE $whereSql
            ORDER BY jp.created_at DESC
            LIMIT $limit OFFSET $offset";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $jobs = $stmt->fetchAll();

    echo json_encode([
        'data' => $jobs,
        'total' => (int)$total,
        'page' => $page,
        'limit' => $limit,
        'total_pages' => (int)ceil($total / $limit),
    ]);
    exit;
}

// ============================================
// POST /api/jobs/index.php
// Krijimi i një shpalljeje (vetëm role='company')
// ============================================
if ($method === 'POST') {
    $user = requireAuth($pdo, ['company']);

    $companyStmt = $pdo->prepare("SELECT id FROM companies WHERE user_id = ?");
    $companyStmt->execute([$user['id']]);
    $company = $companyStmt->fetch();

    if (!$company) {
        http_response_code(404);
        echo json_encode(['error' => 'Profili i kompanisë nuk u gjet.']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);

    $title = trim($data['title'] ?? '');
    $description = trim($data['description'] ?? '');

    if (!$title || !$description) {
        http_response_code(422);
        echo json_encode(['error' => 'Titulli dhe përshkrimi janë të detyrueshëm.']);
        exit;
    }

    $stmt = $pdo->prepare(
        "INSERT INTO job_postings
            (company_id, category_id, title, description, requirements, location, employment_type, salary_min, salary_max, deadline)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        $company['id'],
        $data['category_id'] ?? null,
        $title,
        $description,
        $data['requirements'] ?? null,
        $data['location'] ?? null,
        $data['employment_type'] ?? 'full-time',
        $data['salary_min'] ?? null,
        $data['salary_max'] ?? null,
        $data['deadline'] ?? null,
    ]);

    http_response_code(201);
    echo json_encode(['message' => 'Shpallja u krijua.', 'id' => $pdo->lastInsertId()]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Metoda nuk lejohet.']);
