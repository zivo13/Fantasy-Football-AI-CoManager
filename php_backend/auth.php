<?php
// ============================================================
// SUPERMACHO FANTASY FOOTBALL AI - USER AUTHENTICATION API
// PHP 8.3 + MySQL (Login & Signup Endpoint)
// ============================================================

require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['email'])) {
    http_response_code(400);
    echo json_encode(["error" => "Email required"]);
    exit();
}

$email = strtolower(trim($input['email']));
$password = $input['password'] ?? '';
$action = $input['action'] ?? 'login'; // 'login' | 'signup'

$pdo = getDBConnection();

if ($action === 'login') {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    $isAdmin = (str_contains($email, 'admin') || str_contains($email, 'zivo13'));

    if (!$user) {
        if ($isAdmin) {
            // Auto-create admin account if missing
            $passHash = password_hash($password ?: 'admin123', PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, role, plan, status, credits) VALUES (:email, :pass, 'admin', '300 Credits Commissioner ($24.99 USD)', 'Active Subscriber', 300)");
            $stmt->execute(['email' => $email, 'pass' => $passHash]);

            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
            $stmt->execute(['email' => $email]);
            $user = $stmt->fetch();
        } else {
            http_response_code(404);
            echo json_encode([
                "error" => "ACCOUNT_NOT_FOUND",
                "message" => "No account found with this email address. Please click Join to register an account first!"
            ]);
            exit();
        }
    }

    if ($password && !password_verify($password, $user['password_hash'])) {
        // Fallback for legacy plain text compatibility if needed
        if ($user['password_hash'] !== $password) {
            http_response_code(401);
            echo json_encode([
                "error" => "INVALID_PASSWORD",
                "message" => "Incorrect password. Please enter the correct password."
            ]);
            exit();
        }
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
    exit();
}

if ($action === 'signup') {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute(['email' => $email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode([
            "error" => "ACCOUNT_EXISTS",
            "message" => "An account already exists with this email address. Please click Sign In to log in!"
        ]);
        exit();
    }

    $passHash = password_hash($password, PASSWORD_BCRYPT);
    $role = ($input['role'] ?? null) ?: (($email === 'zivo13@yahoo.com' || str_contains($email, 'admin')) ? 'admin' : 'client');
    $plan = ($role === 'admin') ? '300 Credits Commissioner ($24.99 USD)' : '20 Free Credits Rookie ($0.00 USD)';

    $stmtInsert = $pdo->prepare("INSERT INTO users (email, password_hash, role, plan, status, credits) VALUES (:email, :pass, :role, :plan, 'Active Subscriber', 20)");
    $stmtInsert->execute(['email' => $email, 'pass' => $passHash, 'role' => $role, 'plan' => $plan]);

    echo json_encode([
        "success" => true,
        "message" => "Account created successfully",
        "user" => [
            "user" => $email,
            "email" => $email,
            "role" => $role,
            "plan" => $plan,
            "status" => "Active Subscriber",
            "credits" => 20,
            "leagues" => [],
            "draftQueue" => []
        ]
    ]);
    exit();
}
?>
