# Convenções do back-end

Padrões de código, arquitetura e receitas do `app/back`. Documento único: o que a equipe precisa para trabalhar nesta stack está tudo aqui. A tabela de nomenclatura vale para o repositório inteiro e está no [`CONTRIBUTING.md`](../../CONTRIBUTING.md); aqui está o que é específico de Java e Spring Boot.

**Stack:** Java 21 · Spring Boot 4.1 · Spring Data JPA · PostgreSQL 16 · Maven · springdoc · Spotless

---

---

## Nomenclatura

| O quê | Convenção | Exemplo |
| :--- | :--- | :--- |
| Classes, interfaces e enums | PascalCase | `ExampleService` |
| Métodos e variáveis | camelCase | `findById`, `pageSize` |
| Constantes | UPPER_SNAKE_CASE | `NOT_FOUND_MESSAGE` |
| Pacotes | minúsculo, sem separador | `br.com.ampere.controller` |
| Arquivos | nome da classe pública | `ExampleService.java` |
| Tabelas e colunas | snake_case | `example`, `page_size` |

`snake_case` **não é convenção de Java** em nenhuma parte do código. A regra antiga vinha do projeto do semestre passado, que era Python.

A exceção é o banco, e ela sai de graça: o Hibernate converte `pageSize` em `page_size` pela estratégia de nomenclatura padrão. **Não anote `@Column(name = "...")` só para repetir o que ele já faz.**

Identificadores e comentários em **inglês**; mensagem que chega na tela do usuário em **português**.

---

## Estrutura de pacotes

```
br.com.ampere/
├── controller/   HTTP: recebe, valida a entrada, chama o service, embrulha a saída
├── service/      regra de negócio e orquestração
├── domain/       entidades persistidas
├── repository/   acesso ao banco
├── dto/          entrada e saída da API
├── error/        exceções de domínio e o tradutor para HTTP
├── utils/        funções puras e reutilizáveis, sem dependências do projeto
└── config/       configuração e bootstrap
```

As quatro primeiras são as que o [`app/back/README.md`](../../app/back/README.md) prescreve. `dto/`, `error/`, `utils/` e `config/` existem porque são inevitáveis, não porque alguém quis mais uma camada.

## O que cada camada pode importar

| Camada | Pode | Não pode |
| :--- | :--- | :--- |
| `controller` | `service`, `dto` | `repository`, SQL, regra de negócio |
| `service` | `repository`, `domain`, `error` | qualquer coisa de HTTP |
| `repository` | `domain` | `service`, `controller` |
| `domain` | nada do projeto | todas as outras |
| `utils` | bibliotecas da linguagem | qualquer pacote do projeto |

A regra prática: **se o service importa alguma coisa de `org.springframework.web`, algo está no lugar errado.** Ele lança exceção de domínio; quem decide status HTTP é o `GlobalExceptionHandler`.

`utils` não é uma camada. Qualquer pacote pode importar suas funções, mas elas precisam continuar puras e independentes do domínio, dos repositories e do Spring. Se uma classe em `utils` passar a depender do projeto, ela está no pacote errado.

E o contrário também vale: se o controller está decidindo qualquer coisa além de forma de entrada e saída, a decisão pertence ao service. É o que o [`docs/tecnico/README.md`](README.md) chama de rota fina.

---

## Lombok é proibido

O [`app/back/README.md`](../../app/back/README.md) veda geração automática de boilerplate. Sem `@Data`, `@Getter`, `@Builder`.

O que usar no lugar:

- **DTOs são `record`.** Não é geração automática no sentido do Lombok — é sintaxe da linguagem, e o construtor, os getters e o `equals` vêm do próprio Java.

  ```java
  public record ExampleResponse(String id, String name) { }
  ```

- **Entidades são classes normais**, com construtor e getter escritos à mão. O construtor sem argumentos é `protected`: o JPA exige um, e ninguém mais deveria usá-lo.

  ```java
  protected Example() {}

  public Example(String name) {
    this.name = name;
  }
  ```

