# Auditoria do Front Contra o Figma

Comparação do front com o [Protótipo Hi-Fi](https://www.figma.com/design/tbMeH3sx9YwDVb6oz7bCBG/Prot%C3%B3tipo-HI-FI), feita em 08/11/2026 sobre a `main` (`2fbcc02d`).

**Regra:** o Figma é a fonte do estilo. O front se ajusta a ele, e o Figma não muda. Telas sem protótipo seguem o mesmo sistema, a partir do padrão mais próximo.

**Método:** 22 frames exportados do Figma e 26 telas do sistema capturadas a 1440 px, com o seed do `DemoScenarios` e os perfis projetista, analista e admin. As regras de estilo vêm da página "Documentação: Hierarquia visual" e das variáveis do arquivo.

**Severidade:** Alta muda a leitura da tela (base, hierarquia, estado por cor). Média é componente compartilhado fora do padrão. Baixa é tamanho ou espaçamento pontual.

---

## 1. Base

Nenhum token do Figma existe no código. Corrigir a base resolve a maior parte das divergências de uma vez.

| Fundamento | Figma | Front | Arquivo |
| :--- | :--- | :--- | :--- |
| Fonte | Geist (texto) e Geist Mono (toda medição) | IBM Plex Sans e IBM Plex Mono | `styles/index.css`, `styles/tokens.css` |
| Escala | Mono 60 (resultado), 40 (título da tela), 19 (seção), 15,5 (item), 13,5 (corpo), 13 (link), 12 (micro), mono 10,5 com 1,2 de espaçamento (etiqueta) | 12 a 30 px, título da tela em 30 | `tokens.css` (`--ds-text-*`) |
| Peso | Medium em título e rótulo, SemiBold só em número | SemiBold em títulos, nomes e botões | `components/ui/button.tsx`, páginas |
| Tinta | `#1E1A13` | `#002015` (verde quase preto) | `tokens.css` (`--neo-ink`) |
| Tons de texto | Médio `#60594B` e fraco `#857C6B` | `#615D5A`; não há tom fraco | `tokens.css` |
| Mesa | `#E7E5E0`, com o conteúdo numa folha branca | Fundo branco, sem folha | `tokens.css`, `AppLayout`, `PageLayout` |
| Bordas | `#DED7C9`, `#D4CBBA`, `#EAE4D9` | `#D8CFC7` e `#B0A9A3` | `tokens.css` |
| Campo de conclusão | `#00702E` | `#007F33`, com tile ativo `#00402A` | `tokens.css`, `FilterTiles` |
| Cor de erro | Não existe. Atenção é `#FF9C1A` | `#C00000` em badge, botão, campo, toast e alerta | `tokens.css`, `badge.tsx`, `button.tsx`, `field.tsx`, `Providers.tsx` |
| Espaçamento | 6, 12, 20 e 38 px | 4, 8, 16, 24 e 48 px | `tokens.css` (`--ds-space-*`) |
| Fios | Seção 1,5 px em tinta, grupo e linha 1 px | 1 px e 2 px misturados, cabeçalho de tabela 2 px verde | `components/ui/table.tsx`, títulos de seção |
| Forma | Cantos retos, sem sombra | `rounded-xs` a `rounded-full`, sombra no botão | `card.tsx`, `badge.tsx`, `button.tsx` |

O [`design-system-front.md`](../tecnico/design-system-front.md) põe o site da Neoenergia acima do protótipo na precedência. A ordem passa a ser o Figma primeiro.

## 2. Padrões Recorrentes

| # | Divergência | Figma | Front | Severidade | Onde corrigir |
| :-: | :--- | :--- | :--- | :-: | :--- |
| 1 | Mesa e folha | Barra superior sobre a mesa, conteúdo na folha branca recuada 32 px | Tudo branco de ponta a ponta, header com fio inferior | Alta | `AppLayout`, `PageLayout`, `Header` |
| 2 | Situação | Texto mono em versalete, sem cor | Pílula colorida (verde, vermelha, azul, amarela) | Alta | `badge.tsx`, `ProjectStatusBadge`, `DeadlineStatusBadge`, `UserRoleBadge`, `UserStatusBadge`, `NormativeTableStatusBadge` |
| 3 | Linha que pede ação | Barra de 2 px na margem esquerda | Ícone circular vermelho ou amarelo, ou barra de 4 px vermelha | Alta | `AttentionIndicator`, `ActionRequiredList`, `DataTable` |
| 4 | Vermelho | Não existe | Excluir, remover anexo, parecer da reprovação, erro de campo, toasts `richColors` | Alta | `button.tsx` (`destructive*`), `field.tsx`, `ReviewOpinion`, `SubmissionChecklistPanel`, `Providers.tsx` |
| 5 | Campo de conclusão | Um por tela, `#00702E`, dentro da folha | Faixa de ponta a ponta, tile ativo em segundo verde, ausente na análise, no memorial e na correção, encostado nas bordas em Dados | Alta | Componente compartilhado para `FilterTiles`, `DashboardIndicators`, `ValidationPanel`, `TraceabilityPanel`, `ReworkPanel`, `SubmissionChecklistPanel`, `ProjectDataPage` |
| 6 | Cabeçalho de página | Eyebrow em versalete, título 40 Medium, descrição em coluna à direita | Sem eyebrow, título 30 SemiBold, descrição embaixo | Média | `PageLayout` |
| 7 | Título de seção | 19 Medium com fio de 1,5 px em tinta | 20 SemiBold com fio de 1 ou 2 px | Média | Novo `SectionHeading` |
| 8 | Cabeçalho de tabela | Mono 10,5 em versalete, tom fraco, fio 1,5 px em tinta | Sans 12 SemiBold, fio 2 px verde, ícones de ordenação | Média | `components/ui/table.tsx`, `DataTable` |
| 9 | Ação da linha | Link de texto em tinta "Ação →", igual em todas as linhas | Botão verde cheio nas urgentes e link nas demais | Média | `RowAction`, `InlineActionButton` |
| 10 | Verde em texto e borda | Nunca sobre o papel | Item ativo da navegação, links, botão `outline`, "Baixar", "+ Adicionar Grupo" | Média | `HeaderNav`, `button.tsx` (`outline`, `link`) |
| 11 | Campo de formulário | Rótulo mono em versalete, fio de 1 px bege, erro em laranja | Rótulo sans em caixa alta, fio de 2 px cinza, erro vermelho | Média | `field.tsx`, `input.tsx`, `select.tsx` |
| 12 | Botão bloqueado | Vazado em cinza claro | Cinza preenchido | Média | `button.tsx` (`disabled:`) |
| 13 | Filtros | Chips com contagem na linha da busca | Tiles verdes clicáveis e dropdowns numa segunda linha | Média | `ListToolbar`, `FilterTiles`, `FilterMenu` |
| 14 | Acento preenchendo superfície | Nunca | Pílulas e fundos laranja em resumo, abas e alertas | Média | `attention-severity.ts`, `ProjectSummary`, `ProjectSectionNav` |
| 15 | Medidas em sans | Toda medição em mono | Contadores de preenchimento, revisão da norma, último acesso | Baixa | `ProjectDataPage`, `LastAccessCell` |
| 16 | Estado vazio | Texto na folha, sem cor | Card tracejado arredondado com ícone em círculo verde | Média | `EmptyState` |

## 3. Por Tela

### Projetista

| Tela | Principais divergências além dos padrões | Severidade |
| :--- | :--- | :-: |
| H1 Meus Projetos | Header com logo AMPERE, avatar e sem sino; colunas Protocolo e Pendências a mais, Situação antes de UCs | Média |
| H1b Detalhes | Grade de 9 células com bordas no lugar da lista rótulo e valor; "Excluir Projeto" vermelho; sem campo de conclusão | Alta |
| H11 Painel | Faixa de indicadores de ponta a ponta; "Exige Ação" com barra e texto vermelhos; "Atrasado" em pílula vermelha | Alta |
| H15 Criar Conta e Entrar | Card centralizado arredondado com sombra, sem barra da marca nem folha; botão de largura total; link verde | Alta |
| H16 Meu Perfil | Sem fio entre cabeçalho e corpo; "Alterar Senha" como botão verde contornado; sem rodapé de ações com fio | Média |

### Fluxo do Projeto

| Tela | Principais divergências além dos padrões | Severidade |
| :--- | :--- | :-: |
| Cabeçalho do projeto | Breadcrumb, endereço e 8 a 10 métricas ocupam cerca de 330 px; o h1 é o nome do projeto e falta o par "ETAPA 0X" e nome da etapa; dois primários por tela (cabeçalho e rodapé) | Alta |
| Faixa de etapas | 7 abas sem índice, com ícones e pílula laranja; Figma tem 5 etapas com índice mono e fio de 2 px | Alta |
| H2 Dados | `/projetos/novo` sem faixa de etapas nem ficha; campo da norma encostado nas bordas; contadores em sans | Alta |
| H3 Unidades | "Calcular Demanda" liberado em contorno verde; coluna Fator mostra "AUTO" | Média |
| H4 Cálculo | Verificação automática vira seção inteira acima da decomposição; aviso de desatualizado com borda laranja de 4 px; destaque do número oficial em verde claro, não `#F0F2EC` | Alta |
| H5 Memorial | Sem campo de conclusão (checagem 06/06); primário "Ir para Documentos" no lugar de "Enviar para análise" | Alta |
| Documentos | Remover anexo em vermelho; "Baixar" em verde; rótulos quebram por falta de largura | Média |
| H9 Correção | Correção na Visão Geral, não na etapa; sem campo de conclusão com os bloqueantes; parecer em caixa vermelha; resumo das alterações na lateral com alerta vermelho | Alta |
| Rodapé de etapa | Voltar como botão verde com texto; Figma usa quadrado de 40 px só com a seta | Média |

### Analista e Admin

| Tela | Principais divergências além dos padrões | Severidade |
| :--- | :--- | :-: |
| H6 Fila | 11 colunas: a tabela estoura a folha em 1440 px e corta o "Analisar"; 6 tiles clicáveis no lugar de 4 indicadores; prazo em pílula colorida | Alta |
| H7 Análise | Sem campo de conclusão da triagem; formulário de apontamento antes da lista; abre na Visão Geral, não na Memória de Cálculo | Alta |
| H8 Histórico | O analista vê três colunas e a linha do tempo fica espremida; botão de ordenação verde | Alta |
| H17 Usuários | Perfil e situação em pílulas coloridas; ações num menu ⋮ no lugar de links visíveis; senha temporária em diálogo, não em faixa | Alta |
| Tabelas Normativas | Situação em pílulas; "Revisar" em botão verde; filtros em dropdowns | Alta |

## 4. Telas do Figma Sem Implementação

| Frame | Situação |
| :--- | :--- |
| H5b Envio Concluído | Sem tela e sem sprint. O envio volta para `/projetos/$id` |
| H10 Reenvio Concluído | Sem tela e sem sprint. O reenvio volta para a Visão Geral |
| H12 Indicadores e H13 Meus Pareceres | #138, Sprint 9 |
| H14 Comparativo de Versões | #126, Sprint 8 |
| Notificações (projetista e analista) | #129, Sprint 8 |

As telas da Distribuição (US23) e do Painel do Administrador (US24) não estão no Hi-Fi. Seguem o padrão de listagem do H6 e do H17 e o painel do H11.

## 5. Padrões Para as Telas em Desenvolvimento

### H12 Indicadores (#138)

- Seletor de período segmentado, com o selecionado preenchido em tinta.
- Campo de conclusão em toda a largura da folha, com eyebrow, 4 números mono e fios verticais de meia altura. Não é clicável.
- Corpo em duas colunas separadas por fio vertical de 1 px.
- Ranking com barra fina `#00702E` sobre trilho bege, cantos retos, contagem mono à direita.
- Gráfico semanal com barras agrupadas azul e verde, sem eixo nem grade, legenda em versalete.

### H13 Meus Pareceres (#138)

- Busca, chips com contagem e dropdowns numa linha só, com fio abaixo.
- Sem campo de conclusão.
- Decisão em versalete, sem cor. Protocolo, UCs, demanda, versão e data em mono.
- Sem barra na margem e sem coluna de ação: a linha abre a análise em consulta.

### H14 Comparativo de Versões (#126)

- Ficha no topo com protocolo, projetista, "v02 → v03" e demanda.
- A coluna direita inteira é o campo de conclusão: "O que mudou" com o total em mono 60 e os itens numerados.
- Tabela da memória com colunas v02, v03 e Δ em mono. Linhas alteradas com fundo bege claro e barra laranja de 2 px.
- "Verificar autenticidade pelo código" como link em versalete.

### Notificações (#129)

- Painel de cerca de 380 px, borda de 1 px, cantos retos.
- Não lida: texto em tinta e barra de 2 px em tinta na margem. Lida: tom médio, sem barra.
- Horário em mono versalete fraco. Sem ícones, pontos coloridos ou contador colorido no sino.

## 6. O que o Front Tem a Mais

Colunas Protocolo e Pendências, filtros por UF, município e data, menu ⋮, breadcrumb, abas Visão Geral, Documentos e Histórico, e o painel "O que Acontece Agora". As funções ficam e passam a seguir o estilo do Figma.
