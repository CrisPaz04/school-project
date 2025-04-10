<?php

require_once __DIR__ . '/utils.php';
require_once __DIR__ . '/../config/db_config.php';
require_once __DIR__ . '/../models/Aula.php';

session_start();

if (!isset($_SESSION['userType'])) {
    sendResponse(["error" => "Autenticación requerida"], 401);
}

$userType = $_SESSION['userType'];

$database = new Database();
$db = $database->getConnection();

$aula = new Aula($db);

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($aula, $userType);
        break;
        
    case 'POST':
        handlePost($aula, $userType);
        break;
        
    case 'PUT':
        handlePut($aula, $userType);
        break;
        
    case 'DELETE':
        handleDelete($aula, $userType);
        break;
        
    default:
        sendResponse(["error" => "Método no permitido"], 405);
}

function handleGet($aula, $userType) {
    
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        $result = $aula->getById($id);
        
        if (!$result || isset($result['error'])) {
            sendResponse(["error" => "Aula no encontrada"], 404);
        }
        
        sendResponse($result);
    } 
    elseif (isset($_GET['withEdificio'])) {
        $id = isset($_GET['withEdificio']) && is_numeric($_GET['withEdificio']) 
              ? $_GET['withEdificio'] : null;
        
        $result = $aula->getWithEdificio($id);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    elseif (isset($_GET['edificio'])) {
        $edificio_id = $_GET['edificio'];
        
        $result = $aula->getByEdificio($edificio_id);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    elseif (isset($_GET['tipo'])) {
        $tipo = $_GET['tipo'];
        
        $result = $aula->getByTipo($tipo);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    elseif (isset($_GET['capacidad_minima'])) {
        $capacidad = $_GET['capacidad_minima'];
        
        $result = $aula->getByCapacidadMinima($capacidad);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    elseif (isset($_GET['search'])) {
        $criteria = [];
        
        if (isset($_GET['numero'])) {
            $criteria['numero'] = $_GET['numero'];
        }
        
        if (isset($_GET['tipo'])) {
            $criteria['tipo'] = $_GET['tipo'];
        }
        
        $result = $aula->search($criteria);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    else {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        
        $result = $aula->getAll($limit, $offset);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
}

function handlePost($aula, $userType) {
    if ($userType !== 'dba_colegio') {
        sendResponse(["error" => "No tiene permisos para crear aulas"], 403);
    }
    
    $data = getJsonData();
    
    $result = $aula->create($data);
    
    if (isset($result['error'])) {
        sendResponse($result, 400);
    }
    
    sendResponse($result, 201);
}

function handlePut($aula, $userType) {
    if ($userType !== 'dba_colegio') {
        sendResponse(["error" => "No tiene permisos para modificar aulas"], 403);
    }
    
    if (!isset($_GET['id'])) {
        sendResponse(["error" => "Se requiere ID de aula"], 400);
    }
    
    $id = $_GET['id'];
    
    $exist = $aula->getById($id);
    if (!$exist || isset($exist['error'])) {
        sendResponse(["error" => "Aula no encontrada"], 404);
    }
    
    $data = getJsonData();
    
    $result = $aula->update($id, $data);
    
    if (isset($result['error'])) {
        sendResponse($result, 400);
    }
    
    sendResponse($result);
}

function handleDelete($aula, $userType) {
    if ($userType !== 'dba_colegio') {
        sendResponse(["error" => "No tiene permisos para eliminar aulas"], 403);
    }
    
    if (!isset($_GET['id'])) {
        sendResponse(["error" => "Se requiere ID de aula"], 400);
    }
    
    $id = $_GET['id'];

    $exist = $aula->getById($id);
    if (!$exist || isset($exist['error'])) {
        sendResponse(["error" => "Aula no encontrada"], 404);
    }

    $result = $aula->delete($id);
    
    if (isset($result['error'])) {
        sendResponse($result, 500);
    }
    
    sendResponse($result);
}
?>