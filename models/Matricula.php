<?php
// models/Matricula.php
// Clase para el modelo de Matrícula

require_once __DIR__ . '/BaseModel.php';

class Matricula extends BaseModel {
    // Constructor
    public function __construct($db) {
        parent::__construct($db);
        $this->table_name = "MATRICULA";
        $this->primary_key = "ID_matricula";
        $this->fillable = [
            "ID_estudiante",
            "ID_curso",
            "fecha_matricula",
            "ano_academico",
            "estado"
        ];
    }
    
    // Validación de datos
    public function validate($data) {
        $errors = [];
        
        // Validar ID_estudiante
        if (empty($data['ID_estudiante'])) {
            $errors[] = "El estudiante es obligatorio";
        } else {
            // Verificar que el estudiante existe
            try {
                $query = "SELECT COUNT(*) as count FROM ESTUDIANTE WHERE ID_estudiante = :id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':id', $data['ID_estudiante']);
                $stmt->execute();
                $result = $stmt->fetch();
                
                if ($result['count'] == 0) {
                    $errors[] = "El estudiante seleccionado no existe";
                }
            } catch(PDOException $e) {
                $errors[] = "Error al validar estudiante: " . $e->getMessage();
            }
        }
        
        // Validar ID_curso
        if (empty($data['ID_curso'])) {
            $errors[] = "El curso es obligatorio";
        } else {
            // Verificar que el curso existe
            try {
                $query = "SELECT COUNT(*) as count FROM CURSO WHERE ID_curso = :id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':id', $data['ID_curso']);
                $stmt->execute();
                $result = $stmt->fetch();
                
                if ($result['count'] == 0) {
                    $errors[] = "El curso seleccionado no existe";
                }
            } catch(PDOException $e) {
                $errors[] = "Error al validar curso: " . $e->getMessage();
            }
        }
        
        // Validar fecha_matricula
        if (empty($data['fecha_matricula'])) {
            $errors[] = "La fecha de matrícula es obligatoria";
        } else {
            $fecha = date_create_from_format('Y-m-d', $data['fecha_matricula']);
            if (!$fecha || date_format($fecha, 'Y-m-d') !== $data['fecha_matricula']) {
                $errors[] = "Formato de fecha inválido (YYYY-MM-DD)";
            }
        }
        
        // Validar ano_academico
        if (empty($data['ano_academico'])) {
            $errors[] = "El año académico es obligatorio";
        } else {
            // Verificar que es un año válido
            if (!is_numeric($data['ano_academico']) || 
                $data['ano_academico'] < 2000 || 
                $data['ano_academico'] > 2100) {
                $errors[] = "El año académico debe estar entre 2000 y 2100";
            }
        }
        
        // Validar estado
        if (empty($data['estado'])) {
            $errors[] = "El estado es obligatorio";
        } else {
            if (!in_array($data['estado'], ['Activo', 'Inactivo'])) {
                $errors[] = "El estado debe ser 'Activo' o 'Inactivo'";
            }
        }
        
        // Validar matrícula duplicada
        if (!empty($data['ID_estudiante']) && !empty($data['ID_curso']) && !empty($data['ano_academico'])) {
            try {
                $query = "SELECT COUNT(*) as count FROM MATRICULA 
                         WHERE ID_estudiante = :estudiante 
                         AND ID_curso = :curso 
                         AND ano_academico = :ano";
                         
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':estudiante', $data['ID_estudiante']);
                $stmt->bindParam(':curso', $data['ID_curso']);
                $stmt->bindParam(':ano', $data['ano_academico']);
                $stmt->execute();
                $result = $stmt->fetch();
                
                if ($result['count'] > 0) {
                    $errors[] = "Ya existe una matrícula para este estudiante en este curso y año académico";
                }
            } catch(PDOException $e) {
                $errors[] = "Error al validar duplicados: " . $e->getMessage();
            }
        }
        
        if (!empty($errors)) {
            return ["error" => implode(", ", $errors)];
        }
        
        return ["success" => true];
    }
    
    // Métodos específicos para Matrícula
    
    // Obtener matrículas con información detallada
    public function getDetailed($id = null) {
        try {
            $where_clause = $id ? "WHERE m.{$this->primary_key} = :id" : "";
            
            $query = "SELECT m.*, 
                     e.nombre as estudiante_nombre, e.apellido as estudiante_apellido,
                     c.nombre as curso_nombre, c.ano_academico as curso_ano
                     FROM {$this->table_name} m
                     JOIN ESTUDIANTE e ON m.ID_estudiante = e.ID_estudiante
                     JOIN CURSO c ON m.ID_curso = c.ID_curso
                     {$where_clause}
                     ORDER BY m.ano_academico DESC, e.apellido, e.nombre";
            
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
    
    // Obtener matrículas por estudiante
    public function getByEstudiante($estudiante_id) {
        try {
            $query = "SELECT m.*, 
                     c.nombre as curso_nombre, c.ano_academico as curso_ano
                     FROM {$this->table_name} m
                     JOIN CURSO c ON m.ID_curso = c.ID_curso
                     WHERE m.ID_estudiante = :id
                     ORDER BY m.ano_academico DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $estudiante_id);
            $stmt->execute();
            
            return $stmt->fetchAll();
        } catch(PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
    
    // Obtener matrículas por curso
    public function getByCurso($curso_id) {
        try {
            $query = "SELECT m.*, 
                     e.nombre as estudiante_nombre, e.apellido as estudiante_apellido
                     FROM {$this->table_name} m
                     JOIN ESTUDIANTE e ON m.ID_estudiante = e.ID_estudiante
                     WHERE m.ID_curso = :id
                     ORDER BY e.apellido, e.nombre";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $curso_id);
            $stmt->execute();
            
            return $stmt->fetchAll();
        } catch(PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
}
?>