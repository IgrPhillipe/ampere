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

Um comando, funciona em qualquer máquina mesmo sem JDK instalada.

### Ciclo rápido de edição

```bash
cp .env.example .env
docker compose up -d db
./mvnw spring-boot:run
```

Só o banco em container; a aplicação roda pela IDE ou pelo wrapper, com reinício rápido.

A API sobe em `http://localhost:8080/api` e a documentação em `http://localhost:8080/api/docs`.

> **JDK 21 pelo Homebrew é *keg-only*** e não entra no PATH sozinho. Ou exporte
> `JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home`,
> ou registre a JDK no sistema com o `sudo ln -sfn ...` que o `brew install openjdk@21` sugere
> ao final — aí `/usr/libexec/java_home -v 21` passa a encontrá-la.

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

São os mesmos do mock do MSW no front, para quem alterna entre mock e API real
não precisar trocar o que digita. Nenhum papel gateia rota — ver a Q1c.

```bash
curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@ampere.local","password":"senha@123"}'
```

| Variável | Para quê |
| :--- | :--- |
| `JWT_SECRET` | assina o token. **Obrigatória em produção** — o default é de desenvolvimento e está versionado, então não protege nada. Mínimo 32 caracteres (HS256) |
| `JWT_EXPIRATION` | validade do token; padrão `8h` |

> **Mudou o tipo de uma coluna?** Sem Flyway, o `ddl-auto=update` do Hibernate cria tabela e
> coluna novas, mas **não** altera o tipo de uma coluna que já existe. Quem já tinha o volume
> antes da troca de `LocalDateTime` por `OffsetDateTime` precisa de `docker compose down -v`
> antes de subir. Ver a pendência 23 em [`docs/pendencias.md`](../../docs/pendencias.md).

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

A fatia `projects` implementa o primeiro fluxo real ponta a ponta: domínio, persistência, serviço e o CRUD completo.

As classes de domínio persistidas são **quatro**, acima do mínimo de três da disciplina: `Project`, `BuildingType` (abstrata, com `ResidentialMultifamily`, `NonResidential` e `Mixed`), `Standard` e `Finding`. A herança e o polimorfismo não são decorativos — `BuildingType.demandRules()` é sobrescrito por subclasse e é dele que a norma aplicável de cada projeto é derivada.

---

## Estado atual

CRUD completo de projetos, com atribuição automática das normas aplicáveis a partir do tipo de edificação. **Sem autenticação** — os endpoints estão abertos, porque os papéis de usuário dependem da Q1c em [`docs/produto/questoes-em-aberto.md`](../../docs/produto/questoes-em-aberto.md), ainda em aberto. **Sem migrations versionadas** — o Hibernate cria o schema a partir das entidades. As duas pendências estão registradas em [`docs/pendencias.md`](../../docs/pendencias.md).

> **Ao puxar esta branch, apague o banco de desenvolvimento uma vez.** O `project` ganhou colunas `NOT NULL`, e o PostgreSQL recusa adicioná-las a uma tabela populada — o `ddl-auto=update` loga a falha e sobe mesmo assim, contra um schema incompleto. `docker compose down -v` e o `DataSeeder` repovoa tudo.
>
> O `-v` leva junto o banco de testes, que mora no mesmo container. Recrie antes de rodar o `verify`:
>
> ```bash
> docker exec ampere-db-1 psql -U ampere -d ampere -c "CREATE DATABASE ampere_test OWNER ampere;"
> ```

---

## Documentação

| Documento | Conteúdo |
| :--- | :--- |
| [Convenções](../../docs/tecnico/convencoes-back.md) | nomenclatura, pacotes, o que cada camada pode importar, Lombok |

Documentação técnica: [`docs/tecnico/README.md`](../../docs/tecnico/README.md)
README central: [`README.md`](../../README.md)
