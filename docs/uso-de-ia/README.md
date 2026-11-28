# Uso de Inteligência Artificial no Projeto

Registro contínuo do uso de IA ao longo de Projetos 3, para o relatório da **aula 14 (28/11/2026)**.

O plano de ensino pede um relatório com quatro elementos: como a IA foi utilizada; em quais atividades o uso foi benéfico; em quais situações apresentou limitações, com exemplos práticos de respostas incorretas ou alucinações; e uma reflexão sobre cuidados e boas práticas.

Este diretório guarda os casos conforme acontecem. As quatro seções finais são escritas ao término do semestre, a partir dos casos.

## Como Registrar um Caso

Um arquivo por caso, nomeado `caso-NNNN-descricao-curta.md`, com estas seções fixas:

- **Atividade**: o que estava sendo feito e em que fase do projeto
- **O que a IA Fez**: a ação ou afirmação, sem interpretação
- **Resultado**: benefício ou limitação, e o efeito prático
- **Evidência**: arquivo, commit, trecho ou link que comprova
- **Aprendizado**: o que o time passa a fazer diferente

Um arquivo por caso evita conflito de merge entre os integrantes. O caso é registrado no dia em que acontece; reconstruí-lo em novembro não é viável.

## Índice de Casos

| # | Caso | Fase | Tipo |
| :-: | :--- | :--- | :--- |
| [0001](caso-0001-descompasso-de-cronograma.md) | Diagnóstico invertido de descompasso entre cronogramas | Ideação | Resposta incorreta |
| [0002](caso-0002-normas-abnt-como-bloqueio.md) | Normas pagas apontadas como bloqueio sem verificação | Ideação | Resposta incorreta |
| [0003](caso-0003-devolutiva-de-reprovacao.md) | Suposição sobre a devolutiva de reprovação | Ideação | Suposição não verificada |
| [0004](caso-0004-ishikawa-para-agrupar-solucoes.md) | Categorias de causa usadas para agrupar soluções | Ideação | Erro de método |
| [0005](caso-0005-excesso-de-cerimonia.md) | Matrizes de risco e decisão desproporcionais ao problema | Ideação | Excesso de complexidade |
| [0006](caso-0006-confusao-dis-nor-e-abnt.md) | Redação misturou norma gratuita da Neoenergia com norma paga da ABNT | Ideação | Ambiguidade |
| [0007](caso-0007-divergencia-entre-documentos.md) | Documento derivado divergiu da fonte de verdade | Ideação | Inconsistência |
| [0008](caso-0008-localizacao-da-norma.md) | Localização da DIS-NOR-053 e extração da metodologia | Imersão | Benefício |
| [0009](caso-0009-mapeamento-do-processo.md) | Mapeamento do processo de submissão por fontes públicas | Imersão | Benefício |
| [0010](caso-0010-citacao-de-item-normativo-inexistente.md) | Citação de item normativo que não existe na norma citada | Especificação | Alucinação |
| [0011](caso-0011-revisao-de-qa-por-agente.md) | Revisão de QA por agente de IA na AT03-US09 | Desenvolvimento | Benefício |
| [0012](caso-0012-push-sem-considerar-o-ambiente.md) | Envio sugerido sem considerar o ambiente local | Desenvolvimento | Contexto não considerado |
| [0013](caso-0013-comando-de-git-sem-efeito.md) | Comando de Git sem efeito | Desenvolvimento | Resposta incorreta |
| [0014](caso-0014-erratas-na-dis-nor-030.md) | Referências trocadas na própria DIS-NOR-030 | Desenvolvimento | Benefício |
| [0015](caso-0015-desenvolvimento-guiado-por-plano.md) | Desenvolvimento guiado por plano | Desenvolvimento | Benefício |
| [0016](caso-0016-planos-paralelos-divergentes.md) | Planos escritos em paralelo divergiram | Desenvolvimento | Inconsistência |
| [0017](caso-0017-revisao-de-pr-por-ia.md) | Revisão de PR com apoio de IA | Desenvolvimento | Benefício |

