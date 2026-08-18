# Caso 0007 — Documento derivado divergiu da fonte de verdade

Data: 17/08/2026 · Fase: Ideação · Tipo: inconsistência

## Atividade

Manutenção paralela do documento visual de apoio à reunião e dos documentos em markdown do repositório.

## O que a IA fez

Manteve duas listas de perguntas ao cliente: uma no markdown e outra no documento visual. Ao responder a questão da base normativa por pesquisa, atualizou o markdown e não o documento visual.

## Resultado

Inconsistência. O documento de reunião continuou pedindo ao cliente qual era a norma de cálculo, informação que o repositório já registrava como encontrada. Levado à reunião naquele estado, passaria a impressão de que o time não fez o levantamento.

O mesmo tipo de divergência apareceu na numeração das questões, com a lista visual numerada de 1 a 7 enquanto os identificadores no registro iam de 1 a 18.

## Evidência

Revisão de conteúdo apontou a pergunta obsoleta. Commit `7cecc76` estabeleceu markdown como fonte de verdade e HTML como derivado, com a regra registrada em `docs/README.md`.

## Aprendizado

Duas listas do mesmo conteúdo divergem, é questão de tempo. Definir fonte de verdade explícita, e no derivado referenciar em vez de copiar. Quando a cópia for inevitável, atualizar as duas na mesma leva.
