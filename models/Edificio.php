<?php
// models/Edificio.php
// Clase para el modelo de Edificio

require_once __DIR__ . '/BaseModel.php';

class Edificio extends BaseModel {
    // Constructor
    public function __construct($db) {
        parent::__construct($db);
        $this->table_name = "EDIFICIO";
        $this->primary_key = "ID_edificio";
        $this->fillable = [
            "nombre",
            "ubicacion",
            "num_pisos"
        ];
    }
    
    // Validación de datos
    public function validate($data) {
        $errors = [];
        
        // Validar nombre
        if (empty($data['nombre'])) {
            $errors[] = "El nombre es obligatorio";
        } elseif (strlen($data['nombre']) > 50) {
            $errors[] = "El nombre no puede exceder 50 caracteres";
        }
        
        // Validar ubicacion
        if (empty($data['ubicacion'])) {
            $errors[] = "La ubicación es obligatoria";
        } elseif (strlen($data['ubicacion']) > 100) {
            $errors[] = "La ubicación no puede exceder 100 caracteres";
        }
        
        // Validar num_pisos
        if (!isset($data['num_pisos'])) {
            $errors[] = "El número de pisos es obligatorio";
        } elseif (!is_numeric($data['num_pisos']) || intval($data['num_pisos']) <= 0) {
            $errors[] = "El número de pisos debe ser un número positivo";
        }
        
        if (!empty($errors)) {
            return ["error" => implode(", ", $errors)];
        }
        
        return ["success" => true];
    }
    
    // Métodos específicos para Edificio
    
    // Obtener edificios con información de aulas
    public function getWithAulas($id = null) {
        try {
            $where_clause = $id ? "WHERE e.{$this->primary_key} = :id" : "";
            
            $query = "SELECT e.*, COUNT(a.ID_aula) as num_aulas
                     FROM {$this->table_name} e
                     LEFT JOIN AULA a ON e.ID_edificio = a.ID_edificio
                     {$where_clause}
                     GROUP BY e.ID_edificio
                     ORDER BY e.nombre";
            
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
}
?>