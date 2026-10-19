# HeadShot Sell — Especificação do projeto

> Este arquivo é o contexto completo do projeto. O Claude Code lê este arquivo automaticamente quando ele está na raiz da pasta do projeto. Mantenha-o atualizado a cada decisão nova.
>
> Última atualização: 19/10/2026 (IA nativa, leads de anúncios, padrões profissionais, política comercial, pós-venda com link de acompanhamento, programa do balconista, área do representante ampliada).

## Como trabalhar comigo (Vitor)

- Eu não sou programador. Explique tudo em português simples, sem jargão, e diga exatamente o que eu preciso fazer.
- Eu aplico as migrations SQL manualmente no Supabase Studio. Sempre gere cada migration como arquivo `.sql` numerado em `supabase/migrations/` (ex.: `001_base.sql`, `002_clientes.sql`) e me diga para colar e rodar.
- Prefiro decisões já tomadas, com justificativa curta, em vez de listas de opções abertas.
- Trabalhe em etapas pequenas, que eu consigo testar. No fim de cada etapa, diga o que testar e como.
- Nunca use dados reais de clientes em exemplos ou no código. Use dados fictícios.

---

## 1. O que é

**HeadShot Sell** é a ferramenta de vendas pessoal do Vitor, gerente de vendas e de novos produtos da **MDM** (borracha para caminhão). Não tem financeiro, estoque nem emissão de nota: é só vendas, BI, CRM e IA para aumentar as vendas.

- **Usuário principal:** Vitor (uso diário).
- **Sócios:** acesso só leitura ao Painel, Clientes, Produtos e Representantes.
- **Representantes:** só a própria carteira, oportunidades e o registro de peças pedidas.

### Linha de produtos única
Os itens da **KAER** (plásticos injetados, impressos 3D, kits, tubos de revenda) entram na **linha MDM**. Cada item KAER recebe um código MDM. Internamente o sistema guarda a origem (MDM ou KAER) para análise, mas tudo aparece como linha MDM.

### Dois programas separados
1. **HeadShot Sell** — o programa do Vitor (este projeto).
2. **Catálogo eletrônico MDM** — programa separado, usado por clientes e representantes. Toda cotação ou pedido feito no catálogo chega direto no HeadShot. Os dois compartilham o mesmo banco Supabase.

---

## 2. Stack e decisões técnicas

- **Next.js 15 + TypeScript + Tailwind v4 + Supabase + Claude API** (mesma stack do Fabris ERP).
- Repositório e projeto Supabase **próprios** (não é módulo do Fabris).
- Deploy na Vercel.
- **Programa no Windows:** primeiro como PWA (instalável, janela própria); depois embrulhado em **.exe com Tauri** (splash, ícone na bandeja com contador de alvos, notificação do Windows com som de "abate", iniciar com o Windows, atalho global para a Mira).
- Não usar C#/WinForms nem Electron (decidido).
- Banco com RLS: cada perfil (admin, sócio, representante, cliente do catálogo) só vê o que pode.
- Backup diário do Supabase.
- **Decisões da Etapa 0 (19/10/2026):** o 98.css fica em `public/retro/` e só é carregado no tema Retrô; Configurações (Aparência e Segurança) aparece para todos os perfis, e Erros e Limite de IA só para o admin; "Produtos" entrou no menu (o sócio vê); o segundo fator, depois de ativado, é exigido no login de qualquer perfil e o banco (RLS) também bloqueia sem o código; admin e sócio sem segundo fator veem um lembrete no topo; erros do servidor são gravados por `src/instrumentation.ts`.
- **Padrões profissionais (desde a Etapa 0):** ambiente de teste separado do oficial; registro de auditoria (quem viu, alterou, exportou); representante não exporta carteira; login com segundo fator para admin e sócios; aviso automático de erro com a mensagem completa; teto mensal de gasto com a Claude API com alerta; LGPD nos leads (consentimento na primeira mensagem e exclusão a pedido).

---

## 3. Fontes de dados

- **Histórico:** XMLs das NF-e de venda da MDM e da KAER dos últimos anos (pedir aos contadores). Ignorar devoluções e remessas, contar só venda.
- **Cliente unificado por CNPJ** entre as duas empresas.
- **Pedidos novos:** catálogo eletrônico, PDF (ex.: BR Company, Rochester), foto ou print de WhatsApp — lidos pela IA.

