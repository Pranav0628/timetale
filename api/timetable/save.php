
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

// Get posted data
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->timetable)) {
    // Initialize database
    $database = new Database();
    $db = $database->getConnection();
    
    // First clear existing timetable
    $query = "DELETE FROM timetable";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    // Insert new timetable data
    $success = true;
    
    foreach($data->timetable as $sectionId => $days) {
        foreach($days as $day => $periods) {
            foreach($periods as $period => $slot) {
                if($slot) {
                    $query = "INSERT INTO timetable (section_id, day, period, teacher_id, subject_id) 
                             VALUES (?, ?, ?, ?, ?)";
                    $stmt = $db->prepare($query);
                    
                    $stmt->bindParam(1, $sectionId);
                    $stmt->bindParam(2, $day);
                    $stmt->bindParam(3, $period);
                    $stmt->bindParam(4, $slot->teacherId);
                    $stmt->bindParam(5, $slot->subjectId);
                    
                    if(!$stmt->execute()) {
                        $success = false;
                    }
                }
            }
        }
    }
    
    if($success) {
        echo json_encode([
            "success" => true,
            "message" => "Timetable saved successfully."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Error saving timetable."
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "No timetable data provided."
    ]);
}
?>
