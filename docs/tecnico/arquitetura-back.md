# Arquitetura do back-end

Como o `app/back` está organizado e por quê.

---

## Camadas

```
┌─────────────────────────────────┐
│          controller/            │  HTTP: valida entrada, chama service, embrulha saída
├─────────────────────────────────┤
│           service/              │  regra de negócio e orquestração
├─────────────────────────────────┤
│          repository/            │  acesso ao banco (Spring Data)
├─────────────────────────────────┤
│           domain/               │  entidades persistidas
└─────────────────────────────────┘
      dto/ · error/ · config/        entrada e saída · tradução de erro · bootstrap
```

**Fluxo:** controller → service → repository → domain. Camada de cima chama a de baixo, nunca o contrário.

A fatia `example` existe para demonstrar isso ponta a ponta e **deve ser apagada** quando as classes de domínio do AMPERE entrarem. Ela implementa o contrato que o front já declara em `app/front/src/services/example`, e não um CRUD inventado — assim a integração é verificável em vez de suposta.

As regras de importação entre camadas estão em [`convencoes-back.md`](convencoes-back.md).

---

## O caminho de uma requisição

`GET /api/example/1`:

1. O `context-path=/api` tira o prefixo; o `ExampleController` está mapeado em `/example`.
2. `detail(1L)` chama `service.findById(1L)`.
3. O service pede ao repository. Não achou, lança `NotFoundException("Registro não encontrado.")`.
4. O `GlobalExceptionHandler` transforma em `ProblemDetail` com status 404 e o `detail` em português.
5. Se achou, o controller converte a entidade em `ExampleResponse` e embrulha em `ApiResponse`.

O passo 3 é o que separa as camadas: o service não sabe que 404 existe. Ele descreve o que aconteceu no vocabulário do domínio, e a tradução para HTTP mora num lugar só.

---

## Contrato com o front-end

Não foi escolhido aqui — o front já o declara, e o back precisa cumprir:

| O quê | Onde está definido no front |
| :--- | :--- |
| Envelope `{ data, pagination? }` | `src/features/shared/types/index.ts` |
| Formato de erro `ProblemDetail` | `src/lib/api-error.ts` |
| Caminhos e shapes de `example` | `src/services/example/` |
| Prefixo `/api` e porta 8080 | `vite.config.ts` |

Três detalhes que quebram silenciosamente se errados:

- **`id` é string.** O schema Zod declara `id: z.string()`. A entidade usa `Long` e o DTO converte.
- **Sucesso embrulhado, erro não.** O `api-error.ts` lê `detail` na raiz do corpo; um erro dentro de `data` não seria encontrado.
- **`detail` em português, sem jargão.** O front filtra mensagem com nome de pacote Java ou stack trace e mostra um texto genérico no lugar.

---

## Banco

**`ddl-auto=update`**: o Hibernate cria e altera as tabelas a partir das entidades. Não há migration versionada.

É um atalho consciente, registrado em [`pendencias.md`](../pendencias.md). O custo aparece quando as tabelas normativas entrarem, porque o [`README técnico`](README.md) exige que os parâmetros normativos sejam *"dados versionados e persistidos, não constantes no código"* — e revisão de norma sem histórico de schema não se sustenta. O caminho é Flyway.

`open-in-view=false` porque o default `true` mantém a sessão do Hibernate aberta durante a serialização, o que esconde problema de lazy loading até virar bug em produção.

O `DataSeeder` insere dois registros no primeiro boot e só quando a tabela está vazia. Sem Flyway não há migration para carregar dado inicial, e uma API que sobe com o banco vazio não mostra nada.

---

## Autenticação

**Não existe ainda.** Os endpoints são abertos.

O front já tem a tela de login e continua respondendo contra o MSW em desenvolvimento; o header `Authorization: Bearer` que ele envia é simplesmente ignorado aqui. Nada quebra.

Isso é deliberado: os papéis de usuário dependem da **Q1c** em [`questoes-em-aberto.md`](../produto/questoes-em-aberto.md) — *"pessoa de fora da Neoenergia pode acessar um sistema interno?"* — que ainda está aberta e muda o modelo de acesso inteiro. Quando fechar, `POST /api/auth/login` entra aqui e o handler sai do front.

---

## Docker

| Comando | Para quê |
| :--- | :--- |
| `docker compose up` | sobe tudo num comando, em qualquer máquina, sem JDK instalada |
| `docker compose up -d db` + `./mvnw spring-boot:run` | ciclo rápido de edição, com a aplicação pela IDE |

O `Dockerfile` é multi-stage: o estágio de build usa o wrapper do próprio projeto, então a versão do Maven ali é a mesma da máquina de quem desenvolve, e as dependências resolvem numa camada separada. A imagem final carrega só o JRE e o jar.

O segundo modo existe porque Java não tem o equivalente do `--reload` do uvicorn — reconstruir a imagem a cada alteração tornaria o ciclo lento demais.

---

## Antes de seguir tutorial da internet

**Este projeto é Spring Boot 4.1, e quase tudo escrito sobre Spring Boot é 3.x.** O Initializr já não oferece a linha 3.

O que mais diverge:

| Boot 3 | Boot 4 |
| :--- | :--- |
| `spring-boot-starter-web` | `spring-boot-starter-webmvc` |
| `spring-boot-starter-test` | um starter de teste por módulo (`...-webmvc-test`, `...-data-jpa-test`) |
| `springdoc-openapi` 2.x | 3.x |

Se um exemplo não compila, essa é a primeira coisa a conferir.
