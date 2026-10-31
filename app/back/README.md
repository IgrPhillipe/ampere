# Back-end

> API e motor de cálculo de demanda elétrica em Java com Spring Boot.

**Stack:** Java 21, Spring Boot 4.1, Spring Data JPA, PostgreSQL 16, Maven, springdoc, Spotless

---

## Propósito

- Expor endpoints HTTP que recebem os parâmetros de projetos elétricos e retornam o cálculo de demanda
- Encapsular as regras normativas da Neoenergia Pernambuco em classes de domínio
- Garantir rastreabilidade: cada resultado indica quais regras foram aplicadas

---

## Requisitos Técnicos (Disciplina POO)

- Mínimo de **3 classes de domínio** (entidades persistidas no banco)
- Todas as histórias leem e/ou escrevem no banco de dados
- Princípios OOP aplicados: encapsulamento, herança, polimorfismo
- Geração automática de boilerplate (ex.: Lombok) **não é permitida**

---

## Como Executar

Requisitos: **JDK 21** e **Docker**.

Tudo em container:

```bash
cp .env.example .env
docker compose up
```

Apenas o banco em container, com a aplicação pela IDE ou pelo wrapper:

```bash
cp .env.example .env
docker compose up -d db
./mvnw spring-boot:run
```

API em `http://localhost:8080/api`, documentação em `http://localhost:8080/api/docs`.

---

## Comandos

| Comando | O que faz |
| :--- | :--- |
| `docker compose up` | banco e API em container |
| `docker compose up -d db` | apenas o banco |
| `./mvnw spring-boot:run` | roda a aplicação localmente |
| `./mvnw spotless:apply` | formata o código; obrigatório antes do PR |
| `./mvnw clean verify` | compila, checa a formatação e roda os testes; exige o PostgreSQL no ar com o banco `ampere_test` |
| `docker compose down -v` | derruba tudo e **apaga o volume do banco** |

---

## Autenticação

`/api/projects` exige token. A cada inicialização fora dos profiles `prod` e `test`, ou com o profile `demo`, o `DataSeeder` cria os usuários de desenvolvimento que ainda não existem (a checagem é por e-mail). Todos têm a senha `senha@123`:

| E-mail | Papel | Observação |
| :--- | :--- | :--- |
| `user@ampere.com` | `user` | CREA 123456/PE |
| `projetista@ampere.com` | `user` | Carla Projetista, CREA 654321/PE |
| `joao@ampere.com` | `user` | João Batista, CREA 223344/PB, projetos em Pedras de Fogo |
| `novo@ampere.com` | `user` | Diego Novato, senha temporária: troca no primeiro login |
| `inativo@ampere.com` | `user` | Conta desativada |
| `admin@ampere.com` | `admin` | |
| `conferente@ampere.com` | `admin` | Publica as tabelas que o admin cadastra |
| `revisor@ampere.com` | `reviewer` | |
| `analista@ampere.com` | `reviewer` | Ana Analista |

O `DemoScenarioSeeder` cria, por protocolo, os projetos de cada caso do sistema: rascunhos, análise, reprovações, aprovações e revisões de tabela normativa. Cada cenário só entra se o protocolo estiver livre, com datas coerentes e prazos relativos ao momento do seed. Projeto do seed criado antes do histórico do protocolo ganha os eventos da própria história na próxima subida, sem reset. `ampere.seed.reset-scenarios=true` (ou `SEED_RESET_SCENARIOS=true`) apaga e recria só os projetos do seed, com datas novas. Os cenários estão em [`docs/produto/dados-de-demonstracao.md`](../../docs/produto/dados-de-demonstracao.md). Em produção, `SPRING_PROFILES_ACTIVE=prod,demo` liga os dois seeds e mantém o `JWT_SECRET` obrigatório; nesse caso o seed nunca altera um projeto que não criou.

O conferente existe para a dupla leitura das tabelas normativas: quem cadastra uma tabela não a publica. O revisor é o analista; num banco antigo, em que ele era `admin`, o `DataSeeder` o passa para `reviewer`.

```bash
curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@ampere.com","password":"senha@123"}'
```

As tabelas normativas (`/api/normative-tables/**`) e a gestão de usuários (`/api/users/**`, exceto `/api/users/me`) exigem o papel `admin`; a fila (`/api/review-queue/**`) aceita `reviewer` e `admin`. Os caminhos nomeiam o recurso, nunca o papel: a restrição fica no `SecurityConfig`.

