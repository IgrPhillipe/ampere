# Fontes Normativas

Levantamento das fontes públicas que definem o cálculo de demanda para edificações com múltiplas unidades consumidoras na Neoenergia PE. Feito em 17/08/2026 por pesquisa aberta, sem contato com o cliente.

A norma existe, é pública e traz a metodologia completa com exemplos resolvidos. Fecha a questão 2 do registro de [`questões em aberto`](../produto/questoes-em-aberto.md).

---

## Duas famílias de norma, e elas se comportam diferente

Confusão fácil de fazer, então fica registrado antes de tudo:

| Família | De quem é | Acesso | O que trata |
| :------------- | :--------------------- | :------------------------------------------ | :------------------------------------------------------------ |
| **DIS-NOR-xxx** | Da própria Neoenergia | **Pública e gratuita**, no site da distribuidora | Como se conecta à rede dela. **É aqui que está o cálculo de demanda.** |
| **ABNT NBR**    | Da ABNT, entidade nacional | **Vendida**, sem API pública               | Instalação elétrica em geral: condutor, eletroduto, aterramento, subestação |

A Neoenergia publica integralmente o que é dela. O que é pago pertence a outra entidade, e por isso ela não pode redistribuir. **Não há norma escondida nem exigência de comprar algo para conhecer a regra de cálculo.**

