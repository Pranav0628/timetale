
<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Database connection
include_once '../config/database.php';

// Initialize database
$database = new Database();
$db = $database->getConnection();

// Read all subjects
$query = "SELECT * FROM subjects";
$stmt = $db->prepare($query);
$stmt->execute();

$subjects = [];

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    // Get sections for this subject
    $query = "SELECT section_id, hours_per_week FROM subject_sections WHERE subject_id = ?";
    $sectionStmt = $db->prepare($query);
    $sectionStmt->bindParam(1, $row['id']);
    $sectionStmt->execute();
    
    $sections = [];
    $hoursPerWeek = [];
    
    while ($sectionRow = $sectionStmt->fetch(PDO::FETCH_ASSOC)) {
        $sections[] = $sectionRow['section_id'];
        $hoursPerWeek[$sectionRow['section_id']] = (int)$sectionRow['hours_per_week'];
    }
    
    $subjects[] = [
        "id" => $row['id'],
        "name" => $row['name'],
        "sections" => $sections,
        "hoursPerWeek" => $hoursPerWeek
    ];
}

// Return subjects as JSON
echo json_encode($subjects);
?>
