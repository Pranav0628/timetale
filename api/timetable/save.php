
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

try {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if(empty($data->timetable)) {
        throw new Exception("No timetable data provided");
    }
    
    // Database connection
    require_once '../config/database.php';
    
    // Initialize database
    $database = new Database();
    $db = $database->getConnection();
    
    // Start transaction
    $db->beginTransaction();
    
    try {
        // First clear existing timetable
        $query = "DELETE FROM timetable";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        // Prepare insert statement
        $query = "INSERT INTO timetable (section_id, day, period, teacher_id, subject_id, created_at) 
                 VALUES (?, ?, ?, ?, ?, NOW())";
        $stmt = $db->prepare($query);
        
        // Insert new timetable data
        foreach($data->timetable as $sectionId => $days) {
            foreach($days as $day => $periods) {
                foreach($periods as $period => $slot) {
                    if($slot) {
                        $stmt->execute([
                            $sectionId,
                            $day,
                            $period,
                            $slot->teacherId,
                            $slot->subjectId
                        ]);
                    }
                }
            }
        }
        
        // Commit transaction
        $db->commit();
        
        echo json_encode([
            "success" => true,
            "message" => "Timetable saved successfully"
        ]);
        
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred while saving the timetable"
    ]);
}
?>
