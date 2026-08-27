<?php
// ============================================================
// SUPERMACHO FANTASY FOOTBALL AI - GODADDY PDO DB CONNECTION
// PHP 8.3 + MySQL PDO Configuration
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// DATABASE CREDENTIALS (Update these with your GoDaddy cPanel MySQL details)
define('DB_HOST', 'localhost');
define('DB_NAME', 'supermacho_nfl_db'); // GoDaddy database name
define('DB_USER', 'supermacho_user');   // GoDaddy database username
define('DB_PASS', 'YourPassword123!');   // GoDaddy database password

function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "error" => "DATABASE_CONNECTION_ERROR",
            "message" => "Could not connect to MySQL database: " . $e->getMessage()
        ]);
        exit();
    }
}
?>
