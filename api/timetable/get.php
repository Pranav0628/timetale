
<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Database connection
include_once '../config/database.php';

// Initialize database
$database = new Database();
$db = $database->getConnection();

// Get timetable data
$query = "SELECT * FROM timetable";
$stmt = $db->prepare($query);
$stmt->execute();

$timetable = [];

while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $sectionId = $row['section_id'];
    $day = $row['day'];
    $period = $row['period'];
    
    if(!isset($timetable[$sectionId])) {
        $timetable[$sectionId] = [];
    }
    
    if(!isset($timetable[$sectionId][$day])) {
        $timetable[$sectionId][$day] = [];
    }
    
    $timetable[$sectionId][$day][$period] = [
        "teacherId" => $row['teacher_id'],
        "subjectId" => $row['subject_id']
    ];
}

// Return timetable as JSON
echo json_encode($timetable);
?>
