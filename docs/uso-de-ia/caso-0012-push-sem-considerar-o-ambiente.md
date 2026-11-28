# Caso 0012: Envio Sugerido sem Considerar o Ambiente Local

Data: 21/11/2026. Fase: Desenvolvimento. Tipo: contexto não considerado.

## Atividade

Envio da AT03-US09 (issue #212) ao repositório remoto, em uma máquina Windows.

## O que a IA Fez

Indicou que a tarefa estava pronta para envio e sugeriu os comandos de commit e push.

## Resultado

Limitação. O hook de pre-push barrou o envio. No Windows, a conversão automática de fim de linha para CRLF fazia a checagem de formatação falhar em mais de mil arquivos, porque o projeto exige LF. O código estava correto; a causa era a configuração do Git na máquina, que a IA não considerou.

Na mesma tarefa, 21 testes da suíte completa falharam por timeout, causado por duas execuções pesadas em paralelo, e não pela mudança. Com tempo limite maior, os 90 testes dos arquivos afetados passaram.

## Evidência

`app/front/.husky/pre-push` executa `pnpm validate:ci` quando há mudança em `app/front`. `app/front/.editorconfig` define `end_of_line = lf`. O envio foi concluído no PR #261.

## Aprendizado

A IA não conhece o que não está escrito, como a configuração da máquina do integrante. "Pronto para envio" só vale depois que o hook passa. Quando uma validação falha em massa, verificar primeiro o ambiente, e não o código.
