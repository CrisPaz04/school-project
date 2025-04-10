<?php

require_once __DIR__ . '/utils.php';
require_once __DIR__ . '/../config/db_config.php';
require_once __DIR__ . '/../models/Edificio.php';

session_start();

if (!isset($_SESSION['userType'])) {
    sendResponse(["error" => "Autenticación requerida"], 401);
}

$userType = $_SESSION['userType'];

$database = new Database();
$db = $database->getConnection();

$edificio = new Edificio($db);

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($edificio, $userType);
        break;
        
    case 'POST':
        handlePost($edificio, $userType);
        break;
        
    case 'PUT':
        handlePut($edificio, $userType);
        break;
        
    case 'DELETE':
        handleDelete($edificio, $userType);
        break;
        
    default:
        sendResponse(["error" => "Método no permitido"], 405);
}

function handleGet($edificio, $userType) {

    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        $result = $edificio->getById($id);
        
        if (!$result || isset($result['error'])) {
            sendResponse(["error" => "Edificio no encontrado"], 404);
        }
        
        sendResponse($result);
    }
    elseif (isset($_GET['withAulas'])) {
        $id = isset($_GET['withAulas']) && is_numeric($_GET['withAulas']) 
              ? $_GET['withAulas'] : null;
        
        $result = $edificio->getWithAulas($id);
        
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
        
        if (isset($_GET['ubicacion'])) {
            $criteria['ubicacion'] = $_GET['ubicacion'];
        }
        
        $result = $edificio->search($criteria);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    else {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        
        $result = $edificio->getAll($limit, $offset);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
}

function handlePost($edificio, $userType) {
    if ($userType !== 'dba_colegio') {
        sendResponse(["error" => "No tiene permisos para crear edificios"], 403);
    }
    
    $data = getJsonData();
    
    $result = $edificio->create($data);
    
    if (isset($result['error'])) {
        sendResponse($result, 400);
    }
    
    sendResponse($result, 201);
}

function handlePut($edificio, $userType) {
    if ($userType !== 'dba_colegio') {
        sendResponse(["error" => "No tiene permisos para modificar edificios"], 403);
    }
    
    if (!isset($_GET['id'])) {
        sendResponse(["error" => "Se requiere ID de edificio"], 400);
    }
    
    $id = $_GET['id'];
    
    $exist = $edificio->getById($id);
    if (!$exist || isset($exist['error'])) {
        sendResponse(["error" => "Edificio no encontrado"], 404);
    }
    
    $data = getJsonData();
    
    $result = $edificio->update($id, $data);
    
    if (isset($result['error'])) {
        sendResponse($result, 400);
    }
    
    sendResponse($result);
}

function handleDelete($edificio, $userType) {
    if ($userType !== 'dba_colegio') {
        sendResponse(["error" => "No tiene permisos para eliminar edificios"], 403);
    }
    
    if (!isset($_GET['id'])) {
        sendResponse(["error" => "Se requiere ID de edificio"], 400);
    }
    
    $id = $_GET['id'];
    
    $exist = $edificio->getById($id);
    if (!$exist || isset($exist['error'])) {
        sendResponse(["error" => "Edificio no encontrado"], 404);
    }
    
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        $query = "SELECT COUNT(*) as count FROM AULA WHERE ID_edificio = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $result = $stmt->fetch();
        
        if ($result['count'] > 0) {
            sendResponse(["error" => "No se puede eliminar el edificio porque tiene aulas asociadas"], 400);
        }
    } catch(PDOException $e) {
        sendResponse(["error" => "Error al verificar aulas asociadas: " . $e->getMessage()], 500);
    }
    
    $result = $edificio->delete($id);
    
    if (isset($result['error'])) {
        sendResponse($result, 500);
    }
    
    sendResponse($result);
}
?>