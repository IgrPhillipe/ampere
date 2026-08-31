# Documento de Histórias de Usuário (User Stories)

> **Sistema de Gestão e Análise de Projetos Elétricos**  
> Especificação detalhada de requisitos, regras de negócio e critérios de aceitação (BDD) para o fluxo de submissão, cálculo normativo e auditoria técnica.

---

## Tabela de Conteúdos

1. [Visão Geral e Matriz de Rastreabilidade](#-visão-geral-e-matriz-de-rastreabilidade)
2. [US01 – Acompanhamento de Projetos e Status](#us01--acompanhamento-de-projetos-e-status)
3. [US02 – Configuração Inicial dos Parâmetros da Edificação](#us02--configuração-inicial-dos-parâmetros-da-edificação)
4. [US03 – Cadastro e Validação em Tempo Real de Unidades Consumidoras](#us03--cadastro-e-validação-em-tempo-real-de-unidades-consumidoras)
5. [US04 – Conferência do Cálculo Passo a Passo da Demanda](#us04--conferência-do-cálculo-passo-a-passo-da-demanda)
6. [US05 – Geração de Memorial e Envio do Projeto](#us05--geração-de-memorial-e-envio-do-projeto)
7. [US06 – Fila de Análise Técnica Priorizada](#us06--fila-de-análise-técnica-priorizada)
8. [US07 – Auditoria de Memória e Registro Pontual de Apontamentos](#us07--auditoria-de-memória-e-registro-pontual-de-apontamentos)

---

## Visão Geral e Matriz de Rastreabilidade

| ID | Título da História | Persona / Papel | Prioridade | Sprint |
| :--- | :--- | :--- | :---: | :---: |
| **US01** | [Acompanhamento de Projetos e Status](#us01--acompanhamento-de-projetos-e-status) | Projetista Externo | `Alta` | `Sprint 1` |
| **US02** | [Configuração Inicial dos Parâmetros da Edificação](#us02--configuração-inicial-dos-parâmetros-da-edificação) | Projetista Externo | `Alta` | `Sprint 1` |
| **US03** | [Cadastro e Validação em Tempo Real de Unidades Consumidoras](#us03--cadastro-e-validação-em-tempo-real-de-unidades-consumidoras) | Projetista Externo | `Alta` | `Sprint 2` |
| **US04** | [Conferência do Cálculo Passo a Passo da Demanda](#us04--conferência-do-cálculo-passo-a-passo-da-demanda) | Projetista Externo | `Alta` | `Sprint 2` |
| **US05** | [Geração de Memorial e Envio do Projeto](#us05--geração-de-memorial-e-envio-do-projeto) | Projetista Externo | `Alta` | `Sprint 3` |
| **US06** | [Fila de Análise Técnica Priorizada](#us06--fila-de-análise-técnica-priorizada) | Analista da Concessionária | `Alta` | `Sprint 3` |
| **US07** | [Auditoria de Memória e Registro Pontual de Apontamentos](#us07--auditoria-de-memória-e-registro-pontual-de-apontamentos) | Analista da Concessionária | `Alta` | `Sprint 4` |

---

## US01 – Acompanhamento de Projetos e Status

`US01` `Prioridade: Alta` `Sprint 1`

### Descrição
Painel de gestão centralizada para acompanhamento, filtragem e consulta do status de tramitação dos projetos elétricos submetidos.

### User Story
> **Como** projetista externo,  
> **Quero** acompanhar todos os meus projetos e o status de cada um em um painel centralizado,  
> **Para que** eu saiba exatamente quais exigem ação sem depender de e-mail ou telefone.

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

#### Cenário 1 (Positivo): Visualizar projetos com apontamentos de reprovação
- **Dado** que o projetista está autenticado na tela "Meus Projetos"
- **Quando** clica no filtro "Reprovado"
- **Então** o sistema exibe apenas os projetos reprovados
- **E** apresenta a quantidade de pendências de cada um com o link "Ver apontamentos".

#### Cenário 2 (Negativo): Busca por projeto inexistente
- **Dado** que o projetista está na tela "Meus Projetos"
- **Quando** digita um nome ou protocolo inexistente no campo de busca
- **Então** a tabela não retorna registros e exibe a mensagem *"Nenhum projeto encontrado para os critérios informados"*.

### Checklist de Implementação
- [ ] Filtrar projetos por status exibindo os contadores numéricos de cada situação
- [ ] Exibir atalho "Ver apontamentos" para redirecionar projetos reprovados

---

## US02 – Configuração Inicial dos Parâmetros da Edificação

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

O sistema bloqueia a seleção manual da norma e atribui automaticamente a NDU correspondente (ex.: **NDU 001 — rev. 5.6**). Permite também o upload prévio de planilha `.xlsx` para autopreenchimento.

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Seleção automática da norma regulamentadora
- **Dado** que o projetista está na etapa "Dados da edificação"
- **Quando** preenche os parâmetros técnicos selecionando tipo "Residencial multifamiliar", tensão "380/220 V" e padrão "Coletivo"
- **Então** o sistema define e exibe automaticamente o campo "Norma aplicável: NDU 001 — rev. 5.6"
- **E** habilita o botão "Avançar".

#### Cenário 2 (Negativo): Avanço bloqueado por campos obrigatórios não preenchidos
- **Dado** que o projetista iniciou um novo projeto
- **Quando** tenta avançar sem informar o "Tipo de edificação" ou "Padrão de entrada"
- **Então** o avanço para a etapa 2 é bloqueado
- **E** os campos obrigatórios vazios são destacados com mensagens de validação.

### Checklist de Implementação
- [ ] Definir norma aplicável automaticamente a partir dos parâmetros técnicos
- [ ] Bloquear o avanço caso existam campos obrigatórios não preenchidos

---

## US03 – Cadastro e Validação em Tempo Real de Unidades Consumidoras

`US03` `Prioridade: Alta` `Sprint 2`

### Descrição
Interface de agrupamento de cargas por tipologia com motor de validação assíncrono para captura preventiva de erros normativos.

### User Story
> **Como** projetista externo,  
> **Quero** cadastrar as unidades consumidoras agrupadas por tipo e receber validações técnicas instantâneas,  
> **Para que** eu possa corrigir inconsistências antes da submissão formal.

### Conversação (Regras de Negócio e Interface)
Permite adicionar ou importar UCs agrupadas (apartamentos, áreas comuns, recarga de veículo elétrico). O sistema aplica a tabela normativa respectiva a cada grupo (Tabela 3, Tabela 5, Tabela 6) e exibe um painel de validação em tempo real, bloqueando o avanço e sinalizando pendências críticas (ex.: motores acima de 5 CV sem fator de partida ou falta de indicação de gerenciamento de carga veicular).

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Importação de planilha de UCs sem inconsistências
- **Dado** que o projetista está na etapa "Unidades consumidoras"
- **Quando** faz o upload de uma planilha `.xlsx` com todas as cargas e fatores em conformidade
- **Então** a tabela é preenchida com o status "Validado" em cada grupo de UCs
- **E** o botão "Calcular demanda" fica ativo para prosseguir.

#### Cenário 2 (Negativo): Inconsistência técnica ou pendência bloqueia o cálculo
- **Dado** que o projetista possui grupos com dados pendentes de validação técnica ou confirmação de potência
- **Quando** visualiza o painel de validação em tempo real
- **Então** os grupos recebem o status "Revisar" ou "Falta dado"
- **E** o botão "Calcular demanda" permanece desabilitado até a regularização pelos atalhos de ação ("Corrigir agora" ou "Informar dado").

### Checklist de Implementação
- [ ] Validar regras técnicas e normativas em tempo real durante o preenchimento
- [ ] Bloquear o cálculo de demanda enquanto houver grupos com pendência ("Falta dado")

---

## US04 – Conferência do Cálculo Passo a Passo da Demanda

`US04` `Prioridade: Alta` `Sprint 2`

### Descrição
Detalhamento transparente da memória de cálculo de demanda, exibindo fórmulas, critérios normativos aplicados e dimensionamento elétrico geral.

### User Story
> **Como** projetista externo,  
> **Quero** visualizar a memória de cálculo de demanda detalhada passo a passo com a regra normativa usada,  
> **Para que** eu possa auditar o dimensionamento e sustentá-lo tecnicamente.

### Conversação (Regras de Negócio e Interface)
A tela divide o cálculo em 5 etapas visíveis:
1. Demanda residencial
2. Demanda de áreas comuns
3. Cargas especiais
4. Fator de diversidade
5. Conversão para kVA

Ao lado, exibe o painel de rastreabilidade técnica com:
- Demanda ativa total (kW)
- Fator de potência
- Corrente projetada (A)
- Padrão de entrada sugerido
- Disjuntor de proteção
- Seção do ramal de entrada

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Visualização completa da memória de cálculo
- **Dado** que todas as UCs foram validadas na etapa anterior
- **Quando** o projetista acessa a etapa "Cálculo de demanda"
- **Então** o sistema exibe o painel consolidado com a Demanda Total em kVA (ex.: 236,0 kVA) e as 5 etapas abertas com suas respectivas fórmulas
- **E** habilita o botão "Gerar memorial".

#### Cenário 2 (Positivo/Navegação): Retornar para ajuste sem perda de dados
- **Dado** que o projetista está conferindo o cálculo na etapa 3
- **Quando** clica no botão "Voltar" para alterar a quantidade de UCs
- **Então** o sistema retorna à etapa 2 mantendo os dados preenchidos anteriormente para edição.

### Checklist de Implementação
- [ ] Exibir memória de cálculo aberta em 5 etapas com fórmulas e referências normativas
- [ ] Apresentar dados de rastreabilidade elétrica (demanda ativa, disjuntor e ramal sugerido)

---

## US05 – Geração de Memorial e Envio do Projeto

`US05` `Prioridade: Alta` `Sprint 3`

### Descrição
Geração automatizada do memorial descritivo padronizado em formato concessionária acompanhado de checklist de conformidade documental pré-envio na etapa unificada de Memorial e Envio.

### User Story
> **Como** projetista externo,  
> **Quero** gerar o memorial descritivo padronizado no formato da Neoenergia e validar o checklist documental,  
> **Para que** a submissão ocorra sem risco de reprovação por documentação incompleta.

### Conversação (Regras de Negócio e Interface)
O sistema compila e apresenta o preview do memorial descritivo em PDF na etapa unificada de Memorial e Envio, com opção de download (PDF/planilha).  
Apresenta a seção **"Checagem antes do envio"**, exigindo a confirmação dos dados, UCs, cálculo e o anexo obrigatório dos arquivos técnicos:
- ART (Anotação de Responsabilidade Técnica)
- Diagrama unifilar
- Planta de situação

Libera o botão de submissão após validação para concluir o protocolo do projeto.

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Submissão concluída com checklist completo
- **Dado** que o memorial foi gerado e todos os itens do checklist (incluindo ART, diagrama unifilar e planta) estão checados/anexados
- **Quando** o projetista clica em "Enviar para análise"
- **Então** o projeto é submetido à fila da concessionária
- **E** o status do projeto muda para "Em análise" na tela inicial.

#### Cenário 2 (Negativo): Envio impedido por pendência em documento técnico obrigatório
- **Dado** que o projetista está na etapa "Memorial e envio" e o "Diagrama unifilar (PDF)" ainda não foi anexado
- **Quando** visualiza a lista de checagem antes do envio
- **Então** o item exibe o ícone de alerta com o botão "anexar"
- **E** o botão "Enviar para análise" permanece desabilitado.

### Checklist de Implementação
- [ ] Gerar pré-visualização do memorial descritivo em PDF padronizado
- [ ] Bloquear envio do projeto até que todos os documentos obrigatórios estejam anexados

---

## US06 – Fila de Análise Técnica Priorizada

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

#### Cenário 1 (Positivo): Filtrar projetos prioritários com prazo crítico
- **Dado** que o analista está autenticado na "Fila de análise"
- **Quando** clica no filtro "Vencendo prazo"
- **Então** a listagem exibe apenas projetos com status de SLA urgente ("vence hoje" ou "atrasado")
- **E** exibe a indicação de alertas automáticos levantados pelo sistema.

#### Cenário 2 (Positivo/Acesso): Iniciar análise de projeto da fila
- **Dado** que o analista seleciona o projeto com protocolo "2026-0481"
- **Quando** clica no botão "Analisar"
- **Então** é redirecionado para o ambiente de conferência e apontamentos do projeto ([US07](#us07--auditoria-de-memória-e-registro-pontual-de-apontamentos)).

### Checklist de Implementação
- [ ] Ordenar fila de análise por urgência de prazo de atendimento
- [ ] Exibir badges com a quantidade de alertas levantados pela pré-validação do sistema

---

## US07 – Auditoria de Memória e Registro Pontual de Apontamentos

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

Na reprovação, o sistema dispara a notificação e direciona o projetista diretamente para a etapa apontada no seu painel.

### Confirmação (Critérios de Aceite - BDD)

#### Cenário 1 (Positivo): Aprovação de projeto regular
- **Dado** que o analista conferiu a memória de cálculo e os documentos anexos sem inconsistências
- **Quando** clica no botão "Aprovar projeto" e confirma a decisão
- **Então** o status do projeto é alterado para "Aprovado"
- **E** o histórico da auditoria é registrado com sucesso.

#### Cenário 2 (Negativo/Fluxo de Reprovação): Reprovação com apontamento específico vinculado
- **Dado** que o analista identificou a ausência de comprovação do sistema de gerenciamento de recarga veicular
- **Quando** cadastra o apontamento bloqueante vinculado à "Etapa 3 — cargas especiais" e clica em "Reprovar com apontamentos"
- **Então** o projeto tem o status alterado para "Reprovado" com o número de pendências registrado
- **E** o projetista recebe o apontamento direcionado exclusivamente para a etapa vinculada no seu painel.

### Checklist de Implementação
- [ ] Registrar apontamentos categorizados e vinculados à etapa exata da divergência
- [ ] Concluir decisão de aprovação ou reprovação pontual atualizando o status do projeto
