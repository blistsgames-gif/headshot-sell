-- =====================================================================
-- HeadShot Sell — 001_base.sql (Etapa 0: Preparação)
-- ---------------------------------------------------------------------
-- O que este arquivo cria:
--   1. perfis               -> quem é cada usuário (nome, papel, ativo)
--   2. preferencias_usuario -> tema escolhido (retro ou moderno)
--   3. auditoria            -> quem fez o quê e quando
--   4. erros                -> todo erro de tela ou servidor
--   5. config_ia / uso_ia   -> teto mensal de gasto com a Claude API
--
-- Como rodar: cole o arquivo inteiro no SQL Editor do Supabase e clique
-- em "Run". Ele roda tudo ou nada (begin/commit): se der erro, nada
-- fica pela metade.
--
-- Lembrete do projeto: as tabelas NÃO são expostas automaticamente e o
-- RLS está ligado. Por isso cada tabela tem seus GRANTs e suas políticas.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- Acesso básico ao schema
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

-- ---------------------------------------------------------------------
-- Função utilitária: atualiza a coluna atualizado_em sozinha
-- ---------------------------------------------------------------------
create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

-- =====================================================================
-- 1. PERFIS
-- Usuário novo nasce SEM papel (papel = null) e, portanto, sem acesso,
-- até o admin definir o papel.
-- =====================================================================
create table public.perfis (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null,
  nome          text,
  papel         text check (papel in ('admin', 'socio', 'representante')),
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on table public.perfis is 'Um registro por usuário do Supabase Auth. papel nulo = aguardando liberação.';
comment on column public.perfis.papel is 'admin, socio ou representante. Nulo = sem acesso.';
comment on column public.perfis.ativo is 'false = acesso bloqueado (ex.: representante desligado).';

create index perfis_papel_idx on public.perfis (papel);

create trigger perfis_atualizado_em
  before update on public.perfis
  for each row execute function public.tocar_atualizado_em();

alter table public.perfis enable row level security;

-- ---------------------------------------------------------------------
-- Funções de permissão usadas pelas políticas de RLS
-- (security definer: leem perfis sem cair em recursão de RLS)
-- ---------------------------------------------------------------------

-- Papel do usuário logado (nulo se não tem papel ou está inativo)
create or replace function public.meu_papel()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.papel
  from public.perfis p
  where p.id = (select auth.uid())
    and p.ativo;
$$;

-- Segundo fator: se o usuário ativou o código do aplicativo autenticador,
-- a sessão precisa estar no nível aal2 (código digitado). Quem não ativou passa.
create or replace function public.mfa_ok()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2'
      or not exists (
        select 1
        from auth.mfa_factors f
        where f.user_id = (select auth.uid())
          and f.status = 'verified'
      );
$$;

-- Tem algum papel liberado e passou pelo segundo fator (se ativado)
create or replace function public.tem_acesso()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.meu_papel() is not null and public.mfa_ok();
$$;

-- É admin (e passou pelo segundo fator, se ativado)
create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.meu_papel() = 'admin', false) and public.mfa_ok();
$$;

-- É sócio (e passou pelo segundo fator, se ativado)
create or replace function public.eh_socio()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.meu_papel() = 'socio', false) and public.mfa_ok();
$$;

-- É representante (e passou pelo segundo fator, se ativado)
create or replace function public.eh_representante()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.meu_papel() = 'representante', false) and public.mfa_ok();
$$;

-- Políticas de perfis
--   * cada um vê o próprio perfil (precisa disso para saber se foi liberado)
--   * admin vê e altera todos
--   * ninguém cria nem apaga perfil pela API (nasce sozinho com o usuário)
create policy "perfis: ver o próprio"
  on public.perfis for select
  to authenticated
  using (id = (select auth.uid()));

create policy "perfis: admin vê todos"
  on public.perfis for select
  to authenticated
  using ((select public.eh_admin()));

create policy "perfis: admin altera"
  on public.perfis for update
  to authenticated
  using ((select public.eh_admin()))
  with check ((select public.eh_admin()));

-- =====================================================================
-- 2. PREFERÊNCIAS DO USUÁRIO
-- =====================================================================
create table public.preferencias_usuario (
  usuario_id    uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  tema          text not null default 'moderno' check (tema in ('moderno', 'retro')),
  mostrar_dica  boolean not null default true,
  som_abate     boolean not null default true,
  atualizado_em timestamptz not null default now()
);

comment on table public.preferencias_usuario is 'Preferências de cada usuário. Valem em qualquer aparelho.';