### Caixa de Entrada universal (qualquer coisa que tenha informação de venda)
O sistema precisa aceitar e ler com IA **qualquer** documento ou mensagem com informação de venda, não só XML e PDF:
- XML de NF-e, PDF de pedido, **vales** (vales de entrega, talões, pedidos manuscritos), fotos e prints, planilhas (Excel/CSV), e-mails, orçamentos.
- **Conversas de WhatsApp:** exportação da conversa (arquivo .txt com mídias) enviada ao sistema, e um número de WhatsApp do HeadShot (WhatsApp Business Platform) para onde o Vitor encaminha mensagens, fotos e áudios. O WhatsApp não permite ler as conversas do aplicativo pessoal por API, por isso o caminho é exportar ou encaminhar.
- Áudios (transcritos pela IA).

Como funciona:
1. Tudo entra numa **Caixa de Entrada** (arrastar arquivo, colar texto, encaminhar no WhatsApp, enviar por e-mail).
2. A IA identifica o tipo, o cliente (CNPJ, nome, telefone), os itens (de-para de códigos), quantidades, preços, datas e se é pedido, cotação, venda faturada, devolução ou só conversa.
3. Cada registro guarda a **origem** (XML, PDF, vale, WhatsApp…), o arquivo original e o grau de confiança da leitura.
4. Leituras com baixa confiança vão para **revisão**: o Vitor confirma ou corrige em poucos cliques, e o sistema aprende com a correção.
5. **Sem duplicidade:** o mesmo pedido pode aparecer em várias fontes (WhatsApp → vale → NF-e). O sistema reconcilia e mantém um único registro, sempre dando prioridade à NF-e quando ela chega.
6. Das conversas, a IA extrai também o que não é pedido: preço pedido pelo cliente, reclamação, peça que a linha não tem (vai para o radar), concorrente citado e próxima ação (vai para o CRM).
- **Mercado:** base pública de CNPJs da Receita Federal (comércio de peças para veículos), Google Maps (telefone, site, confirmação de loja de caminhão) e frota de caminhões por município (Senatran).
- **Mercado Livre:** API oficial, sincronização diária.

### Classificação de cada item
- **Categoria:** plástico injetado, plástico impresso 3D, borracha MDM, vulcanizado, revenda, kits e chicotes.
- **Família:** presilha, coifa, coxim, botão, tubo, bucha, tampa etc.
- **Aplicação estruturada:** montadora (Volvo, Mercedes, VW, Scania, DAF, Iveco, Ford…), modelo, ano inicial e ano final, em campos separados (não texto livre), para cruzar com a frota. A IA sugere a aplicação a partir da descrição e do nº original; o Vitor confirma.
- **Canal:** B2B, representante, Mercado Livre.
- **Equivalências:** código original da montadora e códigos de concorrentes (Adelmar, Caramuru etc.).

### Regras de negócio importantes
- Não lançar nem sugerir itens que conflitem com a **Cepam** ou a **JC Rei** (lista de conflitos cadastrável; o sistema alerta).
- A **vulcanização de borracha de moto** (terceirização) fica fora da base de comissão.
- Pedidos da Rochester podem vir com itens das duas origens misturados: o leitor de pedidos separa.
- A **MDM não vende direto ao cliente final** (não concorrer com os lojistas). Ver 4.16.

---

## 4. Módulos do HeadShot Sell

### 4.1 Alvos do Dia (tela inicial)
- Lista de contatos do dia, priorizada pela IA, com motivo, sugestão e potencial em R$. Máximo ~10 alvos por dia (qualidade acima de quantidade).
- Ações: Ligar, WhatsApp (mensagem pronta no estilo do Vitor: curta, sem emoji, com pergunta de fechamento), Registrar abate (venda), Adiar, Sem retorno.
- Dica do dia / briefing da manhã.
- O sistema aprende com o resultado de cada alvo e passa a priorizar o que vira venda.

### 4.2 Painel do Gerente
- Vendas do mês, ano e 12 meses; comparação; projeção de fechamento contra meta.
- Curvas ABC: clientes, produtos, representantes, estados, categorias.
- Saúde da carteira: ativos, em risco, perdidos, novos.
- Alertas do dia, sempre com ação sugerida.
- Linha separada "Canal Mercado Livre".

### 4.3 Clientes
- Ficha: histórico, mix, representante, contatos, anotações, próximas ações.
- Status pelo ritmo de recompra de cada cliente (ativo, em risco, perdido).
- Potencial: mix incompleto, comparação com clientes parecidos, porte via Receita.
- **Detector de item perdido:** cliente continua comprando, mas parou um item específico há 3 ciclos.
- Lista "pode comprar mais", com valor estimado.

