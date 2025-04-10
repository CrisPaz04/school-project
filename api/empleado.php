<?php

require_once __DIR__ . '/utils.php';
require_once __DIR__ . '/../config/db_config.php';
require_once __DIR__ . '/../models/Empleado.php';

session_start();

if (!isset($_SESSION['userType'])) {
    sendResponse(["error" => "Autenticación requerida"], 401);
}

$userType = $_SESSION['userType'];

$database = new Database();
$db = $database->getConnection();

$empleado = new Empleado($db);

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($empleado, $userType);
        break;
        
    case 'POST':
        handlePost($empleado, $userType);
        break;
        
    case 'PUT':
        handlePut($empleado, $userType);
        break;
        
    case 'DELETE':
        handleDelete($empleado, $userType);
        break;
        
    default:
        sendResponse(["error" => "Método no permitido"], 405);
}

function handleGet($empleado, $userType) {

    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        $result = $empleado->getById($id);
        
        if (!$result || isset($result['error'])) {
            sendResponse(["error" => "Empleado no encontrado"], 404);
        }
        
        sendResponse($result);
    } 
    elseif (isset($_GET['noProfesor'])) {
        $result = $empleado->getEmpleadosNoProfesor();
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    elseif (isset($_GET['profesores'])) {
        $result = $empleado->getEmpleadosProfesores();
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    elseif (isset($_GET['search'])) {
        if (!isset($_GET['name'])) {
            sendResponse(["error" => "Parámetro de búsqueda requerido"], 400);
        }
        
        $result = $empleado->searchByName($_GET['name']);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    else {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        
        $result = $empleado->getAll($limit, $offset);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
}

function handlePost($empleado, $userType) {
    if ($userType !== 'dba_colegio') {
        sendResponse(["error" => "No tiene permisos para crear empleados"], 403);
    }
    
    $data = getJsonData();
    
    $result = $empleado->create($data);
    
    if (isset($result['error'])) {
        sendResponse($result, 400);
    }
    
    sendResponse($result, 201);
}

function handlePut($empleado, $userType) {
    if ($userType !== 'dba_colegio') {
        sendResponse(["error" => "No tiene permisos para modificar empleados"], 403);
    }

    if (!isset($_GET['id'])) {
        sendResponse(["error" => "Se requiere ID de empleado"], 400);
    }
    
    $id = $_GET['id'];
    
    $exist = $empleado->getById($id);
    if (!$exist || isset($exist['error'])) {
        sendResponse(["error" => "Empleado no encontrado"], 404);
    }
    
    $data = getJsonData();
    
    $result = $empleado->update($id, $data);
    
    if (isset($result['error'])) {
        sendResponse($result, 400);
    }
    
    sendResponse($result);
}

function handleDelete($empleado, $userType) {
    if ($userType !== 'dba_colegio') {
        sendResponse(["error" => "No tiene permisos para eliminar empleados"], 403);
    }

    if (!isset($_GET['id'])) {
        sendResponse(["error" => "Se requiere ID de empleado"], 400);
    }
    
    $id = $_GET['id'];
    
    $exist = $empleado->getById($id);
    if (!$exist || isset($exist['error'])) {
        sendResponse(["error" => "Empleado no encontrado"], 404);
    }
    
    $result = $empleado->delete($id);
    
    if (isset($result['error'])) {
        sendResponse($result, 500);
    }
    
    sendResponse($result);
}
?>