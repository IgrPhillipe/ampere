# Back-end

> API + motor de cálculo de demanda elétrica em Java com Spring Boot.

**Stack:** Java 21 · Spring Boot 4.1 · Spring Data JPA · PostgreSQL 16 · Maven · springdoc · Spotless

---

## Propósito

- Expor endpoints HTTP para receber parâmetros de projetos elétricos e retornar o cálculo de demanda
- Encapsular as regras normativas da Neoenergia Pernambuco em classes de domínio
- Garantir rastreabilidade: cada resultado indica quais regras foram aplicadas

---

## Requisitos técnicos (disciplina POO)

- Mínimo **3 classes de domínio** (entidades persistidas no banco)
- Todas as histórias devem **LER e/ou ESCREVER** no banco de dados
- Princípios OOP aplicados: encapsulamento, herança, polimorfismo
- Geração automática de boilerplate (ex.: Lombok) **não é permitida**

---

## Como executar

Requisitos: **JDK 21** e **Docker**.

Tudo em container:

```bash
cp .env.example .env
docker compose up
```

Só o banco em container, com a aplicação pela IDE ou pelo wrapper:

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
| `docker compose up -d db` | só o banco |
| `./mvnw spring-boot:run` | roda a aplicação localmente |
| `./mvnw spotless:apply` | formata o código — **rode antes do PR** |
| `./mvnw clean verify` | compila, checa formatação e roda os testes; exige o PostgreSQL no ar |
| `docker compose down -v` | derruba tudo e **apaga o volume do banco** |

---

## Autenticação

`/api/projects` exige token. O `DataSeeder` cria três usuários de desenvolvimento, conferindo um por e-mail a cada subida:

| E-mail | Senha | Papel |
| :--- | :--- | :--- |
| `user@ampere.local` | `senha@123` | `user` |
| `admin@ampere.local` | `senha@123` | `admin` |
| `revisor@ampere.local` | `senha@123` | `admin` |

O revisor existe para a dupla leitura das tabelas normativas: quem cadastra uma tabela não a publica.

```bash
curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@ampere.local","password":"senha@123"}'
```

Só a área `/api/admin/**` (tabelas normativas) exige o papel `admin`. As demais rotas não olham papel enquanto a Q1c em [`docs/produto/questoes-em-aberto.md`](../../docs/produto/questoes-em-aberto.md) estiver aberta.

---

## Variáveis de ambiente

| Variável | Obrigatória | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Sim | `jdbc:postgresql://localhost:5432/ampere` | URL JDBC, com o prefixo `jdbc:`; usuário e senha vão em variáveis separadas |
| `DATABASE_USER` | Sim | `ampere` | Usuário do banco |
| `DATABASE_PASSWORD` | Sim | `ampere` | Senha do banco |
| `SERVER_PORT` | Não | `8080` | Porta da API |
| `JWT_SECRET` | Em produção | — | Assina o token, mínimo 32 caracteres. Sem ela o profile `prod` não sobe; fora de produção a API gera uma chave por execução |
| `JWT_EXPIRATION` | Não | `8h` | Validade do token |
| `CORS_ALLOWED_ORIGINS` | Não | vazio | Origens externas que podem chamar a API, separadas por vírgula. Aceita padrão: `https://ampere-virid.vercel.app,https://*-igrph.vercel.app`. Vazio = só mesma origem |
| `DDL_AUTO` | Não | `update` | Alavanca de recuperação de schema. `create` apaga e recria o schema a cada subida — use uma vez e **remova a variável** |

Gerar um segredo:

```bash
openssl rand -base64 48
```

---

## Estrutura de camadas

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

As classes de domínio persistidas são **cinco**, acima do mínimo de três da disciplina: `Project`, `BuildingType` (abstrata, com `ResidentialMultifamily`, `NonResidential` e `Mixed`), `Standard`, `Finding` e `User`. `BuildingType.demandRules()` é sobrescrito por subclasse, e dele deriva a norma aplicável de cada projeto.

---

## Limitações

- Sem migrations versionadas: o Hibernate cria o schema a partir das entidades. Schema defasado e como recuperá-lo estão em [Quando travar](../../docs/tecnico/convencoes-back.md#quando-travar)
- Nenhum papel de usuário restringe rota, pendente da Q1c

---

## Documentação

| Documento | Conteúdo |
| :--- | :--- |
| [Convenções](../../docs/tecnico/convencoes-back.md) | nomenclatura, pacotes, o que cada camada pode importar, Lombok, diagnóstico |

Documentação técnica: [`docs/tecnico/README.md`](../../docs/tecnico/README.md)
README central: [`README.md`](../../README.md)