### 4.4 Representantes (módulo completo)

**Cadastro e contrato**
- Dados, CORE, região/território (estados e cidades), exclusividade de zona, outras representadas, percentual de comissão, regra (sobre faturado ou recebido), categorias excluídas, data de início, status (em teste, ativo, em alerta, desligado).
- Upload do contrato de representação (Lei 4.886/65) e alerta de vencimento.

**Desempenho**
- Nota de 0 a 100 e diagnóstico pela IA: parou, estacionou, mix estreito, carteira caindo (últimos 3 meses contra os 12 anteriores).
- Faturamento, crescimento, positivação (ativos/carteira), ticket médio, clientes novos, perdidos e recuperados, mix por família e categoria, itens que nunca vende, adoção de lançamentos, visitas, uso do catálogo pelos clientes dele, preços de concorrente registrados.
- Metas pelo potencial do território (pontos de venda, frota, cobertura), não pelo histórico. Meta de faturamento, clientes novos, positivação e lançamentos.
- Comissão gerada no mês (informativa, nota a nota), custo por real vendido.
- Ranking geral e por indicador; comparação entre representantes e com a média.

**Cobranças (acompanhamento)**
- Alertas automáticos: abaixo da meta no meio do mês, abaixo da venda mínima esperada (piso), sem venda há X dias, cliente da carteira em risco, lançamento não oferecido, lead sem contato.
- Mensagem de cobrança pronta (WhatsApp/e-mail), firme e objetiva, com os números e a ação pedida.
- Plano de ação com tarefas, prazo e confirmação do representante.
- Escalada em níveis: aviso → plano de ação → reunião → período de recuperação (ex.: 60 dias) → desligamento. Histórico registrado.
- Pauta automática da reunião semanal/mensal com cada um.

**Premiação e incentivos**
- Campanhas de incentivo com regras: meta, período, prêmio, quem participa.
- Tipos: bônus por meta batida, por cliente novo, por cliente recuperado, por lançamento vendido, por positivação; níveis Bronze/Prata/Ouro; ranking mensal; prêmio anual.
- Prêmio em dinheiro, viagem, produto ou bonificação de comissão.
- Simulação de custo antes de lançar: o prêmio deve sair do ganho extra que a campanha gera.
- Apuração automática e extrato de premiação.
- Placar semanal enviado a todos (competição saudável).

**Relatórios**
- Relatório mensal individual em PDF (desempenho, metas, carteira, clientes em risco, oportunidades, prêmios).
- Relatório consolidado da equipe para os sócios.
- Relatório de visitas (check-in), de lançamentos e de campanhas.
- Extrato de comissão gerada e de premiação.
- Envio automático todo dia 1.

**Campo**
- Check-in de visita com localização e foto da loja.
- Registro rápido de preço de concorrente.
- Kit de visita automático por cliente.

**Visão do representante (portal/app)**
- Carteira, metas e progresso, ranking, prêmios em disputa, alvos do dia dele, leads recebidos, kit de visita, registro de peça pedida, lançamentos e treinamentos.
- Pedido funciona sem sinal (salva no celular e envia quando a internet volta).
- Comissão dele em tempo real, pedido a pedido.
- Rota do dia com kit de visita e Mira só da carteira dele.
- Antes da visita: situação do cliente (em dia, em atraso, bloqueado) e status dos pedidos em aberto.
- **Mídia kit:** posts, status de WhatsApp e catálogo PDF da região com as fotos padronizadas, já personalizados com nome e WhatsApp do representante; material novo gerado pela IA a cada lançamento; só material aprovado.
- **Curva ABC da região dele** comparada com o Brasil, destacando o que vende muito na região e ele ainda não vende.
- **Argumentos de venda:** argumentário por peça (MDM × concorrente) e respostas prontas para objeções ("está caro", "já compro do concorrente", "não tenho espaço").
- **Venda mínima esperada (piso) e potencial da região**, calculados por vendas por mil caminhões das melhores regiões aplicadas à frota e aos pontos de venda dele (antes dos dados de frota: histórico e nº de lojas). Abaixo do piso entra nas cobranças.

