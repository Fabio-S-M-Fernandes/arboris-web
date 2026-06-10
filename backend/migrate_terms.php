<?php
// backend/migrate_terms.php
// Script idempotente para adicionar colunas necessárias para o aceite de termos

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexao.php';

try {
    $pdo = getConnection();
    $schema = defined('DB_NAME') ? DB_NAME : null;
    if (!$schema) {
        throw new Exception('DB_NAME não definido em config.php');
    }

    $stmt = $pdo->prepare("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'usuarios'");
    $stmt->execute([$schema]);
    $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $existing = array_flip($cols ?: []);

    $added = [];
    if (!isset($existing['terms_accepted'])) {
        $pdo->exec("ALTER TABLE usuarios ADD COLUMN terms_accepted TINYINT(1) NOT NULL DEFAULT 0");
        $added[] = 'terms_accepted';
    }
    if (!isset($existing['terms_accepted_at'])) {
        $pdo->exec("ALTER TABLE usuarios ADD COLUMN terms_accepted_at DATETIME NULL");
        $added[] = 'terms_accepted_at';
    }
    if (!isset($existing['last_token'])) {
        $pdo->exec("ALTER TABLE usuarios ADD COLUMN last_token VARCHAR(128) NULL");
        $added[] = 'last_token';
    }

    echo json_encode(['status' => 'sucesso', 'added' => $added], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'erro', 'mensagem' => $e->getMessage()], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}
