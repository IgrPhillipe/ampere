# Questões em Aberto

> A Imersão definiu bem **o problema**. Ela ainda não define **o produto**. Este documento registra as decisões que faltam para transformar os objetivos em requisitos construíveis.

Regra: nenhuma dessas questões deve ser respondida por suposição dentro dos outros documentos. Enquanto estiverem abertas, aparecem como `TBD` com ponteiro para cá.

Os números são **identificadores estáveis**, não ordem. Questão nova recebe o próximo número livre, mesmo que entre numa seção anterior. Não renumerar: os números estão referenciados no board e nos outros documentos. Questão respondida fica tachada, com a resposta e a fonte, em vez de ser apagada.

> **Atualização de 17/08/2026.** Uma rodada de pesquisa em fontes públicas respondeu a questão 2 e adiantou boa parte de 1c, 3, 4 e 9. Resultado completo em [`../tecnico/fontes-normativas.md`](../tecnico/fontes-normativas.md). Antes de mandar qualquer pergunta ao cliente, leia esse documento: várias já não precisam ser feitas como estavam escritas.

---

## Placar

**16 questões abertas, 1 fechada.** Delas, **11 dependem do cliente**. As outras 5 o time pode fechar sozinho, hoje.

| Estado | Questões | Total |
| :--------------------------------- | :---------------------- | :---: |
| **Fechada**                        | 2                       | 1 |
| **Dependem do cliente**            | 1, 3, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18 | 11 |
| **Dependem só do time**            | 4, 5, 6, 7, 8           | 5 |