- **Injeção por construtor**, nunca `@Autowired` em campo. Deixa a dependência explícita e o campo `final`.

---

## Contrato da API

Não foi escolhido aqui — o front já o declara, e o back precisa cumprir:

| O quê | Onde está definido no front |
| :--- | :--- |
| Envelope `{ data, pagination? }` | `src/features/shared/types/index.ts` |
| Formato de erro `ProblemDetail` | `src/lib/api-error.ts` |
| Prefixo `/api` e porta 8080 | `vite.config.ts` |

Os três que quebram silenciosamente: o `id` sai como string, sucesso vai embrulhado e erro não, e o `detail` é texto de tela em português.

### Envelope

Toda resposta de **sucesso** é embrulhada em `ApiResponse<T>`; **erro nunca é**.

```java
return ApiResponse.of(items, new Pagination(items.size(), 1, items.size()));
```

O `pagination` é omitido quando nulo. Os nomes dos campos espelham o tipo do front e precisam bater exatamente.

### `id` sai como String

O schema do front declara `id: z.string()` e rejeita número. A entidade usa `Long`; **o DTO de resposta converte**.

### Erro em `ProblemDetail`

O `GlobalExceptionHandler` traduz exceção em resposta RFC 7807. Duas exceções de domínio cobrem quase tudo:

```java
throw new NotFoundException("Projeto não encontrado.");          // 404
throw new BusinessException("Já existe um projeto com esse nome.", HttpStatus.CONFLICT);
```

A mensagem é **texto de tela em português**. O front descarta qualquer mensagem com nome de pacote Java ou stack trace e cai num texto genérico — então detalhe técnico não chega ao usuário, e também não ajuda ninguém.

### Validação

Anote o `record` de entrada e use `@Valid` no controller. As mensagens viram `errors: [{ field, defaultMessage }]` na resposta, e o front monta `"campo: mensagem"` a partir delas.

```java
public record ExampleRequest(
    @NotBlank(message = "O nome é obrigatório.") String name) {}
```

### Parâmetros compartilhados de query

Não repita conversão e normalização em cada controller ou service. As peças compartilhadas são:

| Peça | Responsabilidade |
| :--- | :--- |
| `PageQuery` | Valores padrão e Bean Validation de `page` e `pageSize` |
| `SearchTerms` | `trim` e escape de `\`, `%` e `_` antes de consultas com `LIKE` |
| `EnumParameterConfig` | Conversão case-insensitive de texto para qualquer enum da API |
| `messages.properties` | Mensagens localizadas para falhas de binding do Spring |

Controllers recebem enums diretamente. Isso mantém a validação no limite HTTP e permite que o OpenAPI publique os valores aceitos:

```java
public ApiResponse<ProjectListResponse> list(
    @Valid @ParameterObject PageQuery pagination,
    @RequestParam(required = false) ProjectStatus status,
    @RequestParam(required = false) String search) {
  ProjectListing listing =
      service.list(pagination.page(), pagination.pageSize(), status, search);
  // Converte o resultado e monta o ApiResponse.
}
```

O service recebe o enum já convertido e usa `SearchTerms.normalize(search)` antes de chamar o repository. Valor de enum inválido deve sair como HTTP 400 com a lista de valores aceitos; erro numérico usa a mensagem localizada em `messages.properties`.

---

## Formatação

**Spotless** com `google-java-format` é o formatador único — o equivalente do Biome no front, e existe pela mesma razão: o projeto do semestre passado não tinha formatador e o estilo divergiu dentro do próprio repositório.

```bash
./mvnw spotless:apply    # formata
./mvnw spotless:check    # falha se algo estiver fora do padrão
```

Rode `spotless:apply` antes de abrir PR. Indentação de 2 espaços e 100 colunas são decisão do google-java-format, não preferência — não discuta com a ferramenta.

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

A fatia `projects` demonstra esse fluxo ponta a ponta com o primeiro domínio real do AMPERE.

As regras de importação entre camadas estão em [`convencoes-back.md`](convencoes-back.md).

---

## O caminho de uma requisição

`GET /api/projects`:

1. O `context-path=/api` tira o prefixo; o `ProjectController` está mapeado em `/projects`.
2. `list(...)` chama `service.list(...)` com paginação, filtro e busca.
3. O service consulta os repositories de projetos e apontamentos.
4. O controller converte as entidades em `ProjectResponse` e embrulha a listagem em `ApiResponse`.

O passo 3 é o que separa as camadas: o controller não conhece persistência, e o service não conhece detalhes de HTTP.

---

## Banco

**`ddl-auto=update`**: o Hibernate cria e altera as tabelas a partir das entidades. Não há migration versionada.

É um atalho consciente, registrado em [`pendencias.md`](../pendencias.md). O custo aparece quando as tabelas normativas entrarem, porque o [`README técnico`](README.md) exige que os parâmetros normativos sejam *"dados versionados e persistidos, não constantes no código"* — e revisão de norma sem histórico de schema não se sustenta. O caminho é Flyway.

`open-in-view=false` porque o default `true` mantém a sessão do Hibernate aberta durante a serialização, o que esconde problema de lazy loading até virar bug em produção.

O `DataSeeder` insere seis projetos e quatro apontamentos no primeiro boot e só quando a tabela está vazia. Sem Flyway não há migration para carregar dado inicial, e uma API que sobe com o banco vazio não mostra nada.

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

---

## Receita: criar uma entidade ponta a ponta

> **Exemplo ilustrativo:** adapte os campos e operações ao domínio da história.

Vamos supor uma entidade `Project`.

### 1.1 Domínio — `domain/Project.java`

```java
@Entity
@Table(name = "project")
public class Project {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  protected Project() {}

