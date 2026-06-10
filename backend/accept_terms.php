<?php
// backend/accept_terms.php
// Marca no banco que o usuário aceitou os termos (identificado por token)

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Método não permitido']);
    exit;
}

require_once __DIR__ . '/conexao.php';

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = '';
if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $m)) {
    $token = $m[1];
} else {
    $input = json_decode(file_get_contents('php://input'), true);
    $token = $input['token'] ?? '';
}

if (!$token) {
    http_response_code(401);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Token ausente']);
    exit;
}

try {
    $pdo = getConnection();
    $stmt = $pdo->prepare('UPDATE usuarios SET terms_accepted = 1, terms_accepted_at = NOW() WHERE last_token = ?');
    $stmt->execute([$token]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['status' => 'sucesso', 'mensagem' => 'Termos registrados']);
        exit;
    } else {
        http_response_code(404);
        echo json_encode(['status' => 'erro', 'mensagem' => 'Token inválido ou usuário não encontrado']);
        exit;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro no banco de dados']);
    exit;
}
