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

A área `/api/admin/**` (tabelas normativas) e a fila `/api/review-queue/**` exigem o papel `admin`. O papel `admin` representa o analista na fila técnica.

---

## Fila de análise

### Listagem

`GET /api/review-queue` devolve somente projetos `UNDER_REVIEW`. O prazo é de 30 dias corridos após o envio e pode ser ordenado de forma crescente ou decrescente. Em caso de empate, o menor ID vem primeiro para manter a paginação estável.

| Parâmetro | Padrão | Descrição |
| :--- | :--- | :--- |
| `page` | `1` | Página iniciada em 1 |
| `pageSize` | `20` | Quantidade de registros, de 1 a 100 |
| `search` | vazio | Busca sem diferenciar maiúsculas ou acentos no protocolo, projetista ou município |
| `filter` | `ALL` | Recorte mutuamente exclusivo: `ALL`, `DUE_SOON`, `HIGH_DEMAND` ou `REANALYSIS` |
| `sort` | `DEADLINE_ASC` | Ordem do prazo: `DEADLINE_ASC` ou `DEADLINE_DESC` |

Critérios dos filtros:

- `DUE_SOON`: prazo vence hoje ou já está atrasado.
- `HIGH_DEMAND`: o último cálculo do projeto tem demanda estritamente maior que `50 kVA`; projetos sem cálculo não entram.
- `REANALYSIS`: o projeto tem dois ou mais envios para análise. Cada envio incrementa o ciclo; um projeto rejeitado pode ser corrigido e enviado novamente.

Critérios da ordenação:

- `DEADLINE_ASC`: projetos com o prazo mais próximo ou mais atrasado aparecem primeiro.
- `DEADLINE_DESC`: projetos com o prazo mais distante aparecem primeiro.
- Projetos com o mesmo prazo são sempre ordenados pelo ID crescente.
- A pesquisa e o filtro são aplicados antes da ordenação; a paginação é aplicada por último.

Exemplo:

```http
GET /api/review-queue?page=1&pageSize=10&search=jaboatao&filter=DUE_SOON&sort=DEADLINE_ASC
Authorization: Bearer <token-admin>
```

Para inverter a ordem do prazo:

```http
GET /api/review-queue?sort=DEADLINE_DESC
Authorization: Bearer <token-admin>
```

Resposta resumida:

```json
{
  "data": [
    {
      "id": "42",
      "name": "Condomínio Vila Nova",
      "protocol": "2026-0475",
      "municipality": "Jaboatão dos Guararapes",
      "submittedAt": "2026-09-08T12:00:00Z",
      "deadline": "2026-10-08",
      "deadlineStatus": "DUE_TODAY",
      "daysRemaining": 0,
      "warnings": 1,
      "applicantName": "João Projetista",
      "consumerUnitsCount": 48,
      "demandKva": 229.4,
      "reanalysis": true
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

`deadlineStatus` assume `ON_TIME`, `DUE_TODAY` ou `OVERDUE`. `demandKva` é `null` quando ainda não existe cálculo.

### Indicadores

`GET /api/review-queue/indicators` devolve os contadores globais, sem depender da busca, do filtro ou da página:

```json
{
  "data": {
    "total": 18,
    "dueSoon": 3,
    "highDemand": 11,
    "reanalysis": 5,
    "reviewedToday": 7,
    "monthlyRejectionPercent": 21.0
  }
}
```

O percentual mensal é a quantidade de projetos rejeitados dividida pelo total analisado desde o início do mês, arredondada para uma casa decimal. Um mês sem análises retorna `0`.

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