**Recrutamento de novos representantes**
- **Mapa de vagas:** regiões sem representante ou com cobertura fraca, com o potencial em R$ de cada uma.
- **Indústrias complementares:** cadastro de fabricantes de linha pesada que não são de borracha e não conflitam com a linha MDM, Cepam e JC Rei (ex.: filtros, iluminação, elétrica, acessórios de cabine, fixadores, mangueiras, palhetas). Os representantes delas já visitam as mesmas lojas de caminhão e podem somar a MDM à pasta.
- **Fontes de candidatos:** páginas "nossos representantes" dessas indústrias, expositores de feiras (Fenatran, Automec), LinkedIn, CORE e, principalmente, **as lojas clientes** ("quem são os representantes que te visitam?"), registrado no CRM.
- **Funil de recrutamento:** prospect → contato → entrevista → período de teste → ativo. Score do candidato (região, representadas compatíveis, carteira, tempo de mercado).
- **Página "Seja representante MDM"** com formulário, que entra direto no funil.
- **Argumento pronto:** mensagem de convite com os números da linha MDM, potencial da região dele e condições.
- **Onboarding:** kit com catálogo instalado, treinamento da linha, carteira inicial de leads da região e metas dos primeiros 90 dias.

### 4.5 Mercado (Radar)
- Mapa: clientes ativos, em risco, perdidos e pontos que nunca compraram (alvos).
- Camada de área de cada representante.
- Cobertura (clientes / pontos potenciais) e vendas por mil caminhões, por estado e cidade.
- Alerta de lojas recém-abertas (Receita, mensal).
- Mercado por aplicação (frota × linha) — ver 4.15.
- Calendário de safra por estado.

### 4.6 CRM de novos clientes
- Funil: lead → contato → catálogo instalado → primeiro pedido → recorrente.
- Score de lead (semelhança com os melhores clientes), distribuição por representante, cadência de retorno.
- Concorrente atual de cada lead.
- Captura de lead em feira por QR code.
- Leads de anúncios entram aqui já triados (ver 4.16).
- Planejador de viagem/rota com kit de visita de cada parada.

### 4.7 Pedidos
- Entrada por catálogo, PDF, foto ou WhatsApp, lida pela IA, com de-para de códigos por cliente (código do cliente, código original Scania/Mercedes etc. → código MDM).
- Pedido entra como "em aberto" e soma no previsto do mês; vira faturado quando a nota é importada.
- **Espelho de pedido em PDF**, gerado automaticamente em duas versões:
  - **Com valor:** cabeçalho MDM, nº do pedido, data, cliente, CNPJ, cidade, representante; tabela com foto miniatura, código MDM, nº original, descrição, aplicação, quantidade, embalagem, preço unitário e total; condição, prazo, observações.
  - **Sem valor:** mesmos itens com foto, sem preço, com caixinha de conferência "separado" (para separação/produção).
  - Envio por WhatsApp/e-mail e impressão; revisão numerada (Rev. 1, Rev. 2) quando o pedido muda.
- Cada pedido gera o link de acompanhamento (ver 4.18).
- O HeadShot não emite nota nem baixa estoque. Exportar pedido para o sistema da MDM (planilha no começo, integração depois).

### 4.8 Identificar peça por foto
- Foto do celular → IA descreve a peça (tipo, material, cor, formato, código gravado) → filtra o catálogo → compara com as fotos dos candidatos → mostra as 3 mais prováveis com grau de certeza.
- Ações: adicionar ao pedido de um cliente, ver ficha, ou registrar no radar de peças se não existir na linha.
- Código gravado na peça leva direto ao item (inclusive peça de concorrente, pelo código cruzado).
- Peças parecidas (tubos, buchas): pedir foto com paquímetro/régua ou as medidas (externo, furo, comprimento).
- Cada confirmação vira mais uma foto de referência. Depois, busca por similaridade de imagem no Supabase (pgvector).
- Depende de fotos boas e padronizadas de toda a linha no catálogo.

### 4.9 Lançamentos e campanhas
- Lançamento com lista de alvos (clientes que compram aquela aplicação) e taxa de adoção em 30/60/90 dias; representantes que ainda não ofereceram.
- Campanhas segmentadas, publicadas no catálogo, com resultado medido.
- Material de divulgação gerado por IA (post, status de WhatsApp, texto para o representante), que alimenta o mídia kit de cada representante.
- Ficha de treinamento do lançamento com teste rápido.
- Programa de mix para lojistas (mais famílias compradas = condição melhor).

### 4.10 Novos produtos (Radar de peças)
- Registro de peças pedidas que a linha não tem (do catálogo, dos representantes, dos leads de anúncios e do Vitor), agrupadas pela IA, com contagem de quem pediu e quantas vezes.
- Busca sem resultado no catálogo entra aqui automaticamente.
- Buracos na linha apontados pela frota (modelo com frota grande sem peça MDM) entram aqui (ver 4.15).
- Checagem de conflito Cepam / JC Rei.
- Mercado Livre como radar de demanda e preço.

