-- 1. Cria o banco de dados do seu projeto se ele ainda não existir
CREATE DATABASE IF NOT EXISTS projetoarboris;

-- 2. Avisa o sistema para usar esse banco de dados daqui para frente
USE projetoarboris;

-- 3. Cria a sua tabela de usuários com a estrutura perfeita que você fez
CREATE TABLE `usuarios` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `senha` VARCHAR(255) NOT NULL,
  `cargo` VARCHAR(50) NOT NULL,
  `terms_accepted` TINYINT(1) NOT NULL DEFAULT 0,
  `terms_accepted_at` DATETIME NULL,
  `last_token` VARCHAR(128) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_unico` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;