O relatório final, entregue em 28/11/2026, desenvolve as quatro seções abaixo a partir destes casos.

## Como a IA Foi Utilizada

Como assistente em todas as fases, sempre com revisão humana:

- **Ideação e imersão**: pesquisa em fontes públicas da Neoenergia, extração das normas em PDF, mapeamento do processo de submissão, preparação dos boards
- **Especificação**: histórias de usuário, critérios em BDD, entradas e saídas do motor de cálculo, plano de entregas
- **Desenvolvimento**: plano por issue antes do código, explicação de código existente, sugestões de solução, apoio em testes e mensagens de commit. A implementação e a decisão são do integrante
- **Qualidade**: revisão de PR (convenções, bugs e melhorias de código) e agente no papel de QA, revisando o diff contra os critérios da issue
- **Documentação**: documentação técnica e de produto, registro de pendências

## Onde o Uso Foi Benéfico

Em ordem de valor entregue:

- Localização da DIS-NOR-053 e da metodologia do Anexo I antes da reunião com a cliente, que confirmou as mesmas normas e páginas ([0008](caso-0008-localizacao-da-norma.md))
- Referências trocadas encontradas na própria DIS-NOR-030 ([0014](caso-0014-erratas-na-dis-nor-030.md))
- Revisão de PR e de QA: a IA cobre convenções, bugs e casos de borda, e o revisor humano foca em UI, UX, fluxos e regras de negócio ([0017](caso-0017-revisao-de-pr-por-ia.md), [0011](caso-0011-revisao-de-qa-por-agente.md))
- Plano por issue revisado antes do código ([0015](caso-0015-desenvolvimento-guiado-por-plano.md))
- Mapeamento do processo de submissão por fontes públicas ([0009](caso-0009-mapeamento-do-processo.md))

## Onde Apresentou Limitações

- **Alucinação**: item normativo atribuído a uma norma em que não existe ([0010](caso-0010-citacao-de-item-normativo-inexistente.md))
- **Resposta incorreta**: comparação contra fonte não oficial ([0001](caso-0001-descompasso-de-cronograma.md)), bloqueio declarado sem verificar dependência ([0002](caso-0002-normas-abnt-como-bloqueio.md)), comando sem efeito ([0013](caso-0013-comando-de-git-sem-efeito.md))
- **Suposição não verificada**: analogia com benchmarking tratada como fato ([0003](caso-0003-devolutiva-de-reprovacao.md))
- **Erro de método e excesso de complexidade**: ([0004](caso-0004-ishikawa-para-agrupar-solucoes.md), [0005](caso-0005-excesso-de-cerimonia.md))
- **Ambiguidade e inconsistência**: ([0006](caso-0006-confusao-dis-nor-e-abnt.md), [0007](caso-0007-divergencia-entre-documentos.md)), planos escritos em paralelo com a mesma peça desenhada de dois jeitos ([0016](caso-0016-planos-paralelos-divergentes.md))
- **Contexto não considerado**: ambiente da máquina ignorado no envio ([0012](caso-0012-push-sem-considerar-o-ambiente.md))

## Cuidados e Boas Práticas

- Conferir na fonte primária toda referência verificável
- Comparar apenas fontes oficiais
- Separar fato de inferência
- Verificar dependência antes de declarar bloqueio
- Escolher o método pelo tamanho da decisão
- Manter uma fonte de verdade por conteúdo
- Revisar o plano antes do código e comparar planos de issues que tocam as mesmas classes
- Nenhuma sugestão entra sem ser entendida e validada por lint, tipos, testes, build e revisão de PR
- Usar a IA também como revisora, com a decisão final do integrante
- O integrante é o autor e responde pelo resultado
- Registrar os casos no dia em que acontecem
- Não enviar dados sensíveis à IA
