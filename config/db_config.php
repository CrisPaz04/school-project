<?php

class Database {
    private $host = "localhost";
    private $db_name = "COLEGIO";
    private $charset = "utf8mb4";
    private $username;
    private $password;
    private $conn;

    public function __construct($user = null, $pass = null) {
        $this->username = $user ?: 'dba_colegio';
        $this->password = $pass ?: 'dba_password';
    }

    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset={$this->charset}";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
            return $this->conn;
        } catch(PDOException $e) {
            echo "Error de conexión: " . $e->getMessage();
            return null;
        }
    }
}
?>