  public Project(String name) {
    this.name = name;
  }

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }
}
```

Sem Lombok — construtor e getter à mão. O construtor sem argumentos é `protected` porque o JPA exige um. Não anote `@Column(name = "...")` só para escrever o snake_case que o Hibernate já gera.

### 1.2 Repository — `repository/ProjectRepository.java`

```java
public interface ProjectRepository extends JpaRepository<Project, Long> {
  List<Project> findByStatus(String status);
}
```

O Spring Data implementa a interface em tempo de execução. Só declare o que precisa além do CRUD — e o nome do método é a consulta.

### 1.3 DTOs — `dto/ProjectRequest.java` e `dto/ProjectResponse.java`

```java
public record ProjectRequest(
    @NotBlank(message = "O nome é obrigatório.") String name) {}

public record ProjectResponse(String id, String name) {

  public static ProjectResponse from(Project project) {
    return new ProjectResponse(String.valueOf(project.getId()), project.getName());
  }
}
```

**O `id` sai como String.** O front declara `id: z.string()` e rejeita número — é o erro mais fácil de cometer aqui.

A mensagem do `@NotBlank` é texto de tela: aparece para o usuário como `"name: O nome é obrigatório."`.

### 1.4 Service — `service/ProjectService.java`

```java
@Service
public class ProjectService {

  private final ProjectRepository repository;

  public ProjectService(ProjectRepository repository) {
    this.repository = repository;
  }

  @Transactional(readOnly = true)
  public Project findById(Long id) {
    return repository.findById(id)
        .orElseThrow(() -> new NotFoundException("Projeto não encontrado."));
  }

  @Transactional
  public Project create(String name) {
    return repository.save(new Project(name));
  }
}
```

Injeção por construtor, nunca `@Autowired` em campo. `@Transactional(readOnly = true)` na leitura, `@Transactional` na escrita.

**Esta camada não conhece HTTP.** Ela lança `NotFoundException` ou `BusinessException`; quem escolhe o status é o `GlobalExceptionHandler`.

### 1.5 Controller — `controller/ProjectController.java`

```java
@RestController
@RequestMapping("/project")
public class ProjectController {

  private final ProjectService service;

  public ProjectController(ProjectService service) {
    this.service = service;
  }