create trigger preferencias_atualizado_em
  before update on public.preferencias_usuario
  for each row execute function public.tocar_atualizado_em();

alter table public.preferencias_usuario enable row level security;

-- Cada usuário lê, cria e altera só as próprias preferências
create policy "preferencias: ver as próprias"
  on public.preferencias_usuario for select
  to authenticated
  using (usuario_id = (select auth.uid()));

create policy "preferencias: criar as próprias"
  on public.preferencias_usuario for insert
  to authenticated
  with check (usuario_id = (select auth.uid()));

create policy "preferencias: alterar as próprias"
  on public.preferencias_usuario for update
  to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

-- =====================================================================
-- 3. AUDITORIA (só cresce: ninguém altera nem apaga pela API)
-- =====================================================================
create table public.auditoria (
  id            bigint generated always as identity primary key,
  criado_em     timestamptz not null default now(),
  usuario_id    uuid references auth.users (id) on delete set null,
  usuario_email text,
  acao          text not null check (acao in ('viu', 'criou', 'alterou', 'excluiu', 'exportou', 'login', 'logout')),
  tabela        text,
  registro_id   text,
  detalhes      jsonb not null default '{}'::jsonb
);

comment on table public.auditoria is 'Registro de auditoria: quem viu, criou, alterou, exportou, entrou.';

create index auditoria_criado_em_idx on public.auditoria (criado_em desc);
create index auditoria_usuario_idx on public.auditoria (usuario_id, criado_em desc);
create index auditoria_tabela_idx on public.auditoria (tabela, registro_id);

alter table public.auditoria enable row level security;

create policy "auditoria: admin lê"
  on public.auditoria for select
  to authenticated
  using ((select public.eh_admin()));

