<?php

require_once 'config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = isset($_POST['username']) ? $_POST['username'] : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    $userType = '';
    $success = false;

    if ($username === 'dba_colegio' && $password === 'dba_password') {
        $userType = 'dba_colegio';
        $success = true;
    } elseif ($username === 'profesor_guia' && $password === 'profesor_password') {
        $userType = 'profesor_guia';
        $success = true;
    }
    
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'userType' => $userType
    ]);
    exit;
}

header('Location: login.html');
exit;
?>