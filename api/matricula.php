<?php

require_once __DIR__ . '/utils.php';
require_once __DIR__ . '/../config/db_config.php';
require_once __DIR__ . '/../models/Matricula.php';

session_start();

if (!isset($_SESSION['userType'])) {
    sendResponse(["error" => "Autenticación requerida"], 401);
}

$userType = $_SESSION['userType'];

$database = new Database();
$db = $database->getConnection();

$matricula = new Matricula($db);

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($matricula, $userType);
        break;
        
    case 'POST':
        handlePost($matricula, $userType);
        break;
        
    case 'PUT':
        handlePut($matricula, $userType);
        break;
        
    case 'DELETE':
        handleDelete($matricula, $userType);
        break;
        
    default:
        sendResponse(["error" => "Método no permitido"], 405);
}

function handleGet($matricula, $userType) {

    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        $result = $matricula->getById($id);
        
        if (!$result || isset($result['error'])) {
            sendResponse(["error" => "Matrícula no encontrada"], 404);
        }
        
        sendResponse($result);
    } 
    elseif (isset($_GET['estudiante'])) {
        $id = $_GET['estudiante'];
        $result = $matricula->getByEstudiante($id);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    elseif (isset($_GET['curso'])) {
        $id = $_GET['curso'];
        $result = $matricula->getByCurso($id);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    elseif (isset($_GET['detailed'])) {
        $id = isset($_GET['detailed']) && is_numeric($_GET['detailed']) 
              ? $_GET['detailed'] : null;
        
        $result = $matricula->getDetailed($id);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    elseif (isset($_GET['search'])) {
        $criteria = [];
        
        if (isset($_GET['ano_academico'])) {
            $criteria['ano_academico'] = $_GET['ano_academico'];
        }
        
        if (isset($_GET['estado'])) {
            $criteria['estado'] = $_GET['estado'];
        }
        
        $result = $matricula->search($criteria);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    else {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        
        $result = $matricula->getAll($limit, $offset);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
}

function handlePost($matricula, $userType) {
    if ($userType !== 'dba_colegio' && $userType !== 'profesor_guia') {
        sendResponse(["error" => "No tiene permisos para crear matrículas"], 403);
    }

    $data = getJsonData();
    
    $result = $matricula->create($data);
    
    if (isset($result['error'])) {
        sendResponse($result, 400);
    }
    
    sendResponse($result, 201);
}

function handlePut($matricula, $userType) {
    if ($userType !== 'dba_colegio') {
        sendResponse(["error" => "No tiene permisos para modificar matrículas"], 403);
    }

    if (!isset($_GET['id'])) {
        sendResponse(["error" => "Se requiere ID de matrícula"], 400);
    }
    
    $id = $_GET['id'];
    
    $exist = $matricula->getById($id);
    if (!$exist || isset($exist['error'])) {
        sendResponse(["error" => "Matrícula no encontrada"], 404);
    }

    $data = getJsonData();

    $result = $matricula->update($id, $data);
    
    if (isset($result['error'])) {
        sendResponse($result, 400);
    }
    
    sendResponse($result);
}

function handleDelete($matricula, $userType) {
    if ($userType !== 'dba_colegio') {
        sendResponse(["error" => "No tiene permisos para eliminar matrículas"], 403);
    }

    if (!isset($_GET['id'])) {
        sendResponse(["error" => "Se requiere ID de matrícula"], 400);
    }
    
    $id = $_GET['id'];

    $exist = $matricula->getById($id);
    if (!$exist || isset($exist['error'])) {
        sendResponse(["error" => "Matrícula no encontrada"], 404);
    }

    $result = $matricula->delete($id);
    
    if (isset($result['error'])) {
        sendResponse($result, 500);
    }
    
    sendResponse($result);
}
?>