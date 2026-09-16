# Receitas do back-end

Passo a passo do que você vai repetir. Cada receita aponta um arquivo real do repositório para copiar.

Antes de qualquer coisa:

```bash
cd app/back && cp .env.example .env && docker compose up -d db && ./mvnw spring-boot:run
```

A API sobe em `http://localhost:8080/api`. Requer **JDK 21** e Docker.

---

## 1. Criar uma entidade ponta a ponta

> **Modelo completo:** a fatia `example`. Cada passo abaixo aponta o arquivo correspondente.

Vamos supor uma entidade `Project`.

### 1.1 Domínio — `domain/Project.java`

> Modelo: `domain/Example.java`

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

> Modelo: `repository/ExampleRepository.java`

```java
public interface ProjectRepository extends JpaRepository<Project, Long> {
  List<Project> findByStatus(String status);
}
```

O Spring Data implementa a interface em tempo de execução. Só declare o que precisa além do CRUD — e o nome do método é a consulta.

### 1.3 DTOs — `dto/ProjectRequest.java` e `dto/ProjectResponse.java`

> Modelos: `dto/ExampleRequest.java`, `dto/ExampleResponse.java`

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

> Modelo: `service/ExampleService.java`

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

> Modelo: `controller/ExampleController.java`

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

## 2. Devolver uma lista paginada

```java
@GetMapping("/list")
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

## 3. Sinalizar um erro

```java
throw new NotFoundException("Projeto não encontrado.");                        // 404
throw new BusinessException("O projeto já foi enviado para análise.");         // 400
throw new BusinessException("Já existe um projeto com esse nome.", HttpStatus.CONFLICT);
```

Nunca capture a exceção no controller para montar a resposta: o `GlobalExceptionHandler` faz isso num lugar só.

A mensagem é o que o usuário lê. Em português, sem jargão — o front descarta qualquer texto com nome de pacote Java ou stack trace e mostra `"Erro interno. Tente novamente."` no lugar.

---

## 4. Rodar, formatar, validar

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
- **Tutorial não compila** — provavelmente é Spring Boot 3.x. Ver a tabela de diferenças em [`arquitetura-back.md`](arquitetura-back.md).
- **O front recebe a resposta e não renderiza** — confira se o `id` está saindo como string e se o sucesso está embrulhado em `data`.
