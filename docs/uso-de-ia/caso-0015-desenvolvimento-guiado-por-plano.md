# Caso 0015: Desenvolvimento Guiado por Plano

Data: 21/11/2026. Fase: Desenvolvimento. Tipo: benefício.

## Atividade

Implementação de issues com regra normativa ou impacto em várias camadas: indicadores da análise (#137), carga dos motores pela Tabela 19 (#229) e carga mínima do apartamento (#230).

## O que a IA Fez

Antes do código, escreveu um plano por issue em `docs/tecnico/`: onde a regra está hoje, modelo de domínio, arquivos afetados, decisões em aberto, riscos e fatias com critério de pronto. As decisões que dependiam do grupo ficaram marcadas como pendentes até serem resolvidas.

## Resultado

Benefício. O integrante revisou o desenho no documento, onde mudar custa pouco, e não no diff. As decisões resolvidas ficaram registradas no próprio plano. Ao final, o plano foi atualizado para descrever o que foi construído, e virou documentação técnica da issue.

## Evidência

[`plano-137-indicadores.md`](../tecnico/plano-137-indicadores.md), [`plano-229-motores-tabela-19.md`](../tecnico/plano-229-motores-tabela-19.md) e [`plano-230-carga-minima-apartamento.md`](../tecnico/plano-230-carga-minima-apartamento.md). Commit `ef98402b` registra as decisões resolvidas da #230. Commits `2ca5c802` e `0e229cb8` alinham os planos ao que foi construído.

## Aprendizado

Para issue com regra de negócio complexa, revisar o plano antes do código. O plano só vale se for atualizado no fim; senão, vira documentação desatualizada.