As 12 NBR citadas pela DIS-NOR-053 são referências de instalação e não entram no cálculo de demanda. A verificação está em [As NBRs pagas não bloqueiam este projeto](#as-nbrs-pagas-não-bloqueiam-este-projeto).

---

## A norma principal

**DIS-NOR-053 — Fornecimento de Energia Elétrica à Edificações com Múltiplas Unidades Consumidoras até 34,5 kV**

| Campo | Valor |
| :---------------- | :------------------------------------------------------------------------ |
| Revisão vigente   | **REV 06** |
| Data de aprovação | **09/09/2025** |
| Aprovador         | Ricardo Prado Pina |
| Extensão          | 353 páginas |
| Abrangência       | Documento **unificado** entre as distribuidoras do grupo Neoenergia: Coelba, **Pernambuco**, Cosern e Elektro |
| Download          | [PDF direto](https://www.neoenergia.com/documents/d/rn/dis-nor-053-rev06) · [índice de normas da Neoenergia PE](https://www.neoenergia.com/web/pernambuco/normas-tecnicas) |

Norma complementar, referenciada o tempo todo pela 053 para o método da carga instalada:

**DIS-NOR-030 — Fornecimento de Energia Elétrica em Tensão Secundária de Distribuição à Edificações Individuais**, REV 07 ([PDF](https://www.neoenergia.com/documents/d/pernambuco/dis-nor-030-rev07?download=true)). O cálculo está no item 6.27, página 47.

O PDF da 053 está hospedado sob o caminho `/d/rn/` porque é o mesmo documento das quatro distribuidoras. O próprio histórico de revisões declara a unificação.

---

## A metodologia de cálculo

Está no **Anexo I** da DIS-NOR-053, página 106, com **5 exemplos numéricos resolvidos** de ponta a ponta. É exatamente a especificação que o motor precisa.

### Estrutura geral

A demanda da edificação é a soma das demandas das áreas residencial, comercial e de serviço (item 6.21.1):

```
Df = (Dr × Fr) + Ds
```

### Área residencial — método da área útil

```
Dr = D_apto(área útil) × f_coinc(nº de apartamentos) × Nº de apartamentos
```

Depois aplica-se o **fator de segurança** `Fr`, que varia por faixa da demanda calculada.

A norma declara que esse método é preferível ao da carga instalada, porque evita superdimensionamento do ramal e do transformador (item 6.22.1).

### Área de serviço — método da carga instalada

```
Ds = a + g

a = (P_iluminação / Fp × Fd_i) + (P_TUG / Fp × Fd_t)
g = motores, com fator de demanda 1,00 para o maior e 0,50 para os demais
```

### Regras por tipo de edificação

| Tipo | Método |
| :------------------------------------- | :------------------------------------------------------------------------------ |
| Uso coletivo residencial               | Área útil para a parte residencial; carga instalada para os serviços do condomínio |
| Uso coletivo não residencial           | Carga instalada (DIS-NOR-030), tanto no total quanto por unidade                  |
| Misto residencial e comercial          | Partes tratadas em separado e somadas: comercial por carga instalada, residencial por área útil |
| Smart, Studio, Home Studio, acima de 15 unidades | Área útil com fator de coincidência fixo de **90%**, independentemente do número de unidades. Carga instalada é opcional |
| Unidade com carregador veicular        | Demanda da área útil somada à da estação de recarga, multiplicada por fator de coincidência conforme a quantidade de carregadores no condomínio |

Há ainda um **valor mínimo por tensão de fornecimento** que sobrepõe o cálculo. No exemplo 1 da norma, uma edificação com demanda calculada de 32,37 kVA em 380/220 V tem o mínimo de 46 kVA aplicado.

### Tabelas paramétricas identificadas

- Demanda do apartamento por faixa de área útil
- Fator de coincidência por número de apartamentos
- Fator de segurança por faixa de demanda residencial
- Fator de demanda por tipo de carga e de ocupação
- Potência em kVA por potência de motor em cv
- Valor mínimo e dimensionamento de ramal por tensão de fornecimento

---

## Frequência de revisão

O histórico de alterações da própria norma:

| Revisão | Data |
| :------ | :--------- |
| 00 | 29/10/2021 |
| 01 | 21/12/2021 |
| 02 | 22/02/2022 |
| 03 | 16/05/2022 |
| 04 | 22/07/2025 |
| 05 | 26/08/2025 |
| 06 | 09/09/2025 |

Sete revisões em menos de quatro anos, e **três delas em menos de dois meses** entre julho e setembro de 2025.

**Consequência de arquitetura:** os parâmetros normativos não podem ser constantes no código. Precisam ser dados versionados e persistidos, com o resultado do cálculo registrando qual revisão aplicou. Isso atende de uma vez três coisas já escritas no projeto: a rastreabilidade prometida em [`../produto/objetivos-projeto.md`](../produto/objetivos-projeto.md), o requisito de classes de domínio persistidas em [`../../app/back/README.md`](../../app/back/README.md), e a herança e polimorfismo por tipo de edificação que a tabela acima praticamente desenha sozinha.

---

## O processo de submissão

Canais, documentos exigidos, prazo de análise e validade da aprovação estão em [`../negocio/processo-submissao.md`](../negocio/processo-submissao.md). Este documento cobre apenas a norma e o método de cálculo.

---

## Fontes regulatórias da ANEEL

- **PRODIST Módulo 3 — Conexão ao Sistema de Distribuição**, aprovado como Anexo III da REN nº 956/2021. Piso regulatório que toda norma de distribuidora respeita. Baixar pela [página oficial do PRODIST](https://www.gov.br/aneel/pt-br/centrais-de-conteudos/procedimentos-regulatorios/prodist), que lista a versão vigente e o histórico. O PDF direto em `www2.aneel.gov.br/cedoc/` responde 403 fora do navegador, então não vale linkar.
- **Portal de Dados Abertos da ANEEL**, em CKAN, com download em CSV e JSON e **API para consulta automatizada**. Não tem regra de cálculo, mas serve para contexto e possivelmente para a métrica de sucesso. [dadosabertos.aneel.gov.br](https://dadosabertos.aneel.gov.br/)

---

## O que continua fora de alcance

| Item | Situação |
| :---------------------------- | :--------------------------------------------------------------------------------------------- |
| **Erros mais comuns**         | Nenhuma fonte pública os enumera. Continua dependendo do cliente.                                |
| **Método interno de análise** | Como a equipe da Neoenergia confere o cálculo não é público. Continua dependendo do cliente.     |

### As NBR não entram no cálculo de demanda

A DIS-NOR-053 referencia 12 normas ABNT, vendidas e sem API pública. Verificando cada citação no PDF, todas aparecem em contexto de instalação: condições de eletroduto, método de instalação para dimensionamento de condutor, aterramento e conformidade de subestação. O Anexo I, que contém a metodologia e as tabelas paramétricas, tem uma única menção a NBR em cerca de 20 páginas.

O método de demanda é autocontido entre DIS-NOR-053 e DIS-NOR-030, ambas gratuitas. Não é necessário adquirir norma da ABNT para construir o motor de cálculo.



---

## Efeito no registro de questões

O levantamento fechou a questão 2 e adiantou 1c, 3, 4 e 9. O estado de cada uma está em [`../produto/questoes-em-aberto.md`](../produto/questoes-em-aberto.md), que é o registro único.
