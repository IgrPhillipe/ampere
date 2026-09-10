# Ideação — Parte 1

Registro do brainstorming de soluções, da análise de riscos e da escolha da proposta final.

Aula 3, 22/08/2026 · Fase: Ideação ([`../processo.md`](../processo.md)) · Responsável: Todos
Entregável: ideação no board e registro das três atividades no Google Sites
Board: [FigJam — Ideação Parte 1](https://www.figma.com/board/H7ZlU9nAbR72LiXVLUBmqo)

Nesta etapa, "solução" é conceito de produto, não funcionalidade. Funcionalidades saem das histórias de usuário, na aula 4.

## To-do

**Preparação**

- [x] Criar o board da sessão e registrar o link no [`README`](../../README.md) do projeto
- [x] Carregar o board com os insumos da Imersão
- [ ] Publicar a subpágina *Ideação* no Google Sites
- [ ] Definir facilitador, formato e duração da sessão (questão 7)
- [ ] Definir se a restrição de POO entra antes ou depois da rodada divergente (questão 8)
- [ ] Enviar ao cliente as perguntas de [`questoes-em-aberto.md`](questoes-em-aberto.md#perguntas-para-enviar-ao-cliente)

**Atividade 1 — Brainstorming**

- [ ] Rodada divergente, uma faixa por integrante
- [ ] Agrupar cada ideia pelo usuário que ela atende
- [ ] Registrar todas as ideias, incluindo as descartadas e o motivo do descarte
- [ ] Transcrever na seção 1

**Atividade 2 — Riscos**

- [ ] Levantar no máximo dois riscos por proposta
- [ ] Transcrever na seção 2

**Atividade 3 — Proposta final**

- [ ] Fechar o comparativo e escolher
- [ ] Escrever a justificativa
- [ ] Registrar as premissas assumidas, se houver questão bloqueante sem resposta
- [ ] Transcrever na seção 3

**Fechamento**

- [ ] Registrar as três atividades no Google Sites
- [ ] Atualizar o status em [`../cronograma-projetos3.md`](../cronograma-projetos3.md)

## Insumos da Imersão

Disponíveis na zona de contexto do board durante a sessão:

- Causa raiz e causas mapeadas — [`analise-causa-raiz.md`](../negocio/analise-causa-raiz.md)
- Lacunas do mercado — [`benchmarking.md`](../negocio/benchmarking.md)
- Objetivo do MVP — [`objetivos-projeto.md`](objetivos-projeto.md)
- Usuários candidatos — [`mapa-stakeholders.md`](../negocio/mapa-stakeholders.md)
- Metodologia normativa de cálculo — [`fontes-normativas.md`](../tecnico/fontes-normativas.md)

A solução escolhida precisa caber nos requisitos de POO: Java com Spring Boot, banco de dados, mínimo 3 classes de domínio persistidas e toda história lendo ou escrevendo no banco ([`app/back/README.md`](../../app/back/README.md)).

## 1 — Brainstorming de possíveis soluções

A preencher na atividade 1.

| # | Ideia | Usuário atendido | Autor |
| :- | :---- | :--------------- | :---- |

Ideias descartadas e o motivo: a preencher.

## 2 — Riscos por proposta

A preencher na atividade 2. Máximo de dois riscos por proposta.

| Proposta | Do que depende que não controlamos | O que faríamos a respeito |
| :------- | :--------------------------------- | :------------------------ |

Riscos que valem para todas as propostas, e por isso não as diferenciam: a norma de cálculo é revisada com frequência, sete vezes em menos de quatro anos ([`fontes-normativas.md`](../tecnico/fontes-normativas.md)).

## 3 — Proposta de solução final

**Solução escolhida:** sistema único, com perfis. O projetista externo guia o preenchimento, calcula e exporta a demanda. O analista interno usa o mesmo sistema, com um painel para revisar e tratar o que foi submetido. Um lugar só, dois perfis.

**Justificativa:** cobre os dois lados da [lacuna do benchmarking](../negocio/benchmarking.md#a-lacuna-ninguém-junta-cálculo-e-processo). Calcula, valida e padroniza como a ferramenta do projetista, e vive dentro do processo de submissão e análise como o portal da concessionária. É a interseção que hoje não existe: os dois perfis usam o mesmo fluxo, do preenchimento até a revisão e a tratativa entre analista e projetista.

**Premissas assumidas:** a preencher.

**Características transversais:** o agrupamento produziu um sexto grupo — *experiência do usuário* — que não é proposta concorrente e sim atributo do sistema único: filtros e busca rápida de projetos, alerta de campos esquecidos, área de comentários e notas, exportação em múltiplos formatos. Dois deles já são parte das propostas: o alerta de campos esquecidos é validação antes do envio, e a exportação é o resultado padronizado. Por isso o grupo não aparece como linha no comparativo nem entre as descartadas.

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

## Saídas esperadas

Ao fim desta etapa, devem estar resolvidas as questões 4 (entrada e saída do sistema) e 5 (métrica de sucesso), registradas em [`questoes-em-aberto.md`](questoes-em-aberto.md). A atividade 1 deve produzir evidência para o cliente fechar a questão 1.
