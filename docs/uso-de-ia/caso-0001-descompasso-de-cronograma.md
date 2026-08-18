# Caso 0001 — Diagnóstico invertido de descompasso entre cronogramas

Data: 17/08/2026 · Fase: Ideação · Tipo: resposta incorreta

## Atividade

Conferência de prazos entre a disciplina de POO e a de Projetos 3, durante a organização da documentação.

## O que a IA fez

Afirmou existir um descompasso de quase duas semanas: a Entrega 01 de POO seria 31/08 e o cronograma de Projetos 3 só previa histórias de usuário e protótipos até 12/09. Registrou o alerta em três arquivos e recomendou levar a decisão ao orientador.

## Resultado

Limitação. O descompasso não existe. O plano de ensino oficial coloca histórias de usuário e protótipos de baixa fidelidade na aula 4, em 29/08, o que encaixa com a Entrega 01 de POO em 31/08.

A comparação foi feita contra o board de cronograma do time, transcrito para `cronograma-projetos3.md`, e não contra o plano de ensino, que a IA não tinha em mãos. O erro real estava no board do time, atrasado em relação ao plano da disciplina. A IA apontou o problema no lugar errado e inverteu quem estava fora de sincronia.

## Evidência

Commits `9b5b70e` e `ab34813` introduziram o alerta em `cronograma-poo.md`, `cronograma-projetos3.md` e `produto/questoes-em-aberto.md`. O plano de ensino, fornecido depois, mostrou o encaixe correto.

## Aprendizado

Comparação entre fontes só vale quando as duas são oficiais. Transcrição de artefato interno não substitui documento da disciplina. Antes de afirmar conflito entre dois planos, verificar se ambos são fonte primária.
