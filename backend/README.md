# Backend PHP mínimo — Registro / Login

Arquivos criados:
- backend/config.php
- backend/register.php
- backend/login.php
- backend/create_table.sql

Passos rápidos:
1. No painel InfinityFree crie um banco MySQL e anote `DB name`, `DB user`, `DB password` e `DB host`.
2. No phpMyAdmin selecione o banco e execute o conteúdo de `create_table.sql` (ou cole o SQL manualmente).
3. Atualize `backend/config.php` trocando os placeholders pelos valores reais do passo 1.
4. Faça upload dos arquivos `register.php`, `login.php` e `config.php` para a pasta pública do seu host (ex: `htdocs` / `public_html`).

Testes com `curl` (substitua `https://seudominio/exposedpath`):

Registrar usuário:

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"nome":"Teste","email":"teste@example.com","senha":"senha123","cargo":"admin"}' \
  https://seudominio.com/register.php
```

Login:

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","senha":"senha123"}' \
  https://seudominio.com/login.php
```

Notas de segurança e produção:
- Nunca exponha `config.php` em repositórios públicos com credenciais verdadeiras.
- Em produção, use HTTPS e considere gerar tokens JWT ou sessões seguras.
- Este é um exemplo mínimo; para apps reais adicione validação mais robusta, rate-limiting e logging.
