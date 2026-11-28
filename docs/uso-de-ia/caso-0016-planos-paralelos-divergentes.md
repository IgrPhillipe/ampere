# Caso 0016: Planos Escritos em Paralelo Divergiram

Data: 21/11/2026. Fase: Desenvolvimento. Tipo: inconsistência.

## Atividade

Planejamento da #229 (carga dos motores pela Tabela 19) e da #230 (carga mínima do apartamento), em sessões separadas de IA. As duas issues precisam ler tabela normativa dentro da validação do grupo.

## O que a IA Fez

Cada plano desenhou a mesma peça com nomes e formatos diferentes:

| Peça | Plano da #229 | Plano da #230 |
| :--- | :--- | :--- |
| Checar se a tabela existe | `isPublished` | `contains` |
| Contexto da validação | `contextFor` em `DemandCalculationService` | `ProjectTables` |
| Grupo validado | `ProjectGroups` | `ValidatedGroup` |
| Assinatura da validação | `validate(DemandContext)` | `validate(NormativeTables)` |

## Resultado

Limitação. Implementados como escritos, os dois planos criariam duas versões da mesma infraestrutura e um conflito de merge em vários arquivos do domínio.

A divergência foi detectada na comparação entre os planos, antes do código. Os dois passaram a um contrato único: a #229 entra primeiro e é dona da parte comum (`validate(DemandContext)`, `NormativeTables.contains`, `ProjectDemandContexts`, `ValidatedGroup`); a #230 só acrescenta a regra do mínimo sobre ela.

## Evidência

Commits `ac2fa870` (plano da #229) e `c1511e18` (plano da #230) alinham os dois ao contrato comum.

## Aprendizado

Cada sessão de IA só conhece o próprio contexto. Planos de issues que tocam as mesmas classes são comparados antes da implementação, e a parte comum ganha um dono.
