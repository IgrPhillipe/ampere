# Benchmarking — Cálculo de demanda em edificações com múltiplas UCs

Análise de mercado para o desafio da **Neoenergia Pernambuco**.

---

## 1. Contexto

Projetos elétricos de edificações com **múltiplas unidades consumidoras** apresentam alto índice de erro no cálculo de demanda. A complexidade dos critérios — muitos parâmetros, tabelas e regras normativas — gera equívocos tanto do lado do cliente quanto na análise interna da concessionária.

| Indicador | Valor |
|---|---|
| Projetos desse tipo recebidos por ano | ~1.400 |
| Índice de reprovação | ~50% |
| Tempo de ocorrência | Problema recorrente, há anos |

**Consequências:** retrabalho para clientes e equipes técnicas, prazos de aprovação maiores e falta de padronização — o mesmo caso recebe soluções diferentes conforme quem interpreta a norma.

**Precedente relevante:** a simplificação dos critérios para projetos abaixo de 50 kVA já reduziu significativamente as reprovações nessa faixa. É evidência de que a causa é a complexidade do método, não desatenção de quem projeta.

---

## 2. Método

Os critérios não foram escolhidos por conveniência: cada um responde a um ponto explícito do desafio.

| # | Critério | Origem no desafio |
|---|---|---|
| 1 | Cobre edificações com múltiplas UCs | Recorte do problema |
| 2 | Tem calculadora de demanda automática | Ideia de solução |
| 3 | Calcula segundo a norma (NBR 5410/14039) | Complexidade normativa |
| 4 | Padroniza o resultado do cálculo | "Falta de padronização... interpretações distintas" |
| 5 | Valida erros antes do envio | Causa direta da reprovação |
| 6 | Aponta onde está o erro e como corrigir | Retrabalho |
| 7 | Mostra memória de cálculo | Necessária para a conferência |
| 8 | Integrada ao sistema oficial de submissão | Prazo de aprovação |
| 9 | Apoia a análise interna da concessionária | "Erros... internamente durante a análise" |

**Critérios descartados:** exigência de cadastro/CREA (ART é obrigatória nesse tipo de projeto — requisito legal, não lacuna) e interface para "cliente final" (o usuário real é o projetista que submete e o analista que revisa).

---

## 3. Referências analisadas

Nenhuma outra distribuidora é concorrente direta — todas operam em regiões distintas. Elas entram como **referência de processo**.

### Concessionárias

| Referência | Descrição |
|---|---|
| **COPEL PEW** | Sistema oficial de submissão e histórico de projetos. Recebe documentação pronta, mas o cálculo de demanda é feito manualmente antes do envio. |
| **CEMIG** | Portal de solicitação de Análise de Carga e Projeto Elétrico. Elimina o atendimento presencial, mas o cálculo continua sendo responsabilidade do projetista. |
| **Enel** | Simulador online que calcula a demanda residencial conforme LIG BT 2014 e NBR 5410. Resultado imediato, porém isolado do processo oficial e restrito a unidade individual. |
| **CPFL** | Portal de projetos particulares com normas técnicas publicadas (ex. GED 4621) definindo o modelo de cálculo. Regras claras, mas aplicação totalmente manual. |

### Ferramenta do projetista

| Referência | Descrição |
|---|---|
| **AltoQi Builder** | Software BIM de projeto elétrico predial, usado antes da submissão. Dimensiona conforme NBR 5410 e normas das concessionárias, gera quadro de cargas e demanda, detecta erros e emite memorial automático — mas não conversa com a concessionária. |

---

## 4. Comparativo

`✓` atende · `✕` não atende · `◐` atende em parte

| Critério | COPEL | CEMIG | Enel | CPFL | AltoQi |
|---|:---:|:---:|:---:|:---:|:---:|
| Cobre edificações com múltiplas UCs | ✓ | ✓ | ✕ | ✓ | ✓ |
| Calculadora de demanda automática | ✕ | ✕ | ✓ | ✕ | ✓ |
| Calcula segundo a norma | ✕ | ✕ | ✓ | ◐ | ✓ |
| Padroniza o resultado | ✕ | ✕ | ✓ | ◐ | ✓ |
| **Valida erros antes do envio** | ✕ | ✕ | ✕ | ✕ | ✓ |
| **Aponta o erro e como corrigir** | ✕ | ✕ | ✕ | ✕ | ✓ |
| Mostra memória de cálculo | ✕ | ✕ | ◐ | ✕ | ✓ |
| Integrada à submissão oficial | ✓ | ✓ | ✕ | ✓ | ✕ |
| Apoia a análise interna | ✓ | ✓ | ✕ | ✓ | ✕ |

---

## 5. O que o benchmark mostra

**Ninguém junta cálculo e aprovação.** O padrão é complementar e nunca sobreposto:

