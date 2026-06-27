# ArborisX - Setup Supabase

## Autenticacao com Supabase

O projeto usa Supabase Auth diretamente no frontend para login, cadastro e aceite de termos.

### Configuracao

1. **Crie um projeto no Supabase**
   - Acesse https://supabase.com
   - Crie um novo projeto e aguarde a inicializacao.

2. **Obtenha as credenciais**
   - Va para Settings > API.
   - Copie a URL do projeto (`VITE_SUPABASE_URL`).
   - Copie a chave anon public (`VITE_SUPABASE_ANON_KEY`).

3. **Configure as variaveis de ambiente**
   - Crie um arquivo `.env` na raiz do projeto.
   - Preencha com suas credenciais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

Use a URL principal do projeto, sem `/rest/v1/`.

### Fluxo de autenticacao

- **Cadastro:** usa `supabase.auth.signUp()` com metadados do usuario.
- **Login:** usa `supabase.auth.signInWithPassword()`.
- **Aceite de termos:** fica em `user_metadata.terms_accepted`.
- **Sessao:** e gerenciada pelo Supabase Auth.

### Seguranca

- Nao exponha a chave de servico (`service_role_key`) no frontend.
- A chave anon public pode ficar no frontend, desde que suas policies no Supabase estejam corretas.
- As senhas nunca sao armazenadas localmente pelo app.

### Camada antiga removida

Qualquer nova integracao de dados deve ser feita via Supabase client, policies e tabelas do Supabase.

## Desenvolvimento

```bash
npm run dev
npm run build
npm run lint
```

## Documentacao

- [Supabase JS SDK](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
