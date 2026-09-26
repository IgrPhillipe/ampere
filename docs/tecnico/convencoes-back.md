# Convenções do Back-end

Padrões de código, arquitetura e receitas do `app/back`. Documento único da stack. A tabela de nomenclatura geral do repositório está no [`CONTRIBUTING.md`](../../CONTRIBUTING.md); este documento cobre o que é específico de Java e Spring Boot.

**Stack:** Java 21, Spring Boot 4.1, Spring Data JPA, PostgreSQL 16, Maven, springdoc, Spotless

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

`snake_case` **não é usado no código Java**. A regra antiga vinha do projeto do semestre anterior, escrito em Python.

A exceção é o banco, sem custo: o Hibernate converte `pageSize` em `page_size` pela estratégia de nomenclatura padrão. **Não anote `@Column(name = "...")` só para repetir essa conversão.**

Identificadores e comentários em **inglês**; mensagem exibida ao usuário em **português**.

Duas palavras em português correspondem ao mesmo substantivo em inglês e são facilmente confundidas:

| Classe | Significado | Onde a norma define |
| :--- | :--- | :--- |
| `Standard` (entidade) | **norma** (DIS-NOR-053, DIS-NOR-030) | AT02-US02 |
| `EntranceStandard` (enum) | **padrão de entrada** (coletivo ou individual) | DIS-NOR-053, item 6.17 |

---

## Estrutura de Pacotes

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

Os quatro primeiros pacotes são os prescritos pelo [`app/back/README.md`](../../app/back/README.md). `dto/`, `error/`, `utils/` e `config/` existem por necessidade, não como camadas adicionais.

## O que Cada Camada Pode Importar

| Camada | Pode | Não pode |
| :--- | :--- | :--- |
| `controller` | `service`, `dto` | `repository`, SQL, regra de negócio |
| `service` | `repository`, `domain`, `error` | qualquer coisa de HTTP |
| `repository` | `domain` | `service`, `controller` |
| `domain` | nada do projeto | todas as outras |
| `utils` | bibliotecas da linguagem | qualquer pacote do projeto |

Regra prática: **service que importa algo de `org.springframework.web` indica código no lugar errado.** O service lança exceção de domínio; o `GlobalExceptionHandler` decide o status HTTP.

`utils` não é uma camada. Qualquer pacote pode importar suas funções, desde que elas continuem puras e independentes do domínio, dos repositories e do Spring. Classe em `utils` que dependa do projeto está no pacote errado.

O inverso também vale: decisão do controller além da forma de entrada e saída pertence ao service. É o que o [`docs/tecnico/README.md`](README.md) chama de rota fina.

---

## Sem Lombok

O [`app/back/README.md`](../../app/back/README.md) veda geração automática de boilerplate. Sem `@Data`, `@Getter`, `@Builder`.

Alternativas:

- **DTOs são `record`.** Não é geração automática no sentido do Lombok: é sintaxe da linguagem, e o construtor, os getters e o `equals` vêm do próprio Java.

  ```java
  public record ExampleResponse(String id, String name) { }
  ```

- **Entidades são classes normais**, com construtor e getter escritos à mão. O construtor sem argumentos é `protected`: o JPA exige um, e nenhum outro código deve usá-lo.

  ```java
  protected Example() {}

  public Example(String name) {
    this.name = name;
  }
  ```

- **Injeção por construtor**, nunca `@Autowired` em campo. Torna a dependência explícita e o campo `final`.

---

## Contrato da API

O contrato é definido pelo front; o back o cumpre:

| O quê | Onde está definido no front |
| :--- | :--- |
| Envelope `{ data, pagination? }` | `src/features/shared/types/index.ts` |
| Formato de erro `ProblemDetail` | `src/lib/api-error.ts` |
| Prefixo `/api` e porta 8080 | `vite.config.ts` |

Três pontos quebram silenciosamente: o `id` sai como string; sucesso vai embrulhado e erro não; o `detail` é texto de tela em português.

### Envelope

Toda resposta de **sucesso** é embrulhada em `ApiResponse<T>`; **erro nunca é**.

```java
return ApiResponse.of(items, new Pagination(items.size(), 1, items.size()));
```

