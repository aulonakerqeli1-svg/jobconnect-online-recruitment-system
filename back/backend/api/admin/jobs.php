<?php
// ============================================================
// admin/jobs.php — Menaxhimi i shpalljeve nga administratori
// GET → lista e shpalljeve me filtra (skeda "Shpalljet")
// PUT → aprovimi ose refuzimi i një shpalljeje (butonat Aprovo/Refuzo)
// E thërrasin getJobsForAdmin() dhe reviewJob() te adminService.js.
// ============================================================

// cors.php        → lejon frontend-in të flasë me këtë API
// db.php          → krijon lidhjen me databazën ($pdo)
// auth_helper.php → sjell funksionin requireAuth
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

// KËTU ndalohet kompania të aprovojë vetë shpalljen:
// vetëm administratori kalon (pa token → 401, rol tjetër → 403).
// Vlen për GET dhe PUT, sepse është lart, para të dyjave.
requireAuth($pdo, ['admin']);
// Ruhet metoda e kërkesës (GET, PUT...) që të vendoset cila pjesë ekzekutohet
$method = $_SERVER['REQUEST_METHOD'];

// ============================================
// GET /api/admin/jobs.php?status=pending&category_id=2
// Listim + filtrim sipas departamentit (kategorisë) dhe statusit
// ============================================
if ($method === 'GET') {
    // Filtrat nga adresa. ?? '' → nëse mungojnë, s'ka filtër
    $status = $_GET['status'] ?? '';
    $categoryId = $_GET['category_id'] ?? '';

    // '1=1' → pikënisje, që kushtet e tjera të shtohen thjesht me AND
    $where = ['1=1'];
    $params = []; // vlerat për ?-të (prepared statement)

    // Çdo filtër shtohet vetëm nëse është zgjedhur
    if ($status !== '') {
        $where[] = 'jp.status = ?';
        $params[] = $status;
    }
    if ($categoryId !== '') {
        $where[] = 'jp.category_id = ?';
        $params[] = $categoryId;
    }

    // Pa filtër statusi → admini sheh TË GJITHA shpalljet (edhe pending),
    //   ndryshe nga jobs/index.php ku publiku sheh vetëm 'approved'.
    // JOIN companies → emri i kompanisë
    // LEFT JOIN job_categories → shpallja del edhe pa kategori
    // ORDER BY created_at DESC → më të rejat të parat
    $sql = "SELECT jp.id, jp.title, jp.location, jp.employment_type, jp.status, jp.admin_note, jp.created_at,
                   c.company_name, cat.name AS category_name
            FROM job_postings jp
            JOIN companies c ON c.id = jp.company_id
            LEFT JOIN job_categories cat ON cat.id = jp.category_id
            WHERE " . implode(' AND ', $where) . "
            ORDER BY jp.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll()); // lista si JSON
    exit; // ndalon këtu, që të mos ekzekutohet pjesa e PUT
}

// ============================================
// PUT /api/admin/jobs.php?id=5
// Miraton ose refuzon një shpallje: { "status": "approved"|"rejected", "admin_note": "..." }
// ============================================
if ($method === 'PUT') {
    // ID-ja e shpalljes vjen nga adresa (?id=5)
    $id = $_GET['id'] ?? null;
    // Trupi i kërkesës vjen si JSON → kthehet në varg PHP
    $data = json_decode(file_get_contents('php://input'), true);
    $status = $data['status'] ?? null;

    // Validimi: duhet ID, dhe statusi duhet të jetë VETËM 'approved' ose 'rejected'.
    // Kështu admini nuk mund të vendosë vlera të tjera (p.sh. 'closed').
    if (!$id || !in_array($status, ['approved', 'rejected'])) {
        http_response_code(422); // të dhëna të pavlefshme
        echo json_encode(['error' => 'ID ose statusi i pavlefshëm.']);
        exit;
    }

    // Ruhet statusi i ri dhe arsyeja (admin_note).
    // ?? null → nëse arsyeja nuk dërgohet, ruhet NULL.
    // Kompania e sheh këtë arsye te CompanyDashboard ("Arsyeja: ...").
    $stmt = $pdo->prepare("UPDATE job_postings SET status = ?, admin_note = ? WHERE id = ?");
    $stmt->execute([$status, $data['admin_note'] ?? null, $id]);

    echo json_encode(['message' => 'Statusi i shpalljes u përditësua.']);
    exit;
}

// Nëse metoda nuk është as GET as PUT → 405 "Metoda nuk lejohet"
http_response_code(405);
echo json_encode(['error' => 'Metoda nuk lejohet.']);