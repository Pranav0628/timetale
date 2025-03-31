
<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Database connection
include_once '../config/database.php';

// Initialize database
$database = new Database();
$db = $database->getConnection();

// Read all sections
$query = "SELECT * FROM sections";
$stmt = $db->prepare($query);
$stmt->execute();

$sections = [];

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $sections[] = [
        "id" => $row['id'],
        "name" => $row['name']
    ];
}

// Return sections as JSON
echo json_encode($sections);
?>