-- Função para registrar uma ação (chamada pelo programa)
create or replace function public.registrar_auditoria(
  p_acao        text,
  p_tabela      text default null,
  p_registro_id text default null,
  p_detalhes    jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Usuário não autenticado';
  end if;

  insert into public.auditoria (usuario_id, usuario_email, acao, tabela, registro_id, detalhes)
  values (
    (select auth.uid()),
    (select auth.jwt() ->> 'email'),
    p_acao,
    left(p_tabela, 100),
    left(p_registro_id, 200),
    coalesce(p_detalhes, '{}'::jsonb)
  );
end;
$$;

-- Gatilho genérico: grava na auditoria toda criação/alteração/exclusão
-- de uma tabela, com o "antes" e o "depois".
create or replace function public.auditar_alteracao()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_linha jsonb;
begin
  v_linha := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;

  insert into public.auditoria (usuario_id, usuario_email, acao, tabela, registro_id, detalhes)
  values (
    (select auth.uid()),
    (select auth.jwt() ->> 'email'),
    case tg_op when 'INSERT' then 'criou' when 'UPDATE' then 'alterou' else 'excluiu' end,
    tg_table_name,
    coalesce(v_linha ->> 'id', v_linha ->> 'usuario_id'),
    jsonb_build_object(
      'antes',  case when tg_op <> 'INSERT' then to_jsonb(old) end,
      'depois', case when tg_op <> 'DELETE' then to_jsonb(new) end
    )
  );

  return coalesce(new, old);
end;
$$;

-- Toda mudança de papel/ativo de um usuário fica registrada
create trigger perfis_auditoria
  after insert or update or delete on public.perfis
  for each row execute function public.auditar_alteracao();

-- =====================================================================
-- 4. ERROS
-- =====================================================================
create table public.erros (
  id            bigint generated always as identity primary key,
  criado_em     timestamptz not null default now(),
  usuario_id    uuid references auth.users (id) on delete set null,
  usuario_email text,
  origem        text not null default 'navegador' check (origem in ('navegador', 'servidor')),
  pagina        text,
  mensagem      text not null,
  detalhes      text,
  resolvido     boolean not null default false
);

comment on table public.erros is 'Erros de tela e de servidor, com a mensagem completa.';

create index erros_criado_em_idx on public.erros (criado_em desc);

alter table public.erros enable row level security;

create policy "erros: admin lê"
  on public.erros for select
  to authenticated
  using ((select public.eh_admin()));

create policy "erros: admin marca resolvido"
  on public.erros for update
  to authenticated
  using ((select public.eh_admin()))
  with check ((select public.eh_admin()));

create policy "erros: admin apaga"
  on public.erros for delete
  to authenticated
  using ((select public.eh_admin()));

-- Função para registrar erro. Também pode ser chamada sem login
-- (ex.: erro na tela de login). Tem limite de tamanho e de quantidade
-- por minuto, para ninguém lotar a tabela.
create or replace function public.registrar_erro(
  p_origem   text,
  p_pagina   text,
  p_mensagem text,
  p_detalhes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.erros where criado_em > now() - interval '1 minute') >= 60 then
    return;
  end if;

  insert into public.erros (usuario_id, usuario_email, origem, pagina, mensagem, detalhes)
  values (
    (select auth.uid()),
    (select auth.jwt() ->> 'email'),
    case when p_origem = 'servidor' then 'servidor' else 'navegador' end,
    left(p_pagina, 500),
    left(coalesce(nullif(p_mensagem, ''), '(sem mensagem)'), 5000),
    left(p_detalhes, 20000)
  );
end;
$$;

-- =====================================================================
-- 5. IA: TETO MENSAL E USO
-- =====================================================================
create table public.config_ia (
  id                       smallint primary key default 1 check (id = 1),
  teto_mensal_reais        numeric(10, 2) not null default 300 check (teto_mensal_reais >= 0),
  percentual_alerta        smallint not null default 80 check (percentual_alerta between 1 and 100),
  bloquear_ao_atingir_teto boolean not null default true,
  atualizado_em            timestamptz not null default now()
);

comment on table public.config_ia is 'Linha única: teto mensal em R$ da Claude API e percentual de alerta.';

insert into public.config_ia (id) values (1);

create trigger config_ia_atualizado_em
  before update on public.config_ia
  for each row execute function public.tocar_atualizado_em();

create trigger config_ia_auditoria
  after update on public.config_ia
  for each row execute function public.auditar_alteracao();

alter table public.config_ia enable row level security;

create policy "config_ia: admin lê"
  on public.config_ia for select
  to authenticated
  using ((select public.eh_admin()));

create policy "config_ia: admin altera"
  on public.config_ia for update
  to authenticated
  using ((select public.eh_admin()))
  with check ((select public.eh_admin()));

create table public.uso_ia (
  id                   bigint generated always as identity primary key,
  criado_em            timestamptz not null default now(),
  usuario_id           uuid references auth.users (id) on delete set null,
  funcao               text not null,
  modelo               text,
  tokens_entrada       integer not null default 0 check (tokens_entrada >= 0),
  tokens_saida         integer not null default 0 check (tokens_saida >= 0),
  custo_estimado_reais numeric(12, 4) not null default 0 check (custo_estimado_reais >= 0)
);

comment on table public.uso_ia is 'Cada chamada à Claude API: função, tokens e custo estimado em R$.';

create index uso_ia_criado_em_idx on public.uso_ia (criado_em desc);

alter table public.uso_ia enable row level security;

create policy "uso_ia: admin lê"
  on public.uso_ia for select
  to authenticated
  using ((select public.eh_admin()));

-- Registrar uma chamada de IA (usado a partir das próximas etapas)
create or replace function public.registrar_uso_ia(
  p_funcao               text,
  p_modelo               text,
  p_tokens_entrada       integer,
  p_tokens_saida         integer,
  p_custo_estimado_reais numeric
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.tem_acesso() then
    raise exception 'Sem acesso';
  end if;

  insert into public.uso_ia (usuario_id, funcao, modelo, tokens_entrada, tokens_saida, custo_estimado_reais)
  values ((select auth.uid()), left(p_funcao, 100), left(p_modelo, 100),
          greatest(coalesce(p_tokens_entrada, 0), 0), greatest(coalesce(p_tokens_saida, 0), 0),
          greatest(coalesce(p_custo_estimado_reais, 0), 0));
end;
$$;

-- Situação do mês (fuso de São Paulo): gasto, teto, % usado,
-- se passou do alerta e se está bloqueado. O programa consulta isto
-- ANTES de chamar a Claude API.
create or replace function public.ia_situacao_mes()
returns table (
  gasto_mes         numeric,
  teto_mensal       numeric,
  percentual_usado  numeric,
  percentual_alerta smallint,
  em_alerta         boolean,
  bloqueado         boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with inicio as (
    select (date_trunc('month', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo') as d
  ),
  gasto as (
    select coalesce(sum(u.custo_estimado_reais), 0) as total
    from public.uso_ia u, inicio
    where u.criado_em >= inicio.d
  )
  select
    gasto.total,
    c.teto_mensal_reais,
    case when c.teto_mensal_reais > 0 then round(gasto.total / c.teto_mensal_reais * 100, 1) else 0 end,
    c.percentual_alerta,
    c.teto_mensal_reais > 0 and gasto.total >= c.teto_mensal_reais * c.percentual_alerta / 100.0,
    c.bloquear_ao_atingir_teto and gasto.total >= c.teto_mensal_reais
  from public.config_ia c, gasto
  where c.id = 1
    and public.tem_acesso();
$$;

-- =====================================================================
-- Perfil e preferências nascem sozinhos quando um usuário é criado
-- =====================================================================
create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, email, nome)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;

  insert into public.preferencias_usuario (usuario_id)
  values (new.id)
  on conflict (usuario_id) do nothing;

  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil_novo_usuario();

-- Usuários que já existiam antes desta migration também ganham perfil
insert into public.perfis (id, email, nome)
select u.id, u.email, split_part(u.email, '@', 1)
from auth.users u
on conflict (id) do nothing;

insert into public.preferencias_usuario (usuario_id)
select u.id from auth.users u
on conflict (usuario_id) do nothing;

-- =====================================================================
-- GRANTs (as tabelas não são expostas automaticamente)
-- anon          = visitante sem login: não lê nenhuma tabela
-- authenticated = usuário logado: o RLS decide o que ele vê
-- service_role  = tarefas internas do servidor (uso futuro)
-- =====================================================================

-- perfis: logado lê; só nome/papel/ativo podem ser alterados (e o RLS só deixa o admin)
grant select on public.perfis to authenticated;
grant update (nome, papel, ativo) on public.perfis to authenticated;

-- preferências: logado lê, cria e altera as próprias
grant select, insert, update on public.preferencias_usuario to authenticated;

-- auditoria: só leitura (gravação apenas pela função registrar_auditoria)
grant select on public.auditoria to authenticated;

-- erros: admin lê, marca resolvido e apaga (gravação pela função registrar_erro)
grant select, delete on public.erros to authenticated;
grant update (resolvido) on public.erros to authenticated;

-- IA: admin lê e ajusta o teto; uso só leitura (gravação pela função)
grant select on public.config_ia to authenticated;
grant update (teto_mensal_reais, percentual_alerta, bloquear_ao_atingir_teto) on public.config_ia to authenticated;
grant select on public.uso_ia to authenticated;

-- service_role (servidor) tem acesso total
grant all on public.perfis, public.preferencias_usuario, public.auditoria,
             public.erros, public.config_ia, public.uso_ia to service_role;
grant usage, select on all sequences in schema public to service_role;

-- Funções: tira a permissão padrão de "todo mundo" e libera só o necessário
revoke execute on function public.tocar_atualizado_em()       from public, anon, authenticated;
revoke execute on function public.auditar_alteracao()         from public, anon, authenticated;
revoke execute on function public.criar_perfil_novo_usuario() from public, anon, authenticated;
revoke execute on function public.meu_papel()                 from public, anon;
revoke execute on function public.mfa_ok()                    from public, anon;
revoke execute on function public.tem_acesso()                from public, anon;
revoke execute on function public.eh_admin()                  from public, anon;
revoke execute on function public.eh_socio()                  from public, anon;
revoke execute on function public.eh_representante()          from public, anon;
revoke execute on function public.registrar_auditoria(text, text, text, jsonb)            from public, anon;
revoke execute on function public.registrar_erro(text, text, text, text)                  from public;
revoke execute on function public.registrar_uso_ia(text, text, integer, integer, numeric) from public, anon;
revoke execute on function public.ia_situacao_mes()                                       from public, anon;

grant execute on function public.meu_papel()        to authenticated, service_role;
grant execute on function public.mfa_ok()           to authenticated, service_role;
grant execute on function public.tem_acesso()       to authenticated, service_role;
grant execute on function public.eh_admin()         to authenticated, service_role;
grant execute on function public.eh_socio()         to authenticated, service_role;
grant execute on function public.eh_representante() to authenticated, service_role;
grant execute on function public.registrar_auditoria(text, text, text, jsonb)            to authenticated, service_role;
grant execute on function public.registrar_erro(text, text, text, text)                  to anon, authenticated, service_role;
grant execute on function public.registrar_uso_ia(text, text, integer, integer, numeric) to authenticated, service_role;
grant execute on function public.ia_situacao_mes()                                       to authenticated, service_role;

commit;

-- =====================================================================
-- DEPOIS de criar o seu usuário em Authentication -> Users, rode a linha
-- abaixo SOZINHA (apague os dois traços "-- " do começo e troque só o e-mail):
--
-- update public.perfis set papel = 'admin', ativo = true, nome = 'Vitor' where email = 'seu-email@exemplo.com';
--
-- Para liberar outras pessoas depois, troque 'admin' por 'socio' ou 'representante'.
-- =====================================================================
