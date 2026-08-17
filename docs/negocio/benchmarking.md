# Benchmarking

> Levantamento de concessionárias e ferramentas que hoje calculam ou recebem a demanda elétrica de edificações com múltiplas unidades consumidoras — o caso em que a Neoenergia PE reprova cerca de 50 % dos ~1.400 projetos recebidos por ano. O objetivo é mapear onde estão as lacunas de automação, padronização e validação.

Fase: **Imersão** ([`../processo.md`](../processo.md)) · Responsável: André Montenegro · Fonte: [Figma — Benchmarking](https://www.figma.com/design/eiw2Pt6gUGCxStE0wVqrKd/Benchmarking)

---

## 01 — Referências de mercado

Nenhuma outra distribuidora é concorrente direta — todas operam em regiões distintas. Elas entram aqui como **referência de processo**: como recebem, calculam e validam projetos elétricos. Junto delas mapeamos também a ferramenta que o projetista usa antes de submeter, porque é ali que o cálculo de demanda realmente acontece hoje.

### Concessionárias — mesmo processo de submissão e análise

| Referência    | Descrição                                                                                                                                                       |
| :------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **COPEL PEW** | Sistema oficial de submissão e histórico de projetos elétricos da Copel. Recebe documentação pronta, mas o cálculo de demanda é feito manualmente antes do envio. |
| **CEMIG**     | Portal de solicitação de Análise de Carga e Projeto Elétrico. Elimina o atendimento presencial, mas o cálculo continua sendo responsabilidade do projetista.      |
| **Enel**      | Simulador online que calcula a demanda residencial conforme LIG BT³ 2014 e NBR¹ 5410. Resultado imediato, porém isolado do processo oficial de aprovação.         |
| **CPFL**      | Portal de projetos particulares com normas técnicas publicadas (ex. GED⁴ 4621) definindo o modelo de cálculo. Regras claras, mas aplicação totalmente manual.     |

### Ferramenta do projetista — onde o cálculo acontece hoje

| Referência         | Descrição                                                                                                                                                                                                                                    |
| :----------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AltoQi Builder** | Software BIM de projeto elétrico predial, usado pelo projetista antes de submeter. Dimensiona conforme NBR¹ 5410 e normas das concessionárias, gera quadro de cargas e demanda, detecta erros e emite memorial automático — mas não conversa com a concessionária. |

---

## 02 — Comparativo por critério

Nove critérios derivados do desafio: o que a ferramenta precisa fazer para reduzir a reprovação de projetos com múltiplas unidades consumidoras.

**Legenda:** ✅ recurso disponível · ❌ recurso não disponível · ⚠️ parcialmente disponível / não avaliado

| Critério                                         | COPEL PEW | CEMIG | Enel | CPFL | AltoQi Builder |
| :----------------------------------------------- | :-------: | :---: | :--: | :--: | :------------: |
| Cobre edificações com múltiplas UCs²?            |     ✅     |   ✅   |  ❌   |  ✅   |       ✅        |
| Tem calculadora de demanda automática?           |     ❌     |   ❌   |  ✅   |  ❌   |       ✅        |
| Calcula segundo a norma (NBR¹ 5410/14039)?       |     ❌     |   ❌   |  ✅   |  ⚠️   |       ✅        |
| Padroniza o resultado do cálculo?                |     ❌     |   ❌   |  ✅   |  ⚠️   |       ✅        |
| Valida erros antes do envio?                     |     ❌     |   ❌   |  ❌   |  ❌   |       ✅        |
| Aponta onde está o erro e como corrigir?         |     ❌     |   ❌   |  ❌   |  ❌   |       ✅        |
| Mostra memória de cálculo?                       |     ❌     |   ❌   |  ⚠️   |  ❌   |       ✅        |
| Integrada ao sistema oficial de submissão?       |     ✅     |   ✅   |  ❌   |  ✅   |       ❌        |
| Apoia também a análise interna da concessionária? |     ✅     |   ✅   |  ❌   |  ✅   |       ❌        |

---

## 03 — O que o benchmark mostra

### Ninguém junta cálculo e aprovação.

Quem calcula bem opera fora do processo oficial: o simulador da Enel é isolado e só cobre unidade individual; a AltoQi resolve o cálculo completo, mas é ferramenta do projetista e não conversa com a concessionária. Quem está dentro do processo — COPEL, CEMIG e CPFL — recebe o projeto, mas não calcula nada.

E a linha mais reveladora é a de validação: **nenhuma concessionária verifica o cálculo antes do envio, nem aponta onde está o erro**. É exatamente aí que nascem os 50 % de reprovação.

### Onde isso posiciona a nossa solução

Quatro linhas do comparativo não têm nenhum ✅ do lado das concessionárias:

- Valida erros antes do envio
- Aponta onde está o erro e como corrigir
- Mostra memória de cálculo
- Padroniza o resultado do cálculo

São as mesmas capacidades que [`objetivos-projeto.md`](objetivos-projeto.md) define como objetivo do MVP — com a diferença de que aqui elas precisam existir **dentro do processo de submissão**, e não numa ferramenta paralela como a AltoQi.

---

## 04 — Glossário

1. **NBR** — Norma Brasileira, elaborada pela ABNT (Associação Brasileira de Normas Técnicas). A NBR 5410 regula instalações elétricas de baixa tensão e a NBR 14039, as de média tensão.
2. **UC** — Unidade Consumidora: cada ponto de consumo atendido pela concessionária. O desafio trata de edificações com várias UCs (prédios e condomínios).
3. **LIG BT** — Livro de Instruções Gerais para fornecimento de energia em Baixa Tensão; norma da concessionária com as regras de conexão até 1 kV (ex.: LIG BT 2014, da Enel).
4. **GED** — código de normas técnicas da CPFL (Gestão Eletrônica de Documentos); a GED 4621, por exemplo, trata de medição agrupada em baixa tensão.

---

## Observação

Existem **dois arquivos "Benchmarking"** no projeto do Figma. Este documento transcreve o mais recente (`eiw2Pt6gUGCxStE0wVqrKd`, editado em 12/08/2026). A versão anterior (`PAepIjzcmolGGSHEfmezda`, 10/08/2026) foi superada e não deve ser usada como referência.

Nenhum documento normativo da **Neoenergia PE** aparece neste levantamento — só os das concessionárias comparadas. Ver [`../produto/questoes-em-aberto.md`](../produto/questoes-em-aberto.md).
