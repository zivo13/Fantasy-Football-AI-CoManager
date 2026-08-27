<?php
// ============================================================
// SUPERMACHO FANTASY FOOTBALL AI - SAVE DRAFT QUEUE API
// PHP 8.3 + MySQL (Priority Draft Targets Endpoint)
// ============================================================

require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['email'])) {
    http_response_code(400);
    echo json_encode(["error" => "Email required"]);
    exit();
}

$email = strtolower(trim($input['email']));
$draftQueue = $input['draftQueue'] ?? [];

$pdo = getDBConnection();

// Verify User Exists
$stmtUser = $pdo->prepare("SELECT id FROM users WHERE email = :email");
$stmtUser->execute(['email' => $email]);
if (!$stmtUser->fetch()) {
    http_response_code(404);
    echo json_encode(["error" => "User not found"]);
    exit();
}

// Transaction: Replace User Draft Targets Queue in MySQL
$pdo->beginTransaction();

try {
    $stmtDelete = $pdo->prepare("DELETE FROM draft_queue WHERE user_email = :email");
    $stmtDelete->execute(['email' => $email]);

    if (is_array($draftQueue) && count($draftQueue) > 0) {
        $stmtInsert = $pdo->prepare("INSERT INTO draft_queue (user_email, player_id, player_name, position, team, adp, proj_pts) VALUES (:email, :player_id, :player_name, :position, :team, :adp, :proj_pts)");

        foreach ($draftQueue as $p) {
            $stmtInsert->execute([
                'email' => $email,
                'player_id' => $p['id'] ?? '',
                'player_name' => $p['name'] ?? '',
                'position' => $p['pos'] ?? $p['position'] ?? '',
                'team' => $p['team'] ?? '',
                'adp' => $p['adp'] ?? '',
                'proj_pts' => (float)($p['projPts'] ?? $p['proj_pts'] ?? 0)
            ]);
        }
    }

    $pdo->commit();

    // Fetch updated draft queue from MySQL
    $stmtFetch = $pdo->prepare("SELECT player_id AS id, player_name AS name, position AS pos, team, adp, proj_pts AS projPts FROM draft_queue WHERE user_email = :email ORDER BY id ASC");
    $stmtFetch->execute(['email' => $email]);
    $updatedQueue = $stmtFetch->fetchAll();

    echo json_encode([
        "success" => true,
        "message" => "Priority draft queue saved successfully to MySQL database",
        "draftQueue" => $updatedQueue
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        "error" => "SAVE_DRAFT_QUEUE_FAILED",
        "message" => $e->getMessage()
    ]);
}
?>
