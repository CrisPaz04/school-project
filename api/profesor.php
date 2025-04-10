<?php

require_once __DIR__ . '/utils.php';
require_once __DIR__ . '/../config/db_config.php';
require_once __DIR__ . '/../models/Profesor.php';

session_start();

if (!isset($_SESSION['userType'])) {
    sendResponse(["error" => "Autenticación requerida"], 401);
}

$userType = $_SESSION['userType'];

$database = new Database();
$db = $database->getConnection();

$profesor = new Profesor($db);

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($profesor, $userType);
        break;
        
    case 'POST':
        handlePost($profesor, $userType);
        break;
        
    case 'PUT':
        handlePut($profesor, $userType);
        break;
        
    case 'DELETE':
        handleDelete($profesor, $userType);
        break;
        
    default:
        sendResponse(["error" => "Método no permitido"], 405);
}

function handleGet($profesor, $userType) {

    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        $result = $profesor->getById($id);
        
        if (!$result || isset($result['error'])) {
            sendResponse(["error" => "Profesor no encontrado"], 404);
        }
        
        sendResponse($result);
    } 
    elseif (isset($_GET['withEmpleadoInfo'])) {
        $id = isset($_GET['withEmpleadoInfo']) && is_numeric($_GET['withEmpleadoInfo']) 
              ? $_GET['withEmpleadoInfo'] : null;
        
        $result = $profesor->getWithEmpleadoInfo($id);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    elseif (isset($_GET['guias'])) {
        $result = $profesor->getProfesoresGuia();
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    elseif (isset($_GET['search'])) {
        $criteria = [];
        
        if (isset($_GET['especialidad'])) {
            $criteria['especialidad'] = $_GET['especialidad'];
        }
        
        if (isset($_GET['nivel_academico'])) {
            $criteria['nivel_academico'] = $_GET['nivel_academico'];
        }
        
        $result = $profesor->search($criteria);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    else {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        
        $result = $profesor->getAll($limit, $offset);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
}

function handlePost($profesor, $userType) {
    if ($userType !== 'dba_colegio') {
        sendResponse(["error" => "No tiene permisos para crear profesores"], 403);
    }
    
    $data = getJsonData();
    
    $result = $profesor->create($data);
    
    if (isset($result['error'])) {
        sendResponse($result, 400);
    }
    
    sendResponse($result, 201);
}

function handlePut($profesor, $userType) {
    if ($userType !== 'dba_colegio') {
        sendResponse(["error" => "No tiene permisos para modificar profesores"], 403);
    }

    if (!isset($_GET['id'])) {
        sendResponse(["error" => "Se requiere ID de profesor"], 400);
    }
    
    $id = $_GET['id'];

    $exist = $profesor->getById($id);
    if (!$exist || isset($exist['error'])) {
        sendResponse(["error" => "Profesor no encontrado"], 404);
    }

    $data = getJsonData();

    $result = $profesor->update($id, $data);
    
    if (isset($result['error'])) {
        sendResponse($result, 400);
    }
    
    sendResponse($result);
}

function handleDelete($profesor, $userType) {
    if ($userType !== 'dba_colegio') {
        sendResponse(["error" => "No tiene permisos para eliminar profesores"], 403);
    }

    if (!isset($_GET['id'])) {
        sendResponse(["error" => "Se requiere ID de profesor"], 400);
    }
    
    $id = $_GET['id'];

    $exist = $profesor->getById($id);
    if (!$exist || isset($exist['error'])) {
        sendResponse(["error" => "Profesor no encontrado"], 404);
    }

    $result = $profesor->delete($id);
    
    if (isset($result['error'])) {
        sendResponse($result, 500);
    }
    
    sendResponse($result);
}
?>