- **Quem calcula bem opera fora do processo.** O simulador da Enel é isolado e só cobre unidade individual. A AltoQi resolve o cálculo completo, mas é ferramenta do projetista e não se comunica com a concessionária.
- **Quem está dentro do processo não calcula.** COPEL, CEMIG e CPFL recebem o projeto pronto; o cálculo permanece manual e sujeito a interpretação.
- **A linha mais reveladora é a de validação.** Nenhuma concessionária verifica o cálculo antes do envio nem aponta onde está o erro. É exatamente aí que nascem os 50% de reprovação.

### Implicação para a solução

O diferencial não está em construir mais uma calculadora — já existem boas. Está em ocupar o quadrante vazio: **cálculo automatizado e padronizado, com validação prévia, dentro do fluxo oficial de submissão**, servindo tanto o projetista quanto o analista.

---

## 6. Glossário

| Termo | Definição |
|---|---|
| **NBR** | Norma Brasileira (ABNT). A NBR 5410 regula instalações elétricas de baixa tensão; a NBR 14039, as de média tensão. |
| **UC** | Unidade Consumidora — cada ponto de consumo atendido pela concessionária. O desafio trata de edificações com várias UCs (prédios e condomínios). |
| **LIG BT** | Livro de Instruções Gerais para fornecimento em Baixa Tensão; norma da concessionária com as regras de conexão até 1 kV (ex.: LIG BT 2014, da Enel). |
| **GED** | Código de normas técnicas da CPFL. A GED 4621 trata de medição agrupada em baixa tensão. |
| **ART / CREA** | Anotação de Responsabilidade Técnica, registrada no Conselho Regional de Engenharia e Agronomia. Obrigatória neste tipo de projeto. |

---

## 7. Limitações

- As normas técnicas de cada distribuidora são públicas e estão referenciadas nas fontes. Já os **recursos dos portais** (o que a interface faz ou deixa de fazer) vêm de levantamento próprio da equipe — as distribuidoras não publicam documentação funcional dos sistemas.
- Células marcadas com `◐` indicam recurso parcial ou não verificável em fonte pública.
- A GED 4621 da CPFL limita a medição agrupada a 3–12 UCs e 75 kVA; acima disso valem outras normas. Recortes equivalentes existem nas demais distribuidoras, o que reforça a ausência de um método único.
- Referências avaliadas em agosto de 2026; portais e normas são revisados periodicamente (a GED 4621 está na versão 18, de set/2024).

---

## Fontes

### Marco regulatório

- [ANEEL — Resolução Normativa nº 1.000/2021](https://www2.aneel.gov.br/cedoc/ren20211000.pdf) — regras de prestação do serviço de distribuição: conexão, aprovação de projeto, prazos e responsabilidades. É a norma que todas as distribuidoras abaixo precisam observar.
- [ANEEL — página institucional da REN 1.000](https://www.gov.br/aneel/pt-br/assuntos/campanhas/resolucao-1000-da-aneel-seus-direitos-sobre-energia-eletrica-agora-num-so-lugar-2022)

### Referências analisadas

**COPEL**

- [PEW — Projeto Elétrico Web](https://www.copel.com/pewweb/paginas/inicio.jsf) — portal de submissão
- [Manual de Apoio do Sistema PEW (PDF)](https://www.copel.com/pewweb/ajuda/ManualApoioPEW.pdf) — confirma o fluxo: projetista cadastrado envia o projeto pronto; o sistema mantém histórico, mas não calcula

**CEMIG**

- [Normas Técnicas de Conexão](https://www.cemig.com.br/normas-tecnicas/normas-tecnicas-de-conexao/)
- [ND 5.5 — Fornecimento de Energia Elétrica em Tensão Secundária (PDF)](https://www.cemig.com.br/wp-content/uploads/2025/10/nd5_5_000001p.pdf)
- [ND 5.30 — Requisitos para Conexão de Acessantes em BT (PDF)](https://www.cemig.com.br/wp-content/uploads/2024/04/ND_5.30_Conexao-em-BT.pdf)

**Enel**

- [LIG BT 2014 — Fornecimento em tensão secundária](https://www.eneldistribuicaosp.com.br/normas-tecnicas/lig-bt-2014) — método de cálculo usado pelo simulador

**CPFL**

- [Normas Técnicas CPFL](https://www.cpfl.com.br/normas-tecnicas)
- [GED 4621 — Medição agrupada para fornecimento em tensão secundária (PDF)](https://sites.cpfl.com.br/documentos-tecnicos/GED-4621.pdf) — define o modelo de cálculo para 3 a 12 UCs no mesmo terreno, demanda total até 75 kVA. É a referência mais próxima do recorte do desafio.

**AltoQi**

- [AltoQi Builder — Software para projetos elétricos em BIM](https://www.altoqi.com.br/builder/software-para-projetos-eletricos-em-bim)
- [Parâmetros utilizados no dimensionamento pelo AltoQi Builder](https://suporte.altoqi.com.br/hc/pt-br/articles/115002210193)

### Normas técnicas citadas

- ABNT NBR 5410 — Instalações elétricas de baixa tensão
- ABNT NBR 14039 — Instalações elétricas de média tensão (1,0 kV a 36,2 kV)

---
