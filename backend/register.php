<?php
require_once __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

// Suporta JSON ou form-data
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST;
}

$nome = trim($input['nome'] ?? '');
$email = trim($input['email'] ?? '');
$senha_plain = $input['senha'] ?? '';
$cargo = trim($input['cargo'] ?? '');

if (!$nome || !$email || !$senha_plain || !$cargo) {
    http_response_code(400);
    echo json_encode(['error' => 'Campos obrigatórios faltando']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email inválido']);
    exit;
}

try {
    $pdo = getPDO();

    // Verifica se o email já existe
    $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Email já cadastrado']);
        exit;
    }

    $hash = password_hash($senha_plain, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare('INSERT INTO usuarios (nome, email, senha, cargo) VALUES (?, ?, ?, ?)');
    $stmt->execute([$nome, $email, $hash, $cargo]);

    $id = $pdo->lastInsertId();
    http_response_code(201);
    echo json_encode(['success' => true, 'id' => $id, 'nome' => $nome, 'email' => $email, 'cargo' => $cargo]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro no banco de dados']);
}
