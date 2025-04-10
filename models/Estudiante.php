<?php
// models/Estudiante.php
// Clase para el modelo de Estudiante

require_once __DIR__ . '/BaseModel.php';

class Estudiante extends BaseModel {
    // Constructor
    public function __construct($db) {
        parent::__construct($db);
        $this->table_name = "ESTUDIANTE";
        $this->primary_key = "ID_estudiante";
        $this->fillable = [
            "nombre",
            "apellido",
            "fecha_nacimiento",
            "direccion",
            "telefono",
            "correo",
            "nombre_encargado"
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
        
        // Validar apellido
        if (empty($data['apellido'])) {
            $errors[] = "El apellido es obligatorio";
        } elseif (strlen($data['apellido']) > 50) {
            $errors[] = "El apellido no puede exceder 50 caracteres";
        }
        
        // Validar fecha_nacimiento
        if (empty($data['fecha_nacimiento'])) {
            $errors[] = "La fecha de nacimiento es obligatoria";
        } else {
            $fecha = date_create_from_format('Y-m-d', $data['fecha_nacimiento']);
            if (!$fecha || date_format($fecha, 'Y-m-d') !== $data['fecha_nacimiento']) {
                $errors[] = "Formato de fecha inválido (YYYY-MM-DD)";
            }
        }
        
        // Validar dirección
        if (empty($data['direccion'])) {
            $errors[] = "La dirección es obligatoria";
        } elseif (strlen($data['direccion']) > 100) {
            $errors[] = "La dirección no puede exceder 100 caracteres";
        }
        
        // Validar nombre_encargado
        if (empty($data['nombre_encargado'])) {
            $errors[] = "El nombre del encargado es obligatorio";
        } elseif (strlen($data['nombre_encargado']) > 100) {
            $errors[] = "El nombre del encargado no puede exceder 100 caracteres";
        }
        
        // Validar correo (si existe)
        if (!empty($data['correo'])) {
            if (!filter_var($data['correo'], FILTER_VALIDATE_EMAIL)) {
                $errors[] = "El formato del correo electrónico es inválido";
            } elseif (strlen($data['correo']) > 50) {
                $errors[] = "El correo no puede exceder 50 caracteres";
            }
        }
        
        // Validar teléfono (si existe)
        if (!empty($data['telefono']) && strlen($data['telefono']) > 15) {
            $errors[] = "El teléfono no puede exceder 15 caracteres";
        }
        
        if (!empty($errors)) {
            return ["error" => implode(", ", $errors)];
        }
        
        return ["success" => true];
    }
    
    // Métodos específicos para Estudiante
    
    // Obtener estudiantes con sus matrículas
    public function getWithMatriculas($id = null) {
        try {
            $where_clause = $id ? "WHERE e.{$this->primary_key} = :id" : "";
            
            $query = "SELECT e.*, m.ID_matricula, m.ID_curso, m.fecha_matricula, m.ano_academico, m.estado, c.nombre as curso_nombre
                     FROM {$this->table_name} e
                     LEFT JOIN MATRICULA m ON e.{$this->primary_key} = m.ID_estudiante
                     LEFT JOIN CURSO c ON m.ID_curso = c.ID_curso
                     {$where_clause}
                     ORDER BY e.apellido, e.nombre, m.ano_academico DESC";
            
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