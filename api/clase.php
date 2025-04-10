<?php

require_once __DIR__ . '/utils.php';
require_once __DIR__ . '/../config/db_config.php';
require_once __DIR__ . '/../models/Clase.php';

session_start();

if (!isset($_SESSION['userType'])) {
    sendResponse(["error" => "Autenticación requerida"], 401);
}

$userType = $_SESSION['userType'];

$database = new Database();
$db = $database->getConnection();

$clase = new Clase($db);

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($clase, $userType);
        break;
        
    case 'POST':
        handlePost($clase, $userType);
        break;
        
    case 'PUT':
        handlePut($clase, $userType);
        break;
        
    case 'DELETE':
        handleDelete($clase, $userType);
        break;
        
    default:
        sendResponse(["error" => "Método no permitido"], 405);
}

function handleGet($clase, $userType) {
    
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        $result = $clase->getById($id);
        
        if (!$result || isset($result['error'])) {
            sendResponse(["error" => "Clase no encontrada"], 404);
        }
        
        sendResponse($result);
    } 
    elseif (isset($_GET['withDetails'])) {
        $id = isset($_GET['withDetails']) && is_numeric($_GET['withDetails']) 
              ? $_GET['withDetails'] : null;
        
        $result = $clase->getWithDetails($id);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    elseif (isset($_GET['curso'])) {
        $curso_id = $_GET['curso'];
        
        $result = $clase->getByCurso($curso_id);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    elseif (isset($_GET['profesor'])) {
        $profesor_id = $_GET['profesor'];
        
        $result = $clase->getByProfesor($profesor_id);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    elseif (isset($_GET['aula'])) {
        $aula_id = $_GET['aula'];
        
        $result = $clase->getByAula($aula_id);
        
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
        
        $result = $clase->search($criteria);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    else {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        
        $result = $clase->getAll($limit, $offset);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
}

function handlePost($clase, $userType) {
    if ($userType !== 'dba_colegio' && $userType !== 'profesor_guia') {
        sendResponse(["error" => "No tiene permisos para crear clases"], 403);
    }
    
    $data = getJsonData();

    $result = $clase->create($data);
    
    if (isset($result['error'])) {
        sendResponse($result, 400);
    }
    
    sendResponse($result, 201);
}

function handlePut($clase, $userType) {
    if ($userType !== 'dba_colegio') {
        sendResponse(["error" => "No tiene permisos para modificar clases"], 403);
    }
    
    if (!isset($_GET['id'])) {
        sendResponse(["error" => "Se requiere ID de clase"], 400);
    }
    
    $id = $_GET['id'];
    
    $exist = $clase->getById($id);
    if (!$exist || isset($exist['error'])) {
        sendResponse(["error" => "Clase no encontrada"], 404);
    }
    
    $data = getJsonData();
    
    $result = $clase->update($id, $data);
    
    if (isset($result['error'])) {
        sendResponse($result, 400);
    }
    
    sendResponse($result);
}

function handleDelete($clase, $userType) {
    if ($userType !== 'dba_colegio') {
        sendResponse(["error" => "No tiene permisos para eliminar clases"], 403);
    }
    
    if (!isset($_GET['id'])) {
        sendResponse(["error" => "Se requiere ID de clase"], 400);
    }
    
    $id = $_GET['id'];

    $exist = $clase->getById($id);
    if (!$exist || isset($exist['error'])) {
        sendResponse(["error" => "Clase no encontrada"], 404);
    }

    $result = $clase->delete($id);
    
    if (isset($result['error'])) {
        sendResponse($result, 500);
    }
    
    sendResponse($result);
}
?>