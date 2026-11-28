# Caso 0017: Revisão de PR com Apoio de IA

Data: outubro e novembro de 2026. Fase: Desenvolvimento. Tipo: benefício.

## Atividade

Revisão dos PRs dos integrantes antes do merge.

## O que a IA Fez

Revisou o diff de cada PR com foco em convenções do repositório, bugs e melhorias de código: nomes, comentários, padrões de `CONTRIBUTING.md` e `docs/tecnico/convencoes-front.md`, casos não tratados e trechos que podiam ser simplificados.

## Resultado

Benefício. Com a parte mecânica coberta pela IA, o revisor humano concentrou a revisão no que exige conhecer o produto: UI, UX, fluxos e regras de negócio. Os achados das duas frentes foram corrigidos no próprio PR, antes do merge.

## Evidência

PR #239: "Os achados da revisão foram corrigidos nos commits adicionados a este PR". PR #261: commits de revisão `694d8cc4` (comentários enxutos, convenção), `c01d1126` (nome do campo igual ao do formulário manual), `25fc94d5` e `6264a21b` (fluxo da pergunta de correção).

## Aprendizado

A revisão por IA não substitui a humana, mas muda onde o revisor gasta o tempo. Convenção e bug comum ficam com a IA; produto, fluxo e regra de negócio ficam com quem conhece o domínio.
