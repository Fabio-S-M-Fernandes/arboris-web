<?php
// backend/cadastro.php
// Endpoint para cadastro de usuários via API

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

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST;
}

$nome = trim($input['nome'] ?? '');
$email = trim($input['email'] ?? '');
$senha_plain = $input['senha'] ?? '';
$cargo = trim($input['cargo'] ?? 'user');

if (!$nome || !$email || !$senha_plain) {
    http_response_code(400);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Campos obrigatórios faltando']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Email inválido']);
    exit;
}

try {
    $pdo = getConnection();

    $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['status' => 'erro', 'mensagem' => 'Email já cadastrado']);
        exit;
    }

    $hash = password_hash($senha_plain, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare('INSERT INTO usuarios (nome, email, senha, cargo) VALUES (?, ?, ?, ?)');
    $stmt->execute([$nome, $email, $hash, $cargo]);

    http_response_code(201);
    echo json_encode(['status' => 'sucesso', 'mensagem' => 'Usuário criado']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro no banco de dados']);
}
