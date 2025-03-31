
<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
include_once '../config/database.php';

// Initialize database
$database = new Database();
$db = $database->getConnection();

try {
    // Clear timetable
    $query = "DELETE FROM timetable";
    $stmt = $db->prepare($query);
    $success = $stmt->execute();
    
    if ($success) {
        echo json_encode([
            "success" => true,
            "message" => "Timetable reset successfully."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Error resetting timetable."
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
