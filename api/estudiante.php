<?php

require_once __DIR__ . '/utils.php';
require_once __DIR__ . '/../config/db_config.php';
require_once __DIR__ . '/../models/Estudiante.php';

session_start();

if (!isset($_SESSION['userType'])) {
    sendResponse(["error" => "Autenticación requerida"], 401);
}

$userType = $_SESSION['userType'];

$database = new Database();
$db = $database->getConnection();

$estudiante = new Estudiante($db);

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($estudiante, $userType);
        break;
        
    case 'POST':
        handlePost($estudiante, $userType);
        break;
        
    case 'PUT':
        handlePut($estudiante, $userType);
        break;
        
    case 'DELETE':
        handleDelete($estudiante, $userType);
        break;
        
    default:
        sendResponse(["error" => "Método no permitido"], 405);
}

function handleGet($estudiante, $userType) {

    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        $result = $estudiante->getById($id);
        
        if (!$result || isset($result['error'])) {
            sendResponse(["error" => "Estudiante no encontrado"], 404);
        }
        
        sendResponse($result);
    } 
    elseif (isset($_GET['withMatriculas'])) {
        $id = isset($_GET['withMatriculas']) && is_numeric($_GET['withMatriculas']) 
              ? $_GET['withMatriculas'] : null;
        
        $result = $estudiante->getWithMatriculas($id);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    elseif (isset($_GET['search'])) {
        $criteria = [];
        
        if (isset($_GET['nombre'])) {
            $criteria['nombre'] = $_GET['nombre'];
        }
        
        if (isset($_GET['apellido'])) {
            $criteria['apellido'] = $_GET['apellido'];
        }
        
        $result = $estudiante->search($criteria);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    else {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        
        $result = $estudiante->getAll($limit, $offset);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
}

function handlePost($estudiante, $userType) {
    if ($userType !== 'dba_colegio' && $userType !== 'profesor_guia') {
        sendResponse(["error" => "No tiene permisos para crear estudiantes"], 403);
    }
    
    $data = getJsonData();
    
    $result = $estudiante->create($data);
    
    if (isset($result['error'])) {
        sendResponse($result, 400);
    }
    
    sendResponse($result, 201);
}

function handlePut($estudiante, $userType) {
    if ($userType !== 'dba_colegio' && $userType !== 'profesor_guia') {
        sendResponse(["error" => "No tiene permisos para modificar estudiantes"], 403);
    }

    if (!isset($_GET['id'])) {
        sendResponse(["error" => "Se requiere ID de estudiante"], 400);
    }
    
    $id = $_GET['id'];

    $exist = $estudiante->getById($id);
    if (!$exist || isset($exist['error'])) {
        sendResponse(["error" => "Estudiante no encontrado"], 404);
    }

    $data = getJsonData();
    
    $result = $estudiante->update($id, $data);
    
    if (isset($result['error'])) {
        sendResponse($result, 400);
    }
    
    sendResponse($result);
}

function handleDelete($estudiante, $userType) {
    if ($userType !== 'dba_colegio') {
        sendResponse(["error" => "No tiene permisos para eliminar estudiantes"], 403);
    }

    if (!isset($_GET['id'])) {
        sendResponse(["error" => "Se requiere ID de estudiante"], 400);
    }
    
    $id = $_GET['id'];

    $exist = $estudiante->getById($id);
    if (!$exist || isset($exist['error'])) {
        sendResponse(["error" => "Estudiante no encontrado"], 404);
    }

    $result = $estudiante->delete($id);
    
    if (isset($result['error'])) {
        sendResponse($result, 500);
    }
    
    sendResponse($result);
}