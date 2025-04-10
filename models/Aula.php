<?php
// models/Aula.php
// Clase para el modelo de Aula

require_once __DIR__ . '/BaseModel.php';

class Aula extends BaseModel {
    // Constructor
    public function __construct($db) {
        parent::__construct($db);
        $this->table_name = "AULA";
        $this->primary_key = "ID_aula";
        $this->fillable = [
            "numero",
            "capacidad",
            "tipo",
            "ID_edificio"
        ];
    }
    
    // Validación de datos
    public function validate($data) {
        $errors = [];
        
        // Validar numero
        if (empty($data['numero'])) {
            $errors[] = "El número de aula es obligatorio";
        } elseif (strlen($data['numero']) > 10) {
            $errors[] = "El número de aula no puede exceder 10 caracteres";
        }
        
        // Validar capacidad
        if (!isset($data['capacidad'])) {
            $errors[] = "La capacidad es obligatoria";
        } elseif (!is_numeric($data['capacidad']) || intval($data['capacidad']) <= 0) {
            $errors[] = "La capacidad debe ser un número positivo";
        }
        
        // Validar tipo
        if (empty($data['tipo'])) {
            $errors[] = "El tipo de aula es obligatorio";
        } elseif (strlen($data['tipo']) > 20) {
            $errors[] = "El tipo de aula no puede exceder 20 caracteres";
        }
        
        // Validar ID_edificio
        if (empty($data['ID_edificio'])) {
            $errors[] = "El edificio es obligatorio";
        } else {
            // Verificar que el edificio existe
            try {
                $query = "SELECT COUNT(*) as count FROM EDIFICIO WHERE ID_edificio = :id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':id', $data['ID_edificio']);
                $stmt->execute();
                $result = $stmt->fetch();
                
                if ($result['count'] == 0) {
                    $errors[] = "El edificio seleccionado no existe";
                }
            } catch(PDOException $e) {
                $errors[] = "Error al validar edificio: " . $e->getMessage();
            }
        }
        
        if (!empty($errors)) {
            return ["error" => implode(", ", $errors)];
        }
        
        return ["success" => true];
    }
    
    // Métodos específicos para Aula
    
    // Obtener aulas con información de edificio
    public function getWithEdificio($id = null) {
        try {
            $where_clause = $id ? "WHERE a.{$this->primary_key} = :id" : "";
            
            $query = "SELECT a.*, e.nombre as edificio_nombre, e.ubicacion as edificio_ubicacion
                     FROM {$this->table_name} a
                     JOIN EDIFICIO e ON a.ID_edificio = e.ID_edificio
                     {$where_clause}
                     ORDER BY e.nombre, a.numero";
            
            $stmt = $this->conn->prepare($query);
            
            if ($id) {
                $stmt->bindParam(':id', $id);
            }
            
            $stmt->execute();
            
            return $stmt->fetchAll();
        } catch(PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
    
    // Obtener aulas por edificio
    public function getByEdificio($edificio_id) {
        try {
            $query = "SELECT a.*
                     FROM {$this->table_name} a
                     WHERE a.ID_edificio = :id
                     ORDER BY a.numero";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $edificio_id);
            $stmt->execute();
            
            return $stmt->fetchAll();
        } catch(PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
    
    // Obtener aulas por tipo
    public function getByTipo($tipo) {
        try {
            $query = "SELECT a.*, e.nombre as edificio_nombre
                     FROM {$this->table_name} a
                     JOIN EDIFICIO e ON a.ID_edificio = e.ID_edificio
                     WHERE a.tipo LIKE :tipo
                     ORDER BY e.nombre, a.numero";
            
            $tipo_param = "%{$tipo}%";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':tipo', $tipo_param);
            $stmt->execute();
            
            return $stmt->fetchAll();
        } catch(PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
    
    // Obtener aulas por capacidad mínima
    public function getByCapacidadMinima($capacidad) {
        try {
            $query = "SELECT a.*, e.nombre as edificio_nombre
                     FROM {$this->table_name} a
                     JOIN EDIFICIO e ON a.ID_edificio = e.ID_edificio
                     WHERE a.capacidad >= :capacidad
                     ORDER BY a.capacidad DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':capacidad', $capacidad);
            $stmt->execute();
            
            return $stmt->fetchAll();
        } catch(PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
}
?>