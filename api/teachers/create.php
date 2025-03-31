
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

// Get database connection
include_once '../config/database.php';

// Get posted data
$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->name) &&
    !empty($data->maxHours) &&
    !empty($data->subjects)
) {
    // Initialize database
    $database = new Database();
    $db = $database->getConnection();
    
    // First, create the teacher
    $query = "INSERT INTO teachers (name, max_hours) VALUES (?, ?)";
    $stmt = $db->prepare($query);
    
    // Clean data
    $name = htmlspecialchars(strip_tags($data->name));
    $maxHours = htmlspecialchars(strip_tags($data->maxHours));
    
    // Bind values
    $stmt->bindParam(1, $name);
    $stmt->bindParam(2, $maxHours);
    
    // Execute query
    if($stmt->execute()) {
        $teacherId = $db->lastInsertId();
        
        // Now add subject relationships
        foreach($data->subjects as $subjectId) {
            $query = "INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES (?, ?)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(1, $teacherId);
            $stmt->bindParam(2, $subjectId);
            $stmt->execute();
        }
        
        // Return success with new teacher ID
        echo json_encode([
            "id" => $teacherId,
            "name" => $name,
            "maxHours" => $maxHours,
            "subjects" => $data->subjects,
            "message" => "Teacher created successfully."
        ]);
    } else {
        // Return error
        echo json_encode([
            "message" => "Unable to create teacher."
        ]);
    }
} else {
    // Return error if data is incomplete
    echo json_encode([
        "message" => "Unable to create teacher. Data is incomplete."
    ]);
}
?>
