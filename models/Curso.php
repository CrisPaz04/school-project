<?php
// models/Curso.php
// Clase para el modelo de Curso

require_once __DIR__ . '/BaseModel.php';

class Curso extends BaseModel {
    // Constructor
    public function __construct($db) {
        parent::__construct($db);
        $this->table_name = "CURSO";
        $this->primary_key = "ID_curso";
        $this->fillable = [
            "nombre",
            "ano_academico",
            "ID_profesor_guia"
        ];
    }
    
    // Validación de datos
    public function validate($data) {
        $errors = [];
        
        // Validar nombre
        if (empty($data['nombre'])) {
            $errors[] = "El nombre es obligatorio";
        } elseif (strlen($data['nombre']) > 30) {
            $errors[] = "El nombre no puede exceder 30 caracteres";
        }
        
        // Validar ano_academico
        if (empty($data['ano_academico'])) {
            $errors[] = "El año académico es obligatorio";
        } elseif (!is_numeric($data['ano_academico']) || 
                  intval($data['ano_academico']) < 2000 || 
                  intval($data['ano_academico']) > 2100) {
            $errors[] = "El año académico debe ser un número entre 2000 y 2100";
        }
        
        // Validar ID_profesor_guia
        if (empty($data['ID_profesor_guia'])) {
            $errors[] = "El profesor guía es obligatorio";
        } else {
            // Verificar que el profesor existe
            try {
                $query = "SELECT COUNT(*) as count FROM PROFESOR WHERE ID_empleado = :id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':id', $data['ID_profesor_guia']);
                $stmt->execute();
                $result = $stmt->fetch();
                
                if ($result['count'] == 0) {
                    $errors[] = "El profesor guía seleccionado no existe";
                }
            } catch(PDOException $e) {
                $errors[] = "Error al validar profesor guía: " . $e->getMessage();
            }
        }
        
        if (!empty($errors)) {
            return ["error" => implode(", ", $errors)];
        }
        
        return ["success" => true];
    }
    
    // Métodos específicos para Curso
    
    // Obtener cursos con información de profesor guía
    public function getWithProfesorGuia($id = null) {
        try {
            $where_clause = $id ? "WHERE c.{$this->primary_key} = :id" : "";
            
            $query = "SELECT c.*, e.nombre as profesor_nombre, e.apellido as profesor_apellido
                     FROM {$this->table_name} c
                     JOIN PROFESOR p ON c.ID_profesor_guia = p.ID_empleado
                     JOIN EMPLEADO e ON p.ID_empleado = e.ID_empleado
                     {$where_clause}
                     ORDER BY c.ano_academico DESC, c.nombre";
            
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
    
    // Obtener cursos por año académico
    public function getByAnoAcademico($ano) {
        try {
            $query = "SELECT c.*, e.nombre as profesor_nombre, e.apellido as profesor_apellido
                     FROM {$this->table_name} c
                     JOIN PROFESOR p ON c.ID_profesor_guia = p.ID_empleado
                     JOIN EMPLEADO e ON p.ID_empleado = e.ID_empleado
                     WHERE c.ano_academico = :ano
                     ORDER BY c.nombre";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':ano', $ano);
            $stmt->execute();
            
            return $stmt->fetchAll();
        } catch(PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
    
    // Obtener cursos por profesor guía
    public function getByProfesorGuia($profesor_id) {
        try {
            $query = "SELECT c.*
                     FROM {$this->table_name} c
                     WHERE c.ID_profesor_guia = :id
                     ORDER BY c.ano_academico DESC, c.nombre";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $profesor_id);
            $stmt->execute();
            
            return $stmt->fetchAll();
        } catch(PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
}
?>