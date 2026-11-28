# Caso 0014: Referências Trocadas na Própria DIS-NOR-030

Data: 21/11/2026. Fase: Desenvolvimento. Tipo: benefício.

## Atividade

Segunda leitura da Tabela 5 e do item 6.26.1.1 da DIS-NOR-030 REV 07, na implementação da carga mínima de iluminação e tomadas do apartamento (#230).

## O que a IA Fez

Conferiu a Tabela 5 valor a valor pela imagem da página 65/142, e não só pela extração de texto, que perde o sublinhado do "≤" e mostra "<". Na leitura dos itens que remetem à tabela, apontou duas referências trocadas na norma:

- O item 6.27.1.1 pede a carga mínima "conforme item 6.25.7". O 6.25.7 trata das proteções da estação de recarga. A carga mínima de iluminação e tomadas é a do 6.26.1.1.
- O item 6.26.1.1 manda considerar as tomadas da cozinha "conforme indicado na Tabela 6". A Tabela 6 traz fatores de demanda. As tomadas de 600 W da cozinha estão na Tabela 5, que é a usada no Exemplo 3 da própria norma.

## Resultado

Benefício. O motor aplica a regra que a norma pretende, e não a que o texto literal indica. As duas decisões ficaram registradas com a justificativa e a página, para quem revisar o memorial entender por que o sistema não segue a remissão literal.

O procedimento criado depois do caso 0010 (página impressa, dupla leitura, conferência pela imagem) funcionou: na #229, a mesma segunda leitura das Tabelas 11, 18 e 19 e do Exemplo 3 não encontrou divergência.

## Evidência

Commit `93b4916c` registra a segunda leitura e as duas referências trocadas em [`../tecnico/fontes-normativas.md`](../tecnico/fontes-normativas.md). Commit `1e64a572` registra a segunda leitura sem divergência da #229.

## Aprendizado

A norma também erra. Quando uma remissão leva a um item sem relação com o assunto, conferir o exemplo resolvido da própria norma antes de seguir o texto literal, e registrar a decisão com a página.