O `pagination` é omitido quando nulo. Os nomes dos campos espelham o tipo do front e precisam ser idênticos.

A única exceção é `204 No Content`, que por definição não tem corpo: o `DELETE /projects/{id}` devolve vazio, não um `200` com `data` nulo.

### `id` Sai como String

O schema do front declara `id: z.string()` e rejeita número. A entidade usa `Long`; **o DTO de resposta converte**.

### Erro em `ProblemDetail`

O `GlobalExceptionHandler` traduz exceção em resposta RFC 7807. Duas exceções de domínio cobrem quase todos os casos:

```java
throw new NotFoundException("Projeto não encontrado.");          // 404
throw new BusinessException("Já existe um projeto com esse nome.", HttpStatus.CONFLICT);
```

A mensagem é **texto de tela em português**. O front descarta qualquer mensagem com nome de pacote Java ou stack trace e exibe um texto genérico, então detalhe técnico na mensagem nunca chega ao usuário.

### Validação

Anote o `record` de entrada e use `@Valid` no controller. As mensagens viram `errors: [{ field, defaultMessage }]` na resposta, e o front monta `"campo: mensagem"` a partir delas.

```java
public record ExampleRequest(
    @NotBlank(message = "O nome é obrigatório.") String name) {}
```

### Parâmetros Compartilhados de Query

Não repita conversão e normalização em cada controller ou service. Peças compartilhadas:

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

O service recebe o enum já convertido e usa `SearchTerms.normalize(search)` antes de chamar o repository. Valor de enum inválido sai como HTTP 400 com a lista de valores aceitos; erro numérico usa a mensagem localizada em `messages.properties`.

**Enum no corpo da requisição não passa por esse conversor.** O `EnumParameterConfig` converte query string; corpo JSON é desserializado pelo Jackson, que não conhece esse conversor. Duas peças cobrem o corpo, ambas no mesmo `EnumParameterConfig` para ficarem juntas:

- o bean `JsonMapperBuilderCustomizer` liga `MapperFeature.ACCEPT_CASE_INSENSITIVE_ENUMS`, dando ao corpo a mesma tolerância de caixa da query string;
- o handler de `HttpMessageNotReadableException` transforma valor inexistente em 400, nomeando o campo e listando os valores aceitos. Sem ele, a requisição cai no tratamento genérico e o usuário vê "Erro interno" por um tipo de edificação digitado errado.

Versão: o Spring Boot 4 usa **Jackson 3**; a exceção é `tools.jackson.databind.exc.InvalidFormatException` e o método é `getPropertyName()`. Exemplos com `com.fasterxml.jackson` e `getFieldName()` compilam, mas nunca casam em tempo de execução.

`src/test/resources/application.properties` **substitui** o arquivo de `main/resources`, não o complementa. Configuração que muda comportamento precisa estar nos dois ou virar bean.

---

## Formatação

**Spotless** com `google-java-format` é o formatador único, equivalente ao Biome no front. Motivo: o projeto do semestre anterior não tinha formatador e o estilo divergiu dentro do próprio repositório.

```bash
./mvnw spotless:apply    # formata
./mvnw spotless:check    # falha se algo estiver fora do padrão
```

Rode `spotless:apply` antes de abrir PR. Indentação de 2 espaços e 100 colunas são definidas pelo google-java-format, não por preferência da equipe, e não se ajustam.

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
      dto/, error/, config/        entrada e saída, tradução de erro, bootstrap
