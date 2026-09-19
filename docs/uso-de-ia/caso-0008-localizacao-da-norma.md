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

## Desfecho — confirmado pela cliente

No encontro de **18/08/2026**, Talita, da Neoenergia, indicou as normas usadas no cálculo de demanda. A professora Chaina repassou os links no Classroom em **20/08/2026**. Vieram as mesmas duas normas, com os mesmos ponteiros que o time havia localizado três dias antes: DIS-NOR-053, Anexo I, página 106, e DIS-NOR-030, item 6.27, página 47.

A busca independente não só antecipou a resposta como acertou o alvo. A reunião do dia 18 foi de validação, e não de descoberta — que era exatamente a aposta registrada abaixo.

## Aprendizado

Nem toda lacuna precisa do cliente. Antes de transformar uma dúvida em pergunta de reunião, verificar se a resposta é pública. Neste caso, a diferença foi entre uma reunião de "nos expliquem o problema" e uma de "validem nosso entendimento".

O mesmo raciocínio vale para as dúvidas que sobraram sobre a norma: a divergência entre o Quadro 33 da 053 e a Tabela 13 da 030 parecia pergunta para a distribuidora e foi resolvida lendo o Anexo I, item 13. Antes de escrever a pergunta, ler a fonte inteira.
