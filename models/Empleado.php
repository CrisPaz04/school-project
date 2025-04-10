<?php
// models/Empleado.php
// Clase para el modelo de Empleado

require_once __DIR__ . '/BaseModel.php';

class Empleado extends BaseModel {
    // Constructor
    public function __construct($db) {
        parent::__construct($db);
        $this->table_name = "EMPLEADO";
        $this->primary_key = "ID_empleado";
        $this->fillable = [
            "nombre",
            "apellido",
            "fecha_nacimiento",
            "direccion",
            "telefono",
            "correo",
            "fecha_contratacion",
            "salario"
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
        
        // Validar direccion
        if (empty($data['direccion'])) {
            $errors[] = "La dirección es obligatoria";
        } elseif (strlen($data['direccion']) > 100) {
            $errors[] = "La dirección no puede exceder 100 caracteres";
        }
        
        // Validar telefono
        if (empty($data['telefono'])) {
            $errors[] = "El teléfono es obligatorio";
        } elseif (strlen($data['telefono']) > 15) {
            $errors[] = "El teléfono no puede exceder 15 caracteres";
        }
        
        // Validar correo
        if (empty($data['correo'])) {
            $errors[] = "El correo electrónico es obligatorio";
        } elseif (!filter_var($data['correo'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = "El formato del correo electrónico es inválido";
        } elseif (strlen($data['correo']) > 50) {
            $errors[] = "El correo no puede exceder 50 caracteres";
        }
        
        // Validar fecha_contratacion
        if (empty($data['fecha_contratacion'])) {
            $errors[] = "La fecha de contratación es obligatoria";
        } else {
            $fecha = date_create_from_format('Y-m-d', $data['fecha_contratacion']);
            if (!$fecha || date_format($fecha, 'Y-m-d') !== $data['fecha_contratacion']) {
                $errors[] = "Formato de fecha inválido (YYYY-MM-DD)";
            }
        }
        
        // Validar salario
        if (!isset($data['salario'])) {
            $errors[] = "El salario es obligatorio";
        } elseif (!is_numeric($data['salario']) || $data['salario'] <= 0) {
            $errors[] = "El salario debe ser un número positivo";
        }
        
        if (!empty($errors)) {
            return ["error" => implode(", ", $errors)];
        }
        
        return ["success" => true];
    }
    
    // Métodos específicos para Empleado
    
    // Obtener empleados que no son profesores
    public function getEmpleadosNoProfesor() {
        try {
            $query = "SELECT e.* 
                      FROM {$this->table_name} e 
                      LEFT JOIN PROFESOR p ON e.ID_empleado = p.ID_empleado 
                      WHERE p.ID_empleado IS NULL 
                      ORDER BY e.apellido, e.nombre";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            return $stmt->fetchAll();
        } catch(PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
    
    // Obtener empleados que son profesores
    public function getEmpleadosProfesores() {
        try {
            $query = "SELECT e.*, p.especialidad, p.nivel_academico, p.anos_experiencia 
                      FROM {$this->table_name} e 
                      JOIN PROFESOR p ON e.ID_empleado = p.ID_empleado 
                      ORDER BY e.apellido, e.nombre";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            return $stmt->fetchAll();
        } catch(PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
    
    // Buscar por nombre o apellido
    public function searchByName($search) {
        try {
            $search = "%{$search}%";
            
            $query = "SELECT * FROM {$this->table_name} 
                      WHERE nombre LIKE :search OR apellido LIKE :search 
                      ORDER BY apellido, nombre";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':search', $search);
            $stmt->execute();
            
            return $stmt->fetchAll();
        } catch(PDOException $e) {
            return ["error" => $e->getMessage()];
        }
    }
}
?>