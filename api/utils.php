<?php

function checkMethod($method) {
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        http_response_code(405); 
        echo json_encode(["error" => "Método no permitido"]);
        exit;
    }
}

function getJsonData() {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400); 
        echo json_encode(["error" => "JSON inválido: " . json_last_error_msg()]);
        exit;
    }
    
    return $data;
}

function checkAuth() {
    session_start();
    
    if (!isset($_SESSION['userType'])) {
        http_response_code(401);
        echo json_encode(["error" => "Autenticación requerida"]);
        exit;
    }
    
    return $_SESSION['userType'];
}

function checkPermission($userType, $requiredPermissions) {
    $permissions = [
        'dba_colegio' => ['create', 'read', 'update', 'delete'],
        'profesor_guia' => ['create_estudiante', 'read', 'update_estudiante']
    ];

    if ($userType === 'dba_colegio') {
        return true;
    }

    if (!isset($permissions[$userType])) {
        return false;
    }
    
    foreach ($requiredPermissions as $permission) {
        if (!in_array($permission, $permissions[$userType])) {
            return false;
        }
    }
    
    return true;
}

function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
?>