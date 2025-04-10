<?php
// models/Profesor.php
// Clase para el modelo de Profesor

require_once __DIR__ . '/BaseModel.php';

class Profesor extends BaseModel {
    // Constructor
    public function __construct($db) {
        parent::__construct($db);
        $this->table_name = "PROFESOR";
        $this->primary_key = "ID_empleado";
        $this->fillable = [
            "ID_empleado",
            "especialidad",
            "nivel_academico",
            "anos_experiencia"
        ];
    }
    
    // Validación de datos
    public function validate($data) {
        $errors = [];
        
        // Validar ID_empleado
        if (empty($data['ID_empleado'])) {
            $errors[] = "El ID de empleado es obligatorio";
        } else {
            // Verificar que el empleado existe
            try {
                $query = "SELECT COUNT(*) as count FROM EMPLEADO WHERE ID_empleado = :id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':id', $data['ID_empleado']);
                $stmt->execute();
                $result = $stmt->fetch();
                
                if ($result['count'] == 0) {
                    $errors[] = "El empleado seleccionado no existe";
                }
            } catch(PDOException $e) {
                $errors[] = "Error al validar empleado: " . $e->getMessage();
            }
        }
        
        // Validar especialidad
        if (empty($data['especialidad'])) {
            $errors[] = "La especialidad es obligatoria";
        } elseif (strlen($data['especialidad']) > 50) {
            $errors[] = "La especialidad no puede exceder 50 caracteres";
        }
        
        // Validar nivel_academico
        if (empty($data['nivel_academico'])) {
            $errors[] = "El nivel académico es obligatorio";
        } elseif (strlen($data['nivel_academico']) > 30) {
            $errors[] = "El nivel académico no puede exceder 30 caracteres";
        }
        
        // Validar anos_experiencia
        if (!isset($data['anos_experiencia'])) {
            $errors[] = "Los años de experiencia son obligatorios";
        } elseif (!is_numeric($data['anos_experiencia']) || $data['anos_experiencia'] < 0) {
            $errors[] = "Los años de experiencia deben ser un número positivo";
        }
        
        if (!empty($errors)) {
            return ["error" => implode(", ", $errors)];
        }
        
        return ["success" => true];
    }
    
    // Métodos específicos para Profesor
    
    // Obtener profesores con información de empleado
    public function getWithEmpleadoInfo($id = null) {
        try {
            $where_clause = $id ? "WHERE p.{$this->primary_key} = :id" : "";
            
            $query = "SELECT p.*, e.nombre, e.apellido, e.correo, e.telefono
                     FROM {$this->table_name} p
                     JOIN EMPLEADO e ON p.{$this->primary_key} = e.ID_empleado
                     {$where_clause}
                     ORDER BY e.apellido, e.nombre";
            
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
    
    // Obtener profesores que son guías de curso
    public function getProfesoresGuia() {
        try {
            $query = "SELECT p.*, e.nombre, e.apellido, c.ID_curso, c.nombre as nombre_curso
                     FROM {$this->table_name} p
                     JOIN EMPLEADO e ON p.{$this->primary_key} = e.ID_empleado
                     JOIN CURSO c ON p.{$this->primary_key} = c.ID_profesor_guia
                     ORDER BY e.apellido, e.nombre";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            return $stmt->fetchAll();
        } catch(PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
}
?>