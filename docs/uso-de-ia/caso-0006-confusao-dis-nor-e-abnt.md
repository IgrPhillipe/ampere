# Caso 0006: Redação Misturou Norma Gratuita da Neoenergia com Norma Paga da ABNT

Data: 17/08/2026. Fase: Ideação. Tipo: ambiguidade de redação.

## Atividade

Redação do documento de fontes normativas e do documento de apoio à reunião.

## O que a IA Fez

Escreveu, em sequência, que a DIS-NOR-053 referencia 12 normas ABNT e que essas normas são vendidas e não têm API pública, sem separar visualmente as duas famílias de documento.

## Resultado

Ambiguidade. O texto era literalmente correto, mas permitia entender que as normas da Neoenergia eram as pagas, e que a distribuidora exigia um documento que não disponibiliza. São coisas distintas:

- **DIS-NOR-xxx** pertencem à Neoenergia, são públicas e gratuitas no site dela
- **ABNT NBR** pertencem a outra entidade, são vendidas, e por isso a Neoenergia não pode redistribuí-las

A confusão só apareceu por pergunta de um leitor. Documento correto que induz leitura errada é defeito de documento.

## Evidência

O leitor apontou a contradição entre "as 12 normas são vendidas" e "o método é autocontido entre duas normas gratuitas". Commit `5ad7cad` separou as famílias em tabela explícita.

## Aprendizado

Correção literal não basta. Quando duas entidades diferentes aparecem no mesmo parágrafo com propriedades opostas, separá-las em estrutura (tabela, seção) em vez de confiar na ordem das frases.
