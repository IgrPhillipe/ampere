# Caso 0008 — Localização da DIS-NOR-053 e extração da metodologia

Data: 17/08/2026 · Fase: Imersão · Tipo: benefício

## Atividade

Investigação de qual documento normativo rege o cálculo de demanda na Neoenergia PE. A questão estava registrada como o maior bloqueio do projeto, e a expectativa era depender de resposta do cliente.

## O que a IA fez

Pesquisou fontes públicas, localizou a página de normas técnicas da Neoenergia Pernambuco e identificou a **DIS-NOR-053 REV 06**, de 09/09/2025, com 353 páginas. Baixou o PDF, extraiu o texto e localizou a metodologia de cálculo no Anexo I, com as fórmulas, os métodos por tipo de edificação, as tabelas paramétricas e cinco exemplos numéricos resolvidos. Extraiu também o histórico de revisões.

## Resultado

Benefício. A questão deixou de ser bloqueio. O time passou a ter a especificação real do motor de cálculo e cinco casos de teste prontos, sem depender de resposta do cliente.

O histórico de revisões — sete em menos de quatro anos, três delas em dois meses — virou requisito de arquitetura: parâmetros normativos como dados versionados, não constantes no código.

## Evidência

[`tecnico/fontes-normativas.md`](../tecnico/fontes-normativas.md), commit `9d429df`.

## Aprendizado

Nem toda lacuna precisa do cliente. Antes de transformar uma dúvida em pergunta de reunião, verificar se a resposta é pública. Neste caso, a diferença foi entre uma reunião de "nos expliquem o problema" e uma de "validem nosso entendimento".