### 4.11 IA — "Mira"
- Perguntas em português sobre os dados (ex.: "quais lojas de SC compram borracha mas nunca compraram plástico?"). A IA só lê, nunca altera dados.
- Áudio do WhatsApp vira registro no CRM (transcreve, resume, registra no cliente certo com próxima ação).
- Diagnósticos de cliente e representante em texto.
- Kit de visita automático (PDF de uma página por cliente).
- A parte proativa (insights automáticos) está em 4.15.

### 4.12 Relatórios
- Briefing de segunda-feira (WhatsApp ou e-mail).
- Relatório mensal para os sócios (comparando com o período antes da volta do Vitor).
- Previsão de vendas por item para a produção (próximos 60 dias).
- Pós-venda curto ("chegou tudo certo?").

### 4.13 Minha Comissão (só o Vitor vê)
- Configuração: fixo mensal e percentuais **por categoria**, todos ajustáveis. Proposta atual do Vitor: fixo R$ 5.000 + 1,8% do faturamento bruto + 4% sobre os itens de plástico (no lugar dos 1,8% nesses itens). Também suportar faixa escalonada (percentual maior sobre o crescimento acima de uma base).
- Lista fechada de códigos que contam como "plástico" (cadastrável, com histórico de alterações), para não haver dúvida na apuração.
- Regras da base: vulcanização de moto fora, devoluções descontadas no mês, Mercado Livre dentro ou fora.
- Mês atual: faturado → comissão acumulada; projeção (faturado + carteira + recompras previstas); total previsto (fixo + comissão).
- Previsão de 3 e 6 meses e simulador ("se crescer 20%, quanto recebo com 1,5% e com 2%").
- Antes × depois da volta do Vitor (média dos 6–12 meses anteriores contra o atual).
- Extrato auditável nota por nota e PDF mensal para os sócios.
- **Pendente de definição no acordo:** "faturamento bruto" é o valor total da nota (com IPI e ST) ou só o valor dos produtos.

### 4.14 Mercado Livre
- Conexão pela API oficial, sincronização diária.
- Métricas: faturamento, vendas, unidades, ticket médio; tarifa, frete e publicidade por venda; margem de contribuição por anúncio; ACOS da publicidade; conversão (visitas × vendas); ranking; estado do comprador (alimenta o Radar); perguntas sem resposta, reputação e reclamações.
- **Atenção:** a conta do ML hoje é no CPF do Vitor. Se entrar na base da comissão, as vendas precisam ser faturadas pela MDM.

### 4.15 IA nativa — Mira Analista (proativa)
- Roda sozinha toda madrugada e entrega de 3 a 5 insights por dia: o que viu, os números que provam, valor em R$ e ação em um clique. Vitor marca "útil" ou "não útil" e a IA prioriza o que vira venda.
- **Regra:** números são calculados no banco (SQL, fórmulas fixas). A IA só interpreta e sugere a ação. Nunca inventa valores. Só lê, nunca altera dados.
- Tipos de insight: cesta de compra (quem compra X e nunca comprou Y), item perdido / troca de fornecedor, cliente acelerando, sazonalidade por região (avisar antes do pico), oportunidade por representante, lançamento não oferecido, desempenho dos anúncios (4.16).
- **Frota × aplicação:** cada item tem aplicação estruturada (montadora, modelo, ano inicial, ano final). Cruzando com a frota (Senatran), calcular por item: frota viva que usa a peça (por UF e cidade), idade média dessa frota, tendência (crescendo ou saindo de circulação), vendas por mil caminhões.
- Insights de produto: peça com frota envelhecendo (vai vender mais), peça em declínio (não investir em molde), buraco na linha (modelo com frota grande sem peça MDM → Radar de peças).
- Automações: IA sugere a aplicação de cada item a partir da descrição e do nº original (Vitor confirma), briefing da manhã, mensagens prontas, lembrete de recompra, pós-venda, cobrança de representante.

