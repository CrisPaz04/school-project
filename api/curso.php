<?php

require_once __DIR__ . '/utils.php';
require_once __DIR__ . '/../config/db_config.php';
require_once __DIR__ . '/../models/Curso.php';

session_start();

if (!isset($_SESSION['userType'])) {
    sendResponse(["error" => "Autenticación requerida"], 401);
}

$userType = $_SESSION['userType'];

$database = new Database();
$db = $database->getConnection();

$curso = new Curso($db);

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($curso, $userType);
        break;
        
    case 'POST':
        handlePost($curso, $userType);
        break;
        
    case 'PUT':
        handlePut($curso, $userType);
        break;
        
    case 'DELETE':
        handleDelete($curso, $userType);
        break;
        
    default:
        sendResponse(["error" => "Método no permitido"], 405);
}

function handleGet($curso, $userType) {
    
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        $result = $curso->getById($id);
        
        if (!$result || isset($result['error'])) {
            sendResponse(["error" => "Curso no encontrado"], 404);
        }
        
        sendResponse($result);
    } 
    elseif (isset($_GET['withProfesorGuia'])) {
        $id = isset($_GET['withProfesorGuia']) && is_numeric($_GET['withProfesorGuia']) 
              ? $_GET['withProfesorGuia'] : null;
        
        $result = $curso->getWithProfesorGuia($id);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    elseif (isset($_GET['ano_academico'])) {
        $ano = $_GET['ano_academico'];
        
        $result = $curso->getByAnoAcademico($ano);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    elseif (isset($_GET['profesor_guia'])) {
        $profesor_id = $_GET['profesor_guia'];
        
        $result = $curso->getByProfesorGuia($profesor_id);
        
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
        
        $result = $curso->search($criteria);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
    else {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        
        $result = $curso->getAll($limit, $offset);
        
        if (isset($result['error'])) {
            sendResponse($result, 500);
        }
        
        sendResponse($result);
    }
}

function handlePost($curso, $userType) {
    if ($userType !== 'dba_colegio') {
        sendResponse(["error" => "No tiene permisos para crear cursos"], 403);
    }
    
    $data = getJsonData();
    
    $result = $curso->create($data);
    
    if (isset($result['error'])) {
        sendResponse($result, 400);
    }
    
    sendResponse($result, 201);
}

function handlePut($curso, $userType) {
    if ($userType !== 'dba_colegio') {
        sendResponse(["error" => "No tiene permisos para modificar cursos"], 403);
    }
    
    if (!isset($_GET['id'])) {
        sendResponse(["error" => "Se requiere ID de curso"], 400);
    }
    
    $id = $_GET['id'];
    
    $exist = $curso->getById($id);
    if (!$exist || isset($exist['error'])) {
        sendResponse(["error" => "Curso no encontrado"], 404);
    }
    
    $data = getJsonData();
    
    $result = $curso->update($id, $data);
    
    if (isset($result['error'])) {
        sendResponse($result, 400);
    }
    
    sendResponse($result);
}

function handleDelete($curso, $userType) {
    if ($userType !== 'dba_colegio') {
        sendResponse(["error" => "No tiene permisos para eliminar cursos"], 403);
    }
    
    if (!isset($_GET['id'])) {
        sendResponse(["error" => "Se requiere ID de curso"], 400);
    }
    
    $id = $_GET['id'];
    
    $exist = $curso->getById($id);
    if (!$exist || isset($exist['error'])) {
        sendResponse(["error" => "Curso no encontrado"], 404);
    }
    
    $result = $curso->delete($id);
    
    if (isset($result['error'])) {
        sendResponse($result, 500);
    }
    
    sendResponse($result);
}
?>