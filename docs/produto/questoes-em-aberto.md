# Questões em Aberto

Registro único das decisões que faltam para transformar os objetivos do projeto em requisitos construíveis. Nenhum outro documento registra estado de questão: os demais apenas referenciam pelo número.

Os números são identificadores estáveis, não ordem. Questão nova recebe o próximo número livre. Questão respondida sai daqui e a decisão passa a viver no documento que a governa; o número não é reaproveitado.

Pendências operacionais, como correção de board ou publicação de página, ficam em [`../pendencias.md`](../pendencias.md).

São 14 questões abertas: dez dependem do cliente e quatro dependem apenas do time. Prioridade: **10**, **1** e **9**, nessa ordem.

## Dependem do cliente

| # | Questão | Impacto |
| :-- | :------ | :------ |
| **1** | Quem usa o MVP e como trabalha hoje. Ver desdobramento abaixo | Define o produto. Entrada, saída, autenticação e fluxo mudam conforme a resposta |
| **3** | Faixa de escopo do MVP: cobre só acima de 50 kVA? | Define o recorte. Abaixo de 50 kVA o problema já foi mitigado por simplificação de critérios |
| **9** | Já existe sistema de submissão e análise, e o que ele faz. Ver desdobramento abaixo | Define se construímos produto novo ou extensão do existente |
| **10** | Os erros são de aplicação da regra ou de dado de entrada? Existe registro ou classificação das reprovações? | Decide se o produto funciona. Automatizar o cálculo elimina erro de regra e não elimina erro de entrada |
| **13** | Como começa o processo e o projetista precisa ser credenciado? Quem contrata é quem elabora? | Define quem entra no sistema e se há cadastro prévio a modelar |
| **14** | Em que formato o projeto é enviado, e existe formato obrigatório? | Define se o sistema recebe dados estruturados ou precisa extrair de documento |
| **15** | Como a devolutiva volta e como funciona o reenvio: reinicia o processo ou tem fila própria? | Define se a ferramenta encurta o ciclo de retrabalho ou só o de primeira submissão |
| **16** | O que acontece depois dos 36 meses de validade, se a obra não terminou? | Pode ser um caso de uso não mapeado e uma fonte de retrabalho |
| **17** | Existe acervo de projetos anteriores? Um sistema novo precisaria importar? | Muda o esforço e abre a possibilidade de aprender com o histórico de reprovações |
| **18** | Como equipe e projetistas acompanham as revisões da norma? Projeto em trânsito é avaliado por qual revisão? | Define como o sistema versiona regras e trata projeto submetido sob revisão anterior |

### Desdobramento da questão 1

| Sub | Questão |
| :-- | :------ |
| **1a** | Quem usa: projetista externo, equipe interna de análise, ou os dois com perfis distintos? O projetista é pessoa física ou empresa de engenharia? |
| **1b** | Como cada um trabalha hoje? Em que o projetista calcula e com que material? O que a análise recebe, confere e devolve? |
| **1c** | Pessoa de fora da Neoenergia pode acessar um sistema interno? |

Quais funcionalidades cada perfil teria não é pergunta para o cliente: sai das histórias de usuário, na aula 4.

### Desdobramento da questão 9

| Sub | Questão |
| :-- | :------ |
| **9a** | Existe hoje um sistema por onde o projeto é submetido e acompanhado? Qual? |
| **9b** | O analista apenas visualiza o projeto, ou tem dados, histórico, indicadores e metodologia de conferência? |
| **9c** | A revisão acontece dentro do sistema ou fora dele? |
| **9d** | Reprovação e re-submissão já são fluxo do sistema, ou são manuais? |
| **9e** | Como o canal de e-mail dá conta do volume: há protocolo, triagem, fila? |

## Dependem apenas do time

| # | Questão | Quando |
| :-- | :------ | :----- |
| **4** | Entrada e saída concretas do sistema: quais parâmetros entram e o que sai | Aula 4, 29/08 |
| **5** | Métrica de sucesso | Aula 4, 29/08 |
| **7** | Formato, facilitador e duração do brainstorming | Antes da aula 3 |
| **8** | A restrição de POO entra antes ou depois da rodada divergente | Antes da aula 3 |

## Hipótese de solução a validar

Sistema com área interna de revisão, onde o analista registra a conferência e monta a devolutiva de forma estruturada, e área externa de retorno, onde quem submeteu vê o apontamento e reenvia pelo mesmo lugar. Levar à reunião como hipótese do time, não como proposta fechada.

## Perguntas para enviar ao cliente

A pauta formatada para conduzir a reunião está em [`../ciclo-projeto-eletrico.html`](../ciclo-projeto-eletrico.html), na ordem do ciclo:

| Etapa do ciclo | Questões |
| :----------------------- | :---------------- |
| 01 e 02, antes do projeto | 13, 1a |
| 03, o cálculo             | 3 |
| 04, a submissão           | 14, 1c, 9, 17 |
| 05, a análise             | 1b |
| 06, a decisão             | 10 |
| 07, o retorno             | 15, 16 |
| sobre a norma             | 18, 4 |
