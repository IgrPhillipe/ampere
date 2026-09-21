# Back-end

> API + motor de cálculo de demanda elétrica em Java com Spring Boot.

**Stack:** Java 21 · Spring Boot 4.1 · Spring Data JPA · PostgreSQL 16 · Maven · springdoc · Spotless

---

## Propósito

- Expor endpoints HTTP para receber parâmetros de projetos elétricos e retornar o cálculo de demanda
- Encapsular as regras normativas da Neoenergia Pernambuco em classes de domínio
- Garantir rastreabilidade: cada resultado deve indicar quais regras foram aplicadas

---

## Requisitos técnicos (disciplina POO)

- Mínimo **3 classes de domínio** (entidades persistidas no banco)
- Todas as histórias devem **LER e/ou ESCREVER** no banco de dados
- Princípios OOP aplicados: encapsulamento, herança, polimorfismo
- Geração automática de boilerplate (ex.: Lombok) **não é permitida**

---

## Como executar

Requisitos: **JDK 21** e **Docker**.

### Tudo em container

```bash
cp .env.example .env
docker compose up
```

Não exige JDK instalada na máquina.

### Ciclo rápido de edição

```bash
cp .env.example .env
docker compose up -d db
./mvnw spring-boot:run
```

Só o banco em container. A aplicação roda pela IDE ou pelo wrapper.

A API sobe em `http://localhost:8080/api` e a documentação em `http://localhost:8080/api/docs`.

> **JDK 21 pelo Homebrew é *keg-only*** e não entra no PATH sozinho. Ou exporte
> `JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home`,
> ou registre a JDK no sistema com o `sudo ln -sfn ...` que o `brew install openjdk@21` sugere
> ao final; `/usr/libexec/java_home -v 21` passa a encontrá-la.

---

## Comandos

| Comando | O que faz |
| :--- | :--- |
| `docker compose up` | banco e API em container |
| `docker compose up -d db` | só o banco |
| `./mvnw spring-boot:run` | roda a aplicação localmente |
| `./mvnw spotless:apply` | formata o código — **rode antes do PR** |
| `./mvnw clean verify` | compila, checa formatação e roda os testes |
| `docker compose down -v` | derruba tudo e **apaga o volume do banco** |

`./mvnw clean verify` precisa do PostgreSQL no ar: o teste `contextLoads` sobe o contexto inteiro do Spring, incluindo a conexão.

---

## Entrar

`/api/projects` exige token. O `DataSeeder` cria dois usuários de desenvolvimento
na primeira subida com o banco vazio:

| E-mail | Senha | Papel |
| :--- | :--- | :--- |
| `user@ampere.local` | `senha@123` | `user` |
| `admin@ampere.local` | `senha@123` | `admin` |

São os mesmos do mock do MSW no front. Nenhum papel restringe rota; ver a Q1c em
[`docs/produto/questoes-em-aberto.md`](../../docs/produto/questoes-em-aberto.md).

```bash
curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@ampere.local","password":"senha@123"}'
```

| Variável | Para quê |
| :--- | :--- |
| `JWT_SECRET` | assina o token, mínimo 32 caracteres. **Obrigatória em produção** — sem ela o profile `prod` não sobe. Fora de produção, sem ela a API gera uma chave por execução e o login cai a cada reinício |
| `JWT_EXPIRATION` | validade do token; padrão `8h` |
| `DDL_AUTO` | **alavanca de recuperação, não configuração normal.** `create` apaga o schema e recria pelas entidades, e o `DataSeeder` repovoa. Use uma vez e **remova a variável** — enquanto ela estiver definida, todo restart apaga os dados |
| `CORS_ALLOWED_ORIGINS` | origens que podem chamar a API de outro domínio, separadas por vírgula. Vazio = só mesma origem. Aceita padrão: `https://ampere-igrph.vercel.app,https://*-igrph.vercel.app` |

Gerando uma:

```bash
openssl rand -base64 48
```

> **Front em outro domínio precisa de `CORS_ALLOWED_ORIGINS`.** Sem isso o navegador
> recusa a resposta, e com o Spring Security no caminho o preflight `OPTIONS` volta
> 401 antes de chegar em qualquer controller. Não vale para o front saindo por um
> proxy do próprio deploy: nesse caso a origem é a mesma e a variável não se aplica.

### Schema desatualizado

Sem Flyway, o `ddl-auto=update` **não altera tipo de coluna** e **não acrescenta
coluna `NOT NULL` a tabela que já tem linhas**. Nos dois casos registra um `WARN`
no boot e sobe com o schema incompleto. A API responde `500` na primeira consulta
que toca a coluna:

```
GenerationTarget encountered exception accepting command :
  Error executing DDL "add column created_at ... not null"
  [ERROR: column "created_at" of relation "project" contains null values]
...
ERROR: column p1_0.created_at does not exist
```

Com acesso ao banco, recrie o volume:

```bash
docker compose down -v
```

O `DataSeeder` repovoa na subida seguinte. O `-v` apaga também o banco de testes,
que mora no mesmo container; recrie-o antes de `./mvnw clean verify`:

```bash
docker exec ampere-db-1 psql -U ampere -d ampere -c "CREATE DATABASE ampere_test OWNER ampere;"
```

Sem acesso ao banco, caso de um deploy gerenciado:

1. defina `DDL_AUTO=create` no ambiente e reinicie
2. o schema é recriado do zero e o `DataSeeder` repovoa, usuários inclusive
3. **remova a variável** e reinicie de novo

O passo 3 é obrigatório: com `DDL_AUTO=create` definido, todo restart apaga os
dados, e um serviço que hiberna reinicia sozinho.

Ver a pendência 23 em [`docs/pendencias.md`](../../docs/pendencias.md).

---

## Variáveis de ambiente

| Variável | Obrigatória | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Sim | `jdbc:postgresql://localhost:5432/ampere` | Conexão com o PostgreSQL |
| `DATABASE_USER` | Sim | `ampere` | Usuário do banco |
| `DATABASE_PASSWORD` | Sim | `ampere` | Senha do banco |
| `SERVER_PORT` | Não | `8080` | Porta da API |

> `DATABASE_URL` é uma **URL JDBC** e precisa do prefixo `jdbc:`. O Spring não aceita
> o formato `postgresql://usuario:senha@host/banco`, e usuário e senha vão em
> variáveis separadas.

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

## Estado atual

CRUD completo de projetos, com atribuição automática das normas aplicáveis a partir do tipo de edificação. Autenticação por JWT: `/api/projects` exige token, e nenhum papel restringe rota enquanto a Q1c em [`docs/produto/questoes-em-aberto.md`](../../docs/produto/questoes-em-aberto.md) estiver aberta. **Sem migrations versionadas**: o Hibernate cria o schema a partir das entidades, e schema desatualizado se resolve pelo procedimento acima. Pendências em [`docs/pendencias.md`](../../docs/pendencias.md).

---

## Documentação

| Documento | Conteúdo |
| :--- | :--- |
| [Convenções](../../docs/tecnico/convencoes-back.md) | nomenclatura, pacotes, o que cada camada pode importar, Lombok |

Documentação técnica: [`docs/tecnico/README.md`](../../docs/tecnico/README.md)
README central: [`README.md`](../../README.md)
