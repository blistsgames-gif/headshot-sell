# HeadShot Sell

Ferramenta de vendas da linha MDM. A especificação completa está no `CLAUDE.md`.

## Rodar no computador

1. Copie `.env.example` para `.env.local` e preencha com os dados do Supabase.
2. `npm install` (só na primeira vez)
3. `npm run dev`
4. Abra http://localhost:3000

## Banco de dados

As migrations ficam em `supabase/migrations/` e são aplicadas à mão, em ordem, no SQL Editor do Supabase.

| Arquivo | O que faz |
| --- | --- |
| `001_base.sql` | Perfis, preferências, auditoria, erros, teto de IA |

## Estrutura

- `src/app/(app)/` páginas da área logada (uma pasta por item do menu)
- `src/app/login/` login e código do segundo fator
- `src/components/shell/` menu, gaveta e os dois temas (Moderno e Retrô)
- `src/lib/menu.ts` quem vê cada página
- `src/lib/sessao.ts` login, papel e segundo fator no servidor
- `src/lib/acoes.ts` ações do servidor (tema, auditoria, erros)
- `src/instrumentation.ts` grava erros do servidor na tabela `erros`
- `public/retro/` 98.css (licença MIT), usado só no tema Retrô