### 4.16 Leads de anúncios (Instagram/Meta)
- Anúncios impulsionados levam ao WhatsApp do HeadShot (principal), formulário do Instagram e página do site. Cada lead guarda campanha e anúncio de origem.
- Triagem automática pela IA no WhatsApp (máx. 3 perguntas): é para loja/oficina ou para o próprio caminhão; qual peça e caminhão; qual cidade. CNPJ informado é conferido na Receita (CNAE de peças/oficina).
- **B2B** (loja, oficina, frotista): entra no funil do CRM com score, vai para o representante da região com aviso imediato; primeiro passo é instalar o catálogo. Frotista grande é marcado para o Vitor.
- **Cliente final:** a MDM não vende direto (não concorrer com os lojistas). O lead é encaminhado para a loja cliente MDM mais próxima e o Vitor/representante avisa a loja ("mandei um cliente pra você"). Sem loja na cidade: link do Mercado Livre e a cidade vira alvo de prospecção B2B.
- Toda peça pedida por lead alimenta o Radar de peças (se não existe na linha) e a escolha das próximas peças anunciadas.
- Resultado por campanha: gasto, custo por lead, custo por lead B2B, conversão em cliente e vendas geradas. A Mira Analista aponta quais anúncios, regiões e peças trazem lojas.
- LGPD: consentimento na primeira mensagem e exclusão a pedido.
- Regra: não ligar anúncios antes da triagem automática funcionar.

### 4.17 Política comercial
- Tabelas de preço e alçada de desconto por representante; acima do limite o pedido vai para aprovação do Vitor com um clique.
- Margem de cada pedido visível para o Vitor.
- Situação do cliente (em dia, em atraso, bloqueado) somente leitura, vinda do sistema da MDM (planilha no começo).

### 4.18 Pós-venda e garantia
- **Link de acompanhamento do pedido:** cada pedido gera um link próprio (código aleatório, sem login, sem preço) com linha do tempo animada em CSS: Recebido → Em produção → Separado → Faturado → Enviado → Entregue, com data de cada etapa e previsão das próximas. "Faturado" marca sozinho na importação da NF; produção marcada com um clique (depois integração com a MDM); "Enviado" com transportadora e rastreio. Link enviado por WhatsApp a cada mudança. Atraso atualiza a previsão e avisa o representante antes do cliente. Rodapé: logo MDM, "falar com meu representante" e "comprar de novo". "Entregue" dispara o pós-venda.
- Registro de garantia/reclamação com motivo, foto e lote; relatório de peças com mais defeito para a produção.

### 4.19 Programa do balconista
- Balconista cadastrado ganha pontos por peça MDM vendida (código ou QR da embalagem) e troca por prêmios.
- Dá preferência à MDM no balcão e gera dado de venda na ponta (sell-out).

---

## 5. Catálogo eletrônico MDM (programa separado)

### REGRA PRINCIPAL: muito parecido com o catálogo da BR Company / Ideia 2001
Todo o mercado de autopeças de linha pesada (balconistas, lojistas, distribuidores, representantes) já está acostumado com os catálogos feitos pela Ideia 2001, como o da BR Company. O catálogo da MDM precisa ter **o mesmo layout, a mesma ordem de campos, as mesmas posições e o mesmo fluxo de uso**, para que qualquer balconista use sem aprender nada.

- Copiar a **estrutura e o funcionamento**, não a marca: logo, nome, cores e textos são da MDM. Nada de logo, nome ou identidade da BR Company ou da Ideia 2001.
- As melhorias da MDM entram **dentro do layout conhecido**, nas mesmas posições (ex.: o preço aparece no campo "PREÇO" que já existe; a quantidade entra na linha da tabela). Nunca reorganizar a tela.
- Visual de catálogo de PC clássico: telas densas, tabelas com linhas finas, campos alinhados à direita dos rótulos, botões com ícone. No celular, a mesma estrutura empilhada.

### Tela de busca (inicial) — layout de referência
- **Topo:** logo da MDM à esquerda; texto "Atualizado em: DD-MMM-AAAA"; links "Verificar Atualizações" (no nosso: mostra a versão, a atualização é automática) e "Configurações"; à direita, 5 botões quadrados com ícone: **Carrinho**, **Informações**, **Contato (@)**, **Representantes**, **Ajuda (?)**.
- **Coluna esquerda "Linha de Produtos":** 3 botões de filtro (Todos, Promoções $, Lançamentos !) e, abaixo, a lista rolável de montadoras (Agrale, Carreta, Cummins, DAF, Ford, Iveco, Mercedes, Scania, Volvo, VW…). Clicar numa montadora lista os itens dela.
- **Formulário central, nesta ordem, rótulo à esquerda e campo à direita:** Palavra Chave · Código | Nº Referência · Fabricante (lista) · Veículo · Montadora (lista) · Grupo (lista).
- **Direita do formulário:** botões **Promoções** e **Lançamentos** no alto; **BUSCAR** embaixo, com o link "Limpar Campos".
- **Rodapé da área central:** banner com o logo da MDM e o link para o site.

