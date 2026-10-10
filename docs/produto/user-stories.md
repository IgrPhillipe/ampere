# Documento de Histórias de Usuário (User Stories)

> **Sistema de Gestão e Análise de Projetos Elétricos**  
> Especificação detalhada de requisitos, regras de negócio e critérios de aceitação (BDD) para o fluxo de submissão, cálculo normativo e auditoria técnica.

---

## Tabela de Conteúdos

1. [Visão Geral e Matriz de Rastreabilidade](#visão-geral-e-matriz-de-rastreabilidade)
2. [US01: Acompanhamento de Projetos e Status](#us01-acompanhamento-de-projetos-e-status)
3. [US02: Configuração Inicial dos Parâmetros da Edificação](#us02-configuração-inicial-dos-parâmetros-da-edificação)
4. [US03: Cadastro e Validação em Tempo Real de Unidades Consumidoras](#us03-cadastro-e-validação-em-tempo-real-de-unidades-consumidoras)
5. [US04: Conferência do Cálculo Passo a Passo da Demanda](#us04-conferência-do-cálculo-passo-a-passo-da-demanda)
6. [US05: Geração de Memorial e Envio do Projeto](#us05-geração-de-memorial-e-envio-do-projeto)
7. [US06: Fila de Análise Técnica Priorizada](#us06-fila-de-análise-técnica-priorizada)
8. [US07: Auditoria de Memória e Registro Pontual de Apontamentos](#us07-auditoria-de-memória-e-registro-pontual-de-apontamentos)
9. [US08: Linha do Tempo e Histórico do Protocolo](#us08-linha-do-tempo-e-histórico-do-protocolo)
10. [US09: Correção de Apontamentos e Reenvio com Versionamento](#us09-correção-de-apontamentos-e-reenvio-com-versionamento)
11. [US10: Cadastro e Perfil do Projetista](#us10-cadastro-e-perfil-do-projetista)
12. [US11: Gestão de Usuários](#us11-gestão-de-usuários)
13. [US12: Detalhe do Projeto e Histórico de Tratamento](#us12-detalhe-do-projeto-e-histórico-de-tratamento)
14. [US13: Versão Congelada do Envio](#us13-versão-congelada-do-envio)
15. [US14: Notificações no Sistema](#us14-notificações-no-sistema)
16. [US15: Prazos de Análise e Validade da Aprovação](#us15-prazos-de-análise-e-validade-da-aprovação)
17. [US16: Painel do Projetista](#us16-painel-do-projetista)
18. [US17: Painel do Analista](#us17-painel-do-analista)
19. [US18: Filtros e Ordenação das Listagens](#us18-filtros-e-ordenação-das-listagens)
20. [US19: Exportação em Planilha](#us19-exportação-em-planilha)
21. [US20: Exclusão de Projeto em Rascunho](#us20-exclusão-de-projeto-em-rascunho)

---

## Visão Geral e Matriz de Rastreabilidade

| ID | Título da História | Persona / Papel | Prioridade | Sprint |
| :--- | :--- | :--- | :---: | :---: |
| **US01** | [Acompanhamento de Projetos e Status](#us01-acompanhamento-de-projetos-e-status) | Projetista Externo | `Alta` | `Sprint 1` |
| **US02** | [Configuração Inicial dos Parâmetros da Edificação](#us02-configuração-inicial-dos-parâmetros-da-edificação) | Projetista Externo | `Alta` | `Sprint 1` |
| **US03** | [Cadastro e Validação em Tempo Real de Unidades Consumidoras](#us03-cadastro-e-validação-em-tempo-real-de-unidades-consumidoras) | Projetista Externo | `Alta` | `Sprint 2` |
| **US04** | [Conferência do Cálculo Passo a Passo da Demanda](#us04-conferência-do-cálculo-passo-a-passo-da-demanda) | Projetista Externo | `Alta` | `Sprint 2` |
| **US05** | [Geração de Memorial e Envio do Projeto](#us05-geração-de-memorial-e-envio-do-projeto) | Projetista Externo | `Alta` | `Sprint 3` |
| **US06** | [Fila de Análise Técnica Priorizada](#us06-fila-de-análise-técnica-priorizada) | Analista da Concessionária | `Alta` | `Sprint 3` |
| **US07** | [Auditoria de Memória e Registro Pontual de Apontamentos](#us07-auditoria-de-memória-e-registro-pontual-de-apontamentos) | Analista da Concessionária | `Alta` | `Sprint 4` |
| **US08** | [Linha do Tempo e Histórico do Protocolo](#us08-linha-do-tempo-e-histórico-do-protocolo) | Analista da Concessionária | `Média` | `Sprint 6` |
| **US09** | [Correção de Apontamentos e Reenvio com Versionamento](#us09-correção-de-apontamentos-e-reenvio-com-versionamento) | Projetista Externo | `Alta` | `Sprint 5` |
| **US10** | [Cadastro e Perfil do Projetista](#us10-cadastro-e-perfil-do-projetista) | Projetista Externo | `Média` | `Sprint 8` |
| **US11** | [Gestão de Usuários](#us11-gestão-de-usuários) | Administrador da Neoenergia | `Média` | `Sprint 9` |
| **US12** | [Detalhe do Projeto e Histórico de Tratamento](#us12-detalhe-do-projeto-e-histórico-de-tratamento) | Projetista Externo | `Alta` | `Sprint 6` |
| **US13** | [Versão Congelada do Envio](#us13-versão-congelada-do-envio) | Analista da Concessionária | `Média` | `Sprint 8` |
| **US14** | [Notificações no Sistema](#us14-notificações-no-sistema) | Projetista e Analista | `Média` | `Sprint 8` |
| **US15** | [Prazos de Análise e Validade da Aprovação](#us15-prazos-de-análise-e-validade-da-aprovação) | Analista da Concessionária | `Média` | `Sprint 9` |
| **US16** | [Painel do Projetista](#us16-painel-do-projetista) | Projetista Externo | `Média` | `Sprint 8` |
| **US17** | [Painel do Analista](#us17-painel-do-analista) | Analista da Concessionária | `Média` | `Sprint 9` |
| **US18** | [Filtros e Ordenação das Listagens](#us18-filtros-e-ordenação-das-listagens) | Projetista e Analista | `Alta` | `Sprint 5` |
| **US19** | [Exportação em Planilha](#us19-exportação-em-planilha) | Projetista e Analista | `Baixa` | `Sprint 9` |
| **US20** | [Exclusão de Projeto em Rascunho](#us20-exclusão-de-projeto-em-rascunho) | Projetista Externo | `Média` | `Sprint 4` |

---

## US01: Acompanhamento de Projetos e Status

`US01` `Prioridade: Alta` `Sprint 1`

### Descrição
Painel de gestão centralizada para acompanhamento, filtragem e consulta do status de tramitação dos projetos elétricos submetidos.

### User Story
> **Como** projetista externo,  
> **Quero** acompanhar todos os meus projetos e o status de cada um em um painel centralizado,  
> **Para que** eu saiba quais exigem ação sem depender de e-mail ou telefone.

### Conversação (Regras de Negócio e Interface)
A listagem deve apresentar:
- Nome do projeto
- Endereço
- Quantidade de UCs
- Demanda calculada
- Status
- Data da última atualização

A barra superior deve contar com filtros por situação (**Todos**, **Rascunho**, **Aguardando envio**, **Em análise**, **Reprovado** e **Aprovado**) exibindo a contagem numérica de cada estado. Para projetos reprovados, deve haver o atalho direto `"Ver apontamentos"`.

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Visualizar Projetos com Apontamentos de Reprovação
- **Dado** que o projetista está autenticado na tela "Meus Projetos"
- **Quando** clica no filtro "Reprovado"
- **Então** o sistema exibe apenas os projetos reprovados
- **E** apresenta a quantidade de pendências de cada um com o link "Ver apontamentos".

#### Cenário 2 (Negativo): Busca por Projeto Inexistente
- **Dado** que o projetista está na tela "Meus Projetos"
- **Quando** digita um nome ou protocolo inexistente no campo de busca
- **Então** a tabela não retorna registros e exibe a mensagem *"Nenhum projeto encontrado para os critérios informados"*.

### Checklist de Implementação
- [ ] Filtrar projetos por status exibindo os contadores numéricos de cada situação
- [ ] Exibir atalho "Ver apontamentos" para redirecionar projetos reprovados

---

## US02: Configuração Inicial dos Parâmetros da Edificação

`US02` `Prioridade: Alta` `Sprint 1`

### Descrição
Formulário de parametrização técnica e identificação predial para seleção e aplicação automatizada das normas vigentes da concessionária.

### User Story
> **Como** projetista externo,  
> **Quero** informar os parâmetros da edificação uma única vez,  
> **Para que** o próprio sistema determine automaticamente a norma e as tabelas aplicadas ao cálculo, eliminando divergências de interpretação.

### Conversação (Regras de Negócio e Interface)
O formulário recolhe dados de:
- **Identificação:** nome, endereço, município
- **Parâmetros técnicos:** tipo de edificação, pavimentos, tensão, tipo de ligação e padrão de entrada

O sistema bloqueia a seleção manual da norma e atribui automaticamente as normas aplicáveis a partir dos parâmetros informados. O método se divide entre duas normas da Neoenergia Pernambuco, revisadas de forma independente. O projeto registra as duas revisões aplicadas:

- **DIS-NOR-053 REV 06**: estrutura do cálculo e método da área útil. O tipo de edificação define o método pelos itens 6.22 a 6.25.
- **DIS-NOR-030 REV 07**: método da carga instalada, item 6.27.

O sistema não importa planilhas: os dados são informados no próprio formulário.

> Detalhamento do método e das tabelas em [`../tecnico/fontes-normativas.md`](../tecnico/fontes-normativas.md) e [`../tecnico/engine-calculo.md`](../tecnico/engine-calculo.md).

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Seleção Automática da Norma Regulamentadora
- **Dado** que o projetista está na etapa "Dados da edificação"
- **Quando** preenche os parâmetros técnicos selecionando tipo "Residencial multifamiliar", tensão "380/220 V" e padrão "Coletivo"
- **Então** o sistema define e exibe automaticamente o campo "Norma aplicável: DIS-NOR-053 REV 06 e DIS-NOR-030 REV 07"
- **E** habilita o botão "Avançar".

#### Cenário 2 (Negativo): Avanço Bloqueado por Campos Obrigatórios Não Preenchidos
- **Dado** que o projetista iniciou um novo projeto
- **Quando** tenta avançar sem informar o "Tipo de edificação" ou "Padrão de entrada"
- **Então** o avanço para a etapa 2 é bloqueado
- **E** os campos obrigatórios vazios são destacados com mensagens de validação.

### Checklist de Implementação
- [ ] Definir norma aplicável automaticamente a partir dos parâmetros técnicos
- [ ] Bloquear o avanço caso existam campos obrigatórios não preenchidos

---

## US03: Cadastro e Validação em Tempo Real de Unidades Consumidoras

`US03` `Prioridade: Alta` `Sprint 2`

### Descrição
Interface de agrupamento de cargas por tipologia com motor de validação assíncrono para captura preventiva de erros normativos.

### User Story
> **Como** projetista externo,  
> **Quero** cadastrar as unidades consumidoras agrupadas por tipo e receber validações técnicas instantâneas,  
> **Para que** eu possa corrigir inconsistências antes da submissão formal.

### Conversação (Regras de Negócio e Interface)
Permite adicionar UCs agrupadas (apartamentos, áreas comuns, recarga de veículo elétrico), informadas no próprio sistema, sem importação de planilha. O sistema aplica a tabela normativa respectiva a cada grupo (Tabela 3, Tabela 5, Tabela 6) e exibe um painel de validação em tempo real, bloqueando o avanço e sinalizando pendências críticas (ex.: motores acima de 5 CV sem fator de partida ou falta de indicação de gerenciamento de carga veicular).

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Cadastro de Grupos de UCs sem Inconsistências
- **Dado** que o projetista está na etapa "Unidades consumidoras"
- **Quando** adiciona os grupos de UCs com todas as cargas e fatores em conformidade
- **Então** cada grupo da tabela recebe o status "Validado"
- **E** o botão "Calcular demanda" fica ativo para prosseguir.

#### Cenário 2 (Negativo): Inconsistência Técnica ou Pendência Bloqueia o Cálculo
- **Dado** que o projetista possui grupos com dados pendentes de validação técnica ou confirmação de potência
- **Quando** visualiza o painel de validação em tempo real
- **Então** os grupos recebem o status "Revisar" ou "Falta dado"
- **E** o botão "Calcular demanda" permanece desabilitado até a regularização pelos atalhos de ação ("Corrigir agora" ou "Informar dado").

### Checklist de Implementação
- [ ] Validar regras técnicas e normativas em tempo real durante o preenchimento
- [ ] Bloquear o cálculo de demanda enquanto houver grupos com pendência ("Falta dado")

---

## US04: Conferência do Cálculo Passo a Passo da Demanda

`US04` `Prioridade: Alta` `Sprint 2`

### Descrição
Detalhamento transparente da memória de cálculo de demanda, exibindo fórmulas, critérios normativos aplicados e dimensionamento elétrico geral.

### User Story
> **Como** projetista externo,  
> **Quero** visualizar a memória de cálculo de demanda detalhada passo a passo com a regra normativa usada,  
> **Para que** eu possa auditar o dimensionamento e sustentá-lo tecnicamente.

### Conversação (Regras de Negócio e Interface)
A tela divide o cálculo em 5 etapas visíveis, na notação do Anexo I da DIS-NOR-053. Cada parcela é expressa em kVA, com o fator de potência definido pela DIS-NOR-030. Não há etapa de conversão:
1. `Drf`: demanda das unidades residenciais (Quadros 35, 36 e 37)
2. `Ds`: demanda das áreas comuns (DIS-NOR-030, item 6.27)
3. `Dc`: demanda das cargas comerciais (DIS-NOR-030, item 6.27)
4. `Dve`: demanda da recarga de veículos elétricos (Quadro 33)
5. `Ded`: demanda total da edificação, com o mínimo por tensão (Tabelas 1 e 2)

Ao lado, exibe o painel de rastreabilidade técnica com:
- Demanda calculada (kVA)
- Mínimo por tensão (kVA)
- Tensão de fornecimento
- Corrente projetada (A)
- Padrão de entrada
- Proteção geral (disjuntor)
- Seção do ramal de entrada

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Visualização Completa da Memória de Cálculo
- **Dado** que todas as UCs foram validadas na etapa anterior
- **Quando** o projetista acessa a etapa "Cálculo de demanda"
- **Então** o sistema exibe o painel consolidado com a Demanda Total em kVA (ex.: 165,0 kVA) e as 5 etapas abertas com suas respectivas fórmulas
- **E** habilita o botão "Gerar memorial".

#### Cenário 2 (Positivo/Navegação): Retornar para Ajuste sem Perda de Dados
- **Dado** que o projetista está conferindo o cálculo na etapa 3
- **Quando** clica no botão "Voltar" para alterar a quantidade de UCs
- **Então** o sistema retorna à etapa 2 mantendo os dados preenchidos anteriormente para edição.

### Checklist de Implementação
- [x] Exibir memória de cálculo aberta em 5 etapas com fórmulas e referências normativas
- [x] Apresentar dados de rastreabilidade elétrica (demanda, disjuntor e ramal)

---

## US05: Geração de Memorial e Envio do Projeto

`US05` `Prioridade: Alta` `Sprint 3`

### Descrição
Geração automatizada do memorial descritivo padronizado em formato concessionária acompanhado de checklist de conformidade documental pré-envio na etapa unificada de Memorial e Envio.

### User Story
> **Como** projetista externo,  
> **Quero** gerar o memorial descritivo padronizado no formato da Neoenergia e validar o checklist documental,  
> **Para que** a submissão ocorra sem risco de reprovação por documentação incompleta.

### Conversação (Regras de Negócio e Interface)
O sistema compila e apresenta o preview do memorial descritivo em PDF na etapa unificada de Memorial e Envio, com opção de download em PDF. A exportação em planilha fica na [US19](#us19-exportação-em-planilha).  
Apresenta a seção **"Checagem antes do envio"**, exigindo a confirmação dos dados, UCs, cálculo e o anexo obrigatório dos arquivos técnicos:
- ART (Anotação de Responsabilidade Técnica)
- Diagrama unifilar
- Planta de situação

Libera o botão de submissão após validação para concluir o protocolo do projeto.

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Submissão Concluída com Checklist Completo
- **Dado** que o memorial foi gerado e todos os itens do checklist (incluindo ART, diagrama unifilar e planta) estão checados/anexados
- **Quando** o projetista clica em "Enviar para análise"
- **Então** o projeto é submetido à fila da concessionária
- **E** o status do projeto muda para "Em análise" na tela inicial.

#### Cenário 2 (Negativo): Envio Impedido por Pendência em Documento Técnico Obrigatório
- **Dado** que o projetista está na etapa "Memorial e envio" e o "Diagrama unifilar (PDF)" ainda não foi anexado
- **Quando** visualiza a lista de checagem antes do envio
- **Então** o item exibe o ícone de alerta com o botão "anexar"
- **E** o botão "Enviar para análise" permanece desabilitado.

### Checklist de Implementação
- [ ] Gerar pré-visualização do memorial descritivo em PDF padronizado
- [ ] Bloquear envio do projeto até que todos os documentos obrigatórios estejam anexados

---

## US06: Fila de Análise Técnica Priorizada

`US06` `Prioridade: Alta` `Sprint 3`

### Descrição
Painel de triagem técnica com métricas de produtividade, ordenação por SLA e sinalização dos alertas levantados pelo motor de pré-validação.

### User Story
> **Como** analista da Neoenergia,  
> **Quero** visualizar a fila de projetos ordenada por prazo de vencimento e pré-validada pelo sistema,  
> **Para que** eu possa priorizar os atendimentos críticos e focar a análise no julgamento técnico humano.

### Conversação (Regras de Negócio e Interface)
A tela exibe indicadores consolidados no topo:
- Total de projetos na fila
- Vencendo o prazo
- Analisados no dia
- Taxa de reprovação no mês

A tabela traz a listagem ordenada pela urgência de prazo de atendimento (ex.: vence hoje, atrasado, dias restantes) e expõe badges com a quantidade de alertas normativos identificados previamente pelo sistema.

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Filtrar Projetos Prioritários com Prazo Crítico
- **Dado** que o analista está autenticado na "Fila de análise"
- **Quando** clica no filtro "Vencendo prazo"
- **Então** a listagem exibe apenas projetos com status de SLA urgente ("vence hoje" ou "atrasado")
- **E** exibe a indicação de alertas automáticos levantados pelo sistema.

#### Cenário 2 (Positivo/Acesso): Iniciar Análise de Projeto da Fila
- **Dado** que o analista seleciona o projeto com protocolo "2026-0481"
- **Quando** clica no botão "Analisar"
- **Então** é redirecionado para o ambiente de conferência e apontamentos do projeto ([US07](#us07-auditoria-de-memória-e-registro-pontual-de-apontamentos)).

### Checklist de Implementação
- [ ] Ordenar fila de análise por urgência de prazo de atendimento
- [ ] Exibir badges com a quantidade de alertas levantados pela pré-validação do sistema

---

## US07: Auditoria de Memória e Registro Pontual de Apontamentos

`US07` `Prioridade: Alta` `Sprint 4`

### Descrição
Ambiente de auditoria normativa da memória de cálculo com ferramenta de apontamentos granulares vinculados diretamente às etapas do projeto.

### User Story
> **Como** analista da Neoenergia,  
> **Quero** conferir a memória de cálculo pré-validada e registrar apontamentos vinculados diretamente à etapa do erro,  
> **Para que** o projetista corrija apenas o item divergente sem necessitar de retrabalho total.

### Conversação (Regras de Negócio e Interface)
O analista visualiza o painel de validações do sistema e os dados submetidos.  
É possível:
- Aprovar diretamente o projeto
- Abrir apontamentos categorizados como **"Bloqueante"** ou **"Ajuste"**, vinculados obrigatoriamente a uma etapa (ex.: Cargas especiais, Documentos).

Na reprovação, o sistema notifica o projetista dentro do próprio sistema ([US14](#us14-notificações-no-sistema)) e o direciona para a etapa apontada no seu painel.

**Regras do apontamento:**
- Ao clicar em "Analisar" na fila, o projeto fica atribuído ao analista. Outro analista vê o projeto como "Em análise por" e o nome do responsável.
- O apontamento nasce de duas formas: pelo atalho "Virar Apontamento" de um alerta da verificação automática, que já traz a etapa e o item da norma, ou pelo formulário da lateral.
- Cada apontamento registra a gravidade (**Bloqueante** ou **Ajuste**), a etapa (Dados da edificação, Unidades consumidoras com o grupo, Cálculo com a parcela, ou Documentos com o tipo), a descrição, o item da norma quando houver, o autor e a data.
- Até a decisão, os apontamentos ficam em rascunho e podem ser editados ou excluídos pelo analista.
- "Aprovar Projeto" só é liberado sem apontamento bloqueante aberto. "Reprovar com Apontamentos" exige ao menos um apontamento. As duas decisões pedem confirmação e registram o parecer.
- Os anexos do projeto abrem em um visualizador de PDF na aba "Documentos".
- Na reanálise, os apontamentos da versão anterior aparecem com a resposta do projetista. O analista aceita a correção, que fecha o apontamento, ou o reabre.

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Aprovação de Projeto Regular
- **Dado** que o analista conferiu a memória de cálculo e os documentos anexos sem inconsistências
- **Quando** clica no botão "Aprovar projeto" e confirma a decisão
- **Então** o status do projeto é alterado para "Aprovado"
- **E** o histórico da auditoria é registrado com sucesso.

#### Cenário 2 (Negativo/Fluxo de Reprovação): Reprovação com Apontamento Específico Vinculado
- **Dado** que o analista identificou a ausência de comprovação do sistema de gerenciamento de recarga veicular
- **Quando** cadastra o apontamento bloqueante vinculado à "Etapa 3: cargas especiais" e clica em "Reprovar com apontamentos"
- **Então** o projeto tem o status alterado para "Reprovado" com o número de pendências registrado
- **E** o projetista recebe o apontamento direcionado exclusivamente para a etapa vinculada no seu painel.

#### Cenário 3 (Negativo): Aprovação Bloqueada por Apontamento Bloqueante Aberto
- **Dado** que o analista registrou um apontamento bloqueante no projeto
- **Quando** visualiza as ações do rodapé
- **Então** o botão "Aprovar Projeto" permanece desabilitado
- **E** o sistema indica que o apontamento bloqueante precisa ser excluído ou o projeto reprovado.

#### Cenário 4 (Positivo): Reanálise de Apontamento Corrigido
- **Dado** que o projeto voltou à fila como "Reanálise" com a resposta do projetista a um apontamento
- **Quando** o analista confere a correção e clica em "Aceitar Correção"
- **Então** o apontamento passa a "Resolvido"
- **E** deixa de contar como pendência para a aprovação.

### Checklist de Implementação
- [ ] Atribuir o projeto ao analista que inicia a análise
- [ ] Registrar apontamentos categorizados e vinculados à etapa exata da divergência
- [ ] Concluir decisão de aprovação ou reprovação pontual atualizando o status do projeto
- [ ] Abrir os anexos do projeto em um visualizador de PDF
- [ ] Aceitar ou reabrir os apontamentos respondidos na reanálise

---

## US08: Linha do Tempo e Histórico do Protocolo

`US08` `Prioridade: Média` `Sprint 6`

### Descrição
Painel de rastreabilidade temporal e métricas de retrabalho com histórico cronológico de versões e movimentações do protocolo.

### User Story
> **Como** analista da Neoenergia,  
> **Quero** consultar a linha do tempo e os indicadores de retrabalho do protocolo,  
> **Para que** eu possa acompanhar o histórico de versões e pendências antes de emitir a decisão final.

### Conversação (Regras de Negócio e Interface)
A tela exibe a linha do tempo dos eventos cronológicos (versões, triagens automáticas, reprovações e reenvios) com opção de alternar a ordenação.  
Na lateral, apresenta o card de ciclo de aprovação em dias e a tabela de métricas de retrabalho:
- Versões submetidas
- Ciclos de análise
- Apontamentos resolvidos
- Apontamentos em aberto
- Etapas do cálculo refeitas

Preserva as ações de aprovação e reprovação no rodapé.

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Visualizar Linha do Tempo e Indicadores de Retrabalho
- **Dado** que o analista está na tela de análise do projeto
- **Quando** seleciona a aba "Histórico"
- **Então** o sistema exibe os eventos cronológicos de tramitação do protocolo
- **E** apresenta o painel com o ciclo em dias e as métricas de retrabalho consolidadas.

#### Cenário 2 (Positivo/Navegação): Inverter a Ordenação dos Marcos Temporais
- **Dado** que o analista está visualizando a linha do tempo do protocolo
- **Quando** clica no botão de ordenação "Mais recente primeiro"
- **Então** a listagem inverte a ordem de exibição, listando os registros mais antigos no topo.

### Checklist de Implementação
- [ ] Exibir a linha do tempo cronológica com eventos, responsáveis e detalhamento dos marcos
- [ ] Apresentar os indicadores de dias de ciclo de aprovação e contadores de retrabalho

---

## US09: Correção de Apontamentos e Reenvio com Versionamento

`US09` `Prioridade: Alta` `Sprint 5`

### Descrição
Interface de correção pontual das pendências apontadas pela concessionária com controle automático de versionamento e reenvio do projeto sem perda dos dados já validados.

### User Story
> **Como** projetista externo,  
> **Quero** acessar a lista de apontamentos da reprovação, corrigir apenas as etapas indicadas e reenviar uma nova versão do projeto,  
> **Para que** eu não precise refazer o processo do zero.

### Conversação (Regras de Negócio e Interface)
Ao clicar em "Ver apontamentos" na tela inicial, o projetista abre o painel da nova versão (ex.: Versão 2).  
A tela lista os apontamentos classificados como:
- **Bloqueante**
- **Ajuste**

Conta com atalhos que abrem a etapa exata onde ocorreu a divergência. O projetista faz os ajustes, registra uma justificativa com as alterações feitas e o sistema incrementa a versão do projeto. O botão de reenvio fica desabilitado enquanto houver apontamento bloqueante pendente de resolução.

**Regras da correção:**
- O projeto reprovado volta a ser editável. A etapa apontada mostra um selo no grupo, na parcela ou no documento indicado.
- Para cada apontamento, o projetista marca "Corrigido" com uma resposta curta, ou "Contestar" com uma justificativa, quando discorda do apontamento.
- Um apontamento bloqueante conta como tratado quando foi corrigido ou contestado.
- O reenvio recalcula a demanda e devolve o projeto à fila marcado como "Reanálise".

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Reenvio Bem-Sucedido de Nova Versão Corrigida
- **Dado** que o projetista corrigiu todas as pendências bloqueantes e preencheu o resumo das alterações
- **Quando** clica no botão "Reenviar projeto"
- **Então** o sistema incrementa o contador de versão do projeto (ex.: Versão 2)
- **E** atualiza o status na tela inicial para "Em análise", encaminhando o projeto de volta para a fila da concessionária.

#### Cenário 2 (Negativo): Tentativa de Reenvio com Pendência Bloqueante Aberta
- **Dado** que o projetista está na tela de reenvio e possui ao menos um apontamento bloqueante não corrigido
- **Quando** visualiza as opções de submissão
- **Então** o botão "Reenviar projeto" permanece desabilitado
- **E** o sistema exibe alerta indicando a obrigatoriedade de sanar todos os pontos bloqueantes antes de reenviar.

#### Cenário 3 (Positivo/Alternativo): Contestação de Apontamento
- **Dado** que o projetista discorda de um apontamento bloqueante
- **Quando** clica em "Contestar" e registra a justificativa
- **Então** o apontamento passa a "Contestado" e deixa de bloquear o reenvio
- **E** a justificativa aparece para o analista na reanálise.

### Checklist de Implementação
- [ ] Listar todos os apontamentos da análise anterior com links para edição direta nas etapas vinculadas
- [ ] Responder cada apontamento como corrigido ou contestado
- [ ] Incrementar automaticamente o número da versão e bloquear o reenvio enquanto houver pendência bloqueante aberta

---

## US10: Cadastro e Perfil do Projetista

`US10` `Prioridade: Média` `Sprint 8`

### Descrição
Cadastro do projetista externo com os dados profissionais que identificam o responsável técnico no projeto, no carimbo e no memorial.

### User Story
> **Como** projetista externo,  
> **Quero** criar minha conta e manter meus dados profissionais no sistema,  
> **Para que** meus projetos saiam identificados com o responsável técnico sem que eu precise digitar os dados a cada envio.

### Conversação (Regras de Negócio e Interface)
A tela de login ganha o link "Criar Conta". O cadastro pede:
- Nome completo, e-mail e senha
- Número do CREA com a UF
- Empresa (opcional) e telefone

O e-mail é único no sistema e a senha segue a política mínima (8 caracteres, com letra e número). A conta criada recebe o papel de projetista; analistas são criados pelo administrador ([US11](#us11-gestão-de-usuários)).

A página "Meu Perfil", no menu do usuário, permite editar os dados e trocar a senha. O nome e o CREA passam a preencher o campo "Responsável técnico" do carimbo do projeto e a identificação do memorial em PDF.

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Cadastro Concluído e Responsável Técnico Preenchido
- **Dado** que o projetista está na tela "Criar Conta"
- **Quando** preenche nome, e-mail, senha e CREA válidos e clica em "Criar Conta"
- **Então** o sistema cria a conta com o papel de projetista e abre "Meus Projetos"
- **E** os projetos criados por ele exibem o nome e o CREA no campo "Responsável técnico".

#### Cenário 2 (Negativo): E-mail Já Cadastrado
- **Dado** que já existe uma conta com o e-mail informado
- **Quando** o projetista tenta concluir o cadastro
- **Então** o sistema não cria a conta
- **E** exibe a mensagem *"Já existe uma conta com este e-mail."* no campo de e-mail.

### Checklist de Implementação
- [ ] Criar conta de projetista com dados profissionais e política de senha
- [ ] Editar perfil e trocar senha
- [ ] Exibir o responsável técnico no carimbo e no memorial

---

## US11: Gestão de Usuários

`US11` `Prioridade: Média` `Sprint 9`

### Descrição
Área administrativa para criar analistas, desativar contas e redefinir senhas, sem depender de inserção manual no banco.

### User Story
> **Como** administrador da Neoenergia,  
> **Quero** gerenciar os usuários do sistema e seus papéis,  
> **Para que** a equipe de análise tenha acesso controlado e contas indevidas possam ser bloqueadas.

### Conversação (Regras de Negócio e Interface)
A tela "Usuários", visível só para o administrador, lista nome, e-mail, papel, situação (Ativo ou Inativo) e último acesso, com busca e filtro por papel.

Ações disponíveis:
- **Novo Usuário:** cria um analista com senha temporária, exibida uma única vez na tela.
- **Desativar e Reativar:** a conta inativa não entra no sistema e a sessão aberta é encerrada no próximo acesso à API.
- **Redefinir Senha:** gera uma senha temporária. No próximo login, o usuário é obrigado a trocá-la.

O sistema não envia e-mail: a senha temporária é repassada pelo administrador. Um administrador não pode desativar a própria conta.

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Criação de Analista com Senha Temporária
- **Dado** que o administrador está na tela "Usuários"
- **Quando** cria um usuário com o papel "Analista"
- **Então** o sistema exibe a senha temporária uma única vez
- **E** no primeiro login o analista é levado à troca obrigatória de senha.

#### Cenário 2 (Negativo): Acesso de Conta Desativada
- **Dado** que o administrador desativou a conta de um projetista
- **Quando** esse projetista tenta entrar no sistema
- **Então** o login é recusado com a mensagem *"Conta desativada. Procure a Neoenergia."*
- **E** nenhuma rota da API responde com o token anterior.

### Checklist de Implementação
- [ ] Listar, criar, desativar e reativar usuários
- [ ] Redefinir senha com troca obrigatória no próximo login
- [ ] Bloquear o acesso de contas inativas

---

## US12: Detalhe do Projeto e Histórico de Tratamento

`US12` `Prioridade: Alta` `Sprint 6`

### Descrição
Painel lateral com o resumo do projeto e o histórico de tratamento, aberto a partir da listagem, e consulta somente leitura das etapas de projetos já enviados.

### User Story
> **Como** projetista externo,  
> **Quero** abrir qualquer projeto da minha listagem e ver o resumo e o histórico de tratamento,  
> **Para que** eu entenda em que ponto o projeto está e o que aconteceu com ele sem precisar navegar pelas etapas.

### Conversação (Regras de Negócio e Interface)
Clicar em uma linha de "Meus Projetos" abre o painel lateral (protótipo H1b) com:
- Protocolo, nome, endereço e situação com o número de apontamentos em aberto
- Unidades, demanda calculada, data de criação, última movimentação e responsável técnico
- Histórico de tratamento em ordem cronológica inversa: criação, envios com a versão, reprovações com o número de apontamentos e aprovação, com data, autor e papel

O rodapé muda conforme a situação:
- **Rascunho:** "Continuar Preenchimento", que abre a primeira etapa incompleta
- **Em análise e Aprovado:** "Abrir Projeto", que abre as etapas em modo somente leitura
- **Reprovado:** "Abrir Projeto" e "Ver Apontamentos" ([US09](#us09-correção-de-apontamentos-e-reenvio-com-versionamento))

No modo somente leitura, os campos e os botões de edição ficam ocultos e o topo exibe a faixa "Projeto enviado em" com a data.

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Consulta do Histórico de um Projeto Reprovado
- **Dado** que o projetista está em "Meus Projetos"
- **Quando** clica na linha do projeto "Condomínio Vila Nova", reprovado com 3 apontamentos
- **Então** o painel lateral exibe o resumo e o histórico com o envio da versão 1 e a reprovação
- **E** o rodapé oferece "Abrir Projeto" e "Ver Apontamentos".

#### Cenário 2 (Negativo): Tentativa de Edição de Projeto Enviado
- **Dado** que o projeto está "Em análise"
- **Quando** o projetista abre a etapa "Unidades consumidoras"
- **Então** a etapa é exibida em modo somente leitura, sem "Adicionar Grupo" nem edição dos grupos
- **E** o topo indica a data do envio.

### Checklist de Implementação
- [ ] Abrir o painel lateral com resumo e histórico ao clicar na linha da listagem
- [ ] Exibir as ações do rodapé conforme a situação do projeto
- [ ] Exibir as etapas de projetos enviados em modo somente leitura

---

## US13: Versão Congelada do Envio

`US13` `Prioridade: Média` `Sprint 8`

### Descrição
Registro imutável de cada envio, com o memorial, o cálculo e os documentos da versão, como evidência da análise.

### User Story
> **Como** analista da Neoenergia,  
> **Quero** que cada envio fique registrado exatamente como foi submetido,  
> **Para que** a minha análise e o parecer se refiram a uma versão que não muda depois.

### Conversação (Regras de Negócio e Interface)
No envio e em cada reenvio, o sistema grava a versão do projeto com:
- Número da versão, data e autor do envio
- O memorial em PDF gerado naquele momento, com o protocolo, a versão e a data impressos no rodapé
- O cálculo usado e os documentos anexados
- O resumo das alterações informado no reenvio ([US09](#us09-correção-de-apontamentos-e-reenvio-com-versionamento))

O memorial da versão não é regerado: alterações feitas depois da reprovação entram apenas na versão seguinte. A aba "Histórico" ([US08](#us08-linha-do-tempo-e-histórico-do-protocolo)) lista as versões com o download do memorial de cada uma e um comparativo da demanda e dos grupos entre duas versões.

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Memorial da Versão Preservado Após Correção
- **Dado** que o projeto foi reprovado na versão 1 e o projetista alterou um grupo de UCs
- **Quando** o analista baixa o memorial da versão 1 na aba "Histórico"
- **Então** o PDF mostra os grupos e a demanda exatamente como foram enviados
- **E** o rodapé identifica o protocolo, a versão 1 e a data do envio.

#### Cenário 2 (Positivo): Comparativo Entre Versões
- **Dado** que o projeto tem as versões 1 e 2
- **Quando** o analista seleciona "Comparar Versões"
- **Então** o sistema destaca os grupos incluídos, removidos e alterados
- **E** exibe a demanda total de cada versão.

### Checklist de Implementação
- [ ] Gravar a versão com memorial, cálculo e documentos a cada envio
- [ ] Baixar o memorial de qualquer versão
- [ ] Comparar a demanda e os grupos entre duas versões

---

## US14: Notificações no Sistema

`US14` `Prioridade: Média` `Sprint 8`

### Descrição
Central de notificações no sino do cabeçalho para os dois perfis, sem envio de e-mail.

### User Story
> **Como** usuário do sistema, projetista ou analista,  
> **Quero** ser avisado dentro do sistema quando um projeto meu muda de situação,  
> **Para que** eu aja no momento certo sem precisar conferir cada projeto.

### Conversação (Regras de Negócio e Interface)
O sino do cabeçalho exibe o número de notificações não lidas e abre o painel de notificações (protótipos "Painel · Notificações" de cada perfil).

Eventos notificados:
- **Projetista:** projeto aprovado, projeto reprovado com o número de apontamentos, apontamento reaberto na reanálise e aprovação perto de expirar ([US15](#us15-prazos-de-análise-e-validade-da-aprovação))
- **Analista:** projeto atribuído reenviado, prazo de análise vencendo em até 3 dias e prazo vencido

Cada notificação mostra o protocolo, o texto, a data relativa e leva à tela do projeto. Clicar marca como lida, e o painel tem "Marcar Todas como Lidas". O sistema não envia e-mail.

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Projetista Avisado da Reprovação
- **Dado** que o analista reprovou o projeto "2026-1004" com 3 apontamentos
- **Quando** o projetista entra no sistema
- **Então** o sino exibe 1 notificação não lida
- **E** a notificação "Projeto 2026-1004 reprovado com 3 apontamentos" abre os apontamentos do projeto.

#### Cenário 2 (Positivo): Leitura das Notificações
- **Dado** que o analista tem 4 notificações não lidas
- **Quando** clica em "Marcar Todas como Lidas"
- **Então** o contador do sino desaparece
- **E** as notificações continuam listadas no painel como lidas.

### Checklist de Implementação
- [ ] Gerar notificações nos eventos de cada perfil
- [ ] Exibir o contador de não lidas e o painel no sino do cabeçalho
- [ ] Marcar notificações como lidas

---

## US15: Prazos de Análise e Validade da Aprovação

`US15` `Prioridade: Média` `Sprint 9`

### Descrição
Controle do prazo de 30 dias da análise, suspenso enquanto o projeto aguarda o projetista, e da validade de 36 meses da aprovação.

### User Story
> **Como** analista da Neoenergia,  
> **Quero** que o prazo de análise e a validade da aprovação sigam as regras do processo,  
> **Para que** a fila mostre prazos reais e projetos aprovados há mais de 36 meses não sejam usados como válidos.

### Conversação (Regras de Negócio e Interface)
Regras do processo de submissão da Neoenergia PE:
- **Prazo de análise:** 30 dias a partir do envio, suspenso enquanto o projeto está reprovado aguardando correção. No reenvio, a contagem retoma com os dias que restavam.
- **Validade da aprovação:** 36 meses a partir da aprovação (DIS-NOR-053, item 6.27.6). Vencido o prazo, o projeto passa à situação "Expirado".

A fila ([US06](#us06-fila-de-análise-técnica-priorizada)) e o painel do projeto exibem os dias corridos, os dias suspensos e o prazo final. O projetista vê a data de validade do projeto aprovado e é avisado 30 dias antes do vencimento ([US14](#us14-notificações-no-sistema)).

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Prazo Suspenso Durante a Correção
- **Dado** que o projeto foi reprovado no 12º dia de análise
- **Quando** o projetista reenvia a versão corrigida 10 dias depois
- **Então** o projeto volta à fila com 18 dias restantes
- **E** o histórico registra 10 dias de prazo suspenso.

#### Cenário 2 (Negativo): Aprovação Expirada
- **Dado** que um projeto foi aprovado há mais de 36 meses
- **Quando** o projetista o visualiza em "Meus Projetos"
- **Então** a situação exibida é "Expirado"
- **E** o painel do projeto informa a data em que a validade terminou.

### Checklist de Implementação
- [ ] Suspender e retomar o prazo de análise na reprovação e no reenvio
- [ ] Expirar a aprovação após 36 meses
- [ ] Exibir prazo restante, dias suspensos e validade

---

## US16: Painel do Projetista

`US16` `Prioridade: Média` `Sprint 8`

### Descrição
Painel inicial do projetista com o que exige ação e os indicadores de qualidade dos seus envios.

### User Story
> **Como** projetista externo,  
> **Quero** ver em um painel o que exige minha ação e como meus projetos têm se saído na análise,  
> **Para que** eu priorize o trabalho e reduza as reprovações nos próximos envios.

### Conversação (Regras de Negócio e Interface)
O item "Painel" entra no menu do projetista e passa a ser a tela inicial após o login. O painel exibe:
- **Exige ação:** projetos reprovados com bloqueantes em aberto e rascunhos sem movimentação há mais de 15 dias, cada um com o atalho para a etapa
- **Em análise:** projetos na fila com os dias restantes do prazo
- **Indicadores do período:** projetos enviados, taxa de aprovação na primeira análise, tempo médio até a aprovação e demanda total aprovada
- **Apontamentos mais recebidos:** ranking por etapa e item da norma, com a quantidade

O período é selecionável entre últimos 30 dias, últimos 90 dias e ano corrente.

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Projeto que Exige Ação
- **Dado** que o projetista tem um projeto reprovado com 2 apontamentos bloqueantes em aberto
- **Quando** abre o "Painel"
- **Então** o projeto aparece em "Exige ação" com o número de bloqueantes
- **E** o atalho "Ver Apontamentos" abre a correção do projeto.

#### Cenário 2 (Negativo): Projetista sem Projetos Enviados
- **Dado** que o projetista ainda não enviou nenhum projeto
- **Quando** abre o "Painel"
- **Então** os indicadores exibem a mensagem *"Os indicadores aparecem depois do primeiro envio."*
- **E** o painel oferece o atalho "Novo Projeto".

### Checklist de Implementação
- [ ] Listar os projetos que exigem ação e os que estão em análise
- [ ] Calcular os indicadores do período selecionado
- [ ] Exibir o ranking dos apontamentos mais recebidos

---

## US17: Painel do Analista

`US17` `Prioridade: Média` `Sprint 9`

### Descrição
Painel de indicadores da equipe de análise e histórico dos pareceres de cada analista.

### User Story
> **Como** analista da Neoenergia,  
> **Quero** acompanhar os indicadores da análise e os erros mais frequentes nos projetos recebidos,  
> **Para que** a equipe dimensione a demanda e oriente os projetistas sobre as falhas recorrentes.

### Conversação (Regras de Negócio e Interface)
O menu do analista ganha "Indicadores" e "Meus Pareceres", previstos no protótipo H7.

"Indicadores" exibe, para o período selecionado:
- Projetos recebidos e decididos por semana
- Tempo médio de análise e de ciclo completo até a aprovação
- Taxa de reprovação por mês
- Prazos cumpridos e vencidos
- Projetos em análise por analista
- **Apontamentos mais frequentes** por etapa e item da norma
- Municípios com mais projetos

"Meus Pareceres" lista os projetos decididos pelo analista logado, com a decisão, a data, o número de apontamentos e a versão, com os filtros da [US18](#us18-filtros-e-ordenação-das-listagens).

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Consulta dos Apontamentos Mais Frequentes
- **Dado** que o analista está em "Indicadores" com o período "Últimos 90 dias"
- **Quando** visualiza o ranking de apontamentos
- **Então** o sistema lista as etapas e os itens da norma ordenados pela quantidade de apontamentos
- **E** clicar em um item lista os projetos que receberam esse apontamento.

#### Cenário 2 (Positivo): Histórico de Pareceres
- **Dado** que o analista decidiu 12 projetos no mês
- **Quando** abre "Meus Pareceres" e filtra por "Reprovado"
- **Então** a lista exibe apenas os projetos que ele reprovou, com o número de apontamentos
- **E** cada linha abre a análise do projeto em modo de consulta.

### Checklist de Implementação
- [ ] Calcular os indicadores da equipe no período selecionado
- [ ] Exibir o ranking dos apontamentos mais frequentes
- [ ] Listar os pareceres do analista logado

---

## US18: Filtros e Ordenação das Listagens

`US18` `Prioridade: Alta` `Sprint 5`

### Descrição
Filtros combináveis e ordenação por coluna em "Meus Projetos" e na "Fila de Análise", preservados na URL.

### User Story
> **Como** projetista ou analista,  
> **Quero** filtrar e ordenar as listagens pelos critérios que importam no meu trabalho,  
> **Para que** eu encontre rapidamente os projetos que preciso tratar.

### Conversação (Regras de Negócio e Interface)
**Meus Projetos** passa a ter, além da situação e da busca por nome ou protocolo:
- Ordenação por nome, demanda, data de criação e última atualização, crescente e decrescente, pelo cabeçalho da coluna
- Filtros por município, período de criação e "Com apontamento bloqueante"

**Fila de Análise** passa a ter, além dos filtros "Vencendo prazo", "Acima de 50 kVA" e "Reanálise" e da ordenação por prazo:
- Ordenação por data de recebimento, demanda e número de alertas
- Filtros por analista responsável e por município

Os filtros se combinam, ficam na URL e aparecem como etiquetas removíveis acima da tabela, com o botão "Limpar Filtros". A ordenação padrão continua sendo a última atualização em "Meus Projetos" e o prazo na fila.

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Filtros Combinados com Ordenação
- **Dado** que o analista está na "Fila de Análise"
- **Quando** filtra o município "Recife", marca "Reanálise" e ordena por demanda decrescente
- **Então** a tabela exibe só as reanálises de Recife, da maior para a menor demanda
- **E** a URL guarda os filtros e a ordenação ao recarregar a página.

#### Cenário 2 (Negativo): Combinação sem Resultado
- **Dado** que o projetista filtrou um município sem projetos no período escolhido
- **Quando** a listagem é atualizada
- **Então** a tabela exibe *"Nenhum projeto encontrado para os critérios informados"*
- **E** oferece o botão "Limpar Filtros".

### Checklist de Implementação
- [ ] Ordenar "Meus Projetos" por coluna nos dois sentidos
- [ ] Filtrar "Meus Projetos" por município, período e apontamento bloqueante
- [ ] Ordenar e filtrar a fila pelos critérios novos
- [ ] Exibir os filtros ativos como etiquetas removíveis

---

## US19: Exportação em Planilha

`US19` `Prioridade: Baixa` `Sprint 9`

### Descrição
Exportação do cálculo de demanda e das listagens em planilha, para uso fora do sistema. O sistema não importa planilhas.

### User Story
> **Como** projetista ou analista,  
> **Quero** exportar o cálculo e as listagens em planilha,  
> **Para que** eu possa arquivar, conferir ou reaproveitar os dados em outras ferramentas.

### Conversação (Regras de Negócio e Interface)
- **Cálculo de demanda:** o botão "Exportar Planilha", ao lado do download do memorial, gera um `.xlsx` com uma aba de identificação, uma de grupos de UCs e uma com cada etapa do cálculo, a fórmula, o item da norma e o valor.
- **Listagens:** "Meus Projetos" e a "Fila de Análise" exportam em `.csv` as linhas que estão filtradas na tela.

Números saem no formato brasileiro, com vírgula decimal, e o nome do arquivo leva o protocolo ou a data da exportação.

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Exportação do Cálculo
- **Dado** que o projeto tem um cálculo de demanda realizado
- **Quando** o projetista clica em "Exportar Planilha"
- **Então** o sistema baixa o arquivo `2026-1008-calculo.xlsx`
- **E** a planilha traz as mesmas etapas e valores da tela de cálculo.

#### Cenário 2 (Negativo): Exportação sem Cálculo
- **Dado** que o projeto ainda não tem cálculo
- **Quando** o projetista visualiza a etapa de memorial
- **Então** o botão "Exportar Planilha" fica desabilitado
- **E** a dica informa que é preciso calcular a demanda antes.

### Checklist de Implementação
- [ ] Exportar o cálculo de demanda em `.xlsx`
- [ ] Exportar as listagens filtradas em `.csv`

---

## US20: Exclusão de Projeto em Rascunho

`US20` `Prioridade: Média` `Sprint 4`

### Descrição
Exclusão de projetos ainda não enviados, com confirmação, a partir da listagem e do painel do projeto.

### User Story
> **Como** projetista externo,  
> **Quero** excluir projetos em rascunho que não vou mais enviar,  
> **Para que** minha listagem mostre apenas o que está em andamento.

### Conversação (Regras de Negócio e Interface)
A ação "Excluir Projeto" aparece no menu de ações da linha e no painel do projeto ([US12](#us12-detalhe-do-projeto-e-histórico-de-tratamento)), apenas para projetos em rascunho. A confirmação exibe o nome e o protocolo do projeto e avisa que grupos, cálculos e documentos serão removidos.

Projetos enviados, reprovados ou aprovados não podem ser excluídos: o protocolo faz parte do histórico da concessionária. A exclusão de um grupo de UCs passa a pedir a mesma confirmação.

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Exclusão Confirmada
- **Dado** que o projetista tem o rascunho "Residencial Monte Verde"
- **Quando** clica em "Excluir Projeto" e confirma no diálogo
- **Então** o projeto deixa de aparecer em "Meus Projetos"
- **E** o contador de "Rascunho" diminui em 1.

#### Cenário 2 (Negativo): Projeto Enviado não Pode ser Excluído
- **Dado** que o projeto está "Em análise"
- **Quando** o projetista abre o menu de ações da linha
- **Então** a opção "Excluir Projeto" não é exibida
- **E** a API recusa a exclusão com a mensagem *"Só é possível excluir um projeto em rascunho."*

### Checklist de Implementação
- [ ] Excluir rascunho com confirmação na listagem e no painel do projeto
- [ ] Pedir confirmação na exclusão de grupo de UCs
