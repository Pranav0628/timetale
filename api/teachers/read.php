
<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

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