Desdobradas, as do cliente viram **15 itens** de pauta. Ver [Perguntas para enviar ao cliente](#perguntas-para-enviar-ao-cliente).

Mais importantes, nesta ordem: **10** (se os erros forem de dado de entrada e não de regra, a tese do produto muda), **1** (define para quem construímos) e **9** (define se construímos produto ou extensão).

> A pauta completa, agrupada pelas sete etapas do ciclo e pronta para conduzir a reunião, está no artefato **Ciclo do Projeto Elétrico**. Este documento é o registro; o artefato é a ferramenta de reunião.

---

## Bloqueiam a construção

| #     | Questão                                                                                          | Por que bloqueia                                                                                                                                                                                                       | Onde resolver         |
| :---- | :----------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------- |
| **1** | **Quem usa o MVP e como trabalha hoje** — ver o desdobramento abaixo                             | Os documentos dizem "os dois". São produtos diferentes: entrada, saída, autenticação e fluxo mudam conforme a resposta. Ver [`mapa-stakeholders.md`](mapa-stakeholders.md#quem-o-produto-atinge-diretamente).            | Cliente / orientador  |
| ~~**2**~~ | ~~**Qual documento normativo da Neoenergia PE** rege o cálculo de demanda?~~ | **RESPONDIDA em 17/08 por pesquisa pública.** É a **DIS-NOR-053 REV 06**, de 09/09/2025, com a metodologia completa no Anexo I e cinco exemplos resolvidos. Ver [`../tecnico/fontes-normativas.md`](../tecnico/fontes-normativas.md). Resta confirmar com o cliente que é a revisão em uso. | ~~Cliente~~ · resolvida |
| **3** | **Faixa de escopo do MVP** — cobre só acima de 50 kVA?                                          | [`premissas-desafio.md`](../negocio/premissas-desafio.md#tentativas-anteriores) registra que abaixo de 50 kVA o problema já foi mitigado por simplificação de critérios. Ninguém escreveu se o MVP cobre a faixa inteira. | Time + cliente        |
| **9** | **Já existe um sistema de submissão e análise?** E o que ele faz hoje?                          | Todo o raciocínio até aqui assumiu que vamos construir algo novo. Se já existe sistema, aparece uma quinta proposta — **módulo dentro do que já existe** — que pode ganhar de todas as outras. E muda a avaliação de risco que já está no board. | Cliente               |
| **10** | **Os erros são de aplicação da regra ou de dado de entrada?**                                  | **Decide se o produto funciona.** Automatizar o cálculo elimina erro de regra: método errado, faixa errada na tabela, fator incorreto, parcela esquecida. Não elimina erro de dado de entrada: se o projetista digitar 14 unidades onde há 15, a ferramenta calcula certo em cima do dado errado. Se a maioria for de entrada, a tese do produto enfraquece e o foco tem que virar validação de consistência, não cálculo. | Cliente               |

### Questões levantadas na revisão do ciclo (17/08)

Surgiram ao revisar o ciclo etapa a etapa. Todas dependem do cliente.

| #      | Questão                                                                                                   | Por que importa                                                                                     |
| :----- | :---------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| **11** | **Qual tipo de edificação concentra o problema?** Residencial, não residencial, misto ou Smart/Studio?     | A norma trata cada tipo com um método diferente. Focar em um reduz o escopo do MVP sem perder o problema. É também a base da hierarquia de classes de POO. |
| **12** | **A DIS-NOR-053 é a única norma aplicável**, ou convive com DIS-NOR-030, PRODIST e NBRs? Qual prevalece em conflito? | Se forem várias, o motor precisa saber qual regra vence, e não apenas aplicar uma tabela.            |
| **13** | **Como começa o processo, e o projetista precisa ser credenciado?** Para quem envio, com quem falo, do que preciso? Quem contrata é quem elabora? CREA e ART são verificados, ou qualquer pessoa pode enviar? | Define quem entra no sistema e se existe cadastro prévio a modelar.                                  |
| **14** | **Em que formato o projeto é enviado?** PDF, DWG, planilha, formulário? Existe formato obrigatório? A norma define o formato do memorial ou só o conteúdo? | Define se o sistema recebe dados estruturados ou precisa extrair de documento. Muda tudo na entrada. |
| **15** | **Como a devolutiva volta e como funciona o reenvio?** O projeto corrigido reinicia o processo com novo prazo de 30 dias, ou tem fila própria? O projetista acompanha o andamento? | Define se a ferramenta pode encurtar o ciclo de retrabalho ou só o de primeira submissão.            |
| **16** | **O que acontece depois dos 36 meses de validade** se a obra não terminou?                                | Pode ser um caso de uso inteiro que ninguém mapeou, e uma fonte de retrabalho invisível.             |
| **17** | **Existe acervo de projetos anteriores**, aprovados e reprovados? Um sistema novo precisaria importar?     | Muda o esforço drasticamente, e abre a possibilidade de aprender com o histórico de reprovações.     |
| **18** | **Como a equipe e os projetistas acompanham as revisões da norma?** Projeto submetido sob a revisão anterior é avaliado por qual? | Sete revisões em menos de quatro anos. Define como o sistema versiona regras e o que faz com projetos em trânsito. |

> **Hipótese de solução a validar junto:** um sistema com área **interna de revisão**, onde o analista registra a conferência e monta a devolutiva de forma estruturada, e área **externa de retorno**, onde quem submeteu vê o que foi apontado e reenvia pelo mesmo lugar. Resolveria mais do que apenas automatizar o cálculo?

### Desdobramento da questão 1

Perguntar só "qual dos dois" não dá base para desenhar nada. São três perguntas:

| Sub    | Questão                                                                                     | Por que importa                                                                                          |
| :----- | :------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------- |
| **1a** | Quem usa: projetista externo, equipe interna de análise, ou os dois com perfis distintos?    | Define o produto.                                                                                          |
| **1b** | Como é o fluxo de cada um hoje? O projetista calcula em quê e com que material? O analista recebe o quê, confere o quê, devolve como? | Sem isso não há como escrever história de usuário nem desenhar tela.                                        |
| **1c** | Pessoa de fora da Neoenergia pode acessar um sistema de vocês?                               | É a pergunta mais barata e a que mais elimina caminho: se a resposta for não, a proposta de self-service para o projetista morre antes de nascer. |

Já **quais funcionalidades cada perfil teria** não é pergunta para o cliente. É trabalho do time, e sai da Ideação e das histórias de usuário.

### Desdobramento da questão 9

A questão 4 pergunta o que o **nosso** sistema deve receber e devolver. Esta pergunta o que o sistema **atual** já faz — e as duas respostas juntas definem se construímos um produto ou uma extensão.

| Sub    | Questão                                                                                                   | O que muda conforme a resposta                                                                 |
| :----- | :--------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| **9a** | Existe hoje um sistema por onde o projeto é submetido e acompanhado? Qual?                                | Se existir, a solução pode ser um módulo dentro dele em vez de um produto novo.                 |
| **9b** | O analista apenas **visualiza** o projeto, ou o sistema entrega a ele dados, histórico, indicadores e uma metodologia de conferência? | Define o quanto da análise já é apoiada e o quanto ainda é memória e planilha do analista.       |
| **9c** | A revisão acontece **dentro** do sistema ou fora dele, em planilha, papel ou e-mail?                       | Se acontece fora, o ponto de entrada da nossa ferramenta é óbvio. Se acontece dentro, é integração. |
| **9d** | Reprovação e re-submissão já são um fluxo do sistema, ou são manuais?                                     | Determina se o ciclo de retrabalho já é rastreado, e se dá para medir melhora. Liga direto na questão 5. |

> **Consequência imediata:** o board marcou "plataforma dos dois lados" como quase inviável por depender do TI da Neoenergia. Se a resposta de 9a for que já existe um sistema extensível, esse risco cai muito e a proposta volta para a mesa.

---

## Precisam ser definidas na Ideação

| #     | Questão                                                                                                    | Impacto                                                                                                                                                                     | Prazo                 |
| :---- | :--------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------- |
| **4** | **Entrada e saída concretas** — quais parâmetros entram; a saída é um número, uma memória de cálculo, um PDF submetível? | O [`benchmarking`](../negocio/benchmarking.md#02--comparativo-por-critério) posiciona a solução com ✅ em "mostra memória de cálculo" e "aponta onde está o erro"; nenhum documento define o formato. | Ideação (15–22/08)    |
| **5** | **Métrica de sucesso**                                                                                     | "Reduzir reprovação" não tem meta numérica nem forma de medir dentro de um MVP acadêmico.                                                                                    | Ideação               |
| **6** | **Stack de front-end** — Thymeleaf (servidor) ou front separado + API REST                                 | [`app/front/README.md`](../../app/front/README.md) segue "a definir"; a escolha afeta a arquitetura de camadas do back-end.                                                  | Time (Tech Lead)      |

> As questões **5** e **6** não dependem de ninguém de fora — podem ser fechadas pelo time a qualquer momento, independentemente das respostas do cliente.

---

## Decisões internas antes da sessão

| #     | Questão                                                                    | Por que importa                                                                                                                            |
| :---- | :-------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| **7** | **Formato, facilitador e duração** do brainstorming                        | O entregável exige o registro da atividade no board, não só do resultado.                                                                   |
| **8** | **A restrição POO entra como filtro antes ou depois** da rodada divergente? | Enunciada antes, evita gastar a sessão em ideias sem persistência que não poderiam ser escolhidas. Aplicada depois, preserva a divergência. |

> Duas questões que existiam aqui foram **removidas**: critério de decisão ponderado e escala de risco. Com quatro propostas, matriz ponderada e mapa de calor de risco custam mais do que informam. O comparativo do board é uma tabela só e a decisão sai da conversa. Ver [`ideacao.md`](ideacao.md#como-comparar-as-propostas).

---

## Perguntas para enviar ao cliente

A pauta completa, agrupada pelas sete etapas do ciclo e formatada para conduzir a reunião, vive no artefato **Ciclo do Projeto Elétrico**. São 15 itens. Resumo da ordem:

| Etapa do ciclo | Questões |
| :------------------------------ | :------------------------ |
| 01 e 02 · antes do projeto      | 13, 1a                    |
| 03 · o cálculo                  | 11, 12, 3                 |
| 04 · a submissão                | 14, 1c, 9, 17             |
| 05 · a análise                  | 1b                        |
| 06 · a decisão                  | 10                        |
| 07 · o retorno                  | 15, 16                    |
| sobre a norma                   | 18, 4                     |

Chegar com a norma já identificada muda o tom da reunião: sai de "nos expliquem o problema" e entra em "validem nosso entendimento".

> Se não houver resposta até o fim da janela de 22/08, a atividade 3 deve ser fechada com decisão **condicionada** e premissa explícita ("solução X, assumindo usuário = projetista externo"), registrada em [`ideacao.md`](ideacao.md#3--proposta-de-solução-final). Travar a etapa custa mais que assumir e revisar.

---

## Descompasso entre os dois cronogramas

A **Entrega 01 de POO é 31/08/2026** e exige 7 histórias de usuário em BDD mais protótipo de baixa fidelidade ([`../cronograma-poo.md`](../cronograma-poo.md#entrega-01--31082026)).

O **cronograma de Projetos 3** só prevê histórias de usuário e protótipos terminando em **12/09/2026** ([`../cronograma-projetos3.md`](../cronograma-projetos3.md)).

São quase duas semanas de diferença entre o prazo da disciplina e o planejamento do time. Decisão do time e do orientador.
