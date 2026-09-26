# Caso 0005: Matrizes de Risco e Decisão Desproporcionais ao Problema

Data: 17/08/2026. Fase: Ideação. Tipo: excesso de complexidade.

## Atividade

Montagem do board para as atividades de análise de riscos e escolha da proposta final.

## O que a IA Fez

Construiu uma matriz de probabilidade por impacto em grade 3×3, uma tabela de riscos de cinco colunas e uma matriz de decisão de sete colunas, com escala de risco e critério de decisão ponderado a definir. Cinco zonas no board.

## Resultado

Excesso. Para quatro propostas em uma sessão de uma tarde, matriz ponderada e mapa de calor custam mais do que informam. Duas questões em aberto (escala de risco e critério de decisão) existiam apenas por causa dessas ferramentas.

O board foi reduzido a um comparativo único de seis colunas, com o risco expresso como "do que depende que não controlamos". As duas questões deixaram de existir.

## Evidência

Commit `9b5b70e` montou o board com cinco zonas. Commit `05456ad` reduziu para três zonas e uma tabela.

## Aprendizado

Método deve ser proporcional à decisão. FMEA e matriz de Pugh existem para dezenas de itens e times grandes; com quatro propostas, a discussão decide melhor que a aritmética. Antes de escolher a ferramenta, considerar quantos itens ela vai ordenar.
