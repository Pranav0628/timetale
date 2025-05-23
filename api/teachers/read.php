
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

// Read all teachers
$query = "SELECT * FROM teachers";
$stmt = $db->prepare($query);
$stmt->execute();

$teachers = [];

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    // Get subjects taught by this teacher
    $query = "SELECT subject_id FROM teacher_subjects WHERE teacher_id = ?";
    $subjectStmt = $db->prepare($query);
    $subjectStmt->bindParam(1, $row['id']);
    $subjectStmt->execute();
    
    $subjects = [];
    while ($subjectRow = $subjectStmt->fetch(PDO::FETCH_ASSOC)) {
        $subjects[] = $subjectRow['subject_id'];
    }
    
    $teachers[] = [
        "id" => $row['id'],
        "name" => $row['name'],
        "maxHours" => $row['max_hours'],
        "subjects" => $subjects
    ];
}

// Return teachers as JSON
echo json_encode($teachers);
?>
