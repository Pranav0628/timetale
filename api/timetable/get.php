
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
    // Database connection
    require_once '../config/database.php';
    
    // Initialize database
    $database = new Database();
    $db = $database->getConnection();
    
    // Get timetable data with transaction for consistency
    $db->beginTransaction();
    
    try {
        $query = "SELECT t.*, 
                        s.type as subject_type,
                        s.location as subject_location
                 FROM timetable t
                 LEFT JOIN subjects s ON t.subject_id = s.id
                 ORDER BY t.section_id, t.day, t.period";
                 
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
                "subjectId" => $row['subject_id'],
                "type" => $row['subject_type'] ?? 'lecture',
                "location" => $row['subject_location']
            ];
        }
        
        $db->commit();
        
        // Return success response
        echo json_encode([
            "success" => true,
            "data" => $timetable,
            "message" => "Timetable retrieved successfully"
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
        "message" => "An error occurred while retrieving the timetable"
    ]);
}
?>
