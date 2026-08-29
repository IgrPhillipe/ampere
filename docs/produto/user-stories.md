# Histórias de Usuário

Backlog de histórias do AMPERE, escritas em BDD, com critérios de confirmação e cenários de validação. São 7 histórias divididas em dois épicos: **Perfil Projetista** (US01–US05) e **Perfil Analista** (US06–US07).

Cada história corresponde a uma tela do protótipo Lo-Fi: [Protótipo LO-FI no Figma](https://www.figma.com/design/gSwTyjY0iSzmDNAe4s6XeE/Prot%C3%B3tipo-LO-FI?node-id=18-4).

Entrega 01 de POO ([`../cronograma-poo.md`](../cronograma-poo.md)) · Contexto do produto: [`objetivos-projeto.md`](objetivos-projeto.md) · Norma aplicada: [`../tecnico/fontes-normativas.md`](../tecnico/fontes-normativas.md)

---

## **US01 – Acompanhamento de Projetos e Status**

| Nível de dificuldade | Prioridade | Épico | Sprint |
| :---- | :---- | :---- | :---- |
| Baixo | Alta | Épico 1 - Perfil Projetista | Sprint 1 |

### **User Story**

Como projetista externo, quero acompanhar todos os meus projetos e o status de cada um em um painel centralizado para que eu saiba exatamente quais exigem ação sem depender de e-mail ou telefone.

### **Descrição**

Painel de gestão centralizada para acompanhamento, filtragem e consulta do status de tramitação dos projetos elétricos submetidos.

### **Conversação**

A listagem deve apresentar nome do projeto, endereço, quantidade de UCs, demanda calculada, status e data da última atualização. A barra superior deve contar com filtros por situação (Todos, Rascunho, Em análise, Reprovado e Aprovado) exibindo a contagem numérica de cada estado. Para projetos reprovados, deve haver o atalho direto "Ver apontamentos".

### **Checklist de Confirmação**

☐  Filtrar projetos por status exibindo os contadores numéricos de cada situação

☐  Exibir atalho "Ver apontamentos" para redirecionar projetos reprovados

### **Confirmação**

**Cenário 1 (Positivo): Visualizar projetos com apontamentos de reprovação**

**Dado que** o projetista está autenticado na tela "Meus Projetos"

**Quando** clica no filtro "Reprovado"

**Então** o sistema exibe apenas os projetos reprovados

**E** apresenta a quantidade de pendências de cada um com o link "Ver apontamentos".

**Cenário 2 (Negativo): Busca por projeto inexistente**

**Dado que** o projetista está na tela "Meus Projetos"

**Quando** digita um nome ou protocolo inexistente no campo de busca

**Então** a tabela não retorna registros e exibe a mensagem "Nenhum projeto encontrado para os critérios informados".

## **US02 – Configuração Inicial dos Parâmetros da Edificação**

| Nível de dificuldade | Prioridade | Épico | Sprint |
| :---- | :---- | :---- | :---- |
| Médio | Alta | Épico 1 - Perfil Projetista | Sprint 1 |

### **User Story**

Como projetista externo, quero informar os parâmetros da edificação uma única vez para que o próprio sistema determine automaticamente a norma e as tabelas aplicadas ao cálculo, eliminando divergências de interpretação.

### **Descrição**

Formulário de parametrização técnica e identificação predial para seleção e aplicação automatizada das normas vigentes da concessionária.

### **Conversação**

O formulário recolhe dados de identificação (nome, endereço, município) e parâmetros técnicos (tipo de edificação, pavimentos, tensão, tipo de ligação e padrão de entrada). O sistema bloqueia a seleção manual da norma e atribui automaticamente a NDU correspondente (ex.: NDU 001 — rev. 5.6). Permite também o upload prévio de planilha .xlsx para autopreenchimento.

### **Checklist de Confirmação**

☐  Definir norma aplicável automaticamente a partir dos parâmetros técnicos

☐  Bloquear o avanço caso existam campos obrigatórios não preenchidos

### **Confirmação**

**Cenário 1 (Positivo): Seleção automática da norma regulamentadora**

**Dado que** o projetista está na etapa "Dados da edificação"

**Quando** preenche os parâmetros técnicos selecionando tipo "Residencial multifamiliar", tensão "380/220 V" e padrão "Coletivo"

**Então** o sistema define e exibe automaticamente o campo "Norma aplicável: NDU 001 — rev. 5.6"

**E** habilita o botão "Avançar".

**Cenário 2 (Negativo): Avanço bloqueado por campos obrigatórios não preenchidos**

**Dado que** o projetista iniciou um novo projeto

**Quando** tenta avançar sem informar o "Tipo de edificação" ou "Padrão de entrada"

**Então** o avanço para a etapa 2 é bloqueado

**E** os campos obrigatórios vazios são destacados com mensagens de validação.

## **US03 – Cadastro e Validação em Tempo Real de Unidades Consumidoras**

| Nível de dificuldade | Prioridade | Épico | Sprint |
| :---- | :---- | :---- | :---- |
| Alto | Alta | Épico 1 - Perfil Projetista | Sprint 2 |

### **User Story**

Como projetista externo, quero cadastrar as unidades consumidoras agrupadas por tipo e receber validações técnicas instantâneas para que eu possa corrigir inconsistências antes da submissão formal.

### **Descrição**

Interface de agrupamento de cargas por tipologia com motor de validação assíncrono para captura preventiva de erros normativos.

### **Conversação**

Permite adicionar ou importar UCs agrupadas (apartamentos, áreas comuns, recarga de veículo elétrico). O sistema aplica a tabela normativa respectiva a cada grupo (Tabela 3, Tabela 5, Tabela 6) e exibe um painel de validação em tempo real, bloqueando o avanço e sinalizando pendências críticas (ex.: motores acima de 5 CV sem fator de partida ou falta de indicação de gerenciamento de carga veicular).

### **Checklist de Confirmação**

☐  Validar regras técnicas e normativas em tempo real durante o preenchimento

☐  Bloquear o cálculo de demanda enquanto houver grupos com pendência ("Falta dado")

### **Confirmação**

**Cenário 1 (Positivo): Importação de planilha de UCs sem inconsistências**

**Dado que** o projetista está na etapa "Unidades consumidoras"

**Quando** faz o upload de uma planilha .xlsx com todas as cargas e fatores em conformidade

**Então** a tabela é preenchida com o status "Validado" em cada grupo de UCs

**E** o botão "Calcular demanda" fica ativo para prosseguir.

**Cenário 2 (Negativo): Inconsistência técnica em carga especial bloqueia o cálculo**

**Dado que** o projetista cadastrou 6 pontos de recarga de veículo elétrico sem informar o sistema de gerenciamento de carga

**Quando** visualiza o painel de validação em tempo real

**Então** o grupo de recarga veicular recebe o status "Falta dado"

**E** o cálculo de demanda fica desabilitado até a regularização pelo atalho "Informar dado".

## **US04 – Conferência do Cálculo Passo a Passo da Demanda**

| Nível de dificuldade | Prioridade | Épico | Sprint |
| :---- | :---- | :---- | :---- |
| Alto | Alta | Épico 1 - Perfil Projetista | Sprint 2 |

### **User Story**

Como projetista externo, quero visualizar a memória de cálculo de demanda detalhada passo a passo com a regra normativa usada para que eu possa auditar o dimensionamento e sustentá-lo tecnicamente.

### **Descrição**

Detalhamento transparente da memória de cálculo de demanda, exibindo fórmulas, critérios normativos aplicados e dimensionamento elétrico geral.

### **Conversação**

A tela divide o cálculo em 5 etapas visíveis: demanda residencial, demanda de áreas comuns, cargas especiais, fator de diversidade e conversão para kVA. Ao lado, exibe o painel de rastreabilidade técnica com demanda ativa total (kW), fator de potência, corrente projetada (A), padrão de entrada sugerido, disjuntor de proteção e seção do ramal de entrada.

### **Checklist de Confirmação**

☐  Exibir memória de cálculo aberta em 5 etapas com fórmulas e referências normativas

☐  Apresentar dados de rastreabilidade elétrica (demanda ativa, disjuntor e ramal sugerido)

### **Confirmação**

**Cenário 1 (Positivo): Visualização completa da memória de cálculo**

**Dado que** todas as UCs foram validadas na etapa anterior

**Quando** o projetista acessa a etapa "Cálculo de demanda"

**Então** o sistema exibe o painel consolidado com a Demanda Total em kVA (ex.: 236,0 kVA) e as 5 etapas abertas com suas respectivas fórmulas

**E** habilita o botão "Gerar memorial".

**Cenário 2 (Positivo/Navegação): Retornar para ajuste sem perda de dados**

**Dado que** o projetista está conferindo o cálculo na etapa 3

**Quando** clica no botão "Voltar" para alterar a quantidade de UCs

**Então** o sistema retorna à etapa 2 mantendo os dados preenchidos anteriormente para edição.

## **US05 – Geração de Memorial e Envio do Projeto**

| Nível de dificuldade | Prioridade | Épico | Sprint |
| :---- | :---- | :---- | :---- |
| Médio | Alta | Épico 1 - Perfil Projetista | Sprint 3 |

### **User Story**

Como projetista externo, quero gerar o memorial descritivo padronizado no formato da Neoenergia e validar o checklist documental para que a submissão ocorra sem risco de reprovação por documentação incompleta.

### **Descrição**

Geração automatizada do memorial descritivo padronizado em formato concessionária acompanhado de checklist de conformidade documental pré-envio.

### **Conversação**

O sistema compila e apresenta o preview do memorial descritivo em PDF com opção de download (PDF/planilha). Apresenta a seção "Checagem antes do envio", exigindo a confirmação dos dados, UCs, cálculo e o anexo obrigatório dos arquivos técnicos (ART, Diagrama unifilar e Planta de situação) para liberar o botão de submissão.

### **Checklist de Confirmação**

☐  Gerar pré-visualização do memorial descritivo em PDF padronizado

☐  Bloquear envio do projeto até que todos os documentos obrigatórios estejam anexados

### **Confirmação**

**Cenário 1 (Positivo): Submissão concluída com checklist completo**

**Dado que** o memorial foi gerado e todos os itens do checklist (incluindo ART, diagrama unifilar e planta) estão checados/anexados

**Quando** o projetista clica em "Enviar para análise"

**Então** o projeto é submetido à fila da concessionária

**E** o status do projeto muda para "Em análise" na tela inicial.

**Cenário 2 (Negativo): Envio impedido por pendência em documento técnico obrigatório**

**Dado que** o projetista está na etapa "Memorial e envio" e o "Diagrama unifilar (PDF)" ainda não foi anexado

**Quando** visualiza a lista de checagem antes do envio

**Então** o item exibe o ícone de alerta com o botão "anexar"

**E** o botão "Enviar para análise" permanece desabilitado.

## **US06 – Fila de Análise Técnica Priorizada**

| Nível de dificuldade | Prioridade | Épico | Sprint |
| :---- | :---- | :---- | :---- |
| Médio | Alta | Épico 2 - Perfil Analista | Sprint 3 |

### **User Story**

Como analista da Neoenergia, quero visualizar a fila de projetos ordenada por prazo de vencimento e pré-validada pelo sistema para que eu possa priorizar os atendimentos críticos e focar a análise no julgamento técnico humano.

### **Descrição**

Painel de triagem técnica com métricas de produtividade, ordenação por SLA e sinalização dos alertas levantados pelo motor de pré-validação.

### **Conversação**

A tela exibe indicadores consolidados no topo (total de projetos na fila, vencendo o prazo, analisados no dia e taxa de reprovação no mês). A tabela traz a listagem ordenada pela urgência de prazo de atendimento (ex.: vence hoje, atrasado, dias restantes) e expõe badges com a quantidade de alertas normativos identificados previamente pelo sistema.

### **Checklist de Confirmação**

☐  Ordenar fila de análise por urgência de prazo de atendimento (SLA)

☐  Exibir badges com a quantidade de alertas da pré-validação automática

### **Confirmação**

**Cenário 1 (Positivo): Filtrar projetos prioritários com prazo crítico**

**Dado que** o analista está autenticado na "Fila de análise"

**Quando** clica no filtro "Vencendo prazo"

**Então** a listagem exibe apenas projetos com status de SLA urgente ("vence hoje" ou "atrasado")

**E** exibe a indicação de alertas automáticos levantados pelo sistema.

**Cenário 2 (Positivo/Acesso): Iniciar análise de projeto da fila**

**Dado que** o analista seleciona o projeto com protocolo "2026-0481"

**Quando** clica no botão "Analisar"

**Então** é redirecionado para o ambiente de conferência e apontamentos do projeto (H7).

## **US07 – Auditoria de Memória e Registro Pontual de Apontamentos**

| Nível de dificuldade | Prioridade | Épico | Sprint |
| :---- | :---- | :---- | :---- |
| Alto | Alta | Épico 2 - Perfil Analista | Sprint 4 |

### **User Story**

Como analista da Neoenergia, quero conferir a memória de cálculo pré-validada e registrar apontamentos vinculados diretamente à etapa do erro para que o projetista corrija apenas o item divergente sem necessitar de retrabalho total.

### **Descrição**

Ambiente de auditoria normativa da memória de cálculo com ferramenta de apontamentos granulares vinculados diretamente às etapas do projeto.

### **Conversação**

O analista visualiza o painel de validações do sistema e os dados submetidos. É possível aprovar diretamente o projeto ou abrir apontamentos categorizados como "Bloqueante" ou "Ajuste", vinculados obrigatoriamente a uma etapa (ex.: Cargas especiais, Documentos). Na reprovação, o sistema dispara a notificação e direciona o projetista diretamente para a etapa apontada.

### **Checklist de Confirmação**

☐  Registrar apontamentos categorizados e vinculados à etapa exata da divergência

☐  Concluir decisão de aprovação ou reprovação pontual atualizando o status do projeto

### **Confirmação**

**Cenário 1 (Positivo): Aprovação de projeto regular**

**Dado que** o analista conferiu a memória de cálculo e os documentos anexos sem inconsistências

**Quando** clica no botão "Aprovar projeto" e confirma a decisão

**Então** o status do projeto é alterado para "Aprovado"

**E** o histórico da auditoria é registrado com sucesso.

**Cenário 2 (Negativo/Fluxo de Reprovação): Reprovação com apontamento específico vinculado**

**Dado que** o analista identificou a ausência de comprovação do sistema de gerenciamento de recarga veicular

**Quando** cadastra o apontamento bloqueante vinculado à "Etapa 3 — cargas especiais" e clica em "Reprovar com apontamentos"

**Então** o projeto tem o status alterado para "Reprovado" com o número de pendências registrado

**E** o projetista recebe o apontamento direcionado exclusivamente para a etapa vinculada no seu painel.