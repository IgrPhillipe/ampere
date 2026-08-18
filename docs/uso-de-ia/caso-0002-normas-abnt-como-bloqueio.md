# Caso 0002 — Normas pagas apontadas como bloqueio sem verificação

Data: 17/08/2026 · Fase: Ideação · Tipo: resposta incorreta

## Atividade

Levantamento das fontes normativas que definem o cálculo de demanda.

## O que a IA fez

Registrou as normas ABNT NBR 5410 e NBR 14039 como item "fora de alcance" do projeto, por serem vendidas pela ABNT, e sugeriu consultar a biblioteca da CESAR sobre assinatura institucional.

## Resultado

Limitação. A afirmação foi feita antes de verificar se o cálculo de demanda dependia dessas normas. A verificação posterior, extraindo o texto do PDF da DIS-NOR-053, mostrou que as 12 citações a NBR aparecem em contexto de instalação: condições de eletroduto, método de instalação para dimensionamento de condutor, aterramento e conformidade de subestação. O Anexo I, que concentra a metodologia de demanda, tem uma única menção a NBR em cerca de vinte páginas.

O método é autocontido entre DIS-NOR-053 e DIS-NOR-030, ambas gratuitas. O alerta, se não corrigido, poderia ter levado o time a gastar tempo ou dinheiro atrás de um documento desnecessário.

## Evidência

Commit `9d429df` criou `tecnico/fontes-normativas.md` com as NBR listadas como bloqueio. Commit `522c34e` corrigiu, após a verificação no PDF.

## Aprendizado

Classificar algo como bloqueio exige verificar a dependência, não apenas constatar que o documento é pago. A pergunta certa não é "esta norma é acessível?", e sim "o que estamos construindo depende dela?".