```

**Fluxo:** controller → service → repository → domain. Camada de cima chama a de baixo, nunca o contrário.

A fatia `projects` demonstra esse fluxo ponta a ponta com o primeiro domínio real do AMPERE.

As regras de importação entre camadas estão em [O Que Cada Camada Pode Importar](#o-que-cada-camada-pode-importar).

---

## O Caminho de uma Requisição

`GET /api/projects`:

1. O `context-path=/api` remove o prefixo; o `ProjectController` está mapeado em `/projects`.
2. `list(...)` chama `service.list(...)` com paginação, filtro e busca.
3. O service consulta os repositories de projetos e apontamentos.
4. O controller converte as entidades em `ProjectResponse` e embrulha a listagem em `ApiResponse`.

O passo 3 separa as camadas: o controller não conhece persistência, e o service não conhece detalhes de HTTP.

---

## Banco

**`ddl-auto=update`**: o Hibernate cria e altera as tabelas a partir das entidades. Não há migration versionada.

Atalho consciente, registrado em [`pendencias.md`](../pendencias.md). O custo aparece com as tabelas normativas: o [`README técnico`](README.md) exige que os parâmetros normativos sejam *"dados versionados e persistidos, não constantes no código"*, e revisão de norma sem histórico de schema não se sustenta. A solução prevista é Flyway.

`open-in-view=false` porque o default `true` mantém a sessão do Hibernate aberta durante a serialização, o que esconde problema de lazy loading até virar bug em produção. Com ele desligado, associação lazy é carregada dentro do service, com `@EntityGraph` no repository, como em `findDetailById`.

**Coluna `NOT NULL` nova quebra o `ddl-auto=update`.** O PostgreSQL recusa `ALTER TABLE ... ADD COLUMN ... NOT NULL` sem default numa tabela populada; o Hibernate registra a falha no log e sobe mesmo assim, com a aplicação rodando contra um schema sem a coluna. O erro só aparece depois, disfarçado. Nesse caso, apague o banco de desenvolvimento uma vez:

```bash
docker compose down -v && docker compose up -d
```

O `DataSeeder` repovoa tudo. O único dado perdido é o de seed; esse custo justifica o Flyway da pendência 16.

O `DataSeeder` insere seis projetos e quatro apontamentos no primeiro boot, apenas quando a tabela está vazia. Sem Flyway não há migration para carregar dado inicial, e uma API que sobe com o banco vazio não mostra nada.

---

## Autenticação

`POST /api/auth/login` troca e-mail e senha por um **JWT assinado com HS256**, e `GET /api/auth/me` devolve o usuário da sessão. O token vai no header `Authorization: Bearer`, que o front já envia.

**Aberto:** o próprio login e a documentação (`/api/docs`, `/api/v3/api-docs`). **Todo o resto exige token**, inclusive `/api/projects`.

| Onde | O quê |
| :--- | :--- |
| `security/SecurityConfig` | o que é aberto, o que exige token, encoder e decoder do JWT |
| `security/TokenService` | emissão do token |
| `security/ProblemDetailAuthenticationHandler` | 401 e 403 no mesmo `ProblemDetail` do resto da API |
| `security/CorsProperties` | origens de outro domínio, por `CORS_ALLOWED_ORIGINS` |
| `service/AuthService` | confere credencial e relê o usuário do banco |

Decisões:

- **Senha é BCrypt**, e `AuthUserResponse` não tem campo de hash: o DTO garante que ele não vaza.
- **E-mail desconhecido e senha errada respondem igual.** Distinguir os dois revelaria quais e-mails existem na base.
- **`/auth/me` relê o usuário do banco** em vez de confiar no token: nome e papel gravados no token ficam desatualizados.

**Só `/admin/**` é restrito por papel.** É a área das tabelas normativas, que não é do projetista: `SecurityConfig` converte o claim `role` do token em `ROLE_ADMIN` ou `ROLE_USER` e exige `hasRole("ADMIN")` nesse prefixo. Sem o papel, a resposta é 403 no mesmo `ProblemDetail` do resto da API. Rota nova de analista (a fila da US06) entra no mesmo `requestMatchers`.

As outras rotas continuam sem papel. Os papéis atuais (`user` / `admin`) são placeholder e dependem da **Q1c** em [`questoes-em-aberto.md`](../produto/questoes-em-aberto.md): *"pessoa de fora da Neoenergia pode acessar um sistema interno?"*. A resolução da Q1c é aplicada aqui e na pendência 13.

**Não há segredo versionado.** `JWT_SECRET` resolve em três caminhos, em `security/JwtSecret`:

| `JWT_SECRET` | Fora de produção | Com o profile `prod` |
| :--- | :--- | :--- |
| definida (≥ 32 caracteres) | assina com ela | assina com ela |
| ausente ou vazia | gera uma chave por execução e avisa no log | **não sobe** |
| menor que 32 caracteres | não sobe | não sobe |

A chave gerada permite subir o repositório sem configuração. Custo: o token não sobrevive a um reinício, e o usuário precisa entrar de novo. Em produção, a aplicação não sobe em vez de assinar com uma chave que ninguém escolheu.

---

## Docker

| Comando | Para quê |
| :--- | :--- |
| `docker compose up` | sobe tudo num comando, em qualquer máquina, sem JDK instalada |
| `docker compose up -d db` + `./mvnw spring-boot:run` | ciclo rápido de edição, com a aplicação pela IDE |

O `Dockerfile` é multi-stage. O estágio de build usa o wrapper do próprio projeto, então a versão do Maven é a mesma da máquina de desenvolvimento, e as dependências resolvem numa camada separada. A imagem final carrega só o JRE e o jar.

O segundo modo existe porque Java não tem equivalente ao `--reload` do uvicorn; reconstruir a imagem a cada alteração tornaria o ciclo lento demais.

---

## Antes de Seguir Tutorial da Internet

**Este projeto é Spring Boot 4.1, e quase todo material publicado sobre Spring Boot é 3.x.** O Initializr já não oferece a linha 3.

Principais diferenças:

| Boot 3 | Boot 4 |
| :--- | :--- |
| `spring-boot-starter-web` | `spring-boot-starter-webmvc` |
| `spring-boot-starter-test` | um starter de teste por módulo (`...-webmvc-test`, `...-data-jpa-test`) |
| `springdoc-openapi` 2.x | 3.x |

Exemplo que não compila: confira esta tabela primeiro.

---

## Norma Aplicável: Polimorfismo, Não Condicional

A norma de um projeto não é escolhida por uma cadeia de `if`. `BuildingType` é abstrata, cada subclasse sobrescreve `demandRules()`, e `applicableStandards()` deriva o par de normas das regras que a subclasse declarou:

| Subclasse | Parcelas que declara | Item da DIS-NOR-053 |
| :--- | :--- | :--- |
| `ResidentialMultifamily` | `Drf` por área útil, `Ds` por carga instalada | 6.22.1 e 6.22.4 |
| `NonResidential` | `Dc` por carga instalada | 6.23.1 |
| `Mixed` | `Drf` por área útil, `Dc` por carga instalada | 6.24.1 |

O par resultante é o mesmo nas três (as duas normas vigentes, como a US02 exige) **e ainda assim não é constante**: vem de um `flatMap` sobre listas de tamanho 2, 1 e 2 cujo conteúdo difere em todos os campos. Apagar um `StandardName` de uma regra colapsa o par, e é isso que o teste `derivesTheApplicableStandardsFromItsOwnRules` verifica.

`BuildingCategory` é o segundo polimorfismo, mais simples: enum com corpo por constante que constrói a subclasse certa, no lugar da cadeia de `if` que o service teria. `category()` é método, não `instanceof`: com fetch lazy o objeto é um proxy do Hibernate, e `instanceof` erra.

Tipo de edificação novo (6.25.1 Smart/Studio, 6.22.2 com carregador veicular) entra como subclasse nova, sem alterar nenhum `switch`.

## Cálculo de Demanda: `demand()` por Tipo de Grupo

O motor (`DemandEngine`) soma `Drf + Ds + Dc + Dve` sem consultar o tipo de nenhum grupo. Cada subclasse de `ConsumerUnitGroup` sobrescreve `demand()` e devolve a própria parcela:

| Subclasse | O que calcula | Tabela |
| :--- | :--- | :--- |
| `ResidentialGroup` | demanda do apartamento × quantidade | Quadro 35 |
| `LoadGroup` | cada parcela `a` a `i` da DIS-NOR-030 item 6.27, no corpo da constante de `LoadCategory` | Tabelas 7, 8, 9, 12, 14, 15, 16, 18/19 e 22 |
| `EvChargingGroup` | pontos × potência | Nenhuma (o fator é aplicado depois) |

O que vale para o prédio inteiro fica no corpo de cada constante de `DemandComponent`, em `combine()`, e não no grupo. Ali são aplicados o `Fc` do Quadro 36, obtido do total de apartamentos (Anexo I, item 3), o `Fr` do Quadro 37 e o fator do Quadro 33 sobre todos os pontos de recarga (Anexo I, item 13).

O `domain` não pode importar `repository`, então lê as tabelas pela interface `NormativeTables`; o service entrega um `NormativeTableSet` com as tabelas publicadas. Tabela ou linha ausente vira `MissingNormativeValueException`, que o service transforma em 422 com o nome da tabela.

Cada execução grava um `Calculation` com as fórmulas, as referências e as duas revisões de norma: cálculo antigo continua apontando para a revisão sob a qual foi feito.

---

## Receita: Criar uma Entidade Ponta a Ponta

> **Exemplo ilustrativo:** adapte os campos e operações ao domínio da história.

Exemplo com a entidade `Project`.

### 1.1 Domínio: `domain/Project.java`

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

Sem Lombok: construtor e getter escritos à mão. O construtor sem argumentos é `protected` porque o JPA exige um. Não anote `@Column(name = "...")` só para escrever o snake_case que o Hibernate já gera.

### 1.2 Repository: `repository/ProjectRepository.java`

```java
public interface ProjectRepository extends JpaRepository<Project, Long> {
  List<Project> findByStatus(String status);
}
```

O Spring Data implementa a interface em tempo de execução. Declare apenas o que vai além do CRUD; o nome do método define a consulta.

### 1.3 DTOs: `dto/ProjectRequest.java` e `dto/ProjectResponse.java`

```java
public record ProjectRequest(
    @NotBlank(message = "O nome é obrigatório.") String name) {}

public record ProjectResponse(String id, String name) {

  public static ProjectResponse from(Project project) {
    return new ProjectResponse(String.valueOf(project.getId()), project.getName());
  }
}
```

**O `id` sai como String.** O front declara `id: z.string()` e rejeita número. É o erro mais comum nesta etapa.

A mensagem do `@NotBlank` é texto de tela: aparece para o usuário como `"name: O nome é obrigatório."`.

### 1.4 Service: `service/ProjectService.java`

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

**Esta camada não conhece HTTP.** Ela lança `NotFoundException` ou `BusinessException`; o `GlobalExceptionHandler` escolhe o status.

### 1.5 Controller: `controller/ProjectController.java`

```java
@RestController
@RequestMapping("/projects")
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

O caminho **não repete `/api`**, que vem do `context-path`. Toda saída de sucesso vai embrulhada em `ApiResponse`. Sem regra de negócio e sem SQL no controller.

### 1.6 Conferir

O Hibernate cria a tabela no próximo boot, por causa do `ddl-auto=update`. Não há migration a escrever.

```bash
curl -s localhost:8080/api/projects/1 | python3 -m json.tool
```

O `/api/docs` lista o endpoint novo.

---

## Receita: Devolver uma Lista Paginada

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

O front numera páginas a partir de **1** e o Spring Data a partir de **0**, daí o `page - 1`.

---

## Receita: CRUD Completo

Quatro pontos além do que as receitas anteriores cobrem.

**O service não importa `dto`.** O controller converte o request num record do pacote `service` (`ProjectParameters` para a entrada, `ProjectListing` para a saída) e converte de volta na resposta. A conversão fica num `parametersOf(request)` `private static` no fim do controller.

**Retry precisa de bean separado.** O Spring só intercepta `@Transactional` em chamada entre beans. Um laço de retry que chama método do próprio service roda tudo na mesma transação, e uma transação que já violou constraint está marcada para rollback e recusa o segundo insert. Por isso `ProjectCreation` é separado de `ProjectService` e usa `saveAndFlush`: com `save`, a violação só aparece no commit, fora do `try`, e o retry nunca dispara.

**Guarda de estado fica no service.** `Project.isDraft()` é predicado puro; quem lança `BusinessException` é o service, porque `domain` não pode importar `error`.

**Delete de entidade com filho.** A FK gerada pelo `ddl-auto` não tem `ON DELETE CASCADE`. Apague o filho explicitamente antes (`findingRepository.deleteAllByProjectId(id)`); `orphanRemoval` só cobre associação que a entidade possui.

---

## Receita: Sinalizar um Erro

```java
throw new NotFoundException("Projeto não encontrado.");                        // 404
throw new BusinessException("O projeto já foi enviado para análise.");         // 400
throw new BusinessException("Já existe um projeto com esse nome.", HttpStatus.CONFLICT);
```

Nunca capture a exceção no controller para montar a resposta: o `GlobalExceptionHandler` centraliza isso.

A mensagem é o que o usuário lê: em português e sem jargão. O front descarta qualquer texto com nome de pacote Java ou stack trace e mostra `"Erro interno. Tente novamente."` no lugar.

---

## Receita: Rodar, Formatar, Validar

| Comando | O que faz |
| :--- | :--- |
| `docker compose up` | sobe banco e API em container, num comando, sem JDK instalada |
| `docker compose up -d db` + `./mvnw spring-boot:run` | ciclo rápido: banco em container, app pela IDE |
| `./mvnw spotless:apply` | formata; **rode antes do PR** |
| `./mvnw clean verify` | compila, formata-check e roda os testes |
| `docker compose down -v` | derruba tudo e **apaga o volume do banco** |

---

## Onde as Coisas Estão

| Preciso de... | Está em |
| :--- | :--- |
| Envelope de resposta | `dto/ApiResponse`, `dto/Pagination` |
| Lançar erro de domínio | `error/NotFoundException`, `error/BusinessException` |
| Tradução de erro para HTTP | `error/GlobalExceptionHandler` |
| Configuração e variáveis | `src/main/resources/application.properties` |
| Dado inicial de desenvolvimento | `config/DataSeeder` |
| Parâmetros de entrada do service | `service/ProjectParameters` |
| Normas aplicáveis de uma edificação | `service/ApplicableStandards`, `repository/StandardRepository` |
| Tabelas normativas e seus códigos | `domain/NormativeTable`, `domain/NormativeTableCode`, `service/NormativeTableService` |
| Motor de cálculo | `domain/DemandEngine`, `domain/DemandComponent`, `service/DemandCalculationService` |
| Seed das tabelas em desenvolvimento | `config/NormativeTableSeed` |
| Geração de protocolo | `utils/Protocols` |
| Documentação da API | `/api/docs` |

---

## Quando Travar

- **`Non-resolvable parent POM`**: a versão do Spring Boot no `pom.xml` não existe no Maven Central. O id do Initializr (`4.1.1.RELEASE`) não é o da dependência (`4.1.1`).
- **`Connection refused` na porta 5432**: o banco não está no ar. Rode `docker compose up -d db`.
- **`Port 8080 already in use`**: outro container ou aplicação ocupa a porta. `docker ps` mostra qual; `SERVER_PORT=8081 ./mvnw spring-boot:run` contorna.
- **`JAVA_HOME` apontando para a JDK errada**: o projeto exige a 21. `java -version` confirma, e o [`README`](../../app/back/README.md) mostra como apontar.
- **Tutorial não compila**: provavelmente é Spring Boot 3.x. Diferenças em [Antes de Seguir Tutorial da Internet](#antes-de-seguir-tutorial-da-internet).
- **O front recebe a resposta e não renderiza**: verifique se o `id` sai como string e se o sucesso está embrulhado em `data`.
- **JDK 21 do Homebrew fora do PATH**: a fórmula é *keg-only*. Exporte `JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home` ou registre a JDK com o `sudo ln -sfn ...` que o `brew install openjdk@21` imprime.
- **Preflight `OPTIONS` voltando 401**: front em outro domínio sem `CORS_ALLOWED_ORIGINS`. Front servido por proxy do próprio deploy é mesma origem e não precisa da variável.
- **`500` em toda consulta a uma coluna nova**: `ddl-auto=update` não altera tipo de coluna nem acrescenta coluna `NOT NULL` a tabela com linhas; registra `WARN` no boot e sobe com o schema incompleto. Com acesso ao banco, rode `docker compose down -v` e o `DataSeeder` repovoa. O `-v` apaga também o banco de testes, no mesmo container; recrie antes do `verify`:
  ```bash
  docker exec ampere-db-1 psql -U ampere -d ampere -c "CREATE DATABASE ampere_test OWNER ampere;"
  ```
  Sem acesso ao banco, como num deploy gerenciado: defina `DDL_AUTO=create`, reinicie e **remova a variável** antes de reiniciar de novo. Enquanto ela existir, todo restart apaga os dados. Pendência 23 em [`../pendencias.md`](../pendencias.md).
