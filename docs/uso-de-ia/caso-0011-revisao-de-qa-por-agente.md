# Caso 0011: Revisão de QA por Agente de IA na AT03-US09

Data: 21/11/2026. Fase: Desenvolvimento. Tipo: benefício.

## Atividade

Implementação da AT03-US09 (issue #212): ao salvar um grupo ou substituir um documento apontado, o sistema pergunta "Marcar o apontamento como corrigido?". O integrante definiu onde a pergunta entra e como se comporta, e usou a IA para mapear os componentes envolvidos e apoiar a escrita dos testes.

## O que a IA Fez

No papel de QA, um agente de IA conferiu o diff contra os seis critérios de aceite da issue e listou casos de borda:

- Fechar o diálogo com ESC recusava só o primeiro apontamento e abria o próximo. Com três apontamentos, o usuário precisava apertar ESC três vezes.
- Faltava teste para erro na resposta da API.
- Faltava teste para o administrador que edita o projeto de outra pessoa, caso em que a pergunta não deve aparecer.

## Resultado

Benefício. Os três pontos não estavam cobertos pela implementação e foram ajustados antes do commit. A decisão sobre o que corrigir ficou com o integrante.

## Evidência

PR #261. Commit `06c796cc` cobre os casos de ESC, erro na resposta e administrador que não é dono em `ConsumerUnitsPage.test.tsx`.

## Aprendizado

Pedir à IA que procure falhas contra os critérios da issue encontra pontos que quem implementou não viu. A revisão por IA complementa a revisão de PR por outro integrante, não a substitui.