### Tela de resultado — layout de referência
- **Topo:** igual ao da busca, com o botão **Voltar** à direita.
- **Tabela de resultados, nestas colunas:** ícone de carrinho · **Código** (ordenável) · **Nº Original** · **Descrição** · **Unid.** · **Prom.** (ícone $ com a data de validade, ex.: "30 NOV"). Linha selecionada em azul claro. Contador "N Produtos Encontrados" abaixo.
- **Painel direito "Especificações":** Qtd. por Embalagem · NCM · Peso (kg) · Fabricante.
- **Painel inferior (faixa larga):** **Nº Conversão** (montadora + código equivalente, uma linha por código) · **Aplicação** (montadora + modelo, ex.: "VOLVO · VM TODOS") · **Informações de compra** (Importado, Produto, IPI, ICMS ST) · **foto do produto** à direita. Rodapé da faixa: **Grupo** à esquerda e **PREÇO** à direita.

### Melhorias da MDM (sem mudar o layout acima)

- **Formato:** app instalável (PWA) no computador do balcão e no celular; atualiza sozinho (sem "verificar atualizações").
- **Busca:** palavra-chave, código MDM, nº original, código de concorrente, fabricante, veículo, montadora, grupo, medida. Coluna lateral com montadoras e filtros Todos / Promoções / Lançamentos.
- **Resultado:** lista com código, nº original, descrição, unidade, promoção com validade e carrinho na linha (com campo de quantidade). Painel de especificações (qtd. por embalagem, NCM, peso). Números de conversão, aplicações, IPI/ICMS ST, várias fotos com zoom e desenho com medidas, grupo e preço.
- **Cliente logado (CNPJ):** vê a tabela de preço dele (base, por grupo ou especial), o representante dele com WhatsApp, "comprar de novo", promoções e lançamentos. Sem login: catálogo sem preço.
- **Carrinho:** enviar cotação ou pedido; pedido mínimo, múltiplo de embalagem, validade da promoção. Cai no HeadShot, gera espelho e avisa o representante.
- **Painel de gestão:** produtos, fotos, aplicações, equivalências, tabelas de preço, vínculo cliente → tabela e representante, promoções com data, avisos de lançamento.
- **Devolve dados ao HeadShot:** busca sem resultado (radar de peças), produto visto e não comprado (lead quente), carrinho abandonado, uso por cliente.
- Marcação de disponibilidade: "pronta entrega" ou "sob encomenda (X dias)".

---

## 6. Visual: dois temas (Configurações → Aparência)

Os dois temas usam as mesmas telas e a mesma estrutura; só muda a "pele". Menus com nomes padrão.