  @GetMapping("/{id}")
  public ApiResponse<ProjectResponse> detail(@PathVariable Long id) {
    return ApiResponse.of(ProjectResponse.from(service.findById(id)));
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ApiResponse<ProjectResponse> create(@Valid @RequestBody ProjectRequest request) {
    return ApiResponse.of(ProjectResponse.from(service.create(request.name())));
  }
}
```

O caminho **não repete `/api`** — isso vem do `context-path`. Toda saída de sucesso vai embrulhada em `ApiResponse`. Sem regra de negócio e sem SQL aqui.

### 1.6 Conferir

O Hibernate cria a tabela no próximo boot, porque `ddl-auto=update`. Sem migration para escrever.

```bash
curl -s localhost:8080/api/project/1 | python3 -m json.tool
```

E `/api/swagger-ui/index.html` já lista o endpoint novo.

---

## Receita: devolver uma lista paginada

```java
@GetMapping
public ApiResponse<List<ProjectResponse>> list(
    @RequestParam(defaultValue = "1") int page,
    @RequestParam(defaultValue = "20") int pageSize) {

  Page<Project> result = service.findAll(PageRequest.of(page - 1, pageSize));

  return ApiResponse.of(
      result.getContent().stream().map(ProjectResponse::from).toList(),
      new Pagination(result.getTotalElements(), page, pageSize));
}
```

O front conta página a partir de **1**, o Spring Data a partir de **0** — daí o `page - 1`.

---

## Receita: sinalizar um erro

```java
throw new NotFoundException("Projeto não encontrado.");                        // 404
throw new BusinessException("O projeto já foi enviado para análise.");         // 400
throw new BusinessException("Já existe um projeto com esse nome.", HttpStatus.CONFLICT);
```

Nunca capture a exceção no controller para montar a resposta: o `GlobalExceptionHandler` faz isso num lugar só.

A mensagem é o que o usuário lê. Em português, sem jargão — o front descarta qualquer texto com nome de pacote Java ou stack trace e mostra `"Erro interno. Tente novamente."` no lugar.

---

## Receita: rodar, formatar, validar

| Comando | O que faz |
| :--- | :--- |
| `docker compose up` | sobe banco e API em container. Um comando, não precisa de JDK |
| `docker compose up -d db` + `./mvnw spring-boot:run` | ciclo rápido: banco em container, app pela IDE |
| `./mvnw spotless:apply` | formata — **rode antes do PR** |
| `./mvnw clean verify` | compila, formata-check e roda os testes |
| `docker compose down -v` | derruba tudo e **apaga o volume do banco** |

---

## Onde as coisas estão

| Preciso de... | Está em |
| :--- | :--- |
| Envelope de resposta | `dto/ApiResponse`, `dto/Pagination` |
| Lançar erro de domínio | `error/NotFoundException`, `error/BusinessException` |
| Tradução de erro para HTTP | `error/GlobalExceptionHandler` |
| Configuração e variáveis | `src/main/resources/application.properties` |
| Dado inicial de desenvolvimento | `config/DataSeeder` |
| Documentação da API | `/api/swagger-ui/index.html` |

---

## Quando travar

- **`Non-resolvable parent POM`** — a versão do Spring Boot no `pom.xml` não existe no Maven Central. O id do Initializr (`4.1.1.RELEASE`) não é o da dependência (`4.1.1`).
- **`Connection refused` na porta 5432** — o banco não está no ar. `docker compose up -d db`.
- **`Port 8080 already in use`** — outro container ou aplicação segurando a porta. `docker ps` mostra quem; `SERVER_PORT=8081 ./mvnw spring-boot:run` contorna.
- **`JAVA_HOME` apontando para a JDK errada** — o projeto exige a 21. `java -version` confirma, e o [`README`](../../app/back/README.md) mostra como apontar.
- **Tutorial não compila** — provavelmente é Spring Boot 3.x. Ver a tabela de diferenças na seção *Antes de seguir tutorial da internet*.
- **O front recebe a resposta e não renderiza** — confira se o `id` está saindo como string e se o sucesso está embrulhado em `data`.
