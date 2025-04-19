
<?php
// Enhanced database configuration with error handling and connection pooling
class Database {
    private $host = "localhost";
    private $db_name = "timetable_db";
    private $username = "root";
    private $password = "";
    private static $conn = null;
    
    // Get database connection with connection pooling
    public function getConnection() {
        try {
            // If connection exists and is still alive, reuse it
            if (self::$conn !== null) {
                // Check if connection is still alive
                try {
                    if (self::$conn->query('SELECT 1')) {
                        return self::$conn;
                    }
                } catch (PDOException $e) {
                    // Connection is dead, create new one
                    self::$conn = null;
                }
            }
            
            // Create new connection with proper charset and error modes
            self::$conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_PERSISTENT => true,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                )
            );
            
            return self::$conn;
        } catch(PDOException $exception) {
            error_log("Database connection error: " . $exception->getMessage());
            throw new Exception("Database connection failed: " . $exception->getMessage());
        }
    }
}
?>
