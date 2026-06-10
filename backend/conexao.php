<?php
// backend/conexao.php
// Wrapper that exposes the PDO connection defined in config.php
require_once __DIR__ . '/config.php';

function getConnection(): PDO
{
    return getPDO();
}
