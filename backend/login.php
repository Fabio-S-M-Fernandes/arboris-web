<?php
// backend/login.php
// Endpoint de login que verifica senha e retorna um token simples

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

$email = trim($input['email'] ?? '');
$senha_plain = $input['senha'] ?? '';

if (!$email || !$senha_plain) {
    http_response_code(400);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Campos obrigatórios faltando']);
    exit;
}

try {
    $pdo = getConnection();
    $stmt = $pdo->prepare('SELECT id, nome, email, senha, cargo, terms_accepted FROM usuarios WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($senha_plain, $user['senha'])) {
        http_response_code(401);
        echo json_encode(['status' => 'erro', 'mensagem' => 'Credenciais inválidas']);
        exit;
    }

        // Gerar token simples (persistiremos o último token no registro de usuário).
    try {
        $token = bin2hex(random_bytes(32));
    } catch (Exception $e) {
        $token = bin2hex(openssl_random_pseudo_bytes(32));
    }

        // Persistir token no usuário (simplificado)
        try {
                $upd = $pdo->prepare('UPDATE usuarios SET last_token = ? WHERE id = ?');
                $upd->execute([$token, $user['id']]);
        } catch (PDOException $e) {
                // ignore token persistence failure, still return token
        }

        echo json_encode(['status' => 'sucesso', 'token' => $token, 'termsAccepted' => (bool)$user['terms_accepted']]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro no banco de dados']);
}