### Tema Retrô (estilo Windows 98)
- Fundo de área de trabalho verde-água (#008080) com ícones; barra de tarefas com botão Iniciar, programas abertos e relógio na bandeja.
- Cinza clássico #C0C0C0 com relevo 3D (sombras inset branco/#DFDFDF/#808080/#0A0A0A) em botões, abas, campos afundados e group boxes com título na borda.
- Barra de título em degradê #000080 → #1084D0; menus com letra de atalho sublinhada; barra de ferramentas com ícones e texto; árvore de pastas com + e −.
- Indicadores em visor de LCD (fundo preto, número verde em fonte monoespaçada).
- Barras de progresso em blocos; gráficos estilo Excel antigo com barras em relevo.
- Seleção em azul-marinho #000080 com contorno pontilhado.
- "Dica do dia" como janela de diálogo com "Mostrar ao iniciar" e OK.
- Fonte Tahoma / MS Sans Serif, 12px. Biblioteca de referência: 98.css.
- Splash de abertura com barra de carregamento; som de "abate" desligável.

### Tema Moderno (minimalista)
- Fundo claro #F6F7F9, superfícies brancas, bordas finas #E6E8EC, muito espaço em branco.
- Texto #111418, secundário #6B7280.
- Uma única cor de destaque: vermelho do alvo #C8102E, só no que exige atenção (prioridade alta, risco, insight da IA). Verde #1F7A4D para positivo, âmbar #E0A100 para atenção.
- Fontes Geist (texto) e Geist Mono (números e atalhos).
- Menu lateral simples com contadores; Mira como barra de busca no topo com atalho F2; indicadores como números grandes sem caixas; listas limpas com duas linhas por item; barras finas.
- Cantos arredondados 8–12px.

### Comum aos dois
- Atalhos de teclado: F2 Mira, F3 Alvos, F5 sincronizar.
- Toda tela abre em menos de 1 segundo.
- Toda informação termina em uma ação.

---

## 7. Ordem de construção (cronograma a partir de 19/10/2026)

Prazo-chave: etapas 0 a 3 prontas até 6/12/2026, para a reunião com os sócios em dezembro. Início na MDM em janeiro de 2027. Celular em primeiro lugar em todas as telas (o Vitor vai viver na estrada).

**Dados:** os dados da MDM só ficam disponíveis depois do acordo assinado. Até lá, o sistema é construído e testado com os **dados reais da KAER** (XMLs da NOXX e exportações do Fabris ERP), que funciona como piloto. Depois do acordo (dezembro), importar os XMLs da MDM dos últimos 24 meses e gerar o diagnóstico inicial e a base oficial de 2026 em janeiro. Tudo precisa funcionar com uma ou duas empresas sem mudar código.

0. **Preparação (19–25/out):** repositório GitHub privado, projeto Supabase, Vercel, CLAUDE.md na raiz, estrutura Next.js; padrões profissionais (ambiente de teste, auditoria, aviso de erro, teto de IA).
1. **Base (26/out–8/nov):** login e perfis (admin, sócio, representante), catálogo único MDM com de-para KAER, classificação dos itens, aplicação estruturada por item (montadora, modelo, ano início/fim) com sugestão pela IA, importação de XML de NF-e, cliente unificado por CNPJ, tabela de leads com tipo (B2B/cliente final), origem e campanha, os dois temas (Retrô e Moderno), layout responsivo.
2. **BI (9–22/nov):** Painel do Gerente, Clientes (status por recompra, ABC, detector de item perdido, "pode comprar mais"), Produtos, Representantes (desempenho e nota).
3. **Ação (23/nov–6/dez):** Alvos do Dia, Mira (perguntas à IA), Mira Analista v1 (cesta de compra, item perdido, cliente acelerando, sazonalidade), simulador da Minha Comissão, relatório de diagnóstico da MDM para a reunião.
4. **Estrada (dezembro):** Pedidos (leitor de PDF/foto, espelho com e sem valor), pedido funciona sem sinal, link de acompanhamento do pedido com linha do tempo animada, identificação de peça por foto, planejador de viagem, áudio vira registro no CRM, kit de visita, triagem automática de leads no WhatsApp e encaminhamento do cliente final para a loja mais próxima.
5. **Catálogo eletrônico MDM (jan–fev/2027)**, programa separado.
6. **Representantes completo (fev–mar/2027):** cobranças, premiação, relatórios, portal do representante (comissão em tempo real, rota do dia, argumentário, mídia kit, ABC da região, piso e potencial), política comercial e alçada de desconto, recrutamento.
7. **Mercado e CRM (mar–abr/2027):** Radar (Receita, Google Maps, Senatran), CRM de novos clientes, frota × aplicação (frota viva, idade média, peça em declínio, buraco na linha).
8. **Mercado Livre, lançamentos, campanhas, radar de peças e relatórios automáticos (abr–mai/2027).**
9. **.exe com Tauri e IA avançada (jun/2027).**
10. **Pós-venda, garantia e programa do balconista (2º semestre/2027).**

Cada etapa precisa funcionar e entregar valor sozinha antes da próxima.

**Regra de escopo:** a especificação está fechada em 19/10/2026. Ideias novas entram na seção 9 (lista de 2027) e não mexem nas etapas 0 a 3 nem na data de 6/12.

---

## 8. Princípios

- Dados limpos antes de tudo (de-para de códigos e CNPJs sem duplicata).
- Poucos alvos certeiros por dia, não listas enormes.
- O sistema aprende com o resultado de cada ação.
- Simples para os representantes, senão eles não usam.
- Dados de clientes e preços são o ativo mais sensível: acesso por perfil e backup diário.
- A IA interpreta, o banco calcula: nenhum número exibido é inventado pela IA.

---

## 9. Lista de ideias para 2027

(Ideias novas entram aqui, com data, e só viram etapa depois da Etapa 3 pronta.)

- —
- Supabase criado em São Paulo, com "expor tabelas automaticamente" desligado e RLS automático ligado. Toda migration que cria tabela deve incluir os GRANTs necessários para os papéis do Data API e as políticas de RLS de cada perfil.
