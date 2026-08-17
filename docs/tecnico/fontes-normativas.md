# Fontes Normativas

> Levantamento das fontes públicas que definem o cálculo de demanda para edificações com múltiplas unidades consumidoras na Neoenergia PE. Feito em 17/08/2026 por pesquisa aberta, sem contato com o cliente.

**Resultado:** a norma existe, é pública e traz a metodologia completa com exemplos resolvidos. A questão 2, que era o maior bloqueio do projeto, está respondida.

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

**DIS-NOR-030 — Fornecimento de Energia Elétrica em Tensão Secundária de Distribuição à Edificações Individuais**, REV 07 ([PDF](https://www.neoenergia.com/documents/d/pernambuco/dis-nor-030-rev07?download=true)).

> O PDF da 053 está hospedado sob o caminho `/d/rn/` porque é o mesmo documento das quatro distribuidoras. Não é erro nem versão de outro estado — o próprio histórico de revisões declara a unificação. Ainda assim, vale confirmar com o cliente que é essa a revisão em uso em PE.

---

## A metodologia de cálculo

Está no **Anexo I** da DIS-NOR-053, com **5 exemplos numéricos resolvidos** de ponta a ponta. É exatamente a especificação que o motor precisa.

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

**Consequência de arquitetura:** os parâmetros normativos não podem ser constantes no código. Precisam ser dados versionados e persistidos, com o resultado do cálculo registrando qual revisão aplicou. Isso atende de uma vez três coisas já escritas no projeto: a rastreabilidade prometida em [`../negocio/objetivos-projeto.md`](../negocio/objetivos-projeto.md), o requisito de classes de domínio persistidas em [`../../app/back/README.md`](../../app/back/README.md), e a herança e polimorfismo por tipo de edificação que a tabela acima praticamente desenha sozinha.

---

## O processo de submissão hoje

Levantado nas páginas públicas da Neoenergia PE.

| Aspecto | O que foi encontrado |
| :---------------------- | :------------------------------------------------------------------------------------------ |
| Canal para MT, grandes clientes e geração distribuída | Portal Clientes Corporativos e [portal de geração distribuída](https://gdneoenergiapernambuco.neoenergia.com/) |
| Canal para baixa tensão acima de 50 kW | E-mail `projetos.pe@neoenergia.com` |
| Formulários simplificados | Obrigatórios desde 01/02/2024 |
| Documentos exigidos | Carta de solicitação, **ART** do engenheiro, desenhos assinados e **memorial descritivo contendo o cálculo de demanda**, cálculo de proteção e queda de tensão |
| Prazo de análise | **30 dias**, suspensos se faltar informação solicitada |
| Resposta | Enviada ao e-mail cadastrado, **com os motivos da reprovação e as providências corretivas necessárias** |
| Re-submissão | Mesmo processo, após correção |
| Validade da aprovação | **36 meses** a partir da aprovação |

Fonte: [Projeto Particular](https://www.neoenergia.com/web/pernambuco/seu-negocio/projeto-particular) e [Projetistas e Prestadores de Serviço](https://www.neoenergia.com/web/pernambuco/seu-negocio/projetistas-prestadores-de-servico).

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

### As NBRs pagas não bloqueiam este projeto

A DIS-NOR-053 referencia 12 normas ABNT, sendo a NBR 5410 a mais citada. Elas são vendidas pela ABNT e não têm API pública.

**Mas não são necessárias para o cálculo de demanda.** Verificando cada citação no PDF, as NBRs aparecem sempre em contexto de **instalação**: condições de eletroduto, método de instalação B1/D/F para dimensionamento de condutor, aterramento, conformidade de subestação. O **Anexo I**, que contém a metodologia de cálculo e as tabelas paramétricas, tem uma única menção a NBR em cerca de 20 páginas.

Ou seja: o método de demanda é **autocontido** entre DIS-NOR-053 e DIS-NOR-030, ambas gratuitas.

| Pergunta | Resposta |
| :-- | :-- |
| Precisamos comprar NBR para construir o MVP? | Não. A metodologia de demanda não depende delas. |
| Precisamos pagar para entregar o projeto acadêmico? | Não. |
| Precisamos pagar para acompanhar atualizações? | Da NBR, sim, se um dia precisarmos dela. **Da DIS-NOR-053, não** — é gratuita e é a que rege o cálculo. |
| Existe API para as NBRs? | Não pública. O acesso é por assinatura (coleção ABNT e plataformas equivalentes). Vale checar com a biblioteca da CESAR, mas não é bloqueio. |
| Dá para automatizar a leitura da norma da Neoenergia? | **Sim.** O PDF tem URL estável e texto extraível. Este documento foi produzido justamente assim, com `pdftotext` sobre o PDF baixado. |

> **Ideia de funcionalidade que nasce daí:** como a norma muda com frequência e o PDF tem URL estável e revisão no cabeçalho, dá para checar automaticamente se saiu uma revisão nova e alertar. Vira história de usuário e ataca direto a categoria *Machine* do Ishikawa, que é a única sem cobertura.

---

## Impacto nas questões em aberto

Referência: [`../produto/questoes-em-aberto.md`](../produto/questoes-em-aberto.md).

| Questão | Situação depois da pesquisa |
| :------ | :---------------------------------------------------------------------------------------------- |
| **2** — base normativa | **Respondida.** DIS-NOR-053 REV 06, pública, com metodologia e exemplos. Deixa de ser bloqueio. |
| **9a** — existe sistema? | **Em grande parte respondida.** Existem portais para MT, grandes clientes e GD, e e-mail para BT acima de 50 kW. |
| **9d** — reprovação e re-submissão | **Parcial.** A devolutiva com motivos e providências corretivas é regra publicada, e chega por e-mail. Ou seja, pelo menos em parte é manual. |
| **1c** — acesso externo | **Indício forte.** Projetistas externos já submetem por portal e por e-mail, então existe interação com quem está fora. |
| **4** — entrada e saída | **Informada.** O que se entrega hoje é um **memorial descritivo com o cálculo de demanda**. Esse é o formato de saída a mirar. |
| **3** — faixa de escopo | **Parcial.** A norma cobre MUC até 34,5 kV. O corte de 50 kW aparece como divisor de canal de submissão, não de metodologia. Confirmar lendo a norma. |
| **5** — métrica de sucesso | **Pista.** O prazo de 30 dias e os dados abertos da ANEEL dão material para uma métrica.        |
| **6** — erros mais comuns | **Segue aberta.** Depende do cliente.                                                            |

**Efeito prático:** o time pode começar a modelar o motor de cálculo agora, contra uma norma real e com cinco exemplos que servem de caso de teste. A conversa com o cliente deixa de ser "nos expliquem o problema" e passa a ser "validem nosso entendimento" — que é uma reunião muito melhor.
