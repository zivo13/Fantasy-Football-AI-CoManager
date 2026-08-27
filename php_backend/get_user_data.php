<?php
// ============================================================
// SUPERMACHO FANTASY FOOTBALL AI - GET USER DATA API
// PHP 8.3 + MySQL (Get Complete User Data Endpoint)
// ============================================================

require_once __DIR__ . '/db.php';

$email = strtolower(trim($_GET['email'] ?? $_POST['email'] ?? ''));

if (empty($email)) {
    http_response_code(400);
    echo json_encode(["error" => "Email parameter required"]);
    exit();
}

$pdo = getDBConnection();

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
$stmt->execute(['email' => $email]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(404);
    echo json_encode(["error" => "ACCOUNT_NOT_FOUND"]);
    exit();
}

// Load User Leagues
$stmtLeagues = $pdo->prepare("SELECT platform, league_id AS leagueId, team_id AS teamId, espn_s2 AS espnS2, swid, scoring_format AS scoringFormat FROM leagues WHERE user_email = :email");
$stmtLeagues->execute(['email' => $email]);
$leagues = $stmtLeagues->fetchAll();

// Load User Draft Queue Targets
$stmtQueue = $pdo->prepare("SELECT player_id AS id, player_name AS name, position AS pos, team, adp, proj_pts AS projPts FROM draft_queue WHERE user_email = :email ORDER BY id ASC");
$stmtQueue->execute(['email' => $email]);
$draftQueue = $stmtQueue->fetchAll();

echo json_encode([
    "success" => true,
    "user" => [
        "id" => "u_" . $user['id'],
        "user" => $user['email'],
        "email" => $user['email'],
        "role" => $user['role'],
        "plan" => $user['plan'],
        "status" => $user['status'],
        "credits" => (int)$user['credits'],
        "leagues" => $leagues,
        "draftQueue" => $draftQueue
    ],
    "leagues" => $leagues,
    "draftQueue" => $draftQueue
]);
?>
