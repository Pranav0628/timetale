
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
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if (empty($data->email) || empty($data->password)) {
        throw new Exception("Email and password are required.");
    }
    
    // Check for admin credentials directly (for demo purposes)
    if ($data->email === "admin@timetale.com" && $data->password === "admin123") {
        echo json_encode([
            "success" => true,
            "user" => [
                "id" => "1",
                "name" => "Admin User",
                "role" => "admin"
            ]
        ]);
        exit();
    }
    
    // Initialize database
    $database = new Database();
    $db = $database->getConnection();
    
    // Query to find user
    $query = "SELECT * FROM users WHERE email = ?";
    $stmt = $db->prepare($query);
    
    // Clean data
    $email = htmlspecialchars(strip_tags($data->email));
    
    // Bind values
    $stmt->bindParam(1, $email);
    
    // Execute query
    $stmt->execute();
    
    // Get user data
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && password_verify($data->password, $user['password'])) {
        // User exists and password matches
        echo json_encode([
            "success" => true,
            "user" => [
                "id" => $user['id'],
                "name" => $user['name'],
                "role" => $user['role']
            ]
        ]);
    } else {
        // User doesn't exist or password doesn't match
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid email or password."
        ]);
    }
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
