<?php

require_once __DIR__ . '/../config/db_config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = isset($_POST['username']) ? $_POST['username'] : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    $success = false;
    $userType = '';

    if ($username === 'dba_colegio' && $password === 'dba_password') {
        $success = true;
        $userType = 'dba_colegio';
    } elseif ($username === 'profesor_guia' && $password === 'profesor_password') {
        $success = true;
        $userType = 'profesor_guia';
    }
    
    if ($success) {
        session_start();
        $_SESSION['userType'] = $userType;
        $_SESSION['username'] = $username;

        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'userType' => $userType
        ]);
    } else {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => 'Credenciales incorrectas'
        ]);
    }
    exit;
}

header('Location: ../login.html');
exit;
?>