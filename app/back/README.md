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
| `./mvnw clean verify` | compila, checa a formatação e roda os testes; exige o PostgreSQL no ar |
| `docker compose down -v` | derruba tudo e **apaga o volume do banco** |

---

## Autenticação

`/api/projects` exige token. A cada inicialização, o `DataSeeder` cria os três usuários de desenvolvimento que ainda não existem (a checagem é por e-mail):

| E-mail | Senha | Papel |
| :--- | :--- | :--- |
| `user@ampere.com` | `senha@123` | `user` |
| `admin@ampere.com` | `senha@123` | `admin` |
| `revisor@ampere.com` | `senha@123` | `admin` |

O revisor existe para a dupla leitura das tabelas normativas: quem cadastra uma tabela não a publica.

```bash
curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@ampere.com","password":"senha@123"}'
```

As tabelas normativas (`/api/normative-tables/**`) e a fila (`/api/review-queue/**`) exigem o papel `admin`. Os caminhos nomeiam o recurso, nunca o papel: a restrição fica no `SecurityConfig`. O papel `admin` representa o analista na fila técnica.

Cada projeto pertence a quem o criou. O projetista vê só os próprios projetos; o analista lê os enviados para análise e não altera nenhum. Os projetos do seed pertencem a `user@ampere.com`. Detalhes em [`convencoes-back.md`](../../docs/tecnico/convencoes-back.md#dono-do-projeto).

---

## Fila de Análise

`GET /api/review-queue` lista os projetos `UNDER_REVIEW`, com prazo de 30 dias corridos a partir do envio. O contrato completo está no Swagger; os critérios que ele não explica:

| Parâmetro | Padrão | Valores |
| :--- | :--- | :--- |
| `search` | vazio | protocolo, projetista ou município, sem diferenciar maiúsculas ou acentos |
| `filter` | `ALL` | `DUE_SOON` (vence hoje ou atrasado), `HIGH_DEMAND` (último cálculo acima de 50 kVA), `REANALYSIS` (dois ou mais envios) |
| `sort` | `ASC` | `ASC` (prazo mais próximo primeiro) ou `DESC`; o empate é desfeito pelo ID crescente |

Busca, filtro e ordenação valem antes da paginação. `GET /api/review-queue/indicators` devolve os contadores globais, que não dependem desses parâmetros.

---

## Análise Técnica e Apontamentos

As rotas abaixo exigem autenticação. O papel `admin` representa o analista. Um projeto
`UNDER_REVIEW` é assumido por um único analista; repetir a atribuição pelo mesmo analista é
idempotente e a tentativa de outro analista devolve `409 Conflict`.

| Método e caminho | Quem usa | Regra principal |
| :--- | :--- | :--- |
| `POST /api/projects/{id}/review` | Analista | Assume a análise; não há redistribuição automática |
| `GET /api/projects/{id}/findings` | Dono ou analista | Lista os apontamentos na ordem de criação |
| `POST /api/projects/{id}/findings` | Analista atribuído | Cria um apontamento `DRAFT` na versão corrente |
| `PUT /api/projects/{id}/findings/{findingId}` | Analista atribuído | Altera somente apontamento `DRAFT` |
| `DELETE /api/projects/{id}/findings/{findingId}` | Analista atribuído | Exclui somente apontamento `DRAFT` |
| `POST /api/projects/{id}/decision` | Analista atribuído | Aprova ou reprova e publica os rascunhos como `OPEN` |
| `POST /api/projects/{id}/findings/{findingId}/resolution` | Analista atribuído | Na reanálise, aceita ou reabre apontamento de ciclo anterior |
| `GET /api/projects/{id}/documents/{documentId}/file` | Dono ou analista atribuído | Devolve o arquivo com `Content-Type: application/pdf` |

### Contrato do apontamento

Criação e edição recebem:

```json
{
  "severity": "BLOCKING",
  "stage": "DOCUMENTS",
  "consumerUnitGroupId": null,
  "calculationStepCode": null,
  "documentType": "SITE_PLAN",
  "description": "Anexar a comprovação do sistema de recarga.",
  "standardItem": "NDU 001 item 6.6"
}
```

- `severity`: `BLOCKING` ou `ADJUSTMENT`.
- `stage`: `PROJECT_DATA`, `CONSUMER_UNITS`, `CALCULATION` ou `DOCUMENTS`.
- As referências a grupo, etapa do cálculo e tipo de documento são opcionais.
- `description` é obrigatória; `standardItem` é opcional.
- A resposta acrescenta autor, data, versão do ciclo e `status`.
- Estados possíveis: `DRAFT`, `OPEN`, `FIXED`, `CONTESTED` e `RESOLVED`.

### Decisão e reanálise

`POST /decision` recebe um parecer obrigatório de até 2.000 caracteres:

```json
{
  "decision": "REJECT",
  "opinion": "Corrigir os itens apontados antes do reenvio."
}
```

- `APPROVE` devolve `422 Unprocessable Entity` se existir apontamento `BLOCKING` não resolvido.
- `REJECT` devolve `422 Unprocessable Entity` se não existir apontamento na versão corrente.
- A decisão grava `reviewedAt` no projeto e transforma seus apontamentos `DRAFT` em `OPEN`.
- Na reanálise, `/resolution` recebe `{"resolution":"ACCEPT"}` para marcar `RESOLVED`,
  ou `{"resolution":"REOPEN"}` para voltar a `OPEN`. Apenas apontamentos de ciclos anteriores
  podem ser resolvidos por essa rota.

Erros de recurso ou acesso por proprietário incorreto usam `404`; papel ou analista incorreto usa
`403`; conflito de atribuição/estado usa `409`; regra de decisão inválida usa `422`.

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

A fatia `projects` cobre as quatro camadas: domínio, persistência, serviço e controller.

São **cinco** classes de domínio persistidas, acima do mínimo de três da disciplina: `Project`, `BuildingType` (abstrata, com `ResidentialMultifamily`, `NonResidential` e `Mixed`), `Standard`, `Finding` e `User`. Cada subclasse sobrescreve `BuildingType.demandRules()`, que define a norma aplicável de cada projeto.

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
