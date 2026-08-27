<?php
// ============================================================
// SUPERMACHO FANTASY FOOTBALL AI - SAVE LEAGUES API
// PHP 8.3 + MySQL (League Configuration Endpoint)
// ============================================================

require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['email'])) {
    http_response_code(400);
    echo json_encode(["error" => "Email required"]);
    exit();
}

$email = strtolower(trim($input['email']));
$leagues = $input['leagues'] ?? [];

$pdo = getDBConnection();

// Verify User Exists
$stmtUser = $pdo->prepare("SELECT id FROM users WHERE email = :email");
$stmtUser->execute(['email' => $email]);
if (!$stmtUser->fetch()) {
    http_response_code(404);
    echo json_encode(["error" => "User not found"]);
    exit();
}

// Transaction: Replace User Leagues with new list
$pdo->beginTransaction();

try {
    $stmtDelete = $pdo->prepare("DELETE FROM leagues WHERE user_email = :email");
    $stmtDelete->execute(['email' => $email]);

    if (is_array($leagues) && count($leagues) > 0) {
        $stmtInsert = $pdo->prepare("INSERT INTO leagues (user_email, platform, league_id, team_id, espn_s2, swid, scoring_format) VALUES (:email, :platform, :league_id, :team_id, :espn_s2, :swid, :scoring_format)");

        foreach ($leagues as $l) {
            $stmtInsert->execute([
                'email' => $email,
                'platform' => $l['platform'] ?? 'ESPN',
                'league_id' => $l['leagueId'] ?? '',
                'team_id' => $l['teamId'] ?? '1',
                'espn_s2' => $l['espnS2'] ?? null,
                'swid' => $l['swid'] ?? null,
                'scoring_format' => $l['scoringFormat'] ?? 'PPR'
            ]);
        }
    }

    $pdo->commit();

    // Retrieve updated leagues
    $stmtFetch = $pdo->prepare("SELECT platform, league_id AS leagueId, team_id AS teamId, espn_s2 AS espnS2, swid, scoring_format AS scoringFormat FROM leagues WHERE user_email = :email");
    $stmtFetch->execute(['email' => $email]);
    $updatedLeagues = $stmtFetch->fetchAll();

    echo json_encode([
        "success" => true,
        "message" => "Leagues saved successfully to MySQL database",
        "leagues" => $updatedLeagues
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        "error" => "SAVE_LEAGUE_FAILED",
        "message" => $e->getMessage()
    ]);
}
?>
