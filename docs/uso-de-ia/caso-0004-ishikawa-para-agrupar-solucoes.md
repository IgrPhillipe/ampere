# Caso 0004 — Categorias de causa usadas para agrupar soluções

Data: 17/08/2026 · Fase: Ideação · Tipo: erro de método

## Atividade

Preparação do board de brainstorming, definindo como agrupar as ideias na etapa de convergência.

## O que a IA fez

Propôs agrupar as soluções pelas categorias do diagrama de Ishikawa — Machine, Methods e Materials — e montou três clusters com esses rótulos no board.

## Resultado

Erro de categoria. Ishikawa serve para classificar **causas** de um efeito indesejado. Reutilizar o mesmo eixo para classificar **soluções** não informa: quase toda proposta de automação cairia em *Methods*, e o agrupamento não separaria nada.

Corrigido para agrupar por **usuário atendido** — projetista externo, analista interno, os dois. Além de separar de fato, produz evidência para a questão 1, que é o maior bloqueio do projeto.

## Evidência

Commit `cd374ce` criou o board com clusters de Ishikawa. Commit `05456ad` trocou pelos clusters de usuário atendido.

## Aprendizado

Ferramenta de análise tem escopo. Reaproveitar o eixo de uma técnica em outra fase parece econômico e costuma produzir classificação vazia. Verificar se o eixo escolhido de fato separa os itens antes de adotá-lo.