### Cadastro e Perfil

| Método e caminho | O que faz |
| :--- | :--- |
| `POST /api/auth/register` | Cria a conta de projetista, aberto, e já devolve o token como o login |
| `GET /api/users/me` | Perfil da sessão com os dados profissionais |
| `PUT /api/users/me` | Atualiza nome, CREA, UF, empresa e telefone; o e-mail não muda |
| `PUT /api/users/me/password` | Troca a senha informando a atual |

- O cadastro sempre cria o papel `user`; analistas são criados pelo administrador.
- E-mail único sem diferença de maiúsculas: repetido responde 409. A senha tem ao menos 8 caracteres, com letra e número.
- O CREA é só o número, e a UF vai no campo próprio. É obrigatório para o projetista e opcional para o analista.
- O nome e o CREA do dono saem em `technicalResponsible` no detalhe do projeto e no memorial em PDF.

Cada projeto pertence a quem o criou. O projetista vê só os próprios projetos; o analista lê os enviados para análise e não altera nenhum. Os projetos do seed pertencem a `user@ampere.com`, `projetista@ampere.com`, `joao@ampere.com`, `inativo@ampere.com` e `admin@ampere.com`. Detalhes em [`convencoes-back.md`](../../docs/tecnico/convencoes-back.md#dono-do-projeto).

### Gestão de Usuários

Restrita ao papel `admin` pelo `SecurityConfig`, sem prefixo de papel no caminho. `/api/users/me` continua aberto a todos os papéis.

| Método e caminho | O que faz |
| :--- | :--- |
| `GET /api/users` | Lista em ordem de nome, paginada; `search` busca no nome e no e-mail sem acentos, `role` filtra por `user`, `reviewer` ou `admin` |
| `POST /api/users` | Cria a conta com nome, e-mail e papel; devolve a senha temporária |
| `PUT /api/users/{id}` | Substitui nome, papel e situação (`active`), os três obrigatórios; é por aqui que se desativa e reativa. O e-mail não muda |
| `POST /api/users/{id}/password-reset` | Gera uma nova senha temporária |

- A senha temporária só sai em `data.temporaryPassword`, na resposta da criação e da redefinição. Não há e-mail: o administrador a repassa.
- Com senha temporária, `mustChangePassword` vem `true` no login e em `/api/auth/me`, até a troca em `PUT /api/users/me/password`. O back não bloqueia as outras rotas enquanto isso: levar à troca é papel do front.
- Conta inativa recebe 403 no login, com *"Conta desativada. Procure a Neoenergia."*, mas só se a senha estiver certa. O token já emitido passa a responder 401 com a mesma mensagem: o filtro do JWT relê a situação e o papel da conta a cada requisição. Papel alterado e conta inexistente também derrubam o token, com a mensagem de sessão expirada.
- A redefinição de senha não derruba o token já aberto. Para cortar o acesso na hora, desative a conta.
- O administrador não desativa a própria conta nem remove o próprio papel `admin` (400).
- Erros: 400 para dados ou filtro inválidos, 404 para usuário inexistente, 409 para e-mail já cadastrado.

---

## Fila de Análise

`GET /api/review-queue` lista os projetos `UNDER_REVIEW`, com prazo de 30 dias corridos a partir do envio. O contrato completo está no Swagger; os critérios que ele não explica:

| Parâmetro | Padrão | Valores |
| :--- | :--- | :--- |
| `search` | vazio | protocolo, projetista ou município, sem diferenciar maiúsculas ou acentos |
| `filter` | `ALL` | `DUE_SOON` (vence hoje ou atrasado), `HIGH_DEMAND` (último cálculo acima de 50 kVA), `REANALYSIS` (dois ou mais envios) |
| `sort` | `deadline` | `deadline` ou `submittedAt` (data de envio, que define o prazo), `demand` (último cálculo) ou `warnings` (alertas do último cálculo) |
| `direction` | `ASC` | `ASC` ou `DESC`; o empate é desfeito pelo ID crescente |
| `reviewer` | vazio | ID do analista, ou `none` para os projetos sem analista |
| `state`, `municipality` | vazio | UFs e municípios; repita o parâmetro para mais de um |

Busca, filtro e ordenação valem antes da paginação. `GET /api/review-queue/indicators` devolve os contadores globais, que não dependem desses parâmetros. `GET /api/review-queue/reviewers` lista os analistas do filtro `reviewer`.

---

## Análise Técnica e Apontamentos

O papel `reviewer` representa o analista, e o `admin` faz tudo o que ele faz. Um projeto `UNDER_REVIEW` é assumido por um único analista: repetir a atribuição não muda nada, e outro analista recebe 409. As rotas de escrita da análise são restritas a `reviewer` e `admin` pelo `SecurityConfig`.

| Método e caminho | Quem usa | Regra principal |
| :--- | :--- | :--- |
| `POST /api/projects/{id}/review` | Analista | Assume a análise |
| `GET /api/projects/{id}/findings` | Dono ou analista | Lista na ordem de criação; o dono não vê rascunhos |
| `POST /api/projects/{id}/findings` | Analista atribuído | Cria um apontamento `DRAFT` no ciclo atual |
| `PUT /api/projects/{id}/findings/{findingId}` | Analista atribuído | Altera só apontamento `DRAFT` |
| `DELETE /api/projects/{id}/findings/{findingId}` | Analista atribuído | Exclui só apontamento `DRAFT` |
| `POST /api/projects/{id}/decision` | Analista atribuído | Aprova ou reprova e publica os rascunhos como `OPEN` |
| `POST /api/projects/{id}/findings/{findingId}/resolution` | Analista atribuído | Na reanálise, aceita ou reabre apontamento de ciclo anterior |
| `GET /api/projects/{id}/documents/{documentId}/file` | Dono ou analista | Devolve o PDF; vale a mesma regra de leitura do projeto |

### Contrato do Apontamento

```json
{
  "severity": "BLOCKING",
  "stage": "DOCUMENTS",
  "consumerUnitGroupId": null,
  "calculationStepCode": null,
  "documentType": "ART",
  "description": "A ART não traz a assinatura do responsável técnico.",
  "standardItem": "DIS-NOR-053, item 6.17"
}
```

- `severity`: `BLOCKING` ou `ADJUSTMENT`. `stage`: `PROJECT_DATA`, `CONSUMER_UNITS`, `CALCULATION` ou `DOCUMENTS`.
- A referência é opcional e só vale na sua etapa: grupo em `CONSUMER_UNITS`, parcela do cálculo em `CALCULATION`, tipo de documento em `DOCUMENTS`. Referência fora da etapa responde 400.
- A resposta acrescenta autor, data, ciclo (`version`) e `status`: `DRAFT`, `OPEN`, `FIXED`, `CONTESTED` ou `RESOLVED`.

### Decisão e Reanálise

`POST /decision` recebe `{"decision": "APPROVE" | "REJECT", "opinion": "..."}`, com parecer obrigatório de até 2.000 caracteres.

- `APPROVE` responde 422 se houver apontamento `BLOCKING` não resolvido.
- `REJECT` responde 422 se não houver apontamento pendente: rascunho do ciclo atual ou apontamento reaberto.
- A decisão grava `reviewedAt` e o parecer, e publica os rascunhos como `OPEN`.
- A contagem de pendências da listagem do projetista ignora rascunhos e projetos aprovados.
- `/resolution` recebe `{"resolution": "ACCEPT"}` para `RESOLVED` ou `{"resolution": "REOPEN"}` para `OPEN`, só para apontamentos de ciclos anteriores.

Projeto de outro dono ou inexistente responde 404; papel ou analista errado, 403; atribuição ou estado em conflito, 409; regra da decisão, 422.

### Correção e Reenvio

O projeto `REJECTED` volta a ser editável pelo dono: dados, grupos, cálculo e documentos. Editar não muda a situação; o projeto segue `REJECTED` até o reenvio. Excluir continua só em `DRAFT`.

| Método e caminho | Quem usa | Regra principal |
| :--- | :--- | :--- |
| `PUT /api/projects/{id}/findings/{findingId}/response` | Dono | Marca o apontamento como `FIXED` ou `CONTESTED` |
| `GET /api/projects/{id}/submission` | Dono ou analista | Checklist com `unansweredBlocking` e `requiresChangeSummary` |
| `POST /api/projects/{id}/submission` | Dono | Envia ou reenvia; no reenvio, exige `{"changeSummary": "..."}` |

- `/response` recebe `{"status": "FIXED" | "CONTESTED", "response": "..."}`, com até 2.000 caracteres. A justificativa é obrigatória em `CONTESTED`.
- Responde-se a qualquer apontamento publicado e não aceito, inclusive o reaberto de ciclo anterior. A última resposta vale.
- `unansweredBlocking` conta os apontamentos `BLOCKING` em `OPEN`; com algum, `canSubmit` é `false` e o reenvio responde 422.
- O reenvio recalcula a demanda, grava o `changeSummary`, incrementa o `reviewCycle`, limpa o parecer e mantém o analista. O projeto entra na fila como reanálise.
- O detalhe do projeto expõe `reviewCycle` (a versão), `reviewOpinion` e `changeSummary`.

Projeto fora de `REJECTED` responde 409 no `/response`; apontamento em rascunho ou aceito, também 409.

---

## Variáveis de Ambiente

| Variável | Obrigatória | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Sim | `jdbc:postgresql://localhost:5432/ampere` | URL JDBC, com o prefixo `jdbc:`. Usuário e senha ficam em variáveis separadas |
| `DATABASE_USER` | Sim | `ampere` | Usuário do banco |
| `DATABASE_PASSWORD` | Sim | `ampere` | Senha do banco |
| `SERVER_PORT` | Não | `8080` | Porta da API |
| `JWT_SECRET` | Em produção | | Assina o token; mínimo de 32 caracteres. Sem ela o profile `prod` não sobe. Fora de produção, a API gera uma chave por execução |
| `JWT_EXPIRATION` | Não | `8h` | Validade do token |
| `CORS_ALLOWED_ORIGINS` | Não | vazio | Origens externas que podem chamar a API, separadas por vírgula. Aceita padrão: `https://ampere-virid.vercel.app,https://*-igrph.vercel.app`. Vazio: apenas a mesma origem |
| `CORS_PREVIEW_ORIGINS` | Não | `https://ampere-*-igrph.vercel.app` | Deploy previews do front na Vercel, somados a `CORS_ALLOWED_ORIGINS`. O padrão cobre `ampere-<hash>-igrph.vercel.app` e `ampere-git-<branch>-igrph.vercel.app` |
| `DDL_AUTO` | Não | `update` | Alavanca de recuperação de schema. `create` apaga e recria o schema a cada inicialização; use uma vez e **remova a variável** |

Gerar um segredo:

```bash
openssl rand -base64 48
```

---

## Estrutura de Camadas

```
src/main/java/br/com/ampere/
├── controller/   → HTTP: validação de entrada, chama services
├── service/      → regras de negócio e orquestração
├── domain/       → classes de domínio (entidades persistidas)
├── repository/   → acesso ao banco (Spring Data)
├── dto/          → entrada e saída da API
├── error/        → exceções de domínio e tradução para HTTP
└── config/       → configuração e bootstrap
```

Cada fatia (projetos, grupos, cálculo, envio, análise e tabelas normativas) cobre as quatro camadas: domínio, persistência, serviço e controller.

São **nove** classes de domínio persistidas, acima do mínimo de três da disciplina: `Project`, `BuildingType` (abstrata, com `ResidentialMultifamily`, `NonResidential` e `Mixed`), `ConsumerUnitGroup` (abstrata, com `ResidentialGroup`, `LoadGroup` e `EvChargingGroup`), `Calculation`, `NormativeTable`, `ProjectDocument`, `Standard`, `Finding` e `User`. Cada subclasse de `BuildingType` sobrescreve `demandRules()`, que define a norma aplicável de cada projeto.

---

## Limitações

- Sem migrations versionadas: o Hibernate cria o schema a partir das entidades. Schema defasado e recuperação: [Quando travar](../../docs/tecnico/convencoes-back.md#quando-travar)
- As rotas que ainda não possuem regra explícita aceitam qualquer usuário autenticado

---

## Documentação

| Documento | Conteúdo |
| :--- | :--- |
| [Convenções](../../docs/tecnico/convencoes-back.md) | nomenclatura, pacotes, o que cada camada pode importar, Lombok, diagnóstico |

Documentação técnica: [`docs/tecnico/README.md`](../../docs/tecnico/README.md)
README central: [`README.md`](../../README.md)
