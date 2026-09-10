# Ideação — Parte 1

Registro do brainstorming de soluções, da análise de riscos e da escolha da proposta final.

Aula 3, 22/08/2026 · Fase: Ideação ([`../processo.md`](../processo.md)) · Responsável: Todos
Entregável: ideação no board e registro das três atividades no Google Sites
Board: [FigJam — Ideação Parte 1](https://www.figma.com/board/H7ZlU9nAbR72LiXVLUBmqo)

Nesta etapa, "solução" é conceito de produto, não funcionalidade. Funcionalidades saem das histórias de usuário, na aula 4.

## Insumos da Imersão

Disponíveis na zona de contexto do board durante a sessão:

- Causa raiz e causas mapeadas — [`analise-causa-raiz.md`](../negocio/analise-causa-raiz.md)
- Lacunas do mercado — [`benchmarking.md`](../negocio/benchmarking.md)
- Objetivo do MVP — [`objetivos-projeto.md`](objetivos-projeto.md)
- Usuários candidatos — [`mapa-stakeholders.md`](../negocio/mapa-stakeholders.md)
- Metodologia normativa de cálculo — [`fontes-normativas.md`](../tecnico/fontes-normativas.md)

A solução escolhida precisa caber nos requisitos de POO: Java com Spring Boot, banco de dados, mínimo 3 classes de domínio persistidas e toda história lendo ou escrevendo no banco ([`app/back/README.md`](../../app/back/README.md)).

## Brainstorming de possíveis soluções

A rodada divergente foi agrupada em cinco conceitos de produto, mais um grupo transversal.

| Grupo | Ideias | Usuário atendido |
| :--- | :--- | :--- |
| **Calcula e guia o preenchimento** | Formulário passo a passo que calcula a demanda · Assistente que explica a norma durante o preenchimento · Fluxo no modelo da declaração de imposto de renda · Cada projeto salvo no banco | Projetista |
| **Confere e aponta erro antes de enviar** | Compara o cálculo do projetista com o da norma · Tela que mostra onde deu erro · Alerta quando o valor fica abaixo do mínimo · Fila com priorização automática e diagnóstico por projeto · Cruzamento de resubmissões, mostrando o que mudou entre versões | Projetista e analista |
| **Lado da análise interna** | Painel do analista com os projetos organizados · Projetista e analista no mesmo sistema · Login por perfil · Dashboard dos projetos mais reprovados · Sugestão de correção quando o cálculo está errado | Analista |
| **Entrada automática de dados** | Leitura automática de PDF · Memorial descritivo gerado formatado · Upload dos documentos do projeto · Exportação do cálculo em PDF pronto para envio · Relatório final com os parâmetros usados | Projetista e analista |
| **Histórico e rastreabilidade** | Cadastro do projetista com histórico de envios e cálculos · Comparação automática entre revisões da norma | Projetista e analista |
| **Experiência do usuário** — transversal | Filtros e busca rápida de projetos · Alerta de campos esquecidos · Área de comentários e notas · Exportação em múltiplos formatos | Os dois |

### Ideias descartadas

| Ideia | Motivo |
| :--- | :--- |
| App separado só para tirar dúvida sobre a norma, sem calcular | Não ataca o problema central, que é o cálculo |
| Sistema que arquiva cálculos antigos como exemplo | Funcionalidade de apoio; não resolve o problema atual |
| Ferramenta que só confere se os documentos estão completos | A checagem documental já existe hoje e não ataca a causa raiz |
| Extensão de navegador para preencher o formulário da Neoenergia | Depende de o site da Neoenergia não mudar; risco alto de manutenção |
| Integração direta com o sistema da Neoenergia para envio automático | Exige acesso e parceria que o time não tem |
| Painel de estatísticas de reprovação por região | Serve à gestão; não ajuda o projetista a acertar o cálculo |
| App mobile nativo além do sistema web | Fora do escopo do MVP |

## Comparativo das propostas

As cinco propostas saíram do agrupamento das ideias, e a sexta linha é a solução final. A cobertura é avaliada contra os dois blocos do [benchmarking](../negocio/benchmarking.md#a-lacuna-ninguém-junta-cálculo-e-processo):

- **Calcular** — calculadora automática, cálculo conforme a norma, resultado padronizado, validação antes do envio, apontar o erro, memória de cálculo
- **Estar no processo** — integrada à submissão oficial e apoiando a análise interna

Nenhuma referência do mercado cobre os dois. É esse o critério que separa as propostas.

| Proposta | Usuário | Que bloco cobre | Do que depende que não controlamos |
| :--- | :--- | :--- | :--- |
| Calcula e guia o preenchimento | Projetista | **Calcular** — valida antes do envio, memória de cálculo e padroniza; não aponta o erro. Fora do processo de análise | Quem é o usuário do MVP e se ele acessa o sistema de fora (questões 1 e 1c) |
| Confere e aponta erro antes de enviar | Projetista | **Calcular**, parcialmente — valida e aponta o erro, sem memória de cálculo nem documento padronizado. Fora do processo de análise | Mesmas questões 1 e 1c |
| Lado da análise interna | Analista | **Estar no processo** — aponta o erro, memória de cálculo e padroniza, mas só depois do envio. Não impede o erro | Se já existe sistema de submissão para integrar (questão 9) |
| Entrada automática de dados | Os dois | **Nenhum dos dois por inteiro** — acelera a entrada, mas a validação e a padronização dependem do formato de origem | Em que formato o projeto é enviado hoje (questão 14) |
| Histórico e rastreabilidade | Os dois | **Nenhum dos dois** — registra e audita; não calcula, não valida e não aponta erro | Pouco: funciona com qualquer resposta sobre o usuário (questão 1) |
| **Sistema único, com perfis** | Os dois, com perfis distintos | **Os dois blocos** — guia e valida antes do envio, mostra a memória de cálculo e exporta o resultado padronizado; e dá ao analista um painel para revisar e apontar o erro dentro do mesmo fluxo | Se o projetista externo pode acessar o mesmo sistema que o analista (questão 1c) e como funciona a revisão interna hoje (questão 9) |

**Perfis:** *projetista externo* é a pessoa ou empresa fora da Neoenergia que monta e envia o cálculo; *analista interno* é a equipe da Neoenergia que recebe e confere o projeto.

### Riscos e gargalos por proposta

| Proposta | Principal risco |
| :--- | :--- |
| Calcula e guia o preenchimento | Fluxo guiado longo demais gera abandono; modelar todas as combinações de regras e tabelas no formulário é o gargalo |
| Confere e aponta erro antes de enviar | Sem memória de cálculo nem documento padronizado, o analista segue sem artefato estruturado para conferir |
| Lado da análise interna | Não barra o erro antes do envio: o analista continua reanalisando o mesmo projeto várias vezes |
| Entrada automática de dados | Variação de layout ou formato nos arquivos trava a importação e devolve o preenchimento manual |
| Histórico e rastreabilidade | Baixo impacto no problema central: registra e audita, mas não impede o cálculo errado de ser submetido |
| **Sistema único, com perfis** | Junta duas frentes num só MVP e dobra o escopo; amarra as duas pontas à questão 1c |

Risco que vale para todas e por isso não as diferencia: a norma é revisada com frequência, sete vezes em menos de quatro anos ([`fontes-normativas.md`](../tecnico/fontes-normativas.md)).

## Proposta de solução final

**Solução escolhida:** sistema único, com perfis. O projetista externo guia o preenchimento, calcula e exporta a demanda. O analista interno usa o mesmo sistema, com um painel para revisar e tratar o que foi submetido. Um lugar só, dois perfis.

**Justificativa:** cobre os dois lados da [lacuna do benchmarking](../negocio/benchmarking.md#a-lacuna-ninguém-junta-cálculo-e-processo). Calcula, valida e padroniza como a ferramenta do projetista, e vive dentro do processo de submissão e análise como o portal da concessionária. É a interseção que hoje não existe: os dois perfis usam o mesmo fluxo, do preenchimento até a revisão e a tratativa entre analista e projetista.

**Premissas assumidas:** todas dependem de resposta do cliente e estão amarradas ao registro de [`questões em aberto`](questoes-em-aberto.md).

| # | Premissa | O que cai se for falsa | Questão |
| :- | :--- | :--- | :--- |
| 1 | O projetista externo pode acessar o mesmo sistema que o analista interno | A solução escolhida. Sem isso, "sistema único" vira dois produtos separados e o argumento da interseção não se sustenta | 1c |
| 2 | O MVP atende os dois perfis, projetista externo e analista interno | O painel de análise e os apontamentos vinculados à etapa do cálculo | 1a |
| 3 | O recorte é a faixa acima de 50 kVA, onde a simplificação de critérios ainda não foi aplicada | O escopo. Abaixo de 50 kVA o problema já foi mitigado e o projeto simplificado é permitido pela norma (053, itens 6.27.1 e 6.27.3) | 3 |
| 4 | Não existe sistema de submissão a integrar; o MVP é autônomo e o envio segue pelo canal oficial atual | O desenho de integração. Se existir sistema, o produto vira extensão dele, não ferramenta nova | 9 |
| 5 | As reprovações são majoritariamente por aplicação errada da regra, não por dado de entrada errado | **O valor do produto.** Automatizar o cálculo elimina erro de regra e não elimina erro de entrada | 10 |
| 6 | Os parâmetros normativos são cadastrados e versionados dentro do sistema, não extraídos de PDF nem fixados em código | Nada externo: é decisão técnica do time, registrada em [`fontes-normativas.md`](../tecnico/fontes-normativas.md) | — |

A premissa 5 é a mais perigosa e é a de maior prioridade no registro de questões. As premissas 1 e 4 são as que decidem se a solução escolhida continua sendo a certa.

**Características transversais:** o grupo *experiência do usuário* não é proposta concorrente e sim atributo do sistema único: filtros e busca rápida de projetos, alerta de campos esquecidos, área de comentários e notas, exportação em múltiplos formatos. Dois deles já são parte das propostas: o alerta de campos esquecidos é validação antes do envio, e a exportação é o resultado padronizado.

## O que depende desta etapa

As entradas e saídas concretas do sistema, derivadas da solução escolhida, estão em [`../tecnico/engine-calculo.md`](../tecnico/engine-calculo.md). A métrica de sucesso (questão 5) e a definição de quem usa o MVP (questão 1) seguem em aberto no registro de [`questões em aberto`](questoes-em-aberto.md).
