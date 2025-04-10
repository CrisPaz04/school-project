<?php
// models/BaseModel.php
// Clase base para operaciones CRUD genéricas

require_once __DIR__ . '/../config/db_config.php';

abstract class BaseModel {
    // Nombre de la tabla en la base de datos
    protected $table_name;
    
    // Nombre de la clave primaria
    protected $primary_key;
    
    // Campos permitidos para operaciones
    protected $fillable = [];
    
    // Conexión a la base de datos
    protected $conn;
    
    // Constructor
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Método abstracto para validar datos
    abstract public function validate($data);
    
    // Obtener todos los registros
    public function getAll($limit = 100, $offset = 0) {
        try {
            $query = "SELECT * FROM {$this->table_name} LIMIT :limit OFFSET :offset";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll();
        } catch(PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
    
    // Obtener un registro por ID
    public function getById($id) {
        try {
            $query = "SELECT * FROM {$this->table_name} WHERE {$this->primary_key} = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            return $stmt->fetch();
        } catch(PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
    
    // Crear un nuevo registro
    public function create($data) {
        // Validar datos
        $validation = $this->validate($data);
        if (isset($validation["error"])) {
            return $validation;
        }
        
        // Filtrar solo los campos permitidos
        $filtered_data = array_intersect_key($data, array_flip($this->fillable));
        
        // Construir consulta
        $fields = implode(', ', array_keys($filtered_data));
        $placeholders = ':' . implode(', :', array_keys($filtered_data));
        
        try {
            $query = "INSERT INTO {$this->table_name} ({$fields}) VALUES ({$placeholders})";
            $stmt = $this->conn->prepare($query);
            
            // Bind de parámetros
            foreach ($filtered_data as $key => $value) {
                $stmt->bindValue(":{$key}", $value);
            }
            
            $stmt->execute();
            $last_id = $this->conn->lastInsertId();
            
            return ["success" => true, "id" => $last_id];
        } catch(PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
    
    // Actualizar un registro existente
    public function update($id, $data) {
        // Validar datos
        $validation = $this->validate($data);
        if (isset($validation["error"])) {
            return $validation;
        }
        
        // Filtrar solo los campos permitidos
        $filtered_data = array_intersect_key($data, array_flip($this->fillable));
        
        // Construir consulta
        $set_clause = '';
        foreach (array_keys($filtered_data) as $key) {
            $set_clause .= "{$key} = :{$key}, ";
        }
        $set_clause = rtrim($set_clause, ', ');
        
        try {
            $query = "UPDATE {$this->table_name} SET {$set_clause} WHERE {$this->primary_key} = :id";
            $stmt = $this->conn->prepare($query);
            
            // Bind de parámetros
            foreach ($filtered_data as $key => $value) {
                $stmt->bindValue(":{$key}", $value);
            }
            $stmt->bindValue(':id', $id);
            
            $stmt->execute();
            
            return ["success" => true, "rows" => $stmt->rowCount()];
        } catch(PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
    
    // Eliminar un registro
    public function delete($id) {
        try {
            $query = "DELETE FROM {$this->table_name} WHERE {$this->primary_key} = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            return ["success" => true, "rows" => $stmt->rowCount()];
        } catch(PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
    
    // Buscar registros según criterios
    public function search($criteria = []) {
        // Construir cláusula WHERE
        $where_clause = '';
        $params = [];
        
        foreach ($criteria as $key => $value) {
            if (in_array($key, $this->fillable)) {
                $where_clause .= "{$key} LIKE :p_{$key} AND ";
                $params["p_{$key}"] = "%{$value}%";
            }
        }
        
        $where_clause = $where_clause ? 'WHERE ' . rtrim($where_clause, ' AND ') : '';
        
        try {
            $query = "SELECT * FROM {$this->table_name} {$where_clause}";
            $stmt = $this->conn->prepare($query);
            
            // Bind de parámetros
            foreach ($params as $key => $value) {
                $stmt->bindValue(":{$key}", $value);
            }
            
            $stmt->execute();
            
            return $stmt->fetchAll();
        } catch(PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
}
?>