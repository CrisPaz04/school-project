<?php
// models/Clase.php
// Clase para el modelo de Clase

require_once __DIR__ . '/BaseModel.php';

class Clase extends BaseModel {
    // Constructor
    public function __construct($db) {
        parent::__construct($db);
        $this->table_name = "CLASE";
        $this->primary_key = "ID_clase";
        $this->fillable = [
            "nombre",
            "descripcion",
            "ID_curso",
            "ID_profesor",
            "ID_aula",
            "horario",
            "creditos"
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
        
        // Validar ID_profesor
        if (empty($data['ID_profesor'])) {
            $errors[] = "El profesor es obligatorio";
        } else {
            // Verificar que el profesor existe
            try {
                $query = "SELECT COUNT(*) as count FROM PROFESOR WHERE ID_empleado = :id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':id', $data['ID_profesor']);
                $stmt->execute();
                $result = $stmt->fetch();
                
                if ($result['count'] == 0) {
                    $errors[] = "El profesor seleccionado no existe";
                }
            } catch(PDOException $e) {
                $errors[] = "Error al validar profesor: " . $e->getMessage();
            }
        }
        
        // Validar ID_aula
        if (empty($data['ID_aula'])) {
            $errors[] = "El aula es obligatoria";
        } else {
            // Verificar que el aula existe
            try {
                $query = "SELECT COUNT(*) as count FROM AULA WHERE ID_aula = :id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':id', $data['ID_aula']);
                $stmt->execute();
                $result = $stmt->fetch();
                
                if ($result['count'] == 0) {
                    $errors[] = "El aula seleccionada no existe";
                }
            } catch(PDOException $e) {
                $errors[] = "Error al validar aula: " . $e->getMessage();
            }
        }
        
        // Validar horario
        if (empty($data['horario'])) {
            $errors[] = "El horario es obligatorio";
        } elseif (strlen($data['horario']) > 50) {
            $errors[] = "El horario no puede exceder 50 caracteres";
        }
        
        // Validar créditos
        if (!isset($data['creditos'])) {
            $errors[] = "Los créditos son obligatorios";
        } elseif (!is_numeric($data['creditos']) || intval($data['creditos']) <= 0) {
            $errors[] = "Los créditos deben ser un número positivo";
        }
        
        if (!empty($errors)) {
            return ["error" => implode(", ", $errors)];
        }
        
        return ["success" => true];
    }
    
    // Métodos específicos para Clase
    
    // Obtener clases con información detallada
    public function getWithDetails($id = null) {
        try {
            $where_clause = $id ? "WHERE cl.{$this->primary_key} = :id" : "";
            
            $query = "SELECT cl.*, c.nombre as curso_nombre, 
                     p.especialidad, emp.nombre as profesor_nombre, emp.apellido as profesor_apellido,
                     a.numero as aula_numero, e.nombre as edificio_nombre
                     FROM {$this->table_name} cl
                     JOIN CURSO c ON cl.ID_curso = c.ID_curso
                     JOIN PROFESOR p ON cl.ID_profesor = p.ID_empleado
                     JOIN EMPLEADO emp ON p.ID_empleado = emp.ID_empleado
                     JOIN AULA a ON cl.ID_aula = a.ID_aula
                     JOIN EDIFICIO e ON a.ID_edificio = e.ID_edificio
                     {$where_clause}
                     ORDER BY c.nombre, cl.nombre";
            
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
    
    // Obtener clases por curso
    public function getByCurso($curso_id) {
        try {
            $query = "SELECT cl.*, p.especialidad, emp.nombre as profesor_nombre, 
                     emp.apellido as profesor_apellido, a.numero as aula_numero
                     FROM {$this->table_name} cl
                     JOIN PROFESOR p ON cl.ID_profesor = p.ID_empleado
                     JOIN EMPLEADO emp ON p.ID_empleado = emp.ID_empleado
                     JOIN AULA a ON cl.ID_aula = a.ID_aula
                     WHERE cl.ID_curso = :id
                     ORDER BY cl.nombre";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $curso_id);
            $stmt->execute();
            
            return $stmt->fetchAll();
        } catch(PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
    
    // Obtener clases por profesor
    public function getByProfesor($profesor_id) {
        try {
            $query = "SELECT cl.*, c.nombre as curso_nombre, a.numero as aula_numero
                     FROM {$this->table_name} cl
                     JOIN CURSO c ON cl.ID_curso = c.ID_curso
                     JOIN AULA a ON cl.ID_aula = a.ID_aula
                     WHERE cl.ID_profesor = :id
                     ORDER BY c.nombre, cl.nombre";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $profesor_id);
            $stmt->execute();
            
            return $stmt->fetchAll();
        } catch(PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
    
    // Obtener clases por aula
    public function getByAula($aula_id) {
        try {
            $query = "SELECT cl.*, c.nombre as curso_nombre, 
                     emp.nombre as profesor_nombre, emp.apellido as profesor_apellido
                     FROM {$this->table_name} cl
                     JOIN CURSO c ON cl.ID_curso = c.ID_curso
                     JOIN PROFESOR p ON cl.ID_profesor = p.ID_empleado
                     JOIN EMPLEADO emp ON p.ID_empleado = emp.ID_empleado
                     WHERE cl.ID_aula = :id
                     ORDER BY cl.horario";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $aula_id);
            $stmt->execute();
            
            return $stmt->fetchAll();
        } catch(PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
}
